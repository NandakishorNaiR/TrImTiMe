const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const {
    generateDeviceFingerprint,
    getClientIP,
    getUserAgent,
    checkLoginAttempts,
    recordLoginAttempt,
    createSession,
    validateSession,
    updateSessionActivity,
    invalidateAllSessions,
    invalidateSession
} = require('../utils/auth.utils');

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

        const ipAddress = getClientIP(req);
        const userAgent = getUserAgent(req);

        console.log('login attempt:', { phone, name, role, hasGenderPref: !!genderPreference, ipAddress });

        // ✅ SECURITY: Check for account lockout (brute force protection)
        const attemptCheck = await checkLoginAttempts(phone, ipAddress);
        if (attemptCheck.blocked) {
            await recordLoginAttempt(phone, ipAddress, false, 'account_locked');
            const waitMinutes = Math.ceil((attemptCheck.lockoutUntil - new Date()) / 60000);
            return res.status(429).json({
                message: `Too many login attempts. Please try again in ${waitMinutes} minutes.`,
                lockoutUntil: attemptCheck.lockoutUntil
            });
        }

        // Find or create user
        let user = await User.findOne({ phone });
        console.log('user found:', !!user);

        if (!user) {
            // New user: create account
            const userRole = role || 'CUSTOMER';
            if (userRole === 'ADMIN') return res.status(403).json({ message: 'Cannot register as admin' });

            const userName = name && name.trim() ? name : `Customer_${phone.slice(-4)}`;
            const userData = { name: userName, phone, role: userRole };

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

            if (name && name.trim() && name !== user.name) {
                updates.name = name;
                hasUpdates = true;
            }

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
                user = freshUser;
            }
        } catch (popErr) {
            console.warn('populate shop warning:', popErr.message);
        }

        const payload = {
            id: user._id,
            role: user.role,
            shopId: user.shopId || null,
            genderPreference: user.genderPreference || null
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        console.log('token generated for user:', user._id);

        // ✅ SECURITY: Create device-specific session
        const deviceFingerprint = generateDeviceFingerprint(userAgent, ipAddress);
        await createSession(user._id, deviceFingerprint, userAgent, ipAddress, token);
        console.log('session created for device:', deviceFingerprint);

        // Record successful login
        await recordLoginAttempt(phone, ipAddress, true);

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

        // ✅ SECURITY: Validate that session exists for this device
        const userAgent = getUserAgent(req);
        const ipAddress = getClientIP(req);
        const deviceFingerprint = generateDeviceFingerprint(userAgent, ipAddress);

        const sessionValid = await validateSession(userId, deviceFingerprint);
        if (!sessionValid) {
            return res.status(401).json({ message: 'Invalid session. Please login again.' });
        }

        // Update last activity
        await updateSessionActivity(userId, deviceFingerprint);

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

// ✅ SECURITY: Logout - invalidate session on this device
exports.logout = async(req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const userAgent = getUserAgent(req);
        const ipAddress = getClientIP(req);
        const deviceFingerprint = generateDeviceFingerprint(userAgent, ipAddress);

        // Invalidate this specific session
        await invalidateSession(userId, deviceFingerprint);

        console.log('user logged out:', userId, 'device:', deviceFingerprint);

        return res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ✅ SECURITY: Logout from all devices
exports.logoutAll = async(req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Invalidate all sessions for this user
        await invalidateAllSessions(userId);

        console.log('user logged out from all devices:', userId);

        return res.json({ message: 'Logged out from all devices successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};