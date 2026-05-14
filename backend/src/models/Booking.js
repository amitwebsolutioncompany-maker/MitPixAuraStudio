const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true, index: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', index: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true, unique: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    source: { type: String, enum: ['online', 'offline'], default: 'online' },
    customerName: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    completedServiceName: { type: String, trim: true },
    paymentAmount: { type: Number, min: 0, default: 0 },
    paymentMode: { type: String, enum: ['cash', 'online'], default: 'cash' },
    paymentNotes: { type: String, trim: true },
    earningClosedAt: { type: Date },
    status: { type: String, enum: ['booked', 'occupied', 'completed', 'cancelled'], default: 'booked' },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
