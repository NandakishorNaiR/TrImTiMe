import { useState, useEffect } from "react";
import { formatTime } from "../../utils/time";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/Button";
import { formatCurrency } from "../../utils/format";
import { markCustomerArrived, markBookingCompleted, markPaymentAsPaid } from "../../api/booking.api";

const TodayBookings = ({ bookings = [] }) => {
  const [local, setLocal] = useState([]);
  const [loading, setLoading] = useState({});
  const [paymentModal, setPaymentModal] = useState(null); // { bookingId, bookingData }

  useEffect(() => {
    if (Array.isArray(bookings)) {
      // Separate pending/in-progress from completed
      const pending = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN');
      const completed = bookings.filter(b => b.status === 'COMPLETED');
      // Show pending first, then completed
      setLocal([...pending, ...completed]);
    }
  }, [bookings]);

  const handleArrived = async (id) => {
    setLoading({ ...loading, [id]: true });
    try {
      await markCustomerArrived(id);
      // Update local state
      setLocal((prev) => prev.map((b) => 
        b._id === id ? { ...b, checkedIn: true, status: 'CHECKED_IN' } : b
      ));
      alert("Customer checked in ✓");
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || "Failed to check in"}`);
    } finally {
      setLoading({ ...loading, [id]: false });
    }
  };

  const handleComplete = async (id) => {
    setLoading({ ...loading, [id]: true });
    try {
      await markBookingCompleted(id);
      // Update local state
      setLocal((prev) => prev.map((b) => 
        b._id === id ? { ...b, status: 'COMPLETED', completedAt: new Date() } : b
      ));
      alert("Booking marked as completed ✓");
      // Refresh parent data after a short delay for UI update
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('bookingUpdated'));
      }, 500);
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || "Failed to complete booking"}`);
    } finally {
      setLoading({ ...loading, [id]: false });
    }
  };

  const handlePaymentMethod = async (method) => {
    const { bookingId } = paymentModal;
    setLoading({ ...loading, [bookingId]: true });
    try {
      await markPaymentAsPaid(bookingId, method);
      // Update local state
      setLocal((prev) => prev.map((b) => 
        b._id === bookingId ? { ...b, paymentStatus: 'PAID', paymentMethod: method, paidAt: new Date() } : b
      ));
      alert(`Payment marked as ${method} ✓`);
      setPaymentModal(null);
      // Refresh parent data after a short delay for UI update
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('bookingUpdated'));
      }, 500);
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || "Failed to mark payment"}`);
    } finally {
      setLoading({ ...loading, [bookingId]: false });
    }
  };

  return (
    <div className="mb-6">
      <h2 className="font-semibold mb-3">Today</h2>

      {local.length === 0 && (
        <p className="text-sm text-gray-500">No bookings today</p>
      )}

      {local.length > 0 && (
        <>
          {/* Pending & In-Progress Section */}
          {local.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-blue-700 mb-2">🔵 Action Required</h3>
              {local.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').map((b) => {
                const isCheckedIn = b.checkedIn || b.status === 'CHECKED_IN';
                
                return (
                  <GlassCard key={b._id} className={`mb-3 p-4 ${
                    isCheckedIn ? 'bg-green-50 border-green-200' : 'bg-white'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium">⏰ {formatTime(b.slot?.start)} • {b.customerName || b.customer?.name || 'Customer'}</p>
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            b.source === 'OFFLINE' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {b.source === 'OFFLINE' ? '📱 OFFLINE' : '📲 APP'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            isCheckedIn ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {isCheckedIn ? '✓ Checked In' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{(b.services || []).map(s => s.name).join(", ")}</p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(b.amount)}</p>
                        
                        <div className="flex gap-1 mt-2 flex-wrap justify-end">
                          {!isCheckedIn && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1" 
                              onClick={() => handleArrived(b._id)}
                              disabled={loading[b._id]}
                              aria-label={`Mark ${b.customerName || 'customer'} as arrived`}
                            >
                              {loading[b._id] ? '...' : '✓ Arrived'}
                            </Button>
                          )}
                          
                          {isCheckedIn && (
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1" 
                              onClick={() => handleComplete(b._id)}
                              disabled={loading[b._id]}
                              aria-label={`Mark ${b.customerName || 'customer'} booking as complete`}
                            >
                              {loading[b._id] ? '...' : '✓ Complete'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* Completed Section */}
          {local.filter(b => b.status === 'COMPLETED').length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">✓ Completed</h3>
              {local.filter(b => b.status === 'COMPLETED').map((b) => {
                const isPaid = b.paymentStatus === 'PAID';
                
                return (
                  <GlassCard key={b._id} className={`mb-3 p-4 ${
                    isPaid ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-gray-700">⏰ {formatTime(b.slot?.start)} • {b.customerName || b.customer?.name || 'Customer'}</p>
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {isPaid ? `💳 ${b.paymentMethod}` : 'Payment Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{(b.services || []).map(s => s.name).join(", ")}</p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-700">{formatCurrency(b.amount)}</p>
                        
                        {!isPaid && (
                          <div className="flex gap-1 mt-2 flex-wrap justify-end">
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1"
                              onClick={() => setPaymentModal({ bookingId: b._id, bookingData: b })}
                              disabled={loading[b._id]}
                            >
                              {loading[b._id] ? '...' : '💰 Mark Paid'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Payment Method Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Select Payment Method</h2>
            <p className="text-sm text-gray-600 mb-4">How did the customer pay?</p>
            
            <div className="space-y-2">
              <button
                onClick={() => handlePaymentMethod('UPI')}
                disabled={loading[paymentModal.bookingId]}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50"
              >
                {loading[paymentModal.bookingId] ? '...' : '💳 UPI'}
              </button>
              <button
                onClick={() => handlePaymentMethod('CASH')}
                disabled={loading[paymentModal.bookingId]}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50"
              >
                {loading[paymentModal.bookingId] ? '...' : '💵 CASH'}
              </button>
              <button
                onClick={() => setPaymentModal(null)}
                disabled={loading[paymentModal.bookingId]}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayBookings;
