/**
 * Restriction Routes
 * CRUD endpoints for restrictions
 */

import { createRestrictionService } from '../services/restriction.service.mjs';

export default async function restrictionRoutes(fastify, _options) {
  const service = createRestrictionService(fastify.db);

  /**
   * List all restrictions with usage counts
   * GET /restrictions
   */
  fastify.get('/restrictions', async (request, reply) => {
    const restrictions = await service.list();
    return reply.send(restrictions);
  });

  /**
   * Search restrictions (for autocomplete)
   * GET /restrictions/search
   */
  fastify.get('/restrictions/search', {
    schema: {
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string', minLength: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          excludeIds: { type: 'string', description: 'Comma-separated IDs to exclude' },
        },
      },
    },
  }, async (request, reply) => {
    const { q, limit, excludeIds } = request.query;
    const exclude = excludeIds ? excludeIds.split(',').map(id => id.trim()) : [];
    const restrictions = await service.search(q, limit, exclude);
    return reply.send(restrictions);
  });

  /**
   * Create a new restriction
   * POST /restrictions
   */
  fastify.post('/restrictions', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50 },
          description: { type: 'string', maxLength: 200 },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const restriction = await service.create(request.body);
      return reply.status(201).send(restriction);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'A restriction with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Update a restriction by ID
   * PUT /restrictions/:id
   */
  fastify.put('/restrictions/:id', {
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
          name: { type: 'string', minLength: 2, maxLength: 50 },
          description: { type: 'string', maxLength: 200 },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const restriction = await service.update(request.params.id, request.body);
      if (!restriction) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'Restriction not found',
          statusCode: 404,
        });
      }
      return reply.send(restriction);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'A restriction with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Delete a restriction by ID
   * DELETE /restrictions/:id
   */
  fastify.delete('/restrictions/:id', {
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
        message: 'Restriction not found',
        statusCode: 404,
      });
    }

    if (result.inUse) {
      return reply.status(409).send({
        error: 'IN_USE',
        message: `Cannot delete restriction — it is currently used by ${result.roleCount} role(s) and ${result.groupCount} group(s)`,
        statusCode: 409,
      });
    }

    return reply.status(204).send();
  });
}
