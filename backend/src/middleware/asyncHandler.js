const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
module.exports = (obj) => Object.fromEntries(Object.entries(obj).map(([k, f]) => [k, wrap(f)]));
