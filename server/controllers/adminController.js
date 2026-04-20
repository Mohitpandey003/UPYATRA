const User = require('../models/User');
const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

// @desc    Get full dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = async (req, res) => {
  // Run all queries in parallel with Promise.all for speed
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

    // Last 5 bookings with user and hotel info
    Booking.find()
      .populate('user', 'name email')
      .populate('hotel', 'name district')
      .sort({ createdAt: -1 })
      .limit(5),

    // Top 5 most viewed destinations
    Destination.find({ isActive: true })
      .sort({ viewCount: -1 })
      .limit(5)
      .select('name district viewCount category'),

    // Booking count grouped by status
    Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Bookings per month for the last 6 months
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
    stats: {
      totalUsers,
      totalDestinations,
      totalHotels,
      totalBookings,
    },
    recentBookings,
    topDestinations,
    bookingsByStatus,
    monthlyBookings,
  });
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
  res.json(users);
};

module.exports = { getDashboardStats, getAllUsers };