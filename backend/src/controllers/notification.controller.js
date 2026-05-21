const Notification = require('../models/Notification');

exports.getNotificationsForUser = async(req, res) => {
    try {
        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const list = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
        return res.json(list);
    } catch (err) {
        console.error('getNotificationsForUser error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.markRead = async(req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        return res.json({ ok: true });
    } catch (err) {
        console.error('markRead error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};