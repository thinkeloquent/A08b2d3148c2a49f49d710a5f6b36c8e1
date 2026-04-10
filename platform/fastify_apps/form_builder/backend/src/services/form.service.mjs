/**
 * Form Service
 * Business logic for FormDefinition CRUD operations
 */

import { Op } from 'sequelize';

/**
 * Create form service with database models
 */
export function createFormService(db) {
  const { sequelize, FormDefinition, FormDefinitionTag, FormDefinitionVersion } = db;

  /**
   * List forms with pagination and filters
   */
  async function list(options = {}) {
    const {
      page = 1,
      limit = 20,
      offset = 0,
      status,
      search,
      tags,
      includeTags = true,
    } = options;

    const where = {};
    const include = [];

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (includeTags) {
      include.push({
        model: FormDefinitionTag,
        as: 'tags',
        through: { attributes: [] },
      });
    }

    if (tags && tags.length > 0) {
      include.push({
        model: FormDefinitionTag,
        as: 'tags',
        where: { name: { [Op.in]: tags } },
        through: { attributes: [] },
        required: true,
      });
    }

    const { count, rows } = await FormDefinition.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [['updatedAt', 'DESC']],
      distinct: true,
    });

    return {
      forms: rows,
      total: count,
      page,
      limit,
    };
  }

  /**
   * Get form by ID
   */
  async function getById(id, options = {}) {
    const { includeTags = true, includeVersions = false } = options;
    const include = [];

    if (includeTags) {
      include.push({
        model: FormDefinitionTag,
        as: 'tags',
        through: { attributes: [] },
      });
    }

    if (includeVersions) {
      include.push({
        model: FormDefinitionVersion,
        as: 'versions',
        order: [['createdAt', 'DESC']],
      });
    }

    return FormDefinition.findByPk(id, { include });
  }

  /**
   * Create a new form
   */
  async function create(data, tagNames = []) {
    const transaction = await sequelize.transaction();

    try {
      const form = await FormDefinition.create(data, { transaction });

      if (tagNames && tagNames.length > 0) {
        const tags = await Promise.all(
          tagNames.map((name) =>
            FormDefinitionTag.findOrCreate({
              where: { name },
              defaults: { name },
              transaction,
            })
          )
        );
        await form.setTags(
          tags.map(([tag]) => tag),
          { transaction }
        );
      }

      await transaction.commit();

      return getById(form.id, { includeTags: true });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update an existing form
   */
  async function update(id, data, tagNames = null) {
    const transaction = await sequelize.transaction();

    try {
      const form = await FormDefinition.findByPk(id, { transaction });
      if (!form) {
        await transaction.rollback();
        return null;
      }

      await form.update(data, { transaction });

      if (tagNames !== null) {
        const tags = await Promise.all(
          tagNames.map((name) =>
            FormDefinitionTag.findOrCreate({
              where: { name },
              defaults: { name },
              transaction,
            })
          )
        );
        await form.setTags(
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
   * Delete a form
   */
  async function remove(id) {
    const transaction = await sequelize.transaction();

    try {
      const form = await FormDefinition.findByPk(id, { transaction });
      if (!form) {
        await transaction.rollback();
        return false;
      }

      // Delete versions
      await FormDefinitionVersion.destroy({
        where: { form_definition_id: id },
        transaction,
      });

      // Remove tag associations
      await form.setTags([], { transaction });

      // Delete the form
      await form.destroy({ transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Create a version snapshot of the current form state
   */
  async function createVersion(formId, changeSummary = null) {
    const form = await FormDefinition.findByPk(formId);
    if (!form) return null;

    return FormDefinitionVersion.create({
      form_definition_id: formId,
      version: form.version,
      schema_data: form.schema_data,
      metadata_data: form.metadata_data,
      change_summary: changeSummary,
    });
  }

  /**
   * List versions for a form
   */
  async function listVersions(formId) {
    return FormDefinitionVersion.findAll({
      where: { form_definition_id: formId },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get a specific version
   */
  async function getVersion(versionId) {
    return FormDefinitionVersion.findByPk(versionId);
  }

  /**
   * Restore a form to a previous version
   */
  async function restoreVersion(formId, versionId) {
    const version = await FormDefinitionVersion.findByPk(versionId);
    if (!version || version.form_definition_id !== formId) return null;

    const form = await FormDefinition.findByPk(formId);
    if (!form) return null;

    // Snapshot current state before restoring
    await createVersion(formId, `Auto-snapshot before restoring to version ${version.version}`);

    // Restore
    await form.update({
      version: version.version,
      schema_data: version.schema_data,
      metadata_data: version.metadata_data,
    });

    return form;
  }

  /**
   * Import form from JSON/YAML content
   */
  async function importFromContent(content, createdBy = null) {
    const data = {
      name: content.name || 'Imported Form',
      description: content.description || '',
      version: content.version || '1.0.0',
      status: 'draft',
      created_by: createdBy,
      schema_data: content.schema || content,
      metadata_data: content.metadata || null,
    };

    return create(data, content.tagNames || []);
  }

  /**
   * Export form content
   */
  async function exportToContent(id) {
    const form = await getById(id, { includeTags: true });
    if (!form) return null;

    const plain = form.get({ plain: true });
    return {
      name: plain.name,
      description: plain.description,
      version: plain.version,
      schema: plain.schema_data,
      metadata: plain.metadata_data,
      tagNames: (plain.tags || []).map(t => t.name),
      exportedAt: new Date().toISOString(),
    };
  }

  return {
    list,
    getById,
    create,
    update,
    remove,
    createVersion,
    listVersions,
    getVersion,
    restoreVersion,
    importFromContent,
    exportToContent,
  };
}
