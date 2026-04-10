/**
 * Local state management hooks for rule tree manipulation
 * These hooks manage the in-memory tree state (not API calls)
 */

import { useState, useCallback } from 'react';
import type { RuleGroup, RuleFolder, RuleItem, RuleCondition } from '../types/rule.types';
import {
  addConditionToTree,
  addGroupToTree,
  addFolderToTree,
  deleteFromTree,
  toggleExpandInTree,
  duplicateItem as duplicateItemUtil,
  updateItemInTree,
  moveItemInTree,
  generateId,
} from '../utils/tree-helpers';

const defaultRoot: RuleGroup = {
  id: 'root',
  type: 'group',
  name: 'Root Rules',
  logic: 'AND',
  expanded: true,
  enabled: true,
  conditions: [],
};

export function useRuleItems(initialRules?: RuleGroup) {
  const [rules, setRules] = useState<RuleGroup>(initialRules || defaultRoot);

  const addCondition = useCallback(
    (parentId: string) => {
      const newCondition: RuleCondition = {
        id: generateId(),
        type: 'condition',
        field: '',
        operator: 'equals',
        valueType: 'value',
        value: '',
        dataType: 'string',
        enabled: true,
        validation: { isValid: true },
      };

      setRules((prev) => addConditionToTree(prev, parentId, newCondition));
    },
    []
  );

  const addGroup = useCallback(
    (parentId: string) => {
      const newGroup: RuleGroup = {
        id: generateId(),
        type: 'group',
        name: 'New Group',
        logic: 'AND',
        conditions: [],
        expanded: true,
        enabled: true,
      };

      setRules((prev) => addGroupToTree(prev, parentId, newGroup));
    },
    []
  );

  const addFolder = useCallback(
    (parentId: string) => {
      const newFolder: RuleFolder = {
        id: generateId(),
        type: 'folder',
        name: '',
        conditions: [],
        expanded: true,
        enabled: true,
      };

      setRules((prev) => addFolderToTree(prev, parentId, newFolder));
    },
    []
  );

  const deleteRule = useCallback(
    (id: string) => {
      setRules((prev) => deleteFromTree(prev, id));
    },
    []
  );

  const duplicateRule = useCallback(
    (item: RuleItem) => {
      const duplicated = duplicateItemUtil(item);
      setRules((prev) => ({
        ...prev,
        conditions: [...prev.conditions, duplicated],
      }));
    },
    []
  );

  const toggleExpand = useCallback(
    (id: string) => {
      setRules((prev) => toggleExpandInTree(prev, id));
    },
    []
  );

  const updateItem = useCallback(
    (updatedItem: RuleItem) => {
      setRules((prev) => updateItemInTree(prev, updatedItem));
    },
    []
  );

  const moveItem = useCallback(
    (itemId: string, targetParentId: string, targetIndex: number) => {
      setRules((prev) => moveItemInTree(prev, itemId, targetParentId, targetIndex));
    },
    []
  );

  const resetRules = useCallback(
    (newRules?: RuleGroup) => {
      setRules(newRules || defaultRoot);
    },
    []
  );

  return {
    rules,
    setRules,
    addCondition,
    addGroup,
    addFolder,
    deleteRule,
    duplicateRule,
    toggleExpand,
    updateItem,
    moveItem,
    resetRules,
  };
}
