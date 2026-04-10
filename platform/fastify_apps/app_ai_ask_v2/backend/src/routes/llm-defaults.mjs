import { createLLMDefaultService } from '../services/llm-default.service.mjs';

export default async function llmDefaultRoutes(fastify, _options) {
  const service = createLLMDefaultService(fastify.db);

  fastify.get('/llm-defaults', async (_request, reply) => {
    const defaults = await service.list();
    return reply.send(defaults);
  });

  fastify.get('/llm-defaults/category/:category', async (request, reply) => {
    const defaults = await service.getByCategory(request.params.category);
    return reply.send(defaults);
  });

  fastify.get('/llm-defaults/:id', async (request, reply) => {
    const item = await service.getById(request.params.id);
    return reply.send(item);
  });

  fastify.post('/llm-defaults', async (request, reply) => {
    const item = await service.create(request.body);
    return reply.status(201).send(item);
  });

  fastify.put('/llm-defaults/:id', async (request, reply) => {
    const item = await service.update(request.params.id, request.body);
    return reply.send(item);
  });

  fastify.delete('/llm-defaults/:id', async (request, reply) => {
    await service.remove(request.params.id);
    return reply.status(204).send();
  });

  fastify.log.info('  ✓ Registered LLM default routes');
}
