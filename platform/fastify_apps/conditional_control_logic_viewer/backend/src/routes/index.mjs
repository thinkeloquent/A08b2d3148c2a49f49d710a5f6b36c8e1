/**
 * Route Aggregator
 * Registers all route modules
 */

import filterTreeRoutes from './filter-trees.mjs';
import dropdownOptionRoutes from './dropdown-options.mjs';

export default async function routes(fastify, _options) {
  await fastify.register(filterTreeRoutes);
  await fastify.register(dropdownOptionRoutes);

  return Promise.resolve();
}
