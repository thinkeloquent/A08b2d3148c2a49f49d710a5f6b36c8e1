/**
 * Routes Aggregator
 * Registers all CRUD routes under the /api/figma-files prefix
 */

import figmaFileRoutes from './figma-files.mjs';
import tagRoutes from './tags.mjs';
import metadataRoutes from './metadata.mjs';

export default async function routes(fastify, _options) {
  // Register Figma file routes (includes /files/:figmaFileId/metadata)
  fastify.register(figmaFileRoutes);

  // Register tag routes
  fastify.register(tagRoutes);

  // Register standalone metadata routes (/metadata/:id)
  fastify.register(metadataRoutes);

  fastify.log.info('  ✓ Registered CRUD routes for figma files, tags, and metadata');

  return Promise.resolve();
}

export { figmaFileRoutes, tagRoutes, metadataRoutes };
