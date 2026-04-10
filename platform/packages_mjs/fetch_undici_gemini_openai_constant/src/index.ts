/**
 * Pre-configured Gemini API Transport Layer Constants
 *
 * This module provides optimized undici Pool configuration for Gemini API
 * with settings derived from the operational characteristics of LLM workloads.
 *
 * Key Configuration Rationale:
 * - connections: 100 - High ceiling for concurrent requests before rate limits
 * - pipelining: 0 - Disabled to prevent long "thinking" requests blocking quick ones
 * - keepAliveTimeout: 60s - Aligns with chat interface typing pauses
 * - headersTimeout: 300s - Critical for Gemini Thinking models that pause before headers
 * - bodyTimeout: 300s - Ensures long-form generation is not terminated prematurely
 * - HTTP/2: Enabled with HTTP/1.1 fallback for resilience
 *
 * @example
 * ```typescript
 * import { getGeminiPool, GEMINI_POOL_CONFIG } from 'fetch-undici-gemini-openai-constant'
 *
 * // Use singleton pool with pre-configured settings
 * const pool = getGeminiPool()
 *
 * const response = await pool.request({
 *   path: '/v1beta/openai/chat/completions',
 *   method: 'POST',
 *   headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ model: 'gemini-2.0-flash-thinking-exp', messages: [...] })
 * })
 * ```
 */

import { Pool, type Pool as PoolType } from 'undici'

// =============================================================================
// TRANSPORT LAYER CONSTANTS
// =============================================================================

/**
 * Gemini API base endpoint.
 * Using a Pool keyed to this origin ensures connection reuse.
 */
export const GEMINI_ORIGIN = 'https://generativelanguage.googleapis.com' as const

/**
 * OpenAI-compatible chat completions endpoint path
 */
export const GEMINI_CHAT_COMPLETIONS_PATH = '/v1beta/openai/chat/completions' as const

/**
 * Maximum concurrent socket connections.
 * High-throughput AI applications require a higher ceiling (100) to prevent
 * local bottlenecks before upstream rate limits are reached.
 * Formula: min(100, application_concurrency)
 */
export const GEMINI_POOL_CONNECTIONS = 100 as const

/**
 * HTTP pipelining setting (DISABLED).
 * Pipelining sends multiple requests without waiting for responses.
 * Given the variable latency of LLM responses (sub-second to minutes),
 * pipelining introduces risk where a long "thinking" request blocks
 * subsequent quick requests on the same socket.
 */
export const GEMINI_POOL_PIPELINING = 0 as const

/**
 * Keep-alive timeout in milliseconds (60 seconds).
 * Aligns with typical cadence of user interaction in chat interfaces.
 * Shorter timeouts (e.g., Node's default 4s) cause frequent reconnections
 * during user typing pauses.
 */
export const GEMINI_KEEPALIVE_TIMEOUT_MS = 60_000 as const

/**
 * Headers timeout in milliseconds (300 seconds / 5 minutes).
 * CRITICAL: Gemini 2.0 Flash Thinking can pause for extended periods before
 * sending headers. Standard timeouts (typically 30s) will cause
 * UND_ERR_HEADERS_TIMEOUT errors during complex reasoning tasks.
 */
export const GEMINI_HEADERS_TIMEOUT_MS = 300_000 as const

/**
 * Body timeout in milliseconds (300 seconds / 5 minutes).
 * Ensures that long-form generation (e.g., generating codebases or
 * long essays) is not terminated prematurely.
 */
export const GEMINI_BODY_TIMEOUT_MS = 300_000 as const

/**
 * HTTP/2 protocol support flag.
 * HTTP/2 improves multiplexing and reduces latency.
 * Fallback to HTTP/1.1 is handled if ALPN negotiation fails.
 */
export const GEMINI_HTTP2_ENABLED = true as const

// =============================================================================
// CLIENT TIMEOUT CONSTANTS
// =============================================================================

