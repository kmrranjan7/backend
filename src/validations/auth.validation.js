const ApiError = require('../utils/api-error');

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  const errors = [];

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push({ field: 'email', message: 'Enter a valid email address' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    errors.push({ field: 'password', message: 'Password must contain 8 to 72 characters' });
  }
  if (Object.keys(req.body || {}).some((field) => !['email', 'password'].includes(field))) {
    errors.push({ field: 'body', message: 'Only email and password are allowed' });
  }

  if (errors.length) return next(new ApiError(422, 'Validation failed', errors));
  req.body = { email: email.trim(), password };
  return next();
}

module.exports = { validateLogin };
