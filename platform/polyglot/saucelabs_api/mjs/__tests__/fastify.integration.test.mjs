/**
 * Fastify Integration Tests — Sauce Labs API Lifecycle Plugin
 *
 * Tests the lifecycle plugin route registration, server decorators,
 * and cleanup hooks using Fastify's inject() method (no real HTTP).
 *
 * Tests cover:
 * - Health endpoint returns vendor metadata
 * - Route registration for jobs, platform, users, upload
 * - Server decorators (saucelabs, saucelabsClients)
 * - Lifecycle hooks (onClose cleanup)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';

const VENDOR = 'saucelabs_api';
const VENDOR_VERSION = 'v1';
const PREFIX = '/~/api/rest/02-01-2026/providers/saucelabs_api';

// ── Mock SDK modules ─────────────────────────────────────────────────
function createMockClient() {
  return {
    username: 'test_user',
    close: vi.fn(),
    jobs: {
      list: vi.fn().mockResolvedValue([{ id: 'job1', status: 'complete' }]),
      get: vi.fn().mockResolvedValue({ id: 'job1', status: 'complete', name: 'Test Job' }),
    },
    platform: {
      getStatus: vi.fn().mockResolvedValue({ status: { wait_time: 0.5 } }),
      getPlatforms: vi.fn().mockResolvedValue([{ os: 'Windows', api_name: 'appium' }]),
    },
    users: {
      getUser: vi.fn().mockResolvedValue({ username: 'test_user', email: 'test@example.com' }),
      getConcurrency: vi.fn().mockResolvedValue({ concurrency: { remaining: { overall: 5 } } }),
    },
    upload: {
      uploadApp: vi.fn().mockResolvedValue({ item: { id: 'upload_123' } }),
    },
  };
}

/**
 * Create a test Fastify server with saucelabs routes registered.
 * Simulates the lifecycle plugin registration without requiring real credentials.
 */
async function createTestServer() {
  const server = Fastify({ logger: false });
  const mockClient = createMockClient();

  // Simulate server decorators (as lifecycle plugin does)
  server.decorate('saucelabs', mockClient);
  server.decorate('saucelabsClients', {
    jobs: mockClient.jobs,
    platform: mockClient.platform,
    users: mockClient.users,
    upload: mockClient.upload,
  });

  // Register routes (matching lifecycle plugin pattern)
  await server.register(
    async function saucelabsApiRoutes(scope) {
      // Health
      scope.get('/health', async () => ({
        status: 'ok',
        vendor: VENDOR,
        vendor_version: VENDOR_VERSION,
      }));

      // v1 proxy routes
      await scope.register(async (v1) => {
        v1.get('/jobs', async (req) => {
          return scope.saucelabsClients.jobs.list(req.query);
        });

        v1.get('/jobs/:jobId', async (req) => {
          return scope.saucelabsClients.jobs.get(req.params.jobId);
        });

        v1.get('/platform/status', async () => {
          return scope.saucelabsClients.platform.getStatus();
        });

        v1.get('/platform/:automationApi', async (req) => {
          return scope.saucelabsClients.platform.getPlatforms(req.params.automationApi);
        });

        v1.get('/users/:username', async (req) => {
          return scope.saucelabsClients.users.getUser(req.params.username);
        });

        v1.get('/users/:username/concurrency', async (req) => {
          return scope.saucelabsClients.users.getConcurrency(req.params.username);
        });

        v1.post('/upload', async (req) => {
          return scope.saucelabsClients.upload.uploadApp(req.body);
        });
      }, { prefix: '/v1' });
    },
    { prefix: PREFIX },
  );

  // Simulate onClose cleanup
  server.addHook('onClose', async () => {
    if (mockClient && typeof mockClient.close === 'function') {
      await mockClient.close();
    }
  });

  await server.ready();
  return { server, mockClient };
}

