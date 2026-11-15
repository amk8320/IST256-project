const mongoose = require('mongoose');

// Products sold in the Penn State Shoe Central store
const productSchema = new mongoose.Schema({
    productId:   { type: String, required: true, unique: true, match: /^SHOE\d{3}$/ },
    productName: { type: String, required: true, minlength: 3 },
    shoeType:    { type: String, enum: ['Running', 'Casual', 'Basketball', 'Boots', 'Dress', 'Other'] },
    shoeSize:    { type: Number, min: 4, max: 18 },
    unit:        { type: String, enum: ['Pair', 'Each', 'Pack', 'Box'], default: 'Pair' },
    price:       { type: Number, required: true, min: 0.01, max: 1000 },
    weight:      { type: String, default: '' }
});

module.exports = mongoose.model('Product', productSchema);