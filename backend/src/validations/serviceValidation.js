const { requiredFields } = require('../middleware/validate');

exports.createServiceRules = [requiredFields('salon', 'name', 'price')];
