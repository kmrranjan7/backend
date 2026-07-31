const { UniqueConstraintError, ValidationError } = require('sequelize');
const ApiError = require('../utils/api-error');

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let details = error.details || null;
  const databaseErrorCode = error.parent?.code || error.original?.code;
  const temporaryDatabaseErrors = new Set([
    'ETIMEDOUT',
    'ECONNRESET',
    'ECONNREFUSED',
    'ER_CON_COUNT_ERROR',
    'ER_USER_LIMIT_REACHED',
    'PROTOCOL_CONNECTION_LOST',
  ]);

  if (error instanceof UniqueConstraintError) {
    statusCode = 409;
    const fields = Object.keys(error.fields || {});

    if (fields.includes('email')) {
      message = 'A user with this email already exists';
    } else if (fields.includes('post_slug') || fields.includes('postSlug')) {
      message = 'postSlug already exists';
    } else if (fields.includes('post_id') || fields.includes('postId')) {
      message = 'postId already exists';
    } else {
      message = 'A record with the supplied unique value already exists';
    }

    details = null;
  } else if (error instanceof ValidationError) {
    statusCode = 400;
    message = 'Database validation failed';
    details = error.errors.map(({ path, message: validationMessage }) => ({
      field: path,
      message: validationMessage,
    }));
  } else if (temporaryDatabaseErrors.has(databaseErrorCode)) {
    statusCode = 503;
    message = 'The service is temporarily busy. Please try again shortly.';
    details = null;
    res.set('Retry-After', '5');
  }

  if (statusCode >= 500) {
    console.error({
      name: error.name,
      code: databaseErrorCode,
      message: error.message,
      method: req.method,
      path: req.originalUrl,
    });

    if (statusCode !== 503) {
      message = 'Internal server error';
    }
    details = null;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors: details,
  });
}

module.exports = { notFoundHandler, errorHandler };
