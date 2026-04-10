/**
 * Render Template Routes
 * Renders Edge.js templates with provided data context
 */

import { Edge } from 'edge.js';

const edge = Edge.create();

export default async function renderTemplateRoutes(fastify, _options) {
  fastify.post('/', {
    schema: {
      description: 'Render an Edge.js template with data',
      tags: ['RenderTemplate'],
      body: {
        type: 'object',
        required: ['template', 'data'],
        properties: {
          template: { type: 'string' },
          data: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const { template, data } = request.body;

    try {
      const rendered = await edge.renderRaw(template, data);
      return reply.send({ rendered });
    } catch (err) {
      fastify.log.error({ err }, 'Edge template render failed');
      return reply.status(400).send({
        error: 'TemplateRenderError',
        message: err.message || 'Failed to render template',
        statusCode: 400,
      });
    }
  });
}
