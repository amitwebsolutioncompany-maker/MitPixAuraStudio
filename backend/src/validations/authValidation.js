const { requiredFields } = require('../middleware/validate');
const ApiError = require('../utils/apiError');

exports.customerLoginRules = [requiredFields('phone')];
exports.staffLoginRules = [requiredFields('email', 'password')];
exports.adminLoginRules = [
  (req, _res, next) => {
    if ((!req.body.email && !req.body.aadhaarNumber) || !req.body.password) {
      throw new ApiError(400, 'Email/Aadhaar and password are required');
    }
    next();
  }
];
