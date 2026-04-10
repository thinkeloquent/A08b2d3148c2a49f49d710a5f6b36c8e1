/**
 * Condition Serializers
 * Converts JSONB condition objects to API response objects.
 */

export function serializeCondition(condition) {
  return {
    id: condition.id,
    name: condition.name || null,
    field: condition.field,
    operator: condition.operator,
    value: condition.value,
    source_node: condition.source_node || null,
    target_node: condition.target_node || null,
  };
}

export function serializeConditionList(conditions) {
  return (conditions || []).map(serializeCondition);
}
