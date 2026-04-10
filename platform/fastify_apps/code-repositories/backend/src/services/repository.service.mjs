/**
 * Repository Service
 * Business logic for CodeRepository CRUD operations
 */

import { Op } from 'sequelize';

/**
 * Create repository service with database models
 */
export function createRepositoryService(db) {
  const { sequelize, CodeRepository, CodeRepositoryTag } = db;

  /**
   * List repositories with pagination and filters
   */
  async function list(options = {}) {
    const {
      page = 1,
      limit = 20,
      offset = 0,
      type,
      status,
      search,
      tags,
      trending,
      verified,
      includeTags = false,
      includeMetadata = false,
    } = options;

    const where = {};
    const include = [];

    // Filter by type
    if (type) {
      where.type = type;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Search by name or description
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filter by trending
    if (trending !== undefined) {
      where.trending = trending;
    }

    // Filter by verified
    if (verified !== undefined) {
      where.verified = verified;
    }

    // Include tags if requested
    if (includeTags) {
      include.push({
        model: CodeRepositoryTag,
        as: 'tags',
        through: { attributes: [] },
      });
    }

    // Include metadata if requested
    if (includeMetadata) {
      include.push({
        model: db.CodeRepositoryMetadata,
        as: 'metadata',
      });
    }

    // Filter by tag names
    if (tags && tags.length > 0) {
      include.push({
        model: CodeRepositoryTag,
        as: 'tags',
        where: { name: { [Op.in]: tags } },
        through: { attributes: [] },
        required: true,
      });
    }

    const { count, rows } = await CodeRepository.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return {
      repositories: rows,
      total: count,
      page,
      limit,
    };
  }

  /**
   * Get repository by ID
   */
  async function getById(id, options = {}) {
    const { includeTags = false, includeMetadata = false } = options;
    const include = [];

    if (includeTags) {
      include.push({
        model: CodeRepositoryTag,
        as: 'tags',
        through: { attributes: [] },
      });
    }

    if (includeMetadata) {
      include.push({
        model: db.CodeRepositoryMetadata,
        as: 'metadata',
      });
    }

    return CodeRepository.findByPk(id, { include });
  }

  /**
   * Create a new repository
   */
  async function create(data, tagNames = []) {
    const transaction = await sequelize.transaction();

    try {
      // Create the repository
      const repository = await CodeRepository.create(data, { transaction });

      // Associate tags if provided
      if (tagNames && tagNames.length > 0) {
        const tags = await Promise.all(
          tagNames.map((name) =>
            CodeRepositoryTag.findOrCreate({
              where: { name },
              defaults: { name },
              transaction,
            })
          )
        );
        await repository.setTags(
          tags.map(([tag]) => tag),
          { transaction }
        );
      }

      await transaction.commit();

      // Reload with associations
      return getById(repository.id, { includeTags: true, includeMetadata: true });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update an existing repository
   */
  async function update(id, data, tagNames = null) {
    const transaction = await sequelize.transaction();

    try {
      const repository = await CodeRepository.findByPk(id, { transaction });
      if (!repository) {
        await transaction.rollback();
        return null;
      }

      // Update repository fields
      await repository.update(data, { transaction });

      // Update tags if provided
      if (tagNames !== null) {
        const tags = await Promise.all(
          tagNames.map((name) =>
            CodeRepositoryTag.findOrCreate({
              where: { name },
              defaults: { name },
              transaction,
            })
          )
        );
        await repository.setTags(
          tags.map(([tag]) => tag),
          { transaction }
        );
      }

      await transaction.commit();

      // Reload with associations
      return getById(id, { includeTags: true, includeMetadata: true });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete a repository
   */
  async function remove(id) {
    const transaction = await sequelize.transaction();

    try {
      const repository = await CodeRepository.findByPk(id, { transaction });
      if (!repository) {
        await transaction.rollback();
        return false;
      }

      // Delete associated metadata
      await db.CodeRepositoryMetadata.destroy({
        where: { repository_id: id },
        transaction,
      });

      // Remove tag associations (handled by cascade in belongsToMany)
      await repository.setTags([], { transaction });

      // Delete the repository
      await repository.destroy({ transaction });

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
