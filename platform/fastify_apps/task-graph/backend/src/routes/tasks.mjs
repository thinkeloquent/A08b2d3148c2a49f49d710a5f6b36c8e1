/**
 * Task Routes
 *
 * RESTful API endpoints for task management
 *
 * @module routes/tasks
 */

import { TaskService } from '../services/task.service.mjs';
import {
  CreateTaskInputSchema,
  UpdateTaskInputSchema,
  UpdateTaskStatusInputSchemaRefined,
  GetTaskByIdInputSchema,
  ListTasksInputSchema,
  StartTaskExecutionInputSchema,
  CompleteTaskInputSchema,
  FailTaskInputSchema,
  SkipTaskInputSchema,
  RetryTaskInputSchema,
} from '../schemas/index.mjs';

/**
 * Task Routes Plugin
 */
export async function taskRoutes(app) {
  const taskService = new TaskService(app.sequelize, app.eventPublisher);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * POST /tasks
   * Create a new task
   */
  app.post('/', async (request, reply) => {
    const input = CreateTaskInputSchema.parse(request.body);
    const userId = request.user?.id;

    const task = await taskService.createTask(input, userId);

    return reply.status(201).send({
      success: true,
      data: task,
    });
  });

  /**
   * GET /tasks/:taskId
   * Get a task by ID
   */
  app.get('/:taskId', async (request, reply) => {
    const { taskId } = request.params;
    const query = request.query;

    const input = GetTaskByIdInputSchema.parse({
      taskId,
      includeSteps: query.includeSteps === 'true',
      includeDependencies: query.includeDependencies === 'true',
      includeFiles: query.includeFiles === 'true',
      includeNotes: query.includeNotes === 'true',
    });

    const task = await taskService.getTaskById(input);

    return reply.send({
      success: true,
      data: task,
    });
  });

  /**
   * GET /tasks
   * List tasks with filtering and pagination
   */
  app.get('/', async (request, reply) => {
    const query = request.query;

    const input = ListTasksInputSchema.parse({
      limit: query.limit ? parseInt(query.limit) : 10,
      offset: query.offset ? parseInt(query.offset) : 0,
      status: query.status,
      assignedToId: query.assignedToId,
      creatorId: query.creatorId,
      search: query.search,
      dueDateRange:
        query.dueDateFrom || query.dueDateTo
          ? {
              from: query.dueDateFrom,
              to: query.dueDateTo,
            }
          : undefined,
      sort: query.sortField
        ? {
            field: query.sortField,
            order: query.sortOrder || 'asc',
          }
        : undefined,
      includeSteps: query.includeSteps === 'true',
    });

    const result = await taskService.listTasks(input);

    return reply.send({
      success: true,
      data: result.tasks,
      pagination: result.pagination,
    });
  });

  /**
   * GET /tasks/idempotency/:key
   * Get task by idempotency key
   */
  app.get('/idempotency/:key', async (request, reply) => {
    const { key } = request.params;

    const task = await taskService.getTaskByIdempotencyKey(key);

    if (!task) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task with this idempotency key not found',
        },
      });
    }

    return reply.send({
      success: true,
      data: task,
    });
  });

  /**
   * PATCH /tasks/:taskId
   * Update a task
   */
  app.patch('/:taskId', async (request, reply) => {
    const { taskId } = request.params;
    const input = UpdateTaskInputSchema.parse(request.body);
    const userId = request.user?.id;

    const task = await taskService.updateTask(taskId, input, userId);

    return reply.send({
      success: true,
      data: task,
    });
  });

  /**
   * PATCH /tasks/:taskId/status
   * Update task status
   */
  app.patch('/:taskId/status', async (request, reply) => {
    const { taskId } = request.params;
    const input = UpdateTaskStatusInputSchemaRefined.parse(request.body);
    const userId = request.user?.id;

    const task = await taskService.updateTaskStatus(taskId, input, userId);

    return reply.send({
      success: true,
      data: task,
    });
  });

  /**
   * DELETE /tasks/:taskId
   * Delete a task
   */
  app.delete('/:taskId', async (request, reply) => {
    const { taskId } = request.params;

    await taskService.deleteTask(taskId);

    return reply.status(204).send();
  });

  // ============================================================================
  // EXECUTION OPERATIONS
  // ============================================================================

  /**
   * POST /tasks/:taskId/start
   * Start task execution
   */
  app.post('/:taskId/start', async (request, reply) => {
    const { taskId } = request.params;
    const body = request.body || {};
    const userId = request.user?.id;

    const input = StartTaskExecutionInputSchema.parse({
      taskId,
      executionId: body.executionId,
      metadata: body.metadata,
    });

    const task = await taskService.startTaskExecution(input, userId);

    return reply.send({
      success: true,
      data: task,
    });
  });

  /**
   * POST /tasks/:taskId/complete
   * Complete a task
   */
  app.post('/:taskId/complete', async (request, reply) => {
    const { taskId } = request.params;
    const body = request.body || {};
    const userId = request.user?.id;

    const input = CompleteTaskInputSchema.parse({
      taskId,
      metadata: body.metadata,
    });

    const task = await taskService.completeTask(input, userId);

    return reply.send({
      success: true,
      data: task,
    });
  });

  /**
   * POST /tasks/:taskId/fail
   * Fail a task
   */
  app.post('/:taskId/fail', async (request, reply) => {
    const { taskId } = request.params;
    const body = request.body || {};
    const userId = request.user?.id;

    const input = FailTaskInputSchema.parse({
      taskId,
      error: body.error,
      shouldRetry: body.shouldRetry,
      metadata: body.metadata,
    });

    const task = await taskService.failTask(input, userId);

    return reply.send({
      success: true,
      data: task,
    });
  });

  /**
   * POST /tasks/:taskId/skip
   * Skip a task
   */
  app.post('/:taskId/skip', async (request, reply) => {
    const { taskId } = request.params;
    const body = request.body || {};
    const userId = request.user?.id;

    const input = SkipTaskInputSchema.parse({
      taskId,
      reason: body.reason,
      metadata: body.metadata,
    });

    const task = await taskService.skipTask(input, userId);

    return reply.send({
      success: true,
      data: task,
    });
  });

  /**
   * POST /tasks/:taskId/retry
   * Retry a failed task
   */
  app.post('/:taskId/retry', async (request, reply) => {
    const { taskId } = request.params;
    const body = request.body || {};
    const userId = request.user?.id;

    const input = RetryTaskInputSchema.parse({
      taskId,
      resetRetryCount: body.resetRetryCount,
      metadata: body.metadata,
    });

    const task = await taskService.retryTask(input, userId);

    return reply.send({
      success: true,
      data: task,
    });
  });

  /**
   * GET /tasks/:taskId/execution-status
   * Get task execution status
   */
  app.get('/:taskId/execution-status', async (request, reply) => {
    const { taskId } = request.params;

    const status = await taskService.getTaskExecutionStatus(taskId);

    return reply.send({
      success: true,
      data: status,
    });
  });

  return Promise.resolve();
}
