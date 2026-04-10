import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  API_Rate_Limiter,
  MemoryStore,
  RedisStore,
  RateLimitError,
  RequestQueue,
} from '../src/index.js';
import type { RedisClientLike } from '../src/index.js';

const createMockRedisClient = (): RedisClientLike => ({
  incr: vi.fn(),
  incrby: vi.fn(),
  get: vi.fn(),
  ttl: vi.fn(),
  del: vi.fn(),
  expire: vi.fn(),
});

describe('API_Rate_Limiter', () => {
  let limiter: API_Rate_Limiter;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Functionality', () => {
    beforeEach(() => {
      limiter = new API_Rate_Limiter('test', {
        maxRequests: 5,
        intervalMs: 1000,
      });
    });

    test('should schedule and execute API calls within rate limit', async () => {
      const mockApi = vi
        .fn<(id: number) => Promise<string>>()
        .mockImplementation((id) => Promise.resolve(`result-${id}`));

      const promises = [1, 2, 3].map((id) =>
        limiter.schedule(() => mockApi(id)),
      );

      vi.runAllTimers();
      const values = await Promise.all(promises);

      expect(mockApi).toHaveBeenCalledTimes(3);
      expect(values).toEqual(['result-1', 'result-2', 'result-3']);
    });

    test('should queue requests when rate limit is exceeded', async () => {
      const mockApi = vi
        .fn<(id: number) => Promise<string>>()
        .mockImplementation((id) => Promise.resolve(`result-${id}`));

      const promises = Array.from({ length: 7 }, (_, i) =>
        limiter.schedule(() => mockApi(i)),
      );

      vi.runAllTimers();
      expect(mockApi).toHaveBeenCalledTimes(5);

      vi.advanceTimersByTime(1100);

      expect(mockApi).toHaveBeenCalledTimes(7);
    });

    test('should handle API call failures', async () => {
      const mockApi = vi.fn().mockRejectedValue(new Error('API Error'));

      await expect(limiter.schedule(mockApi)).rejects.toThrow('API Error');
      expect(mockApi).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dynamic Rate Limiting', () => {
    test('should use dynamic rate limit status', async () => {
      const mockStatus = vi.fn().mockResolvedValue({
        limit: 100,
        remaining: 50,
        reset: Math.floor(Date.now() / 1000) + 60,
      });

      limiter = new API_Rate_Limiter('dynamic', {
        getRateLimitStatus: mockStatus,
      });

      const mockApi = vi.fn().mockResolvedValue('success');

      Array.from({ length: 60 }, () => limiter.schedule(mockApi));

      vi.runAllTimers();

      expect(mockApi).toHaveBeenCalledTimes(50);
      expect(mockStatus).toHaveBeenCalled();
    });

    test('should handle dynamic status fetch failures', async () => {
      const mockStatus = vi
        .fn()
        .mockRejectedValue(new Error('Network error'));

      limiter = new API_Rate_Limiter('dynamic', {
        maxRequests: 10,
        intervalMs: 1000,
        getRateLimitStatus: mockStatus,
      });

      const mockApi = vi.fn().mockResolvedValue('success');
      await limiter.schedule(mockApi);

      vi.runAllTimers();

      expect(mockApi).toHaveBeenCalled();
    });
  });

  describe('Priority Queue', () => {
    beforeEach(() => {
      limiter = new API_Rate_Limiter('priority', {
        maxRequests: 2,
        intervalMs: 1000,
      });
    });

    test('should process high priority requests first', async () => {
      const order: string[] = [];
      const mockApi = (id: string) => {
        order.push(id);
        return Promise.resolve(id);
      };

      const promises = [
        limiter.schedule(() => mockApi('low'), { priority: 1 }),
        limiter.schedule(() => mockApi('high'), { priority: 10 }),
        limiter.schedule(() => mockApi('medium'), { priority: 5 }),
        limiter.schedule(() => mockApi('normal')),
      ];

      vi.runAllTimers();
      await Promise.all(promises.slice(0, 2));

      expect(order[0]).toBe('high');
      expect(order[1]).toBe('medium');
    });
  });

  describe('Event Emission', () => {
    beforeEach(() => {
      limiter = new API_Rate_Limiter('events', {
        maxRequests: 1,
        intervalMs: 1000,
      });
    });

    test('should emit lifecycle events', async () => {
      const events = {
        queued: vi.fn(),
        completed: vi.fn(),
        limited: vi.fn(),
        status: vi.fn(),
      };

      limiter.on('request:queued', events.queued);
      limiter.on('request:completed', events.completed);
      limiter.on('rate:limited', events.limited);
      limiter.on('status:update', events.status);

      const mockApi = vi.fn().mockResolvedValue('success');

      const p1 = limiter.schedule(mockApi);
      limiter.schedule(mockApi);

      vi.runAllTimers();
      await p1;

      expect(events.queued).toHaveBeenCalledTimes(2);
      expect(events.completed).toHaveBeenCalledTimes(1);
      expect(events.limited).toHaveBeenCalledTimes(1);
      expect(events.status).toHaveBeenCalled();
    });
  });

  describe('Storage Adapters', () => {
    describe('MemoryStore', () => {
      let store: MemoryStore;

      beforeEach(() => {
        store = new MemoryStore(1000);
      });

      test('should track counts within window', async () => {
        await store.incr('test');
        await store.incr('test');

        expect(await store.getCount('test')).toBe(2);
      });

      test('should reset count after window expires', async () => {
        await store.incr('test');
        expect(await store.getCount('test')).toBe(1);

        vi.advanceTimersByTime(1100);

        expect(await store.getCount('test')).toBe(0);
      });

      test('should calculate TTL correctly', async () => {
        await store.incr('test');

        vi.advanceTimersByTime(400);
        const ttl = await store.getTTL('test');

        expect(ttl).toBe(1); // ~600ms remaining = 1 second
      });
    });

    describe('RedisStore', () => {
      let store: RedisStore;
      let mockRedis: RedisClientLike;

      beforeEach(() => {
        mockRedis = createMockRedisClient();
        store = new RedisStore(mockRedis, 1000);
      });

      test('should increment and set expiry for new keys', async () => {
        (mockRedis.incr as ReturnType<typeof vi.fn>).mockResolvedValue(1);

        await store.incr('test');

        expect(mockRedis.incr).toHaveBeenCalledWith('test');
        expect(mockRedis.expire).toHaveBeenCalledWith('test', 1);
      });

      test('should increment by N', async () => {
        (mockRedis.incrby as ReturnType<typeof vi.fn>).mockResolvedValue(5);
        (mockRedis.ttl as ReturnType<typeof vi.fn>).mockResolvedValue(-2);

        await store.incrBy('test', 5);

        expect(mockRedis.incrby).toHaveBeenCalledWith('test', 5);
        expect(mockRedis.expire).toHaveBeenCalledWith('test', 1);
      });

      test('should get count from Redis', async () => {
        (mockRedis.get as ReturnType<typeof vi.fn>).mockResolvedValue('42');

        const count = await store.getCount('test');

        expect(count).toBe(42);
      });

      test('should handle missing keys', async () => {
        (mockRedis.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);

        const count = await store.getCount('test');

        expect(count).toBe(0);
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      limiter = new API_Rate_Limiter('errors', {
        maxRequests: 5,
        intervalMs: 1000,
        maxRetries: 2,
      });
    });

    test('should retry rate limit errors', async () => {
      let attempts = 0;
      const mockApi = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts === 1) {
          const error = new Error('Rate limited') as Error & { status: number };
          error.status = 429;
          throw error;
        }
        return Promise.resolve('success');
      });

      const promise = limiter.schedule(mockApi);

      vi.runAllTimers();

      expect(limiter.getStats().queueSize).toBe(1);

      vi.runAllTimers();

      const result = await promise;
      expect(result).toBe('success');
      expect(mockApi).toHaveBeenCalledTimes(2);
    });

    test('should reject after max retries', async () => {
      const mockApi = vi.fn().mockImplementation(() => {
        const error = new Error('Rate limited') as Error & { status: number };
        error.status = 429;
        throw error;
      });

      const promise = limiter.schedule(mockApi);

      for (let i = 0; i <= 3; i++) {
        vi.runAllTimers();
      }

      await expect(promise).rejects.toThrow(RateLimitError);
      expect(mockApi).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
  });

  describe('Statistics and Management', () => {
    beforeEach(() => {
      limiter = new API_Rate_Limiter('stats', {
        maxRequests: 5,
        intervalMs: 1000,
      });
    });

    test('should provide accurate statistics', () => {
      const mockApi = vi.fn().mockResolvedValue('success');

      limiter.schedule(mockApi);
      limiter.schedule(mockApi);
      limiter.schedule(mockApi);

      const stats = limiter.getStats();

      expect(stats.resourceType).toBe('stats');
      expect(stats.queueSize).toBe(3);
      expect(stats.processing).toBe(false);
      expect(stats.oldestRequest).toBeGreaterThan(0);
    });

    test('should clear queue on demand', () => {
      const mockApi = vi.fn();

      limiter.schedule(mockApi);
      limiter.schedule(mockApi);
      limiter.schedule(mockApi);

      expect(limiter.getStats().queueSize).toBe(3);

      const cleared = limiter.clearQueue();

      expect(cleared).toBe(3);
      expect(limiter.getStats().queueSize).toBe(0);
      expect(mockApi).not.toHaveBeenCalled();
    });
  });

  describe('RequestQueue', () => {
    let queue: RequestQueue;

    beforeEach(() => {
      queue = new RequestQueue({ maxQueueSize: 5 });
    });

    test('should enforce max queue size', () => {
      for (let i = 0; i < 5; i++) {
        queue.enqueue({
          fn: vi.fn(),
          resolve: vi.fn(),
          reject: vi.fn(),
          timestamp: Date.now(),
          retries: 0,
          metadata: {},
        });
      }

      expect(() =>
        queue.enqueue({
          fn: vi.fn(),
          resolve: vi.fn(),
          reject: vi.fn(),
          timestamp: Date.now(),
          retries: 0,
          metadata: {},
        }),
      ).toThrow('Queue size limit reached');
    });

    test('should handle mixed priority and normal requests', () => {
      queue.enqueue({ fn: vi.fn(), resolve: vi.fn(), reject: vi.fn(), timestamp: Date.now(), retries: 0, metadata: { id: 1 }, priority: 5 });
      queue.enqueue({ fn: vi.fn(), resolve: vi.fn(), reject: vi.fn(), timestamp: Date.now(), retries: 0, metadata: { id: 2 } });
      queue.enqueue({ fn: vi.fn(), resolve: vi.fn(), reject: vi.fn(), timestamp: Date.now(), retries: 0, metadata: { id: 3 }, priority: 10 });
      queue.enqueue({ fn: vi.fn(), resolve: vi.fn(), reject: vi.fn(), timestamp: Date.now(), retries: 0, metadata: { id: 4 } });

      const batch = queue.dequeue(3);

      expect(batch.map((r) => (r.metadata as { id: number }).id)).toEqual([3, 1, 2]);
    });
  });
});
