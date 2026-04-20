const Destination = require('../models/Destination');

const getDestinations = async (req, res) => {
  try {
    const { category, district, search, featured } = req.query;

    let filter = { isActive: true };

    if (category) filter.category = category;
    if (district) filter.district = new RegExp(district, 'i');
    if (featured === 'true') filter.isFeatured = true;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const destinations = await Destination.find(filter)
      .sort({ viewCount: -1 })
      // location field is now included so ExploreMap gets coordinates
      .select(
        'name slug district category coverImage shortDescription rating reviewCount viewCount isFeatured location'
      );

    res.json(destinations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDestinationBySlug = async (req, res) => {
  try {
    const destination = await Destination.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    destination.viewCount += 1;
    await destination.save();

    res.json(destination);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json(destination);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json(destination);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json({ message: 'Destination removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getDestinations,
  getDestinationBySlug,
  createDestination,
  updateDestination,
  deleteDestination,
};