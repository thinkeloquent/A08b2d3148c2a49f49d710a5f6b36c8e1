import { z } from 'zod';

export const groupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  logic: z.enum(['AND', 'OR', 'NOT', 'XOR']),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal('')),
});

export const folderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal('')),
});

export const conditionSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  operator: z.string().min(1, 'Operator is required'),
  valueType: z.enum(['value', 'field', 'function', 'regex']),
  value: z.string(),
  dataType: z.enum(['string', 'number', 'boolean', 'date']).optional(),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
});

export const ruleTreeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  graph_type: z.string().optional().default('conditional_logic'),
  language: z.string().optional().default(''),
  repo_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  branch: z.string().optional(),
  commit_sha: z.string().max(40, 'SHA must be 40 characters or less').optional().or(z.literal('')),
  git_tag: z.string().optional(),
});

export type GroupFormData = z.infer<typeof groupSchema>;
export type FolderFormData = z.infer<typeof folderSchema>;
export type ConditionFormData = z.infer<typeof conditionSchema>;
export type RuleTreeFormData = z.infer<typeof ruleTreeSchema>;
