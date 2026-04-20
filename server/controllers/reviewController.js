const Review = require('../models/Review');
const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');

// @desc  Get all reviews for a destination
// @route GET /api/reviews/destination/:id
const getDestinationReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ destination: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get all reviews for a hotel
// @route GET /api/reviews/hotel/:id
const getHotelReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ hotel: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create a review (destination or hotel)
// @route POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { destinationId, hotelId, rating, title, comment, visitDate } = req.body;

    if (!destinationId && !hotelId) {
      return res.status(400).json({ message: 'Provide either destinationId or hotelId' });
    }

    const reviewData = {
  user: req.user._id,
  rating,
  title,
  body: comment,          // map frontend comment -> schema body
  visitedOn: visitDate,   // map frontend visitDate -> schema visitedOn
  destination: destinationId || null,
  hotel: hotelId || null,
};

    const review = await Review.create(reviewData);

    // After creating a review, recalculate the average rating
    // on the destination or hotel and update it
    if (destinationId) {
      await recalcRating(Destination, destinationId);
    } else {
      await recalcRating(Hotel, hotelId);
    }

    // Populate user name before sending back
    await review.populate('user', 'name');
    res.status(201).json(review);
  } catch (err) {
    // Duplicate key error = user already reviewed this
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this.' });
    }
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete a review (owner or admin only)
// @route DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Only the review author or admin can delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { destination, hotel } = review;
    await review.deleteOne();

    // Recalculate average after deletion too
    if (destination) await recalcRating(Destination, destination);
    if (hotel) await recalcRating(Hotel, hotel);

    res.json({ message: 'Review removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper: recalculate average rating on a destination or hotel
// Uses MongoDB aggregation for accuracy
const recalcRating = async (Model, id) => {
  const field = Model.modelName === 'Destination' ? 'destination' : 'hotel';

  const result = await Review.aggregate([
    { $match: { [field]: id } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Model.findByIdAndUpdate(id, {
      rating: Math.round(result[0].avgRating * 10) / 10, // round to 1 decimal
      reviewCount: result[0].count,
    });
  } else {
    // No reviews left — reset to defaults
    await Model.findByIdAndUpdate(id, { rating: 0, reviewCount: 0 });
  }
};

module.exports = { getDestinationReviews, getHotelReviews, createReview, deleteReview };