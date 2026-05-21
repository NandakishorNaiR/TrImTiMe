const Booking = require("../models/Booking.model");
const { adjustPriority } = require("../services/priority.service");
const { calculateRefund } = require("../services/refund.service");
const { processRefund } = require("../services/payment.service");
const User = require('../models/User.model');
const AuditLog = require('../models/AuditLog');
const notificationService = require('../services/notification.service');

exports.runNoShowJob = async() => {
    try {
        const now = new Date();
        const graceMinutes = 15; // Grace period after slot ends
        const graceTime = new Date(now.getTime() - graceMinutes * 60 * 1000);

        // 1️⃣ Find all bookings that:
        //    - Are still in 'CONFIRMED' status (NOT checked-in or completed)
        //    - Slot ended MORE than 15 minutes ago (grace period passed)
        const expiredBookings = await Booking.find({
            status: "CONFIRMED",
            slotEnd: { $lt: graceTime } // Grace period applied
        });

        console.log(`[No-Show Job] Found ${expiredBookings.length} bookings exceeding grace period`);

        for (const booking of expiredBookings) {
            try {
                // Safety: ensure we're only processing bookings that remain in 'CONFIRMED' state
                if (booking.status !== 'CONFIRMED') {
                    continue;
                }

                // Mark as NO_SHOW
                booking.status = "NO_SHOW";
                booking.noShowMarkedAt = now;

                await booking.save();

                console.log(`[No-Show Job] Marked booking ${booking._id} as no-show (grace period expired)`);

                // Priority penalty (best-effort)
                try { await adjustPriority(booking.userId, -10); } catch (e) { /* non-fatal */ }

                // Count no-shows for this user in current calendar month and auto-restrict COD if threshold reached
                try {
                    const now = new Date();
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                    const noShowCount = await Booking.countDocuments({ userId: booking.userId, status: 'no_show', noShowMarkedAt: { $gte: monthStart, $lte: monthEnd } });
                    if (noShowCount >= 2) {
                        try {
                            const user = await User.findById(booking.userId);
                            if (user) {
                                // set restriction until month end
                                user.codRestrictedUntil = monthEnd;
                                await user.save();

                                await AuditLog.create({ actorRole: 'SYSTEM', actorId: null, action: 'AUTO_COD_RESTRICT', entity: 'User', entityId: user._id, metadata: { reason: 'no_show_threshold', noShowCount, restrictedUntil: monthEnd } });

                                // notify user
                                try {
                                    await notificationService.sendInAppNotification({ userId: user._id, title: 'COD Disabled', message: `COD has been disabled due to ${noShowCount} no-shows this month. It will be re-enabled on ${monthEnd.toISOString().slice(0,10)}.`, type: 'SYSTEM' });
                                } catch (nerr) { console.error('notify user failure', nerr); }
                            }
                        } catch (uerr) { console.error('auto restrict failed', uerr); }
                    }
                } catch (cntErr) { console.error('counting no-shows failed', cntErr); }

                console.log(`No-show marked for booking ${booking._id}`);
            } catch (innerErr) {
                console.error(`Processing failed for booking ${booking._id}`, innerErr);
            }
        }

    } catch (err) {
        console.error("No-show job failed", err);
    }
};

// For manual invocation
if (require.main === module) {
    exports.runNoShowJob();
}