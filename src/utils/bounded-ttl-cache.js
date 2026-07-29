class BoundedTtlCache {
  constructor({ ttlMs, maxEntries, maxBytes, maxValueBytes }) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.maxBytes = maxBytes;
    this.maxValueBytes = maxValueBytes;
    this.currentBytes = 0;
    this.entries = new Map();
  }

  get(key) {
    const entry = this.entries.get(key);

    if (!entry) return undefined;

    if (entry.expiresAt <= Date.now()) {
      this.delete(key);
      return undefined;
    }

    // Refresh insertion order so the least recently used entry stays first.
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value;
  }

  set(key, value) {
    const size = Buffer.byteLength(JSON.stringify(value));

    if (size > this.maxValueBytes || size > this.maxBytes) return false;
    if (this.entries.has(key)) this.delete(key);

    while (
      this.entries.size >= this.maxEntries
      || this.currentBytes + size > this.maxBytes
    ) {
      const oldestKey = this.entries.keys().next().value;
      this.delete(oldestKey);
    }

    this.entries.set(key, {
      value,
      size,
      expiresAt: Date.now() + this.ttlMs,
    });
    this.currentBytes += size;
    return true;
  }

  delete(key) {
    const entry = this.entries.get(key);
    if (!entry) return false;

    this.currentBytes -= entry.size;
    return this.entries.delete(key);
  }

  deleteByPrefix(prefix) {
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) this.delete(key);
    }
  }

  clear() {
    this.entries.clear();
    this.currentBytes = 0;
  }

  get size() {
    return this.entries.size;
  }
}

module.exports = BoundedTtlCache;
