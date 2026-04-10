/**
 * Component Service
 * Business logic for ComponentDefinition CRUD operations
 */

import { Op } from 'sequelize';

/**
 * Create component service with database models
 */
export function createComponentService(db) {
  const { sequelize, ComponentDefinition, ComponentTag } = db;

  /**
   * List components with pagination and filters
   */
  async function list(options = {}) {
    const {
      page = 1,
      limit = 20,
      offset = 0,
      status,
      taxonomyLevel,
      search,
      tags,
      includeTags = true,
    } = options;

    const where = {};
    const include = [];

    if (status) {
      where.status = status;
    }

    if (taxonomyLevel) {
      where.taxonomy_level = taxonomyLevel;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (includeTags) {
      include.push({
        model: ComponentTag,
        as: 'tags',
        through: { attributes: [] },
      });
    }

    if (tags && tags.length > 0) {
      include.push({
        model: ComponentTag,
        as: 'tags',
        where: { name: { [Op.in]: tags } },
        through: { attributes: [] },
        required: true,
      });
    }

    const { count, rows } = await ComponentDefinition.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [['updatedAt', 'DESC']],
      distinct: true,
    });

    return {
      components: rows,
      total: count,
      page,
      limit,
    };
  }

  /**
   * Get component by ID
   */
  async function getById(id, options = {}) {
    const { includeTags = true } = options;
    const include = [];

    if (includeTags) {
      include.push({
        model: ComponentTag,
        as: 'tags',
        through: { attributes: [] },
      });
    }

    return ComponentDefinition.findByPk(id, { include });
  }

  /**
   * Create a new component
   */
  async function create(data, tagNames = []) {
    const transaction = await sequelize.transaction();

    try {
      const component = await ComponentDefinition.create(data, { transaction });

      if (tagNames && tagNames.length > 0) {
        const tags = await Promise.all(
          tagNames.map((name) =>
            ComponentTag.findOrCreate({
              where: { name },
              defaults: { name },
              transaction,
            })
          )
        );
        await component.setTags(
          tags.map(([tag]) => tag),
          { transaction }
        );
      }

      await transaction.commit();

      return getById(component.id, { includeTags: true });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update an existing component
   */
  async function update(id, data, tagNames = null) {
    const transaction = await sequelize.transaction();

    try {
      const component = await ComponentDefinition.findByPk(id, { transaction });
      if (!component) {
        await transaction.rollback();
        return null;
      }

      await component.update(data, { transaction });

      if (tagNames !== null) {
        const tags = await Promise.all(
          tagNames.map((name) =>
            ComponentTag.findOrCreate({
              where: { name },
              defaults: { name },
              transaction,
            })
          )
        );
        await component.setTags(
          tags.map(([tag]) => tag),
          { transaction }
        );
      }

      await transaction.commit();

      return getById(id, { includeTags: true });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete a component
   */
  async function remove(id) {
    const transaction = await sequelize.transaction();

    try {
      const component = await ComponentDefinition.findByPk(id, { transaction });
      if (!component) {
        await transaction.rollback();
        return false;
      }

      // Remove tag associations
      await component.setTags([], { transaction });

      // Delete the component
      await component.destroy({ transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  return {
    list,
    getById,
    create,
    update,
    remove,
  };
}
