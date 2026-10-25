const mongoose = require('mongoose');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { check, str } = require('../utils/validate');

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SORTS = { price_asc: { basePrice: 1 }, price_desc: { basePrice: -1 }, name_asc: { name: 1 }, name_desc: { name: -1 }, newest: { createdAt: -1 } };

const buildFilter = (q, includeInactive) => {
  const f = includeInactive ? {} : { active: true };
  if (q.q) f.$or = [{ name: new RegExp(esc(String(q.q)), 'i') }, { sku: new RegExp(esc(String(q.q)), 'i') }];
  if (q.category) f.category = String(q.category);
  return f;
};
const paginate = async (q, filter, defaultLimit = 12) => {
  const page = Math.max(1, parseInt(q.page) || 1), limit = Math.min(100, Math.max(1, parseInt(q.limit) || defaultLimit));
  const [items, total] = await Promise.all([
    Product.find(filter).sort(SORTS[q.sort] || SORTS.name_asc).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter)]);
  return { items, page, limit, total, pages: Math.ceil(total / limit) };
};
const meta = (r) => ({ page: r.page, limit: r.limit, total: r.total, pages: r.pages });
exports.buildFilter = buildFilter; exports.paginate = paginate; exports.meta = meta;

exports.list = async (req, res) => {
  const r = await paginate(req.query, buildFilter(req.query, false));
  res.json({ success: true, data: r.items, meta: meta(r) });
};
exports.categories = async (req, res) => {
  const rows = await Product.aggregate([{ $match: { active: true } }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
  res.json({ success: true, data: rows.map((r) => ({ name: r._id, count: r.count })) });
};
exports.get = async (req, res) => {
  const { idOrSlug } = req.params;
  const p = mongoose.isValidObjectId(idOrSlug) ? await Product.findById(idOrSlug) : await Product.findOne({ slug: idOrSlug });
  if (!p || !p.active) throw new AppError('Product not found', 404);
  res.json({ success: true, data: p });
};

const whole = (min, msg) => (v) => (v !== undefined && !(Number.isInteger(Number(v)) && Number(v) >= min) ? msg : undefined);
const rules = (partial) => {
  const opt = (fn) => (v, b) => (partial && v === undefined ? undefined : fn(v, b));
  return {
    name: opt((v) => (str(v).length < 2 ? 'Name is required' : undefined)),
    sku: opt((v) => (str(v).length < 2 ? 'SKU is required' : undefined)),
    category: opt((v) => (!str(v) ? 'Category is required' : undefined)),
    basePrice: opt((v) => (!(Number(v) > 0) ? 'Price must be greater than 0' : undefined)),
    minOrderQty: whole(1, 'Minimum order must be a whole number of 1 or more'),
    stockQuantity: whole(0, 'Stock must be a whole number of 0 or more'),
    lowStockThreshold: whole(0, 'Threshold must be 0 or more'),
    targetStockLevel: whole(1, 'Target must be 1 or more'),
    bulkTiers: (v) => (v !== undefined && (!Array.isArray(v) || v.some((t) => !(t.minQty >= 2) || !(t.price > 0))) ? 'Each tier needs a quantity of 2+ and a price above 0' : undefined),
  };
};
const FIELDS = ['name', 'description', 'sku', 'category', 'images', 'basePrice', 'minOrderQty', 'bulkTiers', 'stockQuantity', 'lowStockThreshold', 'targetStockLevel', 'active'];
const pick = (b) => Object.fromEntries(FIELDS.filter((k) => b[k] !== undefined).map((k) => [k, b[k]]));

exports.create = async (req, res) => {
  check(req.body, rules(false));
  res.status(201).json({ success: true, data: await Product.create(pick(req.body)) });
};
exports.update = async (req, res) => {
  check(req.body, rules(true));
  const p = await Product.findById(req.params.id);
  if (!p) throw new AppError('Product not found', 404);
  p.set(pick(req.body));
  await p.save();
  res.json({ success: true, data: p });
};
// Soft delete keeps order history intact.
exports.deactivate = async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!p) throw new AppError('Product not found', 404);
  res.json({ success: true, data: p, message: 'Product deactivated' });
};
