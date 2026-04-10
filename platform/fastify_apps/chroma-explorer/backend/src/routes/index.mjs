/**
 * Routes Aggregator
 * Registers all Chroma Explorer routes
 */

import chromaRoutes from './chroma.mjs';

export default async function routes(fastify, _options) {
  fastify.register(chromaRoutes);

  fastify.log.info('  ✓ Registered Chroma Explorer routes');

  return Promise.resolve();
}

export { chromaRoutes };
