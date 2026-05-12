const router = require('express').Router();
const controller = require('../controllers/offerController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const { createOfferRules } = require('../validations/offerValidation');

router.get('/', controller.listOffers);
router.post('/', protect, allowRoles('admin'), createOfferRules, controller.createOffer);
router.put('/:id', protect, allowRoles('admin'), controller.updateOffer);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteOffer);

module.exports = router;
