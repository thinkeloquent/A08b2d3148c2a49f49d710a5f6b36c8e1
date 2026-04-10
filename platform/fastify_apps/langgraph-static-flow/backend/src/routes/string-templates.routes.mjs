/**
 * String Template Routes
 * Endpoints for localized/contextualized string template management.
 */

import { createStringTemplateService } from '../services/string-template.service.mjs';
import { serializeStringTemplate, serializeStringTemplateList } from '../serializers/string-template.serializer.mjs';

export default async function stringTemplateRoutes(fastify, _options) {
  const service = createStringTemplateService(fastify.db);

  fastify.get('/string-templates', {
    schema: {
      description: 'List string templates with optional filters',
      tags: ['String Templates'],
      querystring: {
        type: 'object',
        properties: {
          flow_id: { type: 'string', format: 'uuid', description: 'Filter by flow ID' },
          locale: { type: 'string', description: 'Exact locale match (e.g. "en", "es")' },
          context: { type: 'string', description: 'Exact context match' },
          key_prefix: { type: 'string', description: 'Key starts-with filter' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  }, async (request, reply) => {
    const { flow_id, locale, context, key_prefix, page, limit } = request.query;
    const result = await service.listTemplates({ flow_id, locale, context, key_prefix, page, limit });
    return reply.send({
      templates: serializeStringTemplateList(result.templates),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        total_pages: Math.ceil(result.total / result.limit),
      },
    });
  });

  fastify.post('/string-templates/resolve', {
    schema: {
      description: 'Resolve a string template by key, substituting {placeholder} tokens',
      tags: ['String Templates'],
      body: {
        type: 'object',
        required: ['key'],
        properties: {
          key: { type: 'string', minLength: 1 },
          context: { type: 'object', description: 'Placeholder substitution values' },
          flow_id: { type: 'string', format: 'uuid', description: 'Flow scope to check first (falls back to global)' },
          locale: { type: 'string', default: 'en' },
        },
      },
    },
  }, async (request, reply) => {
    const { key, context = {}, flow_id, locale = 'en' } = request.body;
    const resolved = await service.resolveTemplate(key, context, flow_id, locale);
    return reply.send({ key, resolved });
  });

  fastify.post('/string-templates/bulk-upsert', {
    schema: {
      description: 'Bulk upsert string templates for a given flow in a single transaction',
      tags: ['String Templates'],
      body: {
        type: 'object',
        required: ['templates'],
        properties: {
          flow_id: { type: 'string', format: 'uuid', description: 'Flow scope (omit for global)' },
          templates: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['key', 'value'],
              properties: {
                key: { type: 'string', minLength: 1 },
                value: { type: 'string' },
                locale: { type: 'string', default: 'en' },
                context: { type: 'string', default: 'default' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { flow_id, templates } = request.body;
    let results;
    try {
      results = await service.bulkUpsert(templates, flow_id ?? null);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 400 ? 'BadRequest' : 'InternalServerError',
        message: err.message,
      });
    }
    return reply.send({ templates: serializeStringTemplateList(results) });
  });

  fastify.get('/string-templates/:id', {
    schema: {
      description: 'Get a string template by ID',
      tags: ['String Templates'],
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
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `String template with id "${id}" not found` });
    }
    return reply.send({ template: serializeStringTemplate(template) });
  });

  fastify.post('/string-templates', {
    schema: {
      description: 'Create a new string template',
      tags: ['String Templates'],
      body: {
        type: 'object',
        required: ['key', 'value'],
        properties: {
          flow_id: { type: 'string', format: 'uuid', description: 'Flow scope (omit for global)' },
          key: { type: 'string', minLength: 1 },
          value: { type: 'string' },
          locale: { type: 'string', default: 'en' },
          context: { type: 'string', default: 'default' },
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
        error: err.statusCode === 409 ? 'Conflict' : err.statusCode === 400 ? 'BadRequest' : 'InternalServerError',
        message: err.message,
      });
    }
    return reply.status(201).send({ template: serializeStringTemplate(template) });
  });

  fastify.put('/string-templates/:id', {
    schema: {
      description: 'Update a string template (value, locale, and/or context)',
      tags: ['String Templates'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      body: {
        type: 'object',
        properties: {
          value: { type: 'string' },
          locale: { type: 'string' },
          context: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const template = await service.updateTemplate(id, request.body);
    if (!template) {
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `String template with id "${id}" not found` });
    }
    return reply.send({ template: serializeStringTemplate(template) });
  });

  fastify.delete('/string-templates/:id', {
    schema: {
      description: 'Delete a string template',
      tags: ['String Templates'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const deleted = await service.deleteTemplate(id);
    if (!deleted) {
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `String template with id "${id}" not found` });
    }
    return reply.send({ success: true });
  });
}
