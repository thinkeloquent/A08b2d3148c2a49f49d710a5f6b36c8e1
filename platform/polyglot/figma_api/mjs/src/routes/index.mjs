/**
 * Route Registration — Figma API SDK
 *
 * Registers all Figma API routes on the Fastify server.
 */

import { ProjectsClient } from '../sdk/projects/index.mjs';
import { FilesClient } from '../sdk/files/index.mjs';
import { CommentsClient } from '../sdk/comments/index.mjs';
import { ComponentsClient } from '../sdk/components/index.mjs';
import { VariablesClient } from '../sdk/variables/index.mjs';
import { DevResourcesClient } from '../sdk/dev-resources/index.mjs';
import { LibraryAnalyticsClient } from '../sdk/library-analytics/index.mjs';
import { WebhooksClient } from '../sdk/webhooks/index.mjs';

import healthRoutes from './health.mjs';
import projectsRoutes from './projects.mjs';
import filesRoutes from './files.mjs';
import commentsRoutes from './comments.mjs';
import componentsRoutes from './components.mjs';
import variablesRoutes from './variables.mjs';
import devResourcesRoutes from './dev-resources.mjs';
import libraryAnalyticsRoutes from './library-analytics.mjs';
import webhooksRoutes from './webhooks.mjs';

export async function registerRoutes(server, client) {
  const projectsClient = new ProjectsClient(client);
  const filesClient = new FilesClient(client);
  const commentsClient = new CommentsClient(client);
  const componentsClient = new ComponentsClient(client);
  const variablesClient = new VariablesClient(client);
  const devResourcesClient = new DevResourcesClient(client);
  const libraryAnalyticsClient = new LibraryAnalyticsClient(client);
  const webhooksClient = new WebhooksClient(client);

  // Health routes (no prefix, no auth)
  await server.register(healthRoutes);

  // v1 API routes
  await server.register(async (v1) => {
    await v1.register(projectsRoutes, { projectsClient });
    await v1.register(filesRoutes, { filesClient });
    await v1.register(commentsRoutes, { commentsClient });
    await v1.register(componentsRoutes, { componentsClient });
    await v1.register(variablesRoutes, { variablesClient });
    await v1.register(devResourcesRoutes, { devResourcesClient });
    await v1.register(libraryAnalyticsRoutes, { libraryAnalyticsClient });
  }, { prefix: '/v1' });

  // v2 API routes (webhooks)
  await server.register(async (v2) => {
    await v2.register(webhooksRoutes, { webhooksClient });
  }, { prefix: '/v2' });
}
