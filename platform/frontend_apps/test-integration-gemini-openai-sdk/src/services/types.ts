/**
 * Type definitions for Gemini OpenAI SDK endpoints
 */

export interface ChatRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StructureRequest {
  prompt: string;
  schema: Record<string, unknown>;
}

export interface StructureResponse {
  data: unknown;
  model: string;
}

export interface ToolCallRequest {
  prompt: string;
  tools?: ToolDefinition[];
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ToolCallResponse {
  tool_calls: Array<{
    name: string;
    arguments: Record<string, unknown>;
  }>;
  content?: string;
  model: string;
}

export interface JsonRequest {
  prompt: string;
  model?: string;
}

export interface JsonResponse {
  data: unknown;
  model: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ConversationRequest {
  messages: ConversationMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ConversationResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp?: string;
  version?: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

/**
 * App YAML Endpoints types (browser-compatible subset)
 */
export interface EndpointConfig {
  name?: string;
  tags?: string[];
  baseUrl: string;
  description: string;
  method: string;
  headers: Record<string, string>;
  timeout: number;
  bodyType: 'json' | 'text';
}

export interface RouterConfig {
  endpoints: Record<string, EndpointConfig>;
  intent_mapping: {
    mappings: Record<string, string>;
    default_intent: string;
  };
}

export type ServiceId = string;
