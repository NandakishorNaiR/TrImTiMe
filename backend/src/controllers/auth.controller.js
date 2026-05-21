const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = '7d';

exports.register = async(req, res) => {
    try {
        const { name, phone, role } = req.body;
        if (!name || !phone || !role) {
            return res.status(400).json({ message: 'All fields required' });
        }
        if (role === 'ADMIN') {
            return res.status(403).json({ message: 'Cannot register as admin' });
        }
        let existing = await User.findOne({ phone });
        if (existing) {
            return res.status(409).json({ message: 'User already exists' });
        }
        const user = await User.create({ name, phone, role });
        return res.status(201).json({ message: 'Registered successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async(req, res) => {
    try {
        const { phone, name, role, genderPreference } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone required' });

        console.log('login attempt:', { phone, name, role, hasGenderPref: !!genderPreference });

        // Find or create user
        let user = await User.findOne({ phone });
        console.log('user found:', !!user);

        if (!user) {
            // New user: create account
            // Default to CUSTOMER if not specified
            const userRole = role || 'CUSTOMER';
            if (userRole === 'ADMIN') return res.status(403).json({ message: 'Cannot register as admin' });

            // Use provided name or generate default from phone
            const userName = name && name.trim() ? name : `Customer_${phone.slice(-4)}`;

            const userData = { name: userName, phone, role: userRole };

            // Add gender preference for customers only
            if (userRole === 'CUSTOMER' && genderPreference) {
                const validPrefs = ['MALE', 'FEMALE', 'UNISEX'];
                if (!validPrefs.includes(genderPreference)) {
                    return res.status(400).json({ message: 'Invalid gender preference' });
                }
                userData.genderPreference = genderPreference;
            }

            console.log('creating new user:', userData);
            user = await User.create(userData);
            console.log('user created:', user._id);
        } else {
            // Existing user: update only non-sensitive fields
            const updates = {};
            let hasUpdates = false;

            // Only update name if provided and different
            if (name && name.trim() && name !== user.name) {
                updates.name = name;
                hasUpdates = true;
            }

            // Only update gender preference if customer and valid
            if (genderPreference && user.role === 'CUSTOMER') {
                const validPrefs = ['MALE', 'FEMALE', 'UNISEX'];
                if (!validPrefs.includes(genderPreference)) {
                    return res.status(400).json({ message: 'Invalid gender preference' });
                }
                if (genderPreference !== user.genderPreference) {
                    updates.genderPreference = genderPreference;
                    hasUpdates = true;
                }
            }

            // Only update if there are changes
            if (hasUpdates) {
                console.log('updating user:', { userId: user._id, updates });
                user = await User.findByIdAndUpdate(user._id, updates, { new: true });
                console.log('user updated');
            }
        }

        // Get fresh user data with shop populated
        let shop = null;
        try {
            const freshUser = await User.findById(user._id).populate('shop').lean();
            if (freshUser) {
                shop = freshUser.shop || null;
                // Also update local user object with latest data
                user = freshUser;
            }
        } catch (popErr) {
            console.warn('populate shop warning:', popErr.message);
            // Use existing user object if populate fails
        }

        const payload = {
            id: user._id,
            role: user.role,
            shopId: user.shopId || null,
            genderPreference: user.genderPreference || null
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        console.log('token generated for user:', user._id);

        return res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                shop: shop,
                genderPreference: user.genderPreference || null
            }
        });
    } catch (err) {
        console.error('login error:', { message: err.message, stack: err.stack });
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.me = async(req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.json({
            id: user._id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            shop: user.shop || null,
            genderPreference: user.genderPreference || null,
            codRestrictedUntil: user.codRestrictedUntil || null
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async(req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { name, phone } = req.body;

        // Validate input
        if (name && name.trim().length < 2) {
            return res.status(400).json({ message: 'Name must be at least 2 characters' });
        }

        // Check if phone is already taken by another user
        if (phone) {
            const existingUser = await User.findOne({ phone, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(409).json({ message: 'Phone number already in use' });
            }
        }

        // Update user
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (phone) updateData.phone = phone;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                shop: user.shop || null
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update user's gender preference (for shop filtering)
exports.updatePreference = async(req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { genderPreference } = req.body;
        if (!genderPreference || !['MALE', 'FEMALE', 'UNISEX'].includes(genderPreference)) {
            return res.status(400).json({ message: 'Invalid gender preference' });
        }

        const user = await User.findByIdAndUpdate(
            userId, { genderPreference }, { new: true }
        ).lean();

        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.json({
            message: 'Preference updated successfully',
            genderPreference: user.genderPreference
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};