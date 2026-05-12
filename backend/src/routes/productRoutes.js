const router = require('express').Router();
const controller = require('../controllers/productController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.get('/', controller.listProducts);
router.post('/', protect, allowRoles('admin'), controller.createProduct);
router.post('/orders', protect, allowRoles('customer'), controller.createOrder);

module.exports = router;

