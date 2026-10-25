const mongoose = require('mongoose');
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, unique: true },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  category: { type: String, required: true, trim: true, index: true },
  images: { type: [String], default: [] },
  basePrice: { type: Number, required: true, min: 0.01 },
  minOrderQty: { type: Number, default: 1, min: 1 },
  bulkTiers: { type: [{ _id: false, minQty: { type: Number, min: 2, required: true }, price: { type: Number, min: 0.01, required: true } }], default: [] },
  // Single source of truth for inventory in CE-1 (no separate Inventory collection).
  stockQuantity: { type: Number, required: true, min: [0, 'Stock cannot be negative'], default: 0 },
  lowStockThreshold: { type: Number, min: 0, default: 10 },
  targetStockLevel: { type: Number, min: 1, default: 50 },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true, toJSON: { virtuals: true, transform: (d, r) => { delete r.id; delete r.__v; return r; } } });
schema.index({ name: 1 });
schema.pre('validate', function (next) {
  if (this.name && this.sku && (this.isModified('name') || this.isModified('sku') || !this.slug)) this.slug = `${slugify(this.name)}-${this.sku.toLowerCase()}`;
  next();
});
schema.virtual('stockStatus').get(function () {
  if (this.stockQuantity <= 0) return 'out_of_stock';
  return this.stockQuantity <= this.lowStockThreshold ? 'low_stock' : 'in_stock';
});
schema.virtual('suggestedReplenishment').get(function () {
  return this.stockStatus === 'in_stock' ? 0 : Math.max(0, this.targetStockLevel - this.stockQuantity);
});
schema.virtual('restockReason').get(function () {
  if (this.stockStatus === 'in_stock') return null;
  const need = this.suggestedReplenishment;
  return this.stockStatus === 'out_of_stock'
    ? `Out of stock. Reorder ${need} units to reach the target level of ${this.targetStockLevel}.`
    : `${this.stockQuantity} units left, at or below the alert threshold of ${this.lowStockThreshold}. Reorder ${need} units to reach the target level of ${this.targetStockLevel}.`;
});
schema.methods.unitPriceFor = function (qty) {
  const tier = [...this.bulkTiers].sort((a, b) => b.minQty - a.minQty).find((t) => qty >= t.minQty);
  return tier ? tier.price : this.basePrice;
};
module.exports = mongoose.model('Product', schema);
