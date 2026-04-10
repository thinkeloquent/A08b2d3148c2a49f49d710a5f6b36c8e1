/**
 * Note Routes
 *
 * API endpoints for note/comment management
 *
 * @module routes/notes
 */

import { nanoid } from 'nanoid';
import { Note, Task } from '@mta/task-graph-sequelize';
import { NotFoundError, DatabaseError } from '../errors/index.mjs';

/**
 * Note Routes Plugin
 */
export async function noteRoutes(app) {
  /**
   * GET /notes/task/:taskId
   * Get all notes for a task
   */
  app.get('/task/:taskId', async (request, reply) => {
    const { taskId } = request.params;

    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }

    const notes = await Note.findAll({
      where: { taskId },
      order: [['createdAt', 'DESC']],
    });

    return reply.send({
      success: true,
      data: notes.map(mapNoteToOutput),
    });
  });

  /**
   * POST /notes
   * Create a note
   */
  app.post('/', async (request, reply) => {
    const { content, taskId, authorId } = request.body;

    if (!content || !content.trim()) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Content is required' },
      });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }

    try {
      const note = await Note.create({
        id: nanoid(),
        content: content.trim(),
        taskId,
        authorId: authorId || null,
      });

      return reply.status(201).send({
        success: true,
        data: mapNoteToOutput(note),
      });
    } catch (error) {
      console.error('[task-graph] [noteRoutes] [create] Failed', { error });
      throw new DatabaseError('NOTE_CREATE_FAILED', 'Failed to create note', {
        error: error.message,
      });
    }
  });

  /**
   * PATCH /notes/:noteId
   * Update a note
   */
  app.patch('/:noteId', async (request, reply) => {
    const { noteId } = request.params;
    const { content } = request.body;

    const note = await Note.findByPk(noteId);
    if (!note) {
      throw new NotFoundError('Note', noteId);
    }

    try {
      await note.update({ content: content?.trim() || note.content });

      return reply.send({
        success: true,
        data: mapNoteToOutput(note),
      });
    } catch (error) {
      console.error('[task-graph] [noteRoutes] [update] Failed', { error });
      throw new DatabaseError('NOTE_UPDATE_FAILED', 'Failed to update note', {
        error: error.message,
      });
    }
  });

  /**
   * DELETE /notes/:noteId
   * Delete a note
   */
  app.delete('/:noteId', async (request, reply) => {
    const { noteId } = request.params;

    const note = await Note.findByPk(noteId);
    if (!note) {
      throw new NotFoundError('Note', noteId);
    }

    try {
      await note.destroy();
      return reply.status(204).send();
    } catch (error) {
      console.error('[task-graph] [noteRoutes] [delete] Failed', { error });
      throw new DatabaseError('NOTE_DELETE_FAILED', 'Failed to delete note', {
        error: error.message,
      });
    }
  });

  return Promise.resolve();
}

function mapNoteToOutput(note) {
  return {
    id: note.id,
    content: note.content,
    taskId: note.taskId,
    authorId: note.authorId,
    createdAt: note.createdAt?.toISOString(),
    updatedAt: note.updatedAt?.toISOString(),
  };
}
