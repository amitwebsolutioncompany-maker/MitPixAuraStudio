const User = require('../models/User');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');
const Employee = require('../models/Employee');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');

const renewalMessage = 'Your subscription code has expired. Please contact +918574700615 to renew your subscription.';

function normalizeIndianPhone(rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  const phone = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  if (phone.length === 10 && /^[6-9]\d{9}$/.test(phone)) return phone;
  return null;
}

const serialize = (user, role = user.role) => ({
  id: user._id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  role,
  avatarUrl: user.avatarUrl,
  preferences: user.preferences,
  city: user.city,
  aadhaarNumber: user.aadhaarNumber,
  subscriptionCode: user.subscriptionCode,
  subscriptionPlan: user.subscriptionPlan,
  codeExpiresAt: user.codeExpiresAt,
  salonLimit: user.salonLimit
});

exports.customerLogin = asyncHandler(async (req, res) => {
  const { phone, name } = req.body;
  if (!phone) throw new ApiError(400, 'Phone is required');
  const normalizedPhone = normalizeIndianPhone(phone);
  if (!normalizedPhone) throw new ApiError(400, 'Enter a valid 10 digit mobile number. +91 is optional.');

  let user = await User.findOne({
    role: 'customer',
    phone: { $in: [normalizedPhone, `+91${normalizedPhone}`, `91${normalizedPhone}`] }
  });
  if (!user) {
    user = await User.create({ phone: normalizedPhone, name: name || 'Customer', role: 'customer' });
  } else {
    user.phone = normalizedPhone;
    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    await user.save();
  }

  if (user.role !== 'customer') throw new ApiError(403, 'Use staff login for this account');

  res.json({ token: signToken(user), user: serialize(user) });
});

exports.staffLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const user = await User.findOne({ email: email.toLowerCase(), role: 'employee' }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  const employee = await Employee.findOne({ user: user._id });
  res.json({ token: signToken(user), user: { ...serialize(user, 'employee'), employeeId: employee?._id, salonId: employee?.salon } });
});

exports.adminLogin = asyncHandler(async (req, res) => {
  const { email, password, aadhaarNumber } = req.body;
  if ((!email && !aadhaarNumber) || !password) throw new ApiError(400, 'Email/Aadhaar and password are required');

  const lookup = email ? { email: email.toLowerCase() } : { aadhaarNumber };
  const admin = await Admin.findOne(lookup).select('+password');
  if (!admin) throw new ApiError(401, 'Invalid credentials');

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');
  if (!admin.isActive) throw new ApiError(403, 'Admin account is inactive');
  if (admin.codeExpiresAt && admin.codeExpiresAt <= new Date()) throw new ApiError(403, renewalMessage);

  const authUser = admin.toObject();
  authUser.role = 'admin';
  res.json({ token: signToken(authUser), user: serialize(authUser, 'admin') });
});

exports.superAdminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const user = await SuperAdmin.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.isActive) throw new ApiError(401, 'Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  const authUser = user.toObject();
  authUser.role = 'superAdmin';
  res.json({ token: signToken(authUser), user: serialize(authUser, 'superAdmin') });
});

exports.me = asyncHandler(async (req, res) => {
  const employee = req.user.role === 'employee' ? await Employee.findOne({ user: req.user._id }) : null;
  res.json({ user: { ...serialize(req.user, req.user.role), employeeId: employee?._id, salonId: employee?.salon } });
});

exports.updateMe = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin' || req.user.role === 'superAdmin') {
    return res.json({ user: serialize(req.user, req.user.role) });
  }

  const updates = {};
  if (typeof req.body.name === 'string') updates.name = req.body.name.trim();
  if (typeof req.body.avatarUrl === 'string') updates.avatarUrl = req.body.avatarUrl.trim();
  if (req.body.preferences?.themeMode) updates.preferences = { themeMode: req.body.preferences.themeMode };

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  const employee = user.role === 'employee' ? await Employee.findOne({ user: user._id }) : null;
  res.json({ user: { ...serialize(user), employeeId: employee?._id, salonId: employee?.salon } });
});
