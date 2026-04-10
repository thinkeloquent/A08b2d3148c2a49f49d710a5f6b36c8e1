/**
 * Node Serializers
 * Converts JSONB node objects to API response objects.
 */

/**
 * Serialize a single node JSONB object to API response shape.
 *
 * @param {object} node - Plain node object (from JSONB field)
 * @returns {object}
 */
export function serializeNode(node) {
  return {
    id: node.id,
    type: node.type || 'default',
    position: node.position || { x: 0, y: 0 },
    data: node.data || {},
  };
}

/**
 * Serialize an array of node JSONB objects.
 *
 * @param {object[]} nodes
 * @returns {object[]}
 */
export function serializeNodeList(nodes) {
  return (nodes || []).map(serializeNode);
}
