/**
 * Type definitions for Embedding endpoints
 */

export interface EmbedRequest {
  input: string | string[];
  model?: string;
}

export interface EmbedQueryRequest {
  text: string;
  model?: string;
}

export interface EmbeddingData {
  object: 'embedding';
  index: number;
  embedding: number[];
}

export interface EmbedResponse {
  object: 'list';
  data: EmbeddingData[];
  model: string;
  usage: {
    total_tokens: number;
  };
}

export interface EmbedQueryResponse {
  object: 'embedding';
  embedding: number[];
  model: string;
  dimensions: number;
}

export interface HealthDiagnosticRequest {
  text: string;
  model: string;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  service: string;
  model?: string;
  endpoint?: string;
  timeout?: number;
  proxy_url?: string;
  test_text?: string;
  dimensions?: number;
  latency_ms?: number;
  latency?: string;
  vector_preview?: number[];
  vector_norm?: number;
  error?: string;
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
