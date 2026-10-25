const mongoose = require('mongoose');
const Order = require('../models/Order'), Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { check, str } = require('../utils/validate');
const round = (n) => Math.round(n * 100) / 100;

exports.create = async (req, res) => {
  const { items, delivery = {}, clientRequestId } = req.body;
  if (!Array.isArray(items) || !items.length) throw new AppError('Your cart is empty', 400);
  check(delivery, {
    contactName: (v) => (str(v).length < 2 ? 'Contact name is required' : undefined),
    phone: (v) => (!/^[0-9+()\-\s]{7,20}$/.test(str(v)) ? 'Enter a valid phone number' : undefined),
    address: (v) => (str(v).length < 5 ? 'Street address is required' : undefined),
    city: (v) => (!str(v) ? 'City is required' : undefined),
    postalCode: (v) => (!str(v) ? 'Postal code is required' : undefined),
  });
  if (clientRequestId) { // duplicate-submission protection
    const dup = await Order.findOne({ retailer: req.user.id, clientRequestId: String(clientRequestId) });
    if (dup) return res.status(200).json({ success: true, data: dup, message: 'Order already placed' });
  }
  const wanted = new Map(); // merge repeated products
  for (const it of items) {
    const qty = Number(it.quantity);
    if (!mongoose.isValidObjectId(it.productId) || !Number.isInteger(qty) || qty < 1) throw new AppError('Invalid product or quantity in order', 400);
    wanted.set(String(it.productId), (wanted.get(String(it.productId)) || 0) + qty);
  }
  const products = await Product.find({ _id: { $in: [...wanted.keys()] }, active: true });
  if (products.length !== wanted.size) throw new AppError('One or more products are no longer available', 409);

  const lines = products.map((p) => {
    const quantity = wanted.get(String(p._id));
    if (quantity < p.minOrderQty) throw new AppError(`${p.name}: minimum order is ${p.minOrderQty} units`, 400);
    const unitPrice = p.unitPriceFor(quantity); // price is always computed server-side
    return { product: p._id, name: p.name, sku: p.sku, image: p.images[0], quantity, unitPrice, lineTotal: round(unitPrice * quantity) };
  });
  const subtotal = round(lines.reduce((s, l) => s + l.lineTotal, 0));

  // Atomic conditional decrement per product, compensated on failure
  // (standalone MongoDB has no multi-document transactions).
  const reserved = [];
  try {
    for (const l of lines) {
      const ok = await Product.findOneAndUpdate({ _id: l.product, active: true, stockQuantity: { $gte: l.quantity } }, { $inc: { stockQuantity: -l.quantity } });
      if (!ok) throw new AppError(`Not enough stock for ${l.name}. Reduce the quantity and try again.`, 409);
      reserved.push(l);
    }
    const order = await Order.create({ retailer: req.user.id, items: lines, subtotal, total: subtotal, delivery, clientRequestId: clientRequestId && String(clientRequestId) });
    res.status(201).json({ success: true, data: order });
  } catch (e) {
    await Promise.all(reserved.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stockQuantity: l.quantity } })));
    throw e;
  }
};
exports.mine = async (req, res) => res.json({ success: true, data: await Order.find({ retailer: req.user.id }).sort({ createdAt: -1 }) });
exports.all = async (req, res) => {
  const f = req.query.status ? { status: String(req.query.status) } : {};
  res.json({ success: true, data: await Order.find(f).sort({ createdAt: -1 }).populate('retailer', 'name email company') });
};
exports.get = async (req, res) => {
  const o = await Order.findById(req.params.id).populate('retailer', 'name email company');
  if (!o || (req.user.role !== 'admin' && String(o.retailer._id) !== req.user.id)) throw new AppError('Order not found', 404);
  res.json({ success: true, data: o });
};
exports.setStatus = async (req, res) => {
  const { status } = req.body;
  if (!Order.STATUSES.includes(status)) throw new AppError('Validation failed', 400, { status: `Status must be one of: ${Order.STATUSES.join(', ')}` });
  const o = await Order.findById(req.params.id);
  if (!o) throw new AppError('Order not found', 404);
  if (o.status === 'cancelled') throw new AppError('Cancelled orders cannot be changed', 409);
  if (status === 'cancelled') await Promise.all(o.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stockQuantity: i.quantity } })));
  o.status = status; await o.save();
  res.json({ success: true, data: await o.populate('retailer', 'name email company') });
};
