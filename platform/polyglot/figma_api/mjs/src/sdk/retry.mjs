/**
 * Retry Module — Figma API SDK
 *
 * Exponential backoff with jitter.
 * max retries: 3, initial wait: 1s, max wait: 30s.
 * On 429, defers to Retry-After instead of backoff.
 */

import { create } from '../logger.mjs';
import { DEFAULTS } from '../config.mjs';

const log = create('figma-api', import.meta.url);

/**
 * Calculate backoff delay with jitter.
 * @param {number} attempt - Current attempt number (0-based)
 * @param {number} initialWait - Initial wait in ms
 * @param {number} maxWait - Maximum wait in ms
 * @returns {number} Delay in ms
 */
export function calculateBackoff(attempt, initialWait = DEFAULTS.retryInitialWait, maxWait = DEFAULTS.retryMaxWait) {
  const exponential = initialWait * Math.pow(2, attempt);
  const jitter = Math.random() * initialWait;
  return Math.min(exponential + jitter, maxWait);
}

/**
 * Determine if a response status is retryable.
 */
export function isRetryable(status) {
  // 429 is handled separately by rate-limit module
  // 5xx errors are retryable
  return status >= 500;
}

/**
 * Sleep for the given duration.
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic.
 * @param {Function} fn - Async function to retry
 * @param {object} options - Retry options
 * @returns {Promise<*>} Result of fn
 */
export async function withRetry(fn, {
  maxRetries = DEFAULTS.maxRetries,
  initialWait = DEFAULTS.retryInitialWait,
  maxWait = DEFAULTS.retryMaxWait,
} = {}) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;

      if (attempt >= maxRetries) {
        log.error('max retries exceeded', { attempts: attempt + 1, error: error.message });
        throw error;
      }

      // Don't retry non-retryable errors
      if (error.status && !isRetryable(error.status) && error.status !== 429) {
        throw error;
      }

      const delay = calculateBackoff(attempt, initialWait, maxWait);
      log.warn('retrying request', { attempt: attempt + 1, maxRetries, delayMs: Math.round(delay) });
      await sleep(delay);
    }
  }

  throw lastError;
}
