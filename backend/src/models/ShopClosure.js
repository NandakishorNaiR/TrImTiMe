const mongoose = require('mongoose');

const shopClosureSchema = new mongoose.Schema({
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    reason: { type: String },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ShopClosure', shopClosureSchema);