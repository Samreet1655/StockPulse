const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['retailer', 'admin'], default: 'retailer' },
  company: { type: String, trim: true, maxlength: 120 },
  phone: { type: String, trim: true, maxlength: 30 },
  address: { type: String, trim: true, maxlength: 250 },
}, { timestamps: true });
schema.set('toJSON', { transform: (d, r) => { delete r.passwordHash; delete r.__v; return r; } });
module.exports = mongoose.model('User', schema);
