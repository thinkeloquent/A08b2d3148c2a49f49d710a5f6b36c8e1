/**
 * Fastify integration tests for confluence_api server.
 *
 * Tests verify:
 * - Server creation and configuration
 * - Health endpoint via inject()
 * - Error handler maps errors to JSON responses
 * - Lifecycle hooks (onReady, onClose)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer, startServer, createErrorHandler } from '../src/server/index.mjs';
import {
  ConfluenceApiError,
  ConfluenceNotFoundError,
  ConfluenceAuthenticationError,
  ConfluenceValidationError,
  ConfluenceServerError,
} from '../src/errors.mjs';

describe('createServer', () => {
  describe('Statement Coverage', () => {
    it('should create a Fastify server instance', () => {
      const server = createServer({ logger: false });
      expect(server).toBeDefined();
      expect(server.inject).toBeInstanceOf(Function);
    });

    it('should accept custom options', () => {
      const server = createServer({ logger: false, pluginTimeout: 5000 });
      expect(server).toBeDefined();
    });
  });
});

describe('createErrorHandler', () => {
  describe('Statement Coverage', () => {
    it('should return a function', () => {
      const handler = createErrorHandler();
      expect(handler).toBeInstanceOf(Function);
    });
  });

  describe('Error Mapping', () => {
    let server;

    beforeEach(async () => {
      server = createServer({ logger: false });
      server.setErrorHandler(createErrorHandler());
    });

    afterEach(async () => {
      await server.close();
    });

    it('should map ConfluenceNotFoundError to 404', async () => {
      server.get('/test-404', () => {
        throw new ConfluenceNotFoundError('Page 999 not found');
      });
      await server.ready();

      const res = await server.inject({ method: 'GET', url: '/test-404' });
      expect(res.statusCode).toBe(404);
      const body = res.json();
      expect(body.error).toBe(true);
      expect(body.message).toContain('Page 999 not found');
      expect(body.type).toBe('ConfluenceNotFoundError');
    });

    it('should map ConfluenceAuthenticationError to 401', async () => {
      server.get('/test-401', () => {
        throw new ConfluenceAuthenticationError('Bad credentials');
      });
      await server.ready();

      const res = await server.inject({ method: 'GET', url: '/test-401' });
      expect(res.statusCode).toBe(401);
      const body = res.json();
      expect(body.error).toBe(true);
      expect(body.type).toBe('ConfluenceAuthenticationError');
    });

    it('should map ConfluenceValidationError to 400', async () => {
      server.get('/test-400', () => {
        throw new ConfluenceValidationError('Missing field');
      });
      await server.ready();

      const res = await server.inject({ method: 'GET', url: '/test-400' });
      expect(res.statusCode).toBe(400);
      const body = res.json();
      expect(body.error).toBe(true);
    });

    it('should map ConfluenceServerError to 500', async () => {
      server.get('/test-500', () => {
        throw new ConfluenceServerError('Internal error');
      });
      await server.ready();

      const res = await server.inject({ method: 'GET', url: '/test-500' });
      expect(res.statusCode).toBe(500);
      const body = res.json();
      expect(body.type).toBe('ConfluenceServerError');
    });

    it('should map unknown errors to 500 with InternalError type', async () => {
      server.get('/test-unknown', () => {
        throw new Error('Something went wrong');
      });
      await server.ready();

      const res = await server.inject({ method: 'GET', url: '/test-unknown' });
      expect(res.statusCode).toBe(500);
      const body = res.json();
      expect(body.error).toBe(true);
      expect(body.type).toBe('InternalError');
    });
  });
});

describe('Health Endpoint', () => {
  let server;

  beforeEach(async () => {
    server = createServer({ logger: false });

    server.get('/health', async () => ({
      status: 'ok',
      service: 'confluence-api-server',
    }));

    await server.ready();
  });

  afterEach(async () => {
    await server.close();
  });

  it('should return 200 OK', async () => {
    const res = await server.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
  });

  it('should return status=ok', async () => {
    const res = await server.inject({ method: 'GET', url: '/health' });
    const body = res.json();
    expect(body.status).toBe('ok');
  });

  it('should return service name', async () => {
    const res = await server.inject({ method: 'GET', url: '/health' });
    const body = res.json();
    expect(body.service).toBe('confluence-api-server');
  });
});

describe('Lifecycle Hooks', () => {
  it('should execute onReady hook', async () => {
    let hookCalled = false;
    const server = createServer({ logger: false });

    server.addHook('onReady', async () => {
      hookCalled = true;
    });

    await server.ready();
    expect(hookCalled).toBe(true);
    await server.close();
  });

  it('should execute onClose hook', async () => {
    let shutdownCalled = false;
    const server = createServer({ logger: false });

    server.addHook('onClose', async () => {
      shutdownCalled = true;
    });

    await server.ready();
    await server.close();
    expect(shutdownCalled).toBe(true);
  });
});

describe('startServer', () => {
  it('should be a function', () => {
    expect(startServer).toBeInstanceOf(Function);
  });
});
