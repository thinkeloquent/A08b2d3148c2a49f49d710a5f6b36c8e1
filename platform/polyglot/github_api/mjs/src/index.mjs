/**
 * Main barrel exports for @internal/github-api.
 * Re-exports SDK, routes, and middleware modules.
 * @module @internal/github-api
 */

// SDK exports
export {
  GitHubClient,
  createLogger,
} from './sdk/index.mjs';

export {
  resolveToken,
  maskToken,
} from './sdk/index.mjs';

export {
  GitHubError,
  AuthError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ConflictError,
  ForbiddenError,
  ServerError,
  mapResponseToError,
} from './sdk/index.mjs';

export {
  validateRepositoryName,
  validateUsername,
  validateBranchName,
  RESERVED_REPO_NAMES,
} from './sdk/index.mjs';

export {
  paginate,
  paginateAll,
} from './sdk/index.mjs';

export {
  parseRateLimitHeaders,
  shouldWaitForRateLimit,
  waitForRateLimit,
  isSecondaryRateLimit,
} from './sdk/index.mjs';

export {
  ReposClient,
  BranchesClient,
  CollaboratorsClient,
  TagsClient,
  WebhooksClient,
  SecurityClient,
  ActionsClient,
} from './sdk/index.mjs';

// Routes
export { registerRoutes } from './routes/index.mjs';

// Middleware
export {
  response204Hook,
  jsonFallbackHook,
  requestIdHook,
  rateLimitHook,
  createErrorHandler,
} from './middleware/index.mjs';

// Server
export { createServer, startServer } from './server.mjs';

// Config
export { loadConfig } from './config.mjs';
