const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // A review targets either a destination OR a hotel, not both
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      default: null,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      default: null,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    visitedOn: {
      type: String, // e.g. "March 2024"
    },
    isApproved: {
      type: Boolean,
      default: true, // auto-approve for now
    },
  },
  { timestamps: true }
);

// One user can only review each destination/hotel once
reviewSchema.index({ user: 1, destination: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, hotel: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);