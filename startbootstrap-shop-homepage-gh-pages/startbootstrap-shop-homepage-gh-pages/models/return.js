const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  customer: { fullName: String, orderId: String },
  items: [{
    productId: String,
    productName: String,
    price: Number,
    reason: String,
    condition: String,
    comments: String
  }],
  refundTotal: Number,
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('return', returnSchema);