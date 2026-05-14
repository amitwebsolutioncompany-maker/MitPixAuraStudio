const Booking = require('../models/Booking');
const Salon = require('../models/Salon');
const Employee = require('../models/Employee');
const Slot = require('../models/Slot');
const Offer = require('../models/Offer');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { activeHistoryWindow, purgeExpiredHistory } = require('../services/historyRetentionService');
const { todayIso } = require('../services/slotService');

async function ownedSalonIds(req) {
  if (req.user?.role !== 'admin') return null;
  return Salon.find({ admin: req.user._id }).distinct('_id');
}

exports.dashboard = asyncHandler(async (req, res) => {
  await purgeExpiredHistory();
  const salonIds = await ownedSalonIds(req);
  const salonMatch = salonIds ? { _id: { $in: salonIds } } : { isActive: true };
  const relatedMatch = salonIds ? { salon: { $in: salonIds } } : {};
  const [salons, employees, bookings, completed, occupiedSlots, offers, slotStatus, bookingStatus, perSalon, salonPerformance] = await Promise.all([
    Salon.countDocuments({ isActive: true, ...(salonIds ? { _id: { $in: salonIds } } : {}) }),
    Employee.countDocuments({ isActive: true, ...relatedMatch }),
    Booking.countDocuments(relatedMatch),
    Booking.countDocuments({ status: 'completed', ...relatedMatch }),
    Slot.countDocuments({ status: { $in: ['booked', 'occupied'] }, ...relatedMatch }),
    Offer.countDocuments({ isActive: true }),
    Slot.aggregate([{ $match: relatedMatch }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.aggregate([{ $match: relatedMatch }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Salon.aggregate([
      { $match: salonMatch },
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
    salonPerformanceSummaries(salonIds)
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

async function salonPerformanceSummaries(salonIds = null) {
  const today = todayIso();
  const relatedMatch = salonIds ? { salon: { $in: salonIds } } : {};
  const [salons, openBookings, todayBookings] = await Promise.all([
    Salon.find({ isActive: true, ...(salonIds ? { _id: { $in: salonIds } } : {}) }).sort({ city: 1, name: 1 }),
    openCompletedBookings(relatedMatch),
    completedBookings(relatedMatch)
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

exports.staffEarnings = asyncHandler(async (req, res) => {
  await purgeExpiredHistory();
  const today = todayIso();
  const salonIds = await ownedSalonIds(req);
  const relatedMatch = salonIds ? { salon: { $in: salonIds } } : {};
  const [salons, employees, bookings] = await Promise.all([
    Salon.find({ isActive: true, ...(salonIds ? { _id: { $in: salonIds } } : {}) }).sort({ city: 1, name: 1 }),
    Employee.find({ isActive: true, ...relatedMatch })
      .populate('user', 'name phone email')
      .populate('salon', 'name city address')
      .sort({ salon: 1, createdAt: 1 }),
    openCompletedBookings(relatedMatch)
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

exports.loyalCustomers = asyncHandler(async (req, res) => {
  await purgeExpiredHistory();
  const salonIds = await ownedSalonIds(req);
  const { activeYear, startDate, endDate } = activeHistoryWindow();
  const customers = await Booking.aggregate([
    { $match: { status: 'completed', ...(salonIds ? { salon: { $in: salonIds } } : {}) } },
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
    { $match: { services: { $gte: 20 }, phone: { $nin: [null, ''] } } },
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
  if (req.user.role === 'admin') {
    const employee = await Employee.findOne({ _id: req.params.employeeId, admin: req.user._id });
    if (!employee) throw new ApiError(403, 'You do not have permission for this employee');
  }
  await Booking.updateMany(
    { employee: req.params.employeeId, status: 'completed', earningClosedAt: { $exists: false } },
    { earningClosedAt: new Date() }
  );
  res.json({ message: 'Staff earning status completed' });
});
