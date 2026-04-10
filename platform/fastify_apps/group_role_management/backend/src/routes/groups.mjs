/**
 * Group Routes
 * CRUD endpoints for groups
 */

import { createGroupService } from '../services/group.service.mjs';

export default async function groupRoutes(fastify, _options) {
  const service = createGroupService(fastify.db);

  /**
   * List groups with pagination and filters
   * GET /groups
   */
  fastify.get('/groups', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          search: { type: 'string' },
          status: { type: 'string', enum: ['active', 'archived'] },
          sort: { type: 'string', enum: ['name', 'createdAt', 'updatedAt'] },
          order: { type: 'string', enum: ['asc', 'desc'] },
        },
      },
    },
  }, async (request, reply) => {
    const result = await service.list(request.query);
    return reply.send(result);
  });

  /**
   * Search groups (for autocomplete)
   * GET /groups/search
   */
  fastify.get('/groups/search', {
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
    const groups = await service.search(q, limit, exclude);
    return reply.send(groups);
  });

  /**
   * Get group by ID with assigned roles
   * GET /groups/:id
   */
  fastify.get('/groups/:id', {
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
    const result = await service.getById(request.params.id);
    if (!result) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Group not found',
        statusCode: 404,
      });
    }
    return reply.send(result);
  });

  /**
   * Create a new group
   * POST /groups
   */
  fastify.post('/groups', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'description'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50 },
          description: { type: 'string', minLength: 5, maxLength: 200 },
          actions: { type: 'array', items: { type: 'string' } },
          restrictions: { type: 'array', items: { type: 'string' } },
          created_by: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const { actions = [], restrictions = [], ...groupData } = request.body;
    try {
      const group = await service.create(groupData, actions, restrictions);
      return reply.status(201).send(group);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'A group with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Update a group
   * PUT /groups/:id
   */
  fastify.put('/groups/:id', {
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
          description: { type: 'string', minLength: 5, maxLength: 200 },
          actions: { type: 'array', items: { type: 'string' } },
          restrictions: { type: 'array', items: { type: 'string' } },
          updated_by: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const { actions, restrictions, ...groupData } = request.body;
    try {
      const group = await service.update(
        request.params.id,
        groupData,
        actions !== undefined ? actions : null,
        restrictions !== undefined ? restrictions : null,
      );
      if (!group) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'Group not found',
          statusCode: 404,
        });
      }
      return reply.send(group);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'A group with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Delete a group
   * DELETE /groups/:id
   */
  fastify.delete('/groups/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          permanent: { type: 'boolean', default: false },
          reassignTo: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const { permanent, reassignTo } = request.query;
    const success = await service.remove(request.params.id, { permanent, reassignTo });

    if (!success) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Group not found',
        statusCode: 404,
      });
    }

    return reply.status(204).send();
  });
}
