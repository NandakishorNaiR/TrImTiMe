import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from 'react';
import { getNotifications } from "../../api/notifications.api";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isAuthenticated) return setUnreadCount(0);
      try {
        const data = await getNotifications();
        if (!mounted) return;
        const unread = (data || []).filter(d => !d.read).length;
        setUnreadCount(unread);
      } catch (err) { console.error('load notifs', err); }
    };
    load();
    const t = setInterval(load, 15000);
    return () => { mounted = false; clearInterval(t); };
  }, [isAuthenticated]);

  return (
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur border-b">
      <div className="flex justify-between items-center px-4 md:px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl">✂️</span>
          <span className="font-bold text-lg hidden sm:inline">TrimTime</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 text-sm items-center flex-1 ml-8">
          {!(user && (user.role === "BARBER" || user.role === "ADMIN")) && (
            <>
              <NavItem to="/">Home</NavItem>
              <NavItem to="/my-bookings">Bookings</NavItem>
            </>
          )}
          {user && user.role === "ADMIN" && <NavItem to="/admin">Dashboard</NavItem>}
          {user && user.role === "BARBER" && (
            <>
              <NavItem to="/barber/today">Today</NavItem>
              <NavItem to="/barber/upcoming">Upcoming</NavItem>
              <NavItem to="/barber/shop-settings">Shop</NavItem>
            </>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 md:gap-4">
          {isAuthenticated && (
            <Link to="/notifications" className="relative p-2 rounded-full hover:bg-gray-100 transition">
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Profile Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={profileOpen}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold hover:shadow-lg transition"
                title={user?.name || 'Profile'}
              >
                {(user && user.name && user.name[0].toUpperCase()) || 'U'}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-200">
                    <div className="font-semibold text-gray-900">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-500 truncate">{user?.email || ''}</div>
                    {user?.role && (
                      <span className={`inline-block text-xs font-bold mt-2 px-2 py-1 rounded-full ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'BARBER' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </div>
                  <div className="p-2 space-y-1">
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-3 py-2 hover:bg-gray-50 rounded transition text-sm">
                      👤 Profile
                    </Link>
                    <Link to="/my-bookings" className="block px-3 py-2 hover:bg-gray-50 rounded transition text-sm">
                      📅 My Bookings
                    </Link>
                    {user && user.role === 'ADMIN' && (
                      <Link to="/admin" className="block px-3 py-2 hover:bg-gray-50 rounded transition text-sm">
                        📊 Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { setProfileOpen(false); logout(); navigate('/'); }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 rounded transition text-sm text-red-600 font-medium"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition">
              Login
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white/95 backdrop-blur animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 space-y-2">
            {!(user && (user.role === "BARBER" || user.role === "ADMIN")) && (
              <>
                <MobileNavItem to="/" onClick={() => setMobileMenuOpen(false)}>Home</MobileNavItem>
                <MobileNavItem to="/my-bookings" onClick={() => setMobileMenuOpen(false)}>My Bookings</MobileNavItem>
              </>
            )}
            {user && user.role === "ADMIN" && (
              <MobileNavItem to="/admin" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileNavItem>
            )}
            {user && user.role === "BARBER" && (
              <>
                <MobileNavItem to="/barber/today" onClick={() => setMobileMenuOpen(false)}>Today</MobileNavItem>
                <MobileNavItem to="/barber/upcoming" onClick={() => setMobileMenuOpen(false)}>Upcoming</MobileNavItem>
                <MobileNavItem to="/barber/shop-settings" onClick={() => setMobileMenuOpen(false)}>Shop Settings</MobileNavItem>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `py-2 text-sm font-medium transition
       ${
         isActive
           ? "border-b-2 border-blue-600 text-blue-600"
           : "text-gray-600 hover:text-gray-900"
       }`
    }
  >
    {children}
  </NavLink>
);

const MobileNavItem = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `block px-3 py-2 rounded-lg text-sm font-medium transition ${
        isActive
          ? "bg-blue-100 text-blue-700"
          : "text-gray-700 hover:bg-gray-100"
      }`
    }
  >
    {children}
  </NavLink>
);

export default Navbar;
