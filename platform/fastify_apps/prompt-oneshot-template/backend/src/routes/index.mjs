/**
 * Routes Index
 * Aggregates all route modules for the prompt-oneshot-template app
 */

import templateRoutes from './templates.mjs';

export default async function routes(fastify, _options) {
  await fastify.register(templateRoutes);
  return Promise.resolve();
}
