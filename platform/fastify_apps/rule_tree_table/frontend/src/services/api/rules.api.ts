/**
 * Rule Tree API Service
 * Provides CRUD operations for rule trees
 */

import { get, post, put, del } from './client';
import type {
  RuleTreeResponse,
  ListRuleTreesResponse,
  ValidationResult,
  DeleteResponse,
  CreateRuleTreeRequest,
  UpdateRuleTreeRequest,
  SaveRulesResponse,
} from '../../types/api';
import type { RuleGroup } from '../../types/rule.types';

/**
 * List all rule trees
 */
export function list(params?: Record<string, unknown>): Promise<ListRuleTreesResponse> {
  return get<ListRuleTreesResponse>('/trees', params);
}

/**
 * Get a single rule tree by ID
 */
export function getById(id: string): Promise<RuleTreeResponse> {
  return get<RuleTreeResponse>(`/trees/${id}`);
}

/**
 * Create a new rule tree
 */
export function create(data: CreateRuleTreeRequest): Promise<RuleTreeResponse> {
  return post<RuleTreeResponse>('/trees', data);
}

/**
 * Update a rule tree (metadata and/or rules)
 */
export function update(id: string, data: UpdateRuleTreeRequest): Promise<RuleTreeResponse> {
  return put<RuleTreeResponse>(`/trees/${id}`, data);
}

/**
 * Delete a rule tree
 */
export function remove(id: string): Promise<DeleteResponse> {
  return del<DeleteResponse>(`/trees/${id}`);
}

/**
 * Validate rules
 */
export function validate(rules: RuleGroup): Promise<ValidationResult> {
  return post<ValidationResult>('/rules/validate', { rules });
}

/**
 * Save rules for a specific tree
 */
export function saveRules(treeId: string, rules: RuleGroup): Promise<SaveRulesResponse> {
  return put<SaveRulesResponse>(`/trees/${treeId}`, { rules });
}
