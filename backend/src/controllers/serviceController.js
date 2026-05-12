const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

exports.listServices = asyncHandler(async (req, res) => {
  const query = { isActive: true };
  if (req.query.salon) query.salon = req.query.salon;
  res.json({ services: await Service.find(query).sort({ name: 1 }) });
});

exports.createService = asyncHandler(async (req, res) => {
  res.status(201).json({ service: await Service.create(req.body) });
});

exports.updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!service) throw new ApiError(404, 'Service not found');
  res.json({ service });
});

exports.deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!service) throw new ApiError(404, 'Service not found');
  res.json({ message: 'Service deleted' });
});
