import { useNavigate, useLocation } from "react-router-dom";
import { Card, Button, Alert, Badge } from "../components/ui";

const BookingSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { bookingId, shop, slot, date } = state || {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success-50 via-neutral-50 to-accent-50 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Success Icon */}
        <div className="text-center">
          <div className="text-7xl mb-6 animate-bounce">✅</div>
          <h1 className="text-h2 font-bold text-neutral-900 mb-2">Booking Confirmed!</h1>
          <p className="text-body text-neutral-600">
            Your appointment has been successfully reserved.
          </p>
        </div>

        {/* Booking Details Card */}
        {shop && slot && date && (
          <Card shadow="lg" className="space-y-4">
            <h3 className="text-h4 font-bold text-neutral-900">Booking Details</h3>
            
            <div className="space-y-3 border-t border-neutral-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-body-small text-neutral-600">💼 Shop</span>
                <span className="font-semibold text-neutral-900">{shop.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-small text-neutral-600">📅 Date</span>
                <span className="font-semibold text-neutral-900">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-small text-neutral-600">🕐 Time</span>
                <span className="font-semibold text-neutral-900">{slot.start} – {slot.end}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-small text-neutral-600">🎟️ Booking ID</span>
                <span className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded">
                  {bookingId?.substring(0, 8)}...
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Next Steps Card */}
        <Card shadow="lg" className="bg-gradient-to-br from-success-50 to-accent-50 border border-success-200 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-h4">📋</span>
            <h3 className="text-h4 font-bold text-success-900">What Happens Next</h3>
          </div>
          
          <ol className="space-y-3 text-sm">
            {[
              { icon: '⏰', text: 'Arrive on time at the salon' },
              { icon: '🆔', text: 'Show your booking ID to the barber' },
              { icon: '✂️', text: 'Enjoy your service' },
              { icon: '💳', text: 'Pay at the end (UPI or CASH)' }
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-xl">{step.icon}</span>
                <span className="text-success-800">{step.text}</span>
              </li>
            ))}
          </ol>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            fullWidth
            variant="primary"
            size="lg"
            onClick={() => navigate("/my-bookings")}
          >
            View My Bookings
          </Button>
          <Button
            fullWidth
            variant="secondary"
            size="lg"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
