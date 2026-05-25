const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { globalLimiter, authLimiter, bookingLimiter } = require('./middlewares/rateLimit.middleware');
const app = express();

// ✅ SECURITY: Add security headers with Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    frameguard: { action: 'deny' }, // Prevent clickjacking
    noSniff: true, // Prevent MIME type sniffing
    xssFilter: true, // Enable XSS filter
    hsts: { 
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    }
}));

// allow cross-origin requests from the frontend dev server
const isDev = process.env.NODE_ENV !== 'production';
const corsOptions = isDev ? { origin: true, credentials: true } // reflect request origin during development
    :
    { origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true };
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Apply global rate limiter to all routes
app.use(globalLimiter);

// Mount admin routes
const adminRoutes = require('./routes/admin.routes');
app.use('/api/admin', adminRoutes);

// Mount booking routes (with booking-specific rate limiter)
const bookingRoutes = require('./routes/booking.routes');
app.use('/api/bookings', bookingLimiter, bookingRoutes);

// Mount auth routes (with strict rate limiter)
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authLimiter, authRoutes);

// Mount shop routes
const shopRoutes = require('./routes/shop.routes');
app.use('/api/shops', shopRoutes);

// Mount barber routes
const barberRoutes = require('./routes/barber.routes');
app.use('/api/barber', barberRoutes);

// Mount barber shop routes
const barberShopRoutes = require('./routes/barber.shop.routes');
app.use('/api/barber', barberShopRoutes);

// Mount barber closure routes (closures API)
const barberClosureRoutes = require('./routes/barber.closure.routes');
app.use('/api/barber', barberClosureRoutes);

// Mount notifications
const notificationRoutes = require('./routes/notification.routes');
app.use('/api/notifications', notificationRoutes);

// optional health route
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;