const Product = require('../models/Product');
const ProductOrder = require('../models/ProductOrder');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

exports.listProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ products });
});

exports.createOrder = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.body.product);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');

  const quantity = Number(req.body.quantity || 1);
  if (product.stock < quantity) throw new ApiError(400, 'Product out of stock');

  product.stock -= quantity;
  await product.save();
  const order = await ProductOrder.create({ customer: req.user._id, product: product._id, quantity });
  res.status(201).json({ order });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ product });
});

