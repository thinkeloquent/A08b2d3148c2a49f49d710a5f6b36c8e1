import { Op } from 'sequelize';

/**
 * Deployment Service - Business logic for Deployment operations
 */

export function createDeploymentService(db) {
  const { sequelize, Deployment, PromptVersion, Prompt, Variable } = db;

  async function listByPrompt(promptId) {
    return Deployment.findAll({
      where: { prompt_id: promptId },
      include: [
        { model: PromptVersion, as: 'version', include: [{ model: Variable, as: 'variables' }] },
      ],
      order: [['environment', 'ASC']],
    });
  }

  async function deploy(promptId, environment, versionId, deployedBy = null) {
    const transaction = await sequelize.transaction();

    try {
      // Verify version exists and belongs to prompt
      const version = await PromptVersion.findOne({
        where: { id: versionId, prompt_id: promptId },
        transaction,
      });

      if (!version) {
        await transaction.rollback();
        return null;
      }

      // Upsert deployment
      const [deployment] = await Deployment.upsert({
        prompt_id: promptId,
        environment,
        version_id: versionId,
        deployed_by: deployedBy,
      }, {
        transaction,
        conflictFields: ['prompt_id', 'environment'],
      });

      await transaction.commit();

      return Deployment.findByPk(deployment.id, {
        include: [
          { model: PromptVersion, as: 'version', include: [{ model: Variable, as: 'variables' }] },
        ],
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async function getBySlugAndEnvironment(slug, environment) {
    const prompt = await Prompt.findOne({ where: { slug } });
    if (!prompt) return null;

    const deployment = await Deployment.findOne({
      where: { prompt_id: prompt.id, environment },
      include: [
        {
          model: PromptVersion,
          as: 'version',
          where: { status: { [Op.notIn]: ['archived', 'disabled'] } },
          include: [{ model: Variable, as: 'variables' }],
        },
      ],
    });

    if (!deployment) return null;

    return {
      prompt: { id: prompt.id, slug: prompt.slug, name: prompt.name },
      environment: deployment.environment,
      version: deployment.version,
      deployed_at: deployment.updatedAt,
    };
  }

  /**
   * Render a prompt template with given variables
   */
  function renderTemplate(template, variables) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  return { listByPrompt, deploy, getBySlugAndEnvironment, renderTemplate };
}
