/**
 * Event Publisher Service
 *
 * Manages event sourcing and audit trail with buffered publishing
 *
 * @module services/event-publisher.service
 */

import { nanoid } from 'nanoid';
import {
  ExecutionLog,
  ExecutionEventType,
} from '@mta/task-graph-sequelize';
import { DatabaseError } from '../errors/index.mjs';
import { CreateExecutionLogInputSchema } from '../schemas/index.mjs';

const APP_NAME = 'task-graph';

/**
 * EventPublisher Service
 * Manages event sourcing and audit trail for task execution
 */
export class EventPublisher {
  constructor(sequelize, options = {}) {
    this.sequelize = sequelize;
    this.eventBuffer = [];
    this.bufferSize = options.bufferSize || 10;
    this.flushTimer = null;

    if (options.flushInterval) {
      this.flushTimer = setInterval(() => this.flush(), options.flushInterval);
    }

    console.debug(`[${APP_NAME}] [EventPublisher] Initialized with bufferSize=${this.bufferSize}`);
  }

  /**
   * Generate a new correlation ID for tracing related events
   */
  generateCorrelationId() {
    return `corr_${nanoid()}`;
  }

  /**
   * Generate a new execution ID for grouping execution events
   */
  generateExecutionId() {
    return `exec_${nanoid()}`;
  }

  // ============================================================================
  // TASK EVENTS
  // ============================================================================

