/**
 * Import/Export Routes
 * Endpoints for importing and exporting LangGraph flows.
 */

import { createFlowService } from '../services/flow.service.mjs';
import { createImportExportService } from '../services/import-export.service.mjs';
import { serializeFlow } from '../serializers/flow.serializer.mjs';

export default async function importExportRoutes(fastify, _options) {
  const flowService = createFlowService(fastify.db);
  const importExportService = createImportExportService(flowService);

  fastify.post('/flows/import', {
    schema: {
      description: 'Import a flow from a JSON string in a supported format',
      tags: ['Import/Export'],
      body: {
        type: 'object',
        required: ['json'],
        properties: {
          json: { type: 'string', description: 'JSON string of the flow to import' },
          format: { type: 'string', enum: ['native', 'flowise', 'langflow'], default: 'native', description: 'Source format of the JSON payload' },
        },
      },
    },
  }, async (request, reply) => {
    const { json, format = 'native' } = request.body;
    const flow = await importExportService.importFlow(json, format);
    return reply.status(201).send({ flow: serializeFlow(flow) });
  });

  fastify.get('/flows/:id/export', {
    schema: {
      description: 'Export a flow to a specified format',
      tags: ['Import/Export'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['native', 'flowise', 'langflow', 'mermaid'], default: 'native', description: 'Target export format' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const { format = 'native' } = request.query;
    const flowModel = await flowService.getFlow(id);
    if (!flowModel) {
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `Flow with id "${id}" not found` });
    }
    const serialized = serializeFlow(flowModel);
    const exported = importExportService.exportFlow(serialized, format);
    if (format === 'mermaid') {
      return reply.header('Content-Type', 'text/plain; charset=utf-8').send(exported);
    }
    return reply.send(exported);
  });
}
