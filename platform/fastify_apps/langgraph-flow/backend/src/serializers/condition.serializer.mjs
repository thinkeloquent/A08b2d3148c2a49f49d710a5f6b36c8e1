/**
 * Condition Serializers
 * Converts JSONB condition objects to API response objects.
 */

/**
 * Serialize a single condition JSONB object to API response shape.
 *
 * @param {object} condition - Plain condition object (from JSONB field)
 * @returns {object}
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

/**
 * Serialize an array of condition JSONB objects.
 *
 * @param {object[]} conditions
 * @returns {object[]}
 */
export function serializeConditionList(conditions) {
  return (conditions || []).map(serializeCondition);
}
