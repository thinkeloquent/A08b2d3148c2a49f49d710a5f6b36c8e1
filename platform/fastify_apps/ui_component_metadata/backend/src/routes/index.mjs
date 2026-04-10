/**
 * Routes Aggregator
 * Registers all CRUD routes under the /api/ui-component-metadata prefix
 */

import componentRoutes from './components.mjs';
import tagRoutes from './tags.mjs';

export default async function routes(fastify, _options) {
  // Register component routes
  fastify.register(componentRoutes);

  // Register tag routes
  fastify.register(tagRoutes);

  fastify.log.info('  ✓ Registered CRUD routes for components and tags');

  return Promise.resolve();
}

export { componentRoutes, tagRoutes };
