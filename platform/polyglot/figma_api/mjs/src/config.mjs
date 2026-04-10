/**
 * Config Module — Figma API SDK
 *
 * Environment-based configuration loader.
 */

import { resolveFigmaEnv } from '@internal/env-resolver';

export function loadConfig() {
  const _figmaEnv = resolveFigmaEnv();
  return {
    figmaToken: _figmaEnv.token || undefined,
    figmaApiBaseUrl: _figmaEnv.apiBaseUrl,
    logLevel: process.env.LOG_LEVEL || 'info',
    port: parseInt(process.env.PORT || '3108', 10),
    host: process.env.HOST || '0.0.0.0',
    rateLimitAutoWait: process.env.RATE_LIMIT_AUTO_WAIT !== 'false',
    rateLimitThreshold: parseInt(process.env.RATE_LIMIT_THRESHOLD || '0', 10),
    timeout: _figmaEnv.timeout,
    cacheMaxSize: parseInt(process.env.CACHE_MAX_SIZE || '100', 10),
    cacheTtl: parseInt(process.env.CACHE_TTL || '300', 10),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  };
}

export const DEFAULTS = {
  baseUrl: 'https://api.figma.com',
  timeout: 30000,
  maxRetries: 3,
  retryInitialWait: 1000,
  retryMaxWait: 30000,
  cacheMaxSize: 100,
  cacheTtl: 300,
  rateLimitAutoWait: true,
  rateLimitThreshold: 0,
  maxRetryAfter: 60,
};
