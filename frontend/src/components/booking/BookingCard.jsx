import { formatDate, formatTime } from "../../utils/time";
import { useState } from "react";
import { cancelBooking } from "../../api/booking.api";

const STATUS_STYLES = {
  CONFIRMED: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-orange-100 text-orange-700",
  REFUNDED: "bg-blue-100 text-blue-700",
};

const BookingCard = ({ booking, onUpdated }) => {
  const {
    shop,
    date,
    slot,
    services = [],
    status,
    totalAmount
  } = booking || {};
  const [localStatus, setLocalStatus] = useState(status);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!booking || !booking._id) return;
    const ok = window.confirm("Cancel this booking? You may receive a partial/full refund depending on timing.");
    if (!ok) return;
    try {
      setLoading(true);
      await cancelBooking(booking._id);
      setLocalStatus('CANCELLED');
      if (typeof onUpdated === 'function') onUpdated(booking._id, 'CANCELLED');
    } catch (err) {
      console.error('Cancel failed', err);
      window.alert(err?.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="border rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{shop?.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">📅 {formatDate(date)} • ⏰ {formatTime(slot?.start)}{slot?.end ? ` – ${formatTime(slot.end)}` : ""}</p>
        </div>

        <span
          className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[localStatus] || "bg-gray-100 text-gray-700"}`}
        >
          {localStatus}
        </span>
      </div>

      {/* Services */}
      <div className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 truncate">
        {services.map(s => s.name).join(", ")}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm">
        <span className="text-gray-500">{services.length} service(s)</span>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <span className="font-semibold text-sm sm:text-base">₹{totalAmount}</span>
          {localStatus === 'CONFIRMED' && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-md bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 active:scale-95 transition-all font-medium flex-1 sm:flex-none"
            >
              {loading ? 'Cancelling…' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
