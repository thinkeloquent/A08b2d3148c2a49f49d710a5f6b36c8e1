import { createDatasourceService } from '../services/datasource.service.mjs';

export default async function datasourcesRoutes(fastify, _options) {
  const datasourceService = createDatasourceService(fastify.db);

  // DISTINCT CATEGORIES
  fastify.get('/categories', async (_request, reply) => {
    const categories = await datasourceService.distinctCategories();
    return reply.send({ categories });
  });

  // LIST
  fastify.get('/', async (request, reply) => {
    const { page = 1, limit = 20, category, status, tagId, labelKey } = request.query;
    const result = await datasourceService.findAll({
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10) || 20, 100),
      category,
      status,
      tagId,
      labelKey,
    });
    return reply.send(result);
  });

  // GET by ID
  fastify.get('/:id', async (request, reply) => {
    const ds = await datasourceService.findById(request.params.id);
    if (!ds) {
      return reply.status(404).send({ error: 'NotFound', message: `Datasource not found: ${request.params.id}`, statusCode: 404 });
    }
    return reply.send(ds);
  });

  // CREATE
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string' },
          category: { type: 'string', maxLength: 255 },
          schema_contract: { type: 'object' },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const ds = await datasourceService.create(request.body);
    return reply.status(201).send(ds);
  });

  // UPDATE
  fastify.put('/:id', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string' },
          category: { type: 'string', maxLength: 255 },
          status: { type: 'string', enum: ['active', 'archived', 'deprecated'] },
          schema_contract: { type: 'object' },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const ds = await datasourceService.update(request.params.id, request.body);
    if (!ds) {
      return reply.status(404).send({ error: 'NotFound', message: `Datasource not found: ${request.params.id}`, statusCode: 404 });
    }
    return reply.send(ds);
  });

  // DELETE (hard delete)
  fastify.delete('/:id', async (request, reply) => {
    const result = await datasourceService.destroy(request.params.id);
    if (!result) {
      return reply.status(404).send({ error: 'NotFound', message: `Datasource not found: ${request.params.id}`, statusCode: 404 });
    }
    return reply.status(204).send();
  });

  // SET TAGS on datasource
  fastify.put('/:id/tags', {
    schema: {
      body: {
        type: 'object',
        required: ['tagIds'],
        properties: {
          tagIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
        },
      },
    },
  }, async (request, reply) => {
    const ds = await datasourceService.setTags(request.params.id, request.body.tagIds);
    if (!ds) {
      return reply.status(404).send({ error: 'NotFound', message: `Datasource not found: ${request.params.id}`, statusCode: 404 });
    }
    return reply.send(ds);
  });

  // SET LABELS
  fastify.put('/:id/labels', {
    schema: {
      body: {
        type: 'object',
        required: ['labels'],
        properties: {
          labels: {
            type: 'array',
            items: {
              type: 'object',
              required: ['key', 'value'],
              properties: {
                key: { type: 'string' },
                value: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const ds = await datasourceService.setLabels(request.params.id, request.body.labels);
    if (!ds) {
      return reply.status(404).send({ error: 'NotFound', message: `Datasource not found: ${request.params.id}`, statusCode: 404 });
    }
    return reply.send(ds);
  });
}
