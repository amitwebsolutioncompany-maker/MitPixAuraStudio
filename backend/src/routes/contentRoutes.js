const router = require('express').Router();
const controller = require('../controllers/contentController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.get('/:key', controller.getContent);
router.put('/:key', protect, allowRoles('admin'), controller.updateContent);

module.exports = router;
