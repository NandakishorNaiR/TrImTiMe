const Booking = require('../models/Booking.model');

const runPendingExpiryJob = async() => {
    try {
        const now = new Date();
        const expiryCutoff = new Date(Date.now() - (5 * 60 * 1000)); // 5 minutes

        // find pending bookings older than cutoff
        const stale = await Booking.find({ status: 'pending', createdAt: { $lt: expiryCutoff } });
        if (!stale || stale.length === 0) {
            // nothing to do
            return { expiredCount: 0 };
        }

        const ids = stale.map(s => s._id);
        const res = await Booking.updateMany({ _id: { $in: ids } }, { $set: { status: 'expired' } });

        const count = (res && (res.modifiedCount || res.nModified)) || 0;
        console.log('Pending expiry job: marked', count, 'bookings as expired');
        return { expiredCount: count };
    } catch (err) {
        console.error('Pending expiry job failed', err);
        throw err;
    }
};

module.exports = { runPendingExpiryJob };