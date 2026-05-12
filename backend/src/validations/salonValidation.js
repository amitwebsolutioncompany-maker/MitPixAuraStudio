const { requiredFields } = require('../middleware/validate');

exports.createSalonRules = [requiredFields('name', 'address', 'city', 'totalChairs')];
