/**
 * Fastify Integration Example — Jira API
 *
 * Demonstrates how to integrate the jira_api package into a Fastify server
 * with decorators, hooks, route registration, and error handling.
 *
 * Usage:
 *   node examples/fastify-app/server.mjs
 *
 * Environment Variables:
 *   JIRA_BASE_URL   — e.g. https://yourteam.atlassian.net
 *   JIRA_EMAIL      — Jira account email
 *   JIRA_API_TOKEN  — Jira API token
 *   SERVER_API_KEY  — Optional API key for this server
 *   PORT            — Server port (default: 9000)
 *   LOG_LEVEL       — Optional (default: info)
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';

import {
  JiraFetchClient,
  getConfig,
  getServerConfig,
  UserService,
  IssueService,
  ProjectService,
  JiraApiError,
  JiraConfigurationError,
  createLogger,
} from '../../src/index.mjs';
import { createAuthHook } from '../../src/server/middleware/auth.mjs';
import { createErrorHandler } from '../../src/server/middleware/error-handler.mjs';

const log = createLogger('jira-api-example', import.meta.url);
const PORT = parseInt(process.env.PORT || '9000', 10);

// ─── Mock Configuration ─────────────────────────────────────────────────────

const MOCK_CONFIG = {
  title: 'Jira API Example Server',
  version: '0.1.0',
  logLevel: process.env.LOG_LEVEL || 'info',
};


// ─── Server Factory ─────────────────────────────────────────────────────────

async function buildServer() {
  const server = Fastify({ logger: false });

  // Register CORS
  await server.register(cors, { origin: true });

  // Decorate server with app config
  server.decorate('appConfig', MOCK_CONFIG);

  // Request state — each request gets a unique ID and a counter
  let requestCount = 0;
  server.decorateRequest('requestId', '');
  server.decorateRequest('requestState', null);

  server.addHook('onRequest', async (request) => {
    requestCount += 1;
    request.requestId = crypto.randomUUID();
    request.requestState = { requestCount, requestId: request.requestId };
  });

  server.addHook('onResponse', async (request, reply) => {
    log.debug('request completed', {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      requestId: request.requestId,
    });
  });

  // Error handler — maps JiraApiError to HTTP responses
  server.setErrorHandler(createErrorHandler());

  // Auth hook — optional API key authentication
  const apiKey = process.env.SERVER_API_KEY;
  server.addHook('preHandler', createAuthHook(apiKey));

  // ── Jira Client Factory ──────────────────────────────────────────────

  const jiraConfig = getConfig();
  if (jiraConfig) {
    log.info('Jira configured', { baseUrl: jiraConfig.baseUrl });
  } else {
    log.warn('No JIRA configuration found — set JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN');
  }

  function getClient() {
    const cfg = jiraConfig || getConfig();
    if (!cfg) {
      throw new JiraConfigurationError(
        'JIRA not configured. Set JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN.',
      );
    }
    return new JiraFetchClient({
      baseUrl: cfg.baseUrl,
      email: cfg.email,
      apiToken: cfg.apiToken,
    });
  }

  // ── Health ──────────────────────────────────────────────────────────

  server.get('/health', async (request) => ({
    status: 'healthy',
    service: MOCK_CONFIG.title,
    version: MOCK_CONFIG.version,
    jiraConfigured: !!jiraConfig,
  }));

  // ── Config / Debug ──────────────────────────────────────────────────

  server.get('/config', async () => MOCK_CONFIG);

  server.get('/state', async (request) => ({
    requestId: request.requestId,
    requestState: request.requestState,
  }));

  // ── Users ───────────────────────────────────────────────────────────

  await server.register(async (scope) => {
    const client = jiraConfig ? getClient() : null;

    scope.get('/search', {
      schema: {
        querystring: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string' },
            max_results: { type: 'integer', default: 50 },
          },
        },
      },
    }, async (request) => {
      const c = client || getClient();
      const { query, max_results = 50 } = request.query;
      return new UserService(c).searchUsers(query, max_results);
    });

    scope.get('/:identifier', async (request) => {
      const c = client || getClient();
      const user = await new UserService(c).getUserByIdentifier(request.params.identifier);
      if (!user) {
        return scope.httpErrors
          ? scope.httpErrors.notFound(`User '${request.params.identifier}' not found`)
          : reply.code(404).send({ error: 'User not found' });
      }
      return user;
    });
  }, { prefix: '/users' });

  // ── Issues ──────────────────────────────────────────────────────────

  await server.register(async (scope) => {
    const client = jiraConfig ? getClient() : null;

    scope.get('/:issueKey', async (request) => {
      const c = client || getClient();
      return new IssueService(c).getIssue(request.params.issueKey);
    });

    scope.post('/', async (request) => {
      const c = client || getClient();
      const { projectId, summary, issueTypeId, description, priorityId, labels } = request.body;
      return new IssueService(c).createIssue({
        projectId, summary, issueTypeId, description, priorityId, labels,
      });
    });

    scope.get('/:issueKey/transitions', async (request) => {
      const c = client || getClient();
      return new IssueService(c).getAvailableTransitions(request.params.issueKey);
    });

    scope.post('/:issueKey/transitions', async (request) => {
      const c = client || getClient();
      const { transition_name, comment, resolution_name } = request.body;
      await new IssueService(c).transitionIssueByName(
        request.params.issueKey, transition_name, comment, resolution_name,
      );
      return { message: `Issue ${request.params.issueKey} transitioned using '${transition_name}'` };
    });
  }, { prefix: '/issues' });

  // ── Projects ────────────────────────────────────────────────────────

  await server.register(async (scope) => {
    const client = jiraConfig ? getClient() : null;

    scope.get('/:projectKey', async (request) => {
      const c = client || getClient();
      return new ProjectService(c).getProject(request.params.projectKey);
    });

    scope.get('/:projectKey/versions', async (request) => {
      const c = client || getClient();
      const { released } = request.query;
      const releasedOnly = released === undefined ? null : released === 'true';
      return new ProjectService(c).getProjectVersions(request.params.projectKey, releasedOnly);
    });

    scope.post('/:projectKey/versions', async (request) => {
      const c = client || getClient();
      const { name, description } = request.body;
      return new ProjectService(c).createVersion({
        projectKey: request.params.projectKey,
        versionName: name,
        description,
      });
    });
  }, { prefix: '/projects' });

  return server;
}


// ─── Start ────────────────────────────────────────────────────────────────────

async function start() {
  const server = await buildServer();

  try {
    await server.listen({ host: '0.0.0.0', port: PORT });
    log.info('server started', { host: '0.0.0.0', port: PORT });
    console.log(`\n  Jira API Example Server running at http://localhost:${PORT}`);
    console.log('  Endpoints:');
    console.log('    GET  /health');
    console.log('    GET  /config');
    console.log('    GET  /state');
    console.log('    GET  /users/search?query=...');
    console.log('    GET  /users/:identifier');
    console.log('    GET  /issues/:issueKey');
    console.log('    POST /issues');
    console.log('    GET  /issues/:issueKey/transitions');
    console.log('    POST /issues/:issueKey/transitions');
    console.log('    GET  /projects/:projectKey');
    console.log('    GET  /projects/:projectKey/versions');
    console.log('    POST /projects/:projectKey/versions\n');
  } catch (err) {
    log.error('server start failed', { error: err.message });
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async () => {
    log.info('shutting down');
    await server.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
