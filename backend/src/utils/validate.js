const AppError = require('./AppError');
const isEmail = (v) => typeof v === 'string' && /^\S+@\S+\.\S+$/.test(v);
const str = (v) => (typeof v === 'string' ? v.trim() : '');
// rules: { field: (value, body) => errorMessage | undefined }
function check(body, rules) {
  const errors = {};
  for (const [f, rule] of Object.entries(rules)) { const m = rule(body[f], body); if (m) errors[f] = m; }
  if (Object.keys(errors).length) throw new AppError('Validation failed', 400, errors);
}
module.exports = { check, isEmail, str };
