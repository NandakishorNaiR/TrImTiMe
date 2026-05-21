const Notification = require('../models/Notification');

async function sendInAppNotification({ userId, title, message, type = 'SYSTEM' }) {
    try {
        await Notification.create({ user: userId, title, message, type });
    } catch (err) {
        console.error('sendInAppNotification error', err);
    }
}

// SMS-ready placeholder
async function sendSMS({ phone, message }) {
    // placeholder: log for now
    console.log('SMS READY:', phone, message);
    // later integrate Twilio / MSG91 / Fast2SMS
}

module.exports = {
    sendInAppNotification,
    sendSMS
};