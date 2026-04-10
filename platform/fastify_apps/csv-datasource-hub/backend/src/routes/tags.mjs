import { createTagService } from '../services/tag.service.mjs';

export default async function tagsRoutes(fastify, _options) {
  const tagService = createTagService(fastify.db);

  // LIST tags
  fastify.get('/', async (request, reply) => {
    const tags = await tagService.list();
    return reply.send(tags);
  });

  // CREATE tag
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          color: { type: 'string', maxLength: 7 },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const tag = await tagService.create(request.body);
      return reply.status(201).send(tag);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({ error: 'Conflict', message: `Tag "${request.body.name}" already exists`, statusCode: 409 });
      }
      throw error;
    }
  });
}
