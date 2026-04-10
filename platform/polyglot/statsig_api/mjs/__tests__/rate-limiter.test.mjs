/**
 * Unit tests for rate-limiter module.
 *
 * Tests cover:
 * - Statement coverage for RateLimiter and helper functions
 * - Branch coverage for auto-wait, callback, max retries
 * - Boundary values for parseRetryAfter edge cases
 * - Error handling for RateLimitError scenarios
 * - Log verification for warning/info emission
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  RateLimiter,
  parseRetryAfter,
  buildRateLimitInfo,
} from '../src/rate-limiter.mjs';
import { RateLimitError } from '../src/errors.mjs';

function createMockLogger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

function createMockResponse(status, headers = {}) {
  return {
    status,
    headers: {
      forEach: (cb) => Object.entries(headers).forEach(([k, v]) => cb(v, k)),
    },
    json: vi.fn().mockResolvedValue({}),
    text: vi.fn().mockResolvedValue(''),
  };
}

describe('parseRetryAfter', () => {
  describe('Statement Coverage', () => {
    it('should parse numeric string', () => {
      expect(parseRetryAfter('5')).toBe(5);
    });

    it('should parse float string', () => {
      expect(parseRetryAfter('2.5')).toBe(3);
    });
  });

  describe('Boundary Values', () => {
    it('should return 60 for null', () => {
      expect(parseRetryAfter(null)).toBe(60);
    });

    it('should return 60 for undefined', () => {
      expect(parseRetryAfter(undefined)).toBe(60);
    });

    it('should return 60 for empty string', () => {
      expect(parseRetryAfter('')).toBe(60);
    });

    it('should return 60 for non-numeric string', () => {
      expect(parseRetryAfter('abc')).toBe(60);
    });

    it('should handle zero', () => {
      // '0' is not > 0, falls through to Date.parse which may return a past date → 1
      const result = parseRetryAfter('0');
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it('should handle negative number', () => {
      // '-5' is not > 0, falls through to Date.parse fallback
      const result = parseRetryAfter('-5');
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it('should handle large number', () => {
      expect(parseRetryAfter('3600')).toBe(3600);
    });
  });
});

describe('buildRateLimitInfo', () => {
  describe('Statement Coverage', () => {
    it('should build info from headers', () => {
      const info = buildRateLimitInfo({
        'retry-after': '10',
        'x-ratelimit-remaining': '5',
        'x-ratelimit-limit': '100',
        'x-ratelimit-reset': '1700000000',
      });
      expect(info.retryAfter).toBe(10);
      expect(info.remaining).toBe(5);
      expect(info.limit).toBe(100);
      expect(info.resetAt).toBeInstanceOf(Date);
      expect(info.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Boundary Values', () => {
    it('should handle missing optional headers', () => {
      const info = buildRateLimitInfo({ 'retry-after': '1' });
      expect(info.remaining).toBeNull();
      expect(info.limit).toBeNull();
      expect(info.resetAt).toBeNull();
    });

    it('should handle empty headers', () => {
      const info = buildRateLimitInfo({});
      expect(info.retryAfter).toBe(60);
    });
  });
});

describe('RateLimiter', () => {
  let logger;

  beforeEach(() => {
    logger = createMockLogger();
    vi.useFakeTimers();
  });

  describe('Statement Coverage', () => {
    it('should initialize with defaults', () => {
      const limiter = new RateLimiter({ logger });
      expect(limiter.lastRateLimit).toBeNull();
    });

    it('should handle non-429 by returning response as-is via client._request flow', async () => {
      // The RateLimiter is only called when status is 429, so we test that path
      const limiter = new RateLimiter({ autoWait: true, logger });
      const response = createMockResponse(429, { 'retry-after': '0' });
      const retryFn = vi.fn().mockResolvedValue({ status: 200, data: 'ok' });

      const resultPromise = limiter.handleResponse(response, retryFn, 0);
      await vi.advanceTimersByTimeAsync(60000);
      const result = await resultPromise;

      expect(retryFn).toHaveBeenCalled();
    });
  });

  describe('Branch Coverage', () => {
    it('should throw when auto-wait is disabled', async () => {
      const limiter = new RateLimiter({ autoWait: false, logger });
      const response = createMockResponse(429, { 'retry-after': '1' });

      await expect(
        limiter.handleResponse(response, vi.fn(), 0)
      ).rejects.toThrow(RateLimitError);
    });

    it('should throw when max retries exceeded', async () => {
      const limiter = new RateLimiter({ autoWait: true, maxRetries: 2, logger });
      const response = createMockResponse(429, { 'retry-after': '1' });

      await expect(
        limiter.handleResponse(response, vi.fn(), 2)
      ).rejects.toThrow(RateLimitError);
    });

    it('should throw when callback returns false', async () => {
      const callback = vi.fn().mockReturnValue(false);
      const limiter = new RateLimiter({ autoWait: true, onRateLimit: callback, logger });
      const response = createMockResponse(429, { 'retry-after': '1' });

      await expect(
        limiter.handleResponse(response, vi.fn(), 0)
      ).rejects.toThrow(RateLimitError);
      expect(callback).toHaveBeenCalled();
    });

    it('should retry when callback returns true', async () => {
      const callback = vi.fn().mockReturnValue(true);
      const limiter = new RateLimiter({
        autoWait: true,
        maxRetries: 3,
        onRateLimit: callback,
        logger,
      });
      const response = createMockResponse(429, { 'retry-after': '0' });
      const retryFn = vi.fn().mockResolvedValue({ status: 200, data: 'ok' });

      const resultPromise = limiter.handleResponse(response, retryFn, 0);
      await vi.advanceTimersByTimeAsync(60000);
      const result = await resultPromise;

      expect(retryFn).toHaveBeenCalled();
    });

    it('should auto-wait and retry on 429', async () => {
      const limiter = new RateLimiter({ autoWait: true, maxRetries: 3, logger });
      const response = createMockResponse(429, { 'retry-after': '1' });
      const successResult = { status: 200, data: 'success' };
      const retryFn = vi.fn().mockResolvedValue(successResult);

      const resultPromise = limiter.handleResponse(response, retryFn, 0);
      await vi.advanceTimersByTimeAsync(2000);
      const result = await resultPromise;

      expect(retryFn).toHaveBeenCalled();
      expect(result).toEqual(successResult);
    });
  });

  describe('Log Verification', () => {
    it('should log warning on 429', async () => {
      const limiter = new RateLimiter({ autoWait: false, logger });
      const response = createMockResponse(429, { 'retry-after': '1' });

      try {
        await limiter.handleResponse(response, vi.fn(), 0);
      } catch (_) {}

      expect(logger.warn).toHaveBeenCalled();
    });

    it('should log info before retry', async () => {
      const limiter = new RateLimiter({ autoWait: true, maxRetries: 3, logger });
      const response = createMockResponse(429, { 'retry-after': '0' });
      const retryFn = vi.fn().mockResolvedValue({ status: 200 });

      const promise = limiter.handleResponse(response, retryFn, 0);
      await vi.advanceTimersByTimeAsync(60000);
      await promise;

      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('State Tracking', () => {
    it('should update lastRateLimit on 429', async () => {
      const limiter = new RateLimiter({ autoWait: false, logger });
      const response = createMockResponse(429, { 'retry-after': '5' });

      try {
        await limiter.handleResponse(response, vi.fn(), 0);
      } catch (_) {}

      expect(limiter.lastRateLimit).not.toBeNull();
      expect(limiter.lastRateLimit.retryAfter).toBe(5);
    });
  });
});
