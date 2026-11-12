const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  customer: { fullName: String, address: String },
  payment:  { cardLast4: String, expiry: String },
  order: {
    items: [{ productId: String, productName: String, price: Number, quantity: Number }],
    total: Number
  },
  receivedAt: { type: Date, default: Date.now }
}, { strict: false });

module.exports = mongoose.model('billing', billingSchema);