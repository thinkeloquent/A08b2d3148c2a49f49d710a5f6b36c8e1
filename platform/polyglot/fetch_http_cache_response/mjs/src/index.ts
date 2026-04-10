/**
 * @internal/fetch-http-cache-response — Polyglot HTTP client with S3 response caching.
 */

// Types & Config
export type {
  AuthRefreshConfig,
  CacheResponseConfig,
  CachedHttpResponse,
  FetchResult,
  HttpFetchConfig,
  ResolvedAuthConfig,
  ResolvedCacheConfig,
  ResolvedHttpConfig,
  ResolvedSDKConfig,
  RetryConfig,
  SDKConfig,
} from "./types.js";

// Config Resolution
export { resolveConfig } from "./config.js";

// Exceptions
export {
  FetchCacheAuthError,
  FetchCacheConfigError,
  FetchCacheError,
  FetchCacheNetworkError,
  FetchCacheStorageError,
  FetchCacheTimeoutError,
} from "./exceptions.js";

// Token Management
export {
  CallableTokenStrategy,
  ComputedTokenStrategy,
  StaticTokenStrategy,
  TokenRefreshManager,
  createTokenManager,
  createTokenStrategy,
} from "./token-manager.js";
export type { TokenStrategy } from "./token-manager.js";

// Client
export { FetchHttpCacheClient, generateCacheKey } from "./client.js";
export type { KeyFn } from "./client.js";

// SDK
export {
  createFetchCacheSdk,
  createFetchCacheSdkFromEnv,
  createFetchCacheSdkFromYaml,
  fetchCached,
  invalidateCache,
} from "./sdk.js";

// Adapters
export { createComputedProvider, createFastifyPlugin } from "./adapters.js";
export type { FastifyPluginOptions } from "./adapters.js";

// Logger
export { Logger, createLogger } from "./logger.js";
export type { LoggerLike } from "./logger.js";
