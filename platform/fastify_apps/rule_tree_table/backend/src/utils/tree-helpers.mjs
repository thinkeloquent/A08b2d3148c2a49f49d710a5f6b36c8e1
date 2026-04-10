/**
 * Tree Helper Utilities
 * Functions for traversing and analyzing rule tree structures
 */

/**
 * Count rules in a tree (from flat items list)
 * @param {Array} items - Flat array of RuleItem records
 * @returns {{total: number, groups: number, conditions: number, enabled: number}}
 */
export function countRules(items) {
  let groups = 0;
  let conditions = 0;
  let folders = 0;
  let enabled = 0;

  for (const item of items) {
    if (item.type === 'group' || item.type === 'structural') {
      groups++;
    } else if (item.type === 'folder') {
      folders++;
    } else {
      conditions++;
    }
    if (item.enabled) {
      enabled++;
    }
  }

  return {
    total: groups + conditions + folders,
    groups,
    conditions,
    folders,
    enabled,
  };
}

/**
 * Count rules from a nested tree structure (in-memory / JSON)
 * @param {object} node - Root node of the tree
 * @returns {{total: number, groups: number, conditions: number, enabled: number}}
 */
export function countRulesNested(node) {
  let groups = 0;
  let conditions = 0;
  let folders = 0;
  let enabled = 0;

  function traverse(item, parentEnabled = true) {
    const isEnabled = parentEnabled && item.enabled;
    if (item.type === 'group' || item.type === 'structural') {
      groups++;
      if (isEnabled) enabled++;
      if (item.conditions) {
        item.conditions.forEach((child) => traverse(child, isEnabled));
      }
    } else if (item.type === 'folder') {
      folders++;
      if (isEnabled) enabled++;
      if (item.conditions) {
        item.conditions.forEach((child) => traverse(child, isEnabled));
      }
    } else {
      conditions++;
      if (isEnabled) enabled++;
    }
  }

  if (node.conditions) {
    node.conditions.forEach((child) => traverse(child, node.enabled));
  }

  return {
    total: groups + conditions + folders,
    groups,
    conditions,
    folders,
    enabled,
  };
}

/**
 * Build a nested tree from flat database records
 * @param {Array} flatItems - Flat array of RuleItem model instances
 * @returns {Array} Nested tree structure
 */
export function buildTree(flatItems) {
  const items = flatItems.map((item) => {
    const plain = item.get ? item.get({ plain: true }) : item;
    return { ...plain, conditions: [] };
  });

  const itemMap = new Map();
  const roots = [];

  // Index all items
  for (const item of items) {
    itemMap.set(item.id, item);
  }

  // Build tree by assigning children to parents
  for (const item of items) {
    if (item.parent_id && itemMap.has(item.parent_id)) {
      itemMap.get(item.parent_id).conditions.push(item);
    } else {
      roots.push(item);
    }
  }

  // Sort children by sort_order
  function sortChildren(node) {
    if (node.conditions && node.conditions.length > 0) {
      node.conditions.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      node.conditions.forEach(sortChildren);
    }
  }

  roots.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  roots.forEach(sortChildren);

  return roots;
}

/**
 * Flatten a nested tree into an array of items for database storage
 * @param {Array} tree - Nested tree (array of root nodes)
 * @param {string} treeId - The rule_tree_id to assign
 * @returns {Array} Flat array of item data for bulk insert
 */
export function flattenTree(tree, treeId) {
  const items = [];
  // Map client-side IDs to fresh UUIDs so parent-child refs stay consistent
  const idMap = new Map();

  function ensureUuid(clientId) {
    if (!idMap.has(clientId)) {
      idMap.set(clientId, crypto.randomUUID());
    }
    return idMap.get(clientId);
  }

  function traverse(node, parentUuid, sortOrder) {
    const newId = ensureUuid(node.id);
    const item = {
      id: newId,
      rule_tree_id: treeId,
      parent_id: parentUuid || null,
      type: node.type,
      sort_order: sortOrder,
      enabled: node.enabled !== false,
      // Group fields
      name: node.name || null,
      logic: node.logic || null,
      color: node.color || null,
      // Condition fields
      field: node.field || null,
      operator: node.operator || null,
      value_type: node.value_type || node.valueType || null,
      value: node.value || null,
      data_type: node.data_type || node.dataType || null,
      source_url: node.source_url || node.sourceUrl || null,
      // Structural / AST context fields
      parent_scope: node.parent_scope || node.parentScope || null,
      node_type: node.node_type || node.nodeType || null,
      evaluated_variables: node.evaluated_variables || node.evaluatedVariables || null,
      metadata: node.metadata || null,
    };
    items.push(item);

    if (node.conditions && Array.isArray(node.conditions)) {
      node.conditions.forEach((child, idx) => {
        traverse(child, newId, idx);
      });
    }
  }

  if (Array.isArray(tree)) {
    tree.forEach((root, idx) => traverse(root, null, idx));
  } else {
    traverse(tree, null, 0);
  }

  return items;
}
