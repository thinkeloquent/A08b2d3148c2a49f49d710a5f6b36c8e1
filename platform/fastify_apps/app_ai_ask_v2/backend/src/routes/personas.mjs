import { createPersonaService } from '../services/persona.service.mjs';

export default async function personaRoutes(fastify, _options) {
  const service = createPersonaService(fastify.db);

  fastify.get('/personas', async (_request, reply) => {
    const personas = await service.list();
    return reply.send(personas);
  });

  fastify.get('/personas/:id', async (request, reply) => {
    const persona = await service.getById(request.params.id);
    return reply.send(persona);
  });

  fastify.post('/personas', async (request, reply) => {
    const persona = await service.create(request.body);
    return reply.status(201).send(persona);
  });

  fastify.put('/personas/:id', async (request, reply) => {
    const persona = await service.update(request.params.id, request.body);
    return reply.send(persona);
  });

  fastify.delete('/personas/:id', async (request, reply) => {
    await service.remove(request.params.id);
    return reply.status(204).send();
  });

  fastify.log.info('  ✓ Registered persona routes');
}
