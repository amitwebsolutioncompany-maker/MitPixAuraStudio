const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { env } = require('../config/env');

const authModels = {
  customer: User,
  employee: User,
  admin: Admin,
  superAdmin: SuperAdmin
};

const renewalMessage = 'Your subscription code has expired. Please contact +918574700615 to renew your subscription.';

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) throw new ApiError(401, 'Authentication token required');

  const decoded = jwt.verify(token, env.jwtSecret);
  const Model = authModels[decoded.role];
  if (!Model) throw new ApiError(401, 'Invalid authentication token');

  const user = await Model.findById(decoded.id).select('-password');

  if (!user || !user.isActive) throw new ApiError(401, 'Invalid authentication token');
  if (decoded.role === 'admin' && user.codeExpiresAt && user.codeExpiresAt <= new Date()) {
    throw new ApiError(403, renewalMessage);
  }

  req.authRole = decoded.role;
  user.role = decoded.role;
  req.user = user;
  next();
});

const optionalProtect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  const decoded = jwt.verify(token, env.jwtSecret);
  const Model = authModels[decoded.role];
  if (!Model) return next();
  const user = await Model.findById(decoded.id).select('-password');
  if (user?.isActive && !(decoded.role === 'admin' && user.codeExpiresAt && user.codeExpiresAt <= new Date())) {
    req.authRole = decoded.role;
    user.role = decoded.role;
    req.user = user;
  }
  next();
});

const allowRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, 'You do not have permission for this action');
  }
  next();
};

module.exports = { protect, optionalProtect, allowRoles };
