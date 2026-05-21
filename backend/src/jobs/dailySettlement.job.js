const Booking = require("../models/Booking.model");
const Settlement = require("../models/Settlement.model");
const Shop = require("../models/Shop.model");

const runDailySettlementJob = async() => {
    try {
        const today = new Date();
        // settle yesterday
        today.setDate(today.getDate() - 1);

        const dateKey = today.toISOString().slice(0, 10);

        // find bookings for that date (using slotStart date)
        const start = new Date(`${dateKey}T00:00:00`);
        const end = new Date(`${dateKey}T23:59:59`);

        const bookings = await Booking.find({
            slotStart: { $gte: start, $lte: end },
            status: "COMPLETED",
            paymentStatus: "PAID"
        }).lean();

        const byShop = {};

        for (const b of bookings) {
            const shopId = b.shopId.toString();
            if (!byShop[shopId]) byShop[shopId] = { upi: 0, cash: 0 };

            // UPI: include full totalAmount
            if (b.paymentMethod === "UPI") {
                byShop[shopId].upi += (b.totalAmount || 0);
            }

            // CASH: subtract platform fee (already handled before marking as paid)
            if (b.paymentMethod === "CASH") {
                const cashValue = (b.totalAmount || 0) - (b.platformFee || 0);
                byShop[shopId].cash += cashValue;
            }
        }

        for (const shopId of Object.keys(byShop)) {
            // Fetch shop to check if platform fee should be collected
            const shop = await Shop.findById(shopId).lean();
            const shouldCollectPlatformFee = shop && shop.collectPlatformFee !== false; // Default to true

            let upi = byShop[shopId].upi;
            let cash = byShop[shopId].cash;

            // If shop doesn't collect platform fees, add them back (platform revenue is 0)
            if (!shouldCollectPlatformFee) {
                // Count bookings for this shop on this date to calculate platform fee recovery
                const shopBookings = bookings.filter(b => b.shopId.toString() === shopId);
                const totalPlatformFees = shopBookings.reduce((sum, b) => sum + (b.platformFee || 0), 0);

                // Give shop the full amounts (refund platform fees)
                upi += totalPlatformFees; // Refund to shop
            }

            // prevent duplicate settlement
            const exists = await Settlement.findOne({ shopId, date: dateKey });
            if (exists) continue;

            await Settlement.create({
                shopId,
                date: dateKey,
                onlineCollected: upi,
                codAdjusted: cash,
                netPayout: upi - cash,
                platformFeesWaived: !shouldCollectPlatformFee // Track if fees were waived
            });
        }

        console.log("Daily settlement completed for", dateKey);
    } catch (err) {
        console.error("Daily settlement failed", err);
    }
};

module.exports = { runDailySettlementJob };