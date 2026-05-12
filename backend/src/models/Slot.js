const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true, index: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['available', 'booked', 'occupied', 'break', 'completed'],
      default: 'available',
      index: true
    },
    breakReason: { type: String, trim: true },
    offlineCustomerName: { type: String, trim: true },
    offlineCustomerPhone: { type: String, trim: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
  },
  { timestamps: true }
);

slotSchema.index({ employee: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);
