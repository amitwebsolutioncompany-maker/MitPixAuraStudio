const Salon = require('../models/Salon');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { generateSlotsForSalon } = require('../services/slotService');

exports.listSalons = asyncHandler(async (req, res) => {
  const query = { isActive: true };
  if (req.query.city) query.city = new RegExp(req.query.city, 'i');
  const salons = await Salon.find(query).sort({ city: 1, name: 1 });
  res.json({ salons });
});

exports.getSalon = asyncHandler(async (req, res) => {
  const salon = await Salon.findById(req.params.id);
  if (!salon) throw new ApiError(404, 'Salon not found');
  res.json({ salon });
});

exports.createSalon = asyncHandler(async (req, res) => {
  const salon = await Salon.create(req.body);
  res.status(201).json({ salon });
});

exports.updateSalon = asyncHandler(async (req, res) => {
  const salon = await Salon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!salon) throw new ApiError(404, 'Salon not found');
  await generateSlotsForSalon(salon._id, req.query.date);
  res.json({ salon });
});

exports.deleteSalon = asyncHandler(async (req, res) => {
  const salon = await Salon.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!salon) throw new ApiError(404, 'Salon not found');
  res.json({ message: 'Salon deleted' });
});
