const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const subscriptionPlans = ['demo10min', 'demo5day', 'month1', 'month6', 'year1'];

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    city: { type: String, trim: true },
    aadhaarNumber: { type: String, trim: true, sparse: true, index: true },
    subscriptionCode: { type: String, trim: true, index: true },
    codeExpiresAt: { type: Date, required: true },
    subscriptionPlan: { type: String, enum: subscriptionPlans, default: 'demo5day' },
    salonLimit: { type: Number, min: 0, default: 1 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin' }
  },
  { timestamps: true }
);

adminSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password || '');
};

adminSchema.virtual('role').get(() => 'admin');

module.exports = mongoose.model('Admin', adminSchema);
module.exports.subscriptionPlans = subscriptionPlans;
