/**
 * Endpoint Configuration
 *
 * Fetches configuration from runtime API:
 * - GET /api/runtime-app-config/endpoints
 * - GET /api/runtime-app-config/endpoints/:name
 * - GET /api/runtime-app-config/intent-mapping
 * - GET /api/runtime-app-config/resolve-intent/:intent
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
 * Prevents duplicate fetches with pending promise tracking.
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
 * Clear the cached config (useful for refresh).
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}

/**
 * Fetch a specific endpoint by name from the runtime API.
 */
export async function fetchEndpoint(serviceId: string): Promise<EndpointConfig> {
  const response = await fetch(`${API_BASE}/endpoints/${serviceId}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Service '${serviceId}' not found`);
    }
    throw new Error(`Failed to fetch endpoint: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || `Failed to fetch endpoint '${serviceId}'`);
  }
  return data.endpoint;
}

/**
 * Resolve an intent to its endpoint configuration.
 */
export async function resolveIntent(intent: string): Promise<{ intent: string; resolved_endpoint: string; endpoint: EndpointConfig }> {
  const response = await fetch(`${API_BASE}/resolve-intent/${intent}`);
  if (!response.ok) {
    throw new Error(`Failed to resolve intent: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || `Failed to resolve intent '${intent}'`);
  }
  return {
    intent: data.intent,
    resolved_endpoint: data.resolved_endpoint,
    endpoint: data.endpoint,
  };
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
 * List all available service IDs (uses cache).
 */
export function listEndpoints(): string[] {
  return Object.keys(getRouterConfig().endpoints);
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
 * Build human-readable service labels from cached config.
 */
export function getServiceLabels(): Record<string, string> {
  const config = getRouterConfig();
  const labels: Record<string, string> = {};
  for (const [id, endpoint] of Object.entries(config.endpoints)) {
    labels[id] = endpoint.name || endpoint.description || id;
  }
  return labels;
}

/**
 * Get endpoints matching a specific tag (uses cache).
 * Returns entries with key, name, and baseUrl.
 */
export function getEndpointsByTag(tag: string): Array<{ key: string } & EndpointConfig> {
  const config = getRouterConfig();
  return Object.entries(config.endpoints)
    .filter(([, ep]) => ep.tags?.includes(tag))
    .map(([key, ep]) => ({ key, ...ep }));
}
