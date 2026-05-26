import { useEffect, useState } from "react";
import { useBarberGuard } from "../../hooks/useBarberGuard";
import TodayBookings from "./TodayBookings";
import UpcomingBookings from "./UpcomingBookings";
import OfflineBookingForm from "../../components/barber/OfflineBookingForm";
import { getBarberDashboard, getMyShop } from "../../api/barber.api";
import Layout from "../../components/Layout";
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { formatCurrency } from "../../utils/format";

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

  if (!data) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-neutral-400 text-lg">Loading dashboard…</div>
          <p className="text-body text-neutral-600">Loading dashboard…</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 p-4 pb-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-h2 font-bold text-neutral-900">{shop?.name || 'Dashboard'}</h1>
            <p className="text-body-small text-neutral-600 mt-1">Welcome back! Here's your business overview.</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bookings Today */}
            <Card shadow="lg" className="bg-white hover:shadow-xl transition-shadow">
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-label font-semibold text-neutral-600">Bookings Today</p>
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-bold">D</div>
                </div>
                <p className="text-h3 font-bold text-primary-700">{data.todayCount}</p>
              </CardBody>
            </Card>

            {/* Online Earnings */}
            <Card shadow="lg" className="bg-white hover:shadow-xl transition-shadow">
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-label font-semibold text-neutral-600">Online Earnings</p>
                  <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center text-accent-700 font-bold">₹</div>
                </div>
                <p className="text-h3 font-bold text-accent-700">{formatCurrency(data.onlineTotal)}</p>
              </CardBody>
            </Card>

            {/* COD Pending */}
            <Card shadow="lg" className="bg-white hover:shadow-xl transition-shadow">
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-label font-semibold text-neutral-600">COD Pending</p>
                  <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center text-warning-700 font-bold">!</div>
                </div>
                <p className="text-h3 font-bold text-warning-700">{formatCurrency(data.codPending)}</p>
              </CardBody>
            </Card>
          </div>

          {/* Settlement Card */}
          {data.todaySettlement && (
            <Card shadow="lg">
              <CardHeader className="bg-primary-700 text-white rounded-t-xl border-b-0 -mx-6 -mt-6 mb-0">
                <CardTitle>Today Settlement</CardTitle>
              </CardHeader>

              <CardBody className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                  <span className="text-body text-neutral-700">Online Earnings</span>
                  <span className="font-bold text-neutral-900">₹{data.todaySettlement.online}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                  <span className="text-body text-neutral-700">COD Received</span>
                  <span className="font-bold text-neutral-900">₹{data.todaySettlement.cod}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-primary-50 rounded-lg px-3">
                  <span className="font-semibold text-primary-900">Net Payout</span>
                  <span className="font-bold text-lg text-primary-700">₹{data.todaySettlement.online + data.todaySettlement.cod}</span>
                </div>
              </CardBody>

              <CardFooter className="text-caption text-neutral-500">
                💡 Settlement will be processed at 10:00 PM
              </CardFooter>
            </Card>
          )}

          {/* Offline Booking Form */}
          <div className="rounded-xl overflow-hidden">
            <OfflineBookingForm shop={shop} onBookingCreated={loadDashboard} />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-neutral-200">
            <Button
              variant={tab === 'today' ? 'primary' : 'ghost'}
              onClick={() => setTab('today')}
              className={tab === 'today' ? 'border-b-2 border-primary-600' : ''}
            >
              Today's Schedule
            </Button>
            <Button
              variant={tab === 'upcoming' ? 'primary' : 'ghost'}
              onClick={() => setTab('upcoming')}
              className={tab === 'upcoming' ? 'border-b-2 border-primary-600' : ''}
            >
              Upcoming
            </Button>
          </div>

          {/* Tab Content */}
          {tab === 'today' && <TodayBookings bookings={data.todayBookings} />}
          {tab === 'upcoming' && <UpcomingBookings bookings={data.upcomingBookings} />}
        </div>
      </div>
    </Layout>
  );
}

export default BarberDashboard;