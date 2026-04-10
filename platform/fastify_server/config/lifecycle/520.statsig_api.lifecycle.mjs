/**
 * Statsig Console API Lifecycle Hook for Fastify
 *
 * Initializes the Statsig Console API client and registers all Statsig API
 * proxy routes under the /~/api/rest/{api_release_date}/providers/statsig_api prefix.
 *
 * Loading Order: 520 (after core services, GitHub SDK, and Figma SDK)
 *
 * Environment Variables:
 *   STATSIG_API_KEY - Statsig Console API key
 *
 * Usage in routes:
 *   const statsig  = req.server.statsig;                     // StatsigClient
 *   const clients  = req.server.statsigClients;              // Domain modules dict
 *
 * Registered endpoints (prefix: /~/api/rest/{api_release_date}/providers/statsig_api):
 *   GET    /health                                           - Health check
 *   GET    /v1/experiments                                   - List experiments
 *   POST   /v1/experiments                                   - Create experiment
 *   GET    /v1/experiments/:id                               - Get experiment
 *   PATCH  /v1/experiments/:id                               - Update experiment
 *   DELETE /v1/experiments/:id                               - Delete experiment
 *   PUT    /v1/experiments/:id/start                         - Start experiment
 *   PUT    /v1/experiments/:id/make_decision                 - Make decision
 *   GET    /v1/experiments/:id/pulse_results                 - Get pulse results
 *   GET    /v1/gates                                         - List gates
 *   POST   /v1/gates                                         - Create gate
 *   GET    /v1/gates/:id                                     - Get gate
 *   PUT    /v1/gates/:id/enable                              - Enable gate
 *   PUT    /v1/gates/:id/disable                             - Disable gate
 *   GET    /v1/metrics/list                                  - List metrics
 *   POST   /v1/metrics                                       - Create metric
 *   GET    /v1/segments                                      - List segments
 *   POST   /v1/segments                                      - Create segment
 *   GET    /v1/layers                                        - List layers
 *   GET    /v1/tags                                          - List tags
 *   GET    /v1/events                                        - List events
 *   GET    /v1/reports                                       - List reports
 *   GET    /v1/audit_logs                                    - List audit logs
 */

import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

import {
  StatsigClient,
  createStatsigClient,
} from '../../../polyglot/statsig_api/mjs/src/index.mjs';
import { createErrorHandler } from '../../../polyglot/statsig_api/mjs/src/middleware/error-handler.mjs';
import { resolveStatsigEnv } from '@internal/env-resolver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..');

const VENDOR = 'statsig_api';
const VENDOR_VERSION = 'v1';

/**
 * Resolve Statsig Console API key from server config or environment variables.
 *
 * @param {import('fastify').FastifyInstance} server
 * @returns {string} The resolved API key
 */
function resolveStatsigApiKey(server) {
  // Try server config first (e.g. from server.dev.yaml providers.statsig)
  let configKey;
  if (server.config && typeof server.config.getNested === 'function') {
    try {
      configKey = server.config.getNested(['providers', 'statsig', 'endpoint_api_key']);
    } catch (_) { /* not configured */ }
  }

  const apiKey = configKey || resolveStatsigEnv().apiKey;
  if (!apiKey) {
    throw new Error(
      'Statsig Console API key not found. ' +
      'Set providers.statsig.endpoint_api_key in config or STATSIG_API_KEY env var.',
    );
  }
  return apiKey;
}

