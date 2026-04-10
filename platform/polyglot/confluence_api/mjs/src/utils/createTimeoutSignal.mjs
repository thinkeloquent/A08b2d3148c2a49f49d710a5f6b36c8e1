/**
 * @module utils/createTimeoutSignal
 * @description AbortSignal utilities for request timeout and cancellation management.
 *
 * Leverages Node.js 20+ built-in APIs:
 * - `AbortSignal.timeout(ms)` — creates a signal that auto-aborts after a delay
 * - `AbortSignal.any(signals)` — creates a signal that aborts when any input signal aborts
 *
 * These utilities are used internally by FetchClient to enforce request timeouts
 * and merge caller-provided abort signals with timeout signals.
 *
 * @example
 * import { createTimeoutSignal, mergeAbortSignals } from './createTimeoutSignal.mjs';
 *
 * // Simple timeout
 * const signal = createTimeoutSignal(5000);
 * await fetch(url, { signal });
 *
 * // Merge user cancellation with timeout
 * const controller = new AbortController();
 * const merged = mergeAbortSignals([controller.signal, createTimeoutSignal(10_000)]);
 * await fetch(url, { signal: merged });
 * // Cancel manually at any time:
 * controller.abort();
 */

/**
 * Create an AbortSignal that automatically aborts after the specified timeout.
 *
 * Uses the Node.js 20+ `AbortSignal.timeout()` static method, which is
 * more efficient than manual AbortController + setTimeout patterns because
 * the runtime manages the timer lifecycle and garbage collection internally.
 *
 * @param {number} ms - Timeout duration in milliseconds.
 * @returns {AbortSignal} An AbortSignal that will abort after `ms` milliseconds.
 * @throws {TypeError} If `ms` is not a non-negative number.
 *
 * @example
 * const signal = createTimeoutSignal(5000); // Aborts after 5 seconds
 * try {
 *   await fetch('https://confluence.example.com/rest/api/content', { signal });
 * } catch (err) {
 *   if (err.name === 'AbortError') {
 *     console.error('Request timed out');
 *   }
 * }
 */
export function createTimeoutSignal(ms) {
  return AbortSignal.timeout(ms);
}

/**
 * Merge multiple AbortSignals into a single composite signal.
 *
 * Uses the Node.js 20+ `AbortSignal.any()` static method. The returned signal
 * will abort as soon as any of the input signals aborts. This is useful for
 * combining a timeout signal with a user-controlled cancellation signal.
 *
 * If any input signal is already aborted at call time, the returned signal
 * will be immediately aborted.
 *
 * @param {AbortSignal[]} signals - Array of AbortSignal instances to merge.
 * @returns {AbortSignal} A composite signal that aborts when any input signal aborts.
 * @throws {TypeError} If signals is not an iterable of AbortSignal instances.
 *
 * @example
 * const controller = new AbortController();
 * const timeout = createTimeoutSignal(10_000);
 * const merged = mergeAbortSignals([controller.signal, timeout]);
 *
 * // The fetch will abort if either:
 * // - The 10-second timeout fires
 * // - controller.abort() is called manually
 * await fetch(url, { signal: merged });
 */
export function mergeAbortSignals(signals) {
  return AbortSignal.any(signals);
}
