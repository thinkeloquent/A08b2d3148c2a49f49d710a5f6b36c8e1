/**
 * Persona Types for Admin Dashboard
 */

// Dynamic from llm-defaults
export type PersonaRole = string;
export type PersonaTone = string;
export type MemoryScope = 'session' | 'persistent';

export interface PersonaMemory {
  enabled: boolean;
  scope: MemoryScope;
  storage_id?: string;
}

export interface LLMParameters {
  [key: string]: unknown;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  role?: PersonaRole;
  tone?: PersonaTone;
  version?: string;
  llm_provider: string;
  llm_temperature?: number;
  llm_parameters?: LLMParameters;
  goals?: string[];
  tools?: string[];
  permitted_to?: string[];
  prompt_system_template?: string[];
  prompt_user_template?: string[];
  prompt_context_template?: string[];
  prompt_instruction?: string[];
  agent_delegate?: string[];
  agent_call?: string[];
  memory?: PersonaMemory;
  context_files?: string[];
  persona_prompt_data?: Record<string, unknown>;
  persona_prompt_template?: string;
  last_updated?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePersonaRequest {
  name: string;
  description: string;
  llm_provider: string;
  role?: PersonaRole;
  tone?: PersonaTone;
  version?: string;
  llm_temperature?: number;
  llm_parameters?: LLMParameters;
  goals?: string[];
  tools?: string[];
  permitted_to?: string[];
  prompt_system_template?: string[];
  prompt_user_template?: string[];
  prompt_context_template?: string[];
  prompt_instruction?: string[];
  agent_delegate?: string[];
  agent_call?: string[];
  memory?: PersonaMemory;
  context_files?: string[];
  persona_prompt_data?: Record<string, unknown>;
  persona_prompt_template?: string;
}

export interface UpdatePersonaRequest extends Partial<CreatePersonaRequest> {}

// Legacy static options removed - now loaded dynamically from llm-defaults
export const ROLE_OPTIONS: { value: string; label: string }[] = [];
export const TONE_OPTIONS: { value: string; label: string }[] = [];
