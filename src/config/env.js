const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredVariables = ['DB_NAME', 'DB_USER'];
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

function parseCommaSeparatedList(value, fallback) {
  return (value || fallback)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

module.exports = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
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
