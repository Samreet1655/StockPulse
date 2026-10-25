require('dotenv').config();
const app = require('./app'), connectDB = require('./config/db');
if (!process.env.JWT_SECRET) { console.error('JWT_SECRET is required (see .env.example)'); process.exit(1); }
connectDB().then(() => app.listen(process.env.PORT || 5000, () => console.log(`API on :${process.env.PORT || 5000}`)))
  .catch((e) => { console.error('Startup failed:', e.message); process.exit(1); });
