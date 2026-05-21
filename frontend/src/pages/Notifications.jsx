import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '../api/notifications.api';

export default function Notifications(){
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try{
      const data = await getNotifications();
      setList(data || []);
    }catch(err){ console.error(err); }
    setLoading(false);
  };

  useEffect(()=>{ load(); }, []);

  const markRead = async (id) => {
    try{
      await markNotificationRead(id);
      load();
    }catch(err){ console.error(err); }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="font-bold mb-3">Notifications</h1>

      {loading ? <p>Loading...</p> : list.length === 0 ? (
        <p className="text-sm text-gray-500">No notifications</p>
      ) : (
        list.map(n => (
          <div key={n._id} className={`border p-3 rounded mb-2 ${!n.read ? 'bg-blue-50' : ''}`}>
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-gray-600">{n.message}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            {!n.read && <button onClick={()=>markRead(n._id)} className="text-xs text-blue-600 mt-2">Mark read</button>}
          </div>
        ))
      )}
    </div>
  );
}
