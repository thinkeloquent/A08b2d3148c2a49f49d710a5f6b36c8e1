/**
 * Component Routes
 * CRUD endpoints for components
 */

import { createComponentService } from '../services/component.service.mjs';

export default async function componentRoutes(fastify, _options) {
  const service = createComponentService(fastify.db);

  /**
   * List components with pagination and filters
   * GET /components
   */
  fastify.get('/components', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          search: { type: 'string' },
          status: { type: 'string', enum: ['stable', 'beta', 'alpha', 'deprecated'] },
          category: { type: 'string' },
          author: { type: 'string' },
          sort: { type: 'string', enum: ['name', 'downloads', 'stars', 'version', 'createdAt', 'updatedAt'] },
          order: { type: 'string', enum: ['asc', 'desc'] },
        },
      },
    },
  }, async (request, reply) => {
    const result = await service.list(request.query);
    return reply.send(result);
  });

  /**
   * Get component stats
   * GET /components/stats
   */
  fastify.get('/components/stats', async (request, reply) => {
    const stats = await service.getStats();
    return reply.send(stats);
  });

  /**
   * Get unique authors
   * GET /components/authors
   */
  fastify.get('/components/authors', async (request, reply) => {
    const authors = await service.getAuthors();
    return reply.send(authors);
  });

  /**
   * Get component by ID
   * GET /components/:id
   */
  fastify.get('/components/:id', {
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
    const component = await service.getById(request.params.id);
    if (!component) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Component not found',
        statusCode: 404,
      });
    }
    return reply.send(component);
  });

  /**
   * Create a new component
   * POST /components
   */
  fastify.post('/components', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'category', 'author'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          category: { type: 'string' },
          version: { type: 'string', maxLength: 20 },
          author: { type: 'string', minLength: 1, maxLength: 100 },
          downloads: { type: 'integer', minimum: 0 },
          stars: { type: 'integer', minimum: 0 },
          status: { type: 'string', enum: ['stable', 'beta', 'alpha', 'deprecated'] },
          description: { type: 'string' },
          branch: { type: 'string', maxLength: 255 },
          release: { type: 'string', maxLength: 100 },
          repoLink: { type: 'string', maxLength: 500 },
          shaCommit: { type: 'string', maxLength: 64 },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  }, async (request, reply) => {
    const { tags = [], ...componentData } = request.body;

    try {
      const component = await service.create(componentData, tags);
      return reply.status(201).send(component);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'A component with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Update a component
   * PUT /components/:id
   */
  fastify.put('/components/:id', {
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
          category: { type: 'string' },
          version: { type: 'string', maxLength: 20 },
          author: { type: 'string', minLength: 1, maxLength: 100 },
          downloads: { type: 'integer', minimum: 0 },
          stars: { type: 'integer', minimum: 0 },
          status: { type: 'string', enum: ['stable', 'beta', 'alpha', 'deprecated'] },
          description: { type: 'string' },
          branch: { type: 'string', maxLength: 255 },
          release: { type: 'string', maxLength: 100 },
          repoLink: { type: 'string', maxLength: 500 },
          shaCommit: { type: 'string', maxLength: 64 },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  }, async (request, reply) => {
    const { tags, ...componentData } = request.body;

    try {
      const component = await service.update(
        request.params.id,
        componentData,
        tags !== undefined ? tags : null,
      );

      if (!component) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'Component not found',
          statusCode: 404,
        });
      }

      return reply.send(component);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'A component with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Delete a component
   * DELETE /components/:id
   */
  fastify.delete('/components/:id', {
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
        message: 'Component not found',
        statusCode: 404,
      });
    }

    return reply.status(204).send();
  });
}
