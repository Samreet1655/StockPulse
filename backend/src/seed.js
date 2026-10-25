// Development-only seed. Wipes products/orders/users and recreates demo data.
require('dotenv').config();
if (process.env.NODE_ENV === 'production') { console.error('Refusing to seed in production'); process.exit(1); }
const bcrypt = require('bcryptjs'), mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User'), Product = require('./models/Product'), Order = require('./models/Order');

// name, category, sku, price, moq, stock, lowThreshold, target, bulk tiers [[minQty, price]], image keywords
const P = [
  ['Single-Origin Arabica Beans 1kg', 'Coffee & Tea', 'COF-ARB-1K', 18.5, 6, 240, 40, 300, [[24, 16.9], [60, 15.4]], 'coffee,beans'],
  ['Ceylon Black Tea, 100 Bags', 'Coffee & Tea', 'TEA-CEY-100', 6.2, 12, 18, 30, 200, [[48, 5.6], [120, 5.1]], 'tea,cup'],
  ['Cold Brew Concentrate 1L', 'Coffee & Tea', 'COF-CBC-1L', 9.8, 12, 0, 24, 150, [[36, 8.9]], 'coffee,bottle'],
  ['Organic Extra Virgin Olive Oil 750ml', 'Pantry', 'PAN-EVO-750', 11.4, 12, 320, 60, 400, [[48, 10.2], [144, 9.4]], 'olive,oil'],
  ['Basmati Rice 5kg', 'Pantry', 'PAN-BAS-5K', 8.9, 10, 410, 80, 500, [[50, 8.1]], 'rice,grain'],
  ['Wildflower Honey 500g', 'Pantry', 'PAN-HON-500', 7.3, 12, 9, 20, 160, [[48, 6.6]], 'honey,jar'],
  ['Sea Salt Flakes 250g', 'Pantry', 'PAN-SAL-250', 2.9, 24, 520, 100, 600, [[120, 2.5], [300, 2.2]], 'salt,spice'],
  ['Dark Chocolate Bars 70%, Box of 24', 'Confectionery', 'CON-DRK-24', 21.0, 4, 75, 15, 120, [[12, 19.0]], 'chocolate,bar'],
  ['Salted Caramel Biscuits, Case of 36', 'Confectionery', 'CON-BIS-36', 26.5, 3, 4, 10, 80, [[10, 24.0]], 'biscuit,cookie'],
  ['Recycled Kraft Mailer Boxes, Pack of 50', 'Packaging', 'PKG-KRF-50', 24.0, 5, 180, 30, 220, [[20, 21.5], [50, 19.0]], 'cardboard,box'],
  ['Compostable Mailing Bags, Pack of 100', 'Packaging', 'PKG-CMB-100', 19.9, 5, 14, 25, 150, [[25, 17.8]], 'package,shipping'],
  ['Glass Storage Jars 500ml, Pack of 12', 'Packaging', 'PKG-JAR-12', 15.6, 6, 96, 20, 140, [[24, 14.0]], 'glass,jar'],
  ['Bamboo Cutting Board, Large', 'Kitchenware', 'KIT-BAM-LRG', 14.2, 6, 64, 12, 90, [[24, 12.6]], 'cutting,board'],
  ['Stainless Steel Chef Knife 20cm', 'Kitchenware', 'KIT-KNF-20', 32.0, 4, 28, 10, 60, [[12, 29.0]], 'kitchen,knife'],
  ['Ceramic Pour-Over Set', 'Kitchenware', 'KIT-POR-SET', 27.5, 4, 0, 8, 48, [[12, 24.5]], 'ceramic,coffee'],
  ['Soy Wax Candles, Set of 6', 'Home & Living', 'HOM-CAN-6', 29.0, 4, 120, 20, 160, [[16, 26.0]], 'candle,home'],
  ['Linen Tea Towels, Pack of 10', 'Home & Living', 'HOM-TWL-10', 34.0, 3, 52, 10, 80, [[10, 30.5]], 'linen,towel'],
  ['Woven Storage Baskets, Set of 3', 'Home & Living', 'HOM-BSK-3', 38.0, 3, 6, 8, 60, [[9, 34.0]], 'basket,woven'],
  ['Hand Soap Refill 5L, Lavender', 'Cleaning', 'CLN-SOP-5L', 16.8, 4, 140, 25, 180, [[20, 15.2]], 'soap,bottle'],
  ['Microfibre Cloths, Pack of 24', 'Cleaning', 'CLN-MFC-24', 12.5, 6, 260, 40, 300, [[36, 11.2], [96, 10.1]], 'cleaning,cloth'],
  ['Eco Dish Soap 1L, Case of 12', 'Cleaning', 'CLN-DSH-12', 28.0, 3, 33, 12, 90, [[12, 25.0]], 'dish,soap'],
  ['Notebook A5 Dotted, Box of 20', 'Stationery', 'STA-NTB-20', 31.0, 3, 88, 15, 120, [[10, 28.0]], 'notebook,paper'],
  ['Gel Pens Assorted, Box of 50', 'Stationery', 'STA-PEN-50', 17.5, 4, 12, 20, 140, [[16, 15.5]], 'pens,stationery'],
  ['Recycled Paper Ream A4, 5 Pack', 'Stationery', 'STA-PAP-5', 22.0, 4, 300, 50, 360, [[20, 19.5], [60, 17.5]], 'paper,stack'],
];
const D = { 'Coffee & Tea': 'Freshly packed and traceable to origin, sold in cases suited to cafe and retail shelves.', Pantry: 'A dependable staple with consistent quality batch to batch, packed for resale.', Confectionery: 'Shelf-stable treats with strong sell-through, supplied in display-ready cases.', Packaging: 'Practical, sustainably sourced packaging for retailers who ship or wrap in-house.', Kitchenware: 'Durable, well-finished kitchen tools chosen for repeat purchase and gifting.', 'Home & Living': 'Considered home goods with steady demand across seasons.', Cleaning: 'Concentrated, refillable cleaning products that keep per-use cost low.', Stationery: 'Everyday stationery in bulk quantities with reliable restocking.' };

