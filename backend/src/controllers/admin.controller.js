const ShopClosure = require('../models/ShopClosure');
const AuditLog = require('../models/AuditLog');
const Booking = require('../models/Booking.model');
const refundService = require('../services/refund.service');
const notificationService = require('../services/notification.service');
const User = require('../models/User.model');

exports.getAllClosures = async(req, res) => {
    try {
        const closures = await ShopClosure.find().populate('shop').lean();
        return res.json(closures);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.approveClosure = async(req, res) => {
    try {
        const closure = await ShopClosure.findById(req.params.id);
        if (!closure) return res.status(404).json({ message: 'Closure not found' });
        if (closure.status !== 'PENDING') return res.status(400).json({ message: 'Closure not pending' });

        closure.status = 'APPROVED';
        await closure.save();

        await AuditLog.create({
            actorRole: 'ADMIN',
            actorId: req.user.id,
            action: 'APPROVE_CLOSURE',
            entity: 'ShopClosure',
            entityId: closure._id,
            metadata: { date: closure.date }
        });

        // perform cancellations and initiate refunds
        const start = new Date(`${closure.date}T00:00:00.000Z`);
        const end = new Date(`${closure.date}T23:59:59.999Z`);

        const bookings = await Booking.find({
            shopId: closure.shop,
            slotStart: { $gte: start, $lte: end },
            status: { $in: ['booked'] }
        });

        for (const booking of bookings) {
            booking.status = 'CANCELLED_BY_SHOP';
            booking.cancellation = booking.cancellation || {};
            booking.cancellation.cancelledAt = new Date();
            booking.cancellation.refundPercent = 1;

            // initiate refund tracking
            booking.refund = booking.refund || {};
            booking.refund.status = 'INITIATED';
            booking.refund.amount = (booking.payment && booking.payment.amountPaid) || booking.totalAmount || 0;

            await booking.save();

            await AuditLog.create({
                actorRole: 'ADMIN',
                actorId: req.user.id,
                action: 'CANCEL_BOOKING_DUE_TO_CLOSURE',
                entity: 'Booking',
                entityId: booking._id,
                metadata: { closure: closure._id }
            });

            // start refund (async)
            refundService.initiateRefund(booking);

            // notify customer about cancellation
            try {
                await notificationService.sendInAppNotification({
                    userId: booking.userId,
                    title: 'Booking Cancelled',
                    message: `Your booking on ${closure.date} has been cancelled due to shop closure.`,
                    type: 'CANCELLATION'
                });
            } catch (e) { console.error('notify customer cancel failed', e); }

            // notify barber users for this shop
            try {
                const barbers = await User.find({ role: 'BARBER', shopId: closure.shop }).lean();
                for (const b of barbers) {
                    await notificationService.sendInAppNotification({
                        userId: b._id,
                        title: 'Shop Closure — Booking Cancelled',
                        message: `Bookings for ${closure.date} were cancelled (closure approved).`,
                        type: 'SYSTEM'
                    });
                }
            } catch (e) { console.error('notify barbers failed', e); }
        }

        return res.json({ message: 'Closure approved and refunds initiated', affected: bookings.length });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.rejectClosure = async(req, res) => {
    try {
        const closure = await ShopClosure.findById(req.params.id);
        if (!closure) return res.status(404).json({ message: 'Closure not found' });
        if (closure.status !== 'PENDING') return res.status(400).json({ message: 'Closure not pending' });

        closure.status = 'REJECTED';
        await closure.save();

        await AuditLog.create({
            actorRole: 'ADMIN',
            actorId: req.user.id,
            action: 'REJECT_CLOSURE',
            entity: 'ShopClosure',
            entityId: closure._id,
            metadata: { date: closure.date }
        });

        return res.json({ message: 'Closure rejected' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getAuditLogs = async(req, res) => {
    try {
        const AuditLog = require('../models/AuditLog');
        const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(500).lean();
        return res.json(logs);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};
const Shop = require("../models/Shop.model");
const Settlement = require("../models/Settlement.model");

// 1️⃣ ALL SHOPS
exports.getAllShops = async(req, res) => {
    try {
        const shops = await Shop.find().sort({ createdAt: -1 });
        res.json(shops);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 2️⃣ ENABLE / DISABLE SHOP
exports.toggleShopStatus = async(req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        shop.active = !shop.active;
        await shop.save();

        res.json({ message: `Shop ${shop.active ? "enabled" : "disabled"}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 3️⃣ ALL BOOKINGS (FILTERABLE LATER)
exports.getAllBookings = async(req, res) => {
    try {
        const {
            page = 1,
                limit = 20,
                status,
                shopId,
                userId,
                userPhone,
                startDate,
                endDate,
                sort = 'createdAt'
        } = req.query;

        const query = {};
        if (status && status !== 'all') {
            // support comma separated statuses
            const statuses = status.split(',');
            query.status = { $in: statuses };
        }
        if (shopId) query.shopId = shopId;
        if (userId) query.userId = userId;

        // date filter on slotStart
        if (startDate || endDate) {
            query.slotStart = {};
            if (startDate) query.slotStart.$gte = new Date(startDate);
            if (endDate) {
                const d = new Date(endDate);
                d.setHours(23, 59, 59, 999);
                query.slotStart.$lte = d;
            }
        }

        // if userPhone provided, find matching user
        if (userPhone && !userId) {
            const u = await User.findOne({ phone: userPhone }).lean();
            if (u) query.userId = u._id;
            else query.userId = null; // no results
        }

        const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

        const [total, bookings] = await Promise.all([
            Booking.countDocuments(query),
            Booking.find(query)
            .populate('shopId', 'name')
            .populate('userId', 'name phone codRestrictedUntil')
            .sort({
                [sort]: -1
            })
            .skip(skip)
            .limit(Number(limit))
            .lean()
        ]);

        return res.json({ total, page: Number(page), limit: Number(limit), bookings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 4️⃣ VIEW SETTLEMENTS
exports.getSettlements = async(req, res) => {
    try {
        const settlements = await Settlement.find()
            .populate("shopId", "name")
            .sort({ date: -1 });

        res.json(settlements);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 5️⃣ MARK SETTLEMENT PAID (MANUAL PAYOUT)
exports.markSettlementPaid = async(req, res) => {
    try {
        const settlement = await Settlement.findById(req.params.id);
        if (!settlement) return res.status(404).json({ message: "Settlement not found" });

        settlement.status = "paid";
        settlement.paidAt = new Date();
        await settlement.save();

        res.json({ message: "Settlement marked as paid" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 6️⃣ ADJUST USER PRIORITY
exports.adjustUserPriority = async(req, res) => {
    try {
        const { delta } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.priorityScore = Math.max(0, Math.min(150, user.priorityScore + delta));
        await user.save();

        res.json({ message: "Priority updated", priorityScore: user.priorityScore });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 7️⃣ BLOCK USER (EXTREME CASE)
exports.blockUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.priorityScore = 0;
        await user.save();

        res.json({ message: "User blocked from booking" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE USER
exports.deleteUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.deleteOne({ _id: user._id });

        await AuditLog.create({
            actorRole: 'ADMIN',
            actorId: req.user.id,
            action: 'DELETE_USER',
            entity: 'User',
            entityId: user._id
        });

        return res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// DELETE SHOP
exports.deleteShop = async(req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        // Cancel active/future bookings for this shop and initiate refunds
        const start = new Date();
        // find bookings that are booked or in_progress
        const bookings = await Booking.find({ shopId: shop._id, status: { $in: ['booked', 'in_progress'] } });

        for (const booking of bookings) {
            booking.status = 'CANCELLED_BY_ADMIN';
            booking.cancellation = booking.cancellation || {};
            booking.cancellation.cancelledAt = new Date();
            booking.cancellation.refundPercent = 1;

            booking.refund = booking.refund || {};
            booking.refund.status = 'INITIATED';
            booking.refund.amount = (booking.payment && booking.payment.amountPaid) || booking.totalAmount || 0;

            await booking.save();

            await AuditLog.create({
                actorRole: 'ADMIN',
                actorId: req.user.id,
                action: 'CANCEL_BOOKING_DUE_TO_SHOP_DELETE',
                entity: 'Booking',
                entityId: booking._id,
                metadata: { shop: shop._id }
            });

            // initiate refund async
            try { refundService.initiateRefund(booking); } catch (e) { console.error('refund start failed', e); }

            // notify customer
            try {
                await notificationService.sendInAppNotification({
                    userId: booking.userId,
                    title: 'Booking Cancelled',
                    message: `Your booking at ${shop.name} has been cancelled because the shop was removed by admin.`,
                    type: 'CANCELLATION'
                });
            } catch (e) { console.error('notify customer failed', e); }
        }

        // delete the shop record
        await Shop.deleteOne({ _id: shop._id });

        await AuditLog.create({
            actorRole: 'ADMIN',
            actorId: req.user.id,
            action: 'DELETE_SHOP',
            entity: 'Shop',
            entityId: shop._id
        });

        return res.json({ message: 'Shop deleted and related bookings cancelled', cancelled: bookings.length });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// CANCEL BOOKING (admin)
exports.cancelBooking = async(req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status !== 'booked' && booking.status !== 'in_progress') {
            return res.status(400).json({ message: 'Booking cannot be cancelled' });
        }

        booking.status = 'CANCELLED_BY_ADMIN';
        booking.cancellation = booking.cancellation || {};
        booking.cancellation.cancelledAt = new Date();
        booking.cancellation.refundPercent = 1;

        // mark refund
        booking.refund = booking.refund || {};
        booking.refund.status = 'INITIATED';
        booking.refund.amount = (booking.payment && booking.payment.amountPaid) || booking.totalAmount || 0;

        await booking.save();

        await AuditLog.create({
            actorRole: 'ADMIN',
            actorId: req.user.id,
            action: 'CANCEL_BOOKING_ADMIN',
            entity: 'Booking',
            entityId: booking._id
        });

        // initiate refund async
        try { refundService.initiateRefund(booking); } catch (e) { console.error('refund start failed', e); }

        // notify customer about cancellation
        try {
            await notificationService.sendInAppNotification({
                userId: booking.userId,
                title: 'Booking Cancelled',
                message: 'Your booking has been cancelled by admin and refund is being processed.',
                type: 'CANCELLATION'
            });
        } catch (e) { console.error('notify customer cancel failed', e); }

        // If ONLINE payment, notify refund initiated
        try {
            if (booking.paymentMethod === 'ONLINE' || booking.paymentMode === 'ONLINE') {
                await notificationService.sendInAppNotification({
                    userId: booking.userId,
                    title: 'Refund Initiated',
                    message: 'Your refund has been initiated and is being processed.',
                    type: 'REFUND_INIT'
                });
            }
        } catch (e) { console.error('notify refund initiated failed', e); }

        return res.json({ message: 'Booking cancelled and refund initiated' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// SHOPS WITH REVENUE STATS
exports.getShopStats = async(req, res) => {
    try {
        // Platform fee per booking (constant)
        const PLATFORM_FEE = 7;
        // exclude fully-cancelled bookings
        const excludedStatuses = ['cancelled', 'CANCELLED_BY_SHOP', 'CANCELLED_BY_ADMIN'];

        const stats = await Booking.aggregate([
            { $match: { status: { $nin: excludedStatuses } } },
            {
                $group: {
                    _id: '$shopId',
                    onlineRevenue: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'ONLINE'] }, { $ifNull: ['$totalAmount', 0] }, 0] } },
                    onlineCount: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'ONLINE'] }, 1, 0] } },
                    codCount: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'COD'] }, 1, 0] } },
                    codValue: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'COD'] }, { $ifNull: ['$totalAmount', 0] }, 0] } },
                    totalBookings: { $sum: 1 }
                }
            },
            { $lookup: { from: 'shops', localField: '_id', foreignField: '_id', as: 'shop' } },
            { $unwind: { path: '$shop', preserveNullAndEmptyArrays: true } },
            { $match: { shop: { $ne: null } } },
            {
                $project: {
                    shopId: '$_id',
                    shopName: '$shop.name',
                    onlineRevenue: 1,
                    onlineCount: 1,
                    codCount: 1,
                    codValue: 1,
                    totalBookings: 1,
                    platformFeeTotal: { $multiply: ['$totalBookings', PLATFORM_FEE] },
                    payout: { $subtract: ['$onlineRevenue', { $multiply: ['$onlineCount', PLATFORM_FEE] }] },
                    codDue: { $multiply: ['$codCount', PLATFORM_FEE] }
                }
            }
        ]);

        return res.json(stats || []);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PLATFORM REVENUE (total)
exports.getPlatformRevenue = async(req, res) => {
    try {
        // Platform fee per booking
        const PLATFORM_FEE = 7;
        // exclude fully-cancelled bookings
        const excludedStatuses = ['cancelled', 'CANCELLED_BY_SHOP', 'CANCELLED_BY_ADMIN'];

        // total bookings considered
        const totalBookings = await Booking.countDocuments({ status: { $nin: excludedStatuses } });

        // online bookings: sum totalAmount and count
        const onlineAgg = await Booking.aggregate([
            { $match: { status: { $nin: excludedStatuses }, paymentMethod: 'ONLINE' } },
            { $group: { _id: null, totalOnline: { $sum: { $ifNull: ['$totalAmount', 0] } }, count: { $sum: 1 } } }
        ]);
        const onlineRow = (onlineAgg && onlineAgg[0]) || { totalOnline: 0, count: 0 };

        // COD bookings: count and total value
        const codAgg = await Booking.aggregate([
            { $match: { status: { $nin: excludedStatuses }, paymentMethod: 'COD' } },
            { $group: { _id: null, totalCOD: { $sum: { $ifNull: ['$totalAmount', 0] } }, count: { $sum: 1 } } }
        ]);
        const codRow = (codAgg && codAgg[0]) || { totalCOD: 0, count: 0 };

        const platformEarnings = totalBookings * PLATFORM_FEE; // platform earns fee for every booking
        const totalOnlineRevenue = onlineRow.totalOnline || 0;
        const onlineCount = onlineRow.count || 0;
        const codDue = (codRow.count || 0) * PLATFORM_FEE;
        const codValue = codRow.totalCOD || 0;
        const netPayout = totalOnlineRevenue - (onlineCount * PLATFORM_FEE);

        return res.json({
            totalBookings,
            totalOnlineRevenue,
            codValue,
            platformEarnings,
            codDue,
            netPayout,
            onlineCount,
            codCount: codRow.count || 0
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PLATFORM REVENUE SERIES (daily for last N days)
exports.getPlatformRevenueSeries = async(req, res) => {
    try {
        const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
        const now = new Date();
        const start = new Date(now);
        start.setDate(start.getDate() - (days - 1));
        start.setHours(0, 0, 0, 0);

        const excludedStatuses = ['cancelled', 'CANCELLED_BY_SHOP', 'CANCELLED_BY_ADMIN'];

        const agg = await Booking.aggregate([
            { $match: { slotStart: { $gte: start }, status: { $nin: excludedStatuses } } },
            { $project: { slotStart: 1, platformFee: { $ifNull: ['$platformFee', 0] } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$slotStart" } }, totalPlatform: { $sum: '$platformFee' } } },
            { $sort: { '_id': 1 } }
        ]);

        // convert aggregation to a map
        const map = {};
        for (const r of agg) map[r._id] = r.totalPlatform || 0;

        const series = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const iso = d.toISOString().slice(0, 10);
            series.push({ date: iso, value: map[iso] || 0 });
        }

        return res.json({ series });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Toggle acceptCOD for a shop (admin)
exports.toggleShopAcceptCOD = async(req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        const { accept } = req.body || {};
        if (accept === undefined) {
            shop.acceptCOD = !shop.acceptCOD;
        } else {
            shop.acceptCOD = !!accept;
        }

        await shop.save();

        await AuditLog.create({
            actorRole: 'ADMIN',
            actorId: req.user.id,
            action: 'TOGGLE_ACCEPT_COD',
            entity: 'Shop',
            entityId: shop._id,
            metadata: { acceptCOD: shop.acceptCOD }
        });

        res.json({ message: `acceptCOD ${shop.acceptCOD ? 'enabled' : 'disabled'}`, acceptCOD: shop.acceptCOD });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Admin: refund a booking (only ONLINE allowed)
exports.refundBooking = async(req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.paymentMethod !== 'ONLINE') {
            return res.status(400).json({ message: 'No refund for COD bookings' });
        }

        // amount available to refund
        const amt = (booking.payment && booking.payment.amountPaid) || booking.totalAmount || 0;

        booking.status = 'refunded';
        booking.refund = booking.refund || {};
        booking.refund.status = 'SUCCESS';
        booking.refund.amount = amt;
        booking.refund.processedAt = new Date();

        booking.payment = booking.payment || {};
        booking.payment.refundedAmount = amt;
        booking.payment.status = 'refunded';

        await booking.save();

        // notify customer
        try {
            const Notification = require('../models/Notification');
            await Notification.create({
                user: booking.userId,
                title: 'Refund Completed',
                message: `Your refund of ₹${amt} has been processed.`,
                type: 'REFUND'
            });
        } catch (e) { console.error('notify refund failed', e); }

        return res.json({ ok: true, refunded: amt });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Admin: flag a booking for internal review
exports.flagBooking = async(req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.flagged = true;
        await booking.save();

        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Admin: set / unset COD restriction for a user
exports.setUserCODRestriction = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { until } = req.body || {};
        if (until === null || until === '' || until === 'null') {
            user.codRestrictedUntil = null;
        } else if (until) {
            user.codRestrictedUntil = new Date(until);
        } else {
            // toggle: if currently restricted in future, clear; otherwise restrict until month end
            const now = new Date();
            if (user.codRestrictedUntil && user.codRestrictedUntil > now) {
                user.codRestrictedUntil = null;
            } else {
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                user.codRestrictedUntil = end;
            }
        }

        await user.save();

        await AuditLog.create({
            actorRole: 'ADMIN',
            actorId: req.user.id,
            action: 'SET_COD_RESTRICTION',
            entity: 'User',
            entityId: user._id,
            metadata: { codRestrictedUntil: user.codRestrictedUntil }
        });

        return res.json({ ok: true, codRestrictedUntil: user.codRestrictedUntil });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};