const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Itinerary = require('../models/Itinerary');
const { protect } = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// -----------------------------
// Gemini Setup
// -----------------------------
let genAI;
let primaryModel;
let fallbackModel;

try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Primary model: better quality
  primaryModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });

  // Fallback model: higher quota, more reliable
  fallbackModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
  });

  console.log('Gemini AI initialized successfully');
} catch (err) {
  console.error('Gemini SDK error:', err.message);
}

// -----------------------------
// Helpers
// -----------------------------
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateWithRetry = async (prompt, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await primaryModel.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const isBusy = err.message?.includes('503');
      const isRateLimit =
        err.status === 429 ||
        err.message?.includes('429') ||
        err.message?.toLowerCase().includes('quota') ||
        err.message?.toLowerCase().includes('rate limit');

      // Fallback if primary is overloaded
      if (isBusy) {
        console.log('Primary Gemini model busy. Switching to fallback...');
        const fallbackResult = await fallbackModel.generateContent(prompt);
        return fallbackResult.response.text();
      }

      // Retry on rate limits
      if (isRateLimit && attempt < retries) {
        console.log(`Gemini rate limited. Retrying attempt ${attempt}...`);
        await sleep(35000);
      } else {
        throw err;
      }
    }
  }
};

const buildSystemPrompt = () => `
You are UPYATRA's expert AI travel planner specializing only in Uttar Pradesh, India.

When creating an itinerary:
- Structure clearly by day
- Include morning, afternoon, and evening slots
- Add practical timings
- Suggest local UP food and restaurant areas
- Add estimated costs in INR
- Add shopping suggestions and local tips
- Keep tone warm and practical
- Use markdown headings

Only plan trips within Uttar Pradesh.
`;

// -----------------------------
// Rate Limiter
// -----------------------------
const itineraryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    message: 'Too many itinerary requests. Please wait a minute.',
  },
});

// -----------------------------
// Generate itinerary
// -----------------------------
router.post('/generate', protect, itineraryLimiter, async (req, res) => {
  try {
    if (!primaryModel || !fallbackModel) {
      return res.status(500).json({
        message: 'AI service not configured. Check GEMINI_API_KEY.',
      });
    }

    const { destination, days, budget, interests, travelers } = req.body;

    if (!destination || !days) {
      return res.status(400).json({
        message: 'Destination and days are required.',
      });
    }

    const fullPrompt = `
${buildSystemPrompt()}

Plan a ${days}-day trip to ${destination}, Uttar Pradesh.
Travelers: ${travelers || 1}
Budget: ${budget || 'moderate'}
Interests: ${interests?.length ? interests.join(', ') : 'general sightseeing'}

Please include:
- day-wise schedule
- exact timings
- food recommendations
- hotel/locality suggestions
- shopping ideas
- estimated costs
- transport tips
    `.trim();

    console.log(`Generating itinerary for ${destination}`);

    const itineraryContent = await generateWithRetry(fullPrompt);

    const itinerary = await Itinerary.create({
      user: req.user._id,
      title: `${days}-Day ${destination} Trip`,
      destination,
      days,
      budget,
      interests,
      travelers: travelers || 1,
      content: itineraryContent,
      messages: [
        { role: 'user', content: fullPrompt },
        { role: 'assistant', content: itineraryContent },
      ],
    });

    res.status(201).json(itinerary);
  } catch (err) {
    console.error('Itinerary generation error:', err.message);

    const isRateLimit =
      err.status === 429 ||
      err.message?.includes('429') ||
      err.message?.toLowerCase().includes('quota') ||
      err.message?.toLowerCase().includes('rate limit');

    if (isRateLimit) {
      return res.status(429).json({
        message: 'AI usage limit reached. Please wait and try again.',
      });
    }

    if (err.message?.includes('503')) {
      return res.status(503).json({
        message: 'AI service is busy right now. Please try again shortly.',
      });
    }

    if (err.message?.includes('404') || err.message?.includes('not found')) {
      return res.status(500).json({
        message: 'Gemini model not available. Check model name.',
      });
    }

    res.status(500).json({
      message: 'Failed to generate itinerary. Please try again.',
    });
  }
});


// -----------------------------
// Refine itinerary via AI chat
// -----------------------------
router.post('/:id/chat', protect, itineraryLimiter, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        message: 'Message is required.',
      });
    }

    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        message: 'Itinerary not found.',
      });
    }

    if (itinerary.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized.',
      });
    }

    const contextPrompt = `
${buildSystemPrompt()}

Here is the user's existing itinerary:

${itinerary.content}

User request:
${message}

Please refine or answer based on this itinerary only.
Keep the response practical, helpful, and concise.
    `.trim();

    console.log(`Refining itinerary ${itinerary._id}`);

    const aiReply = await generateWithRetry(contextPrompt);

    itinerary.messages.push({
      role: 'user',
      content: message,
    });

    itinerary.messages.push({
      role: 'assistant',
      content: aiReply,
    });

    await itinerary.save();

    res.json({
      reply: aiReply,
      itinerary,
    });
  } catch (err) {
    console.error('Chat error:', err.message);

    const isRateLimit =
      err.status === 429 ||
      err.message?.includes('429') ||
      err.message?.toLowerCase().includes('quota') ||
      err.message?.toLowerCase().includes('rate limit');

    if (isRateLimit) {
      return res.status(429).json({
        message: 'AI usage limit reached. Please wait and try again.',
      });
    }

    if (err.message?.includes('503')) {
      return res.status(503).json({
        message: 'AI service is busy. Please try again shortly.',
      });
    }

    res.status(500).json({
      message: 'Failed to refine itinerary. Please try again.',
    });
  }
});


module.exports = router;