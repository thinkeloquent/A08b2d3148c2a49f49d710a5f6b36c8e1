/**
 * Template Serializers
 * Converts Sequelize model instances to API response objects.
 */

/**
 * Serialize a single Template model to API response shape.
 *
 * @param {object} model - Sequelize Template instance (or plain object)
 * @returns {object}
 */
export function serializeTemplate(model) {
  const plain = model.get ? model.get({ plain: true }) : model;

  return {
    id: plain.id,
    slug: plain.slug,
    name: plain.name,
    description: plain.description || null,
    category: plain.category || 'general',
    template_data: plain.template_data,
    is_builtin: plain.is_builtin || false,
    sort_order: plain.sort_order || 0,
    created_at: plain.created_at instanceof Date
      ? plain.created_at.toISOString()
      : plain.created_at || null,
    updated_at: plain.updated_at instanceof Date
      ? plain.updated_at.toISOString()
      : plain.updated_at || null,
  };
}

/**
 * Serialize an array of Template models.
 *
 * @param {object[]} models
 * @returns {object[]}
 */
export function serializeTemplateList(models) {
  return models.map(serializeTemplate);
}
