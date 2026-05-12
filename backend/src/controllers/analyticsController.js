const Booking = require('../models/Booking');
const Salon = require('../models/Salon');
const Employee = require('../models/Employee');
const Slot = require('../models/Slot');
const Offer = require('../models/Offer');
const asyncHandler = require('../utils/asyncHandler');

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
