/**
 * Platform Core Fastify — Bootstrap
 *
 * Server factory with full lifecycle management.
 * Supports booting with ZERO apps (empty server with just health).
 *
 * Loader order: environment -> lifecycle -> plugins -> routes -> app-manifest -> static-frontend
 */

import Fastify from 'fastify';
import closeWithGrace from 'close-with-grace';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import defaultConfig from './config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolve a path relative to the platform-core/fastify/src directory.
 * Handles both relative (./foo) and absolute paths.
 * @param {string} p
 * @returns {string} Absolute path
 */
function resolvePlatformPath(p) {
  if (path.isAbsolute(p)) return p;
  return path.resolve(__dirname, p);
}

/**
 * Merge core + user paths for a given subsystem.
 * Both single strings and arrays are accepted.
 * Core paths come first, then user paths — all sorted together by numeric prefix.
 * @param {string|string[]|undefined} corePath
 * @param {string|string[]|undefined} userPath
 * @returns {string[]}
 */
function mergePaths(corePath, userPath) {
  const core = corePath ? (Array.isArray(corePath) ? corePath : [corePath]) : [];
  const user = userPath ? (Array.isArray(userPath) ? userPath : [userPath]) : [];
  return [...core, ...user];
}

/**
 * Merge user config over platform defaults.
 * Path keys are COMBINED (core + user) into arrays so that platform-core's
 * own lifecycles/routes/plugins directories are searched alongside the
 * server's user-space directories.
 * @param {Object} userConfig
 * @returns {Object} Merged config
 */
function mergeConfig(userConfig = {}) {
  const merged = {
    ...defaultConfig,
    ...userConfig,
    logger: { ...defaultConfig.logger, ...(userConfig.logger || {}) },
  };

  // Merge paths: core defaults + user overrides → arrays
  // This ensures platform-core's own lifecycles/routes/plugins are loaded
  // alongside the server's user-space directories.
  merged.paths = {};
  const defaultPaths = defaultConfig.paths || {};
  const userPaths = userConfig.paths || {};
  const allKeys = new Set([...Object.keys(defaultPaths), ...Object.keys(userPaths)]);

  for (const key of allKeys) {
    const corePath = defaultPaths[key];
    const userPath = userPaths[key];
    merged.paths[key] = mergePaths(corePath, userPath).map(resolvePlatformPath);
  }

  return merged;
}

/**
 * Create and fully configure a Fastify server instance.
 * Does NOT call server.listen() — use start() for that.
 *
 * @param {Object} userConfig - Overrides for default config
 * @param {Object} opts - Bootstrap options
 * @param {boolean} opts.skipGracefulShutdown - Skip close-with-grace (for testing)
 * @returns {Promise<import('fastify').FastifyInstance>}
 */
