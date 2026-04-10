/**
 * @module client/FetchClient
 * @description Generic, composable fetch client with pluggable adapters.
 * Provides foundation for HTTP requests with error handling,
 * timeout support, and optional caching/retry/rate-limiting.
 */

import { parseResponseData } from '../utils/parseResponseData.mjs';
import { createTimeoutSignal, mergeAbortSignals } from '../utils/createTimeoutSignal.mjs';
import { JiraApiError, JiraTimeoutError, JiraNetworkError, ErrorCode } from '../errors.mjs';
import { createLogger } from '../logger.mjs';

const log = createLogger('jira-api', import.meta.url);

export class FetchClient {
  /** @param {import('../types.d.ts').FetchClientOptions} options */
  constructor(options) {
    this._options = options;
  }

  /**
   * Make an HTTP request with full lifecycle support.
   * @template T
   * @param {string} url
   * @param {RequestInit} [init={}]
   * @returns {Promise<T>}
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

    // Check cache for GET requests
    if (requestCache && (init.method === 'GET' || !init.method)) {
      const cached = await requestCache.get(cacheKey);
      if (cached) return /** @type {T} */ (await parseResponseData(cached));
    }

    // Setup timeout signal
    const timeoutSignal = createTimeoutSignal(timeoutMs);
    init.signal = init.signal
      ? mergeAbortSignals([init.signal, timeoutSignal])
      : timeoutSignal;

    const execute = async () => {
      try {
        const response = await fetchAdapter.fetch(url, init);

        const processed = transformResponse
          ? await transformResponse(response)
          : response;

        if (!processed.ok) {
          const body = await processed.text().catch(() => undefined);
          let parsed;
          try { parsed = body ? JSON.parse(body) : undefined; } catch { parsed = undefined; }
          const { createErrorFromResponse } = await import('../errors.mjs');
          throw createErrorFromResponse(
            processed.status,
            parsed,
            url,
            init.method ?? 'GET',
            { retryAfter: Number(processed.headers.get('retry-after')) || undefined },
          );
        }

        // Cache successful GET requests
        if (requestCache && (init.method === 'GET' || !init.method)) {
          await requestCache.set(cacheKey, processed.clone());
        }

        return /** @type {T} */ (await parseResponseData(processed));
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new JiraTimeoutError(`Request timed out after ${timeoutMs}ms`, {
            cause: error, url, method: init.method ?? 'GET',
          });
        }
        if (error instanceof JiraApiError) throw error;
        throw new JiraNetworkError('Network request failed', {
          cause: error, url, method: init.method ?? 'GET',
        });
      }
    };

    const withRetry = retryHandler ? () => retryHandler.run(execute) : execute;
    const invoke = rateLimitAdapter ? () => rateLimitAdapter.schedule(withRetry) : withRetry;
    return invoke();
  }
}
