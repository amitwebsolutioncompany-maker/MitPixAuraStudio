const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Employee = require('../models/Employee');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { activeHistoryWindow, purgeExpiredHistory } = require('../services/historyRetentionService');
const { todayIso } = require('../services/slotService');

function slotEndDate(slot) {
  return new Date(`${slot.date}T${slot.endTime}:00`);
}

function toMinutes(time) {
  const [hours, minutes] = String(time || '').split(':').map(Number);
  return hours * 60 + minutes;
}

function isWithinSalonHours(slot) {
  if (!slot.salon?.openingTime || !slot.salon?.closingTime) return true;
  const opening = toMinutes(slot.salon.openingTime);
  const closing = toMinutes(slot.salon.closingTime);
  return toMinutes(slot.startTime) >= opening && toMinutes(slot.endTime) <= closing;
}

exports.createBooking = asyncHandler(async (req, res) => {
  await purgeExpiredHistory();
  const { slotId, service, notes } = req.body;
  const slot = await Slot.findById(slotId).populate('salon', 'openingTime closingTime');
  if (!slot) throw new ApiError(404, 'Slot not found');
  if (slot.status !== 'available') throw new ApiError(409, 'Slot is not available');
  if (slot.date !== todayIso()) throw new ApiError(409, 'Only today slots can be booked');
  if (slotEndDate(slot) <= new Date()) throw new ApiError(409, 'Slot time is over');
  if (!isWithinSalonHours(slot)) throw new ApiError(409, 'This slot is outside salon working hours');

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
  await purgeExpiredHistory();
  const query = {};
  if (req.user.role === 'customer') query.customer = req.user._id;
  if (req.user.role === 'employee') {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) throw new ApiError(404, 'Employee profile not found');
    query.employee = employee._id;
  }

  let bookings = await Booking.find(query)
    .populate('salon', 'name address city')
    .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
    .populate('slot')
    .populate('service')
    .sort({ createdAt: -1 });

  if (req.user.role === 'customer' && req.query.scope === 'history') {
    const { startDate, endDate } = activeHistoryWindow();
    bookings = bookings.filter((booking) => (
      booking.status === 'completed' &&
      booking.slot?.date >= startDate &&
      booking.slot?.date <= endDate
    ));
  } else if (req.user.role === 'customer') {
    const today = todayIso();
    bookings = bookings.filter((booking) => booking.slot?.date === today);
  }

  res.json({ bookings });
});

exports.monthlyRewards = asyncHandler(async (_req, res) => {
  await purgeExpiredHistory();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const match = {
    status: 'completed',
    createdAt: { $gte: monthStart, $lt: nextMonth }
  };

  const [mostServices, mostPaid] = await Promise.all([
    Booking.aggregate([
      { $match: match },
      { $group: { _id: '$customerPhone', name: { $first: '$customerName' }, services: { $sum: 1 }, paid: { $sum: '$paymentAmount' } } },
      { $sort: { services: -1, paid: -1 } },
      { $limit: 1 }
    ]),
    Booking.aggregate([
      { $match: match },
      { $group: { _id: '$customerPhone', name: { $first: '$customerName' }, services: { $sum: 1 }, paid: { $sum: '$paymentAmount' } } },
      { $sort: { paid: -1, services: -1 } },
      { $limit: 1 }
    ])
  ]);

  res.json({
    month: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    serviceWinner: mostServices[0] || null,
    paymentWinner: mostPaid[0] || null,
    monthlyGift: 'Monthly reward gift for the highest paying customer'
  });
});

exports.listBookings = asyncHandler(async (req, res) => {
  await purgeExpiredHistory();
  const bookings = await Booking.find(req.query)
    .populate('customer', 'name phone')
    .populate('salon', 'name city')
    .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
    .populate('slot')
    .populate('service')
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
