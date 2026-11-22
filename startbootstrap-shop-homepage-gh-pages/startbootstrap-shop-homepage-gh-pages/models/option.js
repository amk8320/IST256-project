const mongoose = require('mongoose');

// Order options submitted from options.html (React)
const optionSchema = new mongoose.Schema({
    customer: {
        fullName: { type: String, required: true, trim: true },
        email:    { type: String, required: true, trim: true, lowercase: true }
    },
    order: {
        productId:      { type: String, required: true },
        deliveryMethod: { type: String, required: true, enum: ['Standard', 'Express', 'Store Pickup'] },
        giftWrap:       { type: Boolean, default: false },
        notes:          { type: String, default: '', maxlength: 200 }
    },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OrderOption', optionSchema);