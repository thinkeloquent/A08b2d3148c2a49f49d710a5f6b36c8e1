/**
 * @module utils/createTimeoutSignal
 * @description AbortSignal utilities for request timeout management.
 */

/**
 * Create an AbortSignal that aborts after the specified timeout.
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {AbortSignal}
 */
export function createTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  controller.signal.addEventListener('abort', () => clearTimeout(timeout), { once: true });
  return controller.signal;
}

/**
 * Merge multiple AbortSignals into a single signal.
 * If any input signal aborts, the returned signal will abort.
 * @param {AbortSignal[]} signals
 * @returns {AbortSignal}
 */
export function mergeAbortSignals(signals) {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return controller.signal;
}
