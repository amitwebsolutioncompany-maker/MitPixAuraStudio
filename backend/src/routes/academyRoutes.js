const router = require('express').Router();
const controller = require('../controllers/academyController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.get('/courses', controller.listCourses);
router.post('/courses', protect, allowRoles('admin'), controller.createCourse);
router.post('/enrollments', protect, allowRoles('customer'), controller.enroll);

module.exports = router;

