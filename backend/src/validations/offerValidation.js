const { requiredFields } = require('../middleware/validate');

exports.createOfferRules = [requiredFields('title', 'description')];
