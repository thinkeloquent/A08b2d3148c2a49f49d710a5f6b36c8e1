/**
 * @module client/FetchClient
 * @description Generic, composable fetch client with pluggable adapters.
 *
 * Provides a foundation for HTTP requests with a full lifecycle including:
 * - Optional request caching (GET requests only)
 * - Configurable timeout via AbortSignal.timeout() (Node.js 20+)
 * - Pluggable fetch adapter (defaults to undici)
 * - Optional rate limit adapter and retry handler
 * - Optional response transformer
 * - Automatic error mapping to typed Confluence error classes
 *
 * This client is transport-agnostic and protocol-agnostic. The Confluence-specific
 * logic (auth, path interpolation, base URL) lives in ConfluenceFetchClient, which
 * wraps this class.
 *
 * @example
 * import { FetchClient } from './FetchClient.mjs';
 * import { UndiciFetchAdapter } from '../adapters/UndiciFetchAdapter.mjs';
 *
 * const client = new FetchClient({
 *   fetchAdapter: new UndiciFetchAdapter(),
 *   timeoutMs: 15_000,
 * });
 *
 * const data = await client.request('https://confluence.example.com/rest/api/content');
 */

import { parseResponseData } from '../utils/parseResponseData.mjs';
import { createTimeoutSignal, mergeAbortSignals } from '../utils/createTimeoutSignal.mjs';
import {
  ConfluenceApiError,
  ConfluenceTimeoutError,
  ConfluenceNetworkError,
  ErrorCode,
} from '../errors.mjs';
import { createLogger } from '../logger.mjs';

const log = createLogger('confluence-api', import.meta.url);

/**
 * @typedef {Object} FetchClientOptions
 * @property {import('../adapters/UndiciFetchAdapter.mjs').UndiciFetchAdapter} fetchAdapter
 *   Fetch implementation adapter.
 * @property {Object} [rateLimitAdapter] - Optional rate-limit scheduler with a `schedule(fn)` method.
 * @property {Object} [requestCache] - Optional cache with `get(key)` and `set(key, value)` methods.
 * @property {Object} [retryHandler] - Optional retry handler with a `run(fn)` method.
 * @property {Function} [transformResponse] - Optional response transformer function.
 * @property {number} [timeoutMs=10000] - Request timeout in milliseconds.
 */

/**
 * Generic, composable HTTP fetch client.
 *
 * Orchestrates the full request lifecycle: cache lookup, timeout setup, fetch
 * execution, error mapping, cache storage, and optional rate-limiting/retry.
 */
export class FetchClient {
  /**
   * Create a new FetchClient instance.
   * @param {FetchClientOptions} options - Client configuration.
   */
  constructor(options) {
    /** @private */
    this._options = options;
  }

  /**
   * Execute an HTTP request with the full lifecycle.
   *
   * Lifecycle steps:
   * 1. Check request cache for GET requests
   * 2. Create timeout AbortSignal via AbortSignal.timeout() (Node.js 20+)
   * 3. Merge with any existing signal from the caller
   * 4. Execute fetch via the adapter
   * 5. Apply optional response transformer
   * 6. On non-OK response: parse body and throw a typed ConfluenceApiError
   * 7. Cache successful GET responses
   * 8. Parse and return response data
   *
   * On failure, maps errors:
   * - AbortError → ConfluenceTimeoutError
   * - ConfluenceApiError → re-throw as-is
   * - Everything else → ConfluenceNetworkError
   *
   * @template T
   * @param {string} url - Fully-qualified request URL.
   * @param {RequestInit} [init={}] - Standard fetch init options.
   * @returns {Promise<T>} Parsed response data.
   * @throws {ConfluenceTimeoutError} If the request exceeds timeoutMs.
   * @throws {ConfluenceNetworkError} If a network-level error occurs.
   * @throws {ConfluenceApiError} If the server returns a non-OK status.
   */
  async request(url, init = {}) {
    const {
      fetchAdapter,
      rateLimitAdapter,
      requestCache,
      retryHandler,
      transformResponse,
      timeoutMs = 10_000,
    } = this._options;

    const cacheKey = `${init.method ?? 'GET'}:${url}`;

    // 1. Check cache for GET requests
    if (requestCache && (init.method === 'GET' || !init.method)) {
      const cached = await requestCache.get(cacheKey);
      if (cached) {
        log.debug('cache hit', { url });
        return /** @type {T} */ (await parseResponseData(cached));
      }
    }

    // 2. Setup timeout signal using Node.js 20+ AbortSignal.timeout()
    const timeoutSignal = createTimeoutSignal(timeoutMs);
    init.signal = init.signal
      ? mergeAbortSignals([init.signal, timeoutSignal])
      : timeoutSignal;

    /**
     * Core fetch execution with error mapping.
     * @returns {Promise<T>}
     */
    const execute = async () => {
      try {
        const response = await fetchAdapter.fetch(url, init);

        // Apply optional response transformer
        const processed = transformResponse
          ? await transformResponse(response)
          : response;

        // Handle non-OK responses
        if (!processed.ok) {
          const body = await processed.text().catch(() => undefined);
          let parsed;
          try {
            parsed = body ? JSON.parse(body) : undefined;
          } catch {
            parsed = undefined;
          }
          const { createErrorFromResponse } = await import('../errors.mjs');
          throw createErrorFromResponse(
            processed.status,
            parsed,
            url,
            init.method ?? 'GET',
            {
              retryAfter:
                Number(processed.headers.get('retry-after')) || undefined,
            },
          );
        }

        // Cache successful GET responses
        if (requestCache && (init.method === 'GET' || !init.method)) {
          await requestCache.set(cacheKey, processed.clone());
        }

        return /** @type {T} */ (await parseResponseData(processed));
      } catch (error) {
        // Map AbortError to ConfluenceTimeoutError
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ConfluenceTimeoutError(
            `Request timed out after ${timeoutMs}ms`,
            { cause: error, url, method: init.method ?? 'GET' },
          );
        }
        // Re-throw Confluence errors as-is
        if (error instanceof ConfluenceApiError) throw error;
        // Map everything else to ConfluenceNetworkError
        throw new ConfluenceNetworkError('Network request failed', {
          cause: error,
          url,
          method: init.method ?? 'GET',
        });
      }
    };

    // Wrap with retry and rate-limiting if adapters are provided
    const withRetry = retryHandler ? () => retryHandler.run(execute) : execute;
    const invoke = rateLimitAdapter
      ? () => rateLimitAdapter.schedule(withRetry)
      : withRetry;
    return invoke();
  }
}
