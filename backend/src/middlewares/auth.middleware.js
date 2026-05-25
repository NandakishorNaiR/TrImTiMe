const jwt = require('jsonwebtoken');
const { getClientIP, getUserAgent, generateDeviceFingerprint, validateSession } = require('../utils/auth.utils');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// roles: array of allowed roles, e.g. ["BARBER","ADMIN"]. If empty, allow any authenticated user.
const requireAuth = (roles = []) => {
    return async(req, res, next) => {
        try {
            const auth = req.headers.authorization || req.headers.Authorization;
            if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

            const token = auth.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);

            // role check
            if (roles.length && !roles.includes(payload.role)) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            // ✅ SECURITY: Validate session for this device
            const userAgent = getUserAgent(req);
            const ipAddress = getClientIP(req);
            const deviceFingerprint = generateDeviceFingerprint(userAgent, ipAddress);

            const sessionValid = await validateSession(payload.id, deviceFingerprint);
            if (!sessionValid) {
                return res.status(401).json({ message: 'Invalid session. Please login again.' });
            }

            // inject user
            req.user = {
                id: payload.id,
                role: payload.role,
                shopId: payload.shopId || null,
                deviceFingerprint // Store for reference
            };

            // If barber token doesn't include shopId (older token), fetch from DB to ensure shop routes work
            if ((!req.user.shopId) && req.user.role === 'BARBER') {
                try {
                    const User = require('../models/User.model');
                    const user = await User.findById(req.user.id).lean();
                    if (user && user.shopId) req.user.shopId = user.shopId;
                } catch (e) {
                    // ignore DB lookup failures; proceed with whatever we have
                }
            }

            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired. Please login again.' });
            }
            return res.status(401).json({ message: 'Invalid token' });
        }
    };
};

// default export: middleware that requires authentication but no specific role
module.exports = requireAuth();
module.exports.requireAuth = requireAuth;