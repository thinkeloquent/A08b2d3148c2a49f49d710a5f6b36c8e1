/**
 * Routes Aggregator
 * Registers all CRUD routes under the /api/code-repositories prefix
 */

import repositoryRoutes from './repositories.mjs';
import tagRoutes from './tags.mjs';
import metadataRoutes from './metadata.mjs';

export default async function routes(fastify, _options) {
  // Register repository routes (includes /repos/:repoId/metadata)
  fastify.register(repositoryRoutes);

  // Register tag routes
  fastify.register(tagRoutes);

  // Register standalone metadata routes (/metadata/:id)
  fastify.register(metadataRoutes);

  fastify.log.info('  ✓ Registered CRUD routes for repositories, tags, and metadata');

  return Promise.resolve();
}

export { repositoryRoutes, tagRoutes, metadataRoutes };
