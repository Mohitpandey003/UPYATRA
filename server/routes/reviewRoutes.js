const express = require('express');
const router = express.Router();
const {
  getDestinationReviews,
  getHotelReviews,
  createReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/destination/:id', getDestinationReviews);
router.get('/hotel/:id', getHotelReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;