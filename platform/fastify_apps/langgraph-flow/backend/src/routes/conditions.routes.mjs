/**
 * Condition Routes
 * CRUD endpoints for conditions within a flow's flow_data.conditions JSONB array.
 */

import { createConditionService } from '../services/condition.service.mjs';
import { serializeCondition, serializeConditionList } from '../serializers/condition.serializer.mjs';

export default async function conditionRoutes(fastify, _options) {
  const service = createConditionService(fastify.db);

  /**
   * List all conditions in a flow.
   * GET /flows/:flowId/conditions
   */
  fastify.get('/flows/:flowId/conditions', {
    schema: {
      description: 'List all conditions in a flow',
      tags: ['Conditions'],
      params: {
        type: 'object',
        required: ['flowId'],
        properties: {
          flowId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const { flowId } = request.params;

    let conditions;
    try {
      conditions = await service.listConditions(flowId);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 404 ? 'NotFound' : 'InternalServerError',
        message: err.message,
      });
    }

    return reply.send({ conditions: serializeConditionList(conditions) });
  });

  /**
   * Get a single condition within a flow.
   * GET /flows/:flowId/conditions/:conditionId
   */
  fastify.get('/flows/:flowId/conditions/:conditionId', {
    schema: {
      description: 'Get a single condition within a flow',
      tags: ['Conditions'],
      params: {
        type: 'object',
        required: ['flowId', 'conditionId'],
        properties: {
          flowId: { type: 'string', format: 'uuid' },
          conditionId: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { flowId, conditionId } = request.params;

    let condition;
    try {
      condition = await service.getCondition(flowId, conditionId);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 404 ? 'NotFound' : 'InternalServerError',
        message: err.message,
      });
    }

    return reply.send({ condition: serializeCondition(condition) });
  });

  /**
   * Add a condition to a flow.
   * POST /flows/:flowId/conditions
   */
  fastify.post('/flows/:flowId/conditions', {
    schema: {
      description: 'Add a condition to a flow',
      tags: ['Conditions'],
      params: {
        type: 'object',
        required: ['flowId'],
        properties: {
          flowId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', minLength: 1 },
          name: { type: 'string' },
          field: { type: 'string', default: '' },
          operator: {
            type: 'string',
            enum: ['gte', 'gt', 'lte', 'lt', 'eq', 'neq', 'includes', 'startsWith'],
            default: 'eq',
          },
          value: {},
          source_node: { type: 'string' },
          target_node: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { flowId } = request.params;

    let condition;
    try {
      condition = await service.addCondition(flowId, request.body);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 409 ? 'Conflict' : err.statusCode === 400 ? 'BadRequest' : err.statusCode === 404 ? 'NotFound' : 'InternalServerError',
        message: err.message,
      });
    }

    return reply.status(201).send({ condition: serializeCondition(condition) });
  });

  /**
   * Update a condition within a flow.
   * PUT /flows/:flowId/conditions/:conditionId
   */
  fastify.put('/flows/:flowId/conditions/:conditionId', {
    schema: {
      description: 'Update a condition within a flow',
      tags: ['Conditions'],
      params: {
        type: 'object',
        required: ['flowId', 'conditionId'],
        properties: {
          flowId: { type: 'string', format: 'uuid' },
          conditionId: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          field: { type: 'string' },
          operator: {
            type: 'string',
            enum: ['gte', 'gt', 'lte', 'lt', 'eq', 'neq', 'includes', 'startsWith'],
          },
          value: {},
          source_node: { type: 'string' },
          target_node: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { flowId, conditionId } = request.params;

    let condition;
    try {
      condition = await service.updateCondition(flowId, conditionId, request.body);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 404 ? 'NotFound' : err.statusCode === 400 ? 'BadRequest' : 'InternalServerError',
        message: err.message,
      });
    }

    return reply.send({ condition: serializeCondition(condition) });
  });

  /**
   * Delete a condition from a flow.
   * Clears condition_id on any edges that reference it.
   * DELETE /flows/:flowId/conditions/:conditionId
   */
  fastify.delete('/flows/:flowId/conditions/:conditionId', {
    schema: {
      description: 'Delete a condition from a flow. Clears condition_id on referencing edges.',
      tags: ['Conditions'],
      params: {
        type: 'object',
        required: ['flowId', 'conditionId'],
        properties: {
          flowId: { type: 'string', format: 'uuid' },
          conditionId: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { flowId, conditionId } = request.params;

    try {
      await service.deleteCondition(flowId, conditionId);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 404 ? 'NotFound' : 'InternalServerError',
        message: err.message,
      });
    }

    return reply.send({ success: true });
  });
}
