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
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-700 p-8 sm:p-12 md:p-16 shadow-2xl">
          <div className="relative z-10">
            <div className="mb-6 inline-block px-4 py-2 bg-secondary-500/20 rounded-full border border-secondary-400/30">
              <span className="text-secondary-300 text-sm font-semibold tracking-wider">Professional Salon Management</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-display font-bold text-white mb-4 sm:mb-6">
              Book Your Perfect Appointment
            </h1>
            <p className="text-primary-100 text-lg sm:text-xl mb-8 max-w-2xl leading-relaxed">
              Discover verified salons with real-time availability. Transparent pricing, professional services, secure payments.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button 
                variant={isAuthenticated ? "secondary" : "primary"} 
                size="lg"
                onClick={() => !isAuthenticated && navigate('/login')}
                className="shadow-lg"
              >
                {isAuthenticated ? 'Start Booking' : 'Get Started'} →
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                className="text-white border-2 border-white hover:bg-white/10"
                onClick={() => document.querySelector('#shops-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Salons ↓
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
              <div className="text-h2 font-bold text-primary-700 mb-2">{shops.length}+</div>
              <p className="text-body-small text-neutral-600">Verified Salons</p>
            </div>
          </Card>
          <Card shadow="md" hover>
            <div className="text-center">
              <div className="text-h2 font-bold text-secondary-600 mb-2">24/7</div>
              <p className="text-body-small text-neutral-600">Always Available</p>
            </div>
          </Card>
          <Card shadow="md" hover>
            <div className="text-center">
              <div className="text-h2 font-bold text-accent-600 mb-2">4.8★</div>
              <p className="text-body-small text-neutral-600">Average Rating</p>
            </div>
          </Card>
          <Card shadow="md" hover>
            <div className="text-center">
              <div className="text-h2 font-bold text-success-600 mb-2">₹99+</div>
              <p className="text-body-small text-neutral-600">Starting From</p>
            </div>
          </Card>
        </div>

        {/* Search & Filter Section */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">Find Salons Near You</h2>
          <Card shadow="lg" className="p-4 sm:p-5 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <Input 
                  placeholder="Search by salon name..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
              <select 
                value={serviceQuery} 
                onChange={(e) => setServiceQuery(e.target.value)} 
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-neutral-300 bg-white shadow-sm hover:border-neutral-400 transition focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-sm"
              >
                <option value="">All Services</option>
                {servicesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-neutral-300 bg-white shadow-sm hover:border-neutral-400 transition focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-sm"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>
          </Card>
        </div>

        {/* Shops Grid Section */}
        <div id="shops-section" className="space-y-6">
          {withPrice.length === 0 ? (
            <Card shadow="lg" className="p-12 text-center">
              <div className="mb-4">
                <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-neutral-600 text-xl">—</span>
                </div>
              </div>
              <p className="text-neutral-600 text-lg mb-6">No salons match your search criteria.</p>
              <Button variant="secondary" onClick={() => {
                setQuery("");
                setServiceQuery("");
              }}>
                Reset Filters
              </Button>
            </Card>
          ) : (
            <div>
              <p className="text-sm text-neutral-600 mb-4">
                Showing <span className="font-semibold text-neutral-900">{withPrice.length}</span> salon{withPrice.length !== 1 ? 's' : ''}
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
          <Card shadow="lg" className="p-8 sm:p-12 bg-gradient-to-br from-secondary-50 to-primary-50 border border-secondary-200">
            <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
              Ready to Book?
            </h3>
            <p className="text-neutral-700 text-base sm:text-lg mb-8 max-w-2xl">
              Create an account and start booking appointments at your preferred salons. Fast, secure, and convenient.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate('/login')}
              >
                Sign In / Register
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => document.querySelector('#shops-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Continue Browsing
              </Button>
            </div>
          </Card>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card shadow="md" className="p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-700 font-bold">✓</span>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Verified Professionals</h3>
            <p className="text-neutral-600 text-sm">All salons and barbers are verified and rated by customers.</p>
          </Card>
          <Card shadow="md" className="p-6 text-center">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-secondary-700 font-bold">⏱</span>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Real-Time Availability</h3>
            <p className="text-neutral-600 text-sm">Book appointments instantly with live slot availability.</p>
          </Card>
          <Card shadow="md" className="p-6 text-center">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-accent-700 font-bold">🔒</span>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Secure Payments</h3>
            <p className="text-neutral-600 text-sm">Multiple payment options with secure, encrypted transactions.</p>
          </Card>
        </div>
      </div>
      
      {/* Gender Preference Modal */}
      <GenderPreferenceModal isOpen={showGenderModal} onClose={() => setShowGenderModal(false)} />
    </Layout>
  );
};

export default Home;
