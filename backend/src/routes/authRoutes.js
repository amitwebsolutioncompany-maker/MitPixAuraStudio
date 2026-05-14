const router = require('express').Router();
const controller = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { customerLoginRules, staffLoginRules, adminLoginRules } = require('../validations/authValidation');

router.post('/customer-login', customerLoginRules, controller.customerLogin);
router.post('/staff-login', staffLoginRules, controller.staffLogin);
router.post('/admin-login', adminLoginRules, controller.adminLogin);
router.post('/super-admin-login', staffLoginRules, controller.superAdminLogin);
router.get('/me', protect, controller.me);
router.patch('/me', protect, controller.updateMe);

module.exports = router;
