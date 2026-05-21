const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },

    date: {
        type: String, // YYYY-MM-DD
        required: true
    },

    onlineCollected: {
        type: Number,
        required: true
    },

    codAdjusted: {
        type: Number,
        required: true
    },

    netPayout: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["PENDING", "PAID"],
        default: "PENDING"
    },

    // Track if platform fees were waived for this settlement
    platformFeesWaived: {
        type: Boolean,
        default: false,
        description: "True if shop had collectPlatformFee disabled for this date"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Settlement", settlementSchema);