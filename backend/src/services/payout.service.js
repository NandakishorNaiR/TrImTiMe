const Booking = require("../models/Booking.model");

exports.calculateDailySettlement = async({ shopId, date }) => {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59`);

    const bookings = await Booking.find({
        shopId,
        createdAt: { $gte: start, $lte: end },
        status: { $in: ["completed", "cancelled", "no_show"] }
    }).lean();

    let completedAmount = 0;
    let cancellationAmount = 0;

    bookings.forEach((b) => {
        if (b.status === "completed") {
            const serviceTotal = (b.services || []).reduce((sum, s) => sum + (s.price || 0), 0);
            completedAmount += serviceTotal;
        } else {
            // cancelled / no-show
            cancellationAmount += (b.settlement && b.settlement.salonAmount) || 0;
        }
    });

    return {
        totalBookings: bookings.length,
        completedAmount,
        cancellationAmount,
        totalPayout: completedAmount + cancellationAmount
    };
};
// Payout service placeholder
module.exports = {};