const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    // User who owns this session
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Device fingerprint to prevent token sharing
    // Can be: hash of (user-agent + ip-address)
    deviceFingerprint: {
        type: String,
        required: true
    },

    // IP address for tracking
    ipAddress: {
        type: String
    },

    // User agent for device identification
    userAgent: {
        type: String
    },

    // JWT token for quick validation
    tokenHash: {
        type: String,
        unique: true,
        sparse: true
    },

    // When this session was created
    createdAt: {
        type: Date,
        default: Date.now
    },

    // When this session expires (7 days default)
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        index: { expireAfterSeconds: 0 } // Auto-delete expired sessions
    },

    // Last activity on this session
    lastActivityAt: {
        type: Date,
        default: Date.now
    },

    // Session status
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Compound index for efficient queries
sessionSchema.index({ userId: 1, deviceFingerprint: 1 });
sessionSchema.index({ userId: 1, active: 1 });

module.exports = mongoose.model("Session", sessionSchema);
