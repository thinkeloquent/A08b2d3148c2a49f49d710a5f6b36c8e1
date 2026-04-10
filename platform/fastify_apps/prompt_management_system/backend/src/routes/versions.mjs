/**
 * Version Routes
 */

import { createVersionService } from '../services/version.service.mjs';

export default async function versionRoutes(fastify, _options) {
  const service = createVersionService(fastify.db);

  fastify.get('/prompts/:promptId/versions', {
    schema: {
      params: { type: 'object', required: ['promptId'], properties: { promptId: { type: 'string', format: 'uuid' } } },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
        },
      },
    },
  }, async (request, reply) => {
    const result = await service.listByPrompt(request.params.promptId, request.query);
    return reply.send(result);
  });

  fastify.get('/prompts/:promptId/versions/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['promptId', 'id'],
        properties: {
          promptId: { type: 'string', format: 'uuid' },
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const version = await service.getById(request.params.id);
    if (!version) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Version not found', statusCode: 404 });
    if (version.status === 'disabled') return reply.status(406).send({ error: 'NOT_ACCEPTABLE', message: 'This version is disabled', statusCode: 406 });
    return reply.send(version);
  });

  // Get version template as plain text (shareable with LLMs)
  fastify.get('/prompts/:promptId/versions/:id/text', {
    schema: {
      params: {
        type: 'object',
        required: ['promptId', 'id'],
        properties: {
          promptId: { type: 'string', format: 'uuid' },
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const version = await service.getById(request.params.id);
    if (!version) return reply.status(404).send('Version not found');
    if (version.status === 'disabled') return reply.status(406).send('This version is disabled');
    return reply.type('text/plain').send(version.template);
  });

  // Update version status
  fastify.patch('/prompts/:promptId/versions/:id/status', {
    schema: {
      params: {
        type: 'object',
        required: ['promptId', 'id'],
        properties: {
          promptId: { type: 'string', format: 'uuid' },
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['draft', 'published', 'archived', 'disabled'] },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const version = await service.updateStatus(request.params.id, request.body.status);
      if (!version) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Version not found', statusCode: 404 });
      return reply.send(version);
    } catch (error) {
      if (error.code === 'INVALID_STATUS_TRANSITION') {
        return reply.status(409).send({ error: 'INVALID_STATUS_TRANSITION', message: error.message, statusCode: 409 });
      }
      throw error;
    }
  });

  // Update version content (draft only)
  fastify.put('/prompts/:promptId/versions/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['promptId', 'id'],
        properties: {
          promptId: { type: 'string', format: 'uuid' },
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          template: { type: 'string', minLength: 1 },
          config: { type: 'object' },
          input_schema: { type: 'object' },
          commit_message: { type: 'string', maxLength: 500 },
          status: { type: 'string', enum: ['draft', 'published'] },
          variables: {
            type: 'array',
            items: {
              type: 'object',
              required: ['key', 'type'],
              properties: {
                key: { type: 'string' },
                type: { type: 'string', enum: ['string', 'number', 'boolean', 'array', 'object'] },
                description: { type: 'string' },
                default_value: { type: 'string' },
                required: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const version = await service.update(request.params.id, request.body);
      if (!version) return reply.status(404).send({ error: 'NOT_FOUND', message: 'Version not found', statusCode: 404 });
      return reply.send(version);
    } catch (error) {
      if (error.code === 'VERSION_NOT_EDITABLE') {
        return reply.status(409).send({ error: 'VERSION_NOT_EDITABLE', message: error.message, statusCode: 409 });
      }
      if (error.code === 'INVALID_STATUS_TRANSITION') {
        return reply.status(409).send({ error: 'INVALID_STATUS_TRANSITION', message: error.message, statusCode: 409 });
      }
      throw error;
    }
  });

  fastify.post('/prompts/:promptId/versions', {
    schema: {
      params: { type: 'object', required: ['promptId'], properties: { promptId: { type: 'string', format: 'uuid' } } },
      body: {
        type: 'object',
        required: ['template'],
        properties: {
          template: { type: 'string', minLength: 1 },
          config: { type: 'object' },
          input_schema: { type: 'object' },
          commit_message: { type: 'string', maxLength: 500 },
          status: { type: 'string', enum: ['draft', 'published'] },
          created_by: { type: 'string' },
          variables: {
            type: 'array',
            items: {
              type: 'object',
              required: ['key', 'type'],
              properties: {
                key: { type: 'string' },
                type: { type: 'string', enum: ['string', 'number', 'boolean', 'array', 'object'] },
                description: { type: 'string' },
                default_value: { type: 'string' },
                required: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const version = await service.create(request.params.promptId, request.body);
    return reply.status(201).send(version);
  });
}
