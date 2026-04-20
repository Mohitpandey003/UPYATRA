const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    district: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['religious', 'historical', 'nature', 'heritage', 'adventure', 'cultural'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      maxlength: 200,
    },
    images: [String], // Array of image URLs
    coverImage: {
      type: String,
      default: '',
    },
    location: {
      address: String,
      latitude: Number,
      longitude: Number,
    },
    entryFee: {
      indian: { type: Number, default: 0 },
      foreign: { type: Number, default: 0 },
    },
    timings: {
      open: String,
      close: String,
      closedOn: String,
    },
    bestTimeToVisit: String,
    highlights: [String], // Array of highlight strings
    tags: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name before saving
destinationSchema.pre('save', async function () {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
});

module.exports = mongoose.model('Destination', destinationSchema);