/**
 * String Template Service
 * Business logic for managing localized/contextualized string templates
 * with placeholder substitution.
 */

import { Op } from 'sequelize';

/**
 * Resolve {placeholder} tokens in a template string using a context object.
 * Placeholders that have no matching key are left as-is.
 *
 * @param {string} template
 * @param {object} context
 * @returns {string}
 */
function _interpolate(template, context) {
  if (!context || typeof context !== 'object') return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(context, key) ? String(context[key]) : match,
  );
}

/**
 * Create string-template service with database models.
 *
 * @param {object} db - Fastify db decorator: { sequelize, StringTemplate }
 * @returns {object} String template service methods
 */
export function createStringTemplateService(db) {
  const { sequelize, StringTemplate } = db;

  /**
   * List string templates with optional filters and pagination.
   *
   * @param {object} [filters]
   * @param {string}  [filters.flow_id]    - Filter by flow_id (null = global)
   * @param {string}  [filters.locale]     - Exact locale match
   * @param {string}  [filters.context]    - Exact context match
   * @param {string}  [filters.key_prefix] - Key starts-with filter
   * @param {number}  [filters.page=1]
   * @param {number}  [filters.limit=20]
   * @returns {Promise<{ templates: object[], total: number, page: number, limit: number }>}
   */
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

  /**
   * Get a single string template by ID.
   *
   * @param {string} id - UUID
   * @returns {Promise<object|null>}
   */
  async function getTemplate(id) {
    return StringTemplate.findByPk(id);
  }

  /**
   * Get a template by key, optionally scoped to a flow and locale.
   *
   * @param {string} key
   * @param {object} [options]
   * @param {string|null} [options.flow_id] - null means global
   * @param {string}      [options.locale='en']
   * @returns {Promise<object|null>}
   */
  async function getByKey(key, options = {}) {
    const { flow_id, locale = 'en' } = options;

    const where = { key, locale };
    if (flow_id !== undefined) {
      where.flow_id = flow_id === null ? { [Op.is]: null } : flow_id;
    }

    return StringTemplate.findOne({ where });
  }

  /**
   * Create a new string template.
   * Validates uniqueness of (flow_id, key, locale) combination.
   *
   * @param {object} data
   * @param {string|null} [data.flow_id] - null for global
   * @param {string} data.key
   * @param {string} data.value
   * @param {string} [data.locale='en']
   * @param {string} [data.context='default']
   * @returns {Promise<object>} Created template
   */
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

  /**
   * Update value, locale, and/or context of an existing template.
   *
   * @param {string} id - UUID
   * @param {object} data - Partial fields: value, locale, context
   * @returns {Promise<object|null>} Updated template, or null if not found
   */
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

  /**
   * Hard delete a string template.
   *
   * @param {string} id - UUID
   * @returns {Promise<boolean>} true if deleted, false if not found
   */
  async function deleteTemplate(id) {
    const template = await StringTemplate.findByPk(id);
    if (!template) return false;
    await template.destroy();
    return true;
  }

  /**
   * Resolve a template key for a given context and optional flow.
   *
   * Resolution order:
   *   1. Flow-level override (flow_id + key + locale)
   *   2. Global template (flow_id = null + key + locale)
   *   3. Return key as-is if not found
   *
   * Replaces {placeholder} tokens in the resolved value with context values.
   *
   * @param {string} key
   * @param {object} [context={}]   - Placeholder substitution values
   * @param {string} [flowId]       - UUID of the flow scope to check first
   * @param {string} [locale='en']
   * @returns {Promise<string>}
   */
  async function resolveTemplate(key, context = {}, flowId, locale = 'en') {
    // Try flow-level override first
    if (flowId) {
      const flowTemplate = await StringTemplate.findOne({
        where: { flow_id: flowId, key, locale },
      });
      if (flowTemplate) {
        return _interpolate(flowTemplate.value, context);
      }
    }

    // Fall back to global template
    const globalTemplate = await StringTemplate.findOne({
      where: { flow_id: { [Op.is]: null }, key, locale },
    });
    if (globalTemplate) {
      return _interpolate(globalTemplate.value, context);
    }

    // Last resort: return the key itself
    return key;
  }

  /**
   * Upsert multiple string templates for a given flow in a single transaction.
   * Each entry is matched on (flow_id, key, locale); existing records are
   * updated, new ones are created.
   *
   * @param {Array<{ key: string, value: string, locale?: string, context?: string }>} templates
   * @param {string|null} flowId - UUID or null for global
   * @returns {Promise<object[]>} Array of upserted template records
   */
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
