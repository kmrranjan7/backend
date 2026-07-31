const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const requiredVariables = [
  'DB_NAME',
  'DB_USER',
  ...(nodeEnv === 'production'
    ? ['DB_PASSWORD', 'CORS_ALLOWED_ORIGINS', 'ADMIN_API_KEY']
    : []),
];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
}

function parsePort(value, fallback) {
  const port = Number(value || fallback);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port value: ${value}`);
  }

  return port;
}

function parsePositiveInteger(value, fallback, name) {
  const parsedValue = Number(value || fallback);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsedValue;
}

function parseNonNegativeInteger(value, fallback, name) {
  const parsedValue = Number(value ?? fallback);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }

  return parsedValue;
}

function parseCommaSeparatedList(value, fallback) {
  return (value || fallback)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const databasePoolMax = parsePositiveInteger(process.env.DB_POOL_MAX, 20, 'DB_POOL_MAX');
const databasePoolMin = parseNonNegativeInteger(process.env.DB_POOL_MIN, 2, 'DB_POOL_MIN');

if (databasePoolMin > databasePoolMax) {
  throw new Error('DB_POOL_MIN must not exceed DB_POOL_MAX');
}

if (nodeEnv === 'production' && process.env.ADMIN_API_KEY.length < 32) {
  throw new Error('ADMIN_API_KEY must contain at least 32 characters in production');
}

module.exports = Object.freeze({
  nodeEnv,
  port: parsePort(process.env.PORT, 3000),
  cors: Object.freeze({
    allowedOrigins: Object.freeze(
      parseCommaSeparatedList(
        process.env.CORS_ALLOWED_ORIGINS,
        'http://localhost:3000',
      ),
    ),
  }),
  database: Object.freeze({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parsePort(process.env.DB_PORT, 3306),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    pool: Object.freeze({
      max: databasePoolMax,
      min: databasePoolMin,
      acquireMs: parsePositiveInteger(process.env.DB_POOL_ACQUIRE_MS, 30000, 'DB_POOL_ACQUIRE_MS'),
      idleMs: parsePositiveInteger(process.env.DB_POOL_IDLE_MS, 10000, 'DB_POOL_IDLE_MS'),
    }),
  }),
  adminApiKey: process.env.ADMIN_API_KEY || '',
  rateLimit: Object.freeze({
    windowMs: parsePositiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 60000, 'RATE_LIMIT_WINDOW_MS'),
    publicMax: parsePositiveInteger(process.env.RATE_LIMIT_PUBLIC_MAX, 600, 'RATE_LIMIT_PUBLIC_MAX'),
    writeMax: parsePositiveInteger(process.env.RATE_LIMIT_WRITE_MAX, 60, 'RATE_LIMIT_WRITE_MAX'),
    contactWindowMs: parsePositiveInteger(
      process.env.CONTACT_RATE_LIMIT_WINDOW_MS,
      900000,
      'CONTACT_RATE_LIMIT_WINDOW_MS',
    ),
    contactMax: parsePositiveInteger(process.env.CONTACT_RATE_LIMIT_MAX, 10, 'CONTACT_RATE_LIMIT_MAX'),
  }),
  cache: Object.freeze({
    ttlMs: parsePositiveInteger(process.env.CACHE_TTL_MS, 1800000, 'CACHE_TTL_MS'),
    clearIntervalMs: parsePositiveInteger(
      process.env.CACHE_CLEAR_INTERVAL_MS,
      1800000,
      'CACHE_CLEAR_INTERVAL_MS',
    ),
    maxEntries: parsePositiveInteger(process.env.CACHE_MAX_ENTRIES, 200, 'CACHE_MAX_ENTRIES'),
    maxBytes: parsePositiveInteger(
      process.env.CACHE_MAX_BYTES,
      64 * 1024 * 1024,
      'CACHE_MAX_BYTES',
    ),
    maxValueBytes: parsePositiveInteger(
      process.env.CACHE_MAX_VALUE_BYTES,
      2 * 1024 * 1024,
      'CACHE_MAX_VALUE_BYTES',
    ),
  }),
});
