/**
 * Tag Routes
 * CRUD endpoints for component tags
 */

import { createTagService } from '../services/tag.service.mjs';

export default async function tagRoutes(fastify, _options) {
  const service = createTagService(fastify.db);

  /**
   * List all tags
   * GET /tags
   */
  fastify.get('/tags', {
    schema: {
      description: 'List all tags',
      tags: ['Tags'],
    },
  }, async (request, reply) => {
    const tags = await service.list();
    return reply.send({ tags });
  });

  /**
   * Get tag by ID
   * GET /tags/:id
   */
  fastify.get('/tags/:id', {
    schema: {
      description: 'Get tag by ID',
      tags: ['Tags'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;

    const tag = await service.getById(id);

    if (!tag) {
      return reply.status(404).send({
        code: 404,
        message: 'Tag not found',
      });
    }

    return reply.send({ tag });
  });

  /**
   * Create a new tag
   * POST /tags
   */
  fastify.post('/tags', {
    schema: {
      description: 'Create a new tag',
      tags: ['Tags'],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1 },
          color: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const tag = await service.create(request.body);
      return reply.status(201).send({ tag });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          code: 409,
          message: 'Tag with this name already exists',
        });
      }
      throw error;
    }
  });

  /**
   * Update a tag
   * PUT /tags/:id
   */
  fastify.put('/tags/:id', {
    schema: {
      description: 'Update a tag',
      tags: ['Tags'],
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
          name: { type: 'string', minLength: 1 },
          color: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;

    try {
      const tag = await service.update(id, request.body);

      if (!tag) {
        return reply.status(404).send({
          code: 404,
          message: 'Tag not found',
        });
      }

      return reply.send({ tag });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          code: 409,
          message: 'Tag with this name already exists',
        });
      }
      throw error;
    }
  });

  /**
   * Delete a tag
   * DELETE /tags/:id
   */
  fastify.delete('/tags/:id', {
    schema: {
      description: 'Delete a tag',
      tags: ['Tags'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;

    const success = await service.remove(id);

    if (!success) {
      return reply.status(404).send({
        code: 404,
        message: 'Tag not found',
      });
    }

    return reply.send({ success: true });
  });
}
