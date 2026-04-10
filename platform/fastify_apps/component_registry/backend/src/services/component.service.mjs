/**
 * Component Service
 * Business logic for Component CRUD operations
 */

import { Op } from 'sequelize';

export function createComponentService(db) {
  const { sequelize, Component, Tag } = db;

  const INCLUDE_ALL = [
    { model: Tag, as: 'tags', through: { attributes: [] } },
  ];

  /**
   * List components with pagination and filters
   */
  async function list(options = {}) {
    const {
      page = 1,
      limit = 50,
      search,
      status,
      category,
      author,
      sort = 'createdAt',
      order = 'DESC',
    } = options;

    const where = {};
    const include = [...INCLUDE_ALL];

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (author) {
      where.author = author;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Map sort field
    const validSorts = ['name', 'downloads', 'stars', 'version', 'createdAt', 'updatedAt'];
    const sortField = validSorts.includes(sort) ? sort : 'createdAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await Component.findAndCountAll({
      where,
      include,
      limit,
      offset: (page - 1) * limit,
      order: [[sortField, sortOrder]],
      distinct: true,
    });

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get component by ID with associations
   */
  async function getById(id) {
    return Component.findByPk(id, { include: INCLUDE_ALL });
  }

  /**
   * Create a new component
   */
  async function create(data, tagIds = []) {
    const transaction = await sequelize.transaction();

    try {
      const component = await Component.create(data, { transaction });

      if (tagIds.length > 0) {
        const tags = await Tag.findAll({
          where: { id: { [Op.in]: tagIds } },
          transaction,
        });
        await component.setTags(tags, { transaction });
      }

      await transaction.commit();
      return getById(component.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update an existing component
   */
  async function update(id, data, tagIds = null) {
    const transaction = await sequelize.transaction();

    try {
      const component = await Component.findByPk(id, { transaction });
      if (!component) {
        await transaction.rollback();
        return null;
      }

      await component.update(data, { transaction });

      if (tagIds !== null) {
        const tags = await Tag.findAll({
          where: { id: { [Op.in]: tagIds } },
          transaction,
        });
        await component.setTags(tags, { transaction });
      }

      await transaction.commit();
      return getById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete a component (hard delete)
   */
  async function remove(id) {
    const transaction = await sequelize.transaction();

    try {
      const component = await Component.findByPk(id, { transaction });
      if (!component) {
        await transaction.rollback();
        return false;
      }

      await component.setTags([], { transaction });
      await component.destroy({ transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get stats (aggregate data)
   */
  async function getStats() {
    const totalComponents = await Component.count();
    const totalDownloads = await Component.sum('downloads') || 0;

    const authors = await Component.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('author')), 'author']],
      raw: true,
    });
    const activePublishers = authors.length;

    return {
      totalComponents,
      totalDownloads,
      activePublishers,
    };
  }

  /**
   * Get unique authors
   */
  async function getAuthors() {
    const authors = await Component.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('author')), 'author']],
      order: [['author', 'ASC']],
      raw: true,
    });
    return authors.map(a => a.author);
  }

  return { list, getById, create, update, remove, getStats, getAuthors };
}
