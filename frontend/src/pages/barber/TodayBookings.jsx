import { useState, useEffect } from "react";
import { formatTime } from "../../utils/time";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
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
    <div className="space-y-4">
      {local.length === 0 && (
        <Card shadow="lg" className="text-center py-12">
          <CardBody>
            <p className="text-5xl mb-3">🎉</p>
            <p className="text-body text-neutral-700 font-medium">No bookings today</p>
            <p className="text-body-small text-neutral-600 mt-1">Relax! You're all caught up.</p>
          </CardBody>
        </Card>
      )}

      {local.length > 0 && (
        <>
          {/* Pending & In-Progress Section */}
          {local.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔔</span>
                <p className="font-semibold text-primary-700">Action Required</p>
                <Badge variant="danger">{local.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length}</Badge>
              </div>

              {local.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').map((b) => {
                const isCheckedIn = b.checkedIn || b.status === 'CHECKED_IN';
                
                return (
                  <Card 
                    key={b._id} 
                    shadow="md" 
                    className={`border-l-4 ${isCheckedIn ? 'border-l-success-500' : 'border-l-warning-500'}`}
                  >
                    <CardBody className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <p className="font-bold text-neutral-900">⏰ {formatTime(b.slot?.start)}</p>
                            <Badge variant={b.source === 'OFFLINE' ? 'secondary' : 'primary'}>
                              {b.source === 'OFFLINE' ? '📱 Offline' : '📲 App'}
                            </Badge>
                            <Badge variant={isCheckedIn ? 'success' : 'warning'}>
                              {isCheckedIn ? '✓ Checked In' : 'Pending'}
                            </Badge>
                          </div>
                          <p className="text-body font-medium text-neutral-900">{b.customerName || b.customer?.name || 'Customer'}</p>
                          <p className="text-body-small text-neutral-600 mt-1">Services: {(b.services || []).map(s => s.name).join(", ")}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-h4 font-bold text-primary-700">{formatCurrency(b.amount)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {!isCheckedIn && (
                          <Button 
                            variant="success"
                            fullWidth
                            onClick={() => handleArrived(b._id)}
                            loading={loading[b._id]}
                          >
                            ✓ Customer Arrived
                          </Button>
                        )}
                        
                        {isCheckedIn && (
                          <Button 
                            variant="primary"
                            fullWidth
                            onClick={() => handleComplete(b._id)}
                            loading={loading[b._id]}
                          >
                            ✓ Mark Complete
                          </Button>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Completed Section */}
          {local.filter(b => b.status === 'COMPLETED').length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">✓</span>
                <p className="font-semibold text-neutral-700">Completed</p>
                <Badge variant="secondary">{local.filter(b => b.status === 'COMPLETED').length}</Badge>
              </div>

              {local.filter(b => b.status === 'COMPLETED').map((b) => {
                const isPaid = b.paymentStatus === 'PAID';
                
                return (
                  <Card 
                    key={b._id} 
                    shadow="sm" 
                    className={`border-l-4 ${isPaid ? 'border-l-success-500 bg-success-50' : 'border-l-warning-500'}`}
                  >
                    <CardBody className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <p className="font-bold text-neutral-900">⏰ {formatTime(b.slot?.start)}</p>
                            <Badge variant={isPaid ? 'success' : 'warning'}>
                              {isPaid ? `💳 ${b.paymentMethod}` : 'Payment Pending'}
                            </Badge>
                          </div>
                          <p className="text-body font-medium text-neutral-900">{b.customerName || b.customer?.name || 'Customer'}</p>
                          <p className="text-body-small text-neutral-600 mt-1">Services: {(b.services || []).map(s => s.name).join(", ")}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-h4 font-bold text-neutral-700">{formatCurrency(b.amount)}</p>
                        </div>
                      </div>

                      {!isPaid && (
                        <Button
                          variant="secondary"
                          fullWidth
                          onClick={() => setPaymentModal({ bookingId: b._id, bookingData: b })}
                          loading={loading[b._id]}
                        >
                          💰 Mark Payment
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Payment Method Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 rounded-lg">
          <Card shadow="2xl" className="w-full max-w-md">
            <CardBody className="space-y-4">
              <div>
                <p className="text-h5 font-bold text-neutral-900">💳 Payment Method</p>
                <p className="text-body-small text-neutral-600 mt-1">How did the customer pay?</p>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handlePaymentMethod('UPI')}
                  loading={loading[paymentModal.bookingId]}
                >
                  UPI Payment
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => handlePaymentMethod('CASH')}
                  loading={loading[paymentModal.bookingId]}
                >
                  Cash Payment
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setPaymentModal(null)}
                  disabled={loading[paymentModal.bookingId]}
                >
                  Cancel
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TodayBookings;
