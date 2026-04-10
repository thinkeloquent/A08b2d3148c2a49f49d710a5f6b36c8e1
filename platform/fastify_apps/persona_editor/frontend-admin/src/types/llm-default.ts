/**
 * LLM Default Types for Admin Dashboard
 */

export type LLMDefaultCategory = 'tools' | 'permissions' | 'goals' | 'prompts' | 'tones' | 'roles' | 'providers';

export interface LLMDefault {
  id: string;
  category: LLMDefaultCategory;
  name: string;
  description: string;
  value: unknown;
  context: unknown;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLLMDefaultRequest {
  category: LLMDefaultCategory;
  name: string;
  description: string;
  value: unknown;
  context?: unknown;
  is_default?: boolean;
}

export interface UpdateLLMDefaultRequest {
  name?: string;
  description?: string;
  value?: unknown;
  context?: unknown;
  is_default?: boolean;
}

export interface PresetTemplate {
  name: string;
  description: string;
  value: unknown;
  context?: string | null;
  is_default: boolean;
}

export const CATEGORY_OPTIONS = [
  { value: 'tools', label: 'Tools', description: 'Available tools and capabilities' },
  { value: 'permissions', label: 'Permissions', description: 'Permission sets' },
  { value: 'goals', label: 'Goals', description: 'Pre-defined goal sets' },
  { value: 'prompts', label: 'Prompts', description: 'Reusable prompt templates' },
  { value: 'tones', label: 'Tones', description: 'Communication tone presets' },
  { value: 'roles', label: 'Roles', description: 'Role configuration presets' },
  { value: 'providers', label: 'Providers', description: 'LLM provider configurations' },
] as const;
