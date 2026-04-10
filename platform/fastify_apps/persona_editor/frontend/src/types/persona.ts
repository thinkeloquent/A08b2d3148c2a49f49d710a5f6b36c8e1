/**
 * Persona Types
 * TypeScript interfaces for persona entities
 */

// Role type - dynamic from llm-defaults
export type PersonaRole = string;

// Tone type - dynamic from llm-defaults
export type PersonaTone = string;

// Memory scope type
export type MemoryScope = 'session' | 'persistent';

// Memory configuration
export interface PersonaMemory {
  enabled: boolean;
  scope: MemoryScope;
  storage_id?: string;
}

// LLM Parameters (flexible object)
export interface LLMParameters {
  [key: string]: unknown;
}

// Persona interface matching the backend model
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

// Create persona request
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

// Update persona request (all fields optional except those being updated)
export interface UpdatePersonaRequest {
  name?: string;
  description?: string;
  llm_provider?: string;
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

// Audit log action type
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

// Audit log entry
export interface AuditLog {
  id: string;
  persona_id: string;
  action: AuditAction;
  changes: string; // JSON string of changes
  user_id: string;
  ip_address?: string;
  created_at: string;
}

// Legacy label maps - kept for backward compatibility
// Dynamic labels now come from llm-defaults entries
export const ROLE_LABELS: Record<string, string> = {};
export const TONE_LABELS: Record<string, string> = {};
