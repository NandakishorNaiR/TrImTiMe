import { useEffect, useState, useRef } from "react";
import { formatCurrency } from '../../utils/format';
import { getSettlements, markSettlementPaid, getDashboardStats, getShopStats, getAllShops, toggleShopAcceptCOD, deleteShop, deleteUser, cancelBooking, getClosures, getAuditLogs, getPlatformRevenue, getPlatformRevenueSeries, refundBooking, flagBooking, setUserCODRestriction, approveClosure, rejectClosure } from "../../api/admin.api";
import { getAllBookings } from "../../api/admin.api";
import SettlementRow from "../../components/admin/SettlementRow";
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 p-4 pb-12">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-h2 font-bold text-neutral-900">⚙️ Admin Dashboard</h1>
          <p className="text-body-small text-neutral-600 mt-1">Manage platform operations, settlements, and compliance</p>
        </div>

        {/* KPI Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card shadow="lg">
              <CardBody className="space-y-2">
                <p className="text-label font-semibold text-neutral-600">Total Customers</p>
                <p className="text-h3 font-bold text-primary-700">{stats.customers || 0}</p>
              </CardBody>
            </Card>

            <Card shadow="lg">
              <CardBody className="space-y-2">
                <p className="text-label font-semibold text-neutral-600">Total Barbers</p>
                <p className="text-h3 font-bold text-secondary-700">{stats.barbers || 0}</p>
              </CardBody>
            </Card>

            <Card shadow="lg">
              <CardBody className="space-y-2">
                <p className="text-label font-semibold text-neutral-600">Total Shops</p>
                <p className="text-h3 font-bold text-accent-700">{stats.shops || 0}</p>
              </CardBody>
            </Card>

            <Card shadow="lg">
              <CardBody className="space-y-2">
                <p className="text-label font-semibold text-neutral-600">Total Bookings</p>
                <p className="text-h3 font-bold text-info-700">{stats.bookings || 0}</p>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Financial Summary Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card shadow="lg">
              <CardBody>
                <p className="text-label font-semibold text-neutral-600 mb-2">Total Collected</p>
                <p className="text-h4 font-bold text-primary-700">{formatCurrency(stats.totalOnline || 0)}</p>
              </CardBody>
            </Card>

            <Card shadow="lg">
              <CardBody>
                <p className="text-label font-semibold text-neutral-600 mb-2">Platform Earnings</p>
                <p className="text-h4 font-bold text-success-700">{formatCurrency(stats.platformEarnings || 0)}</p>
              </CardBody>
            </Card>

            <Card shadow="lg">
              <CardBody>
                <p className="text-label font-semibold text-neutral-600 mb-2">COD Due</p>
                <p className="text-h4 font-bold text-danger-700">{formatCurrency(stats.codDue || 0)}</p>
              </CardBody>
            </Card>

            <Card shadow="lg">
              <CardBody>
                <p className="text-label font-semibold text-neutral-600 mb-2">Net Payout</p>
                <p className="text-h4 font-bold text-accent-700">{formatCurrency(stats.netPayout || 0)}</p>
              </CardBody>
            </Card>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => window.location.href = '/admin/closures'}
          >
            📋 Closures
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/admin/audit-logs'}
          >
            📝 Audit Logs
          </Button>
        </div>

        {/* Closures & Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Closures */}
          <Card shadow="lg">
            <CardHeader className="bg-gradient-to-r from-warning-500 to-danger-500 text-white rounded-t-xl">
              <CardTitle>Recent Closures ({closuresList.length})</CardTitle>
            </CardHeader>

            <CardBody>
              {closuresList.length === 0 ? (
                <p className="text-body-small text-neutral-600">No closures</p>
              ) : (
                <div className="space-y-2">
                  {closuresList.slice(0, 5).map(c => (
                    <div key={c._id} className="border-b border-neutral-200 pb-2 last:border-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">{c.shop?.name || 'Unknown'}</p>
                          <p className="text-caption text-neutral-600 mt-1">{new Date(c.date).toLocaleDateString()} • {c.reason || '—'}</p>
                        </div>
                        <Badge variant={
                          c.status === 'PENDING' ? 'warning' :
                          c.status === 'APPROVED' ? 'success' : 'danger'
                        }>
                          {c.status}
                        </Badge>
                      </div>
                      {c.status === 'PENDING' && (
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="success" onClick={() => handleApproveClosure(c._id)}>Approve</Button>
                          <Button size="sm" variant="danger" onClick={() => handleRejectClosure(c._id)}>Reject</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Audit Logs */}
          <Card shadow="lg">
            <CardHeader className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-t-xl">
              <CardTitle>Recent Activity ({auditLogs.length})</CardTitle>
            </CardHeader>

            <CardBody>
              {auditLogs.length === 0 ? (
                <p className="text-body-small text-neutral-600">No activity logs</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-auto">
                  {auditLogs.slice(0, 8).map(l => (
                    <div key={l._id} className="border-b border-neutral-200 pb-2 last:border-0">
                      <p className="font-medium text-neutral-900 text-sm">{l.action}</p>
                      <p className="text-caption text-neutral-600">
                        {l.actorRole} • {new Date(l.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Settlements */}
        <div className="space-y-3">
          <h2 className="text-h5 font-bold text-neutral-900">💰 Settlements</h2>
          {loading ? (
            <Card shadow="lg">
              <CardBody className="text-center py-8">
                <p className="text-body text-neutral-600">Loading settlements…</p>
              </CardBody>
            </Card>
          ) : settlements.length === 0 ? (
            <Card shadow="lg">
              <CardBody className="text-center py-8">
                <p className="text-5xl mb-3">📋</p>
                <p className="text-body text-neutral-700">No settlements yet</p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-2">
              {settlements.slice(0, 10).map((s) => (
                <Card key={s._id} shadow="md">
                  <CardBody className="p-0">
                    <SettlementRow settlement={s} onPaid={handlePaid} />
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Shops & Revenue */}
        <div className="space-y-3">
          <h2 className="text-h5 font-bold text-neutral-900">🏪 Shops & Revenue</h2>
          {shops.length === 0 ? (
            <Card shadow="lg">
              <CardBody className="text-center py-8">
                <p className="text-5xl mb-3">🏪</p>
                <p className="text-body text-neutral-700">No shops yet</p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shops.map(s => (
                <Card key={s.shopId} shadow="lg">
                  <CardHeader className="border-b border-neutral-200">
                    <CardTitle>{s.shopName || 'Unnamed Shop'}</CardTitle>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <div>
                      <p className="text-caption text-neutral-600">Bookings</p>
                      <p className="text-h5 font-bold text-primary-700">{s.bookings || 0}</p>
                    </div>
                    <div>
                      <p className="text-caption text-neutral-600">Revenue</p>
                      <p className="text-h4 font-bold text-accent-700">₹{s.totalRevenue || 0}</p>
                    </div>
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-body-small">Accept COD:</span>
                        <Badge variant={(fullShops.find(f => f._id === s.shopId) || {}).acceptCOD ? 'success' : 'secondary'}>
                          {(fullShops.find(f => f._id === s.shopId) || {}).acceptCOD ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleToggleAcceptCOD(s.shopId, (fullShops.find(f => f._id === s.shopId) || {}).acceptCOD)}
                      >
                        Toggle COD
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteShop(s.shopId)}
                        disabled={deletingShopId === s.shopId}
                      >
                        {deletingShopId === s.shopId ? 'Deleting...' : 'Delete Shop'}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-h5 font-bold text-neutral-900">📅 Bookings</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const nv = !showHistory;
                setShowHistory(nv);
                setBookingsPage(1);
                loadBookings({ page: 1, showHistory: nv });
              }}
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </Button>
          </div>

          {/* Filters */}
          <Card shadow="lg">
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-sm">
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setBookingsPage(1);
                    loadBookings({ page: 1, status: e.target.value });
                  }}
                  className="px-2 py-1 border border-neutral-300 rounded"
                >
                  <option value="all">All Status</option>
                  <option value="booked">Booked</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={filterShop}
                  onChange={(e) => {
                    setFilterShop(e.target.value);
                    setBookingsPage(1);
                    loadBookings({ page: 1, shopId: e.target.value });
                  }}
                  className="px-2 py-1 border border-neutral-300 rounded"
                >
                  <option value="">All Shops</option>
                  {shops.map(s => (
                    <option key={s.shopId} value={s.shopId}>{s.shopName || s.shopId}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Phone"
                  value={filterUserPhone}
                  onChange={(e) => setFilterUserPhone(e.target.value)}
                  onBlur={() => {
                    setBookingsPage(1);
                    loadBookings({ page: 1, userPhone: filterUserPhone });
                  }}
                  className="px-2 py-1 border border-neutral-300 rounded"
                />

                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => {
                    setFilterStartDate(e.target.value);
                    setBookingsPage(1);
                    loadBookings({ page: 1, startDate: e.target.value });
                  }}
                  className="px-2 py-1 border border-neutral-300 rounded"
                />

                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => {
                    setFilterEndDate(e.target.value);
                    setBookingsPage(1);
                    loadBookings({ page: 1, endDate: e.target.value });
                  }}
                  className="px-2 py-1 border border-neutral-300 rounded"
                />

                <select
                  value={bookingsLimit}
                  onChange={(e) => {
                    const l = Number(e.target.value);
                    setBookingsLimit(l);
                    setBookingsPage(1);
                    loadBookings({ page: 1, limit: l });
                  }}
                  className="px-2 py-1 border border-neutral-300 rounded"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </CardBody>
          </Card>

          {/* Bookings List */}
          <div className="space-y-2">
            {displayedBookings.length === 0 ? (
              <Card shadow="lg">
                <CardBody className="text-center py-8">
                  <p className="text-5xl mb-3">✓</p>
                  <p className="text-body text-neutral-700">No bookings found</p>
                </CardBody>
              </Card>
            ) : (
              displayedBookings.map(b => (
                <Card key={b._id} shadow="md">
                  <CardBody>
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-neutral-900">{b.userId?.name || 'Unknown'}</p>
                          <Badge variant={b.source === 'OFFLINE' ? 'secondary' : 'primary'}>
                            {b.source === 'OFFLINE' ? 'Offline' : 'App'}
                          </Badge>
                        </div>
                        <p className="text-body-small text-neutral-600">{b.shopId?.name || '—'}</p>
                        <p className="text-caption text-neutral-600 mt-1">{new Date(b.slotStart).toLocaleString()}</p>
                        <p className="text-body-small text-neutral-700 mt-2">{(b.services || []).map(s => s.name).join(', ')}</p>
                        {showHistory && <Badge variant="secondary" className="mt-2">{b.status}</Badge>}
                      </div>

                      <div className="flex-shrink-0">
                        <p className="text-h5 font-bold text-primary-700">₹{b.totalAmount || (b.payment && b.payment.amountPaid) || 0}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200">
                      {['booked','in_progress'].includes(b.status) && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleCancelBooking(b._id)}
                          disabled={cancellingBookingIds.has(b._id)}
                        >
                          {cancellingBookingIds.has(b._id) ? 'Cancelling...' : 'Cancel'}
                        </Button>
                      )}

                      {b.paymentMethod === 'ONLINE' && b.status !== 'refunded' && (
                        <Button
                          size="sm"
                          variant="info"
                          onClick={() => handleAdminRefund(b._id)}
                        >
                          Refund
                        </Button>
                      )}

                      {!b.flagged && (
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => handleAdminFlag(b._id)}
                        >
                          Flag
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleToggleUserCOD(b.userId?._id || b.userId)}
                      >
                        {(b.userId && b.userId.codRestrictedUntil && new Date(b.userId.codRestrictedUntil) > new Date()) ? 'Allow COD' : 'Restrict COD'}
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteUser(b.userId?._id || b.userId)}
                        disabled={deletingUserIds.has(b.userId?._id || b.userId)}
                      >
                        {deletingUserIds.has(b.userId?._id || b.userId) ? 'Deleting...' : 'Delete User'}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-neutral-200">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handlePrev} disabled={bookingsPage <= 1}>← Prev</Button>
              <Button variant="ghost" onClick={handleNext} disabled={bookingsPage >= getTotalPages()}>Next →</Button>
              <span className="text-body-small text-neutral-600 ml-2">Page</span>
              <input
                type="number"
                min={1}
                value={bookingsPage}
                onChange={(e) => handlePageInputChange(e.target.value)}
                onBlur={handlePageInputBlur}
                className="w-16 px-2 py-1 border border-neutral-300 rounded text-center"
              />
              <span className="text-body-small text-neutral-600">of {getTotalPages()}</span>
            </div>
            <span className="text-body-small text-neutral-600">Total: {bookingsTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat component removed (analytics cards moved out of this simplified admin view)

export default AdminDashboard;
