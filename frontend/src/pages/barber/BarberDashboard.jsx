import { useEffect, useState } from "react";
import { useBarberGuard } from "../../hooks/useBarberGuard";
import TodayBookings from "./TodayBookings";
import UpcomingBookings from "./UpcomingBookings";
import OfflineBookingForm from "../../components/barber/OfflineBookingForm";
import { getBarberDashboard, getMyShop } from "../../api/barber.api";
import Layout from "../../components/Layout";
import GlassCard from "../../components/ui/GlassCard";
import { formatCurrency } from "../../utils/format";
import Button from "../../components/Button";

const BarberDashboard = () => {
  useBarberGuard();
  const [data, setData] = useState(null);
  const [shop, setShop] = useState(null);
  const [tab, setTab] = useState('today');

  const loadDashboard = async () => {
    try {
      const res = await getBarberDashboard();
      setData(res);
    } catch (e) {
      console.error('Failed to load dashboard', e);
      setData({
        todayCount: 0,
        onlineTotal: 0,
        codPending: 0,
        todayBookings: [],
        upcomingBookings: [],
      });
    }
  };

  const loadShop = async () => {
    try {
      const shopData = await getMyShop();
      setShop(shopData);
    } catch (e) {
      console.error('Failed to load shop', e);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadShop();

    // Listen for booking updates and refresh dashboard
    const handleBookingUpdate = () => {
      loadDashboard();
    };
    window.addEventListener('bookingUpdated', handleBookingUpdate);
    return () => window.removeEventListener('bookingUpdated', handleBookingUpdate);
  }, []);

  if (!data) return <div className="p-4">Loading dashboard…</div>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-4">{shop?.name ? `${shop.name} Dashboard` : 'Salon Dashboard'}</h1>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <GlassCard title="Bookings Today"><div className="text-2xl font-bold">{data.todayCount}</div></GlassCard>
          <GlassCard title="Online Earnings"><div className="text-2xl font-bold">{formatCurrency(data.onlineTotal)}</div></GlassCard>
          <GlassCard title="COD Pending"><div className="text-2xl font-bold">{formatCurrency(data.codPending)}</div></GlassCard>
        </div>

        <SettlementCard settlement={data.todaySettlement} />

        <OfflineBookingForm shop={shop} onBookingCreated={loadDashboard} />

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2" role="tablist" aria-label="Booking tabs">
            <Button variant={tab === 'today' ? 'primary' : 'ghost'} onClick={() => setTab('today')} aria-pressed={tab === 'today'}>Today</Button>
            <Button variant={tab === 'upcoming' ? 'primary' : 'ghost'} onClick={() => setTab('upcoming')} aria-pressed={tab === 'upcoming'}>Upcoming</Button>
          </div>
        </div>

        {tab === 'today' && <TodayBookings bookings={data.todayBookings} />}
        {tab === 'upcoming' && <UpcomingBookings bookings={data.upcomingBookings} />}
      </div>
    </Layout>
  );
};

const SummaryBox = ({ label, value }) => (
  <div className="border rounded-xl p-3 text-center">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

const SettlementCard = ({ settlement }) => {
  if (!settlement) return null;

  return (
    <div className="border rounded-xl p-4 mb-6 bg-gray-50">
      <h3 className="font-semibold mb-3">Today Settlement</h3>

      <div className="text-sm space-y-2">
        <Row label="Online earnings" value={`₹${settlement.online}`} />
        <Row label="COD received" value={`₹${settlement.cod}`} />
        <hr />
        <Row
          label="Net payout"
          value={`₹${settlement.online - settlement.cod}`}
          bold
        />
      </div>

      <p className="text-xs text-gray-500 mt-3">Settlement will be processed at 10:00 PM</p>
    </div>
  );
};

const Row = ({ label, value, bold }) => (
  <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default BarberDashboard;
