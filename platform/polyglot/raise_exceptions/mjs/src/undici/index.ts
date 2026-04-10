/**
 * Undici adapter for common-exceptions.
 *
 * Provides error wrapping for Undici HTTP client (built into Node.js 18+).
 *
 * @example
 * import { wrapUndiciErrors, checkUpstreamStatus } from '@internal/common-exceptions/undici';
 *
 * const fetchUser = wrapUndiciErrors(async (userId: string) => {
 *   const response = await fetch(`/users/${userId}`);
 *   checkUpstreamStatus(response, 'user-service');
 *   return response.json();
 * }, { service: 'user-service' });
 */

export {
  wrapUndiciErrors,
  undiciErrorToException,
  checkUpstreamStatus,
  extractServiceFromUrl,
  WrapUndiciErrorsOptions,
} from './wrappers.js';
