/**
 * Statsig Console API Client — Barrel Exports
 *
 * Re-exports all public API surface for the Statsig Console API Node.js client.
 * This is the main entry point specified in package.json.
 *
 * @module statsig-api-client
 *
 * @example
 * // Quick start with factory function
 * import { createStatsigClient } from 'statsig-api-client';
 * const client = createStatsigClient({ apiKey: 'console-xxx' });
 * const experiments = await client.experiments.list();
 *
 * @example
 * // Manual construction
 * import { StatsigClient, ExperimentsModule, GatesModule } from 'statsig-api-client';
 * const client = new StatsigClient({ apiKey: 'console-xxx' });
 * client.experiments = new ExperimentsModule(client);
 * client.gates = new GatesModule(client);
 */

// ---------------------------------------------------------------------------
// Core client
// ---------------------------------------------------------------------------
export { StatsigClient } from './client.mjs';

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------
export {
  StatsigError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  ServerError,
  createErrorFromResponse,
} from './errors.mjs';

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
export {
  RateLimiter,
  parseRetryAfter,
  buildRateLimitInfo,
} from './rate-limiter.mjs';

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export { paginate, listAll } from './pagination.mjs';

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------
export { create as createLogger, SDKLogger, LEVELS } from './logger.mjs';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------
export { DEFAULT_BASE_URL, DEFAULT_TIMEOUT, DEFAULT_MAX_RETRIES } from './types.mjs';

// ---------------------------------------------------------------------------
// Domain modules
// ---------------------------------------------------------------------------
export { ExperimentsModule } from './modules/experiments/index.mjs';
export { GatesModule } from './modules/gates/index.mjs';
export { LayersModule } from './modules/layers/index.mjs';
export { SegmentsModule } from './modules/segments/index.mjs';
export { MetricsModule } from './modules/metrics/index.mjs';
export { EventsModule } from './modules/events/index.mjs';
export { TagsModule } from './modules/tags/index.mjs';
export { AuditLogsModule } from './modules/audit-logs/index.mjs';
export { ReportsModule } from './modules/reports/index.mjs';

// ---------------------------------------------------------------------------
// Convenience factory
// ---------------------------------------------------------------------------
import { StatsigClient } from './client.mjs';
import { ExperimentsModule } from './modules/experiments/index.mjs';
import { GatesModule } from './modules/gates/index.mjs';
import { LayersModule } from './modules/layers/index.mjs';
import { SegmentsModule } from './modules/segments/index.mjs';
import { MetricsModule } from './modules/metrics/index.mjs';
import { EventsModule } from './modules/events/index.mjs';
import { TagsModule } from './modules/tags/index.mjs';
import { AuditLogsModule } from './modules/audit-logs/index.mjs';
import { ReportsModule } from './modules/reports/index.mjs';

/**
 * Convenience factory that creates a StatsigClient and registers all domain modules.
 *
 * The returned client has all domain modules attached as properties:
 *   - `client.experiments` — ExperimentsModule
 *   - `client.gates` — GatesModule
 *   - `client.layers` — LayersModule
 *   - `client.segments` — SegmentsModule
 *   - `client.metrics` — MetricsModule
 *   - `client.events` — EventsModule
 *   - `client.tags` — TagsModule
 *   - `client.auditLogs` — AuditLogsModule
 *   - `client.reports` — ReportsModule
 *
 * @param {import('./types.mjs').StatsigClientOptions} [options={}] - Client options
 * @returns {StatsigClient & { experiments: ExperimentsModule, gates: GatesModule, layers: LayersModule, segments: SegmentsModule, metrics: MetricsModule, events: EventsModule, tags: TagsModule, auditLogs: AuditLogsModule, reports: ReportsModule }}
 *
 * @example
 * import { createStatsigClient } from 'statsig-api-client';
 *
 * const client = createStatsigClient({ apiKey: process.env.STATSIG_API_KEY });
 *
 * // Use domain modules
 * const allExperiments = await client.experiments.list();
 * const gate = await client.gates.get('my_feature_gate');
 *
 * // Or use raw HTTP methods
 * const raw = await client.get('/dynamic_configs');
 *
 * client.close();
 */
export function createStatsigClient(options = {}) {
  const client = new StatsigClient(options);

  client.experiments = new ExperimentsModule(client);
  client.gates = new GatesModule(client);
  client.layers = new LayersModule(client);
  client.segments = new SegmentsModule(client);
  client.metrics = new MetricsModule(client);
  client.events = new EventsModule(client);
  client.tags = new TagsModule(client);
  client.auditLogs = new AuditLogsModule(client);
  client.reports = new ReportsModule(client);

  return client;
}

// Default export
export default StatsigClient;
