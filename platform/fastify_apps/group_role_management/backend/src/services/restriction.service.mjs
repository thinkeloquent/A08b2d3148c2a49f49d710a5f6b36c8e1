/**
 * Restriction Service
 * Business logic for Restriction CRUD operations
 */

import { Op } from 'sequelize';

export function createRestrictionService(db) {
  const { sequelize, Role, Group, Restriction } = db;

  /**
   * List all restrictions with usage counts
   */
  async function list() {
    const restrictions = await Restriction.findAll({
      include: [
        { model: Role, as: 'roles', through: { attributes: [] }, attributes: ['id'] },
        { model: Group, as: 'groups', through: { attributes: [] }, attributes: ['id'] },
      ],
      order: [['name', 'ASC']],
    });

    return restrictions.map(r => {
      const plain = r.toJSON();
      plain.roleCount = plain.roles?.length || 0;
      plain.groupCount = plain.groups?.length || 0;
      delete plain.roles;
      delete plain.groups;
      return plain;
    });
  }

  /**
   * Create a new restriction
   */
  async function create(data) {
    return Restriction.create(data);
  }

  /**
   * Update a restriction by ID
   */
  async function update(id, data) {
    const restriction = await Restriction.findByPk(id);
    if (!restriction) return null;

    await restriction.update(data);
    return restriction;
  }

  /**
   * Delete a restriction by ID
   */
  async function remove(id) {
    const restriction = await Restriction.findByPk(id, {
      include: [
        { model: Role, as: 'roles', through: { attributes: [] }, attributes: ['id'] },
        { model: Group, as: 'groups', through: { attributes: [] }, attributes: ['id'] },
      ],
    });

    if (!restriction) return { found: false };

    const roleCount = restriction.roles?.length || 0;
    const groupCount = restriction.groups?.length || 0;
    if (roleCount > 0 || groupCount > 0) {
      return { found: true, inUse: true, roleCount, groupCount };
    }

    await restriction.destroy();
    return { found: true, inUse: false };
  }

  /**
   * Search restrictions (for autocomplete)
   */
  async function search(query, limit = 10, excludeIds = []) {
    const where = {
      name: { [Op.iLike]: `%${query}%` },
    };

    if (excludeIds.length > 0) {
      where.id = { [Op.notIn]: excludeIds };
    }

    return Restriction.findAll({ where, limit, order: [['name', 'ASC']] });
  }

  return { list, create, update, remove, search };
}
