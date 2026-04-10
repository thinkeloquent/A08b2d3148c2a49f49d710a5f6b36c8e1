/**
 * Template Service
 * Business logic for WorkflowTemplate management and flow creation from templates.
 */

import { Op } from 'sequelize';

export function createTemplateService(db) {
  const { sequelize, WorkflowTemplate, Flow, FlowVersion } = db;

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

  async function getTemplate(id) {
    return WorkflowTemplate.findByPk(id);
  }

  async function getTemplateBySlug(slug) {
    return WorkflowTemplate.findOne({ where: { slug } });
  }

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
