/**
 * Routes Aggregator
 * Registers all CRUD routes under the /api/component-registry prefix
 */

import componentRoutes from './components.mjs';
import tagRoutes from './tags.mjs';
import categoryRoutes from './categories.mjs';

export default async function routes(fastify, _options) {
  fastify.register(componentRoutes);
  fastify.register(tagRoutes);
  fastify.register(categoryRoutes);

  fastify.log.info('  ✓ Registered CRUD routes for components, tags, and categories');

  return Promise.resolve();
}

export { componentRoutes, tagRoutes, categoryRoutes };
