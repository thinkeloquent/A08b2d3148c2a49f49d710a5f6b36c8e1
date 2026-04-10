import type { StorageAdapter, CapacityResult } from './types.js';

export class RateLimitStrategy {
  maxRequests: number | undefined;
  intervalMs: number;

  constructor(options: { maxRequests?: number; intervalMs?: number } = {}) {
    this.maxRequests = options.maxRequests;
    this.intervalMs = options.intervalMs || 60000;
  }

  async getCapacity(_store: StorageAdapter, _key: string): Promise<CapacityResult> {
    throw new Error('getCapacity must be implemented by subclass');
  }

  async recordUsage(_store: StorageAdapter, _key: string, _count: number): Promise<void> {
    throw new Error('recordUsage must be implemented by subclass');
  }
}

export class FixedWindowStrategy extends RateLimitStrategy {
  override async getCapacity(store: StorageAdapter, key: string): Promise<CapacityResult> {
    const used = await store.getCount(key);
    const remaining = Math.max(0, (this.maxRequests ?? 0) - used);
    const ttlSeconds = await store.getTTL(key);
    const resetMs = ttlSeconds > 0 ? ttlSeconds * 1000 : this.intervalMs;

    return { remaining, resetMs };
  }

  override async recordUsage(store: StorageAdapter, key: string, count: number): Promise<void> {
    await store.incrBy(key, count);
  }
}
