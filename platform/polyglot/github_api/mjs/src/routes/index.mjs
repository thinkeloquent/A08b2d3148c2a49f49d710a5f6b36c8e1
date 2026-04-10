/**
 * Route registration module.
 * Creates domain SDK clients and registers all route plugins under the /api/github prefix.
 * @module routes
 */

import { ReposClient } from '../sdk/repos/client.mjs';
import { BranchesClient } from '../sdk/branches/client.mjs';
import { CollaboratorsClient } from '../sdk/collaborators/client.mjs';
import { TagsClient } from '../sdk/tags/client.mjs';
import { WebhooksClient } from '../sdk/webhooks/client.mjs';
import { SecurityClient } from '../sdk/security/client.mjs';
import { ActionsClient } from '../sdk/actions/client.mjs';

import healthRoutes from './health.mjs';
import repoRoutes from './repos.mjs';
import branchRoutes from './branches.mjs';
import collaboratorRoutes from './collaborators.mjs';
import tagRoutes from './tags.mjs';
import webhookRoutes from './webhooks.mjs';
import securityRoutes from './security.mjs';
import actionRoutes from './actions.mjs';

/**
 * Register all GitHub API routes on a Fastify server instance.
 * Creates domain-specific SDK clients from the base GitHubClient and registers
 * each route module under the /api/github prefix.
 *
 * @param {import('fastify').FastifyInstance} server - Fastify server instance
 * @param {import('../sdk/client.mjs').GitHubClient} client - Base GitHub HTTP client
 */
export async function registerRoutes(server, client) {
  const repos = new ReposClient(client);
  const branches = new BranchesClient(client);
  const collaborators = new CollaboratorsClient(client);
  const tags = new TagsClient(client);
  const webhooks = new WebhooksClient(client);
  const security = new SecurityClient(client);
  const actions = new ActionsClient(client);

  // Register health routes at the top level (not under /api/github)
  await server.register(healthRoutes, { client });

  // Register all domain routes under /api/github prefix
  await server.register(
    async function apiRoutes(api) {
      await api.register(repoRoutes, { repos });
      await api.register(branchRoutes, { branches });
      await api.register(collaboratorRoutes, { collaborators });
      await api.register(tagRoutes, { tags });
      await api.register(webhookRoutes, { webhooks });
      await api.register(securityRoutes, { security });
      await api.register(actionRoutes, { actions });
    },
    { prefix: '/api/github' },
  );
}
