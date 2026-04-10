/**
 * String Template Serializers
 * Converts Sequelize model instances to API response objects.
 */

/**
 * Serialize a single StringTemplate model to API response shape.
 *
 * @param {object} model - Sequelize StringTemplate instance (or plain object)
 * @returns {object}
 */
export function serializeStringTemplate(model) {
  const plain = model.get ? model.get({ plain: true }) : model;

  return {
    id: plain.id,
    flow_id: plain.flow_id || null,
    key: plain.key,
    value: plain.value,
    locale: plain.locale || 'en',
    context: plain.context || 'default',
    flow: plain.flow ? { id: plain.flow.id, name: plain.flow.name } : null,
    created_at: plain.created_at instanceof Date
      ? plain.created_at.toISOString()
      : plain.created_at || null,
    updated_at: plain.updated_at instanceof Date
      ? plain.updated_at.toISOString()
      : plain.updated_at || null,
  };
}

/**
 * Serialize an array of StringTemplate models.
 *
 * @param {object[]} models
 * @returns {object[]}
 */
export function serializeStringTemplateList(models) {
  return models.map(serializeStringTemplate);
}
