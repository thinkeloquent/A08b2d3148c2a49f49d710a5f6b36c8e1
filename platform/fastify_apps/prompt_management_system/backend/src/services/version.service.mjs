/**
 * Version Service - Business logic for PromptVersion CRUD
 */

/** Extract {{key}} tokens from a template string. */
function extractVariableKeys(template) {
  const matches = template.matchAll(/\{\{(\w+)\}\}/g);
  return [...new Set([...matches].map(m => m[1]))];
}

export function createVersionService(db) {
  const { sequelize, PromptVersion, Variable, Prompt } = db;

  function validateStatusTransition(currentStatus, nextStatus) {
    // Published versions are immutable in status to enforce one-way publish.
    if (currentStatus === 'published' && nextStatus !== 'published') {
      const err = new Error('Published versions cannot be changed back to another status');
      err.code = 'INVALID_STATUS_TRANSITION';
      throw err;
    }

    if (currentStatus === 'archived' && nextStatus !== 'archived') {
      const err = new Error('Archived versions cannot be reactivated');
      err.code = 'INVALID_STATUS_TRANSITION';
      throw err;
    }

    if (currentStatus === 'disabled' && nextStatus !== 'disabled') {
      const err = new Error('Disabled versions cannot be reactivated');
      err.code = 'INVALID_STATUS_TRANSITION';
      throw err;
    }
  }

  async function listByPrompt(promptId, options = {}) {
    const { page = 1, limit = 50 } = options;

    const { count, rows } = await PromptVersion.findAndCountAll({
      where: { prompt_id: promptId },
      include: [{ model: Variable, as: 'variables' }],
      limit,
      offset: (page - 1) * limit,
      order: [['version_number', 'DESC']],
      distinct: true,
    });

    return {
      data: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }

  async function getById(id) {
    return PromptVersion.findByPk(id, {
      include: [
        { model: Variable, as: 'variables' },
        { model: Prompt, as: 'prompt', attributes: ['id', 'slug', 'name'] },
      ],
    });
  }

  async function create(promptId, data) {
    const transaction = await sequelize.transaction();

    try {
      // Get next version number
      const latestVersion = await PromptVersion.findOne({
        where: { prompt_id: promptId },
        order: [['version_number', 'DESC']],
        transaction,
      });

      const nextVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

      const { variables: variablesData, ...versionFields } = data;

      const version = await PromptVersion.create({
        ...versionFields,
        prompt_id: promptId,
        version_number: nextVersionNumber,
      }, { transaction });

      // Use provided variables, or auto-extract from template
      const vars = variablesData?.length
        ? variablesData
        : extractVariableKeys(versionFields.template).map(key => ({ key, type: 'string' }));

      for (const varData of vars) {
        await Variable.create({
          ...varData,
          version_id: version.id,
        }, { transaction });
      }

      await transaction.commit();
      return getById(version.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async function updateStatus(id, status) {
    const version = await PromptVersion.findByPk(id);
    if (!version) return null;
    validateStatusTransition(version.status, status);
    version.status = status;
    await version.save();
    return getById(id);
  }

  async function update(id, data) {
    const transaction = await sequelize.transaction();
    try {
      const version = await PromptVersion.findByPk(id, { transaction });
      if (!version) {
        await transaction.rollback();
        return null;
      }

      if (version.status !== 'draft') {
        const err = new Error('Only draft versions can be edited');
        err.code = 'VERSION_NOT_EDITABLE';
        throw err;
      }

      const updates = {
        template: data.template ?? version.template,
        config: data.config ?? version.config,
        input_schema: data.input_schema ?? version.input_schema,
        commit_message: data.commit_message ?? version.commit_message,
      };

      if (data.status) {
        validateStatusTransition(version.status, data.status);
        updates.status = data.status;
      }

      await version.update(updates, { transaction });

      if (Array.isArray(data.variables)) {
        await Variable.destroy({ where: { version_id: version.id }, transaction });
        const vars = data.variables.length
          ? data.variables
          : extractVariableKeys(updates.template).map(key => ({ key, type: 'string' }));
        for (const varData of vars) {
          await Variable.create({
            ...varData,
            version_id: version.id,
          }, { transaction });
        }
      }

      await transaction.commit();
      return getById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  return { listByPrompt, getById, create, updateStatus, update };
}
