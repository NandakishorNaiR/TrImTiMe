import { useEffect, useState, useMemo } from 'react';
import { getAuditLogs } from '../../api/admin.api';
import GlassCard from '../../components/ui/GlassCard';

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

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Audit Logs</h1>

      <div className="flex gap-3 mb-4 items-end">
        <div>
          <label className="text-xs text-gray-500">Search</label>
          <input className="block mt-1 px-2 py-1 border rounded" placeholder="Action, entity or metadata" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Actor</label>
          <select className="block mt-1 px-2 py-1 border rounded" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="ADMIN">Admin</option>
            <option value="BARBER">Barber</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Start</label>
          <input type="date" className="block mt-1 px-2 py-1 border rounded" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">End</label>
          <input type="date" className="block mt-1 px-2 py-1 border rounded" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Per page</label>
          <select className="block mt-1 px-2 py-1 border rounded" value={limit} onChange={e => setLimit(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {loading ? (
        <GlassCard><p className="text-sm text-gray-500">Loading...</p></GlassCard>
      ) : pageItems.length === 0 ? (
        <GlassCard><p className="text-sm text-gray-500">No audit logs</p></GlassCard>
      ) : (
        pageItems.map(l => (
          <GlassCard key={l._id} className="mb-2">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{l.action}</div>
                <div className="text-xs text-gray-500">{l.entity} • {l.entityId || '—'}</div>
                <div className="text-xs text-gray-500 mt-1">{JSON.stringify(l.metadata || {})}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{l.actorRole}</div>
                <div className="text-xs text-gray-500">{new Date(l.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </GlassCard>
        ))
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border rounded" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1}>Prev</button>
          <button className="px-3 py-1 border rounded" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages}>Next</button>
          <span className="text-sm text-gray-600">Page</span>
          <input type="number" min={1} className="w-16 px-2 py-1 border rounded" value={page} onChange={(e) => setPage(Math.min(totalPages, Math.max(1, Number(e.target.value) || 1)))} />
          <span className="text-sm text-gray-600">of {totalPages}</span>
        </div>
        <div className="text-sm text-gray-600">Total: {total}</div>
      </div>
    </div>
  );
};

export default AuditLogs;

