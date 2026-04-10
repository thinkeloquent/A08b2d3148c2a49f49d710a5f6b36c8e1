/**
 * Figma API SDK — Main Package Export (Node.js)
 *
 * Unified export for all SDK modules.
 *
 * @example
 * import { FigmaClient, ProjectsClient } from '@internal/figma-api';
 * const client = new FigmaClient({ token: 'your-token' });
 * const projects = new ProjectsClient(client);
 * const result = await projects.getTeamProjects('team-id');
 */

// Logger
export { create, SDKLogger, LEVELS } from './logger.mjs';

// Config
export { loadConfig, DEFAULTS } from './config.mjs';

// SDK (re-export everything)
export {
  // Core
  FigmaClient,
  createLogger,
  // Auth
  resolveToken,
  maskToken,
  AuthError,
  // Errors
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
  // Rate limiting
  parseRateLimitHeaders,
  waitForRetryAfter,
  shouldAutoWait,
  handleRateLimit,
  // Cache
  RequestCache,
  // Retry
  calculateBackoff,
  isRetryable,
  withRetry,
  // Domain clients
  ProjectsClient,
  FilesClient,
  CommentsClient,
  ComponentsClient,
  VariablesClient,
  DevResourcesClient,
  LibraryAnalyticsClient,
  WebhooksClient,
} from './sdk/index.mjs';

// Middleware
export { createErrorHandler } from './middleware/error-handler.mjs';
export {
  response204Hook,
  jsonFallbackHook,
  requestIdHook,
  rateLimitHook,
} from './middleware/figma-hooks.mjs';

// Server
export { createServer, startServer } from './server.mjs';

// Routes
export { registerRoutes } from './routes/index.mjs';