/**
 * Startup hook -- Initialize Statsig Console API client and register routes.
 *
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config - Bootstrap config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:statsig_api] Initializing Statsig Console API SDK...');

  try {
  // ── API Key Resolution ────────────────────────────────────────────
  let apiKey;
  try {
    server.log.info('[lifecycle:statsig_api] Resolving Statsig API key from config or environment');
    apiKey = resolveStatsigApiKey(server);
  } catch (err) {
    server.log.warn(
      { err },
      '[lifecycle:statsig_api] Statsig API key not found -- SDK routes will NOT be registered.',
    );
    return;
  }

  const masked = apiKey.length > 8
    ? apiKey.slice(0, 4) + '****' + apiKey.slice(-4)
    : '****';
  server.log.info({ masked }, `[lifecycle:statsig_api] API key resolved (masked: ${masked})`);

  // ── Base Client ───────────────────────────────────────────────────
  server.log.info('[lifecycle:statsig_api] Creating Statsig client instance');
  const statsig = createStatsigClient({ apiKey });

  // ── Domain Modules ────────────────────────────────────────────────
  const clients = {
    experiments: statsig.experiments,
    gates: statsig.gates,
    metrics: statsig.metrics,
    segments: statsig.segments,
    layers: statsig.layers,
    events: statsig.events,
    tags: statsig.tags,
    reports: statsig.reports,
    auditLogs: statsig.auditLogs,
  };

  // ── Server Decorators ─────────────────────────────────────────────
  if (!server.hasDecorator('statsig')) {
    server.decorate('statsig', statsig);
  }
  if (!server.hasDecorator('statsigClients')) {
    server.decorate('statsigClients', clients);
  }

  // ── API Release Date ──────────────────────────────────────────────
  const apiReleaseDate = server.config?.getNested?.(
    ['api_release_date', 'contract_snapshot_date', 'provider_statsig'],
  ) ?? '02-01-2026';
  const PREFIX = `/~/api/rest/${apiReleaseDate}/providers/${VENDOR}`;
  server.log.info({ PREFIX, apiReleaseDate, VENDOR }, '[lifecycle:statsig_api] Resolved API route prefix');

  // ── Route Registration ────────────────────────────────────────────
  server.log.info('[lifecycle:statsig_api] Registering Statsig Console API routes');
  const statsigErrorHandler = createErrorHandler();
  await server.register(
    async function statsigApiRoutes(scope) {
      scope.setErrorHandler(statsigErrorHandler);

      // ── Health ──────────────────────────────────────────────────────
      scope.get('/health', async () => ({
        status: 'ok',
        vendor: VENDOR,
        vendor_version: VENDOR_VERSION,
      }));

      // ── v1 Console API proxy routes ────────────────────────────────
      await scope.register(async (v1) => {

        // ── Experiments ────────────────────────────────────────────────
        v1.get('/experiments', async (req) => {
          return clients.experiments.list(req.query);
        });

        v1.post('/experiments', async (req) => {
          return clients.experiments.create(req.body);
        });

        v1.get('/experiments/:id', async (req) => {
          return clients.experiments.get(req.params.id);
        });

        v1.patch('/experiments/:id', async (req) => {
          return clients.experiments.update(req.params.id, req.body);
        });

        v1.delete('/experiments/:id', async (req) => {
          return clients.experiments.delete(req.params.id);
        });

        v1.put('/experiments/:id/start', async (req) => {
          return clients.experiments.start(req.params.id);
        });

        v1.put('/experiments/:id/make_decision', async (req) => {
          return clients.experiments.makeDecision(req.params.id, req.body);
        });

        v1.get('/experiments/:id/pulse_results', async (req) => {
          return clients.experiments.pulseResults(req.params.id, req.query);
        });

        // ── Gates ──────────────────────────────────────────────────────
        v1.get('/gates', async (req) => {
          return clients.gates.list(req.query);
        });

        v1.post('/gates', async (req) => {
          return clients.gates.create(req.body);
        });

        v1.get('/gates/:id', async (req) => {
          return clients.gates.get(req.params.id);
        });

        v1.put('/gates/:id/enable', async (req) => {
          return clients.gates.enable(req.params.id);
        });

        v1.put('/gates/:id/disable', async (req) => {
          return clients.gates.disable(req.params.id);
        });

        // ── Metrics ────────────────────────────────────────────────────
        v1.get('/metrics/list', async (req) => {
          return clients.metrics.list(req.query);
        });

        v1.post('/metrics', async (req) => {
          return clients.metrics.create(req.body);
        });

        // ── Segments ───────────────────────────────────────────────────
        v1.get('/segments', async (req) => {
          return clients.segments.list(req.query);
        });

        v1.post('/segments', async (req) => {
          return clients.segments.create(req.body);
        });

        // ── Layers ─────────────────────────────────────────────────────
        v1.get('/layers', async (req) => {
          return clients.layers.list(req.query);
        });

        // ── Tags ───────────────────────────────────────────────────────
        v1.get('/tags', async (req) => {
          return clients.tags.list(req.query);
        });

        // ── Events ─────────────────────────────────────────────────────
        v1.get('/events', async (req) => {
          return clients.events.list(req.query);
        });

        // ── Reports ────────────────────────────────────────────────────
        v1.get('/reports', async (req) => {
          return clients.reports.list(req.query);
        });

        // ── Audit Logs ─────────────────────────────────────────────────
        v1.get('/audit_logs', async (req) => {
          return clients.auditLogs.list(req.query);
        });

        return Promise.resolve();
      }, { prefix: '/v1' });

      return Promise.resolve();
    },
    { prefix: PREFIX },
  );

  // ── Cleanup ───────────────────────────────────────────────────────
  server.addHook('onClose', async () => {
    server.log.info('[statsig_api] Cleaning up Statsig Console API resources...');
    if (statsig && typeof statsig.close === 'function') {
      await statsig.close();
    }
  });

  server.log.info({ PREFIX }, `[lifecycle:statsig_api] Statsig Console API initialized -- routes registered at ${PREFIX}/*`);

  } catch (err) {
    server.log.error({ err, hookName: '520.statsig_api' }, '[lifecycle:statsig_api] Statsig Console API SDK initialization failed');
    throw err;
  }
}

/**
 * Shutdown hook.
 *
 * @param {import('fastify').FastifyInstance} server
 */
export async function onShutdown(server) {
  server.log.info('[lifecycle:statsig_api] Statsig Console API shutdown complete');
}
