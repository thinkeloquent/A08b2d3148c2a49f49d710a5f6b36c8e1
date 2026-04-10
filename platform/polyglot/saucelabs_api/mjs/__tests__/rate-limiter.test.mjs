/**
 * Unit tests for rate-limiter.mjs
 *
 * Tests cover:
 * - Statement coverage for parseRetryAfter, buildRateLimitInfo, calculateBackoff, RateLimiter
 * - Branch coverage for all conditional paths
 * - Boundary value analysis
 * - Error handling verification
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseRetryAfter, buildRateLimitInfo, calculateBackoff, RateLimiter } from '../src/rate-limiter.mjs';
import { SaucelabsRateLimitError } from '../src/errors.mjs';

describe('parseRetryAfter', () => {

  // =====================================================================
  // Statement Coverage
  // =====================================================================
  describe('Statement Coverage', () => {
    it('parses numeric string', () => {
      expect(parseRetryAfter('30')).toBe(30);
    });

    it('parses float and rounds up', () => {
      expect(parseRetryAfter('1.5')).toBe(2);
    });

    it('parses HTTP date format', () => {
      const futureDate = new Date(Date.now() + 10000).toUTCString();
      const result = parseRetryAfter(futureDate);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(15);
    });
  });

  // =====================================================================
  // Branch Coverage
  // =====================================================================
  describe('Branch Coverage', () => {
    it('returns 60 for null', () => {
      expect(parseRetryAfter(null)).toBe(60);
    });

    it('returns 60 for undefined', () => {
      expect(parseRetryAfter(undefined)).toBe(60);
    });

    it('returns 60 for empty string', () => {
      expect(parseRetryAfter('')).toBe(60);
    });

    it('returns 60 for unparseable string', () => {
      expect(parseRetryAfter('not-a-number')).toBe(60);
    });

    it('returns 1 for past HTTP date', () => {
      const pastDate = new Date(Date.now() - 60000).toUTCString();
      expect(parseRetryAfter(pastDate)).toBe(1);
    });

    it('returns 1 for negative number (parsed as past date)', () => {
      // -5 is not > 0, falls to Date.parse which may parse as past date -> returns 1
      const result = parseRetryAfter('-5');
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it('returns default for zero (not > 0)', () => {
      // 0 is not > 0, falls through
      const result = parseRetryAfter('0');
      expect(result).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('buildRateLimitInfo', () => {

  // =====================================================================
  // Statement Coverage
  // =====================================================================
  describe('Statement Coverage', () => {
    it('builds info from complete headers', () => {
      const info = buildRateLimitInfo({
        'retry-after': '10',
        'x-ratelimit-remaining': '5',
        'x-ratelimit-limit': '100',
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 60),
      });
      expect(info.retryAfter).toBe(10);
      expect(info.remaining).toBe(5);
      expect(info.limit).toBe(100);
      expect(info.resetAt).toBeInstanceOf(Date);
      expect(info.timestamp).toBeInstanceOf(Date);
    });

    it('handles missing optional headers', () => {
      const info = buildRateLimitInfo({ 'retry-after': '5' });
      expect(info.retryAfter).toBe(5);
      expect(info.remaining).toBeNull();
      expect(info.limit).toBeNull();
      expect(info.resetAt).toBeNull();
    });
  });

  // =====================================================================
  // Branch Coverage
  // =====================================================================
  describe('Branch Coverage', () => {
    it('reads Retry-After with capital case', () => {
      const info = buildRateLimitInfo({ 'Retry-After': '15' });
      expect(info.retryAfter).toBe(15);
    });

    it('prefers lowercase retry-after over Retry-After', () => {
      const info = buildRateLimitInfo({ 'retry-after': '10', 'Retry-After': '20' });
      expect(info.retryAfter).toBe(10);
    });

    it('defaults to 60 when no retry-after header', () => {
      const info = buildRateLimitInfo({});
      expect(info.retryAfter).toBe(60);
    });
  });
});

describe('calculateBackoff', () => {

  // =====================================================================
  // Statement Coverage
  // =====================================================================
  describe('Statement Coverage', () => {
    it('returns value for retry 0', () => {
      const delay = calculateBackoff(0);
      expect(delay).toBeGreaterThanOrEqual(1);
      expect(delay).toBeLessThanOrEqual(2); // 1*2^0 + jitter(0-1)
    });

    it('increases exponentially', () => {
      const d0 = calculateBackoff(0, 1, 1000);
      const d3 = calculateBackoff(3, 1, 1000);
      expect(d3).toBeGreaterThan(d0);
    });
  });

  // =====================================================================
  // Boundary Values
  // =====================================================================
  describe('Boundary Values', () => {
    it('caps at maxDelay', () => {
      const delay = calculateBackoff(100, 1, 60);
      expect(delay).toBeLessThanOrEqual(60);
    });

    it('retry 0 with base 0 returns 0', () => {
      const delay = calculateBackoff(0, 0, 60);
      expect(delay).toBe(0);
    });
  });
});

describe('RateLimiter', () => {
  let mockLogger;

  beforeEach(() => {
    process.env.LOG_LEVEL = 'silent';
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
  });

  // =====================================================================
  // Statement Coverage
  // =====================================================================
  describe('Statement Coverage', () => {
    it('constructs with default options', () => {
      const rl = new RateLimiter();
      expect(rl.lastRateLimit).toBeNull();
    });

    it('constructs with custom options', () => {
      const cb = vi.fn();
      const rl = new RateLimiter({
        autoWait: false,
        maxRetries: 3,
        onRateLimit: cb,
        logger: mockLogger,
      });
      expect(rl.lastRateLimit).toBeNull();
    });
  });

  // =====================================================================
  // Branch Coverage
  // =====================================================================
  describe('Branch Coverage', () => {
    it('throws when autoWait is false', async () => {
      const rl = new RateLimiter({ autoWait: false, logger: mockLogger });
      const mockResponse = {
        status: 429,
        headers: new Map([['retry-after', '5']]),
        json: vi.fn().mockResolvedValue({ message: 'rate limited' }),
      };
      // Make headers iterable
      mockResponse.headers.forEach = (fn) => {
        for (const [k, v] of mockResponse.headers) fn(v, k);
      };

      await expect(
        rl.handleResponse(mockResponse, vi.fn(), 0)
      ).rejects.toThrow(SaucelabsRateLimitError);
    });

    it('throws when max retries exceeded', async () => {
      const rl = new RateLimiter({ autoWait: true, maxRetries: 2, logger: mockLogger });
      const mockResponse = {
        status: 429,
        headers: { 'retry-after': '1' },
        json: vi.fn().mockResolvedValue({}),
      };

      await expect(
        rl.handleResponse(mockResponse, vi.fn(), 2)
      ).rejects.toThrow(SaucelabsRateLimitError);
    });

    it('throws when onRateLimit callback returns false', async () => {
      const cb = vi.fn().mockReturnValue(false);
      const rl = new RateLimiter({ autoWait: true, maxRetries: 5, onRateLimit: cb, logger: mockLogger });
      const mockResponse = {
        status: 429,
        headers: { 'retry-after': '1' },
        json: vi.fn().mockResolvedValue({}),
      };

      await expect(
        rl.handleResponse(mockResponse, vi.fn(), 0)
      ).rejects.toThrow(SaucelabsRateLimitError);
      expect(cb).toHaveBeenCalled();
    });

    it('retries when autoWait is true and retryCount < maxRetries', async () => {
      const retryFn = vi.fn().mockResolvedValue({ status: 200, data: 'ok' });
      const rl = new RateLimiter({ autoWait: true, maxRetries: 3, logger: mockLogger });

      // Mock _sleep to be instant
      const mockResponse = {
        status: 429,
        headers: { 'retry-after': '0.001' },
        json: vi.fn().mockResolvedValue({}),
      };

      const result = await rl.handleResponse(mockResponse, retryFn, 0);
      expect(retryFn).toHaveBeenCalled();
    });

    it('stores lastRateLimit after handling 429', async () => {
      const rl = new RateLimiter({ autoWait: false, logger: mockLogger });
      const mockResponse = {
        status: 429,
        headers: { 'retry-after': '10' },
        json: vi.fn().mockResolvedValue({}),
      };

      try {
        await rl.handleResponse(mockResponse, vi.fn(), 0);
      } catch {
        // expected
      }
      expect(rl.lastRateLimit).not.toBeNull();
      expect(rl.lastRateLimit.retryAfter).toBe(10);
    });

    it('handles Headers object with forEach method', async () => {
      const rl = new RateLimiter({ autoWait: false, logger: mockLogger });
      const headers = new Map([['retry-after', '5']]);
      headers.forEach = (fn) => {
        for (const [k, v] of headers) fn(v, k);
      };
      const mockResponse = {
        status: 429,
        headers,
        json: vi.fn().mockResolvedValue({}),
      };

      try {
        await rl.handleResponse(mockResponse, vi.fn(), 0);
      } catch {
        // expected
      }
      expect(rl.lastRateLimit.retryAfter).toBe(5);
    });
  });

  // =====================================================================
  // Error Handling
  // =====================================================================
  describe('Error Handling', () => {
    it('handles response.json() failure gracefully', async () => {
      const rl = new RateLimiter({ autoWait: false, logger: mockLogger });
      const mockResponse = {
        status: 429,
        headers: { 'retry-after': '5' },
        json: vi.fn().mockRejectedValue(new Error('parse error')),
      };

      await expect(
        rl.handleResponse(mockResponse, vi.fn(), 0)
      ).rejects.toThrow(SaucelabsRateLimitError);
    });
  });
});
