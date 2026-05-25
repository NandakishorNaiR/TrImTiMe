import { useEffect, useState, useMemo } from 'react';
import { getClosures, approveClosure, rejectClosure } from '../../api/admin.api';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const Closures = () => {
  const [closures, setClosures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getClosures();
      setClosures(res || []);
    } catch (e) {
      console.error('Load closures failed', e);
      setClosures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Approve this closure? This will cancel affected bookings.')) return;
    try {
      await approveClosure(id);
      setClosures(prev => prev.map(c => c._id === id ? { ...c, status: 'APPROVED' } : c));
    } catch (e) {
      console.error('Approve failed', e);
      alert('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this closure?')) return;
    try {
      await rejectClosure(id);
      setClosures(prev => prev.map(c => c._id === id ? { ...c, status: 'REJECTED' } : c));
    } catch (e) {
      console.error('Reject failed', e);
      alert('Failed to reject');
    }
  };

  const filtered = useMemo(() => {
    const q = (query || '').toLowerCase().trim();
    return closures.filter(c => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (!q) return true;
      const shopName = (c.shop && c.shop.name) ? c.shop.name.toLowerCase() : '';
      return shopName.includes(q) || (c.reason || '').toLowerCase().includes(q) || (c.date || '').includes(q);
    });
  }, [closures, query, statusFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageItems = filtered.slice((page - 1) * limit, page * limit);

  useEffect(() => { setPage(1); }, [query, statusFilter, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-spin">⏳</div>
          <p className="text-body text-neutral-600">Loading closures…</p>
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 p-4 pb-12">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-h2 font-bold text-neutral-900">🚫 Shop Closures</h1>
          <p className="text-body-small text-neutral-600 mt-1">Review and approve closure requests from barbers</p>
        </div>

        {/* Filters */}
        <Card shadow="lg">
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Search"
                placeholder="Shop, reason, or date"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />

              <div>
                <label className="text-label font-semibold text-neutral-700 block mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">⏳ Pending</option>
                  <option value="APPROVED">✓ Approved</option>
                  <option value="REJECTED">✕ Rejected</option>
                </select>
              </div>

              <div>
                <label className="text-label font-semibold text-neutral-700 block mb-2">Per Page</label>
                <select
                  value={limit}
                  onChange={e => setLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => { setQuery(''); setStatusFilter('ALL'); }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Closures List */}
        {pageItems.length === 0 ? (
          <Card shadow="lg" className="text-center py-12">
            <CardBody>
              <p className="text-5xl mb-3">✓</p>
              <p className="text-body text-neutral-700 font-medium">
                {total === 0 ? 'No closures found' : 'No results for this filter'}
              </p>
              {total === 0 && (
                <p className="text-body-small text-neutral-600 mt-1">No closure requests at the moment</p>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {pageItems.map(c => (
              <Card key={c._id} shadow="md" className={`border-l-4 ${
                c.status === 'PENDING' ? 'border-l-warning-500' :
                c.status === 'APPROVED' ? 'border-l-success-500' :
                'border-l-danger-500'
              }`}>
                <CardBody className="space-y-3">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-h5 font-bold text-neutral-900">{c.shop?.name || 'Unknown Shop'}</p>
                      <p className="text-body-small text-neutral-600 mt-1">
                        📅 {new Date(c.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      {c.reason && (
                        <p className="text-body-small text-neutral-700 mt-2">📝 {c.reason}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <Badge variant={getStatusBadgeVariant(c.status)}>
                        {c.status}
                      </Badge>
                    </div>
                  </div>

                  {c.status === 'PENDING' && (
                    <CardFooter className="border-t border-neutral-200 pt-3">
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="success"
                          fullWidth
                          onClick={() => handleApprove(c._id)}
                        >
                          ✓ Approve
                        </Button>
                        <Button
                          variant="danger"
                          fullWidth
                          onClick={() => handleReject(c._id)}
                        >
                          ✕ Reject
                        </Button>
                      </div>
                    </CardFooter>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-neutral-200">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              ← Prev
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next →
            </Button>
            <span className="text-body-small text-neutral-600 ml-2">Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => setPage(Math.min(totalPages, Math.max(1, Number(e.target.value) || 1)))}
              className="w-16 px-2 py-1 border border-neutral-300 rounded text-center"
            />
            <span className="text-body-small text-neutral-600">of {totalPages}</span>
          </div>
          <span className="text-body-small text-neutral-600">Total: {total}</span>
        </div>
      </div>
    </div>
  );
};

export default Closures;

