const router = require('express').Router();
const controller = require('../controllers/salonController');
const { protect, optionalProtect, allowRoles } = require('../middleware/authMiddleware');
const { createSalonRules } = require('../validations/salonValidation');

router.get('/', optionalProtect, controller.listSalons);
router.get('/:id', optionalProtect, controller.getSalon);
router.post('/', protect, allowRoles('admin'), createSalonRules, controller.createSalon);
router.put('/:id', protect, allowRoles('admin'), controller.updateSalon);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteSalon);

module.exports = router;
