const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: String,
    message: String,
    type: {
        type: String,
        enum: ['BOOKING', 'CANCELLATION', 'REFUND', 'SYSTEM']
    },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);