/**
 * Review Routes
 * Endpoints for workflow review, validation, and the staged-commit workflow.
 */

import { createReviewService } from '../services/review.service.mjs';
import { serializeFlow } from '../serializers/flow.serializer.mjs';

export default async function reviewRoutes(fastify, _options) {
  const service = createReviewService(fastify.db);

  fastify.get('/flows/:flowId/review', {
    schema: {
      description: 'Review a workflow: returns validation results, node/edge/condition counts, and per-node stats',
      tags: ['Review'],
      params: {
        type: 'object',
        required: ['flowId'],
        properties: { flowId: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request, reply) => {
    const { flowId } = request.params;
    let review;
    try {
      review = await service.reviewWorkflow(flowId);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 404 ? 'NotFound' : 'InternalServerError',
        message: err.message,
      });
    }
    return reply.send({ review });
  });

  fastify.get('/flows/:flowId/preview', {
    schema: {
      description: 'Get a simplified preview of a workflow for visualization (node/edge/condition summary with layout hints)',
      tags: ['Review'],
      params: {
        type: 'object',
        required: ['flowId'],
        properties: { flowId: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request, reply) => {
    const { flowId } = request.params;
    let review;
    try {
      review = await service.reviewWorkflow(flowId);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 404 ? 'NotFound' : 'InternalServerError',
        message: err.message,
      });
    }

    const nodes = (review.nodes ?? []).map((n) => ({
      id: n.id,
      type: n.type || 'default',
      label: n.data?.label ?? n.id,
      category: n.data?.category ?? null,
      position: n.position ?? { x: 0, y: 0 },
    }));

    const edges = (review.edges ?? []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label ?? null,
      condition_id: e.condition_id ?? null,
    }));

    const conditions = (review.conditions ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      operator: c.operator,
      source_node: c.source_node ?? null,
      target_node: c.target_node ?? null,
    }));

    let layout = null;
    if (nodes.length > 0) {
      const xs = nodes.map((n) => n.position.x);
      const ys = nodes.map((n) => n.position.y);
      layout = {
        min_x: Math.min(...xs),
        min_y: Math.min(...ys),
        max_x: Math.max(...xs),
        max_y: Math.max(...ys),
      };
    }

    return reply.send({
      preview: {
        flow: review.flow,
        nodes,
        edges,
        conditions,
        layout,
        valid: review.valid,
      },
    });
  });

  fastify.post('/review/validate', {
    schema: {
      description: 'Validate flow_data without persisting it',
      tags: ['Review'],
      body: {
        type: 'object',
        required: ['flow_data'],
        properties: { flow_data: { type: 'object' } },
      },
    },
  }, async (request, reply) => {
    const { flow_data } = request.body;
    const result = service.validateWorkflow(flow_data);
    return reply.send(result);
  });

  fastify.post('/review/stage', {
    schema: {
      description: 'Stage a workflow for review. Returns a staging token and review data.',
      tags: ['Review'],
      body: {
        type: 'object',
        required: ['name', 'flow_data'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string' },
          flow_data: { type: 'object' },
          template_id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    let result;
    try {
      result = service.stageWorkflow(request.body);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 400 ? 'BadRequest' : 'InternalServerError',
        message: err.message,
      });
    }
    return reply.status(201).send(result);
  });

  fastify.post('/review/commit/:token', {
    schema: {
      description: 'Commit a staged workflow, creating a new Flow record',
      tags: ['Review'],
      params: {
        type: 'object',
        required: ['token'],
        properties: { token: { type: 'string', minLength: 1 } },
      },
    },
  }, async (request, reply) => {
    const { token } = request.params;
    let flow;
    try {
      flow = await service.commitStagedWorkflow(token);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 404 ? 'NotFound' : 'InternalServerError',
        message: err.message,
      });
    }
    return reply.status(201).send({ flow: serializeFlow(flow) });
  });

  fastify.delete('/review/stage/:token', {
    schema: {
      description: 'Discard a staged workflow',
      tags: ['Review'],
      params: {
        type: 'object',
        required: ['token'],
        properties: { token: { type: 'string', minLength: 1 } },
      },
    },
  }, async (request, reply) => {
    const { token } = request.params;
    const discarded = service.discardStagedWorkflow(token);
    if (!discarded) {
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `Staged workflow not found for token: ${token}` });
    }
    return reply.send({ success: true });
  });
}
