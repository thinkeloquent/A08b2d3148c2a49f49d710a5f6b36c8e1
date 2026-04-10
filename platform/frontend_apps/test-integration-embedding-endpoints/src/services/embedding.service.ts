/**
 * Embedding Service
 *
 * Configuration-driven service using app-yaml-endpoints pattern.
 * Supports multiple backend services via serviceId parameter.
 */

import type {
  EmbedRequest,
  EmbedResponse,
  EmbedQueryRequest,
  EmbedQueryResponse,
  HealthDiagnosticRequest,
  HealthResponse,
  ServiceId,
} from './types';
import { getBaseUrl, getHeaders } from './endpoint-config';

/**
 * Service interface for Embedding endpoints.
 */
export interface EmbeddingService {
  readonly serviceId: ServiceId;
  readonly baseUrl: string;
  health(request?: HealthDiagnosticRequest): Promise<HealthResponse>;
  embed(request: EmbedRequest): Promise<EmbedResponse>;
  embedQuery(request: EmbedQueryRequest): Promise<EmbedQueryResponse>;
  embedBatch(request: EmbedRequest): Promise<EmbedResponse>;
}

/** API path for embedding endpoints on each server. */
const API_PATH = '/api/llm/gemini-openai-embedding-v1';

/**
 * Create a service instance bound to a specific endpoint.
 */
export function createService(serviceId: ServiceId): EmbeddingService {
  const serverUrl = getBaseUrl(serviceId);
  const baseUrl = `${serverUrl}${API_PATH}`;
  const defaultHeaders = getHeaders(serviceId);

  /**
   * Make a POST request with JSON body.
   */
  async function post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.detail || response.statusText);
    }
    return response.json();
  }

  /**
   * Health diagnostic — POST /health with test payload
   */
  async function health(request?: HealthDiagnosticRequest): Promise<HealthResponse> {
    const body = request || { text: 'Hello, this is a connection test.', model: 'text-embedding-3-small' };
    const response = await fetch(`${baseUrl}/health`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Embed endpoint — POST /embed
   */
  async function embed(request: EmbedRequest): Promise<EmbedResponse> {
    return post('/embed', request);
  }

  /**
   * Embed query endpoint — POST /embed-query
   */
  async function embedQuery(request: EmbedQueryRequest): Promise<EmbedQueryResponse> {
    return post('/embed-query', request);
  }

  /**
   * Embed batch endpoint — POST /embed-batch
   */
  async function embedBatch(request: EmbedRequest): Promise<EmbedResponse> {
    return post('/embed-batch', request);
  }

  return {
    serviceId,
    baseUrl,
    health,
    embed,
    embedQuery,
    embedBatch,
  };
}

/**
 * Lazy-loaded service instances (created on first access after config is loaded).
 */
const serviceCache: Record<string, EmbeddingService> = {};

export const services: Record<string, EmbeddingService> = new Proxy(serviceCache, {
  get(target, prop: string) {
    if (typeof prop !== 'string') return undefined;
    if (!target[prop]) {
      target[prop] = createService(prop);
    }
    return target[prop];
  },
});

export default createService;
