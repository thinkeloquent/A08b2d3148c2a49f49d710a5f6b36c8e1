/**
 * Sauce Labs REST API Lifecycle Hook for Fastify
 *
 * Initializes the Sauce Labs API client and registers all Sauce Labs API
 * proxy routes under the /~/api/rest/{api_release_date}/providers/saucelabs_api prefix.
 *
 * Loading Order: 520 (after core services, GitHub SDK, and Figma SDK)
 *
 * Environment Variables:
 *   SAUCE_USERNAME   - Sauce Labs username
 *   SAUCE_ACCESS_KEY - Sauce Labs access key
 *
 * Usage in routes:
 *   const saucelabs = req.server.saucelabs;                    // SaucelabsClient
 *   const clients   = req.server.saucelabsClients;             // Domain modules dict
 *
 * Registered endpoints (prefix: /~/api/rest/{api_release_date}/providers/saucelabs_api):
 *   GET    /health                                             - Health check
 *   GET    /v1/jobs                                            - List jobs
 *   GET    /v1/jobs/:jobId                                     - Get job
 *   GET    /v1/platform/status                                 - Get platform status
 *   GET    /v1/platform/:automationApi                         - Get platforms
 *   GET    /v1/users/:username                                 - Get user
 *   GET    /v1/users/:username/concurrency                     - Get concurrency
 *   POST   /v1/upload                                          - Upload app
 */

import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

import {
  SaucelabsClient,
  createSaucelabsClient,
  createErrorHandler,
} from '../../../polyglot/saucelabs_api/mjs/src/index.mjs';
import { resolveSaucelabsEnv } from '@internal/env-resolver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..');

const VENDOR = 'saucelabs_api';
const VENDOR_VERSION = 'v1';

/**
 * Resolve Sauce Labs credentials from server config or environment variables.
 *
 * @param {import('fastify').FastifyInstance} server
 * @returns {{ username: string, apiKey: string }} The resolved credentials
 */
function resolveSaucelabsCredentials(server) {
  let configUsername;
  let configApiKey;

  if (server.config && typeof server.config.getNested === 'function') {
    try {
      configUsername = server.config.getNested(['providers', 'saucelabs', 'username']);
    } catch (_) { /* not configured */ }
    try {
      configApiKey = server.config.getNested(['providers', 'saucelabs', 'endpoint_api_key']);
    } catch (_) { /* not configured */ }
  }

  const _saucelabsEnv = resolveSaucelabsEnv();
  const username = configUsername || _saucelabsEnv.username;
  const apiKey = configApiKey || _saucelabsEnv.accessKey;

  if (!username || !apiKey) {
    throw new Error(
      'Sauce Labs credentials not found. ' +
      'Set providers.saucelabs.username and providers.saucelabs.endpoint_api_key in config ' +
      'or SAUCE_USERNAME and SAUCE_ACCESS_KEY env vars.',
    );
  }
  return { username, apiKey };
}

