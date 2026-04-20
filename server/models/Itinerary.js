const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    destination: { type: String, required: true },
    days: { type: Number, required: true },
    budget: { type: String },
    interests: [String],
    travelers: { type: Number, default: 1 },
    // The full AI-generated itinerary stored as a string
    content: { type: String, required: true },
    // Conversation history for the chat refinement feature
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'] },
        content: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Itinerary', itinerarySchema);