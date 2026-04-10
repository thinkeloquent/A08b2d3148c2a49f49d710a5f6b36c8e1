/**
 * Gemini OpenAI SDK Service - Unified
 *
 * Configuration-driven service using app-yaml-endpoints pattern.
 * Supports multiple backend services via serviceId parameter.
 *
 * @example
 * import { createService } from './services/gemini-openai-sdk.service';
 *
 * const service = createService('llm001');
 * const response = await service.chat({ prompt: 'Hello' });
 */

import type {
  ChatRequest,
  ChatResponse,
  StructureRequest,
  StructureResponse,
  ToolCallRequest,
  ToolCallResponse,
  JsonRequest,
  JsonResponse,
  ConversationRequest,
  ConversationResponse,
  HealthResponse,
  ServiceId,
} from './types';
import { getBaseUrl, getHeaders } from './endpoint-config';

/**
 * Service interface for Gemini OpenAI SDK endpoints.
 */
export interface GeminiOpenAiSdkService {
  readonly serviceId: ServiceId;
  readonly baseUrl: string;
  health(): Promise<HealthResponse>;
  chat(request: ChatRequest): Promise<ChatResponse>;
  stream(request: ChatRequest): AsyncGenerator<string, void, unknown>;
  structure(request: StructureRequest): Promise<StructureResponse>;
  toolCall(request: ToolCallRequest): Promise<ToolCallResponse>;
  json(request: JsonRequest): Promise<JsonResponse>;
  conversation(request: ConversationRequest): Promise<ConversationResponse>;
}

/** API path for Gemini OpenAI SDK endpoints on each server. */
const API_PATH = '/api/llm/gemini-openai-v1';

/**
 * Create a service instance bound to a specific endpoint.
 *
 * @param serviceId - Service identifier (e.g. 'fastify', 'fastapi')
 * @returns Service instance with all endpoint methods
 */
export function createService(serviceId: ServiceId): GeminiOpenAiSdkService {
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
      throw new Error(error.error || response.statusText);
    }
    return response.json();
  }

  /**
   * Health check — sends a simple chat request to verify the endpoint is alive.
   * POST /chat { prompt: "hi" }
   */
  async function health(): Promise<HealthResponse> {
    const response = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ prompt: 'hi' }),
    });
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Chat completion endpoint
   * POST /chat
   */
  async function chat(request: ChatRequest): Promise<ChatResponse> {
    return post('/chat', request);
  }

  /**
   * SSE streaming endpoint
   * POST /stream
   *
   * Returns an async generator that yields chunks from the SSE stream.
   */
  async function* stream(request: ChatRequest): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${baseUrl}/stream`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || response.statusText);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            yield data;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Structured JSON output endpoint
   * POST /structure
   */
  async function structure(request: StructureRequest): Promise<StructureResponse> {
    return post('/structure', request);
  }

  /**
   * Function calling endpoint
   * POST /tool-call
   */
  async function toolCall(request: ToolCallRequest): Promise<ToolCallResponse> {
    return post('/tool-call', request);
  }

  /**
   * JSON mode endpoint
   * POST /json
   */
  async function json(request: JsonRequest): Promise<JsonResponse> {
    return post('/json', request);
  }

  /**
   * Multi-turn conversation endpoint
   * POST /conversation
   */
  async function conversation(request: ConversationRequest): Promise<ConversationResponse> {
    return post('/conversation', request);
  }

  return {
    serviceId,
    baseUrl,
    health,
    chat,
    stream,
    structure,
    toolCall,
    json,
    conversation,
  };
}

/**
 * Lazy-loaded service instances (created on first access after config is loaded).
 */
const serviceCache: Record<string, GeminiOpenAiSdkService> = {};

export const services: Record<string, GeminiOpenAiSdkService> = new Proxy(serviceCache, {
  get(target, prop: string) {
    if (typeof prop !== 'string') return undefined;
    if (!target[prop]) {
      target[prop] = createService(prop);
    }
    return target[prop];
  },
});

/**
 * Get service by server type (for backwards compatibility).
 */
export function getService(serverType: 'fastify' | 'fastapi'): GeminiOpenAiSdkService {
  return services[serverType === 'fastify' ? 'llm001' : 'llm002'];
}

/**
 * Clear service cache (useful when config is reloaded).
 */
export function clearServiceCache(): void {
  for (const key of Object.keys(serviceCache)) {
    delete serviceCache[key];
  }
}

export default createService;
