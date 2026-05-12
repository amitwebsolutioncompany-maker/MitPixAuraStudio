const router = require('express').Router();
const controller = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { customerLoginRules, staffLoginRules } = require('../validations/authValidation');

router.post('/customer-login', customerLoginRules, controller.customerLogin);
router.post('/staff-login', staffLoginRules, controller.staffLogin);
router.get('/me', protect, controller.me);
router.patch('/me', protect, controller.updateMe);

module.exports = router;
