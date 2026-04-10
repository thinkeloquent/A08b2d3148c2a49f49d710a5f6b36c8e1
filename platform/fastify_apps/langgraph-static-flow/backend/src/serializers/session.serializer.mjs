/**
 * Session Serializers
 * Converts Sequelize model instances to API response objects.
 */

export function serializeSession(model) {
  const plain = model.get ? model.get({ plain: true }) : model;

  return {
    id: plain.id,
    flow_id: plain.flow_id,
    thread_id: plain.thread_id,
    topic: plain.topic || null,
    status: plain.status,
    iterations: plain.iterations,
    max_iterations: plain.max_iterations,
    current_stage: plain.current_stage || null,
    stage_history: plain.stage_history || [],
    checkpoints: plain.checkpoints || [],
    session_data: plain.session_data || {},
    flow: plain.flow ? { id: plain.flow.id, name: plain.flow.name } : null,
    created_at: plain.created_at instanceof Date
      ? plain.created_at.toISOString()
      : plain.created_at || null,
    updated_at: plain.updated_at instanceof Date
      ? plain.updated_at.toISOString()
      : plain.updated_at || null,
  };
}

export function serializeSessionList(models) {
  return models.map(serializeSession);
}
