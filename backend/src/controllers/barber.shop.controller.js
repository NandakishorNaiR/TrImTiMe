const Shop = require("../models/Shop.model");
const User = require("../models/User.model");
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = '7d';

exports.createShop = async(req, res) => {
    try {
        const barber = await User.findById(req.user.id);
        if (!barber) return res.status(404).json({ message: "User not found" });

        // prevent duplicate
        if (barber.shopId || barber.shop) {
            return res.status(400).json({ message: "Shop already exists" });
        }

        const allowed = [
            "name",
            "type",
            "phone",
            "address",
            "openingTime",
            "closingTime",
            "depositRequired",
            "depositAmount",
            "acceptCOD",
            "chairs",
            "slotBuffer"
        ];

        const payload = {};
        allowed.forEach((k) => {
            if (req.body[k] !== undefined) payload[k] = req.body[k];
        });

        // basic required fields
        if (!payload.name || !payload.type) return res.status(400).json({ message: "Invalid shop data" });

        const shop = await Shop.create(payload);

        barber.shopId = shop._id;
        barber.shop = shop._id;
        await barber.save();

        // issue a new token so the frontend has updated shopId in payload
        const tokenPayload = {
            id: barber._id,
            role: barber.role || 'BARBER',
            shopId: barber.shopId || null
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return res.json({ shop, token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Optional helper — fetch barber's shop (delegates to existing controller but kept here for completeness)
exports.getMyShop = async(req, res) => {
    try {
        const barber = await User.findById(req.user.id).populate('shop');
        return res.json(barber ? barber.shop : null);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update barber's shop details (including acceptCOD)
exports.updateMyShop = async(req, res) => {
    try {
        const barber = await User.findById(req.user.id);
        if (!barber) return res.status(404).json({ message: 'User not found' });

        const shopId = barber.shopId || barber.shop;
        if (!shopId) return res.status(404).json({ message: 'Shop not found for user' });

        const shop = await Shop.findById(shopId);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        const allowed = [
            "name",
            "type",
            "phone",
            "address",
            "openingTime",
            "closingTime",
            "depositRequired",
            "depositAmount",
            "acceptCOD",
            "chairs",
            "slotBuffer"
        ];

        allowed.forEach((k) => {
            if (req.body[k] !== undefined) shop[k] = req.body[k];
        });

        await shop.save();

        return res.json(shop);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get aggregated stats for the barber's shop
exports.getMyShopStats = async(req, res) => {
    try {
        const barber = await User.findById(req.user.id);
        if (!barber) return res.status(404).json({ message: 'User not found' });
        const shopId = barber.shopId || barber.shop;
        if (!shopId) return res.status(404).json({ message: 'Shop not found for user' });

        const Booking = require('../models/Booking.model');
        const PLATFORM_FEE = 7;
        const excludedStatuses = ['cancelled', 'CANCELLED_BY_SHOP', 'CANCELLED_BY_ADMIN'];

        const agg = await Booking.aggregate([
            { $match: { shopId: shopId, status: { $nin: excludedStatuses } } },
            {
                $group: {
                    _id: null,
                    onlineRevenue: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'ONLINE'] }, { $ifNull: ['$totalAmount', 0] }, 0] } },
                    onlineCount: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'ONLINE'] }, 1, 0] } },
                    codCount: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'COD'] }, 1, 0] } },
                    codValue: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'COD'] }, { $ifNull: ['$totalAmount', 0] }, 0] } },
                    totalBookings: { $sum: 1 }
                }
            }
        ]);

        const row = (agg && agg[0]) || { onlineRevenue: 0, onlineCount: 0, codCount: 0, codValue: 0, totalBookings: 0 };
        const platformFeeTotal = (row.totalBookings || 0) * PLATFORM_FEE;
        const payout = (row.onlineRevenue || 0) - ((row.onlineCount || 0) * PLATFORM_FEE);
        const codDue = (row.codCount || 0) * PLATFORM_FEE;

        return res.json({
            shopId,
            onlineRevenue: row.onlineRevenue || 0,
            codValue: row.codValue || 0,
            onlineCount: row.onlineCount || 0,
            codCount: row.codCount || 0,
            platformFeeTotal,
            payout,
            codDue
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};