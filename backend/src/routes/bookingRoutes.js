const router = require('express').Router();
const controller = require('../controllers/bookingController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const { createBookingRules } = require('../validations/bookingValidation');

router.post('/', protect, allowRoles('customer'), createBookingRules, controller.createBooking);
router.get('/me', protect, controller.myBookings);
router.get('/', protect, allowRoles('admin'), controller.listBookings);
router.put('/:id', protect, allowRoles('admin'), controller.updateBooking);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteBooking);

module.exports = router;
