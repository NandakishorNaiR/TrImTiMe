import { useEffect, useState, useRef } from "react";
import DashboardButton from '../../components/ui/DashboardButton';
import Sparkline from '../../components/ui/Sparkline';
import { formatCurrency } from '../../utils/format';
import { getSettlements, markSettlementPaid, getDashboardStats, getShopStats, getAllShops, toggleShopAcceptCOD, deleteShop, deleteUser, cancelBooking, getClosures, getAuditLogs, getPlatformRevenue, getPlatformRevenueSeries, refundBooking, flagBooking, setUserCODRestriction, approveClosure, rejectClosure } from "../../api/admin.api";
import { getAllBookings } from "../../api/admin.api";
import SettlementRow from "../../components/admin/SettlementRow";
import GlassCard from "../../components/ui/GlassCard";
// sparkline/format removed from this view; only closures & audit logs are needed here

const AdminDashboard = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    load();
    loadStats();
  }, []);

  const load = async (opts = {}) => {
    // default behavior shows main loading spinner; pass { silent: true } to refresh in background
    const silent = opts.silent === true;
    if (!silent) setLoading(true);
    try {
      const data = await getSettlements();
      setSettlements(data || []);
    } catch (err) {
      console.error("Failed to load settlements", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data || null);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    }
  };

  const [platformRev, setPlatformRev] = useState({ totalPlatform: 0, bookings: 0 });
  const [platformSeries, setPlatformSeries] = useState([]);
  const [closuresList, setClosuresList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const loadExtras = async () => {
    try {
      const [rev, seriesRes, closuresRes, logsRes] = await Promise.all([
        getPlatformRevenue(),
        getPlatformRevenueSeries(30),
        getClosures(),
        getAuditLogs()
      ]);
      setPlatformRev(rev || { totalPlatform: 0, bookings: 0 });
      setPlatformSeries((seriesRes && seriesRes.series) || []);
      setClosuresList(closuresRes || []);
      setAuditLogs((logsRes || []).slice(0, 20));
    } catch (e) { console.error('Failed to load extra admin data', e); }
  };

  const handleApproveClosure = async (id) => {
    if (!confirm('Approve this closure?')) return;
    try {
      await approveClosure(id);
      setClosuresList(prev => prev.map(c => c._id === id ? { ...c, status: 'APPROVED' } : c));
    } catch (e) { console.error('approve closure failed', e); alert('Failed to approve'); }
  };

  const handleRejectClosure = async (id) => {
    if (!confirm('Reject this closure?')) return;
    try {
      await rejectClosure(id);
      setClosuresList(prev => prev.map(c => c._id === id ? { ...c, status: 'REJECTED' } : c));
    } catch (e) { console.error('reject closure failed', e); alert('Failed to reject'); }
  };

  const [shops, setShops] = useState([]);
  const [fullShops, setFullShops] = useState([]);
  const loadShops = async () => {
    try {
      const s = await getShopStats();
      setShops(s || []);
    } catch (e) { console.error('Load shops failed', e); }
  };

  const loadFullShops = async () => {
    try {
      const s = await getAllShops();
      setFullShops(s || []);
    } catch (e) { console.error('Load full shops failed', e); }
  };

  useEffect(() => { loadShops(); }, []);
  useEffect(() => { loadFullShops(); }, []);
  useEffect(() => { loadExtras(); }, []);
  
  // platform summary cards
  const PlatformCards = () => (
    // hide detailed cards when no data available
    (platformRev.totalBookings === 0 || (!platformSeries || platformSeries.length === 0)) ? (
      <div className="mb-6">
        <GlassCard><p className="text-sm text-gray-500">No platform revenue data</p></GlassCard>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <GlassCard title="Platform Revenue (30d)">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{formatCurrency(platformRev.totalPlatform || platformRev.totalPlatform || 0)}</div>
            <div className="text-xs text-gray-500">{platformRev.bookings || 0} bookings</div>
          </div>
          <div>
            <Sparkline data={(platformSeries || []).map(p => p.value || p.y || 0)} width={140} height={40} />
          </div>
        </div>
      </GlassCard>

      <GlassCard title="COD Bookings Value">
        <div className="text-2xl font-bold">{formatCurrency(platformRev.codValue || 0)}</div>
      </GlassCard>

      <GlassCard title="COD Due">
        <div className="text-2xl font-bold text-red-600">{formatCurrency(platformRev.codDue || 0)}</div>
      </GlassCard>
    </div>
    )
  );
  const [bookings, setBookings] = useState([]);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsLimit, setBookingsLimit] = useState(20);
  const [bookingsTotal, setBookingsTotal] = useState(0);

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterShop, setFilterShop] = useState('');
  const [filterUserPhone, setFilterUserPhone] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const loadBookings = async (opts = {}) => {
    try {
      const page = opts.page || bookingsPage || 1;
      const limit = opts.limit || bookingsLimit || 20;
      const params = {
        page,
        limit,
      };
      // allow caller to override whether history mode is used to avoid stale-closure issues
      const localShowHistory = opts.showHistory !== undefined ? opts.showHistory : showHistory;
      if (opts.status !== undefined) params.status = opts.status;
      else if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
      if (opts.shopId !== undefined) params.shopId = opts.shopId;
      else if (filterShop) params.shopId = filterShop;
      if (opts.userPhone !== undefined) params.userPhone = opts.userPhone;
      else if (filterUserPhone) params.userPhone = filterUserPhone;
      if (opts.startDate !== undefined) params.startDate = opts.startDate;
      else if (filterStartDate) params.startDate = filterStartDate;
      if (opts.endDate !== undefined) params.endDate = opts.endDate;
      else if (filterEndDate) params.endDate = filterEndDate;

      // when not showing history, default to active bookings
      if (!localShowHistory && !params.status) params.status = 'booked,in_progress';

      const res = await getAllBookings(params);
      if (res) {
        setBookings(res.bookings || []);
        setBookingsTotal(res.total || 0);
        setBookingsPage(res.page || page);
        setBookingsLimit(res.limit || limit);
      }
    } catch (e) { console.error('Load bookings failed', e); }
  };

  useEffect(() => { loadBookings({ page: 1 }); }, []);
  const [showHistory, setShowHistory] = useState(false);
  // Poll for updates every 8 seconds to keep admin view in sync.
  // Use a ref to hold the latest params so the interval callback doesn't get stale closures
  const paramsRef = useRef({});
  useEffect(() => {
    paramsRef.current = {
      bookingsPage,
      bookingsLimit,
      filterStatus,
      filterShop,
      filterUserPhone,
      filterStartDate,
      filterEndDate,
      showHistory
    };
  }, [bookingsPage, bookingsLimit, filterStatus, filterShop, filterUserPhone, filterStartDate, filterEndDate, showHistory]);

  useEffect(() => {
    const iv = setInterval(() => {
      const p = paramsRef.current || {};
      loadBookings({
        page: p.bookingsPage || 1,
        limit: p.bookingsLimit || bookingsLimit,
        status: p.filterStatus && p.filterStatus !== 'all' ? p.filterStatus : undefined,
        shopId: p.filterShop || undefined,
        userPhone: p.filterUserPhone || undefined,
        startDate: p.filterStartDate || undefined,
        endDate: p.filterEndDate || undefined,
        showHistory: p.showHistory || false
      });
      loadShops();
      load({ silent: true });
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  const handlePaid = async (id) => {
    // optimistic update: mark locally, then call server
    try {
      setSettlements(prev => prev.map(s => s._id === id ? { ...s, status: 'paid', paidAt: new Date().toISOString() } : s));
      await markSettlementPaid(id);
    } catch (err) {
      console.error("Mark paid failed", err);
      // reload full settlements on failure
      load();
    }
  };

  // pagination helpers
  const getTotalPages = () => Math.max(1, Math.ceil((bookingsTotal || 0) / bookingsLimit));
  const goToPage = (p) => {
    const total = getTotalPages();
    const page = Math.min(Math.max(1, Number(p) || 1), total);
    setBookingsPage(page);
    loadBookings({ page });
  };
  const handlePrev = () => { if (bookingsPage > 1) goToPage(bookingsPage - 1); };
  const handleNext = () => { if (bookingsPage < getTotalPages()) goToPage(bookingsPage + 1); };
  const handlePageInputChange = (v) => { setBookingsPage(Number(v) || 1); };
  const handlePageInputBlur = () => { goToPage(bookingsPage); };

  // action loading states
  const [deletingShopId, setDeletingShopId] = useState(null);
  const [deletingUserIds, setDeletingUserIds] = useState(() => new Set());
  const [cancellingBookingIds, setCancellingBookingIds] = useState(() => new Set());

  const handleDeleteShop = async (shopId) => {
    if (!confirm('Delete this shop?')) return;
    const prev = shops;
    try {
      setDeletingShopId(shopId);
      setShops(prevShops => prevShops.filter(s => s.shopId !== shopId));
      await deleteShop(shopId);
    } catch (err) {
      console.error('Delete shop failed', err);
      setShops(prev);
      alert('Failed to delete shop');
    } finally {
      setDeletingShopId(null);
    }
  };

  const handleToggleAcceptCOD = async (shopId, current) => {
    try {
      // optimistic UI: flip locally
      setFullShops(prev => prev.map(p => p._id === shopId ? { ...p, acceptCOD: !current } : p));
      await toggleShopAcceptCOD(shopId, !current);
      // refresh stats and shops
      loadShops();
      loadFullShops();
    } catch (err) {
      console.error('Toggle acceptCOD failed', err);
      // revert on failure
      setFullShops(prev => prev.map(p => p._id === shopId ? { ...p, acceptCOD: current } : p));
      alert('Failed to update shop setting');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;
    const prevBookings = bookings;
    try {
      setDeletingUserIds(prev => new Set([...prev, userId]));
      setBookings(prev => prev.filter(b => (b.userId?._id || b.userId) !== userId));
      await deleteUser(userId);
    } catch (err) {
      console.error('Delete user failed', err);
      setBookings(prevBookings);
      alert('Failed to delete user');
    } finally {
      setDeletingUserIds(prev => { const s = new Set(prev); s.delete(userId); return s; });
    }
  };

  const handleToggleUserCOD = async (userId) => {
    try {
      const prevBookings = bookings;
      // optimistic local update: toggle value to avoid UI flicker
      setBookings(prev => prev.map(b => {
        if ((b.userId?._id || b.userId) === userId) {
          const current = b.userId?.codRestrictedUntil;
          return { ...b, userId: { ...(b.userId || {}), codRestrictedUntil: current ? null : new Date().toISOString() } };
        }
        return b;
      }));

      const res = await setUserCODRestriction(userId);
      // apply server value
      setBookings(prev => prev.map(b => ((b.userId?._id || b.userId) === userId) ? { ...b, userId: { ...(b.userId || {}), codRestrictedUntil: res.codRestrictedUntil } } : b));
    } catch (err) {
      console.error('Toggle user COD failed', err);
      alert('Failed to update user COD restriction');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Cancel this booking?')) return;
    const prevBookings = bookings;
    try {
      setCancellingBookingIds(prev => new Set([...prev, bookingId]));
      // optimistic: mark as cancelled locally
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      await cancelBooking(bookingId);
    } catch (err) {
      console.error('Cancel booking failed', err);
      setBookings(prevBookings);
      alert('Failed to cancel booking');
    } finally {
      setCancellingBookingIds(prev => { const s = new Set(prev); s.delete(bookingId); return s; });
    }
  };

  const handleAdminRefund = async (bookingId) => {
    if (!confirm('Process refund for this booking?')) return;
    const prev = bookings;
    try {
      // optimistic update
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'refunded' } : b));
      await refundBooking(bookingId);
    } catch (err) {
      console.error('Refund failed', err);
      setBookings(prev);
      alert('Failed to refund booking');
    }
  };

  const handleAdminFlag = async (bookingId) => {
    if (!confirm('Flag this booking for review?')) return;
    try {
      await flagBooking(bookingId);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, flagged: true } : b));
      alert('Booking flagged');
    } catch (err) {
      console.error('Flag failed', err);
      alert('Failed to flag booking');
    }
  };

  // analytics removed from this view; summaries are available in settlements list

  // derive displayed bookings based on filters / history
  const bookingsSorted = [...bookings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const activeBookings = bookings.filter(b => ['booked','in_progress'].includes(b.status));
  const displayedBookings = showHistory ? bookingsSorted : activeBookings;

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Core KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <GlassCard title="Customers">
          <p className="text-3xl font-bold">{stats ? stats.customers : '—'}</p>
        </GlassCard>

        <GlassCard title="Barbers">
          <p className="text-3xl font-bold">{stats ? stats.barbers : '—'}</p>
        </GlassCard>

        <GlassCard title="Shops">
          <p className="text-3xl font-bold">{stats ? stats.shops : '—'}</p>
        </GlassCard>

        <GlassCard title="Bookings">
          <p className="text-3xl font-bold">{stats ? stats.bookings : '—'}</p>
        </GlassCard>
      </div>

      {/* Financial summary for admins */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <GlassCard title="Total Collected"><div className="text-2xl font-bold">{formatCurrency(stats.totalOnline || 0)}</div></GlassCard>
          <GlassCard title="Platform Earnings"><div className="text-2xl font-bold">{formatCurrency(stats.platformEarnings || 0)}</div></GlassCard>
          <GlassCard title="COD Due"><div className="text-2xl font-bold text-red-600">{formatCurrency(stats.codDue || 0)}</div></GlassCard>
          <GlassCard title="Net Payout"><div className="text-2xl font-bold">{formatCurrency(stats.netPayout || 0)}</div></GlassCard>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <DashboardButton to="/admin/closures" ariaLabel="Open Closures">Closures</DashboardButton>
        <DashboardButton to="/admin/audit-logs" ariaLabel="Open Audit Logs" variant="outline">Audit Logs</DashboardButton>
      </div>

      {/* Closures & Audit Logs snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GlassCard title={`Recent Closures (${closuresList.length})`}>
          {closuresList.length === 0 ? <p className="text-sm text-gray-500">No closures</p> : (
            <ul className="text-sm space-y-2">
              {closuresList.slice(0,5).map(c => (
                <li key={c._id} className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{c.shop?.name || c.shop}</div>
                    <div className="text-xs text-gray-500">{c.date} • {c.reason || '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500 mr-2">{c.status}</div>
                    {c.status === 'PENDING' && (
                      <>
                        <button className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded" onClick={() => handleApproveClosure(c._id)}>Approve</button>
                        <button className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded" onClick={() => handleRejectClosure(c._id)}>Reject</button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title={`Audit Logs (${auditLogs.length})`}>
          {auditLogs.length === 0 ? <p className="text-sm text-gray-500">No logs</p> : (
            <ul className="text-xs space-y-2 max-h-40 overflow-auto">
              {auditLogs.slice(0,10).map(l => (
                <li key={l._id} className="border-b pb-1">
                  <div className="font-medium">{l.action}</div>
                  <div className="text-gray-500">{new Date(l.createdAt).toLocaleString()} • {l.actorRole}</div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      {/* Settlement list */}
      <div className="space-y-4">
        {loading ? (
          <GlassCard><p className="text-gray-500 text-sm">Loading...</p></GlassCard>
        ) : settlements.length === 0 ? (
          <GlassCard><p className="text-gray-500 text-sm">No settlements yet</p></GlassCard>
        ) : (
          settlements.map((s) => (
            <GlassCard key={s._id} className="p-0">
              <SettlementRow settlement={s} onPaid={handlePaid} />
            </GlassCard>
          ))
        )}
      </div>

      {/* Shops & revenue */}
      <div>
        <h2 className="text-lg font-semibold mt-6 mb-3">Shops & Revenue</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shops.length === 0 ? (
            <GlassCard><p className="text-sm text-gray-500">No shops yet</p></GlassCard>
          ) : shops.map(s => (
            <GlassCard key={s.shopId} title={s.shopName || 'Unnamed Shop'}>
              <p className="text-sm">Bookings: {s.bookings || 0}</p>
              <p className="text-lg font-semibold mt-2">₹{s.totalRevenue || 0}</p>
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Accept COD: <span className="font-medium">{(fullShops.find(f => f._id === s.shopId) || {}).acceptCOD ? 'Yes' : 'No'}</span></div>
                  <button className="px-3 py-1 border rounded text-sm" onClick={() => handleToggleAcceptCOD(s.shopId, (fullShops.find(f => f._id === s.shopId) || {}).acceptCOD)}>
                    Toggle COD
                  </button>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-red-600 text-white rounded text-sm" onClick={() => handleDeleteShop(s.shopId)} disabled={deletingShopId === s.shopId}>{deletingShopId === s.shopId ? 'Deleting...' : 'Delete Shop'}</button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold mt-6 mb-3">Recent Bookings</h2>
            <div className="flex items-center gap-3">
              <button className="text-sm px-3 py-1 border rounded" onClick={() => { const nv = !showHistory; setShowHistory(nv); setBookingsPage(1); loadBookings({ page: 1, showHistory: nv }); }}>{showHistory ? 'Hide History' : 'Show History'}</button>
            </div>
        </div>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end mb-4">
          <div>
            <label className="text-xs text-gray-500">Status</label>
            <select className="block mt-1 px-2 py-1 border rounded" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setBookingsPage(1); loadBookings({ page: 1, status: e.target.value }); }}>
              <option value="all">All</option>
              <option value="booked">Booked</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Shop</label>
            <select className="block mt-1 px-2 py-1 border rounded" value={filterShop} onChange={(e) => { setFilterShop(e.target.value); setBookingsPage(1); loadBookings({ page: 1, shopId: e.target.value }); }}>
              <option value="">All shops</option>
              {shops.map(s => <option key={s.shopId} value={s.shopId}>{s.shopName || s.shopId}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Phone</label>
            <input className="block mt-1 px-2 py-1 border rounded" placeholder="User phone" value={filterUserPhone} onChange={(e) => { setFilterUserPhone(e.target.value); }} onBlur={() => { setBookingsPage(1); loadBookings({ page: 1, userPhone: filterUserPhone }); }} />
          </div>

          <div>
            <label className="text-xs text-gray-500">Start</label>
            <input type="date" className="block mt-1 px-2 py-1 border rounded" value={filterStartDate} onChange={(e) => { setFilterStartDate(e.target.value); setBookingsPage(1); loadBookings({ page: 1, startDate: e.target.value }); }} />
          </div>

          <div>
            <label className="text-xs text-gray-500">End</label>
            <input type="date" className="block mt-1 px-2 py-1 border rounded" value={filterEndDate} onChange={(e) => { setFilterEndDate(e.target.value); setBookingsPage(1); loadBookings({ page: 1, endDate: e.target.value }); }} />
          </div>

          <div>
            <label className="text-xs text-gray-500">Per page</label>
            <select className="block mt-1 px-2 py-1 border rounded" value={bookingsLimit} onChange={(e) => { const l = Number(e.target.value); setBookingsLimit(l); setBookingsPage(1); loadBookings({ page: 1, limit: l }); }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          {displayedBookings.length === 0 ? (
            <GlassCard><p className="text-sm text-gray-500">No bookings</p></GlassCard>
          ) : (
            displayedBookings.map(b => (
              <GlassCard key={b._id} className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{b.userId?.name || b.memberName || 'Unknown'}</p>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                      b.source === 'OFFLINE' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {b.source === 'OFFLINE' ? '📱 OFFLINE' : '📲 APP'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{b.shopId?.name || '—'} • {new Date(b.slotStart).toLocaleString()}</p>
                  <p className="text-sm mt-1">{(b.services || []).map(s => s.name).join(', ')}</p>
                  {showHistory && <p className="text-xs mt-1">Status: <span className="font-medium">{b.status}</span></p>}
                </div>
                <div className="flex flex-col items-end">
                  <p className="font-semibold">₹{b.totalAmount || (b.payment && b.payment.amountPaid) || 0}</p>
                  <div className="flex gap-2 mt-2">
                    {/* Cancel button: show for active bookings */}
                    {['booked','in_progress'].includes(b.status) && (
                      <button className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded" onClick={() => handleCancelBooking(b._id)} disabled={cancellingBookingIds.has(b._id)}>{cancellingBookingIds.has(b._id) ? 'Cancelling...' : 'Cancel'}</button>
                    )}

                    {/* Refund: only for ONLINE bookings and not already refunded */}
                    {b.paymentMethod === 'ONLINE' && b.status !== 'refunded' && (
                      <button className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded" onClick={() => handleAdminRefund(b._id)}>
                        Refund
                      </button>
                    )}

                    {/* Flag: internal use */}
                    {!b.flagged && (
                      <button className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded" onClick={() => handleAdminFlag(b._id)}>
                        Flag
                      </button>
                    )}

                    <button className="px-3 py-1 border rounded text-sm" onClick={() => handleToggleUserCOD(b.userId?._id || b.userId)}>
                      { (b.userId && b.userId.codRestrictedUntil && new Date(b.userId.codRestrictedUntil) > new Date()) ? 'Allow COD' : 'Restrict COD' }
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-sm" onClick={() => handleDeleteUser(b.userId?._id || b.userId)} disabled={deletingUserIds.has(b.userId?._id || b.userId)}>{deletingUserIds.has(b.userId?._id || b.userId) ? 'Deleting...' : 'Delete User'}</button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border rounded" onClick={handlePrev} disabled={bookingsPage <= 1}>Prev</button>
              <button className="px-3 py-1 border rounded" onClick={handleNext} disabled={bookingsPage >= getTotalPages()}>Next</button>
              <span className="text-sm text-gray-600">Page</span>
              <input type="number" min={1} className="w-16 px-2 py-1 border rounded" value={bookingsPage} onChange={(e) => handlePageInputChange(e.target.value)} onBlur={handlePageInputBlur} />
              <span className="text-sm text-gray-600">of {getTotalPages()}</span>
            </div>
            <div className="text-sm text-gray-600">Total: {bookingsTotal}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat component removed (analytics cards moved out of this simplified admin view)

export default AdminDashboard;
