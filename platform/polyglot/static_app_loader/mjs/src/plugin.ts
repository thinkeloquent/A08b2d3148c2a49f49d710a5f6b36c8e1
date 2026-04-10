import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import {
  StaticLoaderOptionsSchema,
  MultiAppOptionsSchema,
  type StaticLoaderOptions,
  type StaticLoaderOptionsInput,
  type MultiAppOptionsInput,
  type RegisterResult,
  type ILogger,
} from './types.js';
import * as logger from './logger.js';
import {
  StaticPathNotFoundError,
  IndexNotFoundError,
  RouteCollisionError,
  ConfigValidationError,
} from './errors.js';
import { rewriteHtmlPathsCached, clearCache } from './path-rewriter.js';
import { resolveTemplateEngine, injectInitialState } from './template-resolver.js';

const registeredPrefixes = new Map<string, string>();

/**
 * Compute the full route prefix from basePath and appName.
 */
function computeRoutePrefix(basePath: string, appName: string): string {
  const base = basePath.startsWith('/') ? basePath : `/${basePath}`;
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${appName}`;
}

/**
 * Register a single static app with Fastify.
 *
 * @param fastify - The Fastify instance
 * @param options - Static app loader options
 * @returns Registration result
 *
 * @example
 * ```typescript
 * import fastify from 'fastify';
 * import { staticAppLoader } from 'static-app-loader';
 *
 * const app = fastify();
 * await app.register(staticAppLoader, {
 *   appName: 'dashboard',
 *   rootPath: '/var/www/dashboard/dist',
 *   spaMode: true,
 * });
 * ```
 */
async function staticAppLoaderPlugin(
  fastify: FastifyInstance,
  opts: StaticLoaderOptionsInput
): Promise<void> {
  const parseResult = StaticLoaderOptionsSchema.safeParse(opts);

  if (!parseResult.success) {
    const errors = parseResult.error.errors.map(
      (e) => `${e.path.join('.')}: ${e.message}`
    );
    throw new ConfigValidationError(errors);
  }

  const options = parseResult.data;
  const log = options.logger ?? logger.create('static-app-loader', 'plugin.ts');

  log.info(`Registering static app: ${options.appName}`, {
    rootPath: options.rootPath,
    spaMode: options.spaMode,
    templateEngine: options.templateEngine,
  });

  // Validate root path exists
  if (!existsSync(options.rootPath)) {
    throw new StaticPathNotFoundError(options.rootPath);
  }

  // Validate index.html exists for SPA mode
  const indexPath = join(options.rootPath, 'index.html');
  if (options.spaMode && !existsSync(indexPath)) {
    throw new IndexNotFoundError(options.rootPath);
  }

  const routePrefix = computeRoutePrefix(options.basePath, options.appName);

  // Check for route collision
  const existingApp = registeredPrefixes.get(routePrefix);
  if (existingApp) {
    throw new RouteCollisionError(routePrefix, [existingApp, options.appName]);
  }
  registeredPrefixes.set(routePrefix, options.appName);

  // Configure template engine if specified
  if (options.templateEngine !== 'none') {
    await resolveTemplateEngine(fastify, options.templateEngine, options.rootPath, log);
  }

  // Register static file serving
  // Mount at /{appName} so that /{appName}/assets/* maps to rootPath/assets/*
  // Only decorate reply with sendFile on the first registration to avoid conflicts
  const fastifyStatic = await import('@fastify/static');
  const shouldDecorate = !fastify.hasReplyDecorator('sendFile');
  await fastify.register(fastifyStatic.default, {
    root: options.rootPath,
    prefix: routePrefix,
    decorateReply: shouldDecorate,
    maxAge: options.maxAge * 1000, // Convert to milliseconds
    wildcard: false, // Disable wildcard; SPA catch-all handles unmatched paths
  });

  log.debug(`Static files mounted at ${routePrefix}`);

  // SPA catch-all route handler
  if (options.spaMode) {
    const spaHandler = createSpaHandler(options, indexPath, options.rootPath, routePrefix, log);

    // Redirect trailing-slash root to non-trailing for consistent SPA handling.
    // @fastify/static registers its own handler for `${routePrefix}/` which
    // serves the raw index.html without SPA path rewriting, so we intercept
    // before it runs and redirect to the canonical non-trailing-slash URL.
    fastify.addHook('onRequest', async (request, reply) => {
      const url = request.raw.url ?? '';
      if (url === `${routePrefix}/` || url.startsWith(`${routePrefix}/?`)) {
        const qs = url.indexOf('?');
        reply.redirect(`${routePrefix}${qs >= 0 ? url.slice(qs) : ''}`);
      }
    });

    // Exact route for app root
    fastify.get(routePrefix, spaHandler);

    // Wildcard route for SPA navigation
    fastify.get(`${routePrefix}/*`, spaHandler);

    log.debug(`SPA catch-all route registered: ${routePrefix}/*`);
  }

  log.info(`Static app registered successfully: ${options.appName}`);
}

/**
 * Create the SPA route handler that serves index.html with path rewriting.
 * For requests that match actual files on disk, sends the file directly
 * instead of falling back to index.html.
 */
function createSpaHandler(
  options: StaticLoaderOptions,
  indexPath: string,
  rootPath: string,
  routePrefix: string,
  log: ILogger
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    log.trace(`SPA request: ${request.url}`);

    // Strip query string and prefix to get the relative file path
    const urlPath = request.url.split('?')[0];
    const relativePath = urlPath.startsWith(routePrefix)
      ? urlPath.slice(routePrefix.length)
      : urlPath;

    // If the path has a file extension, check if it exists on disk
    if (relativePath && /\.\w+$/.test(relativePath)) {
      const filePath = join(rootPath, relativePath);
      if (existsSync(filePath)) {
        return reply.sendFile(relativePath, rootPath);
      }
    }

    try {
      let html = await readFile(indexPath, 'utf-8');

      // Rewrite asset paths
      html = rewriteHtmlPathsCached(html, indexPath, {
        appName: options.appName,
        urlPrefix: options.urlPrefix,
        basePath: options.basePath,
        enableCache: process.env['NODE_ENV'] === 'production',
      });

      // Inject initial state if default context is provided
      if (Object.keys(options.defaultContext).length > 0) {
        html = injectInitialState(html, options.defaultContext);
      }

      reply.type('text/html').send(html);
    } catch (err) {
      log.error('Failed to serve SPA index', {
        error: err instanceof Error ? err.message : String(err),
        path: request.url,
      });
      throw err;
    }
  };
}

