/**
 * Integration tests for Fastify plugin.
 *
 * Tests cover:
 * - Static file serving
 * - SPA catch-all routing
 * - Multi-app registration
 * - Error handling
 * - Log verification
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import {
  createTestServer,
  createTempStaticDir,
  cleanupTempDir,
  createLoggerSpy,
  expectLogContains,
} from './helpers/index.js';
import {
  staticAppLoader,
  registerMultipleApps,
  getRegisteredPrefixes,
  resetRegisteredPrefixes,
  StaticPathNotFoundError,
  IndexNotFoundError,
  RouteCollisionError,
} from '../src/index.js';

describe('Fastify Plugin Integration', () => {
  let server: FastifyInstance;
  let tempDir: string;

  beforeAll(async () => {
    tempDir = await createTempStaticDir();
  });

  afterAll(async () => {
    await cleanupTempDir(tempDir);
  });

  beforeEach(async () => {
    resetRegisteredPrefixes();
    server = await createTestServer();
  });

  afterEach(async () => {
    await server.close();
    resetRegisteredPrefixes();
  });

  // =========================================================================
  // Statement Coverage
  // =========================================================================

  describe('Statement Coverage', () => {
    it('should register static app successfully', async () => {
      await server.register(staticAppLoader, {
        appName: 'dashboard',
        rootPath: tempDir,
      });
      await server.ready();

      const prefixes = getRegisteredPrefixes();

      expect(prefixes.has('/apps/dashboard')).toBe(true);
      expect(prefixes.get('/apps/dashboard')).toBe('dashboard');
    });

    it('should serve static files', async () => {
      await server.register(staticAppLoader, {
        appName: 'myapp',
        rootPath: tempDir,
      });
      await server.ready();

      const response = await server.inject({
        method: 'GET',
        url: '/apps/myapp/assets/style.css',
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toContain('margin: 0');
    });
  });

  // =========================================================================
  // Branch Coverage
  // =========================================================================

  describe('Branch Coverage', () => {
    it('should serve index.html for any route when SPA mode enabled', async () => {
      await server.register(staticAppLoader, {
        appName: 'spa',
        rootPath: tempDir,
        spaMode: true,
      });
      await server.ready();

      const response = await server.inject({
        method: 'GET',
        url: '/apps/spa/any/nested/route',
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toContain('Test App');
    });

    it('should not create catch-all route when SPA mode disabled', async () => {
      await server.register(staticAppLoader, {
        appName: 'nospa',
        rootPath: tempDir,
        spaMode: false,
      });
      await server.ready();

      const response = await server.inject({
        method: 'GET',
        url: '/apps/nospa/nonexistent',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should inject initial state when default context provided', async () => {
      await server.register(staticAppLoader, {
        appName: 'context',
        rootPath: tempDir,
        defaultContext: { version: '1.0.0', user: 'test' },
      });
      await server.ready();

      const response = await server.inject({
        method: 'GET',
        url: '/apps/context',
      });

      expect(response.body).toContain('INITIAL_STATE');
      expect(response.body).toContain('version');
    });
  });

  // =========================================================================
  // Boundary Values
  // =========================================================================

  describe('Boundary Values', () => {
    it('should serve index.html at app root route', async () => {
      await server.register(staticAppLoader, {
        appName: 'boundary',
        rootPath: tempDir,
      });
      await server.ready();

      const response = await server.inject({
        method: 'GET',
        url: '/apps/boundary',
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toContain('Test App');
    });

    it('should handle trailing slash route by redirecting to non-trailing', async () => {
      await server.register(staticAppLoader, {
        appName: 'slash',
        rootPath: tempDir,
      });
      await server.ready();

      const response = await server.inject({
        method: 'GET',
        url: '/apps/slash/',
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/apps/slash');
    });
  });

  // =========================================================================
  // Error Handling
  // =========================================================================

  describe('Error Handling', () => {
    it('should throw StaticPathNotFoundError for non-existent path', async () => {
      await expect(
        server.register(staticAppLoader, {
          appName: 'missing',
          rootPath: '/nonexistent/path/that/does/not/exist',
        })
      ).rejects.toThrow(StaticPathNotFoundError);
    });

    it('should throw RouteCollisionError for duplicate app name', async () => {
      await server.register(staticAppLoader, {
        appName: 'collision',
        rootPath: tempDir,
      });

      const server2 = await createTestServer();

      await expect(
        server2.register(staticAppLoader, {
          appName: 'collision',
          rootPath: tempDir,
        })
      ).rejects.toThrow(RouteCollisionError);

      await server2.close();
    });
  });

  // =========================================================================
  // Log Verification
  // =========================================================================

  describe('Log Verification', () => {
    it('should log app registration', async () => {
      const { logs, mockLogger } = createLoggerSpy();

      await server.register(staticAppLoader, {
        appName: 'logged',
        rootPath: tempDir,
        logger: mockLogger,
      });
      await server.ready();

      expectLogContains(logs, 'info', 'Registering static app: logged');
      expectLogContains(logs, 'info', 'registered successfully');
    });
  });

  // =========================================================================
  // Path Rewriting
  // =========================================================================

  describe('Path Rewriting', () => {
    it('should rewrite asset paths in HTML', async () => {
      await server.register(staticAppLoader, {
        appName: 'rewrite',
        rootPath: tempDir,
      });
      await server.ready();

      const response = await server.inject({
        method: 'GET',
        url: '/apps/rewrite',
      });

      expect(response.body).toContain('/apps/rewrite/assets/style.css');
      expect(response.body).toContain('/apps/rewrite/assets/main.js');
    });
  });
});

describe('Multi-App Registration', () => {
  let server: FastifyInstance;
  let tempDir: string;

  beforeAll(async () => {
    tempDir = await createTempStaticDir();
  });

  afterAll(async () => {
    await cleanupTempDir(tempDir);
  });

  beforeEach(async () => {
    resetRegisteredPrefixes();
    server = await createTestServer();
  });

  afterEach(async () => {
    await server.close();
    resetRegisteredPrefixes();
  });

  // =========================================================================
  // Statement Coverage
  // =========================================================================

  describe('Statement Coverage', () => {
    it('should register multiple apps successfully', async () => {
      const results = await registerMultipleApps(server, {
        apps: [
          { appName: 'app1', rootPath: tempDir },
          { appName: 'app2', rootPath: tempDir },
        ],
      });

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.success)).toBe(true);
    });
  });

  // =========================================================================
  // Branch Coverage - Collision Strategies
  // =========================================================================

  describe('Collision Strategies', () => {
    it('should throw on collision with error strategy', async () => {
      await expect(
        registerMultipleApps(server, {
          apps: [
            { appName: 'dup', rootPath: tempDir },
            { appName: 'dup', rootPath: tempDir },
          ],
          collisionStrategy: 'error',
        })
      ).rejects.toThrow(RouteCollisionError);
    });

    it('should skip duplicates with skip strategy', async () => {
      const results = await registerMultipleApps(server, {
        apps: [
          { appName: 'skipdup', rootPath: tempDir },
          { appName: 'skipdup', rootPath: tempDir },
        ],
        collisionStrategy: 'skip',
      });

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toContain('Skipped');
    });

    it('should warn on collision with warn strategy', async () => {
      const { logs, mockLogger } = createLoggerSpy();

      const results = await registerMultipleApps(server, {
        apps: [
          { appName: 'warndup', rootPath: tempDir },
          { appName: 'warndup', rootPath: tempDir },
        ],
        collisionStrategy: 'warn',
        logger: mockLogger,
      });

      expectLogContains(logs, 'warn', 'collision');
      expect(results[0].success).toBe(true);
    });
  });

  // =========================================================================
  // Integration
  // =========================================================================

  describe('Integration', () => {
    it('should serve multiple apps independently', async () => {
      await registerMultipleApps(server, {
        apps: [
          { appName: 'first', rootPath: tempDir },
          { appName: 'second', rootPath: tempDir },
        ],
      });
      await server.ready();

      const firstResponse = await server.inject({
        method: 'GET',
        url: '/apps/first',
      });
      const secondResponse = await server.inject({
        method: 'GET',
        url: '/apps/second',
      });

      expect(firstResponse.statusCode).toBe(200);
      expect(secondResponse.statusCode).toBe(200);
      expect(firstResponse.body).toContain('/apps/first/assets');
      expect(secondResponse.body).toContain('/apps/second/assets');
    });
  });
});