  async publishTaskCreated(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishTaskCreated]`, { taskId: data.taskId });

    await this.publishEvent({
      eventType: 'TASK_CREATED',
      eventData: {
        taskId: data.taskId,
        title: data.title,
        status: data.status,
        createdBy: data.createdBy,
      },
      correlationId: data.correlationId || this.generateCorrelationId(),
      taskId: data.taskId,
      userId: data.userId,
      executionId: data.executionId,
    });
  }

  async publishTaskStarted(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishTaskStarted]`, { taskId: data.taskId });

    await this.publishEvent({
      eventType: 'TASK_STARTED',
      eventData: {
        taskId: data.taskId,
        executionId: data.executionId,
        startedAt: new Date().toISOString(),
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  async publishTaskCompleted(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishTaskCompleted]`, { taskId: data.taskId });

    await this.publishEvent({
      eventType: 'TASK_COMPLETED',
      eventData: {
        taskId: data.taskId,
        executionId: data.executionId,
        completedAt: new Date().toISOString(),
        duration: data.duration,
        completedStepsCount: data.completedStepsCount,
        skippedStepsCount: data.skippedStepsCount,
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  async publishTaskFailed(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishTaskFailed]`, { taskId: data.taskId });

    await this.publishEvent({
      eventType: 'TASK_FAILED',
      eventData: {
        taskId: data.taskId,
        executionId: data.executionId,
        failedAt: new Date().toISOString(),
        error: data.error,
        retryCount: data.retryCount,
        willRetry: data.willRetry,
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  async publishTaskSkipped(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishTaskSkipped]`, { taskId: data.taskId });

    await this.publishEvent({
      eventType: 'TASK_SKIPPED',
      eventData: {
        taskId: data.taskId,
        reason: data.reason,
        skippedAt: new Date().toISOString(),
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  async publishTaskRetried(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishTaskRetried]`, { taskId: data.taskId });

    await this.publishEvent({
      eventType: 'TASK_RETRIED',
      eventData: {
        taskId: data.taskId,
        retryCount: data.retryCount,
        retriedAt: new Date().toISOString(),
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  async publishTaskBlocked(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishTaskBlocked]`, { taskId: data.taskId });

    await this.publishEvent({
      eventType: 'TASK_BLOCKED',
      eventData: {
        taskId: data.taskId,
        blockedBy: data.blockedBy,
        blockedAt: new Date().toISOString(),
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  async publishTaskUnblocked(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishTaskUnblocked]`, { taskId: data.taskId });

    await this.publishEvent({
      eventType: 'TASK_UNBLOCKED',
      eventData: {
        taskId: data.taskId,
        unblockedAt: new Date().toISOString(),
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  // ============================================================================
  // STEP EVENTS
  // ============================================================================

  async publishStepCreated(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishStepCreated]`, { stepId: data.stepId });

    await this.publishEvent({
      eventType: 'STEP_CREATED',
      eventData: {
        stepId: data.stepId,
        taskId: data.taskId,
        content: data.content,
        order: data.order,
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      stepId: data.stepId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  async publishStepStarted(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishStepStarted]`, { stepId: data.stepId });

    await this.publishEvent({
      eventType: 'STEP_STARTED',
      eventData: {
        stepId: data.stepId,
        taskId: data.taskId,
        startedAt: new Date().toISOString(),
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      stepId: data.stepId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  async publishStepCompleted(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishStepCompleted]`, { stepId: data.stepId });

    await this.publishEvent({
      eventType: 'STEP_COMPLETED',
      eventData: {
        stepId: data.stepId,
        taskId: data.taskId,
        completedAt: new Date().toISOString(),
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      stepId: data.stepId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  async publishStepFailed(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishStepFailed]`, { stepId: data.stepId });

    await this.publishEvent({
      eventType: 'STEP_FAILED',
      eventData: {
        stepId: data.stepId,
        taskId: data.taskId,
        error: data.error,
        failedAt: new Date().toISOString(),
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      stepId: data.stepId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  async publishStepSkipped(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishStepSkipped]`, { stepId: data.stepId });

    await this.publishEvent({
      eventType: 'STEP_SKIPPED',
      eventData: {
        stepId: data.stepId,
        taskId: data.taskId,
        reason: data.reason,
        skippedAt: new Date().toISOString(),
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      stepId: data.stepId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  // ============================================================================
  // EXECUTION EVENTS
  // ============================================================================

  async publishExecutionStarted(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishExecutionStarted]`, { taskId: data.taskId });

    await this.publishEvent({
      eventType: 'EXECUTION_STARTED',
      eventData: {
        taskId: data.taskId,
        executionId: data.executionId,
        startedAt: new Date().toISOString(),
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  async publishExecutionCompleted(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishExecutionCompleted]`, { taskId: data.taskId });

    await this.publishEvent({
      eventType: 'EXECUTION_COMPLETED',
      eventData: {
        taskId: data.taskId,
        executionId: data.executionId,
        completedAt: new Date().toISOString(),
        duration: data.duration,
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  async publishExecutionFailed(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishExecutionFailed]`, { taskId: data.taskId });

    await this.publishEvent({
      eventType: 'EXECUTION_FAILED',
      eventData: {
        taskId: data.taskId,
        executionId: data.executionId,
        failedAt: new Date().toISOString(),
        error: data.error,
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  // ============================================================================
  // CHECKPOINT EVENTS
  // ============================================================================

  async publishCheckpointCreated(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishCheckpointCreated]`, { checkpointId: data.checkpointId });

    await this.publishEvent({
      eventType: 'CHECKPOINT_CREATED',
      eventData: {
        checkpointId: data.checkpointId,
        taskId: data.taskId,
        checkpointType: data.checkpointType,
        ttl: data.ttl,
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  async publishCheckpointRestored(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishCheckpointRestored]`, { checkpointId: data.checkpointId });

    await this.publishEvent({
      eventType: 'CHECKPOINT_RESTORED',
      eventData: {
        checkpointId: data.checkpointId,
        taskId: data.taskId,
        restoredAt: new Date().toISOString(),
      },
      correlationId: data.correlationId,
      taskId: data.taskId,
      executionId: data.executionId,
      userId: data.userId,
    });
  }

  // ============================================================================
  // DEPENDENCY EVENTS
  // ============================================================================

  async publishDependencyAdded(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishDependencyAdded]`, data);

    await this.publishEvent({
      eventType: 'DEPENDENCY_ADDED',
      eventData: {
        prerequisiteId: data.prerequisiteId,
        dependentId: data.dependentId,
        allowSkip: data.allowSkip,
      },
      correlationId: data.correlationId,
      userId: data.userId,
    });
  }

  async publishDependencyRemoved(data) {
    console.debug(`[${APP_NAME}] [EventPublisher] [publishDependencyRemoved]`, data);

    await this.publishEvent({
      eventType: 'DEPENDENCY_REMOVED',
      eventData: {
        prerequisiteId: data.prerequisiteId,
        dependentId: data.dependentId,
      },
      correlationId: data.correlationId,
      userId: data.userId,
    });
  }

  async publishDependencyCycleDetected(data) {
    console.warn(`[${APP_NAME}] [EventPublisher] [publishDependencyCycleDetected]`, { cyclePath: data.cyclePath });

    await this.publishEvent({
      eventType: 'DEPENDENCY_CYCLE_DETECTED',
      eventData: {
        cyclePath: data.cyclePath,
        attemptedDependency: data.attemptedDependency,
      },
      correlationId: data.correlationId,
      userId: data.userId,
    });
  }

  // ============================================================================
  // CORE PUBLISHING METHODS
  // ============================================================================

  /**
   * Publish a single event (adds to buffer)
   */
  async publishEvent(event) {
    CreateExecutionLogInputSchema.parse(event);
    this.eventBuffer.push(event);

    if (this.eventBuffer.length >= this.bufferSize) {
      await this.flush();
    }
  }

  /**
   * Flush buffered events to database
   */
  async flush() {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      await ExecutionLog.bulkCreate(
        eventsToFlush.map((event) => ({
          id: nanoid(),
          eventType: event.eventType,
          eventData: event.eventData,
          correlationId: event.correlationId,
          taskId: event.taskId,
          stepId: event.stepId,
          userId: event.userId,
          executionId: event.executionId,
          parentEventId: event.parentEventId,
        }))
      );

      console.debug(`[${APP_NAME}] [EventPublisher] [flush] Flushed ${eventsToFlush.length} events`);
    } catch (error) {
      this.eventBuffer.unshift(...eventsToFlush);
      console.error(`[${APP_NAME}] [EventPublisher] [flush] Failed`, { error });
      throw new DatabaseError(
        'EVENT_PUBLISH_FAILED',
        'Failed to publish events to database',
        { error: error.message }
      );
    }
  }

  /**
   * Publish event immediately (bypasses buffer)
   */
  async publishImmediate(event) {
    CreateExecutionLogInputSchema.parse(event);

    try {
      const result = await ExecutionLog.create({
        id: nanoid(),
        eventType: event.eventType,
        eventData: event.eventData,
        correlationId: event.correlationId,
        taskId: event.taskId,
        stepId: event.stepId,
        userId: event.userId,
        executionId: event.executionId,
        parentEventId: event.parentEventId,
      });

      console.debug(`[${APP_NAME}] [EventPublisher] [publishImmediate] Event published`, { id: result.id });

      return result.id;
    } catch (error) {
      console.error(`[${APP_NAME}] [EventPublisher] [publishImmediate] Failed`, { error });
      throw new DatabaseError('EVENT_PUBLISH_FAILED', 'Failed to publish event to database', {
        error: error.message,
      });
    }
  }

  /**
   * Cleanup: flush buffer and clear timer
   */
  async cleanup() {
    console.debug(`[${APP_NAME}] [EventPublisher] [cleanup] Starting cleanup`);

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();

    console.debug(`[${APP_NAME}] [EventPublisher] [cleanup] Cleanup complete`);
  }
}
