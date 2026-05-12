const Slot = require('../models/Slot');
const Employee = require('../models/Employee');
const Booking = require('../models/Booking');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateSlotsForEmployee, generateSlotsForSalon, todayIso } = require('../services/slotService');

async function assertOwnEmployee(req, employeeId) {
  if (req.user.role === 'admin') return;
  const employee = await Employee.findOne({ _id: employeeId, user: req.user._id });
  if (!employee) throw new ApiError(403, 'Employees can only manage their own slots');
}

exports.listSlots = asyncHandler(async (req, res) => {
  const date = req.query.date || todayIso();
  if (req.query.employee) await generateSlotsForEmployee(req.query.employee, date);
  if (req.query.salon) await generateSlotsForSalon(req.query.salon, date);

  const query = { date };
  if (req.query.employee) query.employee = req.query.employee;
  if (req.query.salon) query.salon = req.query.salon;
  if (req.query.status) query.status = req.query.status;

  const slots = await Slot.find(query)
    .populate({ path: 'employee', populate: { path: 'user', select: 'name email phone' } })
    .populate('salon', 'name city address')
    .sort({ employee: 1, startTime: 1 });
  res.json({ slots });
});

exports.markOccupied = asyncHandler(async (req, res) => {
  const { customerName, customerPhone } = req.body;
  const slot = await Slot.findById(req.params.id);
  if (!slot) throw new ApiError(404, 'Slot not found');
  await assertOwnEmployee(req, slot.employee);
  if (slot.status !== 'available') throw new ApiError(409, 'Slot is not available');

  const booking = await Booking.create({
    salon: slot.salon,
    employee: slot.employee,
    slot: slot._id,
    source: 'offline',
    customerName,
    customerPhone,
    status: 'occupied'
  });

  slot.status = 'occupied';
  slot.booking = booking._id;
  slot.offlineCustomerName = customerName;
  slot.offlineCustomerPhone = customerPhone;
  await slot.save();

  res.json({ slot, booking });
});

exports.setBreak = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) throw new ApiError(404, 'Slot not found');
  await assertOwnEmployee(req, slot.employee);
  if (slot.status !== 'available') throw new ApiError(409, 'Only available slots can be marked as break');

  slot.status = 'break';
  slot.breakReason = req.body.reason || 'Break';
  await slot.save();
  res.json({ slot });
});

exports.completeSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) throw new ApiError(404, 'Slot not found');
  await assertOwnEmployee(req, slot.employee);
  if (!['booked', 'occupied'].includes(slot.status)) throw new ApiError(409, 'Only booked or occupied slots can be completed');

  slot.status = 'completed';
  await slot.save();
  if (slot.booking) await Booking.findByIdAndUpdate(slot.booking, { status: 'completed' });
  res.json({ slot });
});
