import personaRoutes from './personas.mjs';
import llmDefaultRoutes from './llm-defaults.mjs';

export default async function routes(fastify, _options) {
  fastify.register(personaRoutes);
  fastify.register(llmDefaultRoutes);
  fastify.log.info('  ✓ Registered CRUD routes for personas and LLM defaults');
  return Promise.resolve();
}

export { personaRoutes, llmDefaultRoutes };
