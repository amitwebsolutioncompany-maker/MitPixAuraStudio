const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true, sparse: true, index: true },
    email: { type: String, trim: true, lowercase: true, sparse: true, index: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['customer', 'employee'], required: true, default: 'customer' },
    avatarUrl: { type: String, trim: true },
    preferences: {
      themeMode: { type: String, enum: ['luxury', 'light'], default: 'luxury' }
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password || '');
};

module.exports = mongoose.model('User', userSchema);
