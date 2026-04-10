/**
 * Template Routes
 * Endpoints for workflow template management and flow creation from templates.
 */

import { createTemplateService } from '../services/template.service.mjs';
import { serializeTemplate, serializeTemplateList } from '../serializers/template.serializer.mjs';
import { serializeFlow } from '../serializers/flow.serializer.mjs';

export default async function templateRoutes(fastify, _options) {
  const service = createTemplateService(fastify.db);

  fastify.get('/templates', {
    schema: {
      description: 'List templates with optional category filter and pagination',
      tags: ['Templates'],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Exact category match' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  }, async (request, reply) => {
    const { category, page, limit } = request.query;
    const result = await service.listTemplates({ category, page, limit });
    return reply.send({
      templates: serializeTemplateList(result.templates),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        total_pages: Math.ceil(result.total / result.limit),
      },
    });
  });

  fastify.get('/templates/slug/:slug', {
    schema: {
      description: 'Get a template by slug',
      tags: ['Templates'],
      params: {
        type: 'object',
        required: ['slug'],
        properties: { slug: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { slug } = request.params;
    const template = await service.getTemplateBySlug(slug);
    if (!template) {
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `Template with slug "${slug}" not found` });
    }
    return reply.send({ template: serializeTemplate(template) });
  });

  fastify.get('/templates/:id', {
    schema: {
      description: 'Get a template by ID',
      tags: ['Templates'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const template = await service.getTemplate(id);
    if (!template) {
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `Template with id "${id}" not found` });
    }
    return reply.send({ template: serializeTemplate(template) });
  });

  fastify.post('/templates', {
    schema: {
      description: 'Create a new workflow template',
      tags: ['Templates'],
      body: {
        type: 'object',
        required: ['slug', 'name', 'template_data'],
        properties: {
          slug: { type: 'string', minLength: 1, maxLength: 255 },
          name: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string' },
          category: { type: 'string', default: 'general' },
          template_data: { type: 'object' },
          is_builtin: { type: 'boolean', default: false },
          sort_order: { type: 'integer', default: 0 },
        },
      },
    },
  }, async (request, reply) => {
    let template;
    try {
      template = await service.createTemplate(request.body);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 400 ? 'BadRequest' : err.statusCode === 409 ? 'Conflict' : 'InternalServerError',
        message: err.message,
      });
    }
    return reply.status(201).send({ template: serializeTemplate(template) });
  });

  fastify.put('/templates/:id', {
    schema: {
      description: 'Update an existing template. Builtin templates cannot be modified.',
      tags: ['Templates'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string' },
          category: { type: 'string' },
          template_data: { type: 'object' },
          sort_order: { type: 'integer' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    let template;
    try {
      template = await service.updateTemplate(id, request.body);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 403 ? 'Forbidden' : err.statusCode === 404 ? 'NotFound' : 'InternalServerError',
        message: err.message,
      });
    }
    if (!template) {
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `Template with id "${id}" not found` });
    }
    return reply.send({ template: serializeTemplate(template) });
  });

  fastify.delete('/templates/:id', {
    schema: {
      description: 'Delete a template. Builtin templates cannot be deleted.',
      tags: ['Templates'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    let deleted;
    try {
      deleted = await service.deleteTemplate(id);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 403 ? 'Forbidden' : 'InternalServerError',
        message: err.message,
      });
    }
    if (!deleted) {
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `Template with id "${id}" not found` });
    }
    return reply.send({ success: true });
  });

  fastify.post('/templates/:id/create-flow', {
    schema: {
      description: 'Create a new flow from a template',
      tags: ['Templates'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255, description: 'Override the template name' },
          description: { type: 'string', description: 'Override the template description' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    let flow;
    try {
      flow = await service.createFlowFromTemplate(id, request.body ?? {});
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 404 ? 'NotFound' : 'InternalServerError',
        message: err.message,
      });
    }
    return reply.status(201).send({ flow: serializeFlow(flow) });
  });
}