(async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);
  const admin = await User.create({ name: 'Priya Admin', email: 'admin@stockpulse.dev', role: 'admin', passwordHash: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin@12345', 12) });
  const retailer = await User.create({ name: 'Arjun Mehta', email: 'retailer@stockpulse.dev', company: 'Mehta General Store', phone: '+91 98765 43210', address: '14 Mall Road', passwordHash: await bcrypt.hash(process.env.SEED_RETAILER_PASSWORD || 'Retail@12345', 12) });
  const products = await Product.insertMany(await Promise.all(P.map(async ([name, category, sku, basePrice, minOrderQty, stockQuantity, lowStockThreshold, targetStockLevel, tiers, kw], i) => {
    const doc = new Product({ name, category, sku, basePrice, minOrderQty, stockQuantity, lowStockThreshold, targetStockLevel,
      description: D[category], bulkTiers: tiers.map(([minQty, price]) => ({ minQty, price })), images: [`https://loremflickr.com/800/600/${kw}?lock=${i + 11}`, `https://loremflickr.com/800/600/${kw}?lock=${i + 71}`] });
    await doc.validate(); return doc;
  })));
  const mk = (days, status, picks, city) => {
    const items = picks.map(([idx, qty]) => { const p = products[idx], unitPrice = p.unitPriceFor(qty); return { product: p._id, name: p.name, sku: p.sku, image: p.images[0], quantity: qty, unitPrice, lineTotal: Math.round(unitPrice * qty * 100) / 100 }; });
    const total = Math.round(items.reduce((s, i) => s + i.lineTotal, 0) * 100) / 100;
    const d = new Date(Date.now() - days * 864e5);
    return { retailer: retailer._id, items, subtotal: total, total, status, createdAt: d, updatedAt: d,
      delivery: { contactName: retailer.name, company: retailer.company, phone: retailer.phone, address: '14 Mall Road', city, postalCode: '140401' } };
  };
  await Order.insertMany([mk(1, 'pending', [[0, 24], [3, 48]], 'Rajpura'), mk(3, 'confirmed', [[9, 20]], 'Rajpura'), mk(6, 'shipped', [[4, 50], [6, 120]], 'Patiala'), mk(12, 'delivered', [[19, 36], [21, 10]], 'Rajpura'), mk(20, 'cancelled', [[7, 12]], 'Chandigarh')], { timestamps: false });
  console.log(`Seeded ${products.length} products, 2 users, 5 orders.\n  admin@stockpulse.dev / ${process.env.SEED_ADMIN_PASSWORD || 'Admin@12345'}\n  retailer@stockpulse.dev / ${process.env.SEED_RETAILER_PASSWORD || 'Retail@12345'}`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
