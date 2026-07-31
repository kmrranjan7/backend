const { timingSafeEqual } = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/api-error');

function secureEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length
    && timingSafeEqual(leftBuffer, rightBuffer);
}

function suppliedApiKey(req) {
  const headerKey = req.get('X-API-Key');
  if (headerKey) return headerKey.trim();

  const authorization = req.get('Authorization') || '';
  return authorization.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : '';
}

function requireAdmin(req, res, next) {
  if (!env.adminApiKey) {
    return next(new ApiError(503, 'Administrative API access is not configured'));
  }

  const candidate = suppliedApiKey(req);
  if (candidate && secureEqual(candidate, env.adminApiKey)) {
    req.admin = { sub: 'api-key', email: null, type: 'api-key' };
    return next();
  }

  if (candidate) {
    try {
      req.admin = jwt.verify(candidate, env.adminApiKey, {
        algorithms: ['HS256'],
        issuer: 'sarkari-global-result-api',
        audience: 'sarkari-global-result-dashboard',
      });
      return next();
    } catch {
      // Use one response for expired, malformed, and invalid tokens.
    }
  }

  return next(new ApiError(401, 'Administrative authentication is required'));
}

function protectDraftListings(req, res, next) {
  return String(req.query.status || '').trim().toUpperCase() === 'PUBLISHED'
    ? next()
    : requireAdmin(req, res, next);
}

module.exports = { requireAdmin, protectDraftListings };
