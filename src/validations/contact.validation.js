const ApiError = require('../utils/api-error');
const { parsePagination } = require('../utils/pagination');

const CONTACT_FIELDS = Object.freeze({
  fullName: { min: 2, max: 120 },
  email: { max: 160 },
  phone: {},
  inquiryType: { min: 2, max: 60 },
  subject: { min: 3, max: 180 },
  message: { min: 10, max: 4000 },
});

function validateContact(req, res, next) {
  const errors = [];
  const allowedFields = Object.keys(CONTACT_FIELDS);

  Object.keys(req.body).forEach((field) => {
    if (!allowedFields.includes(field)) {
      errors.push({ field, message: `${field} is not allowed` });
    }
  });

  Object.entries(CONTACT_FIELDS).forEach(([field, limits]) => {
    const value = req.body[field];

    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push({ field, message: `${field} is required` });
      return;
    }

    const length = value.trim().length;

    if (limits.min && length < limits.min) {
      errors.push({
        field,
        message: `${field} must contain at least ${limits.min} characters`,
      });
    }

    if (limits.max && length > limits.max) {
      errors.push({
        field,
        message: `${field} must not exceed ${limits.max} characters`,
      });
    }
  });

  if (
    typeof req.body.email === 'string'
    && req.body.email.length <= 160
    && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email.trim())
  ) {
    errors.push({ field: 'email', message: 'email must be valid' });
  }

  if (
    typeof req.body.phone === 'string'
    && !/^[0-9]{10}$/.test(req.body.phone.trim())
  ) {
    errors.push({ field: 'phone', message: 'phone must be a valid 10-digit number' });
  }

  if (errors.length > 0) {
    return next(new ApiError(422, 'Validation failed', errors));
  }

  return next();
}

function validateContactQuery(req, res, next) {
  const allowedFields = ['page', 'size', 'sortDir'];
  const unknownField = Object.keys(req.query).find((field) => !allowedFields.includes(field));
  const { page, size, errors } = parsePagination(req.query);
  const sortDir = (req.query.sortDir || 'desc').toLowerCase();

  if (unknownField) {
    errors.push({ field: unknownField, message: `${unknownField} is not allowed` });
  }


  if (!['asc', 'desc'].includes(sortDir)) {
    errors.push({ field: 'sortDir', message: 'sortDir must be asc or desc' });
  }

  if (errors.length > 0) {
    return next(new ApiError(422, 'Validation failed', errors));
  }

  req.query = {
    page,
    size,
    sortBy: 'createdAt',
    sortDir,
  };

  return next();
}

module.exports = { validateContact, validateContactQuery };
