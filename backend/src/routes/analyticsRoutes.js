const router = require('express').Router();
const controller = require('../controllers/analyticsController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, allowRoles('admin'), controller.dashboard);

module.exports = router;
