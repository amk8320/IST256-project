const express = require('express');

module.exports = function crudRouter(Model, validate) {
  const router = express.Router();

  // CREATE
  router.post('/', async (req, res) => {
    const error = validate ? validate(req.body || {}) : null;
    if (error) return res.status(400).json({ success: false, message: error });
    try {
      const doc = await Model.create(req.body);
      res.status(201).json({ success: true, id: doc._id, doc });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'That record already exists.' });
      }
      throw err;
    }
  });

  // READ all/one
  router.get('/', async (req, res) => res.json(await Model.find()));
  router.get('/:id', async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json(doc);
  });

  // UPDATE
  router.put('/:id', async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json(doc);
  });

  // DELETE
  router.delete('/:id', async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true });
  });

  return router;
};