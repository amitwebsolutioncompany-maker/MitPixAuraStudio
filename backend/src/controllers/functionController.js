const FunctionRequest = require('../models/FunctionRequest');
const asyncHandler = require('../utils/asyncHandler');

exports.listFunctionRequests = asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { customer: req.user._id };
  const functionRequests = await FunctionRequest.find(query).sort({ createdAt: -1 });
  res.json({ functionRequests });
});

exports.createFunctionRequest = asyncHandler(async (req, res) => {
  const functionRequest = await FunctionRequest.create({ ...req.body, customer: req.user._id });
  res.status(201).json({ functionRequest });
});

