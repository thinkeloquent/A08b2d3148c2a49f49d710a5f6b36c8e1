/**
 * Tree manipulation utilities shared across frontend and admin
 */

import type { RuleGroup, RuleFolder, RuleStructural, RuleItem, RuleCondition, ApiStats } from '../types/rule.types';

/** Type guard: item is a container (group, folder, or structural) with children */
export function isContainer(item: RuleItem): item is RuleGroup | RuleFolder | RuleStructural {
  return item.type === 'group' || item.type === 'folder' || item.type === 'structural';
}

export function generateId(): string {
  return `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function countRules(node: RuleGroup): ApiStats {
  let groups = 0;
  let conditions = 0;
  let folders = 0;
  let enabled = 0;

  function traverse(item: RuleItem, parentEnabled = true) {
    const isEnabled = parentEnabled && item.enabled;
    if (item.type === 'group' || item.type === 'structural') {
      groups++;
      if (isEnabled) enabled++;
      const group = item as RuleGroup | RuleStructural;
      if (group.conditions) {
        group.conditions.forEach((child) => traverse(child, isEnabled));
      }
    } else if (item.type === 'folder') {
      folders++;
      if (isEnabled) enabled++;
      const folder = item as RuleFolder;
      if (folder.conditions) {
        folder.conditions.forEach((child) => traverse(child, isEnabled));
      }
    } else {
      conditions++;
      if (isEnabled) enabled++;
    }
  }

  if (node.conditions) {
    node.conditions.forEach((child) => traverse(child, node.enabled));
  }

  return { total: groups + conditions + folders, groups, conditions, folders, enabled };
}

/** Recursively add a condition to the tree under the given parent */
export function addConditionToTree(
  node: RuleGroup,
  parentId: string,
  newCondition: RuleCondition,
): RuleGroup {
  if (node.id === parentId) {
    return { ...node, conditions: [...node.conditions, newCondition], expanded: true };
  }
  return {
    ...node,
    conditions: node.conditions.map((child) =>
      isContainer(child)
        ? addConditionToTree(child as RuleGroup, parentId, newCondition)
        : child,
    ),
  };
}

export function addGroupToTree(
  node: RuleGroup,
  parentId: string,
  newGroup: RuleGroup,
): RuleGroup {
  if (node.id === parentId) {
    return { ...node, conditions: [...node.conditions, newGroup], expanded: true };
  }
  return {
    ...node,
    conditions: node.conditions.map((child) =>
      isContainer(child)
        ? addGroupToTree(child as RuleGroup, parentId, newGroup)
        : child,
    ),
  };
}

/** Recursively add a folder to the tree under the given parent */
export function addFolderToTree(
  node: RuleGroup,
  parentId: string,
  newFolder: RuleFolder,
): RuleGroup {
  if (node.id === parentId) {
    return { ...node, conditions: [...node.conditions, newFolder], expanded: true };
  }
  return {
    ...node,
    conditions: node.conditions.map((child) =>
      isContainer(child)
        ? addFolderToTree(child as RuleGroup, parentId, newFolder)
        : child,
    ),
  };
}

export function deleteFromTree(node: RuleGroup, id: string): RuleGroup {
  return {
    ...node,
    conditions: node.conditions
      .filter((child) => child.id !== id)
      .map((child) =>
        isContainer(child) ? deleteFromTree(child as RuleGroup, id) : child,
      ),
  };
}

export function updateItemInTree(node: RuleGroup, updated: RuleItem): RuleGroup {
  return {
    ...node,
    conditions: node.conditions.map((child) => {
      if (child.id === updated.id) return updated;
      return isContainer(child)
        ? updateItemInTree(child as RuleGroup, updated)
        : child;
    }),
  };
}

export function toggleExpandInTree(node: RuleGroup, id: string): RuleGroup {
  if (node.id === id) {
    return { ...node, expanded: !node.expanded };
  }
  return {
    ...node,
    conditions: node.conditions.map((child) =>
      isContainer(child) ? toggleExpandInTree(child as RuleGroup, id) : child,
    ),
  };
}

export function duplicateItem(item: RuleItem): RuleItem {
  const newItem = { ...item, id: generateId() };
  if (isContainer(newItem)) {
    const container = newItem as RuleGroup | RuleFolder;
    return {
      ...container,
      name: `${container.name} (Copy)`,
      conditions: container.conditions.map(duplicateItem),
    } as RuleItem;
  }
  return newItem;
}

export function findParentOf(
  node: RuleGroup,
  id: string,
): { parent: RuleGroup; index: number } | null {
  for (let i = 0; i < node.conditions.length; i++) {
    if (node.conditions[i].id === id) {
      return { parent: node, index: i };
    }
    const child = node.conditions[i];
    if (isContainer(child)) {
      const result = findParentOf(child as RuleGroup, id);
      if (result) return result;
    }
  }
  return null;
}

function isDescendantOrSelf(node: RuleGroup, ancestorId: string, nodeId: string): boolean {
  if (ancestorId === nodeId) return true;

  function findNode(current: RuleItem, targetId: string): RuleItem | null {
    if (current.id === targetId) return current;
    if (isContainer(current)) {
      for (const child of (current as RuleGroup).conditions) {
        const found = findNode(child, targetId);
        if (found) return found;
      }
    }
    return null;
  }

  const ancestor = findNode(node, ancestorId);
  if (!ancestor || !isContainer(ancestor)) return false;
  return findNode(ancestor, nodeId) !== null;
}

/**
 * Recursively normalize an API response tree from snake_case to camelCase.
 * Handles: condition (value_type→valueType, data_type→dataType),
 * structural (parent_scope→parentScope, node_type→nodeType, evaluated_variables→evaluatedVariables),
 * and source_url→sourceUrl on all items.
 */
export function normalizeApiTree(node: unknown): RuleItem {
  const raw = node as Record<string, unknown>;
  const base = {
    id: raw.id as string,
    type: raw.type as string,
    enabled: raw.enabled !== false,
    description: (raw.description as string) || undefined,
    sourceUrl: (raw.source_url || raw.sourceUrl) as string | undefined,
    expanded: raw.expanded !== false,
    color: raw.color as string | undefined,
    parentScope: (raw.parent_scope || raw.parentScope || null) as string | null,
  };

  if (raw.type === 'condition') {
    return {
      ...base,
      type: 'condition',
      field: (raw.field || '') as string,
      operator: (raw.operator || 'equals') as string,
      value: (raw.value ?? '') as string,
      valueType: (raw.valueType || raw.value_type || 'value') as 'value' | 'field' | 'function' | 'regex',
      dataType: (raw.dataType || raw.data_type || 'string') as 'string' | 'number' | 'boolean' | 'date',
      validation: raw.validation as RuleCondition['validation'],
    } as RuleCondition;
  }

  // Container types — normalize children
  const children = Array.isArray(raw.conditions) ? raw.conditions.map(normalizeApiTree) : [];

  if (raw.type === 'structural') {
    return {
      ...base,
      type: 'structural',
      name: (raw.name || '') as string,
      parentScope: (raw.parent_scope || raw.parentScope || null) as string | null,
      nodeType: (raw.node_type || raw.nodeType || 'scope') as string,
      evaluatedVariables: (raw.evaluated_variables || raw.evaluatedVariables || []) as string[],
      conditions: children,
    } as RuleStructural;
  }

  if (raw.type === 'folder') {
    return {
      ...base,
      type: 'folder',
      name: (raw.name || '') as string,
      conditions: children,
    } as RuleFolder;
  }

  // Default: group
  return {
    ...base,
    type: 'group',
    name: (raw.name || '') as string,
    logic: (raw.logic || 'AND') as 'AND' | 'OR' | 'NOT' | 'XOR',
    conditions: children,
  } as RuleGroup;
}

export function moveItemInTree(
  root: RuleGroup,
  itemId: string,
  targetParentId: string,
  targetIndex: number,
): RuleGroup {
  if (isDescendantOrSelf(root, itemId, targetParentId)) {
    return root;
  }

  let movedItem: RuleItem | null = null;

  function removeItem(node: RuleGroup): RuleGroup {
    const idx = node.conditions.findIndex((c) => c.id === itemId);
    if (idx !== -1) {
      movedItem = node.conditions[idx];
      return {
        ...node,
        conditions: [...node.conditions.slice(0, idx), ...node.conditions.slice(idx + 1)],
      };
    }
    return {
      ...node,
      conditions: node.conditions.map((child) =>
        isContainer(child) ? removeItem(child as RuleGroup) : child,
      ),
    };
  }

  const withoutItem = removeItem(root);
  if (!movedItem) return root;

  function insertItem(node: RuleGroup): RuleGroup {
    if (node.id === targetParentId) {
      const newConditions = [...node.conditions];
      newConditions.splice(targetIndex, 0, movedItem!);
      return { ...node, conditions: newConditions };
    }
    return {
      ...node,
      conditions: node.conditions.map((child) =>
        isContainer(child) ? insertItem(child as RuleGroup) : child,
      ),
    };
  }

  return insertItem(withoutItem);
}
