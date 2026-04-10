/**
 * Gemini OpenAI-Compatible Client
 *
 * Singleton undici.Pool targeted at Gemini API origin for high-performance
 * connection pooling and keep-alive.
 *
 * @example
 * ```typescript
 * import { getGeminiClient } from 'fetch-undici-gemini-openai-protocols'
 *
 * const gemini = getGeminiClient('https://generativelanguage.googleapis.com')
 *
 * const response = await gemini.chatCompletions({
 *   model: 'gemini-2.0-flash',
 *   messages: [{ role: 'user', content: 'Hello!' }]
 * })
 * console.log(response.choices[0].message.content)
 *
 * // Clean up when done
 * await gemini.close()
 * ```
 */

import { Pool } from 'undici'

/** Chat message format */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** Chat completion request payload */
export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  stream?: boolean
  response_format?: { type: 'text' | 'json_object' }
  [key: string]: unknown
}

/** Chat completion response */
export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/** Gemini client configuration */
export interface GeminiClientConfig {
  /** API key (defaults to GEMINI_API_KEY env var) */
  apiKey?: string
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number
  /** Maximum connections in pool (default: 100) */
  maxConnections?: number
  /** Keep-alive timeout in milliseconds (default: 60000) */
  keepAliveTimeout?: number
  /** Enable HTTP/2 (default: true) */
  http2?: boolean
}

/** Default Gemini API origin */
export const GEMINI_ORIGIN = 'https://generativelanguage.googleapis.com'

/** Gemini OpenAI-compatible chat completions endpoint */
export const GEMINI_CHAT_COMPLETIONS_PATH = '/v1beta/openai/chat/completions'

/**
 * Gemini OpenAI-Compatible Client
 *
 * Provides a connection-pooled client for the Gemini API using the
 * OpenAI-compatible endpoint.
 */
export class GeminiClient {
  private readonly _pool: Pool
  private readonly _apiKey: string
  private readonly _originHost: string
  private readonly _timeoutMs: number
  private _closed = false

  constructor(originHost: string, config?: GeminiClientConfig) {
    this._originHost = originHost.replace(/\/$/, '')
    this._apiKey = config?.apiKey ?? process.env.GEMINI_API_KEY ?? ''

    if (!this._apiKey) {
      throw new Error('Gemini API key required: set GEMINI_API_KEY env var or pass apiKey in config')
    }

    const timeoutMs = config?.timeoutMs ?? 30000
    this._timeoutMs = timeoutMs

    this._pool = new Pool(this._originHost, {
      connections: config?.maxConnections ?? 100,
      keepAliveTimeout: config?.keepAliveTimeout ?? 60000,
      keepAliveMaxTimeout: config?.keepAliveTimeout ?? 60000,
      allowH2: config?.http2 ?? true,
      headersTimeout: timeoutMs,
      bodyTimeout: timeoutMs,
      pipelining: 1
    })
  }

  /**
   * Get the origin host
   */
  get originHost(): string {
    return this._originHost
  }

  /**
   * Check if client is closed
   */
  get closed(): boolean {
    return this._closed
  }

  /**
   * Send a chat completion request using OpenAI-compatible endpoint
   */
  async chatCompletions(payload: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (this._closed) {
      throw new Error('Client has been closed')
    }

    const response = await this._pool.request({
      path: GEMINI_CHAT_COMPLETIONS_PATH,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this._apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      headersTimeout: this._timeoutMs,
      bodyTimeout: this._timeoutMs
    })

    if (response.statusCode >= 400) {
      const errorBody = await response.body.text()
      throw new Error(`Gemini API error (${response.statusCode}): ${errorBody}`)
    }

    return await response.body.json() as ChatCompletionResponse
  }

  /**
   * Send a raw POST request to any Gemini endpoint
   */
  async post<T = unknown>(path: string, payload: unknown): Promise<T> {
    if (this._closed) {
      throw new Error('Client has been closed')
    }

    const response = await this._pool.request({
      path,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this._apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      headersTimeout: this._timeoutMs,
      bodyTimeout: this._timeoutMs
    })

    if (response.statusCode >= 400) {
      const errorBody = await response.body.text()
      throw new Error(`Gemini API error (${response.statusCode}): ${errorBody}`)
    }

    return await response.body.json() as T
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    if (this._closed) {
      return
    }

    this._closed = true
    await this._pool.close()
  }

  /**
   * Symbol.asyncDispose for `await using` syntax
   */
  async [Symbol.asyncDispose](): Promise<void> {
    await this.close()
  }
}

// Singleton instance storage
let _clientSingleton: GeminiClient | null = null
let _singletonOrigin: string | null = null

/**
 * Get or create the singleton Gemini client
 *
 * @param originHost - The Gemini API origin (default: 'https://generativelanguage.googleapis.com')
 * @param config - Optional client configuration
 * @returns The singleton GeminiClient instance
 *
 * @example
 * ```typescript
 * const gemini = getGeminiClient()
 * const response = await gemini.chatCompletions({
 *   model: 'gemini-2.0-flash',
 *   messages: [{ role: 'user', content: 'Return JSON: {"ok": true}' }],
 *   response_format: { type: 'json_object' }
 * })
 * console.log(response.choices[0].message.content)
 * ```
 */
export function getGeminiClient(
  originHost: string = GEMINI_ORIGIN,
  config?: GeminiClientConfig
): GeminiClient {
  if (_clientSingleton === null || _singletonOrigin !== originHost) {
    // Close existing singleton if origin changed
    if (_clientSingleton !== null) {
      _clientSingleton.close().catch(() => {})
    }

    _clientSingleton = new GeminiClient(originHost, config)
    _singletonOrigin = originHost
  }

  return _clientSingleton
}

/**
 * Close the singleton Gemini client
 */
export async function closeGeminiClient(): Promise<void> {
  if (_clientSingleton !== null) {
    await _clientSingleton.close()
    _clientSingleton = null
    _singletonOrigin = null
  }
}
