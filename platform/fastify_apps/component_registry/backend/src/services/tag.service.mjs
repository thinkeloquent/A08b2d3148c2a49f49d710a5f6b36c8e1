/**
 * Tag Service
 * Business logic for Tag CRUD operations
 */

import { Op } from 'sequelize';

export function createTagService(db) {
  const { sequelize, Component, Tag } = db;

  /**
   * List all tags with usage counts
   */
  async function list() {
    const tags = await Tag.findAll({
      include: [{ model: Component, as: 'components', through: { attributes: [] }, attributes: ['id'] }],
      order: [['name', 'ASC']],
    });

    return tags.map(t => {
      const plain = t.toJSON();
      plain.usageCount = plain.components?.length || 0;
      delete plain.components;
      return plain;
    });
  }

  /**
   * Search tags by name
   */
  async function search(query, limit = 10, excludeIds = []) {
    const where = {};
    if (query) {
      where.name = { [Op.iLike]: `%${query}%` };
    }
    if (excludeIds.length > 0) {
      where.id = { [Op.notIn]: excludeIds };
    }

    return Tag.findAll({
      where,
      limit,
      order: [['name', 'ASC']],
    });
  }

  /**
   * Create a new tag
   */
  async function create(data) {
    return Tag.create(data);
  }

  /**
   * Update a tag by ID
   */
  async function update(id, data) {
    const tag = await Tag.findByPk(id);
    if (!tag) return null;

    await tag.update(data);
    return tag;
  }

  /**
   * Delete a tag by ID
   */
  async function remove(id) {
    const tag = await Tag.findByPk(id, {
      include: [{ model: Component, as: 'components', through: { attributes: [] }, attributes: ['id'] }],
    });

    if (!tag) return { found: false };

    if (tag.components && tag.components.length > 0) {
      return { found: true, inUse: true, usageCount: tag.components.length };
    }

    await tag.destroy();
    return { found: true, inUse: false };
  }

  return { list, search, create, update, remove };
}
