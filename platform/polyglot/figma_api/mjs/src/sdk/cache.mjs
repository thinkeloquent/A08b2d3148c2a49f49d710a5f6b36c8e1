/**
 * Cache Module — Figma API SDK
 *
 * LRU request cache for GET requests.
 * max_size=100, ttl=300 seconds.
 */

import { create } from '../logger.mjs';

const log = create('figma-api', import.meta.url);

export class RequestCache {
  constructor({ maxSize = 100, ttl = 300 } = {}) {
    this.maxSize = maxSize;
    this.ttl = ttl * 1000; // convert to ms
    this._cache = new Map();
    this._stats = { hits: 0, misses: 0 };
  }

  _isExpired(entry) {
    return Date.now() - entry.timestamp > this.ttl;
  }

  _evictIfNeeded() {
    if (this._cache.size >= this.maxSize) {
      const oldestKey = this._cache.keys().next().value;
      this._cache.delete(oldestKey);
      log.debug('cache evicted oldest entry', { key: oldestKey });
    }
  }

  get(key) {
    const entry = this._cache.get(key);
    if (!entry) {
      this._stats.misses++;
      return undefined;
    }
    if (this._isExpired(entry)) {
      this._cache.delete(key);
      this._stats.misses++;
      log.debug('cache entry expired', { key });
      return undefined;
    }
    // Move to end for LRU
    this._cache.delete(key);
    this._cache.set(key, entry);
    this._stats.hits++;
    return entry.data;
  }

  set(key, data) {
    if (this._cache.has(key)) {
      this._cache.delete(key);
    }
    this._evictIfNeeded();
    this._cache.set(key, { data, timestamp: Date.now() });
  }

  has(key) {
    const entry = this._cache.get(key);
    if (!entry) return false;
    if (this._isExpired(entry)) {
      this._cache.delete(key);
      return false;
    }
    return true;
  }

  clear() {
    this._cache.clear();
    log.debug('cache cleared');
  }

  get stats() {
    return { ...this._stats, size: this._cache.size };
  }
}
