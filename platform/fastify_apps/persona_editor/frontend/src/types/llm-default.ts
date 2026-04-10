/**
 * LLM Default Types
 * TypeScript interfaces for LLM default configurations
 */

// Valid category types
export type LLMDefaultCategory = 'tools' | 'permissions' | 'goals' | 'prompts' | 'tones' | 'roles' | 'providers';

// LLM Default interface
export interface LLMDefault {
  id: string;
  category: LLMDefaultCategory;
  name: string;
  description: string;
  value: unknown; // Flexible JSONB value
  context: unknown; // Additional context or metadata
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

// Create LLM Default request
export interface CreateLLMDefaultRequest {
  category: LLMDefaultCategory;
  name: string;
  description: string;
  value: unknown;
  context?: unknown;
  is_default?: boolean;
}

// Update LLM Default request
export interface UpdateLLMDefaultRequest {
  name?: string;
  description?: string;
  value?: unknown;
  context?: unknown;
  is_default?: boolean;
}

// Category display labels
export const CATEGORY_LABELS: Record<LLMDefaultCategory, string> = {
  tools: 'Tools',
  permissions: 'Permissions',
  goals: 'Goals',
  prompts: 'Prompts',
  tones: 'Tones',
  roles: 'Roles',
  providers: 'Providers',
};

// Category descriptions
export const CATEGORY_DESCRIPTIONS: Record<LLMDefaultCategory, string> = {
  tools: 'Available tools and capabilities for the persona',
  permissions: 'Permission sets defining what the persona can do',
  goals: 'Pre-defined goal sets for different use cases',
  prompts: 'Reusable prompt templates and instructions',
  tones: 'Communication tone presets',
  roles: 'Role configuration presets',
  providers: 'LLM provider configurations',
};
