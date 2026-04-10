/**
 * Task Service
 *
 * Core service for managing tasks with idempotency, status transitions, and execution tracking
 *
 * @module services/task.service
 */

import { Op } from 'sequelize';
import { nanoid } from 'nanoid';
import {
  Task,
  Step,
  Dependency,
  File,
  Note,
  TaskStatus,
  RepeatInterval,
} from '@mta/task-graph-sequelize';
import {
  NotFoundError,
  IdempotencyKeyConflictError,
  InvalidStatusTransitionError,
  MaxRetriesExceededError,
  DatabaseError,
  DuplicateTitleError,
  isValidTransition,
} from '../errors/index.mjs';
import {
  CreateTaskInputSchema,
  UpdateTaskInputSchema,
  UpdateTaskStatusInputSchemaRefined,
} from '../schemas/index.mjs';

const APP_NAME = 'task-graph';

/**
 * Re-throw errors caused by missing database tables so they bypass
 * the DatabaseError wrapper and reach the global error handler with
 * their original PostgreSQL error code intact.
 */
function rethrowIfMissingTable(error) {
  const pgError = error.original || error.parent || error;
  if (pgError.code === '42P01') {
    throw error;
  }
}

/**
 * TaskService
 * Core service for managing tasks
 */
export class TaskService {
  constructor(sequelize, eventPublisher) {
    this.sequelize = sequelize;
    this.eventPublisher = eventPublisher;
    console.debug(`[${APP_NAME}] [TaskService] Initialized`);
  }

