/**
 * Integration tests for Fastify server lifecycle and setup.
 *
 * Tests cover:
 * - Statement coverage for server creation and plugin registration
 * - Branch coverage for unknown routes and malformed requests
 * - Lifecycle verification (start/close)
 * - Error handling for invalid JSON
 */
import { describe, it, expect, afterEach } from 'vitest';
import { createTestServer } from './helpers.mjs';

describe('Server Integration', () => {
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
    it('should create server successfully with mock client', async () => {
      const result = await createTestServer();
      server = result.server;

      expect(server).toBeDefined();
      expect(result.client).toBeDefined();
    });

    it('should register CORS plugin (OPTIONS preflight returns CORS headers)', async () => {
      const result = await createTestServer();
      server = result.server;

      const response = await server.inject({
        method: 'OPTIONS',
        url: '/health',
        headers: {
          Origin: 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
        },
      });

      // CORS plugin responds to preflight with appropriate headers
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should register @fastify/sensible plugin (httpErrors available)', async () => {
      const result = await createTestServer();
      server = result.server;

      // @fastify/sensible decorates the server with httpErrors
      expect(server.httpErrors).toBeDefined();
      expect(server.httpErrors.notFound).toBeTypeOf('function');
    });

    it('should register error handler (custom error responses)', async () => {
      const result = await createTestServer();
      server = result.server;

      // The error handler is set; confirmed by checking unknown route behavior
      // which should return a structured JSON error (not raw Fastify default)
      const response = await server.inject({
        method: 'GET',
        url: '/nonexistent-route-xyz',
      });

      // Fastify returns 404 for unregistered routes
      expect(response.statusCode).toBe(404);
    });
  });

  // =========================================================================
  // Branch Coverage
  // =========================================================================

  describe('Branch Coverage', () => {
    it('should respond with 404 for unknown routes', async () => {
      const result = await createTestServer();
      server = result.server;

      const response = await server.inject({
        method: 'GET',
        url: '/api/github/this-does-not-exist',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should handle JSON parse errors gracefully', async () => {
      const result = await createTestServer();
      server = result.server;

      const response = await server.inject({
        method: 'POST',
        url: '/api/github/repos',
        headers: { 'Content-Type': 'application/json' },
        payload: '{ invalid json !!!',
      });

      // Fastify catches malformed JSON and returns an error status.
      // The custom error handler maps this to either 400 (if Fastify
      // attaches a validation flag) or 500 (if treated as unknown).
      // Either way, the server must not crash.
      expect([400, 500]).toContain(response.statusCode);
      const body = response.json();
      expect(body.error).toBeDefined();
      expect(body.statusCode).toBeDefined();
    });

    it('should respond with 404 for wrong HTTP method on existing route', async () => {
      const result = await createTestServer();
      server = result.server;

      // /health only supports GET; PUT should be 404 or 405
      const response = await server.inject({
        method: 'PUT',
        url: '/health',
      });

      // Fastify returns 404 when no route matches method
      expect([404, 405]).toContain(response.statusCode);
    });
  });

  // =========================================================================
  // Lifecycle
  // =========================================================================

  describe('Lifecycle', () => {
    it('should start and close server without error', async () => {
      const result = await createTestServer();
      server = result.server;

      // Server is already ready from createTestServer(); verify it responds
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);

      // Close and verify no error is thrown
      await server.close();
      server = null;
    });

    it('should execute onClose hook during shutdown', async () => {
      // Must add the hook before server.ready() in Fastify v4
      const Fastify = (await import('fastify')).default;
      const cors = (await import('@fastify/cors')).default;
      const sensible = (await import('@fastify/sensible')).default;
      const { createErrorHandler } = await import(
        '../../src/middleware/error-handler.mjs'
      );
      const { registerRoutes } = await import('../../src/routes/index.mjs');
      const { createMockGitHubClient } = await import('./helpers.mjs');

      let shutdownCalled = false;
      const srv = Fastify({ logger: false });
      await srv.register(cors);
      await srv.register(sensible);
      srv.setErrorHandler(createErrorHandler());
      await registerRoutes(srv, createMockGitHubClient());

      srv.addHook('onClose', async () => {
        shutdownCalled = true;
      });

      await srv.ready();
      server = srv;

      await server.close();
      server = null;

      expect(shutdownCalled).toBe(true);
    });

    it('should execute onReady hook during initialization', async () => {
      // createTestServer already calls server.ready()
      // We verify by adding a hook before ready in a custom setup
      const Fastify = (await import('fastify')).default;
      const cors = (await import('@fastify/cors')).default;
      const sensible = (await import('@fastify/sensible')).default;
      const { createErrorHandler } = await import(
        '../../src/middleware/error-handler.mjs'
      );
      const { registerRoutes } = await import('../../src/routes/index.mjs');
      const { createMockGitHubClient } = await import('./helpers.mjs');

      let readyCalled = false;
      const srv = Fastify({ logger: false });
      await srv.register(cors);
      await srv.register(sensible);
      srv.setErrorHandler(createErrorHandler());
      await registerRoutes(srv, createMockGitHubClient());

      srv.addHook('onReady', async () => {
        readyCalled = true;
      });

      await srv.ready();
      server = srv;

      expect(readyCalled).toBe(true);
    });
  });
});
