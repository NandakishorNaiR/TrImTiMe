const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth(), authController.me);
router.put('/profile', requireAuth(), authController.updateProfile);
router.patch('/update-preference', requireAuth(), authController.updatePreference);

// ✅ SECURITY: Logout endpoints
router.post('/logout', requireAuth(), authController.logout); // Logout from this device only
router.post('/logout-all', requireAuth(), authController.logoutAll); // Logout from all devices

module.exports = router;