/**
 * Label Service
 * Business logic for Label CRUD operations
 */

import { Op } from 'sequelize';

export function createLabelService(db) {
  const { sequelize, Role, Label } = db;

  /**
   * List all labels with usage counts
   */
  async function list() {
    const labels = await Label.findAll({
      include: [{ model: Role, as: 'roles', through: { attributes: [] }, attributes: ['id'] }],
      order: [['name', 'ASC']],
    });

    return labels.map(l => {
      const plain = l.toJSON();
      plain.usageCount = plain.roles?.length || 0;
      delete plain.roles;
      return plain;
    });
  }

  /**
   * Create a new label
   */
  async function create(data) {
    return Label.create(data);
  }

  /**
   * Update a label by name
   */
  async function update(name, data) {
    const label = await Label.findByPk(name);
    if (!label) return null;

    // Cannot change the name (it's the primary key)
    const { name: _ignoredName, ...updateData } = data;
    await label.update(updateData);
    return label;
  }

  /**
   * Delete a label by name
   */
  async function remove(name) {
    const label = await Label.findByPk(name, {
      include: [{ model: Role, as: 'roles', through: { attributes: [] }, attributes: ['id'] }],
    });

    if (!label) return { found: false };

    // Cannot delete labels that are in use
    if (label.roles && label.roles.length > 0) {
      return { found: true, inUse: true, usageCount: label.roles.length };
    }

    await label.destroy();
    return { found: true, inUse: false };
  }

  return { list, create, update, remove };
}
