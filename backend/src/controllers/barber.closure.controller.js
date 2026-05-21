const ShopClosure = require('../models/ShopClosure');
const Booking = require('../models/Booking.model');
const refundService = require('../services/refund.service');
const notificationService = require('../services/notification.service');

exports.addClosure = async(req, res) => {
    try {
        const { date, reason } = req.body;
        if (!date) return res.status(400).json({ message: 'date required' });

        const shopId = req.user && (req.user.shop || req.user.shopId);
        if (!shopId) return res.status(401).json({ message: 'Unauthorized' });

        // create approved closure (barber-initiated)
        const closure = await ShopClosure.create({ shop: shopId, date, reason, status: 'APPROVED' });

        // find future bookings for that date
        const start = new Date(`${date}T00:00:00`);
        const end = new Date(`${date}T23:59:59.999`);

        const bookings = await Booking.find({ shopId, slotStart: { $gte: start, $lte: end }, status: 'booked' });

        for (const b of bookings) {
            try {
                // mark cancelled
                b.status = 'cancelled';
                await b.save();

                // initiate refund (async simulated)
                try { await refundService.initiateRefund(b); } catch (e) { console.error('refund failed', e); }

                // notify user in-app
                try {
                    await notificationService.sendInAppNotification({
                        userId: b.userId,
                        title: 'Booking Cancelled',
                        message: `Your booking on ${new Date(b.slotStart).toDateString()} was cancelled due to shop closure.`,
                        type: 'CANCELLATION'
                    });
                } catch (e) { console.error('notify failed', e); }
            } catch (err) {
                console.error('process booking failed', err);
            }
        }

        return res.json({ ok: true, affected: bookings.length });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getClosures = async(req, res) => {
    try {
        const shopId = req.user && (req.user.shop || req.user.shopId);
        if (!shopId) return res.status(401).json({ message: 'Unauthorized' });

        const closures = await ShopClosure.find({ shop: shopId }).sort({ date: 1 }).lean();
        return res.json(closures);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};