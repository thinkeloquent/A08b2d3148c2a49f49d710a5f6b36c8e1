/**
 * Middleware barrel exports.
 * @module middleware
 */

export {
  response204Hook,
  jsonFallbackHook,
  requestIdHook,
  rateLimitHook,
} from './github-hooks.mjs';

export { createErrorHandler } from './error-handler.mjs';
