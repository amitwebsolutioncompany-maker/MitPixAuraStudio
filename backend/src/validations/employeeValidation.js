const { requiredFields } = require('../middleware/validate');

exports.createEmployeeRules = [requiredFields('name', 'email', 'password', 'salon')];
