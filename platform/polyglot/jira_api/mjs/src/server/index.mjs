/**
 * @module server
 * @description Fastify server for JIRA API operations.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { getConfig, getServerConfig } from '../config.mjs';
import { JiraFetchClient } from '../client/JiraFetchClient.mjs';
import { UserService } from '../services/user-service.mjs';
import { IssueService } from '../services/issue-service.mjs';
import { ProjectService } from '../services/project-service.mjs';
import { createAuthHook } from './middleware/auth.mjs';
import { createErrorHandler } from './middleware/error-handler.mjs';
import { userRoutes } from './routes/users.mjs';
import { issueRoutes } from './routes/issues.mjs';
import { projectRoutes } from './routes/projects.mjs';
import { createLogger } from '../logger.mjs';

const log = createLogger('jira-api', import.meta.url);

/**
 * Create and configure the Fastify server.
 * @param {object} [overrides]
 * @returns {Promise<import('fastify').FastifyInstance>}
 */
export async function createServer(overrides = {}) {
  const serverConfig = getServerConfig();
  const server = Fastify({ logger: false });

  await server.register(cors, { origin: true });

  // Error handler
  server.setErrorHandler(createErrorHandler());

  // Auth hook
  const apiKey = overrides.apiKey ?? serverConfig.apiKey;
  server.addHook('preHandler', createAuthHook(apiKey));

  // Jira client
  const jiraConfig = getConfig();
  if (!jiraConfig) {
    log.warn('No JIRA configuration found. Server will require per-request credentials.');
  }

  /** @returns {JiraFetchClient} */
  function getClient() {
    const cfg = jiraConfig || getConfig();
    if (!cfg) throw new Error('JIRA configuration not found');
    return new JiraFetchClient({
      baseUrl: cfg.baseUrl,
      email: cfg.email,
      apiToken: cfg.apiToken,
    });
  }

  // Health check
  server.get('/health', async () => ({
    status: 'healthy',
    service: 'jira-api-server',
  }));

  // Register route groups
  const client = jiraConfig ? getClient() : null;

  await server.register(async (scope) => {
    const c = client || getClient();
    const userService = new UserService(c);
    await userRoutes(scope, { userService });
  }, { prefix: '/users' });

  await server.register(async (scope) => {
    const c = client || getClient();
    const issueService = new IssueService(c);
    await issueRoutes(scope, { issueService });
  }, { prefix: '/issues' });

  await server.register(async (scope) => {
    const c = client || getClient();
    const projectService = new ProjectService(c);
    await projectRoutes(scope, { projectService });
  }, { prefix: '/projects' });

  return server;
}

/**
 * Start the Fastify server.
 */
export async function startServer() {
  const serverConfig = getServerConfig();
  const server = await createServer();

  try {
    await server.listen({ host: serverConfig.host, port: serverConfig.port });
    log.info('server started', { host: serverConfig.host, port: serverConfig.port });
  } catch (err) {
    log.error('server start failed', { error: err.message });
    process.exit(1);
  }
}

export { createErrorHandler } from './middleware/error-handler.mjs';
