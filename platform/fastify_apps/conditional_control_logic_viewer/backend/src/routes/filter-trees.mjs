/**
 * Filter Tree Routes
 * CRUD endpoints for filter trees
 */

import { createFilterTreeService } from '../services/filter-tree.service.mjs';

export default async function filterTreeRoutes(fastify, _options) {
  const service = createFilterTreeService(fastify.db);

  /**
   * List filter trees with pagination and filters
   * GET /filter-trees
   */
  fastify.get('/filter-trees', {
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
   * Get filter tree by ID
   * GET /filter-trees/:id
   */
  fastify.get('/filter-trees/:id', {
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
    const tree = await service.getById(request.params.id);
    if (!tree) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Filter tree not found',
        statusCode: 404,
      });
    }
    return reply.send(tree);
  });

  /**
   * Create a new filter tree
   * POST /filter-trees
   */
  fastify.post('/filter-trees', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          tree_data: { type: 'object' },
          status: { type: 'string', enum: ['active', 'archived'] },
          created_by: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const tree = await service.create(request.body);
      return reply.status(201).send(tree);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'A filter tree with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Update a filter tree
   * PUT /filter-trees/:id
   */
  fastify.put('/filter-trees/:id', {
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
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          tree_data: { type: 'object' },
          status: { type: 'string', enum: ['active', 'archived'] },
          updated_by: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const tree = await service.update(request.params.id, request.body);

      if (!tree) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'Filter tree not found',
          statusCode: 404,
        });
      }

      return reply.send(tree);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'A filter tree with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Delete a filter tree
   * DELETE /filter-trees/:id
   */
  fastify.delete('/filter-trees/:id', {
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
        },
      },
    },
  }, async (request, reply) => {
    const success = await service.remove(request.params.id, request.query.permanent);

    if (!success) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Filter tree not found',
        statusCode: 404,
      });
    }

    return reply.status(204).send();
  });

  /**
   * Clone a filter tree
   * POST /filter-trees/:id/clone
   */
  fastify.post('/filter-trees/:id/clone', {
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
          name: { type: 'string', minLength: 1, maxLength: 100 },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const tree = await service.clone(request.params.id, request.body?.name);

      if (!tree) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'Filter tree not found',
          statusCode: 404,
        });
      }

      return reply.status(201).send(tree);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'A filter tree with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });
}