/**
 * Startup hook -- Initialize Sauce Labs API client and register routes.
 *
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config - Bootstrap config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:saucelabs_api] Initializing Sauce Labs API SDK...');

  try {
  // ── Credential Resolution ──────────────────────────────────────────
  let username, apiKey;
  try {
    server.log.info('[lifecycle:saucelabs_api] Resolving Sauce Labs credentials from config or environment');
    ({ username, apiKey } = resolveSaucelabsCredentials(server));
  } catch (err) {
    server.log.warn(
      { err },
      '[lifecycle:saucelabs_api] Sauce Labs credentials not found -- SDK routes will NOT be registered.',
    );
    return;
  }

  const maskedKey = apiKey.length > 8
    ? apiKey.slice(0, 4) + '****' + apiKey.slice(-4)
    : '****';
  server.log.info({ username, maskedKey }, `[lifecycle:saucelabs_api] Credentials resolved (user: ${username}, key: ${maskedKey})`);

  // ── Base Client ────────────────────────────────────────────────────
  server.log.info('[lifecycle:saucelabs_api] Creating Sauce Labs client instance');
  const saucelabs = createSaucelabsClient({ username, apiKey });

  // ── Domain Modules ─────────────────────────────────────────────────
  const clients = {
    jobs: saucelabs.jobs,
    platform: saucelabs.platform,
    users: saucelabs.users,
    upload: saucelabs.upload,
  };

  // ── Server Decorators ──────────────────────────────────────────────
  if (!server.hasDecorator('saucelabs')) {
    server.decorate('saucelabs', saucelabs);
  }
  if (!server.hasDecorator('saucelabsClients')) {
    server.decorate('saucelabsClients', clients);
  }

  // ── API Release Date ───────────────────────────────────────────────
  const apiReleaseDate = server.config?.getNested?.(
    ['api_release_date', 'contract_snapshot_date', 'provider_saucelabs'],
  ) ?? '02-01-2026';
  const PREFIX = `/~/api/rest/${apiReleaseDate}/providers/${VENDOR}`;
  server.log.info({ PREFIX, apiReleaseDate, VENDOR }, '[lifecycle:saucelabs_api] Resolved API route prefix');

  // ── Error Handler (scoped to prefix) ──────────────────────────────
  const saucelabsErrorHandler = createErrorHandler();

  // ── Route Registration ─────────────────────────────────────────────
  server.log.info('[lifecycle:saucelabs_api] Registering Sauce Labs API routes');
  await server.register(
    async function saucelabsApiRoutes(scope) {
      // Scoped error handler so Sauce Labs SDK errors are mapped correctly
      // without affecting other server routes.
      scope.setErrorHandler(saucelabsErrorHandler);

      // ── Health ───────────────────────────────────────────────────────
      scope.get('/health', async () => ({
        status: 'ok',
        vendor: VENDOR,
        vendor_version: VENDOR_VERSION,
      }));

      // ── v1 Sauce Labs API proxy routes ──────────────────────────────
      await scope.register(async (v1) => {

        // ── Jobs ──────────────────────────────────────────────────────
        v1.get('/jobs', async (req) => {
          return clients.jobs.list(req.query);
        });

        v1.get('/jobs/:jobId', async (req) => {
          return clients.jobs.get(req.params.jobId);
        });

        // ── Platform ─────────────────────────────────────────────────
        v1.get('/platform/status', async () => {
          return clients.platform.getStatus();
        });

        v1.get('/platform/:automationApi', async (req) => {
          return clients.platform.getPlatforms(req.params.automationApi);
        });

        // ── Users ────────────────────────────────────────────────────
        v1.get('/users/:username', async (req) => {
          return clients.users.getUser(req.params.username);
        });

        v1.get('/users/:username/concurrency', async (req) => {
          return clients.users.getConcurrency(req.params.username);
        });

        // ── Upload ───────────────────────────────────────────────────
        v1.post('/upload', async (req) => {
          return clients.upload.uploadApp(req.body);
        });

        return Promise.resolve();
      }, { prefix: '/v1' });

      return Promise.resolve();
    },
    { prefix: PREFIX },
  );

  // ── Cleanup ────────────────────────────────────────────────────────
  server.addHook('onClose', async () => {
    server.log.info('[saucelabs_api] Cleaning up Sauce Labs API resources...');
    if (saucelabs && typeof saucelabs.close === 'function') {
      await saucelabs.close();
    }
  });

  server.log.info({ PREFIX }, `[lifecycle:saucelabs_api] Sauce Labs API initialized -- routes registered at ${PREFIX}/*`);

  } catch (err) {
    server.log.error({ err, hookName: '520.saucelabs_api' }, '[lifecycle:saucelabs_api] Sauce Labs API SDK initialization failed');
    throw err;
  }
}

/**
 * Shutdown hook.
 *
 * @param {import('fastify').FastifyInstance} server
 */
export async function onShutdown(server) {
  server.log.info('[lifecycle:saucelabs_api] Sauce Labs API shutdown complete');
}
