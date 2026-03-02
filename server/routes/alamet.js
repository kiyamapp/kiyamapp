const express = require('express');
const router = express.Router();
const Alamet = require('../models/Alamet');
const { auth } = require('../middleware/auth');

// GET all alametler (public)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.source) filter.source = req.query.source;
    if (req.query.status) filter.status = req.query.status;

    const alametler = await Alamet.find(filter).sort({ createdAt: -1 });
    res.json(alametler);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single alamet (public)
router.get('/:id', async (req, res) => {
  try {
    const alamet = await Alamet.findById(req.params.id);
    if (!alamet) return res.status(404).json({ error: 'Alamet bulunamadı' });
    res.json(alamet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create alamet (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const alamet = new Alamet(req.body);
    await alamet.save();
    res.status(201).json(alamet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update alamet (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const alamet = await Alamet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!alamet) return res.status(404).json({ error: 'Alamet bulunamadı' });
    res.json(alamet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE alamet (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const alamet = await Alamet.findByIdAndDelete(req.params.id);
    if (!alamet) return res.status(404).json({ error: 'Alamet bulunamadı' });
    res.json({ message: 'Alamet silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
