/**
 * API Types - Matching backend response schemas for rule tree table
 */

import type { RuleTree, RuleGroup, RuleTreeStats } from './rule.types';

// Single rule tree response
export interface RuleTreeResponse {
  tree: RuleTree;
}

// List rule trees response
export interface ListRuleTreesResponse {
  trees: RuleTree[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Validation error detail
export interface ValidationError {
  field: string;
  message: string;
  ruleId?: string;
}

// Validation result from server
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  stats?: RuleTreeStats;
}

// Delete response
export interface DeleteResponse {
  success: boolean;
}

// Create rule tree request
export interface CreateRuleTreeRequest {
  name: string;
  description?: string;
  repo_url?: string;
  branch?: string;
  commit_sha?: string;
  git_tag?: string;
  graph_type?: string;
  language?: string;
}

// Update rule tree request
export interface UpdateRuleTreeRequest {
  name?: string;
  description?: string;
  active?: boolean;
  repo_url?: string;
  branch?: string;
  commit_sha?: string;
  git_tag?: string;
  graph_type?: string;
  language?: string;
  rules?: RuleGroup;
}

// Save rules request
export interface SaveRulesRequest {
  rules: RuleGroup;
}

// Save rules response
export interface SaveRulesResponse {
  tree: RuleTree;
  stats: RuleTreeStats;
}

// Validate rules request
export interface ValidateRulesRequest {
  rules: RuleGroup;
}

// API error response format
export interface ApiErrorResponse {
  code: number;
  message: string;
}
