/**
 * Flow Service
 * Business logic for Flow CRUD operations and version management.
 */

import { Op } from 'sequelize';

export function createFlowService(db) {
  const { sequelize, Flow, FlowVersion } = db;

  async function listFlows(filters = {}) {
    const { name, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;
    const where = {};
    if (name) {
      where.name = { [Op.iLike]: `%${name}%` };
    }
    const { count, rows } = await Flow.findAndCountAll({
      where,
      include: [
        {
          model: FlowVersion,
          as: 'versions',
          attributes: ['version'],
          limit: 1,
          order: [['version', 'DESC']],
          separate: true,
        },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true,
    });
    return { flows: rows, total: count, page, limit };
  }

  async function getFlow(id) {
    return Flow.findByPk(id, {
      include: [
        {
          model: FlowVersion,
          as: 'versions',
          attributes: ['id', 'version', 'created_at'],
          limit: 1,
          order: [['version', 'DESC']],
          separate: true,
        },
      ],
    });
  }

  async function createFlow(data) {
    const transaction = await sequelize.transaction();
    try {
      const flow = await Flow.create(
        {
          name: data.name,
          description: data.description ?? null,
          viewport_x: data.viewport_x ?? 0,
          viewport_y: data.viewport_y ?? 0,
          viewport_zoom: data.viewport_zoom ?? 1,
          flow_data: data.flow_data,
          source_format: data.source_format ?? 'native',
        },
        { transaction }
      );
      await FlowVersion.create(
        {
          flow_id: flow.id,
          version: 1,
          flow_data: data.flow_data,
          change_summary: 'Initial version',
        },
        { transaction }
      );
      await transaction.commit();
      return getFlow(flow.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async function updateFlow(id, data) {
    const transaction = await sequelize.transaction();
    try {
      const flow = await Flow.findByPk(id, { transaction });
      if (!flow) {
        await transaction.rollback();
        return null;
      }
      const latestVersion = await FlowVersion.findOne({
        where: { flow_id: id },
        order: [['version', 'DESC']],
        attributes: ['version'],
        transaction,
      });
      const nextVersion = latestVersion ? latestVersion.version + 1 : 1;
      const updateFields = {};
      if (data.name !== undefined) updateFields.name = data.name;
      if (data.description !== undefined) updateFields.description = data.description;
      if (data.viewport_x !== undefined) updateFields.viewport_x = data.viewport_x;
      if (data.viewport_y !== undefined) updateFields.viewport_y = data.viewport_y;
      if (data.viewport_zoom !== undefined) updateFields.viewport_zoom = data.viewport_zoom;
      if (data.flow_data !== undefined) updateFields.flow_data = data.flow_data;
      if (data.source_format !== undefined) updateFields.source_format = data.source_format;
      await flow.update(updateFields, { transaction });
      const snapshotData = data.flow_data !== undefined ? data.flow_data : flow.flow_data;
      await FlowVersion.create(
        {
          flow_id: id,
          version: nextVersion,
          flow_data: snapshotData,
          change_summary: data.change_summary ?? null,
        },
        { transaction }
      );
      await transaction.commit();
      return getFlow(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async function deleteFlow(id) {
    const transaction = await sequelize.transaction();
    try {
      const flow = await Flow.findByPk(id, { transaction });
      if (!flow) {
        await transaction.rollback();
        return false;
      }
      await FlowVersion.destroy({ where: { flow_id: id }, transaction });
      await flow.destroy({ transaction });
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async function getVersions(flowId) {
    return FlowVersion.findAll({
      where: { flow_id: flowId },
      order: [['version', 'DESC']],
    });
  }

  async function restoreVersion(flowId, versionId) {
    const transaction = await sequelize.transaction();
    try {
      const flow = await Flow.findByPk(flowId, { transaction });
      if (!flow) {
        await transaction.rollback();
        return null;
      }
      const version = await FlowVersion.findOne({
        where: { id: versionId, flow_id: flowId },
        transaction,
      });
      if (!version) {
        await transaction.rollback();
        return null;
      }
      const latestVersion = await FlowVersion.findOne({
        where: { flow_id: flowId },
        order: [['version', 'DESC']],
        attributes: ['version'],
        transaction,
      });
      const nextVersion = latestVersion ? latestVersion.version + 1 : 1;
      await flow.update({ flow_data: version.flow_data }, { transaction });
      await FlowVersion.create(
        {
          flow_id: flowId,
          version: nextVersion,
          flow_data: version.flow_data,
          change_summary: `Restored from version ${version.version}`,
        },
        { transaction }
      );
      await transaction.commit();
      return getFlow(flowId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  return {
    listFlows,
    getFlow,
    createFlow,
    updateFlow,
    deleteFlow,
    getVersions,
    restoreVersion,
  };
}
