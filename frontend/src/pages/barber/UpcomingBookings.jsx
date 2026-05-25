import { formatDate, formatTime } from "../../utils/time";
import { useBarberGuard } from "../../hooks/useBarberGuard";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

const UpcomingBookings = ({ bookings = [] }) => {
  useBarberGuard();
  return (
    <div className="space-y-3">
      {bookings.length === 0 && (
        <Card shadow="lg" className="text-center py-12">
          <CardBody>
            <p className="text-5xl mb-3">📅</p>
            <p className="text-body text-neutral-700 font-medium">No upcoming bookings</p>
            <p className="text-body-small text-neutral-600 mt-1">Enjoy your free time!</p>
          </CardBody>
        </Card>
      )}

      {bookings.map((b) => (
        <Card key={b._id} shadow="md" className="border-l-4 border-l-primary-500 hover:shadow-lg transition-shadow">
          <CardBody className="space-y-2">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <p className="font-bold text-neutral-900">📅 {formatDate(b.date)}</p>
                  <p className="font-semibold text-primary-700">⏰ {formatTime(b.slot.start)}</p>
                </div>
                <p className="text-body font-medium text-neutral-900">{b.customerName || b.customer?.name}</p>
              </div>

              <Badge variant={b.source === 'OFFLINE' ? 'secondary' : 'primary'}>
                {b.source === 'OFFLINE' ? '📱 Offline' : '📲 App'}
              </Badge>
            </div>

            <p className="text-body-small text-neutral-600">💰 {b.amount ? `₹${b.amount}` : 'TBD'}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default UpcomingBookings;
