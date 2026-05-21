const AuditLog = require('../models/AuditLog');
const notificationService = require('./notification.service');

// Mock refund flow — replace with real gateway integration later
exports.initiateRefund = async(booking) => {
    try {
        // Ensure payment/refund objects exist
        booking.payment = booking.payment || {};
        booking.refund = booking.refund || {};

        // If booking wasn't already marked cancelled, cancel it now
        if (booking.status !== 'cancelled') {
            booking.status = 'cancelled';
            booking.cancellation = booking.cancellation || {};
            booking.cancellation.cancelledAt = booking.cancellation.cancelledAt || new Date();
            booking.cancellation.refundPercent = booking.cancellation.refundPercent || 1;
        }

        booking.refund.status = 'INITIATED';
        booking.refund.amount = booking.refund.amount || (booking.payment.amountPaid || booking.totalAmount || 0);
        booking.refund.initiatedAt = booking.refund.initiatedAt || new Date();

        booking.payment.refundedAmount = booking.payment.refundedAmount || 0;

        await booking.save();

        await AuditLog.create({
            actorRole: 'ADMIN',
            actorId: null,
            action: 'INITIATE_REFUND',
            entity: 'Booking',
            entityId: booking._id,
            metadata: { amount: booking.refund.amount }
        });

        // notify user about refund initiation
        try {
            await notificationService.sendInAppNotification({
                userId: booking.userId,
                title: 'Refund Initiated',
                message: `Refund of ₹${booking.refund.amount} has been initiated for your booking.`,
                type: 'REFUND'
            });
        } catch (e) { console.error('notify init refund failed', e); }

        // simulate async gateway callback
        setTimeout(async() => {
            try {
                booking.refund.status = 'SUCCESS';
                booking.refund.referenceId = 'RF' + Date.now();
                booking.refund.processedAt = new Date();

                // update payment fields
                booking.payment.refundedAmount = (booking.payment.refundedAmount || 0) + (booking.refund.amount || 0);
                const paid = booking.payment.amountPaid || booking.totalAmount || 0;
                booking.payment.status = booking.payment.refundedAmount >= paid ? 'refunded' : 'partial_refund';

                await booking.save();

                await AuditLog.create({
                    actorRole: 'ADMIN',
                    actorId: null,
                    action: 'REFUND_SUCCESS',
                    entity: 'Booking',
                    entityId: booking._id,
                    metadata: { referenceId: booking.refund.referenceId }
                });

                // notify user about refund success
                try {
                    await notificationService.sendInAppNotification({
                        userId: booking.userId,
                        title: 'Refund Successful',
                        message: `₹${booking.refund.amount} has been refunded. Ref: ${booking.refund.referenceId}`,
                        type: 'REFUND'
                    });
                } catch (e) { console.error('notify refund success failed', e); }
            } catch (err) {
                console.error('refund.callback failed', err);
                booking.refund.status = booking.refund.status || 'FAILED';
                await booking.save();
            }
        }, 2000);
    } catch (err) {
        console.error('initiateRefund error', err);
        booking.refund = booking.refund || {};
        booking.refund.status = 'FAILED';
        await booking.save();
        await AuditLog.create({
            actorRole: 'ADMIN',
            actorId: null,
            action: 'REFUND_FAILED',
            entity: 'Booking',
            entityId: booking._id,
            metadata: { error: String(err) }
        });
    }
};
const REFUND_RULES = {
    FULL_REFUND_MINUTES: 60,
    PARTIAL_REFUND_PERCENT: 0.57,
    SALON_SHARE_PERCENT: 0.28
};

exports.calculateRefund = ({ slotStart, cancelledAt, amountPaid }) => {
    const diffMinutes = (slotStart - cancelledAt) / (1000 * 60);

    if (diffMinutes > REFUND_RULES.FULL_REFUND_MINUTES) {
        return {
            refundPercent: 1,
            refundAmount: amountPaid,
            salonAmount: 0,
            platformAmount: 0
        };
    }

    const refundAmount = Math.round(amountPaid * REFUND_RULES.PARTIAL_REFUND_PERCENT);
    const retained = amountPaid - refundAmount;

    const salonAmount = Math.round(retained * REFUND_RULES.SALON_SHARE_PERCENT);
    const platformAmount = retained - salonAmount;

    return {
        refundPercent: REFUND_RULES.PARTIAL_REFUND_PERCENT,
        refundAmount,
        salonAmount,
        platformAmount
    };
};