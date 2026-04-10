/**
 * SDK factory functions and convenience methods (Story 4).
 */

import { FetchHttpCacheClient, generateCacheKey } from "./client.js";
import { resolveConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { createTokenManager } from "./token-manager.js";
import type { FetchResult, ResolvedSDKConfig, SDKConfig } from "./types.js";

const logger = createLogger("sdk");

// ─── SDK Factory Functions ──────────────────────────────────────────────────

export function createFetchCacheSdk(
  config: SDKConfig,
  yamlConfig?: Record<string, unknown> | null,
): FetchHttpCacheClient {
  const resolved = resolveConfig(config, yamlConfig);
  const tokenManager = resolved.auth !== null
    ? createTokenManager(resolved.auth)
    : null;
  return new FetchHttpCacheClient(resolved, null, null, tokenManager);
}

export function createFetchCacheSdkFromYaml(
  yamlSection: Record<string, unknown>,
  overrides?: SDKConfig,
): FetchHttpCacheClient {
  return createFetchCacheSdk(overrides ?? {}, yamlSection);
}

export function createFetchCacheSdkFromEnv(
  overrides?: SDKConfig,
): FetchHttpCacheClient {
  return createFetchCacheSdk(overrides ?? {});
}

// ─── Convenience Functions ──────────────────────────────────────────────────

export async function fetchCached(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    config?: SDKConfig;
  } = {},
): Promise<FetchResult> {
  const client = createFetchCacheSdk(options.config ?? {});
  try {
    return await client.request(
      options.method ?? "GET",
      url,
      { headers: options.headers, body: options.body },
    );
  } finally {
    await client.close();
  }
}

export async function invalidateCache(
  keyOrUrl: string,
  config?: SDKConfig,
): Promise<void> {
  const resolved = resolveConfig(config ?? {});

  let key: string;
  if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) {
    key = generateCacheKey(
      "GET", keyOrUrl,
      resolved.cache.keyStrategy,
      resolved.cache.keyPrefix,
    );
  } else {
    key = keyOrUrl;
  }

  const client = createFetchCacheSdk(config ?? {});
  try {
    await client.invalidateCache(key);
  } finally {
    await client.close();
  }
}
