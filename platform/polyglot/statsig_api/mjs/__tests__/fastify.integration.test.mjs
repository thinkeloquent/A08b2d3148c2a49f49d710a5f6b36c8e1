/**
 * Integration tests for statsig-api-client with Fastify.
 *
 * Tests cover:
 * - Statement coverage for route registration and request handling
 * - Branch coverage for health endpoint and CRUD proxy routes
 * - Error handling for upstream API errors
 *
 * These tests create a self-contained Fastify server with mocked
 * fetch to verify the statsig-api-client integrates correctly.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import { StatsigClient } from '../src/client.mjs';
import { GatesModule } from '../src/modules/gates/index.mjs';
import { ExperimentsModule } from '../src/modules/experiments/index.mjs';

const VENDOR = 'statsig_api';
const PREFIX = '/~/api/rest/2025-01-01/providers/statsig_api';

function createMockResponse(options = {}) {
  const {
    status = 200,
    json = {},
    headers = { 'content-type': 'application/json' },
    ok = status >= 200 && status < 300,
  } = options;

  const headersMap = new Map(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
  );

  return {
    status,
    ok,
    headers: {
      get: (key) => headersMap.get(key.toLowerCase()) ?? null,
      forEach: (cb) => headersMap.forEach((v, k) => cb(v, k)),
    },
    json: vi.fn().mockResolvedValue(json),
    text: vi.fn().mockResolvedValue(JSON.stringify(json)),
  };
}

async function createTestServer(mockFetch) {
  vi.stubGlobal('fetch', mockFetch);

  const server = Fastify({ logger: false });

  const statsig = new StatsigClient({ apiKey: 'test-integration-key' });
  const gates = new GatesModule(statsig);
  const experiments = new ExperimentsModule(statsig);

  server.decorate('statsig', statsig);
  server.decorate('statsigClients', { gates, experiments });

  await server.register(
    async function routes(scope) {
      scope.get('/health', async () => ({
        status: 'ok',
        vendor: VENDOR,
        vendor_version: 'v1',
      }));

      await scope.register(
        async (v1) => {
          v1.get('/gates', async (req) => {
            return scope.statsigClients.gates.list(req.query);
          });

          v1.get('/gates/:id', async (req) => {
            return scope.statsigClients.gates.get(req.params.id);
          });

          v1.post('/gates', async (req) => {
            return scope.statsigClients.gates.create(req.body);
          });

          v1.delete('/gates/:id', async (req) => {
            return scope.statsigClients.gates.delete(req.params.id);
          });

          v1.get('/experiments', async (req) => {
            return scope.statsigClients.experiments.list(req.query);
          });
        },
        { prefix: '/v1' }
      );
    },
    { prefix: PREFIX }
  );

  await server.ready();
  return server;
}

describe('Fastify Integration', () => {
  let server;
  let mockFetch;

  beforeEach(async () => {
    mockFetch = vi.fn();
  });

  afterEach(async () => {
    if (server) {
      await server.close();
    }
    vi.unstubAllGlobals();
  });

  describe('Health Endpoint', () => {
    it('should return 200 with status ok', async () => {
      server = await createTestServer(mockFetch);
      const response = await server.inject({
        method: 'GET',
        url: `${PREFIX}/health`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('ok');
      expect(body.vendor).toBe(VENDOR);
    });
  });

  describe('Gates Routes', () => {
    it('should list gates via inject', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          json: { data: [{ id: 'gate1', name: 'feature_x' }], pagination: {} },
        })
      );
      server = await createTestServer(mockFetch);

      const response = await server.inject({
        method: 'GET',
        url: `${PREFIX}/v1/gates`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    it('should get a gate by ID', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          json: { id: 'gate1', name: 'feature_x', enabled: true },
        })
      );
      server = await createTestServer(mockFetch);

      const response = await server.inject({
        method: 'GET',
        url: `${PREFIX}/v1/gates/gate1`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.name).toBe('feature_x');
    });

    it('should create a gate', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          json: { id: 'new_gate', name: 'new_feature' },
        })
      );
      server = await createTestServer(mockFetch);

      const response = await server.inject({
        method: 'POST',
        url: `${PREFIX}/v1/gates`,
        payload: { name: 'new_feature' },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.id).toBe('new_gate');
    });

    it('should delete a gate', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ json: { deleted: true } })
      );
      server = await createTestServer(mockFetch);

      const response = await server.inject({
        method: 'DELETE',
        url: `${PREFIX}/v1/gates/gate1`,
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Experiments Routes', () => {
    it('should list experiments', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          json: {
            data: [{ id: 'exp1', name: 'test_experiment' }],
            pagination: {},
          },
        })
      );
      server = await createTestServer(mockFetch);

      const response = await server.inject({
        method: 'GET',
        url: `${PREFIX}/v1/experiments`,
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Error Propagation', () => {
    it('should return error when upstream returns 401', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          status: 401,
          ok: false,
          json: { message: 'Unauthorized' },
        })
      );
      server = await createTestServer(mockFetch);

      const response = await server.inject({
        method: 'GET',
        url: `${PREFIX}/v1/gates/gate1`,
      });

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('should return error when upstream returns 404', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          status: 404,
          ok: false,
          json: { message: 'Not found' },
        })
      );
      server = await createTestServer(mockFetch);

      const response = await server.inject({
        method: 'GET',
        url: `${PREFIX}/v1/gates/nonexistent`,
      });

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Server Decorators', () => {
    it('should decorate server with statsig client', async () => {
      server = await createTestServer(mockFetch);
      expect(server.statsig).toBeDefined();
      expect(server.statsig).toBeInstanceOf(StatsigClient);
    });

    it('should decorate server with statsigClients', async () => {
      server = await createTestServer(mockFetch);
      expect(server.statsigClients).toBeDefined();
      expect(server.statsigClients.gates).toBeInstanceOf(GatesModule);
      expect(server.statsigClients.experiments).toBeInstanceOf(ExperimentsModule);
    });
  });

  describe('Lifecycle', () => {
    it('should close server cleanly', async () => {
      server = await createTestServer(mockFetch);
      await expect(server.close()).resolves.not.toThrow();
      server = null;
    });
  });
});
