const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
exports.protect = (req, res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return next(new AppError('Authentication required', 401));
  try {
    const p = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    req.user = { id: p.id, role: p.role };
    next();
  } catch { next(new AppError('Invalid or expired token', 401)); }
};
exports.restrictTo = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(new AppError('You do not have permission to do this', 403));
