/**
 * Routes Aggregator
 * Registers all CRUD routes under the /api/rule-tree-table prefix
 */

import treeRoutes from './trees.routes.mjs';
import ruleRoutes from './rules.routes.mjs';

export default async function routes(fastify, _options) {
  // Register tree CRUD routes
  fastify.register(treeRoutes);

  // Register rule management routes
  fastify.register(ruleRoutes);

  fastify.log.info('  ✓ Registered CRUD routes for rule trees and rules');

  return Promise.resolve();
}

export { treeRoutes, ruleRoutes };
