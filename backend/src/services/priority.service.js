const User = require("../models/User.model");

const clamp = (value, min = 0, max = 150) => Math.max(min, Math.min(max, value));

exports.adjustPriority = async(userId, delta) => {
    if (!userId || !delta) return;
    const user = await User.findById(userId);
    if (!user) return;

    user.priorityScore = clamp((user.priorityScore || 100) + delta);
    await user.save();
};