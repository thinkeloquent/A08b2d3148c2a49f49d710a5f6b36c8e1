/**
 * Dependency Routes
 *
 * RESTful API endpoints for task dependency management
 *
 * @module routes/dependencies
 */

import { Task, Dependency } from '@mta/task-graph-sequelize';
import { NotFoundError, DatabaseError } from '../errors/index.mjs';

const APP_NAME = 'task-graph';

/**
 * Dependency Routes Plugin
 */
export async function dependencyRoutes(app) {
  /**
   * POST /dependencies
   * Create a dependency between tasks
   */
  app.post('/', async (request, reply) => {
    const { prerequisiteId, dependentId, allowSkip = false } = request.body;

    console.debug(`[${APP_NAME}] [dependencyRoutes] Creating dependency`, {
      prerequisiteId,
      dependentId,
      allowSkip,
    });

    // Verify both tasks exist
    const [prerequisite, dependent] = await Promise.all([
      Task.findByPk(prerequisiteId),
      Task.findByPk(dependentId),
    ]);

    if (!prerequisite) {
      throw new NotFoundError('Task', prerequisiteId);
    }
    if (!dependent) {
      throw new NotFoundError('Task', dependentId);
    }

    // Check for self-reference
    if (prerequisiteId === dependentId) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'INVALID_DEPENDENCY',
          message: 'A task cannot depend on itself',
        },
      });
    }

    try {
      const [dependency, created] = await Dependency.findOrCreate({
        where: { prerequisiteId, dependentId },
        defaults: { allowSkip },
      });

      if (!created) {
        await dependency.update({ allowSkip });
      }

      return reply.status(created ? 201 : 200).send({
        success: true,
        data: {
          prerequisiteId: dependency.prerequisiteId,
          dependentId: dependency.dependentId,
          allowSkip: dependency.allowSkip,
          createdAt: dependency.createdAt.toISOString(),
        },
      });
    } catch (error) {
      console.error(`[${APP_NAME}] [dependencyRoutes] Failed to create dependency`, { error });
      throw new DatabaseError('DEPENDENCY_CREATE_FAILED', 'Failed to create dependency', {
        error: error.message,
      });
    }
  });

  /**
   * GET /dependencies/:taskId/graph
   * Get the dependency graph for a task (includes connected tasks)
   */
  app.get('/:taskId/graph', async (request, reply) => {
    const { taskId } = request.params;

    console.debug(`[${APP_NAME}] [dependencyRoutes] Getting dependency graph`, { taskId });

    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }

    try {
      // Get all dependencies where this task is involved
      const [prerequisites, dependents] = await Promise.all([
        Dependency.findAll({ where: { dependentId: taskId } }),
        Dependency.findAll({ where: { prerequisiteId: taskId } }),
      ]);

      // Collect all related task IDs
      const relatedTaskIds = new Set([taskId]);
      prerequisites.forEach((d) => relatedTaskIds.add(d.prerequisiteId));
      dependents.forEach((d) => relatedTaskIds.add(d.dependentId));

      // Fetch all related tasks
      const tasks = await Task.findAll({
        where: { id: Array.from(relatedTaskIds) },
        attributes: ['id', 'title', 'status'],
      });

      // Combine all dependencies
      const allDependencies = [...prerequisites, ...dependents];

      return reply.send({
        success: true,
        data: {
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
          })),
          dependencies: allDependencies.map((d) => ({
            prerequisiteId: d.prerequisiteId,
            dependentId: d.dependentId,
            allowSkip: d.allowSkip,
            createdAt: d.createdAt.toISOString(),
          })),
        },
      });
    } catch (error) {
      console.error(`[${APP_NAME}] [dependencyRoutes] Failed to get dependency graph`, { error });
      throw new DatabaseError('DEPENDENCY_GRAPH_FAILED', 'Failed to get dependency graph', {
        error: error.message,
      });
    }
  });

  /**
   * GET /dependencies/:taskId/execution-readiness
   * Check if a task is ready to execute based on its prerequisites
   */
  app.get('/:taskId/execution-readiness', async (request, reply) => {
    const { taskId } = request.params;

    console.debug(`[${APP_NAME}] [dependencyRoutes] Checking execution readiness`, { taskId });

    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }

    try {
      // Get all prerequisites
      const prerequisites = await Dependency.findAll({
        where: { dependentId: taskId },
      });

      if (prerequisites.length === 0) {
        return reply.send({
          success: true,
          data: {
            taskId,
            canExecute: true,
            reason: 'No prerequisites',
            prerequisitesStatus: {
              total: 0,
              completed: 0,
              failed: 0,
              blocked: 0,
              skipped: 0,
            },
            blockingPrerequisites: [],
          },
        });
      }

      // Get status of all prerequisite tasks
      const prerequisiteIds = prerequisites.map((d) => d.prerequisiteId);
      const prerequisiteTasks = await Task.findAll({
        where: { id: prerequisiteIds },
        attributes: ['id', 'status'],
      });

      const statusCounts = {
        total: prerequisiteTasks.length,
        completed: 0,
        failed: 0,
        blocked: 0,
        skipped: 0,
      };

      const blockingPrerequisites = [];

      for (const prereqTask of prerequisiteTasks) {
        const dep = prerequisites.find((d) => d.prerequisiteId === prereqTask.id);
        const allowSkip = dep?.allowSkip || false;

        if (prereqTask.status === 'DONE') {
          statusCounts.completed++;
        } else if (prereqTask.status === 'SKIPPED') {
          statusCounts.skipped++;
          if (!allowSkip) {
            blockingPrerequisites.push(prereqTask.id);
          }
        } else if (prereqTask.status === 'FAILED') {
          statusCounts.failed++;
          if (!allowSkip) {
            blockingPrerequisites.push(prereqTask.id);
          }
        } else if (prereqTask.status === 'BLOCKED') {
          statusCounts.blocked++;
          blockingPrerequisites.push(prereqTask.id);
        } else {
          // PENDING, TODO, IN_PROGRESS, RETRYING
          blockingPrerequisites.push(prereqTask.id);
        }
      }

      const canExecute = blockingPrerequisites.length === 0;
      let reason = canExecute
        ? 'All prerequisites satisfied'
        : `Waiting on ${blockingPrerequisites.length} prerequisite(s)`;

      return reply.send({
        success: true,
        data: {
          taskId,
          canExecute,
          reason,
          prerequisitesStatus: statusCounts,
          blockingPrerequisites,
        },
      });
    } catch (error) {
      console.error(`[${APP_NAME}] [dependencyRoutes] Failed to check execution readiness`, { error });
      throw new DatabaseError('EXECUTION_READINESS_FAILED', 'Failed to check execution readiness', {
        error: error.message,
      });
    }
  });

  /**
   * DELETE /dependencies/:prerequisiteId/:dependentId
   * Remove a dependency between tasks
   */
  app.delete('/:prerequisiteId/:dependentId', async (request, reply) => {
    const { prerequisiteId, dependentId } = request.params;

    console.debug(`[${APP_NAME}] [dependencyRoutes] Removing dependency`, {
      prerequisiteId,
      dependentId,
    });

    const dependency = await Dependency.findOne({
      where: { prerequisiteId, dependentId },
    });

    if (!dependency) {
      throw new NotFoundError('Dependency', `${prerequisiteId}->${dependentId}`);
    }

    try {
      await dependency.destroy();

      return reply.status(204).send();
    } catch (error) {
      console.error(`[${APP_NAME}] [dependencyRoutes] Failed to remove dependency`, { error });
      throw new DatabaseError('DEPENDENCY_DELETE_FAILED', 'Failed to remove dependency', {
        error: error.message,
      });
    }
  });

  return Promise.resolve();
}
