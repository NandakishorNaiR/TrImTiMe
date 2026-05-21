import { useEffect, useState, useMemo } from 'react';
import { getClosures, approveClosure, rejectClosure } from '../../api/admin.api';
import GlassCard from '../../components/ui/GlassCard';

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

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Closures</h1>

      <div className="flex gap-3 mb-4 items-end">
        <div>
          <label className="text-xs text-gray-500">Search</label>
          <input className="block mt-1 px-2 py-1 border rounded" placeholder="Shop, reason or date" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Status</label>
          <select className="block mt-1 px-2 py-1 border rounded" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Per page</label>
          <select className="block mt-1 px-2 py-1 border rounded" value={limit} onChange={e => setLimit(Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {loading ? (
        <GlassCard><p className="text-sm text-gray-500">Loading...</p></GlassCard>
      ) : pageItems.length === 0 ? (
        <GlassCard><p className="text-sm text-gray-500">No closures</p></GlassCard>
      ) : (
        pageItems.map(c => (
          <GlassCard key={c._id} className="mb-3">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{c.shop?.name || c.shop}</div>
                <div className="text-xs text-gray-500">{c.date} • {c.reason || '—'}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{c.status}</div>
                <div className="flex gap-2 mt-2 justify-end">
                  {c.status === 'PENDING' && (
                    <>
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm" onClick={() => handleApprove(c._id)}>Approve</button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-sm" onClick={() => handleReject(c._id)}>Reject</button>
                    </>
                  )}
                </div>
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

export default Closures;

