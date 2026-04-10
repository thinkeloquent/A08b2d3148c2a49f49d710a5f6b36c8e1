/**
 * Base error class for static app loader errors.
 */
export class StaticAppLoaderError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'StaticAppLoaderError';
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when the static root directory does not exist.
 */
export class StaticPathNotFoundError extends StaticAppLoaderError {
  readonly path: string;

  constructor(path: string) {
    super(`Static root directory does not exist: ${path}`, 'STATIC_PATH_NOT_FOUND');
    this.name = 'StaticPathNotFoundError';
    this.path = path;
  }
}

/**
 * Error thrown when an unsupported template engine is specified.
 */
export class UnsupportedTemplateEngineError extends StaticAppLoaderError {
  readonly engine: string;

  constructor(engine: string) {
    super(
      `Unsupported template engine: '${engine}'. Supported engines: mustache, liquid, edge, none`,
      'UNSUPPORTED_TEMPLATE_ENGINE'
    );
    this.name = 'UnsupportedTemplateEngineError';
    this.engine = engine;
  }
}

/**
 * Error thrown when route prefix collision is detected.
 */
export class RouteCollisionError extends StaticAppLoaderError {
  readonly conflictingApps: string[];
  readonly routePrefix: string;

  constructor(routePrefix: string, conflictingApps: string[]) {
    super(
      `Route prefix collision detected for '${routePrefix}': ${conflictingApps.join(', ')}`,
      'ROUTE_COLLISION'
    );
    this.name = 'RouteCollisionError';
    this.routePrefix = routePrefix;
    this.conflictingApps = conflictingApps;
  }
}

/**
 * Error thrown when configuration validation fails.
 */
export class ConfigValidationError extends StaticAppLoaderError {
  readonly validationErrors: string[];

  constructor(errors: string[]) {
    super(`Configuration validation failed:\n${errors.join('\n')}`, 'CONFIG_VALIDATION_ERROR');
    this.name = 'ConfigValidationError';
    this.validationErrors = errors;
  }
}

/**
 * Error thrown when index.html is not found in the root path.
 */
export class IndexNotFoundError extends StaticAppLoaderError {
  readonly rootPath: string;

  constructor(rootPath: string) {
    super(`index.html not found in root path: ${rootPath}`, 'INDEX_NOT_FOUND');
    this.name = 'IndexNotFoundError';
    this.rootPath = rootPath;
  }
}
