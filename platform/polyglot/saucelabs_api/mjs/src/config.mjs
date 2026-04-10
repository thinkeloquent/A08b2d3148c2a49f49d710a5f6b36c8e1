/**
 * Config Module — Sauce Labs API Client
 *
 * Configuration resolution with priority chain:
 *   constructor args > environment variables > defaults
 *
 * Resolves credentials, base URLs, and region settings.
 */

import { create } from './logger.mjs';
import { SaucelabsConfigError } from './errors.mjs';
import { resolveSaucelabsEnv } from '@internal/env-resolver';
import {
  CORE_REGIONS,
  MOBILE_REGIONS,
  DEFAULT_BASE_URL,
  DEFAULT_MOBILE_BASE_URL,
  DEFAULT_TIMEOUT,
} from './types.mjs';

const log = create('saucelabs-api', import.meta.url);

/**
 * Resolve the Core Automation base URL from region or explicit override.
 *
 * @param {string} [region='us-west-1'] - Region identifier
 * @param {string} [baseUrlOverride] - Explicit base URL override
 * @returns {string} Resolved base URL
 */
export function resolveCoreBaseUrl(region = 'us-west-1', baseUrlOverride) {
  if (baseUrlOverride) return baseUrlOverride.replace(/\/+$/, '');
  return (CORE_REGIONS[region] || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

/**
 * Resolve the Mobile Distribution base URL from region or explicit override.
 *
 * @param {string} [mobileRegion='us-east'] - Mobile region identifier
 * @param {string} [mobileBaseUrlOverride] - Explicit base URL override
 * @returns {string} Resolved mobile base URL
 */
export function resolveMobileBaseUrl(mobileRegion = 'us-east', mobileBaseUrlOverride) {
  if (mobileBaseUrlOverride) return mobileBaseUrlOverride.replace(/\/+$/, '');
  return (MOBILE_REGIONS[mobileRegion] || DEFAULT_MOBILE_BASE_URL).replace(/\/+$/, '');
}

/**
 * Resolve a complete configuration object from options, env vars, and defaults.
 *
 * Priority: constructor args > env vars > defaults
 *
 * @param {import('./types.mjs').SaucelabsClientOptions} [options={}]
 * @returns {object} Resolved config
 * @throws {SaucelabsConfigError} If required credentials are missing
 */
export function resolveConfig(options = {}) {
  const _saucelabsEnv = resolveSaucelabsEnv();

  const username =
    options.username ||
    _saucelabsEnv.username ||
    '';

  const apiKey =
    options.apiKey ||
    _saucelabsEnv.accessKey ||
    '';

  if (!username) {
    log.warn('no Sauce Labs username found — set SAUCE_USERNAME env var or pass username option');
  }

  if (!apiKey) {
    log.warn('no Sauce Labs access key found — set SAUCE_ACCESS_KEY env var or pass apiKey option');
  }

  const region = options.region || 'us-west-1';
  const mobileRegion = options.mobileRegion || 'us-east';

  const config = {
    username,
    apiKey,
    baseUrl: resolveCoreBaseUrl(region, options.baseUrl),
    mobileBaseUrl: resolveMobileBaseUrl(mobileRegion, options.mobileBaseUrl),
    region,
    mobileRegion,
    rateLimitAutoWait: options.rateLimitAutoWait ?? true,
    rateLimitThreshold: options.rateLimitThreshold ?? 0,
    onRateLimit: options.onRateLimit || null,
    logger: options.logger || null,
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
    proxy: options.proxy || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || null,
    verifySsl: options.verifySsl ?? true,
  };

  log.debug('configuration resolved', {
    baseUrl: config.baseUrl,
    mobileBaseUrl: config.mobileBaseUrl,
    region: config.region,
    hasUsername: !!config.username,
    hasApiKey: !!config.apiKey,
    rateLimitAutoWait: config.rateLimitAutoWait,
    timeout: config.timeout,
  });

  return config;
}
