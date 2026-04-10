/**
 * Integration tests for health check routes.
 *
 * Tests cover:
 * - Statement coverage: /health and /health/rate-limit return correct data
 * - Boundary values: timestamp format, rate limit failure degradation
 * - Branch coverage: lastRateLimit present vs null
 *
 * Health routes are registered at the root level (not under /api/github).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestServer, createMockGitHubClient } from './helpers.mjs';

describe('Health Routes Integration', () => {
  let server;
  let client;

  beforeEach(async () => {
    const result = await createTestServer();
    server = result.server;
    client = result.client;
  });

  afterEach(async () => {
    if (server) {
      await server.close();
      server = null;
    }
  });

  // =========================================================================
  // Statement Coverage
  // =========================================================================

  describe('Statement Coverage', () => {
    it('GET /health should return 200 with status and timestamp', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.status).toBe('ok');
      expect(body.timestamp).toBeDefined();
    });

    it('GET /health/rate-limit should return 200 with rate limit data', async () => {
      const rateLimitData = {
        resources: {
          core: { limit: 5000, remaining: 4500, reset: 1738310400 },
          search: { limit: 30, remaining: 29, reset: 1738310400 },
        },
      };
      client.getRateLimit.mockResolvedValueOnce(rateLimitData);

      const response = await server.inject({
        method: 'GET',
        url: '/health/rate-limit',
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.resources).toBeDefined();
      expect(body.resources.core.limit).toBe(5000);
      expect(body.resources.core.remaining).toBe(4500);
    });
  });

  // =========================================================================
  // Boundary Values
  // =========================================================================

  describe('Boundary Values', () => {
    it('should return valid ISO 8601 timestamp', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });
      const body = response.json();

      // Verify the timestamp is a valid ISO string
      const parsed = new Date(body.timestamp);
      expect(parsed.toISOString()).toBe(body.timestamp);
      expect(Number.isNaN(parsed.getTime())).toBe(false);
    });

    it('should return rateLimit as null when no requests have been made', async () => {
      // client.lastRateLimit is null by default from the mock
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });
      const body = response.json();

      expect(body.rateLimit).toBeNull();
    });

    it('should return rateLimit data when lastRateLimit is set', async () => {
      // Simulate a previous request that populated lastRateLimit
      client.lastRateLimit = {
        limit: 5000,
        remaining: 4999,
        reset: 1738310400,
        used: 1,
      };

      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });
      const body = response.json();

      expect(body.rateLimit).toBeDefined();
      expect(body.rateLimit.limit).toBe(5000);
      expect(body.rateLimit.remaining).toBe(4999);
    });

    it('should degrade gracefully when getRateLimit fails', async () => {
      client.getRateLimit.mockRejectedValueOnce(
        new Error('Network timeout'),
      );

      const response = await server.inject({
        method: 'GET',
        url: '/health/rate-limit',
      });

      // The error handler catches the unrecognized Error and returns 500
      expect(response.statusCode).toBe(500);
      const body = response.json();
      expect(body.error).toBe('Internal Server Error');
    });
  });

  // =========================================================================
  // Branch Coverage
  // =========================================================================

  describe('Branch Coverage', () => {
    it('should handle rate limit endpoint returning minimal data', async () => {
      client.getRateLimit.mockResolvedValueOnce({ resources: {} });

      const response = await server.inject({
        method: 'GET',
        url: '/health/rate-limit',
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.resources).toEqual({});
    });

    it('should return consistent health status across multiple requests', async () => {
      const response1 = await server.inject({ method: 'GET', url: '/health' });
      const response2 = await server.inject({ method: 'GET', url: '/health' });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);
      expect(response1.json().status).toBe('ok');
      expect(response2.json().status).toBe('ok');

      // Timestamps should be different (or at least both valid)
      const t1 = new Date(response1.json().timestamp);
      const t2 = new Date(response2.json().timestamp);
      expect(Number.isNaN(t1.getTime())).toBe(false);
      expect(Number.isNaN(t2.getTime())).toBe(false);
    });
  });
});
