import type { FastifyInstance } from 'fastify';
import type {
  StaticLoaderOptionsInput,
  StaticLoaderOptions,
  MultiAppOptionsInput,
  RegisterResult,
  TemplateEngine,
  ILogger,
} from './types.js';
import { StaticLoaderOptionsSchema, MultiAppOptionsSchema } from './types.js';
import { staticAppLoader, registerMultipleApps } from './plugin.js';

/**
 * Builder class for creating static app loader configurations with method chaining.
 *
 * @example
 * ```typescript
 * const loader = createStaticAppLoader()
 *   .appName('dashboard')
 *   .rootPath('/var/www/dashboard/dist')
 *   .spaMode(true)
 *   .templateEngine('mustache')
 *   .build();
 *
 * await app.register(staticAppLoader, loader);
 * ```
 */
export class StaticAppLoaderBuilder {
  private config: Partial<StaticLoaderOptionsInput> = {};

  /**
   * Set the app name (required).
   */
  appName(name: string): this {
    this.config.appName = name;
    return this;
  }

  /**
   * Set the root path to the frontend dist directory (required).
   */
  rootPath(path: string): this {
    this.config.rootPath = path;
    return this;
  }

  /**
   * Set the base path prefix combined with appName to form the route prefix.
   */
  basePath(path: string): this {
    this.config.basePath = path;
    return this;
  }

  /**
   * Set the template engine for SSR rendering.
   */
  templateEngine(engine: TemplateEngine): this {
    this.config.templateEngine = engine;
    return this;
  }

  /**
   * Set the URL prefix for static assets.
   */
  urlPrefix(prefix: string): this {
    this.config.urlPrefix = prefix;
    return this;
  }

  /**
   * Set the default context for template rendering.
   */
  defaultContext(context: Record<string, unknown>): this {
    this.config.defaultContext = context;
    return this;
  }

  /**
   * Enable or disable SPA mode (catch-all routing).
   */
  spaMode(enabled: boolean): this {
    this.config.spaMode = enabled;
    return this;
  }

  /**
   * Set the cache max-age in seconds.
   */
  maxAge(seconds: number): this {
    this.config.maxAge = seconds;
    return this;
  }

  /**
   * Set a custom logger instance.
   */
  logger(log: ILogger): this {
    this.config.logger = log;
    return this;
  }

  /**
   * Validate and build the configuration object.
   * @throws {Error} If validation fails
   */
  build(): StaticLoaderOptions {
    const result = StaticLoaderOptionsSchema.safeParse(this.config);
    if (!result.success) {
      const errors = result.error.errors.map(
        (e) => `${e.path.join('.')}: ${e.message}`
      );
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
    return result.data;
  }

  /**
   * Get the raw configuration without validation.
   */
  toInput(): StaticLoaderOptionsInput {
    return this.config as StaticLoaderOptionsInput;
  }
}

/**
 * Builder class for multi-app registration.
 */
export class MultiAppBuilder {
  private apps: StaticLoaderOptionsInput[] = [];
  private collisionStrategy: 'error' | 'warn' | 'skip' = 'error';
  private sharedLogger?: ILogger;

  /**
   * Add an app configuration using the builder pattern.
   */
  addApp(builderFn: (builder: StaticAppLoaderBuilder) => StaticAppLoaderBuilder): this {
    const builder = new StaticAppLoaderBuilder();
    builderFn(builder);
    this.apps.push(builder.toInput());
    return this;
  }

  /**
   * Add an app configuration from an object.
   */
  addAppConfig(config: StaticLoaderOptionsInput): this {
    this.apps.push(config);
    return this;
  }

  /**
   * Set the collision handling strategy.
   */
  onCollision(strategy: 'error' | 'warn' | 'skip'): this {
    this.collisionStrategy = strategy;
    return this;
  }

  /**
   * Set a shared logger for all apps.
   */
  logger(log: ILogger): this {
    this.sharedLogger = log;
    return this;
  }

  /**
   * Validate and build the multi-app configuration.
   */
  build(): MultiAppOptionsInput {
    return {
      apps: this.apps,
      collisionStrategy: this.collisionStrategy,
      logger: this.sharedLogger,
    };
  }

  /**
   * Register all apps with a Fastify instance.
   */
  async register(fastify: FastifyInstance): Promise<RegisterResult[]> {
    return registerMultipleApps(fastify, this.build());
  }
}

/**
 * Create a new static app loader configuration builder.
 *
 * @example
 * ```typescript
 * import { createStaticAppLoader } from 'static-app-loader';
 *
 * const config = createStaticAppLoader()
 *   .appName('dashboard')
 *   .rootPath('/var/www/dashboard/dist')
 *   .spaMode(true)
 *   .build();
 * ```
 */
export function createStaticAppLoader(): StaticAppLoaderBuilder {
  return new StaticAppLoaderBuilder();
}

/**
 * Create a new multi-app registration builder.
 *
 * @example
 * ```typescript
 * import { createMultiAppLoader } from 'static-app-loader';
 *
 * const results = await createMultiAppLoader()
 *   .addApp(b => b.appName('dashboard').rootPath('/var/www/dashboard/dist'))
 *   .addApp(b => b.appName('admin').rootPath('/var/www/admin/dist'))
 *   .onCollision('warn')
 *   .register(fastify);
 * ```
 */
export function createMultiAppLoader(): MultiAppBuilder {
  return new MultiAppBuilder();
}

/**
 * Validate a configuration object without registering.
 *
 * @param config - The configuration to validate
 * @returns Validation result with parsed config or errors
 */
export function validateConfig(
  config: unknown
): { success: true; data: StaticLoaderOptions } | { success: false; errors: string[] } {
  const result = StaticLoaderOptionsSchema.safeParse(config);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
  };
}

/**
 * Quick registration helper for single apps.
 *
 * @param fastify - The Fastify instance
 * @param options - Static app loader options
 */
export async function registerStaticApp(
  fastify: FastifyInstance,
  options: StaticLoaderOptionsInput
): Promise<void> {
  await fastify.register(staticAppLoader, options);
}
