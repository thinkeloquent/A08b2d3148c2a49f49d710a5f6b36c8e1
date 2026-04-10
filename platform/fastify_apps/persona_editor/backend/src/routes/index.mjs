/**
 * Routes Aggregator
 * Registers all CRUD routes under the API prefix
 */

import personasRoutes from './personas.mjs';
import llmDefaultsRoutes from './llm-defaults.mjs';
import presetsRoutes from './presets.mjs';
import healthRoutes from './health.mjs';
import auditLogsRoutes from './audit-logs.mjs';
import suggestRoutes from './suggest.mjs';
import renderTemplateRoutes from './render-template.mjs';

export default async function routes(fastify, _options) {
  // Register persona routes
  fastify.register(personasRoutes, { prefix: '/personas' });

  // Register LLM defaults routes
  fastify.register(llmDefaultsRoutes, { prefix: '/llm-defaults' });

  // Register preset template routes
  fastify.register(presetsRoutes, { prefix: '/presets' });

  // Register health routes
  fastify.register(healthRoutes, { prefix: '/health' });

  // Register audit logs routes
  fastify.register(auditLogsRoutes, { prefix: '/audit-logs' });

  // Register AI suggestion routes
  fastify.register(suggestRoutes, { prefix: '/suggest' });

  // Register template rendering routes
  fastify.register(renderTemplateRoutes, { prefix: '/render-template' });

  fastify.log.info('  ✓ Registered CRUD routes for personas, llm-defaults, presets, audit-logs, suggest, render-template, and health');

  return Promise.resolve();
}

export { personasRoutes, llmDefaultsRoutes, presetsRoutes, healthRoutes, auditLogsRoutes, suggestRoutes, renderTemplateRoutes };
