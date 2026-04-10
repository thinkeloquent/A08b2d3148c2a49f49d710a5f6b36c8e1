/**
 * React Query hooks for rule tree CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rulesApi } from '../services/api';
import type { CreateRuleTreeRequest, UpdateRuleTreeRequest } from '../types/api';
import type { RuleGroup } from '../types/rule.types';

// Query keys
const RULE_TREES_KEY = ['ruleTrees'] as const;
const ruleTreeKey = (id: string) => ['ruleTrees', id] as const;

/**
 * Fetch all rule trees
 */
export function useRuleTrees(graphType?: string) {
  return useQuery({
    queryKey: graphType ? [...RULE_TREES_KEY, graphType] : RULE_TREES_KEY,
    queryFn: () => rulesApi.list(graphType ? { graph_type: graphType } : undefined),
  });
}

/**
 * Fetch a single rule tree by ID
 */
export function useRuleTree(id: string | undefined) {
  return useQuery({
    queryKey: ruleTreeKey(id!),
    queryFn: () => rulesApi.getById(id!),
    enabled: !!id,
  });
}

/**
 * Create a new rule tree
 */
export function useCreateRuleTree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRuleTreeRequest) => rulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RULE_TREES_KEY });
    },
  });
}

/**
 * Save/update a rule tree (metadata + rules)
 */
export function useSaveRuleTree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRuleTreeRequest }) =>
      rulesApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: RULE_TREES_KEY });
      queryClient.invalidateQueries({ queryKey: ruleTreeKey(variables.id) });
    },
  });
}

/**
 * Delete a rule tree
 */
export function useDeleteRuleTree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rulesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RULE_TREES_KEY });
    },
  });
}

/**
 * Validate rules
 */
export function useValidateRuleTree() {
  return useMutation({
    mutationFn: (rules: RuleGroup) => rulesApi.validate(rules),
  });
}
