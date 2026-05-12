const ApiError = require('../utils/apiError');

const requiredFields = (...fields) => (req, _res, next) => {
  const missing = fields.filter((field) => req.body[field] === undefined || req.body[field] === '');
  if (missing.length) throw new ApiError(400, `Missing fields: ${missing.join(', ')}`);
  next();
};

module.exports = { requiredFields };
