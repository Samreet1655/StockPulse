const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { buildFilter, paginate, meta } = require('./productController');

exports.summary = async (req, res) => {
  const [r] = await Product.aggregate([
    { $match: { active: true } },
    { $group: { _id: null, totalProducts: { $sum: 1 }, totalUnits: { $sum: '$stockQuantity' },
      outOfStock: { $sum: { $cond: [{ $lte: ['$stockQuantity', 0] }, 1, 0] } },
      lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$stockQuantity', 0] }, { $lte: ['$stockQuantity', '$lowStockThreshold'] }] }, 1, 0] } } } }]);
  res.json({ success: true, data: r || { totalProducts: 0, totalUnits: 0, outOfStock: 0, lowStock: 0 } });
};
exports.lowStock = async (req, res) => {
  const items = await Product.find({ active: true, $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] } }).sort({ stockQuantity: 1 });
  res.json({ success: true, data: items });
};
exports.adminProducts = async (req, res) => { // includes inactive products
  const r = await paginate(req.query, buildFilter(req.query, true), 15);
  res.json({ success: true, data: r.items, meta: meta(r) });
};
exports.setStock = async (req, res) => {
  const q = Number(req.body.quantity);
  if (!Number.isInteger(q) || q < 0) throw new AppError('Validation failed', 400, { quantity: 'Stock must be a whole number of 0 or more' });
  const p = await Product.findByIdAndUpdate(req.params.id, { stockQuantity: q }, { new: true, runValidators: true });
  if (!p) throw new AppError('Product not found', 404);
  res.json({ success: true, data: p });
};
