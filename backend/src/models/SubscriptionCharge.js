const mongoose = require('mongoose');
const { subscriptionPlans } = require('./Admin');

const subscriptionChargeSchema = new mongoose.Schema(
  {
    plan: { type: String, enum: subscriptionPlans, required: true, unique: true, index: true },
    label: { type: String, required: true, trim: true },
    amount: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubscriptionCharge', subscriptionChargeSchema);
