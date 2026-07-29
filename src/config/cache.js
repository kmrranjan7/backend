const env = require('./env');
const BoundedTtlCache = require('../utils/bounded-ttl-cache');

const cache = new BoundedTtlCache({
  ttlMs: env.cache.ttlMs,
  maxEntries: env.cache.maxEntries,
  maxBytes: env.cache.maxBytes,
  maxValueBytes: env.cache.maxValueBytes,
});

const clearTimer = setInterval(() => {
  cache.clear();
}, env.cache.clearIntervalMs);

clearTimer.unref();

module.exports = cache;
