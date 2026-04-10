/**
 * Action Service
 * Business logic for Action CRUD operations
 */

import { Op } from 'sequelize';

export function createActionService(db) {
  const { sequelize, Role, Group, Action } = db;

  /**
   * List all actions with usage counts
   */
  async function list() {
    const actions = await Action.findAll({
      include: [
        { model: Role, as: 'roles', through: { attributes: [] }, attributes: ['id'] },
        { model: Group, as: 'groups', through: { attributes: [] }, attributes: ['id'] },
      ],
      order: [['name', 'ASC']],
    });

    return actions.map(a => {
      const plain = a.toJSON();
      plain.roleCount = plain.roles?.length || 0;
      plain.groupCount = plain.groups?.length || 0;
      delete plain.roles;
      delete plain.groups;
      return plain;
    });
  }

  /**
   * Create a new action
   */
  async function create(data) {
    return Action.create(data);
  }

  /**
   * Update an action by ID
   */
  async function update(id, data) {
    const action = await Action.findByPk(id);
    if (!action) return null;

    await action.update(data);
    return action;
  }

  /**
   * Delete an action by ID
   */
  async function remove(id) {
    const action = await Action.findByPk(id, {
      include: [
        { model: Role, as: 'roles', through: { attributes: [] }, attributes: ['id'] },
        { model: Group, as: 'groups', through: { attributes: [] }, attributes: ['id'] },
      ],
    });

    if (!action) return { found: false };

    const roleCount = action.roles?.length || 0;
    const groupCount = action.groups?.length || 0;
    if (roleCount > 0 || groupCount > 0) {
      return { found: true, inUse: true, roleCount, groupCount };
    }

    await action.destroy();
    return { found: true, inUse: false };
  }

  /**
   * Search actions (for autocomplete)
   */
  async function search(query, limit = 10, excludeIds = []) {
    const where = {
      name: { [Op.iLike]: `%${query}%` },
    };

    if (excludeIds.length > 0) {
      where.id = { [Op.notIn]: excludeIds };
    }

    return Action.findAll({ where, limit, order: [['name', 'ASC']] });
  }

  return { list, create, update, remove, search };
}
