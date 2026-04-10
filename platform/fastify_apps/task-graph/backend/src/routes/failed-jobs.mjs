/**
 * Failed Jobs Routes
 *
 * API endpoints for viewing and managing failed jobs
 *
 * @module routes/failed-jobs
 */

import { FailedJob } from '@mta/task-graph-sequelize';

/**
 * Failed Jobs Routes Plugin
 */
export async function failedJobRoutes(app) {
  /**
   * GET /failed-jobs
   * List failed jobs with pagination
   */
  app.get('/', async (request, reply) => {
    const query = request.query;
    const limit = query.limit ? parseInt(query.limit) : 50;
    const offset = query.offset ? parseInt(query.offset) : 0;
    const jobType = query.jobType;

    const where = {};
    if (jobType) {
      where.jobType = jobType;
    }

    const { rows: jobs, count: total } = await FailedJob.findAndCountAll({
      where,
      order: [['failedAt', 'DESC']],
      limit,
      offset,
    });

    return reply.send({
      success: true,
      data: jobs.map((job) => ({
        id: job.id,
        jobId: job.jobId,
        jobType: job.jobType,
        jobData: job.jobData,
        error: job.error,
        stack: job.stack,
        retried: job.retried,
        failedAt: job.failedAt?.toISOString(),
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
   * GET /failed-jobs/:id
   * Get a single failed job by ID
   */
  app.get('/:id', async (request, reply) => {
    const { id } = request.params;

    const job = await FailedJob.findByPk(id);

    if (!job) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'FAILED_JOB_NOT_FOUND',
          message: 'Failed job not found',
        },
      });
    }

    return reply.send({
      success: true,
      data: {
        id: job.id,
        jobId: job.jobId,
        jobType: job.jobType,
        jobData: job.jobData,
        error: job.error,
        stack: job.stack,
        retried: job.retried,
        failedAt: job.failedAt?.toISOString(),
      },
    });
  });

  /**
   * POST /failed-jobs/:id/retry
   * Mark a failed job as retried
   */
  app.post('/:id/retry', async (request, reply) => {
    const { id } = request.params;

    const job = await FailedJob.findByPk(id);

    if (!job) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'FAILED_JOB_NOT_FOUND',
          message: 'Failed job not found',
        },
      });
    }

    await job.update({ retried: true });

    return reply.send({
      success: true,
      data: {
        id: job.id,
        jobId: job.jobId,
        jobType: job.jobType,
        jobData: job.jobData,
        error: job.error,
        stack: job.stack,
        retried: job.retried,
        failedAt: job.failedAt?.toISOString(),
      },
    });
  });

  /**
   * DELETE /failed-jobs/:id
   * Delete a failed job
   */
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    const job = await FailedJob.findByPk(id);

    if (!job) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'FAILED_JOB_NOT_FOUND',
          message: 'Failed job not found',
        },
      });
    }

    await job.destroy();

    return reply.status(204).send();
  });

  return Promise.resolve();
}
