/**
 * Session Service
 * Business logic for WorkflowSession CRUD and runtime tracking.
 */

import { Op } from 'sequelize';

/**
 * Create session service with database models.
 *
 * @param {object} db - Fastify db decorator: { sequelize, WorkflowSession, Flow }
 * @returns {object} Session service methods
 */
export function createSessionService(db) {
  const { sequelize, WorkflowSession, Flow } = db;

  /**
   * List sessions with optional filters and pagination.
   *
   * @param {object} [filters]
   * @param {string}  [filters.flowId]  - Filter by flow_id
   * @param {string}  [filters.status]  - Filter by status (active | completed | failed)
   * @param {number}  [filters.page=1]
   * @param {number}  [filters.limit=20]
   * @returns {Promise<{ sessions: object[], total: number, page: number, limit: number }>}
   */
  async function listSessions(filters = {}) {
    const { flowId, status, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    if (flowId) where.flow_id = flowId;
    if (status) where.status = status;

    const { count, rows } = await WorkflowSession.findAndCountAll({
      where,
      include: [{ model: Flow, as: 'flow', attributes: ['id', 'name'] }],
      limit,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    return { sessions: rows, total: count, page, limit };
  }

  /**
   * Get a single session by ID, including its parent flow.
   *
   * @param {string} id - UUID
   * @returns {Promise<object|null>}
   */
  async function getSession(id) {
    return WorkflowSession.findByPk(id, {
      include: [{ model: Flow, as: 'flow', attributes: ['id', 'name', 'description'] }],
    });
  }

  /**
   * Get the currently active session for a flow.
   * Returns null if no active session exists.
   *
   * @param {string} flowId - UUID
   * @returns {Promise<object|null>}
   */
  async function getCurrentSession(flowId) {
    return WorkflowSession.findOne({
      where: { flow_id: flowId, status: 'active' },
      include: [{ model: Flow, as: 'flow', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Create a new workflow session.
   *
   * @param {object} data
   * @param {string} data.flow_id
   * @param {string} data.thread_id
   * @param {string} [data.topic]
   * @param {number} [data.max_iterations=10]
   * @returns {Promise<object>} Created session
   */
  async function createSession(data) {
    if (!data.flow_id) {
      const err = new Error('flow_id is required');
      err.statusCode = 400;
      throw err;
    }
    if (!data.thread_id) {
      const err = new Error('thread_id is required');
      err.statusCode = 400;
      throw err;
    }

    const session = await WorkflowSession.create({
      flow_id: data.flow_id,
      thread_id: data.thread_id,
      topic: data.topic ?? null,
      max_iterations: data.max_iterations ?? 10,
      status: 'active',
    });

    return getSession(session.id);
  }

  /**
   * Update mutable fields on a session (status, iterations, current_stage,
   * stage_history, checkpoints, session_data).
   *
   * @param {string} id - UUID
   * @param {object} data - Partial session fields
   * @returns {Promise<object|null>} Updated session, or null if not found
   */
  async function updateSession(id, data) {
    const session = await WorkflowSession.findByPk(id);
    if (!session) return null;

    const allowed = [
      'status', 'iterations', 'current_stage',
      'stage_history', 'checkpoints', 'session_data',
    ];
    const updates = {};
    for (const field of allowed) {
      if (data[field] !== undefined) updates[field] = data[field];
    }

    await session.update(updates);
    return getSession(id);
  }

  /**
   * Hard delete a session.
   *
   * @param {string} id - UUID
   * @returns {Promise<boolean>} true if deleted, false if not found
   */
  async function deleteSession(id) {
    const session = await WorkflowSession.findByPk(id);
    if (!session) return false;
    await session.destroy();
    return true;
  }

  /**
   * List completed and failed sessions for a flow, newest first.
   *
   * @param {string} flowId - UUID
   * @returns {Promise<object[]>}
   */
  async function getSessionHistory(flowId) {
    return WorkflowSession.findAll({
      where: {
        flow_id: flowId,
        status: { [Op.in]: ['completed', 'failed'] },
      },
      include: [{ model: Flow, as: 'flow', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Append a checkpoint object to a session's checkpoints JSONB array.
   * Uses a single UPDATE … || expression to avoid a full read-modify-write race.
   *
   * @param {string} sessionId - UUID
   * @param {object} checkpoint
   * @returns {Promise<object|null>} Updated session, or null if not found
   */
  async function addCheckpoint(sessionId, checkpoint) {
    const transaction = await sequelize.transaction();
    try {
      const session = await WorkflowSession.findByPk(sessionId, { transaction });
      if (!session) {
        await transaction.rollback();
        return null;
      }

      const updated = [...(session.checkpoints ?? []), checkpoint];
      await session.update({ checkpoints: updated }, { transaction });

      await transaction.commit();
      return getSession(sessionId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Append a stage entry to a session's stage_history JSONB array.
   *
   * @param {string} sessionId - UUID
   * @param {object} stageEntry
   * @returns {Promise<object|null>} Updated session, or null if not found
   */
  async function addStageEntry(sessionId, stageEntry) {
    const transaction = await sequelize.transaction();
    try {
      const session = await WorkflowSession.findByPk(sessionId, { transaction });
      if (!session) {
        await transaction.rollback();
        return null;
      }

      const updated = [...(session.stage_history ?? []), stageEntry];
      await session.update({ stage_history: updated }, { transaction });

      await transaction.commit();
      return getSession(sessionId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  return {
    listSessions,
    getSession,
    getCurrentSession,
    createSession,
    updateSession,
    deleteSession,
    getSessionHistory,
    addCheckpoint,
    addStageEntry,
  };
}
