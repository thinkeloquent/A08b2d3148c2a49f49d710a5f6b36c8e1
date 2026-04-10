/**
 * Integration tests for the error handler middleware.
 *
 * Tests cover:
 * - Statement coverage: each SDK error type maps to the correct HTTP status
 * - Branch coverage: rate limit headers, generic GitHubError with custom status,
 *   unknown errors with sanitized message
 * - Boundary values: error with/without optional fields
 *
 * Each test registers a dedicated route that throws a specific error,
 * then verifies the HTTP response via inject().
 */
import { describe, it, expect, afterEach } from 'vitest';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { createErrorHandler } from '../../src/middleware/error-handler.mjs';
import {
  GitHubError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
  ServerError,
} from '../../src/sdk/errors.mjs';

/**
 * Create a minimal test server with a single route that throws the given error.
 */
async function createErrorServer(path, errorFactory) {
  const server = Fastify({ logger: false });
  await server.register(cors);
  await server.register(sensible);
  server.setErrorHandler(createErrorHandler());

  server.get(path, async () => {
    throw errorFactory();
  });

  await server.ready();
  return server;
}

describe('Error Handler Integration', () => {
  let server;

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
    it('should map ValidationError to 400', async () => {
      server = await createErrorServer('/test-validation', () =>
        new ValidationError('Name is required', 'req-123', 'https://docs.github.com'),
      );

      const response = await server.inject({ method: 'GET', url: '/test-validation' });
      const body = response.json();

      expect(response.statusCode).toBe(400);
      expect(body.error).toBe('Validation Error');
      expect(body.message).toBe('Name is required');
      expect(body.statusCode).toBe(400);
      expect(body.requestId).toBe('req-123');
      expect(body.documentationUrl).toBe('https://docs.github.com');
    });

    it('should map AuthError to 401', async () => {
      server = await createErrorServer('/test-auth', () =>
        new AuthError('Bad credentials', 'req-456'),
      );

      const response = await server.inject({ method: 'GET', url: '/test-auth' });
      const body = response.json();

      expect(response.statusCode).toBe(401);
      expect(body.error).toBe('Unauthorized');
      expect(body.message).toBe('Bad credentials');
      expect(body.statusCode).toBe(401);
      expect(body.requestId).toBe('req-456');
    });

    it('should map ForbiddenError to 403', async () => {
      server = await createErrorServer('/test-forbidden', () =>
        new ForbiddenError('Resource not accessible by integration'),
      );

      const response = await server.inject({ method: 'GET', url: '/test-forbidden' });
      const body = response.json();

      expect(response.statusCode).toBe(403);
      expect(body.error).toBe('Forbidden');
      expect(body.message).toBe('Resource not accessible by integration');
      expect(body.statusCode).toBe(403);
    });

    it('should map NotFoundError to 404', async () => {
      server = await createErrorServer('/test-notfound', () =>
        new NotFoundError('Not Found', 'req-789'),
      );

      const response = await server.inject({ method: 'GET', url: '/test-notfound' });
      const body = response.json();

      expect(response.statusCode).toBe(404);
      expect(body.error).toBe('Not Found');
      expect(body.message).toBe('Not Found');
      expect(body.statusCode).toBe(404);
    });

    it('should map ConflictError to 409', async () => {
      server = await createErrorServer('/test-conflict', () =>
        new ConflictError('Repository already exists'),
      );

      const response = await server.inject({ method: 'GET', url: '/test-conflict' });
      const body = response.json();

      expect(response.statusCode).toBe(409);
      expect(body.error).toBe('Conflict');
      expect(body.message).toBe('Repository already exists');
      expect(body.statusCode).toBe(409);
    });

    it('should map RateLimitError to 429 with Retry-After header', async () => {
      const resetAt = new Date('2026-01-31T12:00:00Z');
      server = await createErrorServer('/test-ratelimit', () =>
        new RateLimitError('API rate limit exceeded', resetAt, 60, 'req-rl'),
      );

      const response = await server.inject({ method: 'GET', url: '/test-ratelimit' });
      const body = response.json();

      expect(response.statusCode).toBe(429);
      expect(body.error).toBe('Rate Limit Exceeded');
      expect(body.message).toBe('API rate limit exceeded');
      expect(body.statusCode).toBe(429);
      expect(body.retryAfter).toBe(60);
      expect(body.resetAt).toBe(resetAt.toISOString());
      expect(body.requestId).toBe('req-rl');
      expect(response.headers['retry-after']).toBe('60');
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should map ServerError to 502', async () => {
      server = await createErrorServer('/test-server-error', () =>
        new ServerError('Internal error occurred', 500, 'req-se'),
      );

      const response = await server.inject({ method: 'GET', url: '/test-server-error' });
      const body = response.json();

      expect(response.statusCode).toBe(502);
      expect(body.error).toBe('Bad Gateway');
      expect(body.message).toBe('Internal error occurred');
      expect(body.statusCode).toBe(502);
    });

    it('should map generic GitHubError using error.status', async () => {
      server = await createErrorServer('/test-github-generic', () =>
        new GitHubError('Gone', 410, 'req-gone'),
      );

      const response = await server.inject({ method: 'GET', url: '/test-github-generic' });
      const body = response.json();

      expect(response.statusCode).toBe(410);
      expect(body.error).toBe('GitHub API Error');
      expect(body.message).toBe('Gone');
      expect(body.statusCode).toBe(410);
    });

    it('should map unknown Error to 500 with generic message', async () => {
      server = await createErrorServer('/test-unknown', () =>
        new Error('Something secret and internal'),
      );

      const response = await server.inject({ method: 'GET', url: '/test-unknown' });
      const body = response.json();

      expect(response.statusCode).toBe(500);
      expect(body.error).toBe('Internal Server Error');
      expect(body.message).toBe('An unexpected error occurred');
      expect(body.statusCode).toBe(500);
      // Must NOT leak the internal error message
      expect(body.message).not.toContain('secret');
    });
  });

  // =========================================================================
  // Branch Coverage
  // =========================================================================

  describe('Branch Coverage', () => {
    it('should handle RateLimitError without retryAfter or resetAt', async () => {
      server = await createErrorServer('/test-ratelimit-minimal', () =>
        new RateLimitError('Rate limited'),
      );

      const response = await server.inject({
        method: 'GET',
        url: '/test-ratelimit-minimal',
      });
      const body = response.json();

      expect(response.statusCode).toBe(429);
      expect(body.retryAfter).toBeUndefined();
      expect(body.resetAt).toBeUndefined();
      // No Retry-After header when retryAfter is not set
      expect(response.headers['retry-after']).toBeUndefined();
    });

    it('should handle GitHubError without status (defaults to 500)', async () => {
      server = await createErrorServer('/test-github-no-status', () =>
        new GitHubError('Unknown GitHub error'),
      );

      const response = await server.inject({
        method: 'GET',
        url: '/test-github-no-status',
      });
      const body = response.json();

      expect(response.statusCode).toBe(500);
      expect(body.error).toBe('GitHub API Error');
      expect(body.statusCode).toBe(500);
    });

    it('should handle Fastify validation errors (schema validation)', async () => {
      // Create a server with a route that has schema validation
      const srv = Fastify({ logger: false });
      await srv.register(cors);
      await srv.register(sensible);
      srv.setErrorHandler(createErrorHandler());

      srv.post(
        '/test-schema-validation',
        {
          schema: {
            body: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
        async (request) => {
          return { ok: true };
        },
      );

      await srv.ready();
      server = srv;

      const response = await server.inject({
        method: 'POST',
        url: '/test-schema-validation',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({}),
      });
      const body = response.json();

      expect(response.statusCode).toBe(400);
      expect(body.error).toBe('Validation Error');
      expect(body.statusCode).toBe(400);
    });
  });

  // =========================================================================
  // Boundary Values
  // =========================================================================

  describe('Boundary Values', () => {
    it('should handle error with all optional fields undefined', async () => {
      server = await createErrorServer('/test-minimal-auth', () =>
        new AuthError('Bad credentials'),
      );

      const response = await server.inject({
        method: 'GET',
        url: '/test-minimal-auth',
      });
      const body = response.json();

      expect(response.statusCode).toBe(401);
      expect(body.requestId).toBeUndefined();
      expect(body.documentationUrl).toBeUndefined();
    });

    it('should preserve documentationUrl when provided', async () => {
      server = await createErrorServer('/test-docs-url', () =>
        new NotFoundError(
          'Not Found',
          'req-doc',
          'https://docs.github.com/rest/repos/repos#get',
        ),
      );

      const response = await server.inject({
        method: 'GET',
        url: '/test-docs-url',
      });
      const body = response.json();

      expect(response.statusCode).toBe(404);
      expect(body.documentationUrl).toBe(
        'https://docs.github.com/rest/repos/repos#get',
      );
    });
  });
});
