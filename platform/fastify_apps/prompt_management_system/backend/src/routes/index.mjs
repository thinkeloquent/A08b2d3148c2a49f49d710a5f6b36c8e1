/**
 * Routes Aggregator
 * Registers all routes under /api/prompt-management-system prefix
 */

import projectRoutes from './projects.mjs';
import promptRoutes from './prompts.mjs';
import versionRoutes from './versions.mjs';
import deploymentRoutes from './deployments.mjs';

export default async function routes(fastify, _options) {
  fastify.register(projectRoutes);
  fastify.register(promptRoutes);
  fastify.register(versionRoutes);
  fastify.register(deploymentRoutes);

  fastify.log.info('  ✓ Registered CRUD routes for projects, prompts, versions, and deployments');

  return Promise.resolve();
}

export { projectRoutes, promptRoutes, versionRoutes, deploymentRoutes };
