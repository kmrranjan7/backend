const ApiError = require('../utils/api-error');

const fields = {
  firstName: { type: 'string', min: 1, max: 100 },
  lastName: { type: 'string', min: 1, max: 100 },
  email: { type: 'email', max: 255 },
  mobile: { type: 'mobile', max: 20 },
  password: { type: 'password', min: 8, max: 72 },
  status: { type: 'string', min: 1, max: 30 },
};

function validateField(name, value, rule) {
  if (typeof value !== 'string') return `${name} must be a string`;

  const trimmed = rule.type === 'password' ? value : value.trim();

  if (rule.min && trimmed.length < rule.min) {
    if (rule.type === 'password') return 'password must be between 8 and 72 characters';
    return `${name} is required`;
  }
  if (trimmed.length > rule.max) return `${name} must not exceed ${rule.max} characters`;

  if (rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'email must be a valid email address';
  }

  if (rule.type === 'mobile' && !/^\+?[0-9][0-9\s-]{6,18}[0-9]$/.test(trimmed)) {
    return 'mobile must be a valid phone number';
  }

  return null;
}

function validateUser({ partial = false } = {}) {
  return (req, res, next) => {
    const errors = [];
    const allowedFields = Object.keys(fields);
    const unknownFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

    unknownFields.forEach((field) => {
      errors.push({ field, message: `${field} is not allowed` });
    });

    allowedFields.forEach((field) => {
      const value = req.body[field];

      if (value === undefined) {
        if (!partial && field !== 'status') {
          errors.push({ field, message: `${field} is required` });
        }
        return;
      }

      const message = validateField(field, value, fields[field]);
      if (message) errors.push({ field, message });
    });

    if (partial && Object.keys(req.body).length === 0) {
      errors.push({ field: 'body', message: 'At least one field is required' });
    }

    if (errors.length > 0) {
      return next(new ApiError(422, 'Validation failed', errors));
    }

    return next();
  };
}

function validateId(req, res, next) {
  if (!/^[1-9]\d*$/.test(req.params.id)) {
    return next(new ApiError(422, 'Validation failed', [
      { field: 'id', message: 'id must be a positive integer' },
    ]));
  }

  return next();
}

function validatePagination(req, res, next) {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);

  if (!Number.isInteger(page) || page < 1) {
    return next(new ApiError(422, 'Validation failed', [
      { field: 'page', message: 'page must be a positive integer' },
    ]));
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return next(new ApiError(422, 'Validation failed', [
      { field: 'limit', message: 'limit must be an integer between 1 and 100' },
    ]));
  }

  req.query.page = page;
  req.query.limit = limit;
  return next();
}

module.exports = { validateUser, validateId, validatePagination };
