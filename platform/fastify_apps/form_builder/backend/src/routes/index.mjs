/**
 * Routes Aggregator
 * Registers all CRUD routes under the /api/form-builder prefix
 */

import formRoutes from './forms.mjs';
import tagRoutes from './tags.mjs';

export default async function routes(fastify, _options) {
  // Register form routes (includes versions and import/export)
  fastify.register(formRoutes);

  // Register tag routes
  fastify.register(tagRoutes);

  fastify.log.info('  ✓ Registered CRUD routes for forms, versions, and tags');

  return Promise.resolve();
}

export { formRoutes, tagRoutes };
