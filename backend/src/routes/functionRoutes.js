const router = require('express').Router();
const controller = require('../controllers/functionController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.get('/', protect, controller.listFunctionRequests);
router.post('/', protect, allowRoles('customer'), controller.createFunctionRequest);

module.exports = router;

