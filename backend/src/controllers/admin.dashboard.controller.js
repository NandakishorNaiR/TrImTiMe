const User = require("../models/User.model");
const Shop = require("../models/Shop.model");
const Booking = require("../models/Booking.model");

exports.getDashboardStats = async(req, res) => {
    try {
        const [totalCustomers, totalBarbers, totalShops, totalBookings] = await Promise.all([
            User.countDocuments({ role: "CUSTOMER" }),
            User.countDocuments({ role: "BARBER" }),
            Shop.countDocuments({}),
            Booking.countDocuments({}),
        ]);

        // Financials: compute online revenue, platform earnings, COD due, net payout
        const PLATFORM_FEE = 7;
        const excludedStatuses = ['cancelled', 'CANCELLED_BY_SHOP', 'CANCELLED_BY_ADMIN'];

        const onlineAgg = await Booking.aggregate([
            { $match: { status: { $nin: excludedStatuses }, paymentMethod: 'ONLINE' } },
            { $group: { _id: null, totalOnline: { $sum: { $ifNull: ['$totalAmount', 0] } }, count: { $sum: 1 } } }
        ]);
        const onlineRow = (onlineAgg && onlineAgg[0]) || { totalOnline: 0, count: 0 };

        const codAgg = await Booking.aggregate([
            { $match: { status: { $nin: excludedStatuses }, paymentMethod: 'COD' } },
            { $group: { _id: null, totalCOD: { $sum: { $ifNull: ['$totalAmount', 0] } }, count: { $sum: 1 } } }
        ]);
        const codRow = (codAgg && codAgg[0]) || { totalCOD: 0, count: 0 };

        const totalOnline = onlineRow.totalOnline || 0;
        const onlineCount = onlineRow.count || 0;
        const platformEarnings = (totalBookings || 0) * PLATFORM_FEE;
        const codDue = (codRow.count || 0) * PLATFORM_FEE;
        const netPayout = totalOnline - (onlineCount * PLATFORM_FEE);

        return res.json({
            customers: totalCustomers,
            barbers: totalBarbers,
            shops: totalShops,
            bookings: totalBookings,
            totalOnline,
            platformEarnings,
            codDue,
            netPayout
        });
    } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        return res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
};