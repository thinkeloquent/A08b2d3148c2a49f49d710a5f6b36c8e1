/**
 * Tests for rate-limit utility functions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseRateLimitHeaders,
  shouldWaitForRateLimit,
  waitForRateLimit,
  isSecondaryRateLimit,
} from '../../src/sdk/rate-limit.mjs';
import { createLoggerSpy, expectLogContains, createRateLimitHeaders } from '../helpers/index.mjs';

describe('rate-limit', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Statement Coverage
  // ---------------------------------------------------------------------------
  describe('Statement Coverage', () => {
    describe('parseRateLimitHeaders', () => {
      it('should parse all 5 rate limit headers from a plain object', () => {
        const headers = createRateLimitHeaders({
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-reset': '1700000000',
          'x-ratelimit-used': '1',
          'x-ratelimit-resource': 'core',
        });

        const info = parseRateLimitHeaders(headers);
        expect(info).toEqual({
          limit: 5000,
          remaining: 4999,
          reset: 1700000000,
          used: 1,
          resource: 'core',
        });
      });

      it('should parse headers from a Headers object with .get() method', () => {
        const headers = new Headers({
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '4500',
          'x-ratelimit-reset': '1700000000',
          'x-ratelimit-used': '500',
          'x-ratelimit-resource': 'search',
        });

        const info = parseRateLimitHeaders(headers);
        expect(info).toEqual({
          limit: 5000,
          remaining: 4500,
          reset: 1700000000,
          used: 500,
          resource: 'search',
        });
      });
    });

    describe('shouldWaitForRateLimit', () => {
      it('should return true when remaining is at threshold', () => {
        const info = { limit: 5000, remaining: 0, reset: 0, used: 5000, resource: 'core' };
        expect(shouldWaitForRateLimit(info)).toBe(true);
      });

      it('should return false when remaining is above threshold', () => {
        const info = { limit: 5000, remaining: 100, reset: 0, used: 4900, resource: 'core' };
        expect(shouldWaitForRateLimit(info)).toBe(false);
      });
    });

    describe('waitForRateLimit', () => {
      it('should sleep for the correct duration', async () => {
        vi.useFakeTimers();
        const now = Math.floor(Date.now() / 1000);
        const info = { limit: 5000, remaining: 0, reset: now + 10, used: 5000, resource: 'core' };

        const promise = waitForRateLimit(info);
        // The function should wait max(reset - now + 1, 1) seconds = 11s
        vi.advanceTimersByTime(11 * 1000);
        await promise;

        vi.useRealTimers();
      });
    });

    describe('isSecondaryRateLimit', () => {
      it('should detect "secondary rate limit" in 403 response', () => {
        expect(
          isSecondaryRateLimit(403, { message: 'You have triggered a secondary rate limit' }),
        ).toBe(true);
      });

      it('should detect "abuse detection" in 429 response', () => {
        expect(
          isSecondaryRateLimit(429, { message: 'You have triggered an abuse detection mechanism' }),
        ).toBe(true);
      });

      it('should detect "you have exceeded a secondary rate limit"', () => {
        expect(
          isSecondaryRateLimit(403, { message: 'You have exceeded a secondary rate limit' }),
        ).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Branch Coverage
  // ---------------------------------------------------------------------------
  describe('Branch Coverage', () => {
    describe('parseRateLimitHeaders', () => {
      it('should use .get() method when headers has it (Headers object)', () => {
        const headers = new Headers({
          'x-ratelimit-limit': '1000',
          'x-ratelimit-remaining': '999',
        });
        const info = parseRateLimitHeaders(headers);
        expect(info).not.toBeNull();
        expect(info.limit).toBe(1000);
        expect(info.remaining).toBe(999);
      });

      it('should use bracket access for plain objects', () => {
        const headers = { 'x-ratelimit-limit': '2000', 'x-ratelimit-remaining': '1800' };
        const info = parseRateLimitHeaders(headers);
        expect(info).not.toBeNull();
        expect(info.limit).toBe(2000);
      });

      it('should return null when both limit and remaining are missing', () => {
        const info = parseRateLimitHeaders({});
        expect(info).toBeNull();
      });

      it('should return null when both limit and remaining are missing from Headers', () => {
        const headers = new Headers({});
        const info = parseRateLimitHeaders(headers);
        expect(info).toBeNull();
      });

      it('should still work when only limit is present (remaining is missing)', () => {
        const headers = { 'x-ratelimit-limit': '5000' };
        const info = parseRateLimitHeaders(headers);
        expect(info).not.toBeNull();
        expect(info.limit).toBe(5000);
        expect(info.remaining).toBe(0); // defaults to 0
      });

      it('should still work when only remaining is present (limit is missing)', () => {
        const headers = { 'x-ratelimit-remaining': '100' };
        const info = parseRateLimitHeaders(headers);
        expect(info).not.toBeNull();
        expect(info.limit).toBe(0); // defaults to 0
        expect(info.remaining).toBe(100);
      });

      it('should default resource to "core" when not present', () => {
        const headers = { 'x-ratelimit-limit': '5000', 'x-ratelimit-remaining': '4999' };
        const info = parseRateLimitHeaders(headers);
        expect(info.resource).toBe('core');
      });
    });

    describe('shouldWaitForRateLimit', () => {
      it('should return false when autoWait is false', () => {
        const info = { limit: 5000, remaining: 0, reset: 0, used: 5000, resource: 'core' };
        expect(shouldWaitForRateLimit(info, { autoWait: false })).toBe(false);
      });

      it('should return false when info is null', () => {
        expect(shouldWaitForRateLimit(null)).toBe(false);
      });

      it('should return false when info is undefined', () => {
        expect(shouldWaitForRateLimit(undefined)).toBe(false);
      });

      it('should return false when remaining is above threshold', () => {
        const info = { limit: 5000, remaining: 100, reset: 0, used: 4900, resource: 'core' };
        expect(shouldWaitForRateLimit(info, { threshold: 10 })).toBe(false);
      });

      it('should return true when remaining is at threshold', () => {
        const info = { limit: 5000, remaining: 10, reset: 0, used: 4990, resource: 'core' };
        expect(shouldWaitForRateLimit(info, { threshold: 10 })).toBe(true);
      });

      it('should return true when remaining is below threshold', () => {
        const info = { limit: 5000, remaining: 5, reset: 0, used: 4995, resource: 'core' };
        expect(shouldWaitForRateLimit(info, { threshold: 10 })).toBe(true);
      });

      it('should default autoWait to true and threshold to 0', () => {
        const infoZero = { limit: 5000, remaining: 0, reset: 0, used: 5000, resource: 'core' };
        expect(shouldWaitForRateLimit(infoZero)).toBe(true);

        const infoOne = { limit: 5000, remaining: 1, reset: 0, used: 4999, resource: 'core' };
        expect(shouldWaitForRateLimit(infoOne)).toBe(false);
      });
    });

    describe('waitForRateLimit', () => {
      it('should return immediately when info is null', async () => {
        await waitForRateLimit(null);
        // Should not throw or hang
      });

      it('should return immediately when info is undefined', async () => {
        await waitForRateLimit(undefined);
      });

      it('should return immediately when info.reset is 0 (falsy)', async () => {
        const info = { limit: 5000, remaining: 0, reset: 0, used: 5000, resource: 'core' };
        await waitForRateLimit(info);
        // Should return immediately
      });

      it('should log warning with wait time when logger is provided', async () => {
        vi.useFakeTimers();
        const { logs, mockLogger } = createLoggerSpy();
        const now = Math.floor(Date.now() / 1000);
        const info = { limit: 5000, remaining: 0, reset: now + 5, used: 5000, resource: 'core' };

        const promise = waitForRateLimit(info, mockLogger);
        vi.advanceTimersByTime(7 * 1000);
        await promise;

        expect(mockLogger.warn).toHaveBeenCalled();
        expectLogContains(logs, 'warn', 'Rate limit reached');
        expectLogContains(logs, 'warn', 'Waiting');

        vi.useRealTimers();
      });

      it('should not throw when logger is not provided', async () => {
        vi.useFakeTimers();
        const now = Math.floor(Date.now() / 1000);
        const info = { limit: 5000, remaining: 0, reset: now + 2, used: 5000, resource: 'core' };

        const promise = waitForRateLimit(info);
        vi.advanceTimersByTime(4 * 1000);
        await promise;

        vi.useRealTimers();
      });
    });

    describe('isSecondaryRateLimit', () => {
      it('should return false for status 200', () => {
        expect(isSecondaryRateLimit(200, { message: 'secondary rate limit' })).toBe(false);
      });

      it('should return true for 403 with "secondary rate limit" message', () => {
        expect(
          isSecondaryRateLimit(403, { message: 'You hit a secondary rate limit' }),
        ).toBe(true);
      });

      it('should return true for 429 with "abuse detection" message', () => {
        expect(
          isSecondaryRateLimit(429, { message: 'abuse detection triggered' }),
        ).toBe(true);
      });

      it('should return false for 403 with unrelated message', () => {
        expect(
          isSecondaryRateLimit(403, { message: 'Resource not accessible by integration' }),
        ).toBe(false);
      });

      it('should return false for 429 with unrelated message', () => {
        expect(
          isSecondaryRateLimit(429, { message: 'Too many requests' }),
        ).toBe(false);
      });

      it('should return false for non-403/429 status even with matching message', () => {
        expect(
          isSecondaryRateLimit(500, { message: 'secondary rate limit' }),
        ).toBe(false);
        expect(
          isSecondaryRateLimit(401, { message: 'abuse detection' }),
        ).toBe(false);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Boundary Values
  // ---------------------------------------------------------------------------
  describe('Boundary Values', () => {
    describe('parseRateLimitHeaders', () => {
      it('should handle non-numeric header values gracefully', () => {
        const headers = {
          'x-ratelimit-limit': 'abc',
          'x-ratelimit-remaining': 'xyz',
          'x-ratelimit-reset': 'not-a-number',
          'x-ratelimit-used': 'NaN',
        };
        const info = parseRateLimitHeaders(headers);
        expect(info).not.toBeNull();
        expect(info.limit).toBeNaN();
        expect(info.remaining).toBeNaN();
        expect(info.reset).toBeNaN();
        expect(info.used).toBeNaN();
      });

      it('should handle negative numbers in headers', () => {
        const headers = {
          'x-ratelimit-limit': '-1',
          'x-ratelimit-remaining': '-100',
        };
        const info = parseRateLimitHeaders(headers);
        expect(info).not.toBeNull();
        expect(info.limit).toBe(-1);
        expect(info.remaining).toBe(-100);
      });

      it('should handle null headers', () => {
        const info = parseRateLimitHeaders(null);
        expect(info).toBeNull();
      });

      it('should handle undefined headers', () => {
        const info = parseRateLimitHeaders(undefined);
        expect(info).toBeNull();
      });

      it('should handle empty string values (falsy but present)', () => {
        const headers = {
          'x-ratelimit-limit': '',
          'x-ratelimit-remaining': '',
        };
        // Empty strings are falsy, so both limit == null check passes since '' == null is false
        // but '' is falsy so parseInt would get 0
        const info = parseRateLimitHeaders(headers);
        // '' != null (not loose equal to null), so info should not be null
        // But '' is falsy in the ternary: limit ? parseInt... : 0 -> 0
        expect(info).not.toBeNull();
        expect(info.limit).toBe(0);
        expect(info.remaining).toBe(0);
      });
    });

    describe('waitForRateLimit', () => {
      it('should use minimum 1 second wait when reset is in the past', async () => {
        vi.useFakeTimers();
        const pastTimestamp = Math.floor(Date.now() / 1000) - 100;
        const info = { limit: 5000, remaining: 0, reset: pastTimestamp, used: 5000, resource: 'core' };

        const promise = waitForRateLimit(info);
        // Math.max(pastTimestamp - now + 1, 1) = Math.max(negative, 1) = 1
        vi.advanceTimersByTime(1000);
        await promise;

        vi.useRealTimers();
      });

      it('should use minimum 1 second wait when reset equals current time', async () => {
        vi.useFakeTimers();
        const now = Math.floor(Date.now() / 1000);
        const info = { limit: 5000, remaining: 0, reset: now, used: 5000, resource: 'core' };

        const promise = waitForRateLimit(info);
        // Math.max(now - now + 1, 1) = Math.max(1, 1) = 1
        vi.advanceTimersByTime(1000);
        await promise;

        vi.useRealTimers();
      });
    });

    describe('isSecondaryRateLimit', () => {
      it('should handle null body', () => {
        expect(isSecondaryRateLimit(403, null)).toBe(false);
      });

      it('should handle undefined body', () => {
        expect(isSecondaryRateLimit(429, undefined)).toBe(false);
      });

      it('should handle body without message property', () => {
        expect(isSecondaryRateLimit(403, {})).toBe(false);
      });

      it('should handle body with null message', () => {
        expect(isSecondaryRateLimit(403, { message: null })).toBe(false);
      });

      it('should be case-insensitive for message matching', () => {
        expect(
          isSecondaryRateLimit(403, { message: 'SECONDARY RATE LIMIT exceeded' }),
        ).toBe(true);
        expect(
          isSecondaryRateLimit(429, { message: 'ABUSE DETECTION mechanism' }),
        ).toBe(true);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Error Handling
  // ---------------------------------------------------------------------------
  describe('Error Handling', () => {
    it('should not throw when parseRateLimitHeaders receives unexpected input', () => {
      expect(() => parseRateLimitHeaders(null)).not.toThrow();
      expect(() => parseRateLimitHeaders(undefined)).not.toThrow();
      expect(() => parseRateLimitHeaders({})).not.toThrow();
    });

    it('should not throw when shouldWaitForRateLimit receives null info', () => {
      expect(() => shouldWaitForRateLimit(null)).not.toThrow();
    });

    it('should not throw when waitForRateLimit receives null info', async () => {
      await expect(waitForRateLimit(null)).resolves.toBeUndefined();
    });

    it('should not throw when isSecondaryRateLimit receives null body', () => {
      expect(() => isSecondaryRateLimit(403, null)).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // Log Verification
  // ---------------------------------------------------------------------------
  describe('Log Verification', () => {
    it('should log warning with wait time and reset time', async () => {
      vi.useFakeTimers();
      const { logs, mockLogger } = createLoggerSpy();
      const now = Math.floor(Date.now() / 1000);
      const resetTime = now + 30;
      const info = { limit: 5000, remaining: 0, reset: resetTime, used: 5000, resource: 'core' };

      const promise = waitForRateLimit(info, mockLogger);
      vi.advanceTimersByTime(32 * 1000);
      await promise;

      expect(mockLogger.warn).toHaveBeenCalledTimes(1);

      // Verify the warning message content
      const warnCall = mockLogger.warn.mock.calls[0];
      expect(warnCall[0]).toContain('Rate limit reached');
      expect(warnCall[0]).toContain('Waiting');
      expect(warnCall[0]).toMatch(/\d+s/);

      // Verify the data object contains reset ISO string and remaining
      const warnData = warnCall[1];
      expect(warnData).toHaveProperty('reset');
      expect(warnData).toHaveProperty('remaining', 0);
      expect(warnData.reset).toMatch(/^\d{4}-\d{2}-\d{2}T/);

      vi.useRealTimers();
    });

    it('should not log anything when logger is null', async () => {
      vi.useFakeTimers();
      const now = Math.floor(Date.now() / 1000);
      const info = { limit: 5000, remaining: 0, reset: now + 5, used: 5000, resource: 'core' };

      // Should not throw
      const promise = waitForRateLimit(info, null);
      vi.advanceTimersByTime(7 * 1000);
      await promise;

      vi.useRealTimers();
    });

    it('should not log anything when logger is undefined', async () => {
      vi.useFakeTimers();
      const now = Math.floor(Date.now() / 1000);
      const info = { limit: 5000, remaining: 0, reset: now + 5, used: 5000, resource: 'core' };

      const promise = waitForRateLimit(info, undefined);
      vi.advanceTimersByTime(7 * 1000);
      await promise;

      vi.useRealTimers();
    });
  });
});
