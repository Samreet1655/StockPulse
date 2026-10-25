const mongoose = require('mongoose');
const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const schema = new mongoose.Schema({
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{
    _id: false,
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String, sku: String, image: String, // historical snapshots
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  }],
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  delivery: {
    contactName: { type: String, required: true }, company: String,
    phone: { type: String, required: true }, address: { type: String, required: true },
    city: { type: String, required: true }, postalCode: { type: String, required: true }, notes: String,
  },
  status: { type: String, enum: STATUSES, default: 'pending', index: true },
  clientRequestId: { type: String },
}, { timestamps: true });
schema.index({ retailer: 1, clientRequestId: 1 }, { unique: true, partialFilterExpression: { clientRequestId: { $type: 'string' } } });
schema.index({ createdAt: -1 });
module.exports = mongoose.model('Order', schema);
module.exports.STATUSES = STATUSES;
