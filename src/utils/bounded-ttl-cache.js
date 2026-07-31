class BoundedTtlCache {
  constructor({ ttlMs, maxEntries, maxBytes, maxValueBytes }) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.maxBytes = maxBytes;
    this.maxValueBytes = maxValueBytes;
    this.currentBytes = 0;
    this.entries = new Map();
    this.pendingLoads = new Map();
    this.generation = 0;
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

  async getOrLoad(key, loader) {
    const cached = this.get(key);
    if (cached !== undefined) return { value: cached, status: 'HIT' };

    const pending = this.pendingLoads.get(key);
    if (pending) return { value: await pending, status: 'COALESCED' };

    const generation = this.generation;
    const load = Promise.resolve().then(loader);
    this.pendingLoads.set(key, load);

    try {
      const value = await load;
      if (generation === this.generation) this.set(key, value);
      return { value, status: 'MISS' };
    } finally {
      if (this.pendingLoads.get(key) === load) this.pendingLoads.delete(key);
    }
  }

  delete(key) {
    const entry = this.entries.get(key);
    if (!entry) return false;

    this.currentBytes -= entry.size;
    return this.entries.delete(key);
  }

  deleteByPrefix(prefix) {
    this.generation += 1;
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) this.delete(key);
    }
  }

  clear() {
    this.generation += 1;
    this.entries.clear();
    this.currentBytes = 0;
  }

  get size() {
    return this.entries.size;
  }
}

module.exports = BoundedTtlCache;
