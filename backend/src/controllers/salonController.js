const Salon = require('../models/Salon');
const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { generateSlotsForSalon } = require('../services/slotService');

function timeToMinutes(time) {
  const [hours, minutes] = String(time || '').split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function validateSalonHours(payload) {
  const opening = timeToMinutes(payload.openingTime || '10:00');
  const closing = timeToMinutes(payload.closingTime || '22:00');
  if (opening === null || closing === null || opening >= closing) {
    throw new ApiError(400, 'Opening time must be before closing time in HH:mm format');
  }
}

exports.listSalons = asyncHandler(async (req, res) => {
  const query = { isActive: true };
  if (req.user?.role === 'admin') query.admin = req.user._id;
  if (req.user?.role !== 'admin') {
    query.admin = { $in: await Admin.find({ isActive: true, codeExpiresAt: { $gt: new Date() } }).distinct('_id') };
  }
  if (req.query.city) query.city = new RegExp(req.query.city, 'i');
  if (req.query.q) {
    const search = new RegExp(req.query.q, 'i');
    query.$or = [{ name: search }, { city: search }, { address: search }];
  }
  const salons = await Salon.find(query).sort({ city: 1, name: 1 });
  res.json({ salons });
});

exports.getSalon = asyncHandler(async (req, res) => {
  const salon = await Salon.findById(req.params.id);
  if (!salon) throw new ApiError(404, 'Salon not found');
  if (req.user?.role === 'admin' && String(salon.admin) !== String(req.user._id)) {
    throw new ApiError(403, 'You do not have permission for this salon');
  }
  if (req.user?.role !== 'admin') {
    const activeAdmin = await Admin.exists({ _id: salon.admin, isActive: true, codeExpiresAt: { $gt: new Date() } });
    if (!activeAdmin || salon.isActive === false) throw new ApiError(404, 'Salon not found');
  }
  res.json({ salon });
});

exports.createSalon = asyncHandler(async (req, res) => {
  validateSalonHours(req.body);
  const activeCount = await Salon.countDocuments({ admin: req.user._id, isActive: true });
  if (activeCount >= Number(req.user.salonLimit || 0)) {
    throw new ApiError(403, 'Salon limit reached for your subscription.');
  }
  const salon = await Salon.create({ ...req.body, admin: req.user._id });
  res.status(201).json({ salon });
});

exports.updateSalon = asyncHandler(async (req, res) => {
  validateSalonHours(req.body);
  const salon = await Salon.findOneAndUpdate(
    { _id: req.params.id, admin: req.user._id },
    { ...req.body, admin: req.user._id },
    { new: true, runValidators: true }
  );
  if (!salon) throw new ApiError(404, 'Salon not found');
  await generateSlotsForSalon(salon._id, req.query.date);
  res.json({ salon });
});

exports.deleteSalon = asyncHandler(async (req, res) => {
  const salon = await Salon.findOneAndUpdate({ _id: req.params.id, admin: req.user._id }, { isActive: false }, { new: true });
  if (!salon) throw new ApiError(404, 'Salon not found');
  res.json({ message: 'Salon deleted' });
});
