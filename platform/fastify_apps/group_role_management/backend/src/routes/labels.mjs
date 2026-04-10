/**
 * Label Routes
 * CRUD endpoints for labels
 */

import { createLabelService } from '../services/label.service.mjs';

export default async function labelRoutes(fastify, _options) {
  const service = createLabelService(fastify.db);

  /**
   * List all labels with usage counts
   * GET /labels
   */
  fastify.get('/labels', async (request, reply) => {
    const labels = await service.list();
    return reply.send(labels);
  });

  /**
   * Create a new label
   * POST /labels
   */
  fastify.post('/labels', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'color'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 30 },
          color: { type: 'string', minLength: 1 },
          description: { type: 'string', maxLength: 100 },
          category: { type: 'string' },
          is_predefined: { type: 'boolean' },
          custom_created: { type: 'boolean' },
          created_by: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const label = await service.create(request.body);
      return reply.status(201).send(label);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'A label with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Update a label by name
   * PUT /labels/:name
   */
  fastify.put('/labels/:name', {
    schema: {
      params: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          color: { type: 'string' },
          description: { type: 'string', maxLength: 100 },
          category: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const label = await service.update(request.params.name, request.body);
    if (!label) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Label not found',
        statusCode: 404,
      });
    }
    return reply.send(label);
  });

  /**
   * Delete a label by name
   * DELETE /labels/:name
   */
  fastify.delete('/labels/:name', {
    schema: {
      params: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const result = await service.remove(request.params.name);

    if (!result.found) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Label not found',
        statusCode: 404,
      });
    }

    if (result.inUse) {
      return reply.status(409).send({
        error: 'IN_USE',
        message: `Cannot delete label — it is currently used by ${result.usageCount} role(s)`,
        statusCode: 409,
      });
    }

    return reply.status(204).send();
  });
}
