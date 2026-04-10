/**
 * SDK barrel exports — Figma API SDK
 */

// Core client
export { FigmaClient, createLogger } from './client.mjs';

// Auth
export { resolveToken, maskToken, AuthError } from './auth.mjs';

// Errors
export {
  FigmaError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ApiError,
  ServerError,
  NetworkError,
  TimeoutError,
  ConfigurationError,
  mapResponseToError,
} from './errors.mjs';

// Rate limiting
export {
  parseRateLimitHeaders,
  waitForRetryAfter,
  shouldAutoWait,
  handleRateLimit,
} from './rate-limit.mjs';

// Cache
export { RequestCache } from './cache.mjs';

// Retry
export { calculateBackoff, isRetryable, withRetry } from './retry.mjs';

// Domain clients
export { ProjectsClient } from './projects/index.mjs';
export { FilesClient } from './files/index.mjs';
export { CommentsClient } from './comments/index.mjs';
export { ComponentsClient } from './components/index.mjs';
export { VariablesClient } from './variables/index.mjs';
export { DevResourcesClient } from './dev-resources/index.mjs';
export { LibraryAnalyticsClient } from './library-analytics/index.mjs';
export { WebhooksClient } from './webhooks/index.mjs';
