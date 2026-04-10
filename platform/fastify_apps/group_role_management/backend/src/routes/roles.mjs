/**
 * Role Routes
 * CRUD endpoints for roles
 */

import { createRoleService } from '../services/role.service.mjs';

export default async function roleRoutes(fastify, _options) {
  const service = createRoleService(fastify.db);

  /**
   * List roles with pagination and filters
   * GET /roles
   */
  fastify.get('/roles', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          search: { type: 'string' },
          status: { type: 'string', enum: ['active', 'archived'] },
          label: { type: 'string' },
          groups: { type: 'string', description: 'Comma-separated group IDs' },
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
   * Get role by ID
   * GET /roles/:id
   */
  fastify.get('/roles/:id', {
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
    const role = await service.getById(request.params.id);
    if (!role) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Role not found',
        statusCode: 404,
      });
    }
    return reply.send(role);
  });

  /**
   * Create a new role
   * POST /roles
   */
  fastify.post('/roles', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'description', 'icon'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 50 },
          description: { type: 'string', minLength: 10, maxLength: 200 },
          icon: { type: 'string', minLength: 1 },
          labels: { type: 'array', items: { type: 'string' }, maxItems: 10 },
          groups: { type: 'array', items: { type: 'string' }, minItems: 1 },
          actions: { type: 'array', items: { type: 'string' } },
          restrictions: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['active', 'archived'] },
          created_by: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const { labels = [], groups = [], actions = [], restrictions = [], ...roleData } = request.body;

    try {
      const role = await service.create(roleData, groups, labels, actions, restrictions);
      return reply.status(201).send(role);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'A role with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Update a role
   * PUT /roles/:id
   */
  fastify.put('/roles/:id', {
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
          name: { type: 'string', minLength: 3, maxLength: 50 },
          description: { type: 'string', minLength: 10, maxLength: 200 },
          icon: { type: 'string' },
          labels: { type: 'array', items: { type: 'string' }, maxItems: 10 },
          groups: { type: 'array', items: { type: 'string' }, minItems: 1 },
          actions: { type: 'array', items: { type: 'string' } },
          restrictions: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['active', 'archived'] },
          updated_by: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const { labels, groups, actions, restrictions, ...roleData } = request.body;

    try {
      const role = await service.update(
        request.params.id,
        roleData,
        groups !== undefined ? groups : null,
        labels !== undefined ? labels : null,
        actions !== undefined ? actions : null,
        restrictions !== undefined ? restrictions : null,
      );

      if (!role) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'Role not found',
          statusCode: 404,
        });
      }

      return reply.send(role);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'A role with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });

  /**
   * Delete a role
   * DELETE /roles/:id
   */
  fastify.delete('/roles/:id', {
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
        message: 'Role not found',
        statusCode: 404,
      });
    }

    return reply.status(204).send();
  });

  /**
   * Clone a role
   * POST /roles/:id/clone
   */
  fastify.post('/roles/:id/clone', {
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
          name: { type: 'string', minLength: 3, maxLength: 50 },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const role = await service.clone(request.params.id, request.body?.name);

      if (!role) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'Role not found',
          statusCode: 404,
        });
      }

      return reply.status(201).send(role);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({
          error: 'DUPLICATE_NAME',
          message: 'A role with this name already exists',
          statusCode: 409,
        });
      }
      throw error;
    }
  });
}
