/**
 * Session Service
 * Business logic for WorkflowSession CRUD and runtime tracking.
 */

import { Op } from 'sequelize';

export function createSessionService(db) {
  const { sequelize, WorkflowSession, Flow } = db;

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

  async function getSession(id) {
    return WorkflowSession.findByPk(id, {
      include: [{ model: Flow, as: 'flow', attributes: ['id', 'name', 'description'] }],
    });
  }

  async function getCurrentSession(flowId) {
    return WorkflowSession.findOne({
      where: { flow_id: flowId, status: 'active' },
      include: [{ model: Flow, as: 'flow', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
    });
  }

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

  async function deleteSession(id) {
    const session = await WorkflowSession.findByPk(id);
    if (!session) return false;
    await session.destroy();
    return true;
  }

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
