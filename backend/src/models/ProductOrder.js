const mongoose = require('mongoose');

const productOrderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    status: { type: String, enum: ['placed', 'packed', 'delivered', 'cancelled'], default: 'placed' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductOrder', productOrderSchema);

