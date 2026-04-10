/**
 * Prompt Routes
 */

import { createPromptService } from '../services/prompt.service.mjs';

export default async function promptRoutes(fastify, _options) {
  const service = createPromptService(fastify.db);

  fastify.get('/prompts', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          search: { type: 'string' },
          status: { type: 'string', enum: ['active', 'archived'] },
          project_id: { type: 'string', format: 'uuid' },
          sort: { type: 'string', enum: ['name', 'createdAt', 'updatedAt'] },
          order: { type: 'string', enum: ['asc', 'desc'] },
        },
      },
    },
  }, async (request, reply) => {
    const result = await service.list(request.query);
    return reply.send(result);
  });

  fastify.get('/prompts/:id', {
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
    },
  }, async (request, reply) => {
    const prompt = await service.getById(request.params.id);
    if (!prompt) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Prompt not found', statusCode: 404 });
    return reply.send(prompt);
  });

  fastify.post('/prompts', {
    schema: {
      body: {
        type: 'object',
        required: ['project_id', 'name'],
        properties: {
          project_id: { type: 'string', format: 'uuid' },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          created_by: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const prompt = await service.create(request.body);
      return reply.status(201).send(prompt);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const paths = error.errors?.map(e => e.path) || [];
        const field = paths.includes('name') ? 'name' : 'slug';
        return reply.status(409).send({ error: 'DUPLICATE', message: `A prompt with this ${field} already exists in this label`, statusCode: 409 });
      }
      throw error;
    }
  });

  fastify.put('/prompts/:id', {
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
      const prompt = await service.update(request.params.id, request.body);
      if (!prompt) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Prompt not found', statusCode: 404 });
      return reply.send(prompt);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const paths = error.errors?.map(e => e.path) || [];
        const field = paths.includes('name') ? 'name' : 'slug';
        return reply.status(409).send({ error: 'DUPLICATE', message: `A prompt with this ${field} already exists in this label`, statusCode: 409 });
      }
      throw error;
    }
  });

  fastify.delete('/prompts/:id', {
    schema: {
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      querystring: { type: 'object', properties: { permanent: { type: 'boolean', default: false } } },
    },
  }, async (request, reply) => {
    const success = await service.remove(request.params.id, request.query.permanent);
    if (!success) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Prompt not found', statusCode: 404 });
    return reply.status(204).send();
  });
}
