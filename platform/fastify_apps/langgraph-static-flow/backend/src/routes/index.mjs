/**
 * Routes Aggregator
 * Registers all routes under the /api/langgraph-static-flow prefix.
 */

import flowRoutes from './flows.routes.mjs';
import importExportRoutes from './import-export.routes.mjs';
import nodeRoutes from './nodes.routes.mjs';
import conditionRoutes from './conditions.routes.mjs';
import sessionRoutes from './sessions.routes.mjs';
import reviewRoutes from './review.routes.mjs';
import stringTemplateRoutes from './string-templates.routes.mjs';
import kvRoutes from './kv.routes.mjs';

export default async function routes(fastify, _options) {
  // Register CRUD flow routes
  fastify.register(flowRoutes);

  // Register import/export routes
  fastify.register(importExportRoutes);

  // Register node CRUD routes (nested under /flows/:flowId/nodes)
  fastify.register(nodeRoutes);

  // Register condition CRUD routes (nested under /flows/:flowId/conditions)
  fastify.register(conditionRoutes);

  // Register session management routes
  fastify.register(sessionRoutes);

  // Register review / staged-commit routes
  fastify.register(reviewRoutes);

  // Register string template routes
  fastify.register(stringTemplateRoutes);

  // Register KV store routes
  fastify.register(kvRoutes);

  fastify.log.info('  ✓ Registered routes for flows, import/export, nodes, conditions, sessions, review, string-templates, and kv');

  return Promise.resolve();
}

export {
  flowRoutes,
  importExportRoutes,
  nodeRoutes,
  conditionRoutes,
  sessionRoutes,
  reviewRoutes,
  stringTemplateRoutes,
  kvRoutes,
};
