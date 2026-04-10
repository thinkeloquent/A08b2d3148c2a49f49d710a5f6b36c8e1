/**
 * Sauce Labs API Client — Barrel Exports
 *
 * Re-exports all public API surface for the Sauce Labs REST API Node.js client.
 *
 * @example
 * import { createSaucelabsClient } from 'saucelabs-api-client';
 * const client = createSaucelabsClient({ username: 'demo', apiKey: 'xxx' });
 * const jobs = await client.jobs.list({ limit: 10 });
 * client.close();
 */

// ── Core client ─────────────────────────────────────────────────────
export { SaucelabsClient } from './client.mjs';

// ── Errors ──────────────────────────────────────────────────────────
export {
  SaucelabsError,
  SaucelabsAuthError,
  SaucelabsNotFoundError,
  SaucelabsRateLimitError,
  SaucelabsValidationError,
  SaucelabsServerError,
  SaucelabsConfigError,
  createErrorFromResponse,
} from './errors.mjs';

// ── Rate limiting ───────────────────────────────────────────────────
export {
  RateLimiter,
  parseRetryAfter,
  buildRateLimitInfo,
  calculateBackoff,
} from './rate-limiter.mjs';

// ── Logger ──────────────────────────────────────────────────────────
export { create as createLogger, SDKLogger, LEVELS } from './logger.mjs';

// ── Config ──────────────────────────────────────────────────────────
export { resolveConfig, resolveCoreBaseUrl, resolveMobileBaseUrl } from './config.mjs';

// ── Types & constants ───────────────────────────────────────────────
export {
  DEFAULT_BASE_URL,
  DEFAULT_MOBILE_BASE_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_MAX_RETRIES,
  CORE_REGIONS,
  MOBILE_REGIONS,
  VENDOR,
  VENDOR_VERSION,
  AUTOMATION_API_VALUES,
  VALID_UPLOAD_EXTENSIONS,
} from './types.mjs';

// ── Middleware ──────────────────────────────────────────────────────
export { createErrorHandler } from './middleware/error-handler.mjs';

// ── Domain modules ──────────────────────────────────────────────────
export { JobsModule } from './modules/jobs.mjs';
export { PlatformModule } from './modules/platform.mjs';
export { UsersModule } from './modules/users.mjs';
export { UploadModule } from './modules/upload.mjs';

// ── Convenience factory ─────────────────────────────────────────────
import { SaucelabsClient } from './client.mjs';
import { JobsModule } from './modules/jobs.mjs';
import { PlatformModule } from './modules/platform.mjs';
import { UsersModule } from './modules/users.mjs';
import { UploadModule } from './modules/upload.mjs';

/**
 * Convenience factory that creates a SaucelabsClient with all domain modules attached.
 *
 * @param {import('./types.mjs').SaucelabsClientOptions} [options={}]
 * @returns {SaucelabsClient & { jobs: JobsModule, platform: PlatformModule, users: UsersModule, upload: UploadModule }}
 *
 * @example
 * import { createSaucelabsClient } from 'saucelabs-api-client';
 *
 * const client = createSaucelabsClient({
 *   username: process.env.SAUCE_USERNAME,
 *   apiKey: process.env.SAUCE_ACCESS_KEY,
 * });
 *
 * const jobs = await client.jobs.list({ limit: 5 });
 * const status = await client.platform.getStatus();
 * const user = await client.users.getUser();
 *
 * client.close();
 */
export function createSaucelabsClient(options = {}) {
  const client = new SaucelabsClient(options);

  client.jobs = new JobsModule(client);
  client.platform = new PlatformModule(client);
  client.users = new UsersModule(client);
  client.upload = new UploadModule(client);

  return client;
}

export default SaucelabsClient;
