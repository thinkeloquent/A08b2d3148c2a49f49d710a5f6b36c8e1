/**
 * Endpoint Configuration
 *
 * Fetches configuration from runtime API:
 * - GET /api/runtime-app-config/endpoints
 * - GET /api/runtime-app-config/intent-mapping
 *
 * Configuration sourced from: common/config/endpoint.${APP_ENV}.yaml
 */

import type { RouterConfig, EndpointConfig, ServiceId } from './types';

const API_BASE = '/api/runtime-app-config';

/** Cached router config */
let cachedConfig: RouterConfig | null = null;

/** Pending load promise to prevent duplicate fetches */
let pendingLoad: Promise<RouterConfig> | null = null;

/**
 * Fetch all endpoints from the runtime API.
 */
async function fetchEndpoints(): Promise<Record<string, EndpointConfig>> {
  const response = await fetch(`${API_BASE}/endpoints`);
  if (!response.ok) {
    throw new Error(`Failed to fetch endpoints: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch endpoints');
  }
  return data.endpoints;
}

/**
 * Fetch intent mapping from the runtime API.
 */
async function fetchIntentMapping(): Promise<RouterConfig['intent_mapping']> {
  const response = await fetch(`${API_BASE}/intent-mapping`);
  if (!response.ok) {
    throw new Error(`Failed to fetch intent mapping: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch intent mapping');
  }
  return data.intent_mapping;
}

/**
 * Load the full router config from the runtime API.
 * Results are cached after first successful fetch.
 */
export async function loadRouterConfig(): Promise<RouterConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (pendingLoad) {
    return pendingLoad;
  }

  pendingLoad = (async () => {
    const [endpoints, intent_mapping] = await Promise.all([
      fetchEndpoints(),
      fetchIntentMapping(),
    ]);

    cachedConfig = { endpoints, intent_mapping };
    pendingLoad = null;
    return cachedConfig;
  })();

  return pendingLoad;
}

/**
 * Get the cached router config (must call loadRouterConfig first).
 */
export function getRouterConfig(): RouterConfig {
  if (!cachedConfig) {
    throw new Error('Config not loaded. Call loadRouterConfig() first.');
  }
  return cachedConfig;
}

/**
 * Get the base URL for a service (uses cache).
 */
export function getBaseUrl(serviceId: ServiceId): string {
  return getEndpoint(serviceId).baseUrl;
}

/**
 * Get default headers for a service (uses cache).
 */
export function getHeaders(serviceId: ServiceId): Record<string, string> {
  return { ...getEndpoint(serviceId).headers };
}

/**
 * Get endpoint configuration by service ID (uses cache).
 */
export function getEndpoint(serviceId: ServiceId): EndpointConfig {
  const config = getRouterConfig();
  const endpoint = config.endpoints[serviceId];
  if (!endpoint) {
    throw new Error(`Service '${serviceId}' not found. Available: ${Object.keys(config.endpoints).join(', ')}`);
  }
  return endpoint;
}

/**
 * Get endpoints matching a specific tag (uses cache).
 */
export function getEndpointsByTag(tag: string): Array<{ key: string } & EndpointConfig> {
  const config = getRouterConfig();
  return Object.entries(config.endpoints)
    .filter(([, ep]) => ep.tags?.includes(tag))
    .map(([key, ep]) => ({ key, ...ep }));
}
