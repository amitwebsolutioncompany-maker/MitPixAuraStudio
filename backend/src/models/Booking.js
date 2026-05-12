const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true, index: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true, unique: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    source: { type: String, enum: ['online', 'offline'], default: 'online' },
    customerName: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    status: { type: String, enum: ['booked', 'occupied', 'completed', 'cancelled'], default: 'booked' },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
