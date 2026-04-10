/**
 * Project Routes
 */

import { createProjectService } from '../services/project.service.mjs';

export default async function projectRoutes(fastify, _options) {
  const service = createProjectService(fastify.db);

  fastify.get('/projects', {
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

  fastify.get('/projects/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request, reply) => {
    const project = await service.getById(request.params.id);
    if (!project) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Project not found', statusCode: 404 });
    return reply.send(project);
  });

  fastify.post('/projects', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          created_by: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const project = await service.create(request.body);
      return reply.status(201).send(project);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({ error: 'DUPLICATE_NAME', message: 'A project with this name already exists', statusCode: 409 });
      }
      throw error;
    }
  });

  fastify.put('/projects/:id', {
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          status: { type: 'string', enum: ['active', 'archived'] },
          updated_by: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const project = await service.update(request.params.id, request.body);
      if (!project) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Project not found', statusCode: 404 });
      return reply.send(project);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({ error: 'DUPLICATE_NAME', message: 'A project with this name already exists', statusCode: 409 });
      }
      throw error;
    }
  });

  fastify.delete('/projects/:id', {
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      querystring: { type: 'object', properties: { permanent: { type: 'boolean', default: false } } },
    },
  }, async (request, reply) => {
    const success = await service.remove(request.params.id, request.query.permanent);
    if (!success) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Project not found', statusCode: 404 });
    return reply.status(204).send();
  });
}
