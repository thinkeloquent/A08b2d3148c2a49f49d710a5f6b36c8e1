// Main entry point for static-app-loader (Node.js/Fastify)

// Export the Fastify plugin
export {
  staticAppLoader,
  staticAppLoader as default,
  registerMultipleApps,
  clearPathCache,
  getRegisteredPrefixes,
  resetRegisteredPrefixes,
} from './plugin.js';

// Export types and schemas
export {
  type ILogger,
  type TemplateEngine,
  type CollisionStrategy,
  type StaticLoaderOptions,
  type StaticLoaderOptionsInput,
  type MultiAppOptions,
  type MultiAppOptionsInput,
  type RegisterResult,
  type RenderContext,
  type PathRewriteOptions,
  StaticLoaderOptionsSchema,
  MultiAppOptionsSchema,
  TemplateEngineSchema,
  CollisionStrategySchema,
} from './types.js';

// Export errors
export {
  StaticAppLoaderError,
  StaticPathNotFoundError,
  UnsupportedTemplateEngineError,
  RouteCollisionError,
  ConfigValidationError,
  IndexNotFoundError,
} from './errors.js';

// Export logger utilities
export * as logger from './logger.js';

// Export path rewriter utilities
export {
  rewriteHtmlPaths,
  rewriteHtmlPathsCached,
  clearCache,
  getCacheSize,
} from './path-rewriter.js';

// Export template utilities
export {
  resolveTemplateEngine,
  renderTemplate,
  injectInitialState,
} from './template-resolver.js';

// Export SDK builders
export {
  createStaticAppLoader,
  createMultiAppLoader,
  validateConfig,
  registerStaticApp,
  StaticAppLoaderBuilder,
  MultiAppBuilder,
} from './sdk.js';
