const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/salons', require('./salonRoutes'));
router.use('/employees', require('./employeeRoutes'));
router.use('/slots', require('./slotRoutes'));
router.use('/bookings', require('./bookingRoutes'));
router.use('/services', require('./serviceRoutes'));
router.use('/offers', require('./offerRoutes'));
router.use('/analytics', require('./analyticsRoutes'));
router.use('/content', require('./contentRoutes'));
router.use('/functions', require('./functionRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/academy', require('./academyRoutes'));

module.exports = router;
