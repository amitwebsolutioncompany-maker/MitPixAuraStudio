const User = require('../models/User');
const Employee = require('../models/Employee');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');

const serialize = (user) => ({
  id: user._id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  preferences: user.preferences
});

exports.customerLogin = asyncHandler(async (req, res) => {
  const { phone, name } = req.body;
  if (!phone) throw new ApiError(400, 'Phone is required');

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone, name: name || 'Customer', role: 'customer' });
  }

  if (user.role !== 'customer') throw new ApiError(403, 'Use staff login for this account');

  res.json({ token: signToken(user), user: serialize(user) });
});

exports.staffLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !['employee', 'admin'].includes(user.role)) throw new ApiError(401, 'Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  const employee = user.role === 'employee' ? await Employee.findOne({ user: user._id }) : null;
  res.json({ token: signToken(user), user: { ...serialize(user), employeeId: employee?._id, salonId: employee?.salon } });
});

exports.me = asyncHandler(async (req, res) => {
  const employee = req.user.role === 'employee' ? await Employee.findOne({ user: req.user._id }) : null;
  res.json({ user: { ...serialize(req.user), employeeId: employee?._id, salonId: employee?.salon } });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const updates = {};
  if (typeof req.body.name === 'string') updates.name = req.body.name.trim();
  if (typeof req.body.avatarUrl === 'string') updates.avatarUrl = req.body.avatarUrl.trim();
  if (req.body.preferences?.themeMode) updates.preferences = { themeMode: req.body.preferences.themeMode };

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  const employee = user.role === 'employee' ? await Employee.findOne({ user: user._id }) : null;
  res.json({ user: { ...serialize(user), employeeId: employee?._id, salonId: employee?.salon } });
});
