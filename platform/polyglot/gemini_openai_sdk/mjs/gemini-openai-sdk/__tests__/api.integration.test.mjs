/**
 * Fastify Integration Tests for gemini-openai-sdk.
 *
 * Tests cover:
 * - Endpoint availability and response format
 * - Request state handling
 * - Plugin registration
 * - Lifecycle hooks
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestServer, mockEnv } from './helpers.mjs';

describe('Fastify Integration', () => {
  let server;
  let cleanup;

  beforeEach(async () => {
    cleanup = mockEnv({ GEMINI_API_KEY: 'test-api-key' });
    server = await createTestServer();
  });

  afterEach(async () => {
    if (server) {
      await server.close();
    }
    cleanup();
  });

  // ===========================================================================
  // Health Endpoint Tests
  // ===========================================================================

  describe('Health Endpoint', () => {
    it('should return 200 OK', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().status).toBe('ok');
    });

    it('should include service name', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      const body = response.json();
      expect(body.service).toBe('gemini-openai-sdk');
    });
  });

  // ===========================================================================
  // API Health Endpoint Tests
  // ===========================================================================

  describe('API Health Endpoint', () => {
    it('should return 200 OK', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/llm/gemini-openai-v1/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().status).toBe('ok');
    });

    it('should include API version', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/llm/gemini-openai-v1/health',
      });

      const body = response.json();
      expect(body.api_version).toBe('v1');
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/unknown/route',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  // ===========================================================================
  // Request Isolation Tests
  // ===========================================================================

  describe('Request Isolation', () => {
    it('should handle concurrent requests', async () => {
      const responses = await Promise.all([
        server.inject({ method: 'GET', url: '/health' }),
        server.inject({ method: 'GET', url: '/health' }),
        server.inject({ method: 'GET', url: '/health' }),
      ]);

      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });
    });
  });

  // ===========================================================================
  // Server Lifecycle Tests
  // ===========================================================================

  describe('Server Lifecycle', () => {
    it('should be ready after initialization', async () => {
      // Server was created in beforeEach via createTestServer which calls ready()
      expect(server).toBeDefined();
    });

    it('should close gracefully', async () => {
      const tempServer = await createTestServer();

      // Should not throw
      await expect(tempServer.close()).resolves.toBeUndefined();
    });
  });
});

describe('Fastify Plugin Pattern', () => {
  let cleanup;

  beforeEach(() => {
    cleanup = mockEnv({ GEMINI_API_KEY: 'test-api-key' });
  });

  afterEach(() => {
    cleanup();
  });

  it('should support plugin registration', async () => {
    const Fastify = (await import('fastify')).default;
    const server = Fastify({ logger: false });

    // Create a simple plugin
    const sdkPlugin = async (fastify, opts) => {
      fastify.decorate('geminiSdk', { initialized: true });

      fastify.get('/sdk-status', async () => ({
        sdk_available: fastify.geminiSdk?.initialized ?? false,
      }));
    };

    await server.register(sdkPlugin);
    await server.ready();

    const response = await server.inject({
      method: 'GET',
      url: '/sdk-status',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().sdk_available).toBe(true);

    await server.close();
  });

  it('should support decorator pattern', async () => {
    const Fastify = (await import('fastify')).default;
    const { GeminiClient } = await import('../gemini-client.mjs');

    const server = Fastify({ logger: false });

    // Decorate with GeminiClient
    server.decorate('gemini', new GeminiClient());

    server.get('/client-health', async function () {
      return this.gemini.healthCheck();
    });

    await server.ready();

    const response = await server.inject({
      method: 'GET',
      url: '/client-health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('status');

    await server.close();
  });
});

describe('Fastify Request Hooks', () => {
  let cleanup;

  beforeEach(() => {
    cleanup = mockEnv({ GEMINI_API_KEY: 'test-api-key' });
  });

  afterEach(() => {
    cleanup();
  });

  it('should execute onRequest hooks', async () => {
    const Fastify = (await import('fastify')).default;
    const server = Fastify({ logger: false });

    let hookCalled = false;

    server.addHook('onRequest', async () => {
      hookCalled = true;
    });

    server.get('/test', async () => ({ ok: true }));

    await server.ready();

    await server.inject({
      method: 'GET',
      url: '/test',
    });

    expect(hookCalled).toBe(true);

    await server.close();
  });

  it('should execute onResponse hooks', async () => {
    const Fastify = (await import('fastify')).default;
    const server = Fastify({ logger: false });

    let hookCalled = false;

    server.addHook('onResponse', async () => {
      hookCalled = true;
    });

    server.get('/test', async () => ({ ok: true }));

    await server.ready();

    await server.inject({
      method: 'GET',
      url: '/test',
    });

    expect(hookCalled).toBe(true);

    await server.close();
  });
});
