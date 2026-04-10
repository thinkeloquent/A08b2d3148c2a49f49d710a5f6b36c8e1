/**
 * Integration tests for server (Fastify) using server.inject()
 */
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';

vi.mock('../src/logger.mjs', () => ({
  createLogger: () => ({
    debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(),
  }),
}));

vi.mock('../src/adapters/UndiciFetchAdapter.mjs', () => ({
  UndiciFetchAdapter: vi.fn().mockImplementation(() => ({
    fetch: vi.fn(),
  })),
}));

import { JiraAuthenticationError, JiraNotFoundError } from '../src/errors.mjs';

// --- Helper: build a minimal Fastify server with mocked services ---

async function buildTestServer(overrides = {}) {
  const { default: Fastify } = await import('fastify');
  const { createErrorHandler } = await import('../src/server/middleware/error-handler.mjs');
  const { createAuthHook } = await import('../src/server/middleware/auth.mjs');
  const { userRoutes } = await import('../src/server/routes/users.mjs');
  const { issueRoutes } = await import('../src/server/routes/issues.mjs');
  const { projectRoutes } = await import('../src/server/routes/projects.mjs');

  const server = Fastify({ logger: false });

  server.setErrorHandler(createErrorHandler());
  server.addHook('preHandler', createAuthHook(overrides.apiKey));

  // Health
  server.get('/health', async () => ({ status: 'healthy', service: 'jira-api-server' }));

  const mockUserService = overrides.userService || {
    searchUsers: vi.fn().mockResolvedValue([]),
    getUserByIdentifier: vi.fn().mockResolvedValue(null),
  };

  const mockIssueService = overrides.issueService || {
    getIssue: vi.fn().mockResolvedValue({ key: 'PROJ-1', fields: {} }),
    createIssue: vi.fn().mockResolvedValue({ key: 'PROJ-2' }),
    updateIssueSummary: vi.fn(),
    addLabels: vi.fn(),
    removeLabels: vi.fn(),
    assignIssueByEmail: vi.fn(),
    getAvailableTransitions: vi.fn().mockResolvedValue([]),
    transitionIssueByName: vi.fn(),
  };

  const mockProjectService = overrides.projectService || {
    getProject: vi.fn().mockResolvedValue({ id: '1', key: 'PROJ', name: 'Project' }),
    getProjectVersions: vi.fn().mockResolvedValue([]),
    createVersion: vi.fn().mockResolvedValue({ id: '100', name: 'v1.0' }),
  };

  await server.register(async (scope) => {
    await userRoutes(scope, { userService: mockUserService });
  }, { prefix: '/users' });

  await server.register(async (scope) => {
    await issueRoutes(scope, { issueService: mockIssueService });
  }, { prefix: '/issues' });

  await server.register(async (scope) => {
    await projectRoutes(scope, { projectService: mockProjectService });
  }, { prefix: '/projects' });

  await server.ready();

  return { server, mockUserService, mockIssueService, mockProjectService };
}

