const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    openingTime: { type: String, required: true, default: '10:00' },
    closingTime: { type: String, required: true, default: '22:00' },
    totalChairs: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Salon', salonSchema);
