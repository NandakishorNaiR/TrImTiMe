import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getShops } from "../api/shop.api";
import ShopCard from "../components/shop/ShopCard";
import Layout from "../components/Layout";
import { Input, Button, Card, Badge } from "../components/ui";
import { SkeletonGrid } from "../components/ui/Skeleton";
import GenderPreferenceModal from "../components/auth/GenderPreferenceModal";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [serviceQuery, setServiceQuery] = useState("");
  const [sortBy, setSortBy] = useState("price_asc");
  const [servicesList, setServicesList] = useState([]);
  const [showGenderModal, setShowGenderModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getShops();
        setShops(data);
        // build unique services list
        const services = new Map();
        (data || []).forEach(shop => {
          (shop.services || []).forEach(s => services.set(s.name, s.name));
        });
        setServicesList(Array.from(services.values()));
      } catch (err) {
        console.error("Failed to load shops", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Show gender preference modal for authenticated customers without preference
  useEffect(() => {
    if (isAuthenticated) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.role === 'CUSTOMER' && !user.genderPreference) {
        setShowGenderModal(true);
      }
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Hero skeleton */}
          <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
          {/* Filter skeleton */}
          <div className="flex gap-3 flex-wrap">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse flex-1 min-w-[200px]" />
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32" />
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32" />
          </div>
          {/* Grid skeleton */}
          <SkeletonGrid count={6} />
        </div>
      </Layout>
    );
  }

  if (!Array.isArray(shops)) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-red-600 text-lg">Unable to load shops. Please try again later.</p>
        </div>
      </Layout>
    );
  }

  // filter + sort
  const filtered = shops.filter(shop => {
    if (query && !shop.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (serviceQuery) {
      const found = (shop.services || []).some(s => s.name.toLowerCase().includes(serviceQuery.toLowerCase()) || s.name === serviceQuery);
      if (!found) return false;
    }
    return true;
  });

  const withPrice = filtered.map(shop => {
    const minPrice = shop.services?.length ? Math.min(...shop.services.map(s => s.price)) : Number.POSITIVE_INFINITY;
    return { shop, minPrice };
  });

  withPrice.sort((a, b) => {
    if (sortBy === 'price_asc') return a.minPrice - b.minPrice;
    if (sortBy === 'price_desc') return b.minPrice - a.minPrice;
    if (sortBy === 'name_asc') return a.shop.name.localeCompare(b.shop.name);
    if (sortBy === 'name_desc') return b.shop.name.localeCompare(a.shop.name);
    return 0;
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-500 p-8 sm:p-12 md:p-16 shadow-2xl">
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-4xl">✂️</span>
              <h1 className="text-h2 font-bold text-white">TrimTime</h1>
            </div>
            <p className="text-4xl sm:text-5xl md:text-display font-bold text-white mb-4 sm:mb-6">
              Find Your Perfect Salon
            </p>
            <p className="text-primary-100 text-lg sm:text-xl mb-8 max-w-2xl leading-relaxed">
              Book appointments at verified salons. Best services, verified professionals, transparent pricing.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button 
                variant={isAuthenticated ? "secondary" : "primary"} 
                size="lg"
                onClick={() => !isAuthenticated && navigate('/login')}
                className="shadow-lg"
              >
                {isAuthenticated ? '✓ Start Booking' : 'Get Started'} →
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                className="text-white border-2 border-white hover:bg-white/10"
                onClick={() => document.querySelector('#shops-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Shops ↓
              </Button>
            </div>
          </div>
          {/* Decorative gradient shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mb-36 blur-3xl" />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card shadow="md" hover>
            <div className="text-center">
              <div className="text-h2 font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">{shops.length}+</div>
              <div className="text-body-small text-neutral-600 mt-2">Active Salons</div>
            </div>
          </Card>
          <Card shadow="md" hover>
            <div className="text-center">
              <div className="text-h2 font-bold bg-gradient-to-r from-success-600 to-accent-600 bg-clip-text text-transparent">24/7</div>
              <div className="text-body-small text-neutral-600 mt-2">Available</div>
          </GlassCard>
          <GlassCard className="text-center p-3 sm:p-4 md:p-6">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">⭐ 4.8</div>
            <div className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2">Avg Rating</div>
          </GlassCard>
          <GlassCard className="text-center p-3 sm:p-4 md:p-6">
            <div className="text-2xl sm:text-3xl font-bold text-amber-600">₹99+</div>
            <div className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2">Starting Price</div>
          </GlassCard>
        </div>

        {/* Search & Filter Section */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Discover Salons</h2>
          <GlassCard variant="subtle" className="p-4 sm:p-5 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <div className="sm:col-span-2">
                <Input 
                  placeholder="🔍 Search by salon name..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
              <select 
                value={serviceQuery} 
                onChange={(e) => setServiceQuery(e.target.value)} 
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 bg-white shadow-sm hover:border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">📋 All Services</option>
                {servicesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 bg-white shadow-sm hover:border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="price_asc">💰 Low → High</option>
                <option value="price_desc">💰 High → Low</option>
                <option value="name_asc">🔤 A → Z</option>
                <option value="name_desc">🔤 Z → A</option>
              </select>
            </div>
          </GlassCard>
        </div>

        {/* Shops Grid Section */}
        <div id="shops-section" className="space-y-6">
          {withPrice.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">No salons match your search. Try adjusting your filters.</p>
              <Button variant="secondary" onClick={() => {
                setQuery("");
                setServiceQuery("");
              }}>
                Reset Filters
              </Button>
            </GlassCard>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Showing <span className="font-semibold">{withPrice.length}</span> salon{withPrice.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {withPrice.map(({ shop }) => (
                  <ShopCard key={shop._id} shop={shop} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA Section for unauthenticated users */}
        {!isAuthenticated && (
          <GlassCard variant="accent" className="p-6 sm:p-8 md:p-12 text-center">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              Ready to book your appointment?
            </h3>
            <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6 max-w-2xl mx-auto">
              Sign up or log in with your phone number to start booking appointments instantly.
            </p>
            <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
              <Button 
                variant="primary" 
                size="md"
                onClick={() => navigate('/login')}
              >
                Sign In / Register
              </Button>
              <Button 
                variant="secondary" 
                size="md"
                onClick={() => document.querySelector('#shops-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Continue Browsing
              </Button>
            </div>
          </GlassCard>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <GlassCard className="p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">✓</div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Verified Salons</h3>
            <p className="text-gray-600 text-xs sm:text-sm">All salons are verified and rated by customers.</p>
          </GlassCard>
          <GlassCard className="p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">⏰</div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Instant Booking</h3>
            <p className="text-gray-600 text-xs sm:text-sm">Book appointments instantly with real-time slot availability.</p>
          </GlassCard>
          <GlassCard className="p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">💳</div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Secure Payments</h3>
            <p className="text-gray-600 text-xs sm:text-sm">Multiple payment options with secure, encrypted transactions.</p>
          </GlassCard>
        </div>
      </div>
      
      {/* Gender Preference Modal */}
      <GenderPreferenceModal isOpen={showGenderModal} onClose={() => setShowGenderModal(false)} />
    </Layout>
  );
};

export default Home;
