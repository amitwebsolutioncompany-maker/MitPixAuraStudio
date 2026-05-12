const router = require('express').Router();
const controller = require('../controllers/salonController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const { createSalonRules } = require('../validations/salonValidation');

router.get('/', controller.listSalons);
router.get('/:id', controller.getSalon);
router.post('/', protect, allowRoles('admin'), createSalonRules, controller.createSalon);
router.put('/:id', protect, allowRoles('admin'), controller.updateSalon);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteSalon);

module.exports = router;
