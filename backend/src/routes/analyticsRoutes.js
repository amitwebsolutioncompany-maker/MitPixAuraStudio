const router = require('express').Router();
const controller = require('../controllers/analyticsController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, allowRoles('admin'), controller.dashboard);
router.get('/loyal-customers', protect, allowRoles('admin'), controller.loyalCustomers);
router.get('/staff-status', protect, allowRoles('employee'), controller.staffStatus);
router.get('/staff-earnings', protect, allowRoles('admin'), controller.staffEarnings);
router.post('/staff-earnings/:employeeId/complete', protect, allowRoles('admin'), controller.closeStaffEarnings);

module.exports = router;
