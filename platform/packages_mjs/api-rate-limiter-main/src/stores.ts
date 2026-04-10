import type { StorageAdapter, RedisClientLike } from './types.js';

export class MemoryStore implements StorageAdapter {
  private intervalMs: number;
  private counters = new Map<string, number>();
  private windows = new Map<string, number>();

  constructor(intervalMs: number) {
    this.intervalMs = intervalMs;
  }

  async incr(key: string): Promise<number> {
    return this.incrBy(key, 1);
  }

  async incrBy(key: string, n: number): Promise<number> {
    const now = Date.now();
    const windowStart = this.windows.get(key);

    if (!windowStart || now - windowStart >= this.intervalMs) {
      this.windows.set(key, now);
      this.counters.set(key, n);
      return n;
    }

    const newCount = (this.counters.get(key) || 0) + n;
    this.counters.set(key, newCount);
    return newCount;
  }

  async getCount(key: string): Promise<number> {
    const now = Date.now();
    const windowStart = this.windows.get(key);

    if (!windowStart || now - windowStart >= this.intervalMs) {
      return 0;
    }

    return this.counters.get(key) || 0;
  }

  async getTTL(key: string): Promise<number> {
    const windowStart = this.windows.get(key);
    if (!windowStart) return 0;

    const elapsed = Date.now() - windowStart;
    if (elapsed >= this.intervalMs) return 0;

    return Math.ceil((this.intervalMs - elapsed) / 1000);
  }

  async reset(key: string): Promise<void> {
    this.counters.delete(key);
    this.windows.delete(key);
  }
}

export class RedisStore implements StorageAdapter {
  private redis: RedisClientLike;
  private ttlSeconds: number;

  constructor(redisClient: RedisClientLike, intervalMs: number) {
    this.redis = redisClient;
    this.ttlSeconds = Math.ceil(intervalMs / 1000);
  }

  async incr(key: string): Promise<number> {
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, this.ttlSeconds);
    }
    return count;
  }

  async incrBy(key: string, n: number): Promise<number> {
    const count = await this.redis.incrby(key, n);
    const ttl = await this.redis.ttl(key);

    if (ttl === -1 || (ttl === -2 && count <= n)) {
      await this.redis.expire(key, this.ttlSeconds);
    }

    return count;
  }

  async getCount(key: string): Promise<number> {
    const value = await this.redis.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  async getTTL(key: string): Promise<number> {
    const ttl = await this.redis.ttl(key);
    return ttl > 0 ? ttl : 0;
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