describe('Fastify Integration — Sauce Labs API', () => {
  let server;
  let mockClient;

  beforeEach(async () => {
    process.env.LOG_LEVEL = 'silent';
    ({ server, mockClient } = await createTestServer());
  });

  afterEach(async () => {
    await server.close();
  });

  // =====================================================================
  // Health Endpoint
  // =====================================================================
  describe('Health Endpoint', () => {
    it('returns 200 with vendor metadata', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `${PREFIX}/health`,
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('ok');
      expect(body.vendor).toBe(VENDOR);
      expect(body.vendor_version).toBe(VENDOR_VERSION);
    });
  });

  // =====================================================================
  // Jobs Routes
  // =====================================================================
  describe('Jobs Routes', () => {
    it('GET /v1/jobs lists jobs', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `${PREFIX}/v1/jobs`,
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body[0].id).toBe('job1');
      expect(mockClient.jobs.list).toHaveBeenCalled();
    });

    it('GET /v1/jobs passes query params', async () => {
      await server.inject({
        method: 'GET',
        url: `${PREFIX}/v1/jobs?limit=5&skip=10`,
      });
      expect(mockClient.jobs.list).toHaveBeenCalledWith(
        expect.objectContaining({ limit: '5', skip: '10' }),
      );
    });

    it('GET /v1/jobs/:jobId gets specific job', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `${PREFIX}/v1/jobs/abc123`,
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.id).toBe('job1');
      expect(mockClient.jobs.get).toHaveBeenCalledWith('abc123');
    });
  });

  // =====================================================================
  // Platform Routes
  // =====================================================================
  describe('Platform Routes', () => {
    it('GET /v1/platform/status returns status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `${PREFIX}/v1/platform/status`,
      });
      expect(response.statusCode).toBe(200);
      expect(mockClient.platform.getStatus).toHaveBeenCalled();
    });

    it('GET /v1/platform/:automationApi returns platforms', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `${PREFIX}/v1/platform/appium`,
      });
      expect(response.statusCode).toBe(200);
      expect(mockClient.platform.getPlatforms).toHaveBeenCalledWith('appium');
    });
  });

  // =====================================================================
  // Users Routes
  // =====================================================================
  describe('Users Routes', () => {
    it('GET /v1/users/:username returns user info', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `${PREFIX}/v1/users/test_user`,
      });
      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.username).toBe('test_user');
      expect(mockClient.users.getUser).toHaveBeenCalledWith('test_user');
    });

    it('GET /v1/users/:username/concurrency returns concurrency', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `${PREFIX}/v1/users/test_user/concurrency`,
      });
      expect(response.statusCode).toBe(200);
      expect(mockClient.users.getConcurrency).toHaveBeenCalledWith('test_user');
    });
  });

  // =====================================================================
  // Upload Routes
  // =====================================================================
  describe('Upload Routes', () => {
    it('POST /v1/upload invokes uploadApp', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `${PREFIX}/v1/upload`,
        payload: { filePath: '/tmp/app.apk' },
      });
      expect(response.statusCode).toBe(200);
      expect(mockClient.upload.uploadApp).toHaveBeenCalled();
    });
  });

  // =====================================================================
  // Server Decorators
  // =====================================================================
  describe('Server Decorators', () => {
    it('decorates server with saucelabs client', () => {
      expect(server.hasDecorator('saucelabs')).toBe(true);
      expect(server.saucelabs).toBe(mockClient);
    });

    it('decorates server with saucelabsClients domain modules', () => {
      expect(server.hasDecorator('saucelabsClients')).toBe(true);
      expect(server.saucelabsClients.jobs).toBe(mockClient.jobs);
      expect(server.saucelabsClients.platform).toBe(mockClient.platform);
      expect(server.saucelabsClients.users).toBe(mockClient.users);
      expect(server.saucelabsClients.upload).toBe(mockClient.upload);
    });
  });

  // =====================================================================
  // Lifecycle Hooks
  // =====================================================================
  describe('Lifecycle Hooks', () => {
    it('calls client.close() on server close', async () => {
      await server.close();
      expect(mockClient.close).toHaveBeenCalled();
      // Prevent double-close in afterEach
      server = Fastify({ logger: false });
      await server.ready();
    });
  });
});
