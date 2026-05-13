const Booking = require('../models/Booking');
const Salon = require('../models/Salon');
const Employee = require('../models/Employee');
const Slot = require('../models/Slot');
const Offer = require('../models/Offer');
const asyncHandler = require('../utils/asyncHandler');
const { activeHistoryWindow, purgeExpiredHistory } = require('../services/historyRetentionService');
const { todayIso } = require('../services/slotService');

exports.dashboard = asyncHandler(async (_req, res) => {
  await purgeExpiredHistory();
  const [salons, employees, bookings, completed, occupiedSlots, offers, slotStatus, bookingStatus, perSalon, salonPerformance] = await Promise.all([
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
    ]),
    salonPerformanceSummaries()
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
    perSalon,
    salonPerformance
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

function emptySummary() {
  return { services: 0, totalPaid: 0 };
}

function addBooking(summary, booking) {
  summary.services += 1;
  summary.totalPaid += Number(booking.paymentAmount || 0);
}

async function completedBookings(match = {}) {
  return Booking.find({ status: 'completed', ...match })
    .populate({ path: 'employee', populate: { path: 'user', select: 'name phone email' } })
    .populate('customer', 'name phone')
    .populate('salon', 'name city address')
    .populate('slot')
    .sort({ updatedAt: -1 });
}

async function salonPerformanceSummaries() {
  const today = todayIso();
  const [salons, openBookings, todayBookings] = await Promise.all([
    Salon.find({ isActive: true }).sort({ city: 1, name: 1 }),
    openCompletedBookings(),
    completedBookings()
  ]);

  const grouped = {};
  salons.forEach((salon) => {
    grouped[String(salon._id)] = {
      salon,
      today: emptySummary(),
      period: emptySummary()
    };
  });

  todayBookings.forEach((booking) => {
    if (booking.slot?.date !== today) return;
    const id = String(booking.salon?._id || booking.salon);
    if (!grouped[id]) return;
    addBooking(grouped[id].today, booking);
  });

  openBookings.forEach((booking) => {
    const id = String(booking.salon?._id || booking.salon);
    if (!grouped[id]) return;
    addBooking(grouped[id].period, booking);
  });

  return Object.values(grouped);
}

exports.staffStatus = asyncHandler(async (req, res) => {
  await purgeExpiredHistory();
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
  await purgeExpiredHistory();
  const today = todayIso();
  const [salons, employees, bookings] = await Promise.all([
    Salon.find({ isActive: true }).sort({ city: 1, name: 1 }),
    Employee.find({ isActive: true })
      .populate('user', 'name phone email')
      .populate('salon', 'name city address')
      .sort({ salon: 1, createdAt: 1 }),
    openCompletedBookings()
  ]);

  const grouped = {};
  employees.forEach((employee) => {
    const id = String(employee._id);
    grouped[id] = {
      employee,
      salon: employee.salon,
      services: 0,
      totalPaid: 0,
      todayServices: 0,
      todayPaid: 0,
      periodServices: 0,
      periodPaid: 0,
      bookings: []
    };
  });

  bookings.forEach((booking) => {
    const id = String(booking.employee?._id || 'unknown');
    if (!grouped[id]) return;
    grouped[id].services += 1;
    grouped[id].totalPaid += Number(booking.paymentAmount || 0);
    grouped[id].periodServices += 1;
    grouped[id].periodPaid += Number(booking.paymentAmount || 0);
    if (booking.slot?.date === today) {
      grouped[id].todayServices += 1;
      grouped[id].todayPaid += Number(booking.paymentAmount || 0);
    }
    grouped[id].bookings.push(booking);
  });

  const staff = Object.values(grouped);
  const salonGroups = salons.map((salon) => ({
    salon,
    staff: staff.filter((item) => String(item.salon?._id || item.salon) === String(salon._id))
  }));

  res.json({ staff, salons: salonGroups });
});

exports.loyalCustomers = asyncHandler(async (_req, res) => {
  await purgeExpiredHistory();
  const { activeYear, startDate, endDate } = activeHistoryWindow();
  const customers = await Booking.aggregate([
    { $match: { status: 'completed' } },
    {
      $lookup: {
        from: 'slots',
        localField: 'slot',
        foreignField: '_id',
        as: 'slot',
      },
    },
    { $unwind: '$slot' },
    { $match: { 'slot.date': { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: '$customerPhone',
        name: { $first: '$customerName' },
        phone: { $first: '$customerPhone' },
        services: { $sum: 1 },
        totalPaid: { $sum: '$paymentAmount' },
        lastVisit: { $max: '$slot.date' },
      },
    },
    { $match: { services: { $gt: 20 }, phone: { $nin: [null, ''] } } },
    { $sort: { services: -1, totalPaid: -1, name: 1 } },
  ]);

  res.json({
    year: activeYear,
    startDate,
    endDate,
    customers,
  });
});

exports.closeStaffEarnings = asyncHandler(async (req, res) => {
  await Booking.updateMany(
    { employee: req.params.employeeId, status: 'completed', earningClosedAt: { $exists: false } },
    { earningClosedAt: new Date() }
  );
  res.json({ message: 'Staff earning status completed' });
});
