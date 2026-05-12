const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Employee = require('../models/Employee');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

exports.createBooking = asyncHandler(async (req, res) => {
  const { slotId, service, notes } = req.body;
  const slot = await Slot.findById(slotId);
  if (!slot) throw new ApiError(404, 'Slot not found');
  if (slot.status !== 'available') throw new ApiError(409, 'Slot is not available');

  const booking = await Booking.create({
    customer: req.user._id,
    customerName: req.user.name,
    customerPhone: req.user.phone,
    salon: slot.salon,
    employee: slot.employee,
    slot: slot._id,
    service,
    notes,
    status: 'booked'
  });

  slot.status = 'booked';
  slot.booking = booking._id;
  await slot.save();

  res.status(201).json({ booking });
});

exports.myBookings = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === 'customer') query.customer = req.user._id;
  if (req.user.role === 'employee') {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) throw new ApiError(404, 'Employee profile not found');
    query.employee = employee._id;
  }

  const bookings = await Booking.find(query)
    .populate('salon', 'name address city')
    .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
    .populate('slot')
    .populate('service')
    .sort({ createdAt: -1 });

  res.json({ bookings });
});

exports.listBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find(req.query)
    .populate('customer', 'name phone')
    .populate('salon', 'name city')
    .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
    .populate('slot')
    .sort({ createdAt: -1 });
  res.json({ bookings });
});

exports.updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!booking) throw new ApiError(404, 'Booking not found');
  res.json({ booking });
});

exports.deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  await Slot.findByIdAndUpdate(booking.slot, { status: 'available', booking: undefined });
  res.json({ message: 'Booking deleted' });
});
