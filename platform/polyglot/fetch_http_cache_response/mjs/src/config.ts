/**
 * SDKConfig three-tier resolution: overrides > YAML > env > defaults.
 */

import type {
  AuthRefreshConfig,
  CacheResponseConfig,
  HttpFetchConfig,
  ResolvedAuthConfig,
  ResolvedCacheConfig,
  ResolvedHttpConfig,
  ResolvedSDKConfig,
  SDKConfig,
} from "./types.js";

type YamlConfig = Record<string, unknown>;

function first(...values: unknown[]): unknown {
  for (const v of values) {
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

function envStr(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? fallback;
}

function envFloat(key: string, fallback?: number): number | undefined {
  const v = process.env[key];
  if (v !== undefined) return parseFloat(v);
  return fallback;
}

function envBool(key: string, fallback?: boolean): boolean {
  const v = process.env[key]?.toLowerCase();
  if (v !== undefined) return v === "true" || v === "1" || v === "yes";
  return fallback ?? false;
}

export function resolveConfig(
  overrides?: SDKConfig,
  yamlConfig?: YamlConfig | null,
): ResolvedSDKConfig {
  const ov = overrides ?? {};
  const yc = (yamlConfig ?? {}) as Record<string, Record<string, unknown>>;
  const httpYc = (yc.http ?? {}) as Record<string, unknown>;
  const authYc = (yc.auth ?? {}) as Record<string, unknown>;
  const cacheYc = (yc.cache ?? {}) as Record<string, unknown>;

  // ── HTTP config ──
  const http: ResolvedHttpConfig = {
    baseUrl: (first(
      ov.http?.baseUrl, httpYc.base_url, httpYc.baseUrl,
      envStr("FETCH_CACHE_BASE_URL"),
    ) ?? "") as string,
    method: (first(
      ov.http?.method, httpYc.method,
    ) ?? "GET") as string,
    headers: (ov.http?.headers ?? httpYc.headers ?? {}) as Record<string, string>,
    timeout: Number(first(
      ov.http?.timeout, httpYc.timeout,
      envFloat("FETCH_CACHE_TIMEOUT"),
    ) ?? 30),
    verify: (first(ov.http?.verify, httpYc.verify) ?? true) as boolean,
    proxyUrl: (first(
      ov.http?.proxyUrl, httpYc.proxy_url, httpYc.proxyUrl,
      envStr("FETCH_CACHE_PROXY"),
    ) ?? null) as string | null,
    followRedirects: (first(
      ov.http?.followRedirects, httpYc.follow_redirects, httpYc.followRedirects,
    ) ?? true) as boolean,
    retry: (ov.http?.retry ?? httpYc.retry ?? null) as ReturnType<typeof first> as ResolvedHttpConfig["retry"],
  };

  // ── Auth config ──
  let auth: ResolvedAuthConfig | null = null;
  const hasAuthOverrides = ov.auth !== undefined && ov.auth !== null;
  const hasAuthYaml = Object.keys(authYc).length > 0;
  if (hasAuthOverrides || hasAuthYaml) {
    auth = {
      authType: (first(
        ov.auth?.authType, authYc.auth_type, authYc.authType,
        envStr("FETCH_CACHE_AUTH_TYPE"),
      ) ?? "bearer") as string,
      authToken: (first(
        ov.auth?.authToken, authYc.auth_token, authYc.authToken,
        envStr("FETCH_CACHE_AUTH_TOKEN"),
      ) ?? null) as string | null,
      authTokenResolver: (first(
        ov.auth?.authTokenResolver, authYc.auth_token_resolver, authYc.authTokenResolver,
      ) ?? null) as string | null,
      refreshIntervalSeconds: Number(first(
        ov.auth?.refreshIntervalSeconds, authYc.refresh_interval_seconds,
        authYc.refreshIntervalSeconds,
        envFloat("FETCH_CACHE_AUTH_REFRESH_INTERVAL"),
      ) ?? 1200),
      refreshFn: ov.auth?.refreshFn ?? null,
      apiAuthHeaderName: (first(
        ov.auth?.apiAuthHeaderName, authYc.api_auth_header_name,
        authYc.apiAuthHeaderName,
      ) ?? null) as string | null,
    };
  }

  // ── Cache config ──
  const cache: ResolvedCacheConfig = {
    enabled: (first(
      ov.cache?.enabled, cacheYc.enabled,
    ) ?? true) as boolean,
    ttlSeconds: Number(first(
      ov.cache?.ttlSeconds, cacheYc.ttl_seconds, cacheYc.ttlSeconds,
      envFloat("FETCH_CACHE_TTL"),
    ) ?? 600),
    storageType: (first(
      ov.cache?.storageType, cacheYc.storage_type, cacheYc.storageType,
    ) ?? "s3") as string,
    s3Config: (ov.cache?.s3Config ?? cacheYc.s3_config ?? cacheYc.s3Config ?? null) as Record<string, unknown> | null,
    keyStrategy: (first(
      ov.cache?.keyStrategy, cacheYc.key_strategy, cacheYc.keyStrategy,
    ) ?? "url") as string,
    keyPrefix: (first(
      ov.cache?.keyPrefix, cacheYc.key_prefix, cacheYc.keyPrefix,
      envStr("FETCH_CACHE_KEY_PREFIX"),
    ) ?? "fhcr:") as string,
    staleWhileRevalidate: (first(
      ov.cache?.staleWhileRevalidate, cacheYc.stale_while_revalidate,
      cacheYc.staleWhileRevalidate,
    ) ?? null) as number | null,
    cacheMethods: (ov.cache?.cacheMethods ?? cacheYc.cache_methods
      ?? cacheYc.cacheMethods ?? ["GET"]) as string[],
  };

  // ── Debug ──
  const debug = (first(ov.debug, yc.debug, envBool("FETCH_CACHE_DEBUG")) ?? false) as boolean;

  return { http, auth, cache, debug };
}
