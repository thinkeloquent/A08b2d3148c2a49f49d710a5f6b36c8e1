/**
 * Category Routes
 * CRUD endpoints for categories
 */

import { createCategoryService } from '../services/category.service.mjs';

export default async function categoryRoutes(fastify, _options) {
  const service = createCategoryService(fastify.db);

  /**
   * List all active categories with component counts
   * GET /categories
   */
  fastify.get('/categories', async (request, reply) => {
    const categories = await service.list();
    return reply.send(categories);
  });

  /**
   * Create a new category
   * POST /categories
   */
  fastify.post('/categories', {
    schema: {
      body: {
        type: 'object',
        required: ['slug', 'name'],
        properties: {
          slug: { type: 'string', minLength: 1, maxLength: 50 },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string' },
          icon: { type: 'string', maxLength: 50 },
          sort_order: { type: 'integer', minimum: 0 },
          is_active: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const category = await service.create(request.body);
      return reply.status(201).send(category);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_SLUG',
          message: 'A category with this slug already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Update a category
   * PUT /categories/:id
   */
  fastify.put('/categories/:id', {
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
          slug: { type: 'string', minLength: 1, maxLength: 50 },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string' },
          icon: { type: 'string', maxLength: 50 },
          sort_order: { type: 'integer', minimum: 0 },
          is_active: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const category = await service.update(request.params.id, request.body);
      if (!category) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'Category not found',
          statusCode: 404,
        });
      }
      return reply.send(category);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_SLUG',
          message: 'A category with this slug already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Delete a category
   * DELETE /categories/:id
   */
  fastify.delete('/categories/:id', {
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
        message: 'Category not found',
        statusCode: 404,
      });
    }

    if (result.inUse) {
      return reply.status(409).send({
        error: 'IN_USE',
        message: `Cannot delete category — it is currently used by ${result.usageCount} component(s)`,
        statusCode: 409,
      });
    }

    return reply.status(204).send();
  });
}
