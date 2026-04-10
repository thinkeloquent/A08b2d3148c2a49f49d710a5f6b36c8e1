import { z } from 'zod';

/**
 * Logger interface for consistent structured logging across the module.
 * Implementations must support all log levels with contextual output.
 */
export interface ILogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  trace(message: string, context?: Record<string, unknown>): void;
}

/**
 * Supported template engines for SSR rendering.
 */
export const TemplateEngineSchema = z.enum(['mustache', 'liquid', 'edge', 'none']);
export type TemplateEngine = z.infer<typeof TemplateEngineSchema>;

/**
 * Collision strategy for multi-app registration.
 */
export const CollisionStrategySchema = z.enum(['error', 'warn', 'skip']);
export type CollisionStrategy = z.infer<typeof CollisionStrategySchema>;

/**
 * Configuration schema for static app loader.
 * Validated using Zod for runtime type safety.
 */
export const StaticLoaderOptionsSchema = z.object({
  /** Required: unique app identifier used in route prefix */
  appName: z.string().min(1, 'appName is required'),
  /** Required: absolute path to frontend dist/ directory */
  rootPath: z.string().min(1, 'rootPath is required'),
  /** Base path prefix combined with appName to form the route prefix. Default: '/apps/' */
  basePath: z.string().default('/apps/'),
  /** Template engine to use for index.html. Default: 'none' */
  templateEngine: TemplateEngineSchema.default('none'),
  /** URL prefix for static assets. Default: '/assets' */
  urlPrefix: z.string().default('/assets'),
  /** Default context data for template rendering. Default: {} */
  defaultContext: z.record(z.unknown()).default({}),
  /** Enable SPA catch-all routing. Default: true */
  spaMode: z.boolean().default(true),
  /** Cache max-age in seconds. Default: 86400 (1 day) */
  maxAge: z.number().int().min(0).default(86400),
  /** Optional custom logger instance */
  logger: z.custom<ILogger>().optional(),
});

export type StaticLoaderOptions = z.infer<typeof StaticLoaderOptionsSchema>;

/**
 * Input type for StaticLoaderOptions (before defaults are applied).
 */
export type StaticLoaderOptionsInput = z.input<typeof StaticLoaderOptionsSchema>;

/**
 * Multi-app registration options.
 */
export const MultiAppOptionsSchema = z.object({
  /** Array of app configurations */
  apps: z.array(StaticLoaderOptionsSchema),
  /** How to handle route prefix collisions. Default: 'error' */
  collisionStrategy: CollisionStrategySchema.default('error'),
  /** Optional shared logger for all apps */
  logger: z.custom<ILogger>().optional(),
});

export type MultiAppOptions = z.infer<typeof MultiAppOptionsSchema>;
export type MultiAppOptionsInput = z.input<typeof MultiAppOptionsSchema>;

/**
 * Result of a single app registration.
 */
export interface RegisterResult {
  /** App name that was registered */
  appName: string;
  /** Whether registration succeeded */
  success: boolean;
  /** Error message if registration failed */
  error?: string;
  /** Route prefix for the app */
  routePrefix: string;
  /** Absolute path to root directory */
  rootPath: string;
}

/**
 * Context data for template rendering.
 */
export interface RenderContext {
  /** Request-specific data */
  request?: Record<string, unknown>;
  /** Static configuration data */
  config?: Record<string, unknown>;
  /** Custom user data */
  [key: string]: unknown;
}

/**
 * Options for HTML path rewriting.
 */
export interface PathRewriteOptions {
  /** App name for route prefix */
  appName: string;
  /** URL prefix for assets */
  urlPrefix: string;
  /** Base path prefix combined with appName. Default: '/apps/' */
  basePath?: string;
  /** Enable caching of rewritten HTML */
  enableCache?: boolean;
  /** Cache TTL in milliseconds. Default: 60000 (1 minute) */
  cacheTtl?: number;
}