  /**
   * Create a new task with optional idempotency key
   */
  async createTask(input, userId) {
    console.debug(`[${APP_NAME}] [TaskService] [createTask] Starting`, { title: input.title, userId });

    CreateTaskInputSchema.parse(input);

    // Check for duplicate title
    const existingByTitle = await Task.findOne({
      where: { title: input.title },
    });

    if (existingByTitle) {
      console.warn(`[${APP_NAME}] [TaskService] [createTask] Duplicate title`, {
        title: input.title,
        existingId: existingByTitle.id,
      });
      throw new DuplicateTitleError(input.title);
    }

    if (input.idempotencyKey) {
      const existing = await Task.findOne({
        where: { idempotencyKey: input.idempotencyKey },
      });

      if (existing) {
        console.warn(`[${APP_NAME}] [TaskService] [createTask] Idempotency key conflict`, {
          idempotencyKey: input.idempotencyKey,
          existingId: existing.id,
        });
        throw new IdempotencyKeyConflictError(input.idempotencyKey, existing.id);
      }
    }

    const correlationId = this.eventPublisher.generateCorrelationId();
    const taskId = nanoid();

    try {
      const task = await Task.create({
        id: taskId,
        idempotencyKey: input.idempotencyKey || null,
        title: input.title,
        description: input.description || null,
        status: input.status || TaskStatus.PENDING,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        repeatInterval: input.repeatInterval || RepeatInterval.NONE,
        maxRetries: input.maxRetries ?? 3,
        metadata: input.metadata || {},
        creatorId: userId || null,
        assignedToId: input.assignedToId || null,
        templateId: input.templateId || null,
      });

      console.debug(`[${APP_NAME}] [TaskService] [createTask] Task created`, { id: task.id });

      const stepsCount = await Step.count({ where: { taskId: task.id } });
      const prerequisitesCount = await Dependency.count({ where: { dependentId: task.id } });
      const dependentsCount = await Dependency.count({ where: { prerequisiteId: task.id } });

      await this.eventPublisher.publishTaskCreated({
        taskId: task.id,
        title: task.title,
        status: task.status,
        createdBy: userId,
        correlationId,
        userId,
      });

      // Flush events immediately to ensure logs are persisted
      await this.eventPublisher.flush();

      return this.mapTaskToOutput(task, stepsCount, prerequisitesCount, dependentsCount);
    } catch (error) {
      rethrowIfMissingTable(error);
      console.error(`[${APP_NAME}] [TaskService] [createTask] Failed`, { error });
      throw new DatabaseError('TASK_CREATE_FAILED', 'Failed to create task', {
        error: error.message,
      });
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(input) {
    console.debug(`[${APP_NAME}] [TaskService] [getTaskById] Starting`, { taskId: input.taskId });

    const include = [];

    if (input.includeSteps) {
      include.push({ model: Step, as: 'steps' });
    }
    if (input.includeFiles) {
      include.push({ model: File, as: 'files' });
    }
    if (input.includeNotes) {
      include.push({ model: Note, as: 'notes' });
    }

    const task = await Task.findByPk(input.taskId, {
      include: include.length > 0 ? include : undefined,
    });

    if (!task) {
      console.warn(`[${APP_NAME}] [TaskService] [getTaskById] Task not found`, { taskId: input.taskId });
      throw new NotFoundError('Task', input.taskId);
    }

    const stepsCount = await Step.count({ where: { taskId: task.id } });
    const prerequisitesCount = await Dependency.count({ where: { dependentId: task.id } });
    const dependentsCount = await Dependency.count({ where: { prerequisiteId: task.id } });

    return this.mapTaskToOutput(task, stepsCount, prerequisitesCount, dependentsCount);
  }

  /**
   * Get task by idempotency key
   */
  async getTaskByIdempotencyKey(idempotencyKey) {
    console.debug(`[${APP_NAME}] [TaskService] [getTaskByIdempotencyKey] Starting`, { idempotencyKey });

    const task = await Task.findOne({
      where: { idempotencyKey },
    });

    if (!task) {
      return null;
    }

    const stepsCount = await Step.count({ where: { taskId: task.id } });
    const prerequisitesCount = await Dependency.count({ where: { dependentId: task.id } });
    const dependentsCount = await Dependency.count({ where: { prerequisiteId: task.id } });

    return this.mapTaskToOutput(task, stepsCount, prerequisitesCount, dependentsCount);
  }

  /**
   * List tasks with filtering and pagination
   */
  async listTasks(input) {
    console.debug(`[${APP_NAME}] [TaskService] [listTasks] Starting`, { limit: input.limit, offset: input.offset });

    const { limit = 10, offset = 0, status, assignedToId, creatorId, search, sort } = input;

    const where = {};

    if (status) {
      where.status = Array.isArray(status) ? { [Op.in]: status } : status;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (input.dueDateRange) {
      where.dueDate = {};
      if (input.dueDateRange.from) {
        where.dueDate[Op.gte] = input.dueDateRange.from;
      }
      if (input.dueDateRange.to) {
        where.dueDate[Op.lte] = input.dueDateRange.to;
      }
    }

    const order = [];
    if (sort) {
      order.push([sort.field, sort.order.toUpperCase()]);
    } else {
      order.push(['createdAt', 'DESC']);
    }

    try {
      const include = input.includeSteps ? [{ model: Step, as: 'steps' }] : [];

      const { rows: tasks, count: total } = await Task.findAndCountAll({
        where,
        order,
        offset,
        limit,
        include,
      });

      const tasksWithCounts = await Promise.all(
        tasks.map(async (task) => {
          const stepsCount = await Step.count({ where: { taskId: task.id } });
          const prerequisitesCount = await Dependency.count({ where: { dependentId: task.id } });
          const dependentsCount = await Dependency.count({ where: { prerequisiteId: task.id } });
          return this.mapTaskToOutput(task, stepsCount, prerequisitesCount, dependentsCount);
        })
      );

      console.debug(`[${APP_NAME}] [TaskService] [listTasks] Found ${total} tasks`);

      return {
        tasks: tasksWithCounts,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    } catch (error) {
      rethrowIfMissingTable(error);
      console.error(`[${APP_NAME}] [TaskService] [listTasks] Failed`, { error });
      throw new DatabaseError('TASK_LIST_FAILED', 'Failed to list tasks', {
        error: error.message,
      });
    }
  }

  /**
   * Update task
   */
  async updateTask(taskId, input, userId) {
    console.debug(`[${APP_NAME}] [TaskService] [updateTask] Starting`, { taskId });

    UpdateTaskInputSchema.parse(input);

    const existing = await Task.findByPk(taskId);

    if (!existing) {
      throw new NotFoundError('Task', taskId);
    }

    // Check for duplicate title if title is being updated
    if (input.title && input.title !== existing.title) {
      const existingByTitle = await Task.findOne({
        where: { title: input.title },
      });

      if (existingByTitle) {
        console.warn(`[${APP_NAME}] [TaskService] [updateTask] Duplicate title`, {
          title: input.title,
          existingId: existingByTitle.id,
        });
        throw new DuplicateTitleError(input.title);
      }
    }

    if (input.status && input.status !== existing.status) {
      if (!isValidTransition(existing.status, input.status)) {
        throw new InvalidStatusTransitionError(existing.status, input.status, []);
      }
    }

    try {
      await existing.update({
        title: input.title,
        description: input.description,
        status: input.status,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        repeatInterval: input.repeatInterval,
        maxRetries: input.maxRetries,
        skipReason: input.skipReason,
        metadata: input.metadata,
        assignedToId: input.assignedToId,
      });

      const stepsCount = await Step.count({ where: { taskId: existing.id } });
      const prerequisitesCount = await Dependency.count({ where: { dependentId: existing.id } });
      const dependentsCount = await Dependency.count({ where: { prerequisiteId: existing.id } });

      console.debug(`[${APP_NAME}] [TaskService] [updateTask] Task updated`, { id: existing.id });

      return this.mapTaskToOutput(existing, stepsCount, prerequisitesCount, dependentsCount);
    } catch (error) {
      rethrowIfMissingTable(error);
      console.error(`[${APP_NAME}] [TaskService] [updateTask] Failed`, { error });
      throw new DatabaseError('TASK_UPDATE_FAILED', 'Failed to update task', {
        error: error.message,
      });
    }
  }

  /**
   * Update task status with validation
   */
  async updateTaskStatus(taskId, input, userId) {
    console.debug(`[${APP_NAME}] [TaskService] [updateTaskStatus] Starting`, { taskId, newStatus: input.status });

    UpdateTaskStatusInputSchemaRefined.parse(input);

    const existing = await Task.findByPk(taskId);

    if (!existing) {
      throw new NotFoundError('Task', taskId);
    }

    if (!isValidTransition(existing.status, input.status)) {
      throw new InvalidStatusTransitionError(existing.status, input.status, []);
    }

    try {
      await existing.update({
        status: input.status,
        skipReason: input.skipReason,
        metadata: input.metadata,
      });

      const stepsCount = await Step.count({ where: { taskId: existing.id } });
      const prerequisitesCount = await Dependency.count({ where: { dependentId: existing.id } });
      const dependentsCount = await Dependency.count({ where: { prerequisiteId: existing.id } });

      console.debug(`[${APP_NAME}] [TaskService] [updateTaskStatus] Status updated`, { id: existing.id, status: input.status });

      return this.mapTaskToOutput(existing, stepsCount, prerequisitesCount, dependentsCount);
    } catch (error) {
      rethrowIfMissingTable(error);
      console.error(`[${APP_NAME}] [TaskService] [updateTaskStatus] Failed`, { error });
      throw new DatabaseError('TASK_STATUS_UPDATE_FAILED', 'Failed to update task status', {
        error: error.message,
      });
    }
  }

  /**
   * Start task execution
   */
  async startTaskExecution(input, userId) {
    console.debug(`[${APP_NAME}] [TaskService] [startTaskExecution] Starting`, { taskId: input.taskId });

    const task = await Task.findByPk(input.taskId);

    if (!task) {
      throw new NotFoundError('Task', input.taskId);
    }

    if (!isValidTransition(task.status, 'IN_PROGRESS')) {
      throw new InvalidStatusTransitionError(task.status, 'IN_PROGRESS', []);
    }

    const executionId = input.executionId || this.eventPublisher.generateExecutionId();
    const correlationId = this.eventPublisher.generateCorrelationId();

    try {
      await task.update({
        status: TaskStatus.IN_PROGRESS,
        metadata: {
          ...task.metadata,
          executionId,
          ...(input.metadata || {}),
        },
      });

      const stepsCount = await Step.count({ where: { taskId: task.id } });
      const prerequisitesCount = await Dependency.count({ where: { dependentId: task.id } });
      const dependentsCount = await Dependency.count({ where: { prerequisiteId: task.id } });

      await Promise.all([
        this.eventPublisher.publishExecutionStarted({
          taskId: input.taskId,
          executionId,
          correlationId,
          userId,
        }),
        this.eventPublisher.publishTaskStarted({
          taskId: input.taskId,
          executionId,
          correlationId,
          userId,
        }),
      ]);

      // Flush events immediately to ensure logs are persisted
      await this.eventPublisher.flush();

      console.debug(`[${APP_NAME}] [TaskService] [startTaskExecution] Task started`, { id: task.id, executionId });

      return this.mapTaskToOutput(task, stepsCount, prerequisitesCount, dependentsCount);
    } catch (error) {
      rethrowIfMissingTable(error);
      console.error(`[${APP_NAME}] [TaskService] [startTaskExecution] Failed`, { error });
      throw new DatabaseError('TASK_START_FAILED', 'Failed to start task execution', {
        error: error.message,
      });
    }
  }

  /**
   * Complete task
   */
  async completeTask(input, userId) {
    console.debug(`[${APP_NAME}] [TaskService] [completeTask] Starting`, { taskId: input.taskId });

    const task = await Task.findByPk(input.taskId);

    if (!task) {
      throw new NotFoundError('Task', input.taskId);
    }

    const steps = await Step.findAll({ where: { taskId: task.id } });

    if (!isValidTransition(task.status, 'DONE')) {
      throw new InvalidStatusTransitionError(task.status, 'DONE', []);
    }

    const correlationId = this.eventPublisher.generateCorrelationId();
    const metadata = task.metadata || {};
    const executionId = metadata.executionId || this.eventPublisher.generateExecutionId();
    const duration = task.createdAt ? Date.now() - task.createdAt.getTime() : 0;

    try {
      await task.update({
        status: TaskStatus.DONE,
        metadata: {
          ...metadata,
          ...(input.metadata || {}),
        },
      });

      const stepsCount = steps.length;
      const prerequisitesCount = await Dependency.count({ where: { dependentId: task.id } });
      const dependentsCount = await Dependency.count({ where: { prerequisiteId: task.id } });

      const completedStepsCount = steps.filter((s) => s.status === 'COMPLETED').length;
      const skippedStepsCount = steps.filter((s) => s.status === 'SKIPPED').length;

      await Promise.all([
        this.eventPublisher.publishTaskCompleted({
          taskId: input.taskId,
          executionId,
          correlationId,
          duration,
          completedStepsCount,
          skippedStepsCount,
          userId,
        }),
        this.eventPublisher.publishExecutionCompleted({
          taskId: input.taskId,
          executionId,
          correlationId,
          duration,
          userId,
        }),
      ]);

      // Flush events immediately to ensure logs are persisted
      await this.eventPublisher.flush();

      console.debug(`[${APP_NAME}] [TaskService] [completeTask] Task completed`, { id: task.id, duration });

      return this.mapTaskToOutput(task, stepsCount, prerequisitesCount, dependentsCount);
    } catch (error) {
      rethrowIfMissingTable(error);
      console.error(`[${APP_NAME}] [TaskService] [completeTask] Failed`, { error });
      throw new DatabaseError('TASK_COMPLETE_FAILED', 'Failed to complete task', {
        error: error.message,
      });
    }
  }

  /**
   * Fail task
   */
  async failTask(input, userId) {
    console.debug(`[${APP_NAME}] [TaskService] [failTask] Starting`, { taskId: input.taskId });

    const task = await Task.findByPk(input.taskId);

    if (!task) {
      throw new NotFoundError('Task', input.taskId);
    }

    const willRetry = input.shouldRetry && task.retryCount < task.maxRetries;
    const newStatus = willRetry ? TaskStatus.RETRYING : TaskStatus.FAILED;

    if (!isValidTransition(task.status, newStatus)) {
      throw new InvalidStatusTransitionError(task.status, newStatus, []);
    }

    const correlationId = this.eventPublisher.generateCorrelationId();
    const metadata = task.metadata || {};
    const executionId = metadata.executionId || this.eventPublisher.generateExecutionId();

    try {
      await task.update({
        status: newStatus,
        retryCount: task.retryCount + 1,
        metadata: {
          ...metadata,
          lastError: input.error,
          ...(input.metadata || {}),
        },
      });

      const stepsCount = await Step.count({ where: { taskId: task.id } });
      const prerequisitesCount = await Dependency.count({ where: { dependentId: task.id } });
      const dependentsCount = await Dependency.count({ where: { prerequisiteId: task.id } });

      await this.eventPublisher.publishTaskFailed({
        taskId: input.taskId,
        executionId,
        correlationId,
        error: input.error,
        retryCount: task.retryCount + 1,
        willRetry,
        userId,
      });

      if (!willRetry) {
        await this.eventPublisher.publishExecutionFailed({
          taskId: input.taskId,
          executionId,
          correlationId,
          error: input.error,
          userId,
        });
      }

      if (willRetry) {
        await this.eventPublisher.publishTaskRetried({
          taskId: input.taskId,
          executionId,
          correlationId,
          retryCount: task.retryCount + 1,
          userId,
        });
      }

      // Flush events immediately to ensure logs are persisted
      await this.eventPublisher.flush();

      console.debug(`[${APP_NAME}] [TaskService] [failTask] Task failed`, { id: task.id, willRetry });

      return this.mapTaskToOutput(task, stepsCount, prerequisitesCount, dependentsCount);
    } catch (error) {
      rethrowIfMissingTable(error);
      console.error(`[${APP_NAME}] [TaskService] [failTask] Failed`, { error });
      throw new DatabaseError('TASK_FAIL_FAILED', 'Failed to mark task as failed', {
        error: error.message,
      });
    }
  }

  /**
   * Skip task
   */
  async skipTask(input, userId) {
    console.debug(`[${APP_NAME}] [TaskService] [skipTask] Starting`, { taskId: input.taskId });

    const task = await Task.findByPk(input.taskId);

    if (!task) {
      throw new NotFoundError('Task', input.taskId);
    }

    if (!isValidTransition(task.status, 'SKIPPED')) {
      throw new InvalidStatusTransitionError(task.status, 'SKIPPED', []);
    }

    const correlationId = this.eventPublisher.generateCorrelationId();
    const metadata = task.metadata || {};
    const executionId = metadata.executionId;

    try {
      await task.update({
        status: TaskStatus.SKIPPED,
        metadata: {
          ...metadata,
          skipReason: input.reason,
          ...(input.metadata || {}),
        },
      });

      const stepsCount = await Step.count({ where: { taskId: task.id } });
      const prerequisitesCount = await Dependency.count({ where: { dependentId: task.id } });
      const dependentsCount = await Dependency.count({ where: { prerequisiteId: task.id } });

      await this.eventPublisher.publishTaskSkipped({
        taskId: input.taskId,
        reason: input.reason,
        correlationId,
        executionId,
        userId,
      });

      // Flush events immediately to ensure logs are persisted
      await this.eventPublisher.flush();

      console.debug(`[${APP_NAME}] [TaskService] [skipTask] Task skipped`, { id: task.id, reason: input.reason });

      return this.mapTaskToOutput(task, stepsCount, prerequisitesCount, dependentsCount);
    } catch (error) {
      rethrowIfMissingTable(error);
      console.error(`[${APP_NAME}] [TaskService] [skipTask] Failed`, { error });
      throw new DatabaseError('TASK_SKIP_FAILED', 'Failed to skip task', {
        error: error.message,
      });
    }
  }

  /**
   * Retry task
   */
  async retryTask(input, userId) {
    console.debug(`[${APP_NAME}] [TaskService] [retryTask] Starting`, { taskId: input.taskId });

    const task = await Task.findByPk(input.taskId);

    if (!task) {
      throw new NotFoundError('Task', input.taskId);
    }

    if (!input.resetRetryCount && task.retryCount >= task.maxRetries) {
      throw new MaxRetriesExceededError(input.taskId, task.maxRetries);
    }

    if (!isValidTransition(task.status, 'PENDING')) {
      throw new InvalidStatusTransitionError(task.status, 'PENDING', []);
    }

    try {
      await task.update({
        status: TaskStatus.PENDING,
        retryCount: input.resetRetryCount ? 0 : task.retryCount,
        metadata: {
          ...task.metadata,
          ...(input.metadata || {}),
        },
      });

      const stepsCount = await Step.count({ where: { taskId: task.id } });
      const prerequisitesCount = await Dependency.count({ where: { dependentId: task.id } });
      const dependentsCount = await Dependency.count({ where: { prerequisiteId: task.id } });

      console.debug(`[${APP_NAME}] [TaskService] [retryTask] Task reset for retry`, { id: task.id });

      return this.mapTaskToOutput(task, stepsCount, prerequisitesCount, dependentsCount);
    } catch (error) {
      rethrowIfMissingTable(error);
      console.error(`[${APP_NAME}] [TaskService] [retryTask] Failed`, { error });
      throw new DatabaseError('TASK_RETRY_FAILED', 'Failed to retry task', {
        error: error.message,
      });
    }
  }

  /**
   * Delete task
   */
  async deleteTask(taskId) {
    console.debug(`[${APP_NAME}] [TaskService] [deleteTask] Starting`, { taskId });

    const task = await Task.findByPk(taskId);

    if (!task) {
      throw new NotFoundError('Task', taskId);
    }

    try {
      await task.destroy();
      console.debug(`[${APP_NAME}] [TaskService] [deleteTask] Task deleted`, { id: taskId });
    } catch (error) {
      rethrowIfMissingTable(error);
      console.error(`[${APP_NAME}] [TaskService] [deleteTask] Failed`, { error });
      throw new DatabaseError('TASK_DELETE_FAILED', 'Failed to delete task', {
        error: error.message,
      });
    }
  }

  /**
   * Get task execution status
   */
  async getTaskExecutionStatus(taskId) {
    console.debug(`[${APP_NAME}] [TaskService] [getTaskExecutionStatus] Starting`, { taskId });

    const task = await Task.findByPk(taskId);

    if (!task) {
      throw new NotFoundError('Task', taskId);
    }

    const metadata = task.metadata || {};
    const isRunning = task.status === TaskStatus.IN_PROGRESS;
    const canRetry = task.retryCount < task.maxRetries && task.status === TaskStatus.FAILED;

    return {
      taskId: task.id,
      status: task.status,
      isRunning,
      currentExecutionId: metadata.executionId || null,
      startedAt: task.createdAt?.toISOString() || null,
      completedAt: null,
      failedAt: null,
      retryCount: task.retryCount,
      maxRetries: task.maxRetries,
      canRetry,
    };
  }

  /**
   * Map Sequelize task to TaskOutput
   */
  mapTaskToOutput(task, stepsCount, prerequisitesCount, dependentsCount) {
    return {
      id: task.id,
      idempotencyKey: task.idempotencyKey,
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate?.toISOString() || null,
      repeatInterval: task.repeatInterval,
      startedAt: null,
      completedAt: null,
      failedAt: null,
      retryCount: task.retryCount,
      maxRetries: task.maxRetries,
      skipReason: null,
      metadata: task.metadata || undefined,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      creatorId: task.creatorId,
      assignedToId: task.assignedToId,
      templateId: task.templateId,
      stepsCount,
      prerequisitesCount,
      dependentsCount,
    };
  }
}
