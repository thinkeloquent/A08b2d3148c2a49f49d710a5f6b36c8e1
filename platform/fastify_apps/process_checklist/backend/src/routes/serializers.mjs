/**
 * Serializers to transform Sequelize snake_case output to camelCase for the API.
 */

function serializeStep(step) {
  if (!step) return step;
  const s = step.toJSON ? step.toJSON() : { ...step };
  return {
    id: s.id,
    stepId: s.step_id,
    templateId: s.template_id,
    order: s.order,
    title: s.title,
    description: s.description,
    required: s.required,
    tags: s.tags,
    dependencies: s.dependencies,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export function serializeTemplate(template) {
  if (!template) return template;
  const t = template.toJSON ? template.toJSON() : { ...template };
  return {
    id: t.id,
    templateId: t.template_id,
    name: t.name,
    description: t.description,
    version: t.version,
    category: t.category,
    steps: (t.steps || []).map(serializeStep),
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

function serializeChecklistStep(step) {
  if (!step) return step;
  const s = step.toJSON ? step.toJSON() : { ...step };
  return {
    id: s.id,
    checklistId: s.checklist_id,
    order: s.order,
    title: s.title,
    description: s.description,
    required: s.required,
    tags: s.tags,
    dependencies: s.dependencies,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export function serializeChecklist(checklist) {
  if (!checklist) return checklist;
  const c = checklist.toJSON ? checklist.toJSON() : { ...checklist };
  return {
    id: c.id,
    checklistId: c.checklist_id,
    templateRef: c.template_ref,
    generatedAt: c.generated_at,
    metadata: c.metadata,
    steps: (c.steps || []).map(serializeChecklistStep),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}
