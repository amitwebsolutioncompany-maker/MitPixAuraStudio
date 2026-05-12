const router = require('express').Router();
const controller = require('../controllers/slotController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const { offlineBookingRules } = require('../validations/bookingValidation');

router.get('/', protect, controller.listSlots);
router.patch('/day-break', protect, allowRoles('employee', 'admin'), controller.setDayBreak);
router.patch('/:id/occupied', protect, allowRoles('employee', 'admin'), offlineBookingRules, controller.markOccupied);
router.patch('/:id/break', protect, allowRoles('employee', 'admin'), controller.setBreak);
router.patch('/:id/available', protect, allowRoles('employee', 'admin'), controller.setAvailable);
router.patch('/:id/complete', protect, allowRoles('employee', 'admin'), controller.completeSlot);

module.exports = router;
