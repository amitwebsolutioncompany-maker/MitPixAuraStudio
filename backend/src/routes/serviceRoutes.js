const router = require('express').Router();
const controller = require('../controllers/serviceController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const { createServiceRules } = require('../validations/serviceValidation');

router.get('/', controller.listServices);
router.post('/', protect, allowRoles('admin'), createServiceRules, controller.createService);
router.put('/:id', protect, allowRoles('admin'), controller.updateService);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteService);

module.exports = router;
