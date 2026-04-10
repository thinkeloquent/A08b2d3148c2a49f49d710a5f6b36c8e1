/**
 * String Template Service
 * Business logic for managing localized/contextualized string templates
 * with placeholder substitution.
 */

import { Op } from 'sequelize';

function _interpolate(template, context) {
  if (!context || typeof context !== 'object') return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(context, key) ? String(context[key]) : match,
  );
}

export function createStringTemplateService(db) {
  const { sequelize, StringTemplate } = db;

  async function listTemplates(filters = {}) {
    const { flow_id, locale, context, key_prefix, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;
    const where = {};
    if (flow_id !== undefined) {
      where.flow_id = flow_id === null ? { [Op.is]: null } : flow_id;
    }
    if (locale) where.locale = locale;
    if (context) where.context = context;
    if (key_prefix) where.key = { [Op.like]: `${key_prefix}%` };
    const { count, rows } = await StringTemplate.findAndCountAll({
      where,
      limit,
      offset,
      order: [['key', 'ASC']],
      distinct: true,
    });
    return { templates: rows, total: count, page, limit };
  }

  async function getTemplate(id) {
    return StringTemplate.findByPk(id);
  }

  async function getByKey(key, options = {}) {
    const { flow_id, locale = 'en' } = options;
    const where = { key, locale };
    if (flow_id !== undefined) {
      where.flow_id = flow_id === null ? { [Op.is]: null } : flow_id;
    }
    return StringTemplate.findOne({ where });
  }

  async function createTemplate(data) {
    if (!data.key || typeof data.key !== 'string') {
      const err = new Error('key is required and must be a string');
      err.statusCode = 400;
      throw err;
    }
    if (data.value === undefined || data.value === null) {
      const err = new Error('value is required');
      err.statusCode = 400;
      throw err;
    }
    const locale = data.locale ?? 'en';
    const flowIdWhere = data.flow_id != null
      ? data.flow_id
      : { [Op.is]: null };
    const existing = await StringTemplate.findOne({
      where: { flow_id: flowIdWhere, key: data.key, locale },
    });
    if (existing) {
      const err = new Error(
        `A template with key "${data.key}" and locale "${locale}" already exists for this flow`,
      );
      err.statusCode = 409;
      throw err;
    }
    return StringTemplate.create({
      flow_id: data.flow_id ?? null,
      key: data.key,
      value: String(data.value),
      locale,
      context: data.context ?? 'default',
    });
  }

  async function updateTemplate(id, data) {
    const template = await StringTemplate.findByPk(id);
    if (!template) return null;
    const allowed = ['value', 'locale', 'context'];
    const updates = {};
    for (const field of allowed) {
      if (data[field] !== undefined) updates[field] = data[field];
    }
    await template.update(updates);
    return getTemplate(id);
  }

  async function deleteTemplate(id) {
    const template = await StringTemplate.findByPk(id);
    if (!template) return false;
    await template.destroy();
    return true;
  }

  async function resolveTemplate(key, context = {}, flowId, locale = 'en') {
    if (flowId) {
      const flowTemplate = await StringTemplate.findOne({
        where: { flow_id: flowId, key, locale },
      });
      if (flowTemplate) {
        return _interpolate(flowTemplate.value, context);
      }
    }
    const globalTemplate = await StringTemplate.findOne({
      where: { flow_id: { [Op.is]: null }, key, locale },
    });
    if (globalTemplate) {
      return _interpolate(globalTemplate.value, context);
    }
    return key;
  }

  async function bulkUpsert(templates, flowId) {
    if (!Array.isArray(templates) || templates.length === 0) {
      return [];
    }
    const transaction = await sequelize.transaction();
    try {
      const results = [];
      for (const item of templates) {
        if (!item.key || item.value === undefined) {
          await transaction.rollback();
          const err = new Error('Each template entry must have key and value');
          err.statusCode = 400;
          throw err;
        }
        const locale = item.locale ?? 'en';
        const context = item.context ?? 'default';
        const flowIdWhere = flowId != null ? flowId : { [Op.is]: null };
        const existing = await StringTemplate.findOne({
          where: { flow_id: flowIdWhere, key: item.key, locale },
          transaction,
        });
        if (existing) {
          await existing.update({ value: String(item.value), context }, { transaction });
          results.push(existing);
        } else {
          const created = await StringTemplate.create(
            {
              flow_id: flowId ?? null,
              key: item.key,
              value: String(item.value),
              locale,
              context,
            },
            { transaction },
          );
          results.push(created);
        }
      }
      await transaction.commit();
      return results;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  return {
    listTemplates,
    getTemplate,
    getByKey,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    resolveTemplate,
    bulkUpsert,
  };
}
