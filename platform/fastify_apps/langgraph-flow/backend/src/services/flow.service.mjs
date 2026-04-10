/**
 * Flow Service
 * Business logic for Flow CRUD operations and version management.
 */

import { Op } from 'sequelize';

/**
 * Create flow service with database models.
 *
 * @param {object} db - Fastify db decorator: { sequelize, Flow, FlowVersion }
 * @returns {object} Flow service methods
 */
export function createFlowService(db) {
  const { sequelize, Flow, FlowVersion } = db;

  /**
   * List flows with optional name filter and pagination.
   *
   * @param {object} [filters]
   * @param {string} [filters.name] - Partial name match (case-insensitive)
   * @param {number} [filters.page=1]
   * @param {number} [filters.limit=20]
   * @returns {Promise<{ flows: object[], total: number, page: number, limit: number }>}
   */
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

  /**
   * Get a single flow by ID, including its latest version.
   *
   * @param {string} id - UUID
   * @returns {Promise<object|null>}
   */
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

  /**
   * Create a new flow and its initial version (version 1).
   *
   * @param {object} data
   * @param {string} data.name
   * @param {string} [data.description]
   * @param {number} [data.viewport_x=0]
   * @param {number} [data.viewport_y=0]
   * @param {number} [data.viewport_zoom=1]
   * @param {object} data.flow_data
   * @param {string} [data.source_format='native']
   * @returns {Promise<object>} Created flow with initial version
   */
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

  /**
   * Update an existing flow and create a new version snapshot.
   *
   * @param {string} id - UUID
   * @param {object} data - Partial flow fields to update
   * @returns {Promise<object|null>} Updated flow, or null if not found
   */
  async function updateFlow(id, data) {
    const transaction = await sequelize.transaction();

    try {
      const flow = await Flow.findByPk(id, { transaction });
      if (!flow) {
        await transaction.rollback();
        return null;
      }

      // Determine next version number
      const latestVersion = await FlowVersion.findOne({
        where: { flow_id: id },
        order: [['version', 'DESC']],
        attributes: ['version'],
        transaction,
      });
      const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

      // Apply updates
      const updateFields = {};
      if (data.name !== undefined) updateFields.name = data.name;
      if (data.description !== undefined) updateFields.description = data.description;
      if (data.viewport_x !== undefined) updateFields.viewport_x = data.viewport_x;
      if (data.viewport_y !== undefined) updateFields.viewport_y = data.viewport_y;
      if (data.viewport_zoom !== undefined) updateFields.viewport_zoom = data.viewport_zoom;
      if (data.flow_data !== undefined) updateFields.flow_data = data.flow_data;
      if (data.source_format !== undefined) updateFields.source_format = data.source_format;

      await flow.update(updateFields, { transaction });

      // Snapshot the current flow_data (after update) as a new version
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

  /**
   * Hard delete a flow (cascade deletes versions via DB FK or explicit destroy).
   *
   * @param {string} id - UUID
   * @returns {Promise<boolean>} true if deleted, false if not found
   */
  async function deleteFlow(id) {
    const transaction = await sequelize.transaction();

    try {
      const flow = await Flow.findByPk(id, { transaction });
      if (!flow) {
        await transaction.rollback();
        return false;
      }

      // Explicitly delete versions first (handles DBs without cascade FK)
      await FlowVersion.destroy({ where: { flow_id: id }, transaction });

      await flow.destroy({ transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * List all version history for a flow, newest first.
   *
   * @param {string} flowId - UUID
   * @returns {Promise<object[]>}
   */
  async function getVersions(flowId) {
    return FlowVersion.findAll({
      where: { flow_id: flowId },
      order: [['version', 'DESC']],
    });
  }

  /**
   * Restore a flow to a specific version snapshot.
   * Copies flow_data from the target version back onto the flow,
   * then creates a new version recording the restore.
   *
   * @param {string} flowId - UUID
   * @param {string} versionId - UUID of the FlowVersion to restore
   * @returns {Promise<object|null>} Updated flow, or null if not found
   */
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

      // Find next version number
      const latestVersion = await FlowVersion.findOne({
        where: { flow_id: flowId },
        order: [['version', 'DESC']],
        attributes: ['version'],
        transaction,
      });
      const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

      // Restore flow_data from the target version
      await flow.update({ flow_data: version.flow_data }, { transaction });

      // Record the restore as a new version
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
