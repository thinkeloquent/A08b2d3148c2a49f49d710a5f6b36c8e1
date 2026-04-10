/**
 * Routes Aggregator
 * Registers all routes under the /api/langgraph-flow prefix.
 */

import flowRoutes from './flows.routes.mjs';
import importExportRoutes from './import-export.routes.mjs';
import nodeRoutes from './nodes.routes.mjs';
import conditionRoutes from './conditions.routes.mjs';
import sessionRoutes from './sessions.routes.mjs';
import templateRoutes from './templates.routes.mjs';
import reviewRoutes from './review.routes.mjs';
import stringTemplateRoutes from './string-templates.routes.mjs';

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

  // Register workflow template routes
  fastify.register(templateRoutes);

  // Register review / staged-commit routes
  fastify.register(reviewRoutes);

  // Register string template routes
  fastify.register(stringTemplateRoutes);

  fastify.log.info('  ✓ Registered routes for flows, import/export, nodes, conditions, sessions, templates, review, and string-templates');

  return Promise.resolve();
}

export {
  flowRoutes,
  importExportRoutes,
  nodeRoutes,
  conditionRoutes,
  sessionRoutes,
  templateRoutes,
  reviewRoutes,
  stringTemplateRoutes,
};
