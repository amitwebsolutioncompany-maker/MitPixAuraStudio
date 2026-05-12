const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'hybrid' },
    duration: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);

