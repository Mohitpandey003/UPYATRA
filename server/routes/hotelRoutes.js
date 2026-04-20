const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// GET /api/hotels — get all hotels with optional filters
router.get('/', async (req, res) => {
  try {
    const { search, type, district } = req.query;
    let filter = { isActive: true };

    if (type) filter.type = type;
    if (district) filter.district = new RegExp(district, 'i');
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { district: new RegExp(search, 'i') },
      ];
    }

    const hotels = await Hotel.find(filter)
      .populate('destination', 'name slug')
      .sort({ rating: -1 });

    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/hotels/:slug — get single hotel by slug
router.get('/:slug', async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ slug: req.params.slug, isActive: true })
      .populate('destination', 'name slug district');

    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/hotels — create hotel (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/hotels/:id — update hotel (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/hotels/:id — soft delete (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Hotel.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Hotel removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;