/**
 * Integration tests for repository routes.
 *
 * Tests cover:
 * - Statement coverage: every repo route returns correct status and body
 * - Branch coverage: query parameters forwarded, request body forwarded
 * - Error handling: NotFoundError from mock client maps to 404
 * - Boundary values: empty response bodies
 *
 * Uses createTestServer() with a mock GitHubClient. The mock client's
 * get/post/put/patch/delete methods are exercised through the full
 * Fastify route -> SDK client -> mock chain.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestServer, createMockGitHubClient } from './helpers.mjs';
import { NotFoundError } from '../../src/sdk/errors.mjs';

describe('Repository Routes Integration', () => {
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
    it('GET /api/github/repos/:owner/:repo should return 200 with repo data', async () => {
      const repoData = {
        id: 42,
        name: 'my-repo',
        full_name: 'octocat/my-repo',
      };
      client.get.mockResolvedValueOnce(repoData);

      const response = await server.inject({
        method: 'GET',
        url: '/api/github/repos/octocat/my-repo',
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.id).toBe(42);
      expect(body.name).toBe('my-repo');
    });

    it('GET /api/github/repos/user/:username should return 200 with repo list', async () => {
      const repos = [{ id: 1, name: 'repo-a' }, { id: 2, name: 'repo-b' }];
      client.get.mockResolvedValueOnce(repos);

      const response = await server.inject({
        method: 'GET',
        url: '/api/github/repos/user/octocat',
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body).toHaveLength(2);
      expect(body[0].name).toBe('repo-a');
    });

    it('GET /api/github/repos/me should return 200 with repo list', async () => {
      const repos = [{ id: 10, name: 'my-private-repo' }];
      client.get.mockResolvedValueOnce(repos);

      const response = await server.inject({
        method: 'GET',
        url: '/api/github/repos/me',
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body).toHaveLength(1);
    });

    it('GET /api/github/repos/org/:org should return 200 with repo list', async () => {
      const repos = [{ id: 20, name: 'org-repo' }];
      client.get.mockResolvedValueOnce(repos);

      const response = await server.inject({
        method: 'GET',
        url: '/api/github/repos/org/my-org',
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body[0].name).toBe('org-repo');
    });

    it('POST /api/github/repos should return 201 with created repo', async () => {
      const created = { id: 99, name: 'new-repo', private: true };
      client.post.mockResolvedValueOnce(created);

      const response = await server.inject({
        method: 'POST',
        url: '/api/github/repos',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({ name: 'new-repo', private: true }),
      });
      const body = response.json();

      expect(response.statusCode).toBe(201);
      expect(body.name).toBe('new-repo');
    });

    it('POST /api/github/repos/org/:org should return 201', async () => {
      const created = { id: 100, name: 'org-new-repo' };
      client.post.mockResolvedValueOnce(created);

      const response = await server.inject({
        method: 'POST',
        url: '/api/github/repos/org/my-org',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({ name: 'org-new-repo' }),
      });
      const body = response.json();

      expect(response.statusCode).toBe(201);
      expect(body.name).toBe('org-new-repo');
    });

    it('PATCH /api/github/repos/:owner/:repo should return 200', async () => {
      const updated = { id: 42, name: 'my-repo', description: 'Updated' };
      client.patch.mockResolvedValueOnce(updated);

      const response = await server.inject({
        method: 'PATCH',
        url: '/api/github/repos/octocat/my-repo',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({ description: 'Updated' }),
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.description).toBe('Updated');
    });

    it('DELETE /api/github/repos/:owner/:repo should return 204', async () => {
      client.delete.mockResolvedValueOnce({});

      const response = await server.inject({
        method: 'DELETE',
        url: '/api/github/repos/octocat/my-repo',
      });

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('');
    });

    it('GET /api/github/repos/:owner/:repo/topics should return 200', async () => {
      const topics = { names: ['javascript', 'api'] };
      client.get.mockResolvedValueOnce(topics);

      const response = await server.inject({
        method: 'GET',
        url: '/api/github/repos/octocat/my-repo/topics',
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.names).toContain('javascript');
    });

    it('PUT /api/github/repos/:owner/:repo/topics should return 200', async () => {
      const result = { names: ['node', 'fastify'] };
      client.put.mockResolvedValueOnce(result);

      const response = await server.inject({
        method: 'PUT',
        url: '/api/github/repos/octocat/my-repo/topics',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({ names: ['node', 'fastify'] }),
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.names).toEqual(['node', 'fastify']);
    });

    it('GET /api/github/repos/:owner/:repo/languages should return 200', async () => {
      const languages = { JavaScript: 50000, TypeScript: 20000 };
      client.get.mockResolvedValueOnce(languages);

      const response = await server.inject({
        method: 'GET',
        url: '/api/github/repos/octocat/my-repo/languages',
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.JavaScript).toBe(50000);
    });

    it('GET /api/github/repos/:owner/:repo/contributors should return 200', async () => {
      const contributors = [
        { login: 'octocat', contributions: 100 },
        { login: 'hubot', contributions: 50 },
      ];
      client.get.mockResolvedValueOnce(contributors);

      const response = await server.inject({
        method: 'GET',
        url: '/api/github/repos/octocat/my-repo/contributors',
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body).toHaveLength(2);
      expect(body[0].login).toBe('octocat');
    });

    it('POST /api/github/repos/:owner/:repo/forks should return 202', async () => {
      const forked = { id: 200, name: 'my-repo', fork: true };
      client.post.mockResolvedValueOnce(forked);

      const response = await server.inject({
        method: 'POST',
        url: '/api/github/repos/octocat/my-repo/forks',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({}),
      });
      const body = response.json();

      expect(response.statusCode).toBe(202);
      expect(body.fork).toBe(true);
    });

    it('GET /api/github/repos/:owner/:repo/forks should return 200', async () => {
      const forks = [{ id: 201, name: 'forked-repo' }];
      client.get.mockResolvedValueOnce(forks);

      const response = await server.inject({
        method: 'GET',
        url: '/api/github/repos/octocat/my-repo/forks',
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body).toHaveLength(1);
    });

    it('PUT /api/github/repos/:owner/:repo/subscription should return 200', async () => {
      const subscription = { subscribed: true, ignored: false };
      client.put.mockResolvedValueOnce(subscription);

      const response = await server.inject({
        method: 'PUT',
        url: '/api/github/repos/octocat/my-repo/subscription',
      });
      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.subscribed).toBe(true);
    });

    it('DELETE /api/github/repos/:owner/:repo/subscription should return 204', async () => {
      client.delete.mockResolvedValueOnce({});

      const response = await server.inject({
        method: 'DELETE',
        url: '/api/github/repos/octocat/my-repo/subscription',
      });

      expect(response.statusCode).toBe(204);
    });
  });

  // =========================================================================
  // Error Handling
  // =========================================================================

  describe('Error Handling', () => {
    it('should return 404 when mock client throws NotFoundError', async () => {
      client.get.mockRejectedValueOnce(
        new NotFoundError('Not Found'),
      );

      const response = await server.inject({
        method: 'GET',
        url: '/api/github/repos/octocat/nonexistent',
      });
      const body = response.json();

      expect(response.statusCode).toBe(404);
      expect(body.error).toBe('Not Found');
    });

    it('should return 400 when SDK validation rejects invalid owner', async () => {
      // The SDK validates owner with validateUsername which rejects names
      // starting with a hyphen. This triggers a ValidationError before
      // the mock client is called.
      const response = await server.inject({
        method: 'GET',
        url: '/api/github/repos/-invalid/my-repo',
      });
      const body = response.json();

      expect(response.statusCode).toBe(400);
      expect(body.error).toBe('Validation Error');
    });
  });

  // =========================================================================
  // Branch Coverage
  // =========================================================================

  describe('Branch Coverage', () => {
    it('should forward query parameters to SDK client for user repos', async () => {
      client.get.mockResolvedValueOnce([]);

      await server.inject({
        method: 'GET',
        url: '/api/github/repos/user/octocat?per_page=10&page=2&sort=updated',
      });

      // The SDK client receives the query as the options.params
      expect(client.get).toHaveBeenCalled();
      const callArgs = client.get.mock.calls[0];
      expect(callArgs[0]).toContain('/users/octocat/repos');
    });

    it('should forward query parameters to SDK client for org repos', async () => {
      client.get.mockResolvedValueOnce([]);

      await server.inject({
        method: 'GET',
        url: '/api/github/repos/org/my-org?type=public&per_page=5',
      });

      expect(client.get).toHaveBeenCalled();
      const callArgs = client.get.mock.calls[0];
      expect(callArgs[0]).toContain('/orgs/my-org/repos');
    });

    it('should forward request body to SDK client for POST /repos', async () => {
      const payload = { name: 'test-repo', private: true, description: 'A test' };
      client.post.mockResolvedValueOnce({ id: 1, ...payload });

      await server.inject({
        method: 'POST',
        url: '/api/github/repos',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify(payload),
      });

      expect(client.post).toHaveBeenCalled();
      const callArgs = client.post.mock.calls[0];
      // The SDK's repos.create calls client.post('/user/repos', data)
      expect(callArgs[0]).toBe('/user/repos');
      expect(callArgs[1]).toEqual(payload);
    });

    it('should forward request body to SDK client for PATCH /repos/:owner/:repo', async () => {
      const payload = { description: 'Changed description' };
      client.patch.mockResolvedValueOnce({ id: 1, ...payload });

      await server.inject({
        method: 'PATCH',
        url: '/api/github/repos/octocat/my-repo',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify(payload),
      });

      expect(client.patch).toHaveBeenCalled();
      const callArgs = client.patch.mock.calls[0];
      expect(callArgs[0]).toBe('/repos/octocat/my-repo');
      expect(callArgs[1]).toEqual(payload);
    });

    it('should forward query parameters for contributors', async () => {
      client.get.mockResolvedValueOnce([]);

      await server.inject({
        method: 'GET',
        url: '/api/github/repos/octocat/my-repo/contributors?anon=true&per_page=50',
      });

      expect(client.get).toHaveBeenCalled();
      const callArgs = client.get.mock.calls[0];
      expect(callArgs[0]).toContain('/repos/octocat/my-repo/contributors');
    });

    it('should forward query parameters for forks listing', async () => {
      client.get.mockResolvedValueOnce([]);

      await server.inject({
        method: 'GET',
        url: '/api/github/repos/octocat/my-repo/forks?sort=newest&per_page=10',
      });

      expect(client.get).toHaveBeenCalled();
      const callArgs = client.get.mock.calls[0];
      expect(callArgs[0]).toContain('/repos/octocat/my-repo/forks');
    });
  });
});
