const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Generate a device fingerprint from user agent and IP address
 * This prevents token sharing across devices
 */
const generateDeviceFingerprint = (userAgent, ipAddress) => {
    const combinedString = `${userAgent || 'unknown'}:${ipAddress || 'unknown'}`;
    return crypto.createHash('sha256').update(combinedString).digest('hex');
};

/**
 * Generate hash of JWT token for storage (prevents token exposure in DB)
 */
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Create a new JWT token with expiry
 */
const createToken = (payload, secret, expiresIn = '7d') => {
    return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify JWT token and check expiry
 */
const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new Error('Token expired');
        }
        throw new Error('Invalid token');
    }
};

/**
 * Extract bearer token from Authorization header
 */
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.split(' ')[1];
};

/**
 * Get IP address from request (handles proxies like Render, Vercel)
 */
const getClientIP = (req) => {
    return (
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.headers['x-real-ip'] ||
        req.ip ||
        req.connection.remoteAddress ||
        'unknown'
    );
};

/**
 * Get user agent from request
 */
const getUserAgent = (req) => {
    return req.headers['user-agent'] || 'unknown';
};

/**
 * Check if too many failed login attempts (brute force protection)
 * Returns { blocked: boolean, attemptsCount: number, lockoutUntil: Date|null }
 */
const checkLoginAttempts = async(phone, ipAddress, maxAttempts = 5, lockoutDurationMinutes = 15) => {
    const LoginAttempt = require('../models/LoginAttempt.model');
    const now = new Date();
    const lockoutStart = new Date(now.getTime() - lockoutDurationMinutes * 60 * 1000);

    // Count failed attempts in the lockout window
    const failedAttempts = await LoginAttempt.countDocuments({
        phone,
        successful: false,
        attemptedAt: { $gte: lockoutStart }
    });

    const ipFailedAttempts = await LoginAttempt.countDocuments({
        ipAddress,
        successful: false,
        attemptedAt: { $gte: lockoutStart }
    });

    const blocked = failedAttempts >= maxAttempts || ipFailedAttempts >= maxAttempts * 2;
    const lockoutUntil = blocked ? new Date(lockoutStart.getTime() + lockoutDurationMinutes * 60 * 1000) : null;

    return {
        blocked,
        attemptsCount: failedAttempts,
        ipAttemptsCount: ipFailedAttempts,
        lockoutUntil
    };
};

/**
 * Record a login attempt
 */
const recordLoginAttempt = async(phone, ipAddress, successful, failureReason = null) => {
    const LoginAttempt = require('../models/LoginAttempt.model');
    return LoginAttempt.create({
        phone,
        ipAddress,
        successful,
        failureReason,
        attemptedAt: new Date()
    });
};

/**
 * Create a new session
 */
const createSession = async(userId, deviceFingerprint, userAgent, ipAddress, token) => {
    const Session = require('../models/Session.model');

    // Hash the token before storing (security best practice)
    const tokenHash = hashToken(token);

    return Session.create({
        userId,
        deviceFingerprint,
        userAgent,
        ipAddress,
        tokenHash,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        lastActivityAt: new Date(),
        active: true
    });
};

/**
 * Validate session exists and is active
 */
const validateSession = async(userId, deviceFingerprint) => {
    const Session = require('../models/Session.model');

    const session = await Session.findOne({
        userId,
        deviceFingerprint,
        active: true,
        expiresAt: { $gt: new Date() }
    });

    return !!session;
};

/**
 * Update session activity
 */
const updateSessionActivity = async(userId, deviceFingerprint) => {
    const Session = require('../models/Session.model');

    return Session.updateOne({ userId, deviceFingerprint, active: true }, { lastActivityAt: new Date() });
};

/**
 * Invalidate all sessions for a user (force logout everywhere)
 */
const invalidateAllSessions = async(userId) => {
    const Session = require('../models/Session.model');
    return Session.updateMany({ userId }, { active: false });
};

/**
 * Invalidate single session
 */
const invalidateSession = async(userId, deviceFingerprint) => {
    const Session = require('../models/Session.model');
    return Session.updateOne({ userId, deviceFingerprint }, { active: false });
};

/**
 * Get all active sessions for a user
 */
const getActiveSessions = async(userId) => {
    const Session = require('../models/Session.model');
    return Session.find({
        userId,
        active: true,
        expiresAt: { $gt: new Date() }
    }).lean();
};

module.exports = {
    generateDeviceFingerprint,
    hashToken,
    createToken,
    verifyToken,
    extractTokenFromHeader,
    getClientIP,
    getUserAgent,
    checkLoginAttempts,
    recordLoginAttempt,
    createSession,
    validateSession,
    updateSessionActivity,
    invalidateAllSessions,
    invalidateSession,
    getActiveSessions
};