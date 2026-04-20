const adminOnly = (req, res, next) => {
  // This runs AFTER the protect middleware, so req.user is already set
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { adminOnly };