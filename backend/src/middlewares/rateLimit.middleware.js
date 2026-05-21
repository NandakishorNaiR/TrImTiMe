const rateLimit = require('express-rate-limit');

/**
 * Global API rate limiter
 * 100 requests per 15 minutes per IP
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
        // Skip rate limiting for health check
        return req.path === '/api/health';
    }
});

/**
 * Strict limiter for authentication endpoints
 * 5 requests per 15 minutes per IP (prevents brute force)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many login/registration attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use user email as key if provided (additional protection)
        return (req.body && req.body.email) || req.ip;
    }
});

/**
 * Booking endpoint limiter
 * 10 booking requests per 5 minutes per user (prevents spam)
 */
const bookingLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message: 'Too many booking requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Rate limit by user ID if authenticated, otherwise by IP
        return (req.user && req.user.id) || req.ip;
    }
});

/**
 * Payment verification limiter
 * 20 requests per 10 minutes (gateway verification has costs)
 */
const paymentLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20,
    message: 'Too many payment requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => (req.user && req.user.id) || req.ip
});

module.exports = {
    globalLimiter,
    authLimiter,
    bookingLimiter,
    paymentLimiter
};