/**
 * Figma File Service
 * Business logic for FigmaFile CRUD operations
 */

import { Op } from 'sequelize';

/**
 * Create Figma file service with database models
 */
export function createFigmaFileService(db) {
  const { sequelize, FigmaFile, FigmaFileTag } = db;

  /**
   * List Figma files with pagination and filters
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
      editorType,
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

    // Filter by editor_type
    if (editorType) {
      where.editor_type = editorType;
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
        model: FigmaFileTag,
        as: 'tags',
        through: { attributes: [] },
      });
    }

    // Include metadata if requested
    if (includeMetadata) {
      include.push({
        model: db.FigmaFileMetadata,
        as: 'metadata',
      });
    }

    // Filter by tag names
    if (tags && tags.length > 0) {
      include.push({
        model: FigmaFileTag,
        as: 'tags',
        where: { name: { [Op.in]: tags } },
        through: { attributes: [] },
        required: true,
      });
    }

    const { count, rows } = await FigmaFile.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return {
      figmaFiles: rows,
      total: count,
      page,
      limit,
    };
  }

  /**
   * Get Figma file by ID
   */
  async function getById(id, options = {}) {
    const { includeTags = false, includeMetadata = false } = options;
    const include = [];

    if (includeTags) {
      include.push({
        model: FigmaFileTag,
        as: 'tags',
        through: { attributes: [] },
      });
    }

    if (includeMetadata) {
      include.push({
        model: db.FigmaFileMetadata,
        as: 'metadata',
      });
    }

    return FigmaFile.findByPk(id, { include });
  }

  /**
   * Create a new Figma file
   */
  async function create(data, tagNames = []) {
    const transaction = await sequelize.transaction();

    try {
      // Create the Figma file
      const figmaFile = await FigmaFile.create(data, { transaction });

      // Associate tags if provided
      if (tagNames && tagNames.length > 0) {
        const tags = await Promise.all(
          tagNames.map((name) =>
            FigmaFileTag.findOrCreate({
              where: { name },
              defaults: { name },
              transaction,
            })
          )
        );
        await figmaFile.setTags(
          tags.map(([tag]) => tag),
          { transaction }
        );
      }

      await transaction.commit();

      // Reload with associations
      return getById(figmaFile.id, { includeTags: true, includeMetadata: true });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update an existing Figma file
   */
  async function update(id, data, tagNames = null) {
    const transaction = await sequelize.transaction();

    try {
      const figmaFile = await FigmaFile.findByPk(id, { transaction });
      if (!figmaFile) {
        await transaction.rollback();
        return null;
      }

      // Update Figma file fields
      await figmaFile.update(data, { transaction });

      // Update tags if provided
      if (tagNames !== null) {
        const tags = await Promise.all(
          tagNames.map((name) =>
            FigmaFileTag.findOrCreate({
              where: { name },
              defaults: { name },
              transaction,
            })
          )
        );
        await figmaFile.setTags(
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
   * Delete a Figma file
   */
  async function remove(id) {
    const transaction = await sequelize.transaction();

    try {
      const figmaFile = await FigmaFile.findByPk(id, { transaction });
      if (!figmaFile) {
        await transaction.rollback();
        return false;
      }

      // Delete associated metadata
      await db.FigmaFileMetadata.destroy({
        where: { figma_file_id: id },
        transaction,
      });

      // Remove tag associations (handled by cascade in belongsToMany)
      await figmaFile.setTags([], { transaction });

      // Delete the Figma file
      await figmaFile.destroy({ transaction });

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
