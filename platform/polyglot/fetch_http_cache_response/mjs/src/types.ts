/**
 * Core types, configs, and response models for fetch-http-cache-response.
 */

// ─── RetryConfig ──────────────────────────────────────────────────────────────

export interface RetryConfig {
  maxRetries?: number;
  baseDelaySeconds?: number;
  maxDelaySeconds?: number;
  exponentialBase?: number;
  jitter?: boolean;
}

// ─── HttpFetchConfig ─────────────────────────────────────────────────────────

export interface HttpFetchConfig {
  baseUrl?: string;
  method?: string;
  headers?: Record<string, string>;
  timeout?: number;
  verify?: boolean;
  proxyUrl?: string | null;
  followRedirects?: boolean;
  retry?: RetryConfig | null;
}

// ─── AuthRefreshConfig ───────────────────────────────────────────────────────

export interface AuthRefreshConfig {
  authType?: string;
  authToken?: string | null;
  authTokenResolver?: string | null;
  refreshIntervalSeconds?: number;
  refreshFn?: (() => Promise<string>) | null;
  apiAuthHeaderName?: string | null;
}

// ─── CacheResponseConfig ────────────────────────────────────────────────────

export interface CacheResponseConfig {
  enabled?: boolean;
  ttlSeconds?: number;
  storageType?: string;
  s3Config?: Record<string, unknown> | null;
  keyStrategy?: string;
  keyPrefix?: string;
  staleWhileRevalidate?: number | null;
  cacheMethods?: string[];
}

// ─── SDKConfig ──────────────────────────────────────────────────────────────

export interface SDKConfig {
  http?: HttpFetchConfig;
  auth?: AuthRefreshConfig | null;
  cache?: CacheResponseConfig;
  debug?: boolean;
}

// ─── Response Types ─────────────────────────────────────────────────────────

export interface CachedHttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  cacheHit: boolean;
  cacheKey?: string | null;
  cacheAge?: number | null;
  cacheExpiresAt?: number | null;
}

export interface FetchResult<T = unknown> {
  success: boolean;
  data: T | null;
  cached: boolean;
  cacheKey: string | null;
  elapsedMs: number;
  error: string | null;
}

// ─── Resolved config with defaults ──────────────────────────────────────────

export interface ResolvedHttpConfig {
  baseUrl: string;
  method: string;
  headers: Record<string, string>;
  timeout: number;
  verify: boolean;
  proxyUrl: string | null;
  followRedirects: boolean;
  retry: RetryConfig | null;
}

export interface ResolvedAuthConfig {
  authType: string;
  authToken: string | null;
  authTokenResolver: string | null;
  refreshIntervalSeconds: number;
  refreshFn: (() => Promise<string>) | null;
  apiAuthHeaderName: string | null;
}

export interface ResolvedCacheConfig {
  enabled: boolean;
  ttlSeconds: number;
  storageType: string;
  s3Config: Record<string, unknown> | null;
  keyStrategy: string;
  keyPrefix: string;
  staleWhileRevalidate: number | null;
  cacheMethods: string[];
}

export interface ResolvedSDKConfig {
  http: ResolvedHttpConfig;
  auth: ResolvedAuthConfig | null;
  cache: ResolvedCacheConfig;
  debug: boolean;
}