export async function setup(userConfig = {}, opts = {}) {
  const config = mergeConfig(userConfig);

  // --- Create Fastify instance ---
  const server = Fastify({
    logger: config.logger,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    genReqId: (req) => {
      const existing = req.headers?.['x-request-id'];
      return existing || `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    },
  });

  server.log.info({ title: config.title, profile: config.profile }, 'Platform Core Fastify initializing');

  const bootStartTime = Date.now();

  // --- Step 0: Register error handler (MUST be first, direct call not fp-wrapped) ---
  try {
    const { registerErrorHandlers } = await import('./plugins/error-handler.plugins.mjs');
    registerErrorHandlers(server);
    server.log.debug('Error handler registered');
  } catch {
    server.log.debug('No error handler plugin found (ok for minimal boot)');
  }

  // --- Step 0b: Register sensible plugin ---
  try {
    const { default: sensiblePlugin } = await import('./plugins/sensible.plugins.mjs');
    await server.register(sensiblePlugin);
    server.log.debug('Sensible plugin registered');
  } catch {
    server.log.debug('No sensible plugin found (ok for minimal boot)');
  }

  // --- Loader reports accumulator ---
  const loaderReports = {};

  // --- Loader 1: Environment ---
  try {
    const { loadEnvironment } = await import('./loaders/environment-loader.mjs');
    server.log.info('Loading environment modules');
    loaderReports.environment = await loadEnvironment(server, config);
  } catch {
    server.log.debug('Environment loader not available');
  }

  // --- Loader 2: Lifecycle ---
  let startupHooks = [];
  let shutdownHooks = [];
  try {
    const { loadLifecycles } = await import('./loaders/lifecycle-loader.mjs');
    server.log.info('Loading lifecycle modules');
    const { report, startupHooks: sh, shutdownHooks: sdh } = await loadLifecycles(server, config);
    loaderReports.lifecycle = report;
    startupHooks = sh;
    shutdownHooks = sdh;
  } catch {
    server.log.debug('Lifecycle loader not available');
  }

  // --- Execute startup hooks (before routes) ---
  if (startupHooks.length > 0) {
    server.log.info({ count: startupHooks.length }, 'Executing startup hooks');
    for (const hook of startupHooks) {
      const hookName = hook.name || 'anonymous';
      server.log.debug({ hook: hookName }, 'Running startup hook');
      try {
        await hook(server, config);
      } catch (err) {
        server.log.error({ hook: hookName, error: String(err) }, 'Startup hook failed');
      }
    }
    server.log.info({ count: startupHooks.length }, 'Startup hooks completed');
  }

  // --- Decorate with boot time ---
  if (!server.hasDecorator('bootTime')) {
    server.decorate('bootTime', bootStartTime);
  }

  // --- Loader 3: Routes ---
  try {
    const { loadRoutes } = await import('./loaders/route-loader.mjs');
    server.log.info('Loading route modules');
    loaderReports.routes = await loadRoutes(server, config);
  } catch {
    server.log.debug('Route loader not available');
  }

  // --- Loader 4: App Manifests ---
  try {
    const { loadAppManifests } = await import('./loaders/app-manifest-loader.mjs');
    server.log.info('Loading app manifests');
    loaderReports.appManifests = await loadAppManifests(server, config);
  } catch {
    server.log.debug('App manifest loader not available');
  }

  // --- Loader 5: Static Frontends ---
  try {
    const { loadStaticFrontends } = await import('./loaders/static-frontend-loader.mjs');
    server.log.info('Loading static frontends');
    loaderReports.staticFrontends = await loadStaticFrontends(server, config);
  } catch {
    server.log.debug('Static frontend loader not available');
  }

  // --- Decorate server with loader reports ---
  if (!server.hasDecorator('_loaderReports')) {
    server.decorate('_loaderReports', loaderReports);
  }
  if (!server.hasDecorator('_loadedApps')) {
    server.decorate('_loadedApps', []);
  }
  if (!server.hasDecorator('_skippedApps')) {
    server.decorate('_skippedApps', []);
  }

  // --- Register shutdown hooks via server.addHook('onClose') ---
  if (shutdownHooks.length > 0) {
    server.addHook('onClose', async () => {
      server.log.info({ count: shutdownHooks.length }, 'Executing shutdown hooks');
      for (const hook of shutdownHooks) {
        const hookName = hook.name || 'anonymous';
        try {
          await hook(server, config);
        } catch (err) {
          server.log.error({ hook: hookName, error: String(err) }, 'Shutdown hook failed');
        }
      }
      server.log.info('Shutdown hooks completed');
    });
  }

  // --- Graceful shutdown with close-with-grace ---
  if (!opts.skipGracefulShutdown) {
    const closeListeners = closeWithGrace({ delay: 30000 }, async ({ signal, err, manual }) => {
      if (err) {
        server.log.error({ error: String(err) }, 'Error triggered graceful shutdown');
      }
      server.log.info({ signal, manual }, 'Graceful shutdown initiated');
      await server.close();
      server.log.info('Server closed successfully');
    });

    server.addHook('onClose', async () => {
      closeListeners.uninstall();
    });
  }

  // --- Initial request state ---
  if (config.initial_state) {
    if (!server.hasRequestDecorator('state')) {
      server.decorateRequest('state', null);
    }
    server.addHook('onRequest', async (request) => {
      request.state = structuredClone(config.initial_state);
    });
  }

  // --- Store config on server ---
  if (!server.hasDecorator('_config')) {
    server.decorate('_config', config);
  }

  const bootMs = Date.now() - bootStartTime;
  server.log.info({ bootMs, title: config.title, profile: config.profile }, 'Platform Core Fastify ready');

  return server;
}

/**
 * Gracefully shut down a running server.
 * @param {import('fastify').FastifyInstance} server
 */
export async function shutdown(server) {
  server.log.info('Shutdown requested');
  await server.close();
  server.log.info('Server stopped');
}

/**
 * Create server and start listening.
 * @param {Object} userConfig - Overrides for default config
 * @param {Object} opts - Bootstrap options
 * @returns {Promise<import('fastify').FastifyInstance>}
 */
export async function start(userConfig = {}, opts = {}) {
  const server = await setup(userConfig, opts);
  const config = server._config;

  const host = config.host;
  const port = config.port;

  server.log.info({ host, port }, 'Starting HTTP listener');
  await server.listen({ host, port });
  server.log.info({ host, port, addresses: server.addresses() }, 'Server listening');

  return server;
}

export default { setup, start, shutdown };
