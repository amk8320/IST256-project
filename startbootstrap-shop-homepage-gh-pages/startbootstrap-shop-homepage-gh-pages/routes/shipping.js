const express = require('express');
const router = express.Router();
const Shipping = require('../models/Shipping');

// Save shipping information
router.post('/', async (req, res) => {
    try {
        const shipping = new Shipping(req.body);
        await shipping.save();

        res.json({ message: 'Shipping information saved!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get shipping information
router.get('/', async (req, res) => {
    try {
        const shipping = await Shipping.find();
        res.json(shipping);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;