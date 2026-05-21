import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createBooking } from "../api/booking.api";
import { formatDate, formatTime } from "../utils/time";
import { getMyProfile } from "../api/auth.api";
import BookingSummary from "../components/booking/BookingSummary";
import { formatCurrency } from "../utils/format";

const PLATFORM_FEE = 7;

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { shop, services, slot, date } = state || {};

  if (!shop || !services || !slot) {
    return <div className="p-4">Invalid booking</div>;
  }

  const servicesTotal = services.reduce((sum, s) => sum + s.price, 0);
  const totalPayable = servicesTotal + PLATFORM_FEE;
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await getMyProfile();
        if (mounted) setUserProfile(p);
      } catch (e) { }
    })();
    return () => { mounted = false; };
  }, []);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const slotStart = `${date}T${slot.start}:00`;
      const slotEnd = slot.end ? `${date}T${slot.end}:00` : null;

      // Default payment method - barber will confirm actual method after service
      const payload = {
        shopId: shop._id,
        services,
        slotStart,
        slotEnd,
        paymentMethod: "UPI"  // Default, will be updated when payment is collected
      };

      const response = await createBooking(payload);
      
      navigate("/booking-success", {
        state: {
          bookingId: response.bookingId,
          shop,
          slot,
          date
        }
      });
    } catch (e) {
      alert('Failed to confirm booking: ' + (e.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 max-w-xl mx-auto pb-32 sm:pb-28">
      <h1 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Confirm Booking</h1>

      <BookingSummary shop={shop} services={services} slot={slot} date={date} platformFee={PLATFORM_FEE} />

      {/* Trust Signals */}
      <div className="bg-gray-50 border rounded-lg sm:rounded-xl p-3 sm:p-4 text-xs text-gray-600 space-y-1">
        <p>✅ Slot reserved immediately</p>
        <p>⏰ Payment after service completion</p>
        <p>🕒 No waiting — guaranteed time slot</p>
      </div>

      {/* Payment Info */}
      <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <h2 className="font-semibold text-sm sm:text-base mb-2">Payment Details</h2>
        <ul className="text-xs sm:text-sm space-y-1 text-gray-700">
          <li>💳 <strong>Pay after service:</strong> Complete service first, then pay</li>
          <li>💵 <strong>UPI or CASH:</strong> Barber will confirm method on completion</li>
          <li>🛡️ <strong>Secure:</strong> Only pay for services actually rendered</li>
        </ul>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-xl mx-auto p-3 sm:p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm sm:text-base font-semibold">{formatCurrency(totalPayable)}</p>
            <p className="text-xs text-gray-500">Total (incl. ₹{PLATFORM_FEE} platform fee)</p>
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-black text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-800 transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Confirming..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBooking;
