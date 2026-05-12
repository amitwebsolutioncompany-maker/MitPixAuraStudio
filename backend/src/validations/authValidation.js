const { requiredFields } = require('../middleware/validate');

exports.customerLoginRules = [requiredFields('phone')];
exports.staffLoginRules = [requiredFields('email', 'password')];
