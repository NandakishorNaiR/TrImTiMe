import { useNavigate, useLocation } from "react-router-dom";

const BookingSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { bookingId, shop, slot, date } = state || {};

  return (
    <div className="p-3 sm:p-4 max-w-xl mx-auto pb-8">
      <div className="h-screen flex flex-col justify-center items-start">
        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">✅</div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Booking Confirmed</h1>

        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-sm">
          Your slot has been successfully reserved. Arrive on time for your appointment.
        </p>

        {/* Booking Details */}
        {shop && slot && date && (
          <div className="bg-gray-50 border rounded-lg p-4 mb-6 w-full">
            <h3 className="font-semibold mb-3">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Shop:</span>
                <span className="font-medium">{shop.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{slot.start} – {slot.end}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono text-xs">{bookingId?.substring(0, 8)}...</span>
              </div>
            </div>
          </div>
        )}

        {/* Service Flow */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 w-full">
          <h3 className="font-semibold text-green-900 mb-3">📋 What Happens Next</h3>
          <ol className="space-y-2 text-sm text-green-800">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Arrive on time at the salon</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Show your booking ID to the barber</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>Enjoy your service</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>Pay at the end (UPI or CASH)</span>
            </li>
          </ol>
        </div>

        <button
          onClick={() => navigate("/my-bookings")}
          className="w-full bg-black text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-800 active:scale-95 transition-all text-sm sm:text-base"
        >
          View My Bookings
        </button>
      </div>
    </div>
  );
};

export default BookingSuccess;
