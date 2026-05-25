import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createBooking } from "../api/booking.api";
import { formatDate, formatTime } from "../utils/time";
import { getMyProfile } from "../api/auth.api";
import BookingSummary from "../components/booking/BookingSummary";
import { formatCurrency } from "../utils/format";
import { Card, Button, Alert, Badge } from "../components/ui";

const PLATFORM_FEE = 7;

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { shop, services, slot, date } = state || {};

  if (!shop || !services || !slot) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="error" title="Invalid Booking" message="Please start over" />
      </div>
    );
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

      const payload = {
        shopId: shop._id,
        services,
        slotStart,
        slotEnd,
        paymentMethod: "UPI"
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 p-4 pb-40">
      <div className="max-w-md mx-auto space-y-6 pt-6">
        {/* Header */}
        <div>
          <h1 className="text-h2 font-bold text-neutral-900">Confirm Booking</h1>
          <p className="text-body-small text-neutral-600 mt-1">Review your booking details</p>
        </div>

        {/* Booking Summary Card */}
        <Card shadow="lg" className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-body-small text-neutral-600">💼 Shop</span>
              <span className="font-semibold text-neutral-900 text-right">{shop.name}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-body-small text-neutral-600">📅 Date & Time</span>
              <span className="font-semibold text-neutral-900 text-right">
                {formatDate(date)} at {slot.start}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-body-small text-neutral-600">✂️ Services</span>
              <div className="text-right">
                {services.map((s, i) => (
                  <div key={i} className="text-body-small font-semibold text-neutral-900">
                    {s.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-body-small text-neutral-600">Services Total:</span>
              <span className="font-semibold text-neutral-900">{formatCurrency(servicesTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body-small text-neutral-600">Platform Fee:</span>
              <span className="font-semibold text-neutral-900">₹{PLATFORM_FEE}</span>
            </div>
            <div className="flex justify-between items-center bg-primary-50 -mx-6 -mb-4 px-6 py-4 rounded-b-lg">
              <span className="font-semibold text-primary-900">Total Amount:</span>
              <span className="text-h4 font-bold text-primary-600">{formatCurrency(totalPayable)}</span>
            </div>
          </div>
        </Card>

        {/* Trust Signals Card */}
        <Card shadow="md" className="bg-gradient-to-br from-success-50 to-accent-50 border border-success-200 space-y-3">
          <h3 className="font-semibold text-success-900">✅ Why Book Here?</h3>
          <ul className="space-y-2 text-sm text-success-800">
            <li className="flex gap-2">
              <span>✓</span>
              <span>Slot reserved immediately</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Pay after service completion</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Guaranteed time slot, no waiting</span>
            </li>
          </ul>
        </Card>

        {/* Payment Details Card */}
        <Card shadow="md" className="space-y-3">
          <h3 className="font-semibold text-neutral-900">💳 Payment Method</h3>
          <div className="space-y-2 text-sm text-neutral-700">
            <p>• <strong>Pay after service:</strong> Complete first, then settle the bill</p>
            <p>• <strong>Flexible:</strong> UPI, CASH, or Card - barber will decide</p>
            <p>• <strong>Secure:</strong> Only pay for services actually rendered</p>
          </div>
        </Card>

        {/* Confirm Button - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl">
          <div className="max-w-md mx-auto p-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="font-bold text-primary-600">{formatCurrency(totalPayable)}</p>
              <p className="text-caption text-neutral-500">Incl. ₹{PLATFORM_FEE} platform fee</p>
            </div>
            <Button
              size="lg"
              variant="primary"
              loading={loading}
              disabled={loading}
              onClick={handleConfirm}
            >
              {loading ? "Confirming..." : "Confirm"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBooking;
