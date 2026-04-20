const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination', // Links to a Destination document
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    starRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    type: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury', 'heritage', 'resort'],
      default: 'mid-range',
    },
    description: String,
    coverImage: String,
    images: [String],
    amenities: [String], // ['WiFi', 'Pool', 'Gym', 'Restaurant', ...]
    pricePerNight: {
      type: Number,
      required: true,
    },
    address: String,
    contactPhone: String,
    contactEmail: String,
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    totalRooms: {
      type: Number,
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

hotelSchema.pre('save', async function () {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
});

module.exports = mongoose.model('Hotel', hotelSchema);