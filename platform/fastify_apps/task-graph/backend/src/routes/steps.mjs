/**
 * Step Routes
 *
 * RESTful API endpoints for step management
 *
 * @module routes/steps
 */

import { nanoid } from 'nanoid';
import { Task, Step, StepStatus } from '@mta/task-graph-sequelize';
import {
  BatchCreateStepsInputSchema,
  CreateStepInputSchema,
  UpdateStepInputSchema,
  GetStepByIdInputSchema,
  ListStepsByTaskInputSchema,
} from '../schemas/index.mjs';
import { NotFoundError, DatabaseError } from '../errors/index.mjs';

/**
 * Step Routes Plugin
 */
export async function stepRoutes(app) {
  // ============================================================================
  // TASK STEP QUERIES
  // ============================================================================

  /**
   * GET /steps/task/:taskId
   * Get all steps for a task
   */
  app.get('/task/:taskId', async (request, reply) => {
    const { taskId } = request.params;

    // Verify task exists
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }

    const steps = await Step.findAll({
      where: { taskId },
      order: [['order', 'ASC']],
    });

    return reply.send({
      success: true,
      data: {
        steps: steps.map(mapStepToOutput),
      },
    });
  });

  /**
   * GET /steps/task/:taskId/progress
   * Get step progress for a task
   */
  app.get('/task/:taskId/progress', async (request, reply) => {
    const { taskId } = request.params;

    // Verify task exists
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }

    const steps = await Step.findAll({
      where: { taskId },
      order: [['order', 'ASC']],
    });

    const total = steps.length;
    const completed = steps.filter((s) => s.status === StepStatus.COMPLETED).length;
    const inProgress = steps.filter((s) => s.status === StepStatus.IN_PROGRESS).length;
    const pending = steps.filter((s) => s.status === StepStatus.PENDING).length;
    const skipped = steps.filter((s) => s.status === StepStatus.SKIPPED).length;
    const blocked = steps.filter((s) => s.status === StepStatus.BLOCKED).length;

    // Find the next available step (first PENDING step that can be started)
    const nextAvailableStep = steps.find((step, index) => {
      if (step.status !== StepStatus.PENDING) return false;
      // Check if all previous steps are completed or skipped
      const previousSteps = steps.slice(0, index);
      return previousSteps.every(
        (s) => s.status === StepStatus.COMPLETED || s.status === StepStatus.SKIPPED
      );
    });

    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return reply.send({
      success: true,
      data: {
        taskId,
        totalSteps: total,
        completedSteps: completed,
        inProgressSteps: inProgress,
        pendingSteps: pending,
        skippedSteps: skipped,
        blockedSteps: blocked,
        progressPercentage,
        nextAvailableStep: nextAvailableStep ? mapStepToOutput(nextAvailableStep) : null,
      },
    });
  });

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * POST /steps/batch
   * Create or update multiple steps for a task
   */
  app.post('/batch', async (request, reply) => {
    const body = request.body;

    // Parse with relaxed schema - token is optional, we'll generate if missing
    const { taskId, steps } = body;

    // Verify task exists
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }

    try {
      const createdSteps = await Promise.all(
        steps.map(async (stepInput, index) => {
          const stepId = nanoid();
          const token = stepInput.token || nanoid();

          const step = await Step.create({
            id: stepId,
            token,
            content: stepInput.content,
            order: stepInput.order ?? index,
            status: StepStatus.PENDING,
            metadata: stepInput.metadata || {},
            taskId,
          });

          return mapStepToOutput(step);
        })
      );

      return reply.status(201).send({
        success: true,
        data: createdSteps,
      });
    } catch (error) {
      console.error('[task-graph] [stepRoutes] [batch] Failed', { error });
      throw new DatabaseError('STEPS_BATCH_CREATE_FAILED', 'Failed to create steps', {
        error: error.message,
      });
    }
  });

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * POST /steps
   * Create a single step
   */
  app.post('/', async (request, reply) => {
    const input = CreateStepInputSchema.parse(request.body);

    // Verify task exists
    const task = await Task.findByPk(input.taskId);
    if (!task) {
      throw new NotFoundError('Task', input.taskId);
    }

    try {
      const stepId = nanoid();
      const step = await Step.create({
        id: stepId,
        token: input.token,
        content: input.content,
        order: input.order ?? 0,
        status: StepStatus.PENDING,
        metadata: input.metadata || {},
        taskId: input.taskId,
      });

      return reply.status(201).send({
        success: true,
        data: mapStepToOutput(step),
      });
    } catch (error) {
      console.error('[task-graph] [stepRoutes] [create] Failed', { error });
      throw new DatabaseError('STEP_CREATE_FAILED', 'Failed to create step', {
        error: error.message,
      });
    }
  });

  /**
   * GET /steps/:stepId
   * Get a step by ID
   */
  app.get('/:stepId', async (request, reply) => {
    const { stepId } = request.params;

    const step = await Step.findByPk(stepId);
    if (!step) {
      throw new NotFoundError('Step', stepId);
    }

    return reply.send({
      success: true,
      data: mapStepToOutput(step),
    });
  });

  /**
   * PATCH /steps/:stepId
   * Update a step
   */
  app.patch('/:stepId', async (request, reply) => {
    const { stepId } = request.params;
    const input = UpdateStepInputSchema.parse(request.body);

    const step = await Step.findByPk(stepId);
    if (!step) {
      throw new NotFoundError('Step', stepId);
    }

    try {
      await step.update({
        token: input.token,
        content: input.content,
        order: input.order,
        metadata: input.metadata,
      });

      return reply.send({
        success: true,
        data: mapStepToOutput(step),
      });
    } catch (error) {
      console.error('[task-graph] [stepRoutes] [update] Failed', { error });
      throw new DatabaseError('STEP_UPDATE_FAILED', 'Failed to update step', {
        error: error.message,
      });
    }
  });

  /**
   * DELETE /steps/:stepId
   * Delete a step
   */
  app.delete('/:stepId', async (request, reply) => {
    const { stepId } = request.params;

    const step = await Step.findByPk(stepId);
    if (!step) {
      throw new NotFoundError('Step', stepId);
    }

    try {
      await step.destroy();
      return reply.status(204).send();
    } catch (error) {
      console.error('[task-graph] [stepRoutes] [delete] Failed', { error });
      throw new DatabaseError('STEP_DELETE_FAILED', 'Failed to delete step', {
        error: error.message,
      });
    }
  });

  // ============================================================================
  // STATUS OPERATIONS
  // ============================================================================

  /**
   * POST /steps/:stepId/start
   * Start step execution
   */
  app.post('/:stepId/start', async (request, reply) => {
    const { stepId } = request.params;
    const body = request.body || {};

    const step = await Step.findByPk(stepId);
    if (!step) {
      throw new NotFoundError('Step', stepId);
    }

    try {
      await step.update({
        status: StepStatus.IN_PROGRESS,
        startedAt: new Date(),
        metadata: { ...step.metadata, ...body.metadata },
      });

      return reply.send({
        success: true,
        data: mapStepToOutput(step),
      });
    } catch (error) {
      console.error('[task-graph] [stepRoutes] [start] Failed', { error });
      throw new DatabaseError('STEP_START_FAILED', 'Failed to start step', {
        error: error.message,
      });
    }
  });

  /**
   * POST /steps/:stepId/complete
   * Complete a step
   */
  app.post('/:stepId/complete', async (request, reply) => {
    const { stepId } = request.params;
    const body = request.body || {};

    const step = await Step.findByPk(stepId);
    if (!step) {
      throw new NotFoundError('Step', stepId);
    }

    try {
      await step.update({
        status: StepStatus.COMPLETED,
        completedAt: new Date(),
        metadata: { ...step.metadata, ...body.metadata },
      });

      return reply.send({
        success: true,
        data: mapStepToOutput(step),
      });
    } catch (error) {
      console.error('[task-graph] [stepRoutes] [complete] Failed', { error });
      throw new DatabaseError('STEP_COMPLETE_FAILED', 'Failed to complete step', {
        error: error.message,
      });
    }
  });

  /**
   * POST /steps/:stepId/skip
   * Skip a step
   */
  app.post('/:stepId/skip', async (request, reply) => {
    const { stepId } = request.params;
    const body = request.body || {};

    const step = await Step.findByPk(stepId);
    if (!step) {
      throw new NotFoundError('Step', stepId);
    }

    try {
      await step.update({
        status: StepStatus.SKIPPED,
        skipReason: body.reason,
        metadata: { ...step.metadata, ...body.metadata },
      });

      return reply.send({
        success: true,
        data: mapStepToOutput(step),
      });
    } catch (error) {
      console.error('[task-graph] [stepRoutes] [skip] Failed', { error });
      throw new DatabaseError('STEP_SKIP_FAILED', 'Failed to skip step', {
        error: error.message,
      });
    }
  });

  /**
   * POST /steps/:stepId/block
   * Block a step
   */
  app.post('/:stepId/block', async (request, reply) => {
    const { stepId } = request.params;
    const body = request.body || {};

    const step = await Step.findByPk(stepId);
    if (!step) {
      throw new NotFoundError('Step', stepId);
    }

    try {
      await step.update({
        status: StepStatus.BLOCKED,
        blockedReason: body.reason,
        metadata: { ...step.metadata, ...body.metadata },
      });

      return reply.send({
        success: true,
        data: mapStepToOutput(step),
      });
    } catch (error) {
      console.error('[task-graph] [stepRoutes] [block] Failed', { error });
      throw new DatabaseError('STEP_BLOCK_FAILED', 'Failed to block step', {
        error: error.message,
      });
    }
  });

  /**
   * POST /steps/:stepId/unblock
   * Unblock a step
   */
  app.post('/:stepId/unblock', async (request, reply) => {
    const { stepId } = request.params;
    const body = request.body || {};

    const step = await Step.findByPk(stepId);
    if (!step) {
      throw new NotFoundError('Step', stepId);
    }

    try {
      await step.update({
        status: StepStatus.PENDING,
        blockedReason: null,
        metadata: { ...step.metadata, ...body.metadata },
      });

      return reply.send({
        success: true,
        data: mapStepToOutput(step),
      });
    } catch (error) {
      console.error('[task-graph] [stepRoutes] [unblock] Failed', { error });
      throw new DatabaseError('STEP_UNBLOCK_FAILED', 'Failed to unblock step', {
        error: error.message,
      });
    }
  });

  return Promise.resolve();
}

/**
 * Map Sequelize step to output format
 */
function mapStepToOutput(step) {
  return {
    id: step.id,
    token: step.token,
    content: step.content,
    order: step.order,
    status: step.status,
    startedAt: step.startedAt?.toISOString() || null,
    completedAt: step.completedAt?.toISOString() || null,
    skipReason: step.skipReason,
    blockedReason: step.blockedReason,
    metadata: step.metadata || {},
    taskId: step.taskId,
    createdAt: step.createdAt.toISOString(),
    updatedAt: step.updatedAt.toISOString(),
  };
}
