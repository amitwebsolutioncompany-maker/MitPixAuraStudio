const Offer = require('../models/Offer');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

exports.listOffers = asyncHandler(async (req, res) => {
  const now = new Date();
  const query = { isActive: true, $and: [{ $or: [{ startsAt: null }, { startsAt: { $lte: now } }] }, { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] }] };
  if (req.query.salon) query.salon = req.query.salon;
  res.json({ offers: await Offer.find(query).populate('salon', 'name city').sort({ createdAt: -1 }) });
});

exports.createOffer = asyncHandler(async (req, res) => {
  res.status(201).json({ offer: await Offer.create(req.body) });
});

exports.updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!offer) throw new ApiError(404, 'Offer not found');
  res.json({ offer });
});

exports.deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!offer) throw new ApiError(404, 'Offer not found');
  res.json({ message: 'Offer deleted' });
});
