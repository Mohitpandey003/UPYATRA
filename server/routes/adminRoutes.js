const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Apply protect + adminOnly to every route in this file
router.use(protect, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalDestinations,
      totalHotels,
      totalBookings,
      recentBookings,
      topDestinations,
      bookingsByStatus,
      monthlyBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Destination.countDocuments({ isActive: true }),
      Hotel.countDocuments({ isActive: true }),
      Booking.countDocuments(),

      Booking.find()
        .populate('user', 'name email')
        .populate('hotel', 'name district')
        .sort({ createdAt: -1 })
        .limit(5),

      Destination.find({ isActive: true })
        .sort({ viewCount: -1 })
        .limit(5)
        .select('name district viewCount category'),

      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Booking.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 },
      ]),
    ]);

    res.json({
      stats: { totalUsers, totalDestinations, totalHotels, totalBookings },
      recentBookings,
      topDestinations,
      bookingsByStatus,
      monthlyBookings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/bookings — all bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('hotel', 'name district')
      .populate('destination', 'name')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/bookings/:id — update booking status
router.put('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('user', 'name email')
     .populate('hotel', 'name district');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;