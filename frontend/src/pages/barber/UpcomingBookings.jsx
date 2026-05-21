import { formatDate, formatTime } from "../../utils/time";
import { useBarberGuard } from "../../hooks/useBarberGuard";
import GlassCard from "../../components/ui/GlassCard";

const UpcomingBookings = ({ bookings = [] }) => {
  useBarberGuard();
  return (
    <div>
      <h2 className="font-semibold mb-3">Upcoming</h2>

      {bookings.length === 0 && (
        <p className="text-sm text-gray-500">No upcoming bookings</p>
      )}

      {bookings.map((b) => (
        <GlassCard key={b._id} className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium">📅 {formatDate(b.date)} • ⏰ {formatTime(b.slot.start)}</p>
            <span className={`text-xs px-2 py-1 rounded font-semibold ${
              b.source === 'OFFLINE' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {b.source === 'OFFLINE' ? '📱 OFFLINE' : '📲 APP'}
            </span>
          </div>
          <p className="text-xs text-gray-500">{b.customerName || b.customer?.name} • ₹{b.amount}</p>
        </GlassCard>
      ))}
    </div>
  );
};

export default UpcomingBookings;
