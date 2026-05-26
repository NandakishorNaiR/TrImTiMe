import { useEffect, useState } from "react";
import { getClosures, addClosure } from "../../api/barber.api";
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";

const Closures = () => {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getClosures();
      setList(res || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load closures");
    }
  };

  const add = async () => {
    if (!date) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await addClosure({ date, reason });
      alert(`✓ ${res.affected || 0} bookings refunded`);
      setList((l) => [...l, { date, reason }]);
      setDate('');
      setReason('');
    } catch (e) {
      console.error(e);
      setError('Failed to add closure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 p-4 pb-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-h2 font-bold text-neutral-900">Shop Closures</h1>
          <p className="text-body-small text-neutral-600 mt-1">Mark dates when your shop will be closed</p>
        </div>

        {error && (
          <Alert variant="error" title="Error" message={error} />
        )}

        {/* Add Closure Card */}
        <Card shadow="lg">
          <CardHeader className="bg-warning-700 text-white rounded-t-xl">
            <CardTitle>🚫 Add Shop Closure</CardTitle>
          </CardHeader>

          <CardBody className="space-y-4">
            <Input
              label="Closure Date"
              type="date"
              value={date}
              onChange={e => {
                setDate(e.target.value);
                setError(null);
              }}
            />

            <Input
              label="Reason (Optional)"
              placeholder="E.g., Maintenance, Holiday, etc."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />

            <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
              <p className="text-caption text-warning-700 font-semibold">⚠️ Important</p>
              <p className="text-body-small text-warning-700 mt-1">All bookings on this date will be automatically cancelled and refunded.</p>
            </div>
          </CardBody>

          <CardFooter>
            <Button
              variant="danger"
              fullWidth
              size="lg"
              loading={loading}
              onClick={add}
              disabled={!date}
            >
              ✓ Mark as Closed
            </Button>
          </CardFooter>
        </Card>

        {/* Closures List */}
        {list.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <p className="font-semibold text-neutral-900">Upcoming Closures</p>
              <Badge variant="secondary">{list.length}</Badge>
            </div>

            {list.map((c, i) => (
              <Card key={i} shadow="md" className="border-l-4 border-l-danger-500">
                <CardBody className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-neutral-900">
                        {new Date(c.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {c.reason && (
                        <p className="text-body-small text-neutral-600 mt-1">📝 {c.reason}</p>
                      )}
                    </div>
                    <Badge variant="danger">Closed</Badge>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {list.length === 0 && (
          <Card shadow="lg" className="text-center py-12">
            <CardBody>
              <p className="text-5xl mb-3">✓</p>
              <p className="text-body text-neutral-700 font-medium">No closures scheduled</p>
              <p className="text-body-small text-neutral-600 mt-1">Your shop is open on all scheduled days</p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Closures;
