const router = require('express').Router();
const controller = require('../controllers/superAdminController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.use(protect, allowRoles('superAdmin'));
router.get('/dashboard', controller.dashboard);
router.get('/admins', controller.listAdmins);
router.post('/admins', controller.createAdmin);
router.put('/admins/:id', controller.updateAdmin);
router.delete('/admins/:id', controller.deleteAdmin);
router.get('/admins/:id/data', controller.adminData);
router.get('/subscriptions', controller.listSubscriptions);
router.put('/subscriptions/:plan', controller.upsertSubscription);
router.get('/global-loyal-customers', controller.loyalCustomers);

module.exports = router;
