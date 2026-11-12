const express = require('express');
const returnModel = require('../models/return');
const router = express.Router();

// Add a new return
router.post('/', async (req, res) => {
  const { customer, items } = req.body || {};
  if (!customer || !customer.fullName || !customer.orderId ||
      !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Missing required return fields.' });
  }
  const doc = await returnModel.create(req.body);
  console.log('Return saved to MongoDB:', doc._id);
  res.status(201).json({ success: true, id: doc._id, message: 'Return details received.' });
});

// Get all returns
router.get('/', async (req, res) => {
  res.json(await returnModel.find());
});

// Get a single return
router.get('/:id', async (req, res) => {
  const doc = await returnModel.findById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Return not found.' });
  res.json(doc);
});

// Edit a return
router.put('/:id', async (req, res) => {
  const doc = await returnModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).json({ success: false, message: 'Return not found.' });
  res.json(doc);
});

// Delete a return
router.delete('/:id', async (req, res) => {
  await Return.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;