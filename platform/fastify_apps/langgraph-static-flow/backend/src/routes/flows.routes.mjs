/**
 * Flow Routes
 * CRUD endpoints for LangGraph flows and version management.
 */

import { createFlowService } from '../services/flow.service.mjs';
import {
  serializeFlow,
  serializeFlowList,
  serializeFlowVersion,
} from '../serializers/flow.serializer.mjs';

export default async function flowRoutes(fastify, _options) {
  const service = createFlowService(fastify.db);

  fastify.get('/flows', {
    schema: {
      description: 'List flows with optional name filter and pagination',
      tags: ['Flows'],
      querystring: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Partial name search (case-insensitive)' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  }, async (request, reply) => {
    const { name, page, limit } = request.query;
    const result = await service.listFlows({ name, page, limit });
    return reply.send({
      flows: serializeFlowList(result.flows),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        total_pages: Math.ceil(result.total / result.limit),
      },
    });
  });

  fastify.get('/flows/:id', {
    schema: {
      description: 'Get a single flow by ID',
      tags: ['Flows'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const flow = await service.getFlow(id);
    if (!flow) {
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `Flow with id "${id}" not found` });
    }
    return reply.send({ flow: serializeFlow(flow) });
  });

  fastify.post('/flows', {
    schema: {
      description: 'Create a new flow',
      tags: ['Flows'],
      body: {
        type: 'object',
        required: ['name', 'flow_data'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string' },
          viewport_x: { type: 'number', default: 0 },
          viewport_y: { type: 'number', default: 0 },
          viewport_zoom: { type: 'number', default: 1 },
          flow_data: { type: 'object' },
          source_format: { type: 'string', enum: ['native', 'flowise', 'langflow'], default: 'native' },
        },
      },
    },
  }, async (request, reply) => {
    const flow = await service.createFlow(request.body);
    return reply.status(201).send({ flow: serializeFlow(flow) });
  });

  fastify.put('/flows/:id', {
    schema: {
      description: 'Update an existing flow',
      tags: ['Flows'],
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
          viewport_x: { type: 'number' },
          viewport_y: { type: 'number' },
          viewport_zoom: { type: 'number' },
          flow_data: { type: 'object' },
          source_format: { type: 'string', enum: ['native', 'flowise', 'langflow'] },
          change_summary: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const flow = await service.updateFlow(id, request.body);
    if (!flow) {
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `Flow with id "${id}" not found` });
    }
    return reply.send({ flow: serializeFlow(flow) });
  });

  fastify.delete('/flows/:id', {
    schema: {
      description: 'Delete a flow',
      tags: ['Flows'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const deleted = await service.deleteFlow(id);
    if (!deleted) {
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `Flow with id "${id}" not found` });
    }
    return reply.send({ success: true });
  });

  fastify.get('/flows/:id/versions', {
    schema: {
      description: 'List version history for a flow',
      tags: ['Flows'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const flow = await service.getFlow(id);
    if (!flow) {
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `Flow with id "${id}" not found` });
    }
    const versions = await service.getVersions(id);
    return reply.send({ versions: versions.map(serializeFlowVersion) });
  });

  fastify.post('/flows/:id/restore/:versionId', {
    schema: {
      description: 'Restore a flow to a specific version',
      tags: ['Flows'],
      params: {
        type: 'object',
        required: ['id', 'versionId'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          versionId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const { id, versionId } = request.params;
    const flow = await service.restoreVersion(id, versionId);
    if (!flow) {
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `Flow "${id}" or version "${versionId}" not found` });
    }
    return reply.send({ flow: serializeFlow(flow) });
  });
}
