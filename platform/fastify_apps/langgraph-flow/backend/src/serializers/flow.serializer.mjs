/**
 * Flow Serializers
 * Converts Sequelize model instances to API response objects.
 */

/**
 * Serialize a single Flow model to API response shape.
 *
 * @param {object} model - Sequelize Flow instance (or plain object)
 * @returns {object}
 */
export function serializeFlow(model) {
  const plain = model.get ? model.get({ plain: true }) : model;

  // Extract latest version number from included versions association
  let latestVersion = null;
  if (plain.versions && Array.isArray(plain.versions) && plain.versions.length > 0) {
    latestVersion = plain.versions[0].version;
  }

  return {
    id: plain.id,
    name: plain.name,
    description: plain.description || null,
    viewport: {
      x: plain.viewport_x ?? 0,
      y: plain.viewport_y ?? 0,
      zoom: plain.viewport_zoom ?? 1,
    },
    flow_data: plain.flow_data,
    source_format: plain.source_format || 'native',
    created_at: plain.created_at instanceof Date
      ? plain.created_at.toISOString()
      : plain.created_at || null,
    updated_at: plain.updated_at instanceof Date
      ? plain.updated_at.toISOString()
      : plain.updated_at || null,
    latest_version: latestVersion,
  };
}

/**
 * Serialize a single FlowVersion model to API response shape.
 *
 * @param {object} model - Sequelize FlowVersion instance (or plain object)
 * @returns {object}
 */
export function serializeFlowVersion(model) {
  const plain = model.get ? model.get({ plain: true }) : model;

  return {
    id: plain.id,
    flow_id: plain.flow_id,
    version: plain.version,
    flow_data: plain.flow_data,
    change_summary: plain.change_summary || null,
    created_at: plain.created_at instanceof Date
      ? plain.created_at.toISOString()
      : plain.created_at || null,
  };
}

/**
 * Serialize an array of Flow models.
 *
 * @param {object[]} models
 * @returns {object[]}
 */
export function serializeFlowList(models) {
  return models.map(serializeFlow);
}
