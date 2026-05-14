const Slot = require('../models/Slot');
const Employee = require('../models/Employee');
const Booking = require('../models/Booking');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { purgeExpiredHistory } = require('../services/historyRetentionService');
const { generateSlotsForEmployee, generateSlotsForSalon, todayIso } = require('../services/slotService');

function normalizeIndianPhone(rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  const phone = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return phone.length === 10 && /^[6-9]\d{9}$/.test(phone) ? phone : null;
}

function toMinutes(time) {
  const [hours, minutes] = String(time || '').split(':').map(Number);
  return hours * 60 + minutes;
}

function withinSalonHours(slot) {
  if (!slot.salon?.openingTime || !slot.salon?.closingTime) return true;
  const opening = toMinutes(slot.salon.openingTime);
  const closing = toMinutes(slot.salon.closingTime);
  return toMinutes(slot.startTime) >= opening && toMinutes(slot.endTime) <= closing;
}

function slotStartDate(slot) {
  return new Date(`${slot.date}T${slot.startTime}:00`);
}

function slotEndDate(slot) {
  return new Date(`${slot.date}T${slot.endTime}:00`);
}

function isSlotEnded(slot) {
  return slotEndDate(slot) <= new Date();
}

function isBookedNoShowEditable(slot) {
  return new Date() >= new Date(slotStartDate(slot).getTime() + 10000) && !isSlotEnded(slot);
}

async function assertOwnEmployee(req, employeeId) {
  if (req.user.role === 'admin') {
    const employee = await Employee.findOne({ _id: employeeId, admin: req.user._id });
    if (!employee) throw new ApiError(403, 'You do not have permission for this employee');
    return;
  }
  const employee = await Employee.findOne({ _id: employeeId, user: req.user._id });
  if (!employee) throw new ApiError(403, 'Employees can only manage their own slots');
}

async function employeeForRequest(req, employeeId) {
  if (req.user.role === 'admin') {
    if (!employeeId) throw new ApiError(400, 'Employee is required');
    const employee = await Employee.findOne({ _id: employeeId, admin: req.user._id });
    if (!employee) throw new ApiError(404, 'Employee profile not found');
    return employee;
  }
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) throw new ApiError(404, 'Employee profile not found');
  if (employeeId && String(employee._id) !== String(employeeId)) {
    throw new ApiError(403, 'Employees can only manage their own slots');
  }
  return employee;
}

exports.listSlots = asyncHandler(async (req, res) => {
  await purgeExpiredHistory();
  const date = req.query.date || todayIso();
  if (req.user.role === 'customer' && date !== todayIso()) throw new ApiError(400, 'Customers can only view today slots');
  let employeeId = req.query.employee;
  if (req.user.role === 'employee') {
    const employee = await employeeForRequest(req, employeeId);
    employeeId = employee._id;
    await generateSlotsForEmployee(employee._id, date);
  } else {
    if (req.user.role === 'admin' && employeeId) await employeeForRequest(req, employeeId);
    if (employeeId) await generateSlotsForEmployee(employeeId, date);
    if (req.query.salon) {
      if (req.user.role === 'admin') {
        const employeeCount = await Employee.countDocuments({ salon: req.query.salon, admin: req.user._id });
        if (!employeeCount) throw new ApiError(403, 'You do not have permission for this salon');
      }
      await generateSlotsForSalon(req.query.salon, date);
    }
  }

  const query = { date };
  if (employeeId) query.employee = employeeId;
  if (req.query.salon && req.user.role !== 'employee') query.salon = req.query.salon;
  if (req.query.status) query.status = req.query.status;
  if (req.user.role === 'admin') query.admin = req.user._id;

  const slots = await Slot.find(query)
    .populate({ path: 'employee', populate: { path: 'user', select: 'name email phone' } })
    .populate('salon', 'name city address openingTime closingTime')
    .populate({ path: 'booking', populate: [{ path: 'service' }, { path: 'customer', select: 'name phone' }] })
    .sort({ employee: 1, startTime: 1 });
  res.json({ slots: slots.filter(withinSalonHours) });
});