/**
 * Connect timeout in milliseconds (10 seconds).
 * If the server cannot be reached in 10 seconds, it indicates a network
 * partition or outage. Failing fast here is appropriate.
 */
export const GEMINI_CONNECT_TIMEOUT_MS = 10_000 as const

/**
 * Write timeout in milliseconds (10 seconds).
 * Sending the prompt payload should be fast.
 */
export const GEMINI_WRITE_TIMEOUT_MS = 10_000 as const

/**
 * Standard read timeout in milliseconds (60 seconds).
 * Suitable for streaming responses where data flows continuously.
 * Use this for regular chat completions and streaming endpoints.
 */
export const GEMINI_READ_TIMEOUT_MS = 60_000 as const

/**
 * Thinking model read timeout in milliseconds (300 seconds / 5 minutes).
 * CRITICAL: Gemini 2.0 Flash Thinking can pause for extended periods (120s+)
 * without sending bytes during complex reasoning tasks.
 * Use this for thinking models or set to null to disable entirely.
 */
export const GEMINI_READ_TIMEOUT_THINKING_MS = 300_000 as const

// =============================================================================
// POOL CONFIGURATION OBJECT
// =============================================================================

/**
 * Complete undici Pool configuration for Gemini API.
 * All settings are strict requirements derived from LLM operational characteristics.
 */
export interface GeminiPoolConfig {
  /** Maximum concurrent connections (default: 100) */
  connections: number
  /** HTTP pipelining (default: 0 / disabled) */
  pipelining: number
  /** Keep-alive timeout in ms (default: 60000) */
  keepAliveTimeout: number
  /** Maximum keep-alive timeout in ms (default: 60000) */
  keepAliveMaxTimeout: number
  /** Headers timeout in ms (default: 300000) */
  headersTimeout: number
  /** Body timeout in ms (default: 300000) */
  bodyTimeout: number
  /** Enable HTTP/2 (default: true) */
  allowH2: boolean
}

/**
 * Pre-configured Pool options for Gemini API.
 * Use this configuration when creating an undici Pool manually.
 *
 * @example
 * ```typescript
 * import { Pool } from 'undici'
 * import { GEMINI_ORIGIN, GEMINI_POOL_CONFIG } from 'fetch-undici-gemini-openai-constant'
 *
 * const pool = new Pool(GEMINI_ORIGIN, GEMINI_POOL_CONFIG)
 * ```
 */
export const GEMINI_POOL_CONFIG: GeminiPoolConfig = {
  connections: GEMINI_POOL_CONNECTIONS,
  pipelining: GEMINI_POOL_PIPELINING,
  keepAliveTimeout: GEMINI_KEEPALIVE_TIMEOUT_MS,
  keepAliveMaxTimeout: GEMINI_KEEPALIVE_TIMEOUT_MS,
  headersTimeout: GEMINI_HEADERS_TIMEOUT_MS,
  bodyTimeout: GEMINI_BODY_TIMEOUT_MS,
  allowH2: GEMINI_HTTP2_ENABLED,
} as const

// =============================================================================
// TIMEOUT CONFIGURATION
// =============================================================================

/**
 * Request timeout configuration for individual requests.
 * These override pool-level timeouts when specified per-request.
 */
export interface GeminiRequestTimeoutConfig {
  /** Headers timeout in ms for thinking models (default: 300000) */
  headersTimeout: number
  /** Body timeout in ms for long-form generation (default: 300000) */
  bodyTimeout: number
}

/**
 * Default request timeout configuration.
 * Use these values in individual pool.request() calls.
 */
export const GEMINI_REQUEST_TIMEOUT_CONFIG: GeminiRequestTimeoutConfig = {
  headersTimeout: GEMINI_HEADERS_TIMEOUT_MS,
  bodyTimeout: GEMINI_BODY_TIMEOUT_MS,
} as const

