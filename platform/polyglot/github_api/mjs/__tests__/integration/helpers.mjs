/**
 * Integration test helpers for Fastify GitHub API server.
 *
 * Provides mock GitHubClient and test server factory that bypasses
 * real authentication and HTTP calls while exercising the full
 * Fastify route/plugin/error-handler stack via inject().
 */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { vi } from 'vitest';
import { createErrorHandler } from '../../src/middleware/error-handler.mjs';
import { registerRoutes } from '../../src/routes/index.mjs';

/**
 * Create a mock GitHubClient that returns predefined responses.
 * The mock mirrors the real GitHubClient interface so that domain SDK
 * clients (ReposClient, BranchesClient, etc.) work transparently.
 *
 * @param {Object} [responses={}] - Map of "METHOD path" to return values.
 * @returns {Object} Mock client with get/post/put/patch/delete/getRaw/getRateLimit.
 */
export function createMockGitHubClient(responses = {}) {
  const defaultResponse = { id: 1, name: 'test-repo' };

  return {
    get: vi.fn().mockImplementation((path, opts) => {
      const key = `GET ${path}`;
      if (responses[key]) return Promise.resolve(responses[key]);
      return Promise.resolve(defaultResponse);
    }),
    post: vi.fn().mockImplementation((path, body) => {
      const key = `POST ${path}`;
      if (responses[key]) return Promise.resolve(responses[key]);
      return Promise.resolve({ ...defaultResponse, ...body });
    }),
    put: vi.fn().mockImplementation((path, body) => {
      const key = `PUT ${path}`;
      if (responses[key]) return Promise.resolve(responses[key]);
      return Promise.resolve(defaultResponse);
    }),
    patch: vi.fn().mockImplementation((path, body) => {
      const key = `PATCH ${path}`;
      if (responses[key]) return Promise.resolve(responses[key]);
      return Promise.resolve({ ...defaultResponse, ...body });
    }),
    delete: vi.fn().mockImplementation((path) => {
      const key = `DELETE ${path}`;
      if (responses[key]) return Promise.resolve(responses[key]);
      return Promise.resolve({});
    }),
    getRaw: vi.fn(),
    getRateLimit: vi.fn().mockResolvedValue({
      resources: { core: { limit: 5000, remaining: 4999 } },
    }),
    lastRateLimit: null,
    logger: null,
  };
}

/**
 * Create a test Fastify server with a mock GitHub client.
 * Bypasses real auth and HTTP while exercising the full route stack.
 *
 * @param {Object|null} [mockClient=null] - Optional pre-configured mock client.
 * @returns {Promise<{server: import('fastify').FastifyInstance, client: Object}>}
 */
export async function createTestServer(mockClient = null) {
  const client = mockClient || createMockGitHubClient();

  const server = Fastify({ logger: false });
  await server.register(cors);
  await server.register(sensible);
  server.setErrorHandler(createErrorHandler());
  await registerRoutes(server, client);
  await server.ready();

  return { server, client };
}
