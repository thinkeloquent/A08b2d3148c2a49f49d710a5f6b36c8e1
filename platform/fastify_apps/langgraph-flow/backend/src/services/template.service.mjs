/**
 * Template Service
 * Business logic for WorkflowTemplate management and flow creation from templates.
 */

import { Op } from 'sequelize';

/**
 * Create template service with database models.
 *
 * @param {object} db - Fastify db decorator: { sequelize, WorkflowTemplate, Flow, FlowVersion }
 * @returns {object} Template service methods
 */
export function createTemplateService(db) {
  const { sequelize, WorkflowTemplate, Flow, FlowVersion } = db;

  /**
   * List templates with optional category filter and pagination.
   *
   * @param {object} [filters]
   * @param {string}  [filters.category] - Exact category match
   * @param {number}  [filters.page=1]
   * @param {number}  [filters.limit=20]
   * @returns {Promise<{ templates: object[], total: number, page: number, limit: number }>}
   */
  async function listTemplates(filters = {}) {
    const { category, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;

    const { count, rows } = await WorkflowTemplate.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ['sort_order', 'ASC'],
        ['name', 'ASC'],
      ],
      distinct: true,
    });

    return { templates: rows, total: count, page, limit };
  }

  /**
   * Get a single template by ID.
   *
   * @param {string} id - UUID
   * @returns {Promise<object|null>}
   */
  async function getTemplate(id) {
    return WorkflowTemplate.findByPk(id);
  }

  /**
   * Get a template by slug.
   *
   * @param {string} slug
   * @returns {Promise<object|null>}
   */
  async function getTemplateBySlug(slug) {
    return WorkflowTemplate.findOne({ where: { slug } });
  }

  /**
   * Create a new workflow template.
   *
   * @param {object} data
   * @param {string} data.slug
   * @param {string} data.name
   * @param {string} [data.description]
   * @param {string} [data.category='general']
   * @param {object} data.template_data
   * @param {boolean} [data.is_builtin=false]
   * @param {number}  [data.sort_order=0]
   * @returns {Promise<object>} Created template
   */
  async function createTemplate(data) {
    if (!data.slug) {
      const err = new Error('slug is required');
      err.statusCode = 400;
      throw err;
    }
    if (!data.name) {
      const err = new Error('name is required');
      err.statusCode = 400;
      throw err;
    }
    if (!data.template_data || typeof data.template_data !== 'object') {
      const err = new Error('template_data is required and must be an object');
      err.statusCode = 400;
      throw err;
    }

    return WorkflowTemplate.create({
      slug: data.slug,
      name: data.name,
      description: data.description ?? null,
      category: data.category ?? 'general',
      template_data: data.template_data,
      is_builtin: data.is_builtin ?? false,
      sort_order: data.sort_order ?? 0,
    });
  }

  /**
   * Update an existing template.
   * Builtin templates cannot be updated.
   *
   * @param {string} id - UUID
   * @param {object} data - Partial template fields
   * @returns {Promise<object|null>} Updated template, or null if not found
   */
  async function updateTemplate(id, data) {
    const template = await WorkflowTemplate.findByPk(id);
    if (!template) return null;

    if (template.is_builtin) {
      const err = new Error('Builtin templates cannot be modified');
      err.statusCode = 403;
      throw err;
    }

    const allowed = ['name', 'description', 'category', 'template_data', 'sort_order'];
    const updates = {};
    for (const field of allowed) {
      if (data[field] !== undefined) updates[field] = data[field];
    }

    await template.update(updates);
    return getTemplate(id);
  }

  /**
   * Delete a template.
   * Builtin templates cannot be deleted.
   *
   * @param {string} id - UUID
   * @returns {Promise<boolean>} true if deleted, false if not found
   */
  async function deleteTemplate(id) {
    const template = await WorkflowTemplate.findByPk(id);
    if (!template) return false;

    if (template.is_builtin) {
      const err = new Error('Builtin templates cannot be deleted');
      err.statusCode = 403;
      throw err;
    }

    await template.destroy();
    return true;
  }

  /**
   * Create a new Flow from a template.
   * Copies template_data as flow_data, applies name/description overrides,
   * and creates the initial FlowVersion (version 1).
   *
   * @param {string} templateId - UUID
   * @param {object} [overrides]
   * @param {string} [overrides.name]        - Override the template name
   * @param {string} [overrides.description] - Override the template description
   * @returns {Promise<object>} Newly created flow with its initial version
   */
  async function createFlowFromTemplate(templateId, overrides = {}) {
    const template = await WorkflowTemplate.findByPk(templateId);
    if (!template) {
      const err = new Error(`Template not found: ${templateId}`);
      err.statusCode = 404;
      throw err;
    }

    const flowData = structuredClone(template.template_data);
    const name = overrides.name ?? template.name;
    const description =
      overrides.description !== undefined ? overrides.description : template.description;

    const viewport = flowData.viewport ?? { x: 0, y: 0, zoom: 1 };

    const transaction = await sequelize.transaction();
    try {
      const flow = await Flow.create(
        {
          name,
          description,
          viewport_x: viewport.x ?? 0,
          viewport_y: viewport.y ?? 0,
          viewport_zoom: viewport.zoom ?? 1,
          flow_data: flowData,
          source_format: 'native',
        },
        { transaction },
      );

      await FlowVersion.create(
        {
          flow_id: flow.id,
          version: 1,
          flow_data: flowData,
          change_summary: `Created from template: ${template.name}`,
        },
        { transaction },
      );

      await transaction.commit();

      return Flow.findByPk(flow.id, {
        include: [
          {
            model: FlowVersion,
            as: 'versions',
            attributes: ['id', 'version', 'created_at'],
            limit: 1,
            order: [['version', 'DESC']],
            separate: true,
          },
        ],
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  return {
    listTemplates,
    getTemplate,
    getTemplateBySlug,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createFlowFromTemplate,
  };
}
