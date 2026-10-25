const mongoose = require('mongoose');
module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set (see .env.example)');
  mongoose.connection.on('error', (e) => console.error('MongoDB error:', e.message));
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};
