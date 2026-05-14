const Service = require('../models/Service');
const Salon = require('../models/Salon');
const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

exports.listServices = asyncHandler(async (req, res) => {
  const query = { isActive: true };
  if (req.query.salon) query.salon = req.query.salon;
  if (req.user?.role === 'admin') {
    const salons = await Salon.find({ admin: req.user._id }).distinct('_id');
    query.salon = req.query.salon ? req.query.salon : { $in: salons };
    if (req.query.salon && !salons.some((id) => String(id) === String(req.query.salon))) {
      throw new ApiError(403, 'You do not have permission for this salon');
    }
  } else {
    const activeAdmins = await Admin.find({ isActive: true, codeExpiresAt: { $gt: new Date() } }).distinct('_id');
    const activeSalons = await Salon.find({ admin: { $in: activeAdmins }, isActive: true }).distinct('_id');
    if (req.query.salon && !activeSalons.some((id) => String(id) === String(req.query.salon))) {
      throw new ApiError(404, 'Salon not found');
    }
    query.salon = req.query.salon || { $in: activeSalons };
  }
  res.json({ services: await Service.find(query).sort({ name: 1 }) });
});

exports.createService = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ _id: req.body.salon, admin: req.user._id, isActive: true });
  if (!salon) throw new ApiError(404, 'Selected salon not found');
  res.status(201).json({ service: await Service.create({ ...req.body, admin: req.user._id }) });
});

exports.updateService = asyncHandler(async (req, res) => {
  if (req.body.salon) {
    const salon = await Salon.findOne({ _id: req.body.salon, admin: req.user._id, isActive: true });
    if (!salon) throw new ApiError(404, 'Selected salon not found');
  }
  const service = await Service.findOneAndUpdate({ _id: req.params.id, admin: req.user._id }, { ...req.body, admin: req.user._id }, { new: true, runValidators: true });
  if (!service) throw new ApiError(404, 'Service not found');
  res.json({ service });
});

exports.deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findOneAndUpdate({ _id: req.params.id, admin: req.user._id }, { isActive: false }, { new: true });
  if (!service) throw new ApiError(404, 'Service not found');
  res.json({ message: 'Service deleted' });
});
