/**
 * File Routes
 *
 * API endpoints for file management
 *
 * @module routes/files
 */

import { nanoid } from 'nanoid';
import { File, Task, Step } from '@mta/task-graph-sequelize';
import { NotFoundError, DatabaseError } from '../errors/index.mjs';

/**
 * File Routes Plugin
 */
export async function fileRoutes(app) {
  /**
   * GET /files/task/:taskId
   * Get all files for a task
   */
  app.get('/task/:taskId', async (request, reply) => {
    const { taskId } = request.params;

    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }

    const files = await File.findAll({
      where: { taskId },
      order: [['uploadedAt', 'DESC']],
    });

    return reply.send({
      success: true,
      data: files.map(mapFileToOutput),
    });
  });

  /**
   * GET /files/step/:stepId
   * Get all files for a step
   */
  app.get('/step/:stepId', async (request, reply) => {
    const { stepId } = request.params;

    const step = await Step.findByPk(stepId);
    if (!step) {
      throw new NotFoundError('Step', stepId);
    }

    const files = await File.findAll({
      where: { stepId },
      order: [['uploadedAt', 'DESC']],
    });

    return reply.send({
      success: true,
      data: files.map(mapFileToOutput),
    });
  });

  /**
   * POST /files
   * Create a file reference
   */
  app.post('/', async (request, reply) => {
    const { fileName, url, mimeType, size, taskId, stepId, uploaderId } = request.body;

    // Validate taskId or stepId exists
    if (taskId) {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new NotFoundError('Task', taskId);
      }
    }

    if (stepId) {
      const step = await Step.findByPk(stepId);
      if (!step) {
        throw new NotFoundError('Step', stepId);
      }
    }

    try {
      const file = await File.create({
        id: nanoid(),
        fileName,
        url,
        mimeType: mimeType || 'application/octet-stream',
        size: size || 0,
        taskId: taskId || null,
        stepId: stepId || null,
        uploaderId: uploaderId || null,
      });

      return reply.status(201).send({
        success: true,
        data: mapFileToOutput(file),
      });
    } catch (error) {
      console.error('[task-graph] [fileRoutes] [create] Failed', { error });
      throw new DatabaseError('FILE_CREATE_FAILED', 'Failed to create file', {
        error: error.message,
      });
    }
  });

  /**
   * PATCH /files/:fileId
   * Update a file (attach to step)
   */
  app.patch('/:fileId', async (request, reply) => {
    const { fileId } = request.params;
    const { stepId } = request.body;

    const file = await File.findByPk(fileId);
    if (!file) {
      throw new NotFoundError('File', fileId);
    }

    if (stepId) {
      const step = await Step.findByPk(stepId);
      if (!step) {
        throw new NotFoundError('Step', stepId);
      }
    }

    try {
      await file.update({ stepId: stepId || null });

      return reply.send({
        success: true,
        data: mapFileToOutput(file),
      });
    } catch (error) {
      console.error('[task-graph] [fileRoutes] [update] Failed', { error });
      throw new DatabaseError('FILE_UPDATE_FAILED', 'Failed to update file', {
        error: error.message,
      });
    }
  });

  /**
   * DELETE /files/:fileId
   * Delete a file
   */
  app.delete('/:fileId', async (request, reply) => {
    const { fileId } = request.params;

    const file = await File.findByPk(fileId);
    if (!file) {
      throw new NotFoundError('File', fileId);
    }

    try {
      await file.destroy();
      return reply.status(204).send();
    } catch (error) {
      console.error('[task-graph] [fileRoutes] [delete] Failed', { error });
      throw new DatabaseError('FILE_DELETE_FAILED', 'Failed to delete file', {
        error: error.message,
      });
    }
  });

  return Promise.resolve();
}

function mapFileToOutput(file) {
  return {
    id: file.id,
    fileName: file.fileName,
    url: file.url,
    mimeType: file.mimeType,
    size: file.size,
    taskId: file.taskId,
    stepId: file.stepId,
    uploaderId: file.uploaderId,
    uploadedAt: file.uploadedAt?.toISOString(),
  };
}
