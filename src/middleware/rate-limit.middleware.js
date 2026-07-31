const { rateLimit } = require('express-rate-limit');
const env = require('../config/env');

function limiter({ windowMs, limit, identifier }) {
  return rateLimit({
    windowMs,
    limit,
    identifier,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    skip: (req) => req.method === 'OPTIONS',
    message: {
      success: false,
      message: 'Too many requests. Please wait and try again.',
      errors: null,
    },
  });
}

const publicApiLimiter = limiter({
  windowMs: env.rateLimit.windowMs,
  limit: env.rateLimit.publicMax,
  identifier: 'public-api',
});

const writeApiLimiter = limiter({
  windowMs: env.rateLimit.windowMs,
  limit: env.rateLimit.writeMax,
  identifier: 'write-api',
});

const contactSubmissionLimiter = limiter({
  windowMs: env.rateLimit.contactWindowMs,
  limit: env.rateLimit.contactMax,
  identifier: 'contact-submission',
});

module.exports = { publicApiLimiter, writeApiLimiter, contactSubmissionLimiter };
