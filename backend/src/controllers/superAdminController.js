const Admin = require('../models/Admin');
const Salon = require('../models/Salon');
const Employee = require('../models/Employee');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const SubscriptionCharge = require('../models/SubscriptionCharge');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { activeHistoryWindow, purgeExpiredHistory } = require('../services/historyRetentionService');

const planLabels = {
  demo10min: 'Demo 10 min',
  demo5day: 'Demo 5 day',
  month1: '1 month',
  month6: '6 month',
  year1: '1 year'
};

function expiryForPlan(plan) {
  const date = new Date();
  if (plan === 'demo10min') date.setMinutes(date.getMinutes() + 10);
  else if (plan === 'demo5day') date.setDate(date.getDate() + 5);
  else if (plan === 'month1') date.setMonth(date.getMonth() + 1);
  else if (plan === 'month6') date.setMonth(date.getMonth() + 6);
  else if (plan === 'year1') date.setFullYear(date.getFullYear() + 1);
  else throw new ApiError(400, 'Invalid subscription duration');
  return date;
}

function serializeAdmin(admin) {
  return {
    id: admin._id,
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    city: admin.city,
    aadhaarNumber: admin.aadhaarNumber,
    subscriptionCode: admin.subscriptionCode,
    subscriptionPlan: admin.subscriptionPlan,
    codeExpiresAt: admin.codeExpiresAt,
    salonLimit: admin.salonLimit,
    isActive: admin.isActive,
    createdAt: admin.createdAt
  };
}

function adminPayload(body, current = {}) {
  const payload = {};
  ['name', 'email', 'phone', 'city', 'aadhaarNumber', 'subscriptionCode'].forEach((field) => {
    if (typeof body[field] === 'string') payload[field] = body[field].trim();
  });
  if (payload.email) payload.email = payload.email.toLowerCase();
  if (typeof body.isActive === 'boolean') payload.isActive = body.isActive;
  if (body.salonLimit !== undefined) payload.salonLimit = Number(body.salonLimit || 0);
  if (body.subscriptionPlan) {
    payload.subscriptionPlan = body.subscriptionPlan;
    payload.codeExpiresAt = expiryForPlan(body.subscriptionPlan);
  } else if (body.codeExpiresAt) {
    payload.codeExpiresAt = new Date(body.codeExpiresAt);
  } else if (!current.codeExpiresAt) {
    payload.subscriptionPlan = 'demo5day';
    payload.codeExpiresAt = expiryForPlan('demo5day');
  }
  if (body.password) payload.password = body.password;
  return payload;
}

exports.dashboard = asyncHandler(async (_req, res) => {
  await purgeExpiredHistory();
  const now = new Date();
  const [totalAdmins, totalSalons, vipCustomers, expiredAdmins] = await Promise.all([
    Admin.countDocuments({ isActive: true }),
    Salon.countDocuments({ isActive: true }),
    exports.loyalCustomersData(),
    Admin.find({ codeExpiresAt: { $lte: now } }).sort({ codeExpiresAt: 1 })
  ]);

  res.json({
    totalAdmins,
    totalSalons,
    totalVipCustomers: vipCustomers.customers.length,
    expiredAdmins: expiredAdmins.map(serializeAdmin)
  });
});

exports.listAdmins = asyncHandler(async (_req, res) => {
  const admins = await Admin.find().sort({ createdAt: -1 });
  res.json({ admins: admins.map(serializeAdmin) });
});

exports.createAdmin = asyncHandler(async (req, res) => {
  const payload = adminPayload(req.body);
  if (!payload.name || !payload.email || !payload.password) throw new ApiError(400, 'Admin name, email and password are required');
  const exists = await Admin.findOne({ email: payload.email });
  if (exists) throw new ApiError(409, 'Admin email already exists');
  const admin = await Admin.create({ ...payload, createdBy: req.user._id });
  res.status(201).json({ admin: serializeAdmin(admin) });
});

exports.updateAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id).select('+password');
  if (!admin) throw new ApiError(404, 'Admin not found');
  Object.assign(admin, adminPayload(req.body, admin));
  await admin.save();
  res.json({ admin: serializeAdmin(admin) });
});

exports.deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!admin) throw new ApiError(404, 'Admin not found');
  res.json({ message: 'Admin deactivated', admin: serializeAdmin(admin) });
});

exports.adminData = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) throw new ApiError(404, 'Admin not found');
  const salonIds = await Salon.find({ admin: admin._id }).distinct('_id');
  const [salons, staff, bookings, services] = await Promise.all([
    Salon.find({ _id: { $in: salonIds } }).sort({ city: 1, name: 1 }),
    Employee.countDocuments({ salon: { $in: salonIds }, isActive: true }),
    Booking.countDocuments({ salon: { $in: salonIds } }),
    Service.countDocuments({ salon: { $in: salonIds }, isActive: true })
  ]);
  res.json({
    admin: serializeAdmin(admin),
    salons,
    counts: { salons: salons.length, staff, bookings, services }
  });
});

exports.listSubscriptions = asyncHandler(async (_req, res) => {
  const charges = await SubscriptionCharge.find().sort({ plan: 1 });
  res.json({ subscriptions: charges });
});

exports.upsertSubscription = asyncHandler(async (req, res) => {
  const { plan } = req.params;
  const label = req.body.label || planLabels[plan] || plan;
  const amount = Number(req.body.amount || 0);
  const subscription = await SubscriptionCharge.findOneAndUpdate(
    { plan },
    { plan, label, amount, isActive: req.body.isActive !== false },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ subscription });
});

exports.loyalCustomersData = async function loyalCustomersData() {
  const { activeYear, startDate, endDate } = activeHistoryWindow();
  const customers = await Booking.aggregate([
    { $match: { status: 'completed' } },
    { $lookup: { from: 'slots', localField: 'slot', foreignField: '_id', as: 'slot' } },
    { $unwind: '$slot' },
    { $match: { 'slot.date': { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: '$customerPhone',
        name: { $first: '$customerName' },
        phone: { $first: '$customerPhone' },
        services: { $sum: 1 },
        totalPaid: { $sum: '$paymentAmount' },
        lastVisit: { $max: '$slot.date' }
      }
    },
    { $match: { services: { $gte: 20 }, phone: { $nin: [null, ''] } } },
    { $sort: { services: -1, totalPaid: -1, name: 1 } }
  ]);
  return { year: activeYear, startDate, endDate, customers };
};

exports.loyalCustomers = asyncHandler(async (_req, res) => {
  await purgeExpiredHistory();
  res.json(await exports.loyalCustomersData());
});

exports.adminSubscription = asyncHandler(async (req, res) => {
  const [admin, subscriptions] = await Promise.all([
    Admin.findById(req.user._id),
    SubscriptionCharge.find({ isActive: true }).sort({ plan: 1 })
  ]);
  res.json({ admin: serializeAdmin(admin), subscriptions, renewalContact: '+918574700615' });
});
