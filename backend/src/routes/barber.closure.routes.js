const router = require('express').Router();
const { requireAuth } = require('../middlewares/auth.middleware');
const requireBarber = require('../middlewares/requireBarber');
const { addClosure, getClosures } = require('../controllers/barber.closure.controller');

router.post('/closures', requireAuth, requireBarber, addClosure);
router.get('/closures', requireAuth, requireBarber, getClosures);

module.exports = router;