exports.markOccupied = asyncHandler(async (req, res) => {
  const { customerName, customerPhone } = req.body;
  const slot = await Slot.findById(req.params.id);
  if (!slot) throw new ApiError(404, 'Slot not found');
  await assertOwnEmployee(req, slot.employee);
  const canReplaceNoShow = slot.status === 'booked' && isBookedNoShowEditable(slot);
  if (!['available', 'break'].includes(slot.status) && !canReplaceNoShow) throw new ApiError(409, 'Slot is not available');
  if (slot.date !== todayIso()) throw new ApiError(409, 'Only today slots can be booked');
  if (isSlotEnded(slot)) throw new ApiError(409, 'Slot time is over');

  const normalizedPhone = normalizeIndianPhone(customerPhone);
  if (!normalizedPhone) throw new ApiError(400, 'Enter a valid 10 digit mobile number. +91 is optional.');
  let customer = await User.findOne({ role: 'customer', phone: { $in: [normalizedPhone, `+91${normalizedPhone}`, `91${normalizedPhone}`] } });
  if (!customer) {
    customer = await User.create({ role: 'customer', phone: normalizedPhone, name: customerName || 'Walk-in Customer' });
  } else {
    customer.phone = normalizedPhone;
    if (customerName) customer.name = customerName;
    await customer.save();
  }

  const bookingPayload = {
    customer: customer._id,
    salon: slot.salon,
    employee: slot.employee,
    admin: slot.admin,
    slot: slot._id,
    source: 'offline',
    customerName,
    customerPhone: normalizedPhone,
    status: 'occupied',
    notes: canReplaceNoShow ? 'Original booked customer did not arrive. Replaced by walk-in.' : undefined
  };

  const booking = canReplaceNoShow && slot.booking
    ? await Booking.findByIdAndUpdate(slot.booking, bookingPayload, { new: true, runValidators: true })
    : await Booking.create(bookingPayload);

  slot.status = 'occupied';
  slot.booking = booking._id;
  slot.breakReason = undefined;
  slot.offlineCustomerName = customerName;
  slot.offlineCustomerPhone = normalizedPhone;
  await slot.save();

  res.json({ slot, booking });
});

exports.setBreak = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) throw new ApiError(404, 'Slot not found');
  await assertOwnEmployee(req, slot.employee);
  const canReplaceNoShow = slot.status === 'booked' && isBookedNoShowEditable(slot);
  if (!['available', 'break'].includes(slot.status) && !canReplaceNoShow) throw new ApiError(409, 'Only available slots can be marked as break');
  if (slot.date !== todayIso()) throw new ApiError(409, 'Only today slots can be marked as break');
  if (isSlotEnded(slot)) throw new ApiError(409, 'Slot time is over');
  if (canReplaceNoShow && slot.booking) {
    await Booking.findByIdAndUpdate(slot.booking, {
      $set: {
        status: 'cancelled',
        notes: 'Original booked customer did not arrive. Slot marked as break.'
      },
      $unset: { slot: 1 }
    });
    slot.booking = undefined;
  }

  slot.status = 'break';
  slot.breakReason = req.body.reason || 'Break';
  slot.offlineCustomerName = undefined;
  slot.offlineCustomerPhone = undefined;
  await slot.save();
  res.json({ slot });
});

exports.setAvailable = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) throw new ApiError(404, 'Slot not found');
  await assertOwnEmployee(req, slot.employee);
  if (slot.status !== 'break') throw new ApiError(409, 'Only break slots can be reopened');
  if (slot.date !== todayIso()) throw new ApiError(409, 'Only today slots can be reopened');
  if (isSlotEnded(slot)) throw new ApiError(409, 'Slot time is over');

  slot.status = 'available';
  slot.breakReason = undefined;
  await slot.save();
  res.json({ slot });
});

exports.setDayBreak = asyncHandler(async (req, res) => {
  const date = req.body.date || todayIso();
  if (date !== todayIso()) throw new ApiError(409, 'Only today slots can be marked as break');

  const employee = await employeeForRequest(req, req.body.employee);
  await generateSlotsForEmployee(employee._id, date);

  const result = await Slot.updateMany(
    { employee: employee._id, date, status: 'available' },
    { status: 'break', breakReason: req.body.reason || 'Staff leave' }
  );

  res.json({
    message: 'Today available slots marked as break',
    updated: result.modifiedCount || 0
  });
});

exports.completeSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) throw new ApiError(404, 'Slot not found');
  await assertOwnEmployee(req, slot.employee);
  if (!['booked', 'occupied'].includes(slot.status)) throw new ApiError(409, 'Only booked or occupied slots can be completed');

  const paymentAmount = Number(req.body.paymentAmount || 0);
  slot.status = 'completed';
  await slot.save();
  if (slot.booking) {
    await Booking.findByIdAndUpdate(slot.booking, {
      status: 'completed',
      completedServiceName: req.body.completedServiceName,
      paymentAmount: Number.isNaN(paymentAmount) ? 0 : paymentAmount,
      paymentMode: req.body.paymentMode || 'cash',
      paymentNotes: req.body.paymentNotes
    });
  }
  res.json({ slot });
});
