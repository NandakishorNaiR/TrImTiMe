const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth.middleware');
const notificationController = require('../controllers/notification.controller');

router.use(requireAuth());

router.get('/', notificationController.getNotificationsForUser);
router.post('/:id/read', notificationController.markRead);

module.exports = router;