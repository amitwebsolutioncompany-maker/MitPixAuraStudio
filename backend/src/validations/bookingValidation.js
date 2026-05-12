const { requiredFields } = require('../middleware/validate');

exports.createBookingRules = [requiredFields('slotId')];
exports.offlineBookingRules = [requiredFields('customerName', 'customerPhone')];