describe('Fastify Server Integration', () => {
  describe('Health Endpoint', () => {
    describe('Statement Coverage', () => {
      it('GET /health returns 200 with status', async () => {
        const { server } = await buildTestServer();
        const res = await server.inject({ method: 'GET', url: '/health' });
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.payload);
        expect(body.status).toBe('healthy');
        expect(body.service).toBe('jira-api-server');
        await server.close();
      });
    });
  });

  describe('User Endpoints', () => {
    describe('Statement Coverage', () => {
      it('GET /users/search returns users', async () => {
        const userService = {
          searchUsers: vi.fn().mockResolvedValue([
            { accountId: 'acc1', displayName: 'User 1' },
          ]),
          getUserByIdentifier: vi.fn(),
        };
        const { server } = await buildTestServer({ userService });
        const res = await server.inject({
          method: 'GET', url: '/users/search?query=test',
        });
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.payload);
        expect(body).toHaveLength(1);
        expect(body[0].accountId).toBe('acc1');
        await server.close();
      });

      it('GET /users/:identifier returns user', async () => {
        const userService = {
          searchUsers: vi.fn(),
          getUserByIdentifier: vi.fn().mockResolvedValue({
            accountId: 'acc1', displayName: 'User 1',
          }),
        };
        const { server } = await buildTestServer({ userService });
        const res = await server.inject({
          method: 'GET', url: '/users/acc1',
        });
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.payload);
        expect(body.accountId).toBe('acc1');
        await server.close();
      });
    });

    describe('Error Handling', () => {
      it('returns 401 for JiraAuthenticationError', async () => {
        const userService = {
          searchUsers: vi.fn().mockRejectedValue(
            new JiraAuthenticationError('bad creds'),
          ),
          getUserByIdentifier: vi.fn(),
        };
        const { server } = await buildTestServer({ userService });
        const res = await server.inject({
          method: 'GET', url: '/users/search?query=test',
        });
        expect(res.statusCode).toBe(401);
        const body = JSON.parse(res.payload);
        expect(body.error).toBe(true);
        await server.close();
      });
    });
  });

  describe('Issue Endpoints', () => {
    describe('Statement Coverage', () => {
      it('GET /issues/:key returns issue', async () => {
        const { server } = await buildTestServer();
        const res = await server.inject({
          method: 'GET', url: '/issues/PROJ-1',
        });
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.payload);
        expect(body.key).toBe('PROJ-1');
        await server.close();
      });

      it('POST /issues creates issue', async () => {
        const { server } = await buildTestServer();
        const res = await server.inject({
          method: 'POST', url: '/issues',
          payload: {
            projectId: '1', summary: 'Test Issue', issueTypeId: '10001',
          },
        });
        expect(res.statusCode).toBe(200);
        await server.close();
      });

      it('PATCH /issues/:key updates issue', async () => {
        const { server, mockIssueService } = await buildTestServer();
        const res = await server.inject({
          method: 'PATCH', url: '/issues/PROJ-1',
          payload: { summary: 'Updated Title', labelsAdd: ['new'], labelsRemove: ['old'] },
        });
        expect(res.statusCode).toBe(200);
        expect(mockIssueService.updateIssueSummary).toHaveBeenCalledWith('PROJ-1', 'Updated Title');
        expect(mockIssueService.addLabels).toHaveBeenCalledWith('PROJ-1', ['new']);
        expect(mockIssueService.removeLabels).toHaveBeenCalledWith('PROJ-1', ['old']);
        await server.close();
      });

      it('PUT /issues/:key/assign/:email assigns issue', async () => {
        const { server, mockIssueService } = await buildTestServer();
        const res = await server.inject({
          method: 'PUT', url: '/issues/PROJ-1/assign/user@test.com',
        });
        expect(res.statusCode).toBe(200);
        expect(mockIssueService.assignIssueByEmail).toHaveBeenCalledWith('PROJ-1', 'user@test.com');
        await server.close();
      });

      it('GET /issues/:key/transitions returns transitions', async () => {
        const { server } = await buildTestServer();
        const res = await server.inject({
          method: 'GET', url: '/issues/PROJ-1/transitions',
        });
        expect(res.statusCode).toBe(200);
        await server.close();
      });

      it('POST /issues/:key/transitions triggers transition', async () => {
        const { server, mockIssueService } = await buildTestServer();
        const res = await server.inject({
          method: 'POST', url: '/issues/PROJ-1/transitions',
          payload: { transition_name: 'Done', comment: 'Closing', resolution_name: 'Fixed' },
        });
        expect(res.statusCode).toBe(200);
        expect(mockIssueService.transitionIssueByName).toHaveBeenCalledWith(
          'PROJ-1', 'Done', 'Closing', 'Fixed',
        );
        await server.close();
      });
    });

    describe('Error Handling', () => {
      it('returns 404 for JiraNotFoundError', async () => {
        const issueService = {
          getIssue: vi.fn().mockRejectedValue(new JiraNotFoundError('not found')),
          createIssue: vi.fn(),
          updateIssueSummary: vi.fn(),
          addLabels: vi.fn(),
          removeLabels: vi.fn(),
          assignIssueByEmail: vi.fn(),
          getAvailableTransitions: vi.fn(),
          transitionIssueByName: vi.fn(),
        };
        const { server } = await buildTestServer({ issueService });
        const res = await server.inject({
          method: 'GET', url: '/issues/UNKNOWN-999',
        });
        expect(res.statusCode).toBe(404);
        const body = JSON.parse(res.payload);
        expect(body.type).toBe('JiraNotFoundError');
        await server.close();
      });

      it('returns 500 for unexpected errors', async () => {
        const issueService = {
          getIssue: vi.fn().mockRejectedValue(new Error('unexpected')),
          createIssue: vi.fn(),
          updateIssueSummary: vi.fn(),
          addLabels: vi.fn(),
          removeLabels: vi.fn(),
          assignIssueByEmail: vi.fn(),
          getAvailableTransitions: vi.fn(),
          transitionIssueByName: vi.fn(),
        };
        const { server } = await buildTestServer({ issueService });
        const res = await server.inject({
          method: 'GET', url: '/issues/PROJ-1',
        });
        expect(res.statusCode).toBe(500);
        const body = JSON.parse(res.payload);
        expect(body.type).toBe('InternalError');
        await server.close();
      });
    });
  });

  describe('Project Endpoints', () => {
    describe('Statement Coverage', () => {
      it('GET /projects/:key returns project', async () => {
        const { server } = await buildTestServer();
        const res = await server.inject({
          method: 'GET', url: '/projects/PROJ',
        });
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.payload);
        expect(body.key).toBe('PROJ');
        await server.close();
      });

      it('GET /projects/:key/versions returns versions', async () => {
        const projectService = {
          getProject: vi.fn(),
          getProjectVersions: vi.fn().mockResolvedValue([
            { id: '1', name: 'v1.0', released: true },
          ]),
          createVersion: vi.fn(),
        };
        const { server } = await buildTestServer({ projectService });
        const res = await server.inject({
          method: 'GET', url: '/projects/PROJ/versions',
        });
        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.payload);
        expect(body).toHaveLength(1);
        await server.close();
      });

      it('POST /projects/:key/versions creates version', async () => {
        const { server, mockProjectService } = await buildTestServer();
        const res = await server.inject({
          method: 'POST', url: '/projects/PROJ/versions',
          payload: { name: 'v2.0', description: 'New version' },
        });
        expect(res.statusCode).toBe(200);
        expect(mockProjectService.createVersion).toHaveBeenCalled();
        await server.close();
      });
    });

    describe('Branch Coverage', () => {
      it('GET /projects/:key/versions?released=true filters released', async () => {
        const projectService = {
          getProject: vi.fn(),
          getProjectVersions: vi.fn().mockResolvedValue([]),
          createVersion: vi.fn(),
        };
        const { server } = await buildTestServer({ projectService });
        const res = await server.inject({
          method: 'GET', url: '/projects/PROJ/versions?released=true',
        });
        expect(res.statusCode).toBe(200);
        expect(projectService.getProjectVersions).toHaveBeenCalledWith('PROJ', true);
        await server.close();
      });

      it('GET /projects/:key/versions?released=false filters unreleased', async () => {
        const projectService = {
          getProject: vi.fn(),
          getProjectVersions: vi.fn().mockResolvedValue([]),
          createVersion: vi.fn(),
        };
        const { server } = await buildTestServer({ projectService });
        const res = await server.inject({
          method: 'GET', url: '/projects/PROJ/versions?released=false',
        });
        expect(res.statusCode).toBe(200);
        expect(projectService.getProjectVersions).toHaveBeenCalledWith('PROJ', false);
        await server.close();
      });
    });
  });

  describe('Auth Middleware', () => {
    describe('Statement Coverage', () => {
      it('allows requests when no API key configured', async () => {
        const { server } = await buildTestServer();
        const res = await server.inject({ method: 'GET', url: '/health' });
        expect(res.statusCode).toBe(200);
        await server.close();
      });
    });

    describe('Branch Coverage', () => {
      it('rejects requests without auth when API key set', async () => {
        const { server } = await buildTestServer({ apiKey: 'secret123' });
        const res = await server.inject({
          method: 'GET', url: '/health',
        });
        expect(res.statusCode).toBe(401);
        const body = JSON.parse(res.payload);
        expect(body.error).toBe('Authentication required');
        await server.close();
      });

      it('accepts Basic auth with valid key', async () => {
        const { server } = await buildTestServer({ apiKey: 'secret123' });
        const encoded = Buffer.from('secret123:').toString('base64');
        const res = await server.inject({
          method: 'GET', url: '/health',
          headers: { Authorization: `Basic ${encoded}` },
        });
        expect(res.statusCode).toBe(200);
        await server.close();
      });

      it('accepts Bearer token with valid key', async () => {
        const { server } = await buildTestServer({ apiKey: 'secret123' });
        const res = await server.inject({
          method: 'GET', url: '/health',
          headers: { Authorization: 'Bearer secret123' },
        });
        expect(res.statusCode).toBe(200);
        await server.close();
      });

      it('rejects invalid Basic auth', async () => {
        const { server } = await buildTestServer({ apiKey: 'secret123' });
        const encoded = Buffer.from('wrong:').toString('base64');
        const res = await server.inject({
          method: 'GET', url: '/health',
          headers: { Authorization: `Basic ${encoded}` },
        });
        expect(res.statusCode).toBe(401);
        const body = JSON.parse(res.payload);
        expect(body.error).toBe('Invalid API key');
        await server.close();
      });

      it('rejects invalid Bearer token', async () => {
        const { server } = await buildTestServer({ apiKey: 'secret123' });
        const res = await server.inject({
          method: 'GET', url: '/health',
          headers: { Authorization: 'Bearer wrong_token' },
        });
        expect(res.statusCode).toBe(401);
        await server.close();
      });
    });
  });
});
