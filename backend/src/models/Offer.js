const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    discountPercent: { type: Number, min: 0, max: 100 },
    startsAt: { type: Date },
    endsAt: { type: Date },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
