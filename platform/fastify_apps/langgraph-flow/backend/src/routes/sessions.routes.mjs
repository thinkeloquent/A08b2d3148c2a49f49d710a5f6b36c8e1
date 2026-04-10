/**
 * Session Routes
 * Endpoints for workflow session management, checkpoints, and stage history.
 */

import { createSessionService } from '../services/session.service.mjs';
import { serializeSession, serializeSessionList } from '../serializers/session.serializer.mjs';

export default async function sessionRoutes(fastify, _options) {
  const service = createSessionService(fastify.db);

  /**
   * List sessions with optional flow_id and status filters.
   * GET /sessions
   */
  fastify.get('/sessions', {
    schema: {
      description: 'List sessions with optional flow_id and status filters',
      tags: ['Sessions'],
      querystring: {
        type: 'object',
        properties: {
          flow_id: { type: 'string', format: 'uuid', description: 'Filter by flow ID' },
          status: {
            type: 'string',
            enum: ['active', 'completed', 'failed'],
            description: 'Filter by session status',
          },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  }, async (request, reply) => {
    const { flow_id, status, page, limit } = request.query;
    const result = await service.listSessions({ flowId: flow_id, status, page, limit });

    return reply.send({
      sessions: serializeSessionList(result.sessions),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        total_pages: Math.ceil(result.total / result.limit),
      },
    });
  });

  /**
   * Get the current active session for a flow.
   * NOTE: This route must be declared before GET /sessions/:id to avoid
   * "current" being matched as a UUID param.
   * GET /sessions/current/:flowId
   */
  fastify.get('/sessions/current/:flowId', {
    schema: {
      description: 'Get the current active session for a flow',
      tags: ['Sessions'],
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
    const session = await service.getCurrentSession(flowId);

    if (!session) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'NotFound',
        message: `No active session found for flow "${flowId}"`,
      });
    }

    return reply.send({ session: serializeSession(session) });
  });

  /**
   * Get session history (completed and failed) for a flow.
   * NOTE: Declared before GET /sessions/:id for the same reason as above.
   * GET /sessions/history/:flowId
   */
  fastify.get('/sessions/history/:flowId', {
    schema: {
      description: 'Get session history (completed and failed) for a flow',
      tags: ['Sessions'],
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
    const sessions = await service.getSessionHistory(flowId);
    return reply.send({ sessions: serializeSessionList(sessions) });
  });

  /**
   * Get a single session by ID.
   * GET /sessions/:id
   */
  fastify.get('/sessions/:id', {
    schema: {
      description: 'Get a single session by ID',
      tags: ['Sessions'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const session = await service.getSession(id);

    if (!session) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'NotFound',
        message: `Session with id "${id}" not found`,
      });
    }

    return reply.send({ session: serializeSession(session) });
  });

  /**
   * Create a new workflow session.
   * POST /sessions
   */
  fastify.post('/sessions', {
    schema: {
      description: 'Create a new workflow session',
      tags: ['Sessions'],
      body: {
        type: 'object',
        required: ['flow_id', 'thread_id'],
        properties: {
          flow_id: { type: 'string', format: 'uuid' },
          thread_id: { type: 'string', minLength: 1 },
          topic: { type: 'string' },
          max_iterations: { type: 'integer', minimum: 1, default: 10 },
        },
      },
    },
  }, async (request, reply) => {
    let session;
    try {
      session = await service.createSession(request.body);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 400 ? 'BadRequest' : 'InternalServerError',
        message: err.message,
      });
    }

    return reply.status(201).send({ session: serializeSession(session) });
  });

  /**
   * Update a session (status, iterations, current_stage, etc.).
   * PUT /sessions/:id
   */
  fastify.put('/sessions/:id', {
    schema: {
      description: 'Update mutable fields on a session',
      tags: ['Sessions'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'completed', 'failed'] },
          iterations: { type: 'integer', minimum: 0 },
          current_stage: { type: 'string' },
          stage_history: { type: 'array', items: { type: 'object' } },
          checkpoints: { type: 'array', items: { type: 'object' } },
          session_data: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const session = await service.updateSession(id, request.body);

    if (!session) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'NotFound',
        message: `Session with id "${id}" not found`,
      });
    }

    return reply.send({ session: serializeSession(session) });
  });

  /**
   * Delete a session.
   * DELETE /sessions/:id
   */
  fastify.delete('/sessions/:id', {
    schema: {
      description: 'Delete a session',
      tags: ['Sessions'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const deleted = await service.deleteSession(id);

    if (!deleted) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'NotFound',
        message: `Session with id "${id}" not found`,
      });
    }

    return reply.send({ success: true });
  });

  /**
   * Add a checkpoint to a session.
   * POST /sessions/:id/checkpoint
   */
  fastify.post('/sessions/:id/checkpoint', {
    schema: {
      description: 'Append a checkpoint object to a session',
      tags: ['Sessions'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        description: 'Checkpoint payload (arbitrary shape)',
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const session = await service.addCheckpoint(id, request.body);

    if (!session) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'NotFound',
        message: `Session with id "${id}" not found`,
      });
    }

    return reply.send({ session: serializeSession(session) });
  });

  /**
   * Add a stage entry to a session's stage_history.
   * POST /sessions/:id/stage
   */
  fastify.post('/sessions/:id/stage', {
    schema: {
      description: "Append a stage entry to a session's stage_history",
      tags: ['Sessions'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        description: 'Stage entry payload (arbitrary shape)',
      },
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const session = await service.addStageEntry(id, request.body);

    if (!session) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'NotFound',
        message: `Session with id "${id}" not found`,
      });
    }

    return reply.send({ session: serializeSession(session) });
  });
}