/**
 * Register multiple static apps with collision detection.
 *
 * @param fastify - The Fastify instance
 * @param options - Multi-app registration options
 * @returns Array of registration results
 */
export async function registerMultipleApps(
  fastify: FastifyInstance,
  opts: MultiAppOptionsInput
): Promise<RegisterResult[]> {
  const parseResult = MultiAppOptionsSchema.safeParse(opts);

  if (!parseResult.success) {
    const errors = parseResult.error.errors.map(
      (e) => `${e.path.join('.')}: ${e.message}`
    );
    throw new ConfigValidationError(errors);
  }

  const options = parseResult.data;
  const log = options.logger ?? logger.create('static-app-loader', 'plugin.ts');
  const results: RegisterResult[] = [];

  // Pre-check for collisions
  const prefixMap = new Map<string, string[]>();
  for (const app of options.apps) {
    const prefix = computeRoutePrefix(app.basePath, app.appName);
    const existing = prefixMap.get(prefix) ?? [];
    existing.push(app.appName);
    prefixMap.set(prefix, existing);
  }

  // Check for collisions within the batch
  for (const [prefix, apps] of prefixMap) {
    if (apps.length > 1) {
      switch (options.collisionStrategy) {
        case 'error':
          throw new RouteCollisionError(prefix, apps);
        case 'warn':
          log.warn(`Route collision detected: ${prefix}`, { apps });
          break;
        case 'skip':
          log.info(`Skipping duplicate apps for prefix: ${prefix}`, { apps: apps.slice(1) });
          break;
      }
    }
  }

  // Register each app
  const processedPrefixes = new Set<string>();
  for (const app of options.apps) {
    const prefix = computeRoutePrefix(app.basePath, app.appName);

    // Skip duplicates based on strategy
    if (processedPrefixes.has(prefix) && options.collisionStrategy === 'skip') {
      results.push({
        appName: app.appName,
        success: false,
        error: `Skipped: duplicate route prefix ${prefix}`,
        routePrefix: prefix,
        rootPath: app.rootPath,
      });
      continue;
    }

    try {
      await fastify.register(staticAppLoader, {
        ...app,
        logger: options.logger ?? app.logger,
      });
      processedPrefixes.add(prefix);
      results.push({
        appName: app.appName,
        success: true,
        routePrefix: prefix,
        rootPath: app.rootPath,
      });
    } catch (err) {
      results.push({
        appName: app.appName,
        success: false,
        error: err instanceof Error ? err.message : String(err),
        routePrefix: prefix,
        rootPath: app.rootPath,
      });

      if (options.collisionStrategy === 'error') {
        throw err;
      }
    }
  }

  const successCount = results.filter((r) => r.success).length;
  log.info(`Multi-app registration complete: ${successCount}/${results.length} succeeded`);

  return results;
}

/**
 * Clear the path rewriter cache.
 * Useful for development mode or manual cache invalidation.
 */
export function clearPathCache(): void {
  clearCache();
}

/**
 * Get the currently registered route prefixes.
 * Useful for debugging and collision detection.
 */
export function getRegisteredPrefixes(): Map<string, string> {
  return new Map(registeredPrefixes);
}

/**
 * Reset all registered prefixes.
 * Primarily for testing purposes.
 */
export function resetRegisteredPrefixes(): void {
  registeredPrefixes.clear();
}

// Export as Fastify plugin
export const staticAppLoader = fp(staticAppLoaderPlugin, {
  fastify: '>=4.0.0',
  name: 'static-app-loader',
});

export default staticAppLoader;
