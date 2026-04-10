/**
 * Action Routes
 * CRUD endpoints for actions
 */

import { createActionService } from '../services/action.service.mjs';

export default async function actionRoutes(fastify, _options) {
  const service = createActionService(fastify.db);

  /**
   * List all actions with usage counts
   * GET /actions
   */
  fastify.get('/actions', async (request, reply) => {
    const actions = await service.list();
    return reply.send(actions);
  });

  /**
   * Search actions (for autocomplete)
   * GET /actions/search
   */
  fastify.get('/actions/search', {
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
    const actions = await service.search(q, limit, exclude);
    return reply.send(actions);
  });

  /**
   * Create a new action
   * POST /actions
   */
  fastify.post('/actions', {
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
      const action = await service.create(request.body);
      return reply.status(201).send(action);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'An action with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Update an action by ID
   * PUT /actions/:id
   */
  fastify.put('/actions/:id', {
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
      const action = await service.update(request.params.id, request.body);
      if (!action) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'Action not found',
          statusCode: 404,
        });
      }
      return reply.send(action);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'An action with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Delete an action by ID
   * DELETE /actions/:id
   */
  fastify.delete('/actions/:id', {
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
        message: 'Action not found',
        statusCode: 404,
      });
    }

    if (result.inUse) {
      return reply.status(409).send({
        error: 'IN_USE',
        message: `Cannot delete action — it is currently used by ${result.roleCount} role(s) and ${result.groupCount} group(s)`,
        statusCode: 409,
      });
    }

    return reply.status(204).send();
  });
}
