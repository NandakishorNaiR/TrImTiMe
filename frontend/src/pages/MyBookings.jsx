import { useEffect, useState, useCallback } from "react";
import { getMyBookings } from "../api/booking.api";
import BookingCard from "../components/booking/BookingCard";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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
    // optimistic update
    setBookings((prev) => prev.map(b => (b._id === bookingId ? { ...b, status: newStatus } : b)));
    // refetch server-side to ensure canonical state (refunds, partial refunds, metadata)
    try {
      await load();
    } catch (e) {
      // swallow — UI already shows optimistic change
      console.error('Failed to refresh bookings after update', e);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10000); // refresh every 10s to reflect status changes
    return () => clearInterval(id);
  }, [load]);

  if (loading) {
    return <div className="p-4">Loading bookings…</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-lg mb-2">No bookings yet</p>
        <p className="text-sm">Book a slot and it’ll appear here</p>
      </div>
    );
  }

  // Split into upcoming (CONFIRMED) and history (everything else)
  const upcoming = bookings.filter(b => b.status === 'CONFIRMED');
  const history = bookings.filter(b => b.status !== 'CONFIRMED');

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-xl mx-auto">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">My Bookings</h1>

      <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">Upcoming</h2>
      {upcoming.length === 0 && (
        <p className="text-xs sm:text-sm text-gray-500 mb-4">No upcoming bookings</p>
      )}
      {upcoming.map((b) => (
        <BookingCard key={b._id} booking={b} onUpdated={handleBookingUpdated} />
      ))}

      <h2 className="text-sm sm:text-base font-semibold text-gray-900 mt-6 sm:mt-8 mb-2 sm:mb-3">History</h2>
      {history.length === 0 && (
        <p className="text-sm text-gray-500">No past bookings</p>
      )}
      {history.map((b) => (
        <BookingCard key={b._id} booking={b} onUpdated={handleBookingUpdated} />
      ))}
    </div>
  );
};

export default MyBookings;
