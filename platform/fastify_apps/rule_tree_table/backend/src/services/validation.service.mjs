/**
 * Validation Service
 * Validates rule items and tree structures
 */

/**
 * Validate a rule item recursively
 * @param {object} item - Rule item to validate
 * @returns {{isValid: boolean, errors: string[]}}
 */
export function validateRuleItem(item) {
  const errors = [];

  if (!item.id) errors.push('Missing id');
  if (!item.type || !['group', 'condition', 'folder', 'structural'].includes(item.type)) {
    errors.push('Invalid type: must be "group", "condition", "folder", or "structural"');
  }

  if (item.type === 'group') {
    if (item.logic !== null && (!item.logic || !['AND', 'OR', 'NOT', 'XOR'].includes(item.logic))) {
      errors.push('Invalid logic: must be AND, OR, NOT, XOR, or null');
    }
    if (!Array.isArray(item.conditions)) {
      errors.push('Group must have conditions array');
    } else {
      item.conditions.forEach((child, index) => {
        const childValidation = validateRuleItem(child);
        if (!childValidation.isValid) {
          errors.push(`Child ${index}: ${childValidation.errors.join(', ')}`);
        }
      });
    }
  } else if (item.type === 'structural') {
    if (!item.nodeType && !item.node_type) {
      errors.push('Structural node missing nodeType');
    }
    if (!Array.isArray(item.conditions)) {
      errors.push('Structural node must have conditions array');
    } else {
      item.conditions.forEach((child, index) => {
        const childValidation = validateRuleItem(child);
        if (!childValidation.isValid) {
          errors.push(`Child ${index}: ${childValidation.errors.join(', ')}`);
        }
      });
    }
  } else if (item.type === 'folder') {
    if (!item.name) {
      errors.push('Folder missing name');
    }
    if (!Array.isArray(item.conditions)) {
      errors.push('Folder must have conditions array');
    } else {
      item.conditions.forEach((child, index) => {
        const childValidation = validateRuleItem(child);
        if (!childValidation.isValid) {
          errors.push(`Child ${index}: ${childValidation.errors.join(', ')}`);
        }
      });
    }
  } else if (item.type === 'condition') {
    // For conditional_logic graph type, field/operator/valueType are required
    // For other graph types, conditions may use metadata instead
    if (!item.graphType || item.graphType === 'conditional_logic') {
      if (!item.field) errors.push('Condition missing field');
      if (!item.operator) errors.push('Condition missing operator');
      if (item.valueType && !['value', 'field', 'function', 'regex'].includes(item.valueType)) {
        errors.push('Invalid valueType');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a complete tree structure
 * Validates the root node and all its children recursively
 * @param {object} tree - Tree root node to validate
 * @returns {{isValid: boolean, errors: string[]}}
 */
export function validateTree(tree) {
  const errors = [];

  if (!tree) {
    return { isValid: false, errors: ['Tree is required'] };
  }

  if (!tree.id) errors.push('Tree root missing id');
  if (tree.type !== 'group') {
    errors.push('Tree root must be of type "group"');
  }

  // Validate the root as a rule item
  const rootValidation = validateRuleItem(tree);
  if (!rootValidation.isValid) {
    errors.push(...rootValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
