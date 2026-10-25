// Strips keys beginning with "$" or containing "." to block NoSQL operator injection.
const clean = (o) => {
  if (Array.isArray(o)) return o.map(clean);
  if (o && typeof o === 'object') {
    return Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('$') && !k.includes('.')).map(([k, v]) => [k, clean(v)]));
  }
  return o;
};
module.exports = (req, res, next) => { req.body = clean(req.body); Object.assign(req.query, clean({ ...req.query })); next(); };
