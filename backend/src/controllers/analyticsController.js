const Booking = require('../models/Booking');
const Salon = require('../models/Salon');
const Employee = require('../models/Employee');
const Slot = require('../models/Slot');
const Offer = require('../models/Offer');
const asyncHandler = require('../utils/asyncHandler');
const { todayIso } = require('../services/slotService');

exports.dashboard = asyncHandler(async (_req, res) => {
  const [salons, employees, bookings, completed, occupiedSlots, offers, slotStatus, bookingStatus, perSalon] = await Promise.all([
    Salon.countDocuments({ isActive: true }),
    Employee.countDocuments({ isActive: true }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'completed' }),
    Slot.countDocuments({ status: { $in: ['booked', 'occupied'] } }),
    Offer.countDocuments({ isActive: true }),
    Slot.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Salon.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'salon',
          as: 'employees'
        }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'salon',
          as: 'bookings'
        }
      },
      {
        $project: {
          name: 1,
          city: 1,
          employees: {
            $size: {
              $filter: {
                input: '$employees',
                as: 'employee',
                cond: { $eq: ['$$employee.isActive', true] }
              }
            }
          },
          bookings: { $size: '$bookings' }
        }
      },
      { $sort: { city: 1, name: 1 } }
    ])
  ]);

  res.json({
    salons,
    employees,
    bookings,
    completed,
    occupiedSlots,
    offers,
    slotStatus,
    bookingStatus,
    perSalon
  });
});

async function openCompletedBookings(match = {}) {
  return Booking.find({ status: 'completed', earningClosedAt: { $exists: false }, ...match })
    .populate({ path: 'employee', populate: { path: 'user', select: 'name phone email' } })
    .populate('customer', 'name phone')
    .populate('salon', 'name city')
    .populate('slot')
    .sort({ updatedAt: -1 });
}

function summarizeBookings(bookings) {
  return {
    services: bookings.length,
    totalPaid: bookings.reduce((sum, booking) => sum + Number(booking.paymentAmount || 0), 0)
  };
}

exports.staffStatus = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) {
    return res.json({
      services: 0,
      totalPaid: 0,
      todayServices: 0,
      todayPaid: 0,
      periodServices: 0,
      periodPaid: 0,
      bookings: []
    });
  }
  const bookings = await openCompletedBookings({ employee: employee._id });
  const today = todayIso();
  const periodSummary = summarizeBookings(bookings);
  const todaySummary = summarizeBookings(bookings.filter((booking) => booking.slot?.date === today));
  res.json({
    services: periodSummary.services,
    totalPaid: periodSummary.totalPaid,
    todayServices: todaySummary.services,
    todayPaid: todaySummary.totalPaid,
    periodServices: periodSummary.services,
    periodPaid: periodSummary.totalPaid,
    bookings
  });
});

exports.staffEarnings = asyncHandler(async (_req, res) => {
  const bookings = await openCompletedBookings();
  const grouped = {};
  bookings.forEach((booking) => {
    const id = String(booking.employee?._id || 'unknown');
    if (!grouped[id]) grouped[id] = {
      employee: booking.employee,
      salon: booking.salon,
      services: 0,
      totalPaid: 0,
      bookings: []
    };
    grouped[id].services += 1;
    grouped[id].totalPaid += Number(booking.paymentAmount || 0);
    grouped[id].bookings.push(booking);
  });
  res.json({ staff: Object.values(grouped) });
});

exports.closeStaffEarnings = asyncHandler(async (req, res) => {
  await Booking.updateMany(
    { employee: req.params.employeeId, status: 'completed', earningClosedAt: { $exists: false } },
    { earningClosedAt: new Date() }
  );
  res.json({ message: 'Staff earning status completed' });
});
