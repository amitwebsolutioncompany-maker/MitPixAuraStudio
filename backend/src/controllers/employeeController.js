const User = require('../models/User');
const Employee = require('../models/Employee');
const Salon = require('../models/Salon');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateSlotsForEmployee } = require('../services/slotService');

exports.listEmployees = asyncHandler(async (req, res) => {
  const query = { isActive: true };
  if (req.query.salon) query.salon = req.query.salon;
  const employees = await Employee.find(query).populate('user', 'name email phone').populate('salon', 'name city');
  res.json({ employees });
});

exports.createEmployee = asyncHandler(async (req, res) => {
  const { name, email, phone, password, salon, title, specialties, isManager } = req.body;
  if (!name || !email || !password || !salon) throw new ApiError(400, 'Name, email, password and salon are required');

  const salonExists = await Salon.findOne({ _id: salon, isActive: true });
  if (!salonExists) throw new ApiError(404, 'Selected salon not found');

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new ApiError(409, 'Employee email already exists');

  const user = await User.create({ name, email, phone, password, role: 'employee' });
  let employee;
  try {
    if (isManager) await Employee.updateMany({ salon }, { isManager: false });
    employee = await Employee.create({ user: user._id, salon, title, specialties, isManager: Boolean(isManager) });
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
  await generateSlotsForEmployee(employee._id);

  res.status(201).json({
    employee: await employee.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'salon', select: 'name city address' }
    ])
  });
});

exports.updateEmployee = asyncHandler(async (req, res) => {
  const { name, email, phone, password, title, specialties, salon, isActive, isManager } = req.body;
  const employeeUpdates = {};
  if (typeof title === 'string') employeeUpdates.title = title;
  if (Array.isArray(specialties)) employeeUpdates.specialties = specialties;
  if (salon) employeeUpdates.salon = salon;
  if (typeof isActive === 'boolean') employeeUpdates.isActive = isActive;
  if (typeof isManager === 'boolean') employeeUpdates.isManager = isManager;

  if (isManager) {
    const target = await Employee.findById(req.params.id);
    await Employee.updateMany({ salon: salon || target?.salon, _id: { $ne: req.params.id } }, { isManager: false });
  }

  const employee = await Employee.findByIdAndUpdate(req.params.id, employeeUpdates, { new: true, runValidators: true });
  if (!employee) throw new ApiError(404, 'Employee not found');
  const user = await User.findById(employee.user).select('+password');
  if (user) {
    if (typeof name === 'string') user.name = name.trim();
    if (typeof email === 'string') user.email = email.trim().toLowerCase();
    if (typeof phone === 'string') user.phone = phone.trim();
    if (typeof password === 'string' && password) user.password = password;
    await user.save();
  }
  await generateSlotsForEmployee(employee._id, req.query.date);
  res.json({
    employee: await employee.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'salon', select: 'name city address' }
    ])
  });
});

exports.deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!employee) throw new ApiError(404, 'Employee not found');
  await User.findByIdAndUpdate(employee.user, { isActive: false });
  res.json({ message: 'Employee deleted' });
});
