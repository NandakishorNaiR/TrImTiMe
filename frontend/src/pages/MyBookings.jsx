import { useEffect, useState, useCallback } from "react";
import { getMyBookings } from "../api/booking.api";
import BookingCard from "../components/booking/BookingCard";
import { Card, Badge, Button } from "../components/ui";
import { useNavigate } from "react-router-dom";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const data = await getMyBookings();
      setBookings(data || []);
    } catch (e) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBookingUpdated = async (bookingId, newStatus) => {
    setBookings((prev) => prev.map(b => (b._id === bookingId ? { ...b, status: newStatus } : b)));
    try {
      await load();
    } catch (e) {
      console.error('Failed to refresh bookings after update', e);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-spin">⏳</div>
          <p className="text-body text-neutral-600">Loading your bookings…</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card shadow="lg" className="text-center py-12 space-y-4">
          <div className="text-5xl">📅</div>
          <div>
            <p className="text-h4 font-bold text-neutral-900 mb-1">No bookings yet</p>
            <p className="text-body-small text-neutral-600">Start booking your first appointment</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/")}
            className="mt-6"
          >
            Browse Salons
          </Button>
        </Card>
      </div>
    );
  }

  const upcoming = bookings.filter(b => b.status === 'CONFIRMED');
  const history = bookings.filter(b => b.status !== 'CONFIRMED');

  return (
    <div className="max-w-2xl mx-auto p-4 pb-12">
      <div className="mb-8">
        <h1 className="text-h2 font-bold text-neutral-900 mb-1">My Bookings</h1>
        <p className="text-body-small text-neutral-600">Manage your appointments</p>
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-h4 font-bold text-neutral-900">📌 Upcoming</h2>
            <Badge variant="primary">{upcoming.length}</Badge>
          </div>
          {upcoming.length === 0 ? (
            <Card shadow="sm" className="p-6 text-center">
              <p className="text-body-small text-neutral-600">No upcoming bookings</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((b) => (
                <BookingCard key={b._id} booking={b} onUpdated={handleBookingUpdated} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-h4 font-bold text-neutral-900">📋 History</h2>
            <Badge variant="secondary">{history.length}</Badge>
          </div>
          {history.length === 0 ? (
            <Card shadow="sm" className="p-6 text-center">
              <p className="text-body-small text-neutral-600">No past bookings</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((b) => (
                <BookingCard key={b._id} booking={b} onUpdated={handleBookingUpdated} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyBookings;
