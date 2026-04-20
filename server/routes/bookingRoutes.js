const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

// POST /api/bookings — create a booking (logged in users only)
router.post('/', protect, async (req, res) => {
  try {
    const {
      hotel,
      destination,
      checkIn,
      checkOut,
      guests,
      roomsBooked,
      totalAmount,
      specialRequests,
    } = req.body;

    const booking = await Booking.create({
      user: req.user._id,
      hotel,
      destination,
      checkIn,
      checkOut,
      guests,
      roomsBooked,
      totalAmount,
      specialRequests,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/my — get current user's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('hotel', 'name district coverImage')
      .populate('destination', 'name slug')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;