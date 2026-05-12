const mongoose = require('mongoose');

const functionRequestSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventType: { type: String, required: true, trim: true },
    eventDate: { type: String, trim: true },
    guests: { type: Number, min: 0, default: 0 },
    location: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: ['requested', 'confirmed', 'completed', 'cancelled'], default: 'requested' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FunctionRequest', functionRequestSchema);