/**
 * Timeout configuration optimized for "thinking" models.
 * Gemini 2.0 Flash Thinking may require extended timeouts.
 */
export const GEMINI_THINKING_TIMEOUT_CONFIG: GeminiRequestTimeoutConfig = {
  headersTimeout: GEMINI_HEADERS_TIMEOUT_MS,
  bodyTimeout: GEMINI_BODY_TIMEOUT_MS,
} as const

// =============================================================================
// SINGLETON POOL
// =============================================================================

let _poolSingleton: PoolType | null = null

/**
 * Get or create the singleton Gemini Pool with pre-configured settings.
 *
 * The pool is configured with optimized settings for LLM workloads:
 * - 100 concurrent connections
 * - Pipelining disabled
 * - 60s keep-alive timeout
 * - 300s headers/body timeout for thinking models
 * - HTTP/2 enabled
 *
 * @param origin - Optional custom origin (default: GEMINI_ORIGIN)
 * @returns Pre-configured undici Pool instance
 *
 * @example
 * ```typescript
 * import { getGeminiPool, GEMINI_CHAT_COMPLETIONS_PATH } from 'fetch-undici-gemini-openai-constant'
 *
 * const pool = getGeminiPool()
 * const response = await pool.request({
 *   path: GEMINI_CHAT_COMPLETIONS_PATH,
 *   method: 'POST',
 *   headers: {
 *     'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     model: 'gemini-2.0-flash-thinking-exp',
 *     messages: [{ role: 'user', content: 'Solve this complex math problem...' }]
 *   })
 * })
 * ```
 */
export function getGeminiPool(origin: string = GEMINI_ORIGIN): PoolType {
  if (_poolSingleton === null) {
    _poolSingleton = new Pool(origin, GEMINI_POOL_CONFIG)
  }
  return _poolSingleton
}

/**
 * Close the singleton Gemini Pool.
 * Call this during application shutdown for clean resource cleanup.
 */
export async function closeGeminiPool(): Promise<void> {
  if (_poolSingleton !== null) {
    await _poolSingleton.close()
    _poolSingleton = null
  }
}

/**
 * Create a new Gemini Pool with pre-configured settings.
 * Use this when you need a separate pool instance (not the singleton).
 *
 * @param origin - Optional custom origin (default: GEMINI_ORIGIN)
 * @param configOverrides - Optional configuration overrides
 * @returns New pre-configured undici Pool instance
 *
 * @example
 * ```typescript
 * import { createGeminiPool } from 'fetch-undici-gemini-openai-constant'
 *
 * // Create with default config
 * const pool1 = createGeminiPool()
 *
 * // Create with custom connection limit
 * const pool2 = createGeminiPool(undefined, { connections: 50 })
 *
 * // Create for custom origin
 * const pool3 = createGeminiPool('https://custom-proxy.example.com')
 * ```
 */
export function createGeminiPool(
  origin: string = GEMINI_ORIGIN,
  configOverrides?: Partial<GeminiPoolConfig>
): PoolType {
  return new Pool(origin, {
    ...GEMINI_POOL_CONFIG,
    ...configOverrides,
  })
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create request headers with authorization.
 *
 * @param apiKey - Gemini API key
 * @param additionalHeaders - Optional additional headers
 * @returns Headers object for use in pool.request()
 */
export function createGeminiHeaders(
  apiKey: string,
  additionalHeaders?: Record<string, string>
): Record<string, string> {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...additionalHeaders,
  }
}

/**
 * Get API key from environment or throw descriptive error.
 *
 * @param envVarName - Environment variable name (default: GEMINI_API_KEY)
 * @returns API key string
 * @throws Error if API key is not set
 */
export function getGeminiApiKey(envVarName: string = 'GEMINI_API_KEY'): string {
  const apiKey = process.env[envVarName]
  if (!apiKey) {
    throw new Error(
      `Gemini API key required: set ${envVarName} environment variable`
    )
  }
  return apiKey
}
