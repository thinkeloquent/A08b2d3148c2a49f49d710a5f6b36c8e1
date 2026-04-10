/**
 * Dropdown Option Routes
 * CRUD endpoints for dropdown options
 */

import { createDropdownOptionService } from '../services/dropdown-option.service.mjs';

export default async function dropdownOptionRoutes(fastify, _options) {
  const service = createDropdownOptionService(fastify.db);

  /**
   * List dropdown options
   * GET /dropdown-options
   */
  fastify.get('/dropdown-options', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string' },
          category: { type: 'string' },
          status: { type: 'string', enum: ['active', 'archived'] },
        },
      },
    },
  }, async (request, reply) => {
    const result = await service.list(request.query);
    return reply.send(result);
  });

  /**
   * Get dropdown option by ID
   * GET /dropdown-options/:id
   */
  fastify.get('/dropdown-options/:id', {
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
    const option = await service.getById(request.params.id);
    if (!option) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Dropdown option not found',
        statusCode: 404,
      });
    }
    return reply.send(option);
  });

  /**
   * Create a new dropdown option
   * POST /dropdown-options
   */
  fastify.post('/dropdown-options', {
    schema: {
      body: {
        type: 'object',
        required: ['value', 'label'],
        properties: {
          value: { type: 'string', minLength: 1, maxLength: 200 },
          label: { type: 'string', minLength: 1, maxLength: 200 },
          category: { type: 'string', maxLength: 100 },
          sort_order: { type: 'integer', default: 0 },
          status: { type: 'string', enum: ['active', 'archived'] },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const option = await service.create(request.body);
      return reply.status(201).send(option);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_VALUE',
          message: 'A dropdown option with this value already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Update a dropdown option
   * PUT /dropdown-options/:id
   */
  fastify.put('/dropdown-options/:id', {
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
          value: { type: 'string', minLength: 1, maxLength: 200 },
          label: { type: 'string', minLength: 1, maxLength: 200 },
          category: { type: 'string', maxLength: 100 },
          sort_order: { type: 'integer' },
          status: { type: 'string', enum: ['active', 'archived'] },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const option = await service.update(request.params.id, request.body);
      if (!option) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'Dropdown option not found',
          statusCode: 404,
        });
      }
      return reply.send(option);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_VALUE',
          message: 'A dropdown option with this value already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Delete a dropdown option
   * DELETE /dropdown-options/:id
   */
  fastify.delete('/dropdown-options/:id', {
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
    const success = await service.remove(request.params.id);
    if (!success) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Dropdown option not found',
        statusCode: 404,
      });
    }
    return reply.status(204).send();
  });
}
