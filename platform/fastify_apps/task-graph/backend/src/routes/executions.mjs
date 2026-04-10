/**
 * Execution Logs Routes
 *
 * API endpoints for viewing execution logs
 *
 * @module routes/executions
 */

import { ExecutionLog } from '@mta/task-graph-sequelize';

/**
 * Execution Routes Plugin
 */
export async function executionRoutes(app) {
  /**
   * GET /executions/logs
   * List execution logs with pagination
   */
  app.get('/logs', async (request, reply) => {
    const query = request.query;
    const limit = query.limit ? parseInt(query.limit) : 50;
    const offset = query.offset ? parseInt(query.offset) : 0;
    const taskId = query.taskId;

    const where = {};
    if (taskId) {
      where.taskId = taskId;
    }

    const { rows: logs, count: total } = await ExecutionLog.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      limit,
      offset,
    });

    return reply.send({
      success: true,
      data: logs.map((log) => ({
        id: log.id,
        eventType: log.eventType,
        eventData: log.eventData,
        timestamp: log.timestamp?.toISOString(),
        correlationId: log.correlationId,
        taskId: log.taskId,
        stepId: log.stepId,
        userId: log.userId,
        executionId: log.executionId,
        parentEventId: log.parentEventId,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  });

  /**
   * GET /executions/timeline/:taskId
   * Get execution timeline for a task
   */
  app.get('/timeline/:taskId', async (request, reply) => {
    const { taskId } = request.params;

    const logs = await ExecutionLog.findAll({
      where: { taskId },
      order: [['timestamp', 'ASC']],
    });

    const events = logs.map((log) => ({
      id: log.id,
      eventType: log.eventType,
      timestamp: log.timestamp?.toISOString(),
      entity: log.stepId ? 'step' : 'task',
      entityId: log.stepId || log.taskId,
      summary: log.eventType.replace(/_/g, ' ').toLowerCase(),
      details: log.eventData,
    }));

    const startEvent = logs.find((l) => l.eventType === 'TASK_STARTED');
    const endEvent = logs.find((l) =>
      l.eventType === 'TASK_COMPLETED' ||
      l.eventType === 'TASK_FAILED' ||
      l.eventType === 'TASK_SKIPPED'
    );

    const startedAt = startEvent?.timestamp?.toISOString();
    const completedAt = endEvent?.timestamp?.toISOString();
    const duration = startEvent && endEvent
      ? endEvent.timestamp.getTime() - startEvent.timestamp.getTime()
      : undefined;

    return reply.send({
      success: true,
      data: {
        taskId,
        events,
        startedAt,
        completedAt,
        duration,
        totalEvents: events.length,
      },
    });
  });

  return Promise.resolve();
}
