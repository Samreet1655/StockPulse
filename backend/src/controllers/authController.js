const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { check, isEmail, str } = require('../utils/validate');
const sign = (u) => jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  check(req.body, {
    name: (v) => (str(v).length < 2 ? 'Name must be at least 2 characters' : undefined),
    email: (v) => (!isEmail(v) ? 'Enter a valid email address' : undefined),
    password: (v) => (typeof v !== 'string' || v.length < 8 ? 'Password must be at least 8 characters' : undefined),
  });
  const { name, email, password, company, phone, address } = req.body;
  if (await User.findOne({ email: email.toLowerCase() })) throw new AppError('An account with this email already exists', 409, { email: 'Email already registered' });
  // Role is never read from the request: public sign-ups are always retailers.
  const user = await User.create({ name: str(name), email, company: str(company), phone: str(phone), address: str(address), role: 'retailer', passwordHash: await bcrypt.hash(password, 12) });
  res.status(201).json({ success: true, data: { user, token: sign(user) } });
};
exports.login = async (req, res) => {
  check(req.body, { email: (v) => (!isEmail(v) ? 'Enter a valid email address' : undefined), password: (v) => (!v ? 'Password is required' : undefined) });
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(String(req.body.password), user.passwordHash))) throw new AppError('Incorrect email or password', 401);
  res.json({ success: true, data: { user, token: sign(user) } });
};
exports.me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError('User no longer exists', 401);
  res.json({ success: true, data: { user } });
};
