const router = require('express').Router();
const controller = require('../controllers/employeeController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const { createEmployeeRules } = require('../validations/employeeValidation');

router.get('/', controller.listEmployees);
router.post('/', protect, allowRoles('admin'), createEmployeeRules, controller.createEmployee);
router.put('/:id', protect, allowRoles('admin'), controller.updateEmployee);
router.delete('/:id', protect, allowRoles('admin'), controller.deleteEmployee);

module.exports = router;
