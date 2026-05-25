const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema({
    // Phone number (since auth is phone-based)
    phone: {
        type: String,
        required: true,
        index: true
    },

    // IP address of the attempt
    ipAddress: {
        type: String
    },

    // Whether this attempt was successful
    successful: {
        type: Boolean,
        default: false
    },

    // Reason for failure if unsuccessful
    failureReason: {
        type: String // e.g., "invalid_phone", "account_locked"
    },

    // Timestamp of attempt
    attemptedAt: {
        type: Date,
        default: Date.now,
        index: { expireAfterSeconds: 86400 } // Auto-delete after 24 hours
    }
});

// Compound index for rate limiting
loginAttemptSchema.index({ phone: 1, attemptedAt: 1 });
loginAttemptSchema.index({ ipAddress: 1, attemptedAt: 1 });

module.exports = mongoose.model("LoginAttempt", loginAttemptSchema);