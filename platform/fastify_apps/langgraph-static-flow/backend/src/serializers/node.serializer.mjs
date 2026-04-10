/**
 * Node Serializers
 * Converts JSONB node objects to API response objects.
 */

export function serializeNode(node) {
  return {
    id: node.id,
    type: node.type || 'default',
    position: node.position || { x: 0, y: 0 },
    data: node.data || {},
  };
}

export function serializeNodeList(nodes) {
  return (nodes || []).map(serializeNode);
}
