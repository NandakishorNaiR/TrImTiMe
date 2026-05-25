import { useEffect, useState, useMemo } from 'react';
import { getAuditLogs } from '../../api/admin.api';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAuditLogs();
      setLogs(res || []);
    } catch (e) {
      console.error('Load audit logs failed', e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = (query || '').toLowerCase().trim();
    return logs.filter(l => {
      if (roleFilter !== 'ALL' && l.actorRole !== roleFilter) return false;
      if (startDate) {
        if (new Date(l.createdAt) < new Date(startDate)) return false;
      }
      if (endDate) {
        const ed = new Date(endDate); ed.setHours(23,59,59,999);
        if (new Date(l.createdAt) > ed) return false;
      }
      if (!q) return true;
      return (l.action || '').toLowerCase().includes(q) || (l.entity || '').toLowerCase().includes(q) || JSON.stringify(l.metadata || {}).toLowerCase().includes(q);
    });
  }, [logs, query, roleFilter, startDate, endDate]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageItems = filtered.slice((page - 1) * limit, page * limit);

  useEffect(() => { setPage(1); }, [query, roleFilter, startDate, endDate, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-spin">⏳</div>
          <p className="text-body text-neutral-600">Loading audit logs…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 p-4 pb-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-h2 font-bold text-neutral-900">📋 Audit Logs</h1>
          <p className="text-body-small text-neutral-600 mt-1">Track all system activities and user actions</p>
        </div>

        {/* Filters */}
        <Card shadow="lg">
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Search"
                  placeholder="Action, entity, or data"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="text-label font-semibold text-neutral-700 block mb-2">Actor</label>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ALL">All</option>
                  <option value="ADMIN">👤 Admin</option>
                  <option value="BARBER">✂️ Barber</option>
                </select>
              </div>

              <div>
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-label font-semibold text-neutral-700 block mb-2">Per Page</label>
                <select
                  value={limit}
                  onChange={e => setLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery('');
                  setRoleFilter('ALL');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Logs List */}
        {pageItems.length === 0 ? (
          <Card shadow="lg" className="text-center py-12">
            <CardBody>
              <p className="text-5xl mb-3">✓</p>
              <p className="text-body text-neutral-700 font-medium">
                {total === 0 ? 'No audit logs found' : 'No results for this filter'}
              </p>
              {total === 0 && (
                <p className="text-body-small text-neutral-600 mt-1">Activity logs will appear as actions are performed in the system</p>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {pageItems.map(l => (
              <Card key={l._id} shadow="md" className="border-l-4 border-l-primary-500 hover:shadow-lg transition-shadow">
                <CardBody className="space-y-3">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-h5 font-bold text-neutral-900 break-words">{l.action}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary">{l.entity}</Badge>
                        {l.entityId && (
                          <span className="text-body-small text-neutral-600 font-mono">ID: {l.entityId}</span>
                        )}
                      </div>
                      {l.metadata && Object.keys(l.metadata).length > 0 && (
                        <div className="mt-2 p-2 bg-neutral-100 rounded text-body-small text-neutral-700 font-mono max-h-20 overflow-auto">
                          {JSON.stringify(l.metadata, null, 2)}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <Badge variant={l.actorRole === 'ADMIN' ? 'primary' : 'secondary'}>
                        {l.actorRole}
                      </Badge>
                      <p className="text-caption text-neutral-600 mt-2">
                        {new Date(l.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
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

export default AuditLogs;

