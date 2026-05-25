import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '../api/notifications.api';
import { Card, Badge, Button } from '../components/ui';

export default function Notifications() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setList(data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = list.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 p-4 pb-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-h2 font-bold text-neutral-900">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="danger">{unreadCount} new</Badge>
            )}
          </div>
          <p className="text-body-small text-neutral-600">Stay updated on your bookings and appointments</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-4xl animate-spin">⏳</div>
              <p className="text-body text-neutral-600">Loading notifications…</p>
            </div>
          </div>
        ) : list.length === 0 ? (
          <Card shadow="lg" className="text-center py-12 space-y-4">
            <div className="text-5xl">🔔</div>
            <div>
              <p className="text-h4 font-bold text-neutral-900 mb-1">No notifications yet</p>
              <p className="text-body-small text-neutral-600">You'll get updates about your bookings here</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {list.map((n) => (
              <Card
                key={n._id}
                shadow="md"
                className={`${!n.read ? 'border-2 border-primary-200 bg-primary-50' : 'border border-neutral-200'} space-y-3 transition-all`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-neutral-900">{n.title}</p>
                      {!n.read && (
                        <Badge variant="primary" size="sm">New</Badge>
                      )}
                    </div>
                    <p className="text-body-small text-neutral-700">{n.message}</p>
                    <p className="text-caption text-neutral-500 mt-2">
                      {new Date(n.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {!n.read && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => markRead(n._id)}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
