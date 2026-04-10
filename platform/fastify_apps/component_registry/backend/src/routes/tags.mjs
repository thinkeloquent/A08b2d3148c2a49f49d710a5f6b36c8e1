/**
 * Tag Routes
 * CRUD endpoints for tags
 */

import { createTagService } from '../services/tag.service.mjs';

export default async function tagRoutes(fastify, _options) {
  const service = createTagService(fastify.db);

  /**
   * List all tags with usage counts
   * GET /tags
   */
  fastify.get('/tags', async (request, reply) => {
    const tags = await service.list();
    return reply.send(tags);
  });

  /**
   * Search tags
   * GET /tags/search
   */
  fastify.get('/tags/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          excludeIds: { type: 'string', description: 'Comma-separated tag IDs to exclude' },
        },
      },
    },
  }, async (request, reply) => {
    const { q, limit, excludeIds } = request.query;
    const exclude = excludeIds ? excludeIds.split(',').map(id => id.trim()) : [];
    const tags = await service.search(q, limit, exclude);
    return reply.send(tags);
  });

  /**
   * Create a new tag
   * POST /tags
   */
  fastify.post('/tags', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 50 },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const tag = await service.create(request.body);
      return reply.status(201).send(tag);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'A tag with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Update a tag by ID
   * PUT /tags/:id
   */
  fastify.put('/tags/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 50 },
        },
      },
    },
  }, async (request, reply) => {
    const tag = await service.update(request.params.id, request.body);
    if (!tag) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Tag not found',
        statusCode: 404,
      });
    }
    return reply.send(tag);
  });

  /**
   * Delete a tag by ID
   * DELETE /tags/:id
   */
  fastify.delete('/tags/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const result = await service.remove(request.params.id);

    if (!result.found) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Tag not found',
        statusCode: 404,
      });
    }

    if (result.inUse) {
      return reply.status(409).send({
        error: 'IN_USE',
        message: `Cannot delete tag — it is currently used by ${result.usageCount} component(s)`,
        statusCode: 409,
      });
    }

    return reply.status(204).send();
  });
}
