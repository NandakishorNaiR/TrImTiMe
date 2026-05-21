const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop.model');
const { calculateAvailableSlots } = require('../services/slot.service');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Optional auth middleware: extracts user if token provided, but doesn't require it
const optionalAuth = (req, res, next) => {
    try {
        const auth = req.headers.authorization || req.headers.Authorization;
        if (auth && auth.startsWith('Bearer ')) {
            const token = auth.split(' ')[1];
            const payload = jwt.verify(token, JWT_SECRET);
            req.user = {
                id: payload.id,
                role: payload.role,
                shopId: payload.shopId || null
            };
        }
    } catch (err) {
        // Ignore auth errors in optional middleware
    }
    next();
};

// Apply optional auth to shop routes
router.use(optionalAuth);

// GET all active shops, filtered by user gender preference if authenticated
router.get('/', async(req, res) => {
    try {
        let filter = { active: true };

        // If user is authenticated and has gender preference, filter shops
        if (req.user && req.user.id) {
            const User = require('../models/User.model');
            const user = await User.findById(req.user.id).lean();

            if (user && user.genderPreference) {
                const userGender = user.genderPreference; // MALE or FEMALE
                // User sees their matching type + UNISEX shops
                filter.type = { $in: [userGender, 'UNISEX'] };
            }
            // If authenticated but no preference, show all active shops (unfiltered)
            // This handles the case where user hasn't selected a preference yet
        }
        // If not authenticated, show only UNISEX shops (optional: change to no filter for guest browsing)
        else {
            filter.type = 'UNISEX';
        }

        const shops = await Shop.find(filter).lean();
        return res.json(shops);
    } catch (err) {
        console.error('GET /shops failed', err);
        return res.status(500).json({ message: 'Failed to fetch shops', error: err.message });
    }
});

// Debug: DB health check for shops (dev only)
router.get('/_dbcheck', async(req, res) => {
    try {
        const mongoose = require('mongoose');
        const ready = mongoose.connection.readyState; // 0 disconnected,1 connected
        let count = null;
        try {
            count = await Shop.countDocuments();
        } catch (e) {
            // ignore
        }
        return res.json({ readyState: ready, shopCount: count });
    } catch (err) {
        console.error('DB check failed', err);
        return res.status(500).json({ message: 'DB check failed', error: err.message });
    }
});

// GET shop by id
router.get('/:id', async(req, res) => {
    try {
        const shop = await Shop.findById(req.params.id).lean();
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        return res.json(shop);
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching shop' });
    }
});

// POST /:id/slots -> calculate available slots for a date
router.post('/:id/slots', async(req, res) => {
    try {
        console.log('POST /shops/:id/slots', { id: req.params.id, body: req.body });
        const shop = await Shop.findById(req.params.id).lean();
        console.log('Shop timings', shop && { openingTime: shop && shop.openingTime, closingTime: shop && shop.closingTime, slotBuffer: shop && shop.slotBuffer });
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        const { date, services, interval, duration } = req.body || {};

        // check for explicit shop closure
        const ShopClosure = require('../models/ShopClosure');
        const closed = await ShopClosure.findOne({ shop: shop._id, date, status: 'APPROVED' }).lean();
        if (closed) {
            return res.json({ closed: true, reason: closed.reason || 'Shop closed' });
        }

        // if duration provided but no services, create single service placeholder
        const svc = services && services.length ? services : (duration ? [{ duration }] : []);

        const slots = await calculateAvailableSlots({ shop, date, services: svc, interval: interval || 15 });
        console.log('Calculated slots count', Array.isArray(slots) ? slots.length : null);

        // Return full slot information including capacity details
        return res.json(slots);
    } catch (err) {
        return res.status(500).json({ message: 'Failed to calculate slots' });
    }
});

module.exports = router;