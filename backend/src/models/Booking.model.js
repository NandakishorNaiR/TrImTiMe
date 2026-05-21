const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false // optional for offline bookings
    },

    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },

    // Booking source: APP or OFFLINE
    source: {
        type: String,
        enum: ["APP", "OFFLINE"],
        default: "APP"
    },

    // For offline bookings: customer phone number
    customerPhone: {
        type: String
    },

    memberName: {
        type: String,
        required: true // Dad / Son / Self / or offline customer name
    },

    services: [{
        name: String,
        price: Number,
        duration: Number
    }],

    slotStart: {
        type: Date,
        required: true
    },

    slotEnd: {
        type: Date,
        required: true
    },

    // legacy payment object (kept for backward compatibility)
    payment: {
        mode: {
            type: String,
            enum: ["UPI", "COD"],
        },
        amountPaid: Number,
        refundedAmount: Number,
        status: {
            type: String,
            enum: ["paid", "refunded", "partial_refund"],
            default: "paid"
        }
    },

    // New fields for COD / ONLINE handling
    paymentMode: {
        type: String,
        enum: ["ONLINE", "COD"],
        required: true,
        default: "ONLINE"
    },

    // canonical payment method field (UPI or CASH)
    paymentMethod: {
        type: String,
        enum: ["UPI", "CASH"],
        default: "UPI"
    },

    codReceived: {
        type: Boolean,
        default: false
    },

    codReceivedAt: Date,

    platformFee: {
        type: Number,
        default: 7
    },

    totalAmount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED", "NO_SHOW", "CANCELLED_BY_SHOP", "CANCELLED_BY_ADMIN"],
        default: "CONFIRMED"
    },

    // Payment status - independent from booking status
    // Payment happens AFTER service completion
    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID"],
        default: "PENDING"
    },

    // When payment was marked as PAID by barber
    paidAt: Date,

    flagged: {
        type: Boolean,
        default: false
    },

    cancellation: {
        cancelledAt: Date,
        refundPercent: Number
    },

    noShowMarkedAt: Date,
    // Barber check-in & completion tracking
    checkedIn: {
        type: Boolean,
        default: false
    },
    checkedInAt: Date,
    completedAt: Date,

    refund: {
        status: {
            type: String,
            enum: ["NONE", "INITIATED", "SUCCESS", "FAILED"],
            default: "NONE"
        },
        amount: Number,
        referenceId: String
    },

    settlement: {
        salonAmount: Number,
        platformAmount: Number
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Performance indexes
// Compound index for slot availability queries (most common)
bookingSchema.index({ shopId: 1, slotStart: 1 });

// Index for payment tracking and settlement
bookingSchema.index({ paymentStatus: 1, status: 1 });

// Index for customer booking history
bookingSchema.index({ userId: 1, status: 1 });

// Index for slot conflict detection during booking creation
bookingSchema.index({ shopId: 1, slotEnd: 1, slotStart: 1 });

// Index for daily settlement job (completed bookings)
bookingSchema.index({ status: "COMPLETED", paymentStatus: "PAID" });

// Index for no-show detection
bookingSchema.index({ status: 1, slotEnd: 1 });

module.exports = mongoose.model("Booking", bookingSchema);