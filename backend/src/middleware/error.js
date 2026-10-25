module.exports = (err, req, res, next) => {
  let status = err.status || 500, message = err.message, details = err.details;
  if (err.name === 'ValidationError' && err.errors) {
    status = 400; message = 'Validation failed';
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err.name === 'CastError') { status = 400; message = 'Invalid identifier'; }
  else if (err.code === 11000) { status = 409; message = `Duplicate value for ${Object.keys(err.keyValue || {}).join(', ')}`; }
  else if (err.type === 'entity.parse.failed') { status = 400; message = 'Malformed JSON body'; }
  if (status >= 500) { console.error(err); if (process.env.NODE_ENV === 'production') message = 'Internal server error'; }
  res.status(status).json({ success: false, message, ...(details && { errors: details }) });
};
