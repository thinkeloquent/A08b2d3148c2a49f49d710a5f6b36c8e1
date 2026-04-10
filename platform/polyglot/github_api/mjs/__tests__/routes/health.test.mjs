/**
 * Tests for health check routes using Fastify inject().
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import healthRoutes from '../../src/routes/health.mjs';

describe('Health Routes', () => {
  let server;
  let mockClient;

  beforeEach(async () => {
    mockClient = {
      lastRateLimit: {
        limit: 5000,
        remaining: 4990,
        reset: 1700000000,
        used: 10,
        resource: 'core',
      },
      getRateLimit: vi.fn().mockResolvedValue({
        resources: {
          core: { limit: 5000, remaining: 4990, used: 10, reset: 1700000000 },
          search: { limit: 30, remaining: 30, used: 0, reset: 1700000000 },
        },
        rate: { limit: 5000, remaining: 4990, used: 10, reset: 1700000000 },
      }),
    };

    server = Fastify({ logger: false });
    await server.register(healthRoutes, { client: mockClient });
    await server.ready();
  });

  afterEach(async () => {
    await server.close();
  });

  describe('GET /health', () => {
    it('should return status ok with timestamp and rate limit', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body.timestamp).toBeDefined();
      expect(body.rateLimit).toBeDefined();
      expect(body.rateLimit.limit).toBe(5000);
      expect(body.rateLimit.remaining).toBe(4990);
    });

    it('should return null rateLimit when no rate limit data exists', async () => {
      mockClient.lastRateLimit = null;

      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      const body = JSON.parse(response.body);
      expect(body.rateLimit).toBeNull();
    });

    it('should include an ISO timestamp', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      const body = JSON.parse(response.body);
      // Verify it is a valid ISO date
      const date = new Date(body.timestamp);
      expect(date.toISOString()).toBe(body.timestamp);
    });
  });

  describe('GET /health/rate-limit', () => {
    it('should return full rate limit info from GitHub API', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health/rate-limit',
      });

      expect(response.statusCode).toBe(200);
      expect(mockClient.getRateLimit).toHaveBeenCalledOnce();

      const body = JSON.parse(response.body);
      expect(body.resources).toBeDefined();
      expect(body.resources.core).toBeDefined();
      expect(body.resources.search).toBeDefined();
    });

    it('should propagate errors from the GitHub client', async () => {
      mockClient.getRateLimit.mockRejectedValue(new Error('Network failure'));

      const response = await server.inject({
        method: 'GET',
        url: '/health/rate-limit',
      });

      expect(response.statusCode).toBe(500);
    });
  });
});
