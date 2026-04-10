/**
 * Cached HTTP Client — Higher-Order Function Pattern
 *
 * Wraps any supported HTTP client with S3-backed response caching.
 * Provides standard HTTP methods where each response has an explicit
 * `.saveResponse()` method for manual cache persistence.
 *
 * Usage:
 *   const cached = withS3Cache(httpClient)(s3Config);
 *   const res = await cached.get("https://api.example.com/data");
 *   const key = await res.saveResponse();  // persist to S3
 *
 * Supported clients:
 *   - fetch_client/FetchClient  (response.data, response.status)
 *   - fetch_undici/AsyncClient  (response.json(), response.statusCode)
 *   - raw undici Dispatcher     (wrapped in AsyncClient internally)
 */

import { getClientFactory, createAsyncClient } from "./client-factory.js";
import type { AsyncClientHandle } from "./client-factory.js";
import { JsonS3Storage, createStorage } from "./storage.js";
import { generateKeyString } from "./key-generator.js";
import {
  JsonS3StorageError,
  JsonS3StorageConfigError,
} from "./errors.js";
import { create as createLogger, NullLogger } from "./logger.js";
import type { Logger } from "./logger.js";

// ---------------------------------------------------------------------------
// S3CacheConfig
// ---------------------------------------------------------------------------

export interface S3CacheConfig {
  bucketName: string;
  regionName?: string;
  endpointUrl?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  ttl?: number;
  prefix?: string;
  addressingStyle?: "path" | "virtual";
}

// ---------------------------------------------------------------------------
// RequestOptions
// ---------------------------------------------------------------------------

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

// ---------------------------------------------------------------------------
// NormalizedResponse (internal)
// ---------------------------------------------------------------------------

interface NormalizedResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  ok: boolean;
  url: string;
  method: string;
}

// ---------------------------------------------------------------------------
// HttpClientAdapter (internal)
// ---------------------------------------------------------------------------

interface HttpClientAdapter {
  request(
    method: string,
    url: string,
    options?: {
      headers?: Record<string, string>;
      body?: unknown;
      params?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<NormalizedResponse>;
}

// ---------------------------------------------------------------------------
// FetchClientAdapter — wraps polyglot fetch_client/FetchClient
// ---------------------------------------------------------------------------

class FetchClientAdapter implements HttpClientAdapter {
  constructor(private readonly client: any) {}

  async request(
    method: string,
    url: string,
    options?: {
      headers?: Record<string, string>;
      body?: unknown;
      params?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<NormalizedResponse> {
    const m = method.toLowerCase();
    let response: any;

    const reqOpts: Record<string, unknown> = {};
    if (options?.headers) reqOpts.headers = options.headers;
    if (options?.timeout) reqOpts.timeout = options.timeout;

    if (m === "get") {
      response = await this.client.get(url, options?.params, reqOpts);
    } else if (m === "delete") {
      response = await this.client.delete(url, reqOpts);
    } else {
      // post, put, patch — body as second arg
      response = await this.client[m](url, options?.body, reqOpts);
    }

    return {
      status: response.status,
      headers: response.headers ?? {},
      body: response.data,
      ok: response.ok,
      url,
      method: method.toUpperCase(),
    };
  }
}

// ---------------------------------------------------------------------------
// UndiciClientAdapter — wraps fetch_undici/AsyncClient
// ---------------------------------------------------------------------------

class UndiciClientAdapter implements HttpClientAdapter {
  constructor(private readonly client: any) {}

  async request(
    method: string,
    url: string,
    options?: {
      headers?: Record<string, string>;
      body?: unknown;
      params?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<NormalizedResponse> {
    const reqOpts: Record<string, unknown> = {};
    if (options?.headers) reqOpts.headers = options.headers;
    if (options?.timeout) reqOpts.timeout = options.timeout;
    if (options?.body !== undefined) reqOpts.json = options.body;
    if (options?.params) reqOpts.params = options.params;

    const response = await this.client.request(method.toUpperCase(), url, reqOpts);

    // fetch_undici Response has lazy body — consume via .json()
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      try {
        body = await response.text();
      } catch {
        body = null;
      }
    }

    // Convert Headers object to plain Record
    const headers: Record<string, string> = {};
    if (response.headers) {
      if (typeof response.headers.entries === "function") {
        for (const [k, v] of response.headers.entries()) {
          headers[k] = v;
        }
      } else if (typeof response.headers.forEach === "function") {
        response.headers.forEach((v: string, k: string) => {
          headers[k] = v;
        });
      }
    }

    return {
      status: response.statusCode,
      headers,
      body,
      ok: response.ok ?? (response.statusCode >= 200 && response.statusCode < 300),
      url,
      method: method.toUpperCase(),
    };
  }
}

// ---------------------------------------------------------------------------
// UndiciDispatcherAdapter — wraps raw undici Dispatcher
// ---------------------------------------------------------------------------

class UndiciDispatcherAdapter implements HttpClientAdapter {
  private innerAdapter: UndiciClientAdapter | null = null;

  constructor(private readonly dispatcher: any) {}

  async request(
    method: string,
    url: string,
    options?: {
      headers?: Record<string, string>;
      body?: unknown;
      params?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<NormalizedResponse> {
    // Lazy-init: wrap Dispatcher in an AsyncClient from fetch_undici
    if (!this.innerAdapter) {
      // Dynamic import to avoid hard dependency
      try {
        // Dynamic import — fetch_undici is optional, not a direct dependency
        const mod = await (import("fetch_undici" as string) as Promise<any>);
        const asyncClient = new mod.AsyncClient({ dispatcher: this.dispatcher });
        this.innerAdapter = new UndiciClientAdapter(asyncClient);
      } catch {
        throw new JsonS3StorageConfigError(
          "Cannot create AsyncClient from Dispatcher — fetch_undici package not available"
        );
      }
    }
    return this.innerAdapter.request(method, url, options);
  }
}

// ---------------------------------------------------------------------------
// detectAdapter — auto-detect HTTP client type
// ---------------------------------------------------------------------------

function detectAdapter(httpClient: unknown): HttpClientAdapter {
  if (!httpClient || typeof httpClient !== "object") {
    throw new JsonS3StorageConfigError(
      "httpClient must be a FetchClient, AsyncClient, or undici Dispatcher"
    );
  }

  const c = httpClient as any;

  // fetch_undici/AsyncClient — has circuitBreaker property + request method
  if ("circuitBreaker" in c && typeof c.request === "function") {
    return new UndiciClientAdapter(c);
  }

  // polyglot FetchClient — has .get/.post/.request/.stream/.close, no circuitBreaker
  if (
    typeof c.get === "function" &&
    typeof c.post === "function" &&
    typeof c.request === "function" &&
    typeof c.close === "function" &&
    !("circuitBreaker" in c)
  ) {
    return new FetchClientAdapter(c);
  }

  // Raw undici Dispatcher — has .dispatch method
  if (typeof c.dispatch === "function") {
    return new UndiciDispatcherAdapter(c);
  }

  throw new JsonS3StorageConfigError(
    "Unrecognized HTTP client type. Supported: FetchClient, AsyncClient, undici Dispatcher"
  );
}

// ---------------------------------------------------------------------------
// CachedResponse
// ---------------------------------------------------------------------------

export class CachedResponse {
  readonly status: number;
  readonly headers: Record<string, string>;
  readonly data: unknown;
  readonly ok: boolean;
  readonly url: string;
  readonly method: string;

  private readonly _storage: JsonS3Storage;
  private readonly _defaultTtl?: number;
  private readonly _logger: Logger;

  constructor(
    normalized: NormalizedResponse,
    storage: JsonS3Storage,
    logger: Logger,
    defaultTtl?: number,
  ) {
    this.status = normalized.status;
    this.headers = normalized.headers;
    this.data = normalized.body;
    this.ok = normalized.ok;
    this.url = normalized.url;
    this.method = normalized.method;
    this._storage = storage;
    this._defaultTtl = defaultTtl;
    this._logger = logger;
  }

  /**
   * Manually save this response to S3.
   *
   * @param key - Custom cache key. Defaults to hash of `${method}:${url}`.
   * @param options - Optional overrides (ttl).
   * @returns The S3 storage key used.
   */
  async saveResponse(
    key?: string,
    options?: { ttl?: number },
  ): Promise<string> {
    const cacheKey = key ?? generateKeyString(`${this.method}:${this.url}`);
    const ttl = options?.ttl ?? this._defaultTtl;

    const startTime = performance.now();

    this._logger.debug(
      `saveResponse: method=${this.method} url=${this.url} key=${cacheKey}`
    );

    const payload: Record<string, unknown> = {
      status: this.status,
      headers: this.headers,
      data: this.data,
      ok: this.ok,
      url: this.url,
      method: this.method,
      cached_at: Date.now() / 1000,
    };

    const savedKey = await this._storage.save(cacheKey, payload, { ttl });

    const elapsed = performance.now() - startTime;
    this._logger.info(
      `saveResponse: saved key=${savedKey} in ${elapsed.toFixed(1)}ms`
    );

    return savedKey;
  }
}

// ---------------------------------------------------------------------------
// CachedHttpClient
// ---------------------------------------------------------------------------

export class CachedHttpClient {
  private readonly _adapter: HttpClientAdapter;
  private readonly _storage: JsonS3Storage;
  private readonly _clientHandle: AsyncClientHandle;
  private readonly _logger: Logger;
  private readonly _ttl?: number;

  constructor(
    adapter: HttpClientAdapter,
    storage: JsonS3Storage,
    clientHandle: AsyncClientHandle,
    logger: Logger,
    ttl?: number,
  ) {
    this._adapter = adapter;
    this._storage = storage;
    this._clientHandle = clientHandle;
    this._logger = logger;
    this._ttl = ttl;
  }

  private async _request(
    method: string,
    url: string,
    options?: {
      headers?: Record<string, string>;
      body?: unknown;
      params?: Record<string, string>;
      timeout?: number;
    },
  ): Promise<CachedResponse> {
    const startTime = performance.now();
    this._logger.debug(`request: ${method} ${url}`);

    const normalized = await this._adapter.request(method, url, options);

    const elapsed = performance.now() - startTime;
    this._logger.info(
      `request: ${method} ${url} → ${normalized.status} in ${elapsed.toFixed(1)}ms`
    );

    return new CachedResponse(normalized, this._storage, this._logger, this._ttl);
  }

  async get(
    url: string,
    params?: Record<string, string>,
    options?: RequestOptions,
  ): Promise<CachedResponse> {
    return this._request("GET", url, { ...options, params });
  }

  async post(
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<CachedResponse> {
    return this._request("POST", url, { ...options, body });
  }

  async put(
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<CachedResponse> {
    return this._request("PUT", url, { ...options, body });
  }

  async patch(
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<CachedResponse> {
    return this._request("PATCH", url, { ...options, body });
  }

  async delete(
    url: string,
    options?: RequestOptions,
  ): Promise<CachedResponse> {
    return this._request("DELETE", url, options);
  }

  /**
   * Cleanup S3 client resources. Call when done using the cached client.
   */
  async destroy(): Promise<void> {
    this._logger.info("destroy: closing S3 client and storage");
    await this._storage.close();
    this._clientHandle.destroy();
  }
}

// ---------------------------------------------------------------------------
// withS3Cache — the HOF
// ---------------------------------------------------------------------------

/**
 * Higher-order function that wraps an HTTP client with S3 caching.
 *
 * First call: accepts any supported HTTP client, returns a config function.
 * Second call: accepts S3CacheConfig, returns a ready-to-use CachedHttpClient.
 *
 * @example
 * ```typescript
 * import { withS3Cache } from "cache_json_awss3_storage";
 * import { FetchClient } from "fetch_client";
 *
 * const client = FetchClient.create(config);
 * const cached = withS3Cache(client)({
 *   bucketName: "my-cache",
 *   endpointUrl: "http://localhost:4566",
 *   ttl: 600,
 * });
 *
 * const res = await cached.get("https://api.example.com/users");
 * console.log(res.data);
 * await res.saveResponse();     // cache to S3
 * await cached.destroy();       // cleanup
 * ```
 */
export function withS3Cache(
  httpClient: unknown,
): (config: S3CacheConfig) => CachedHttpClient {
  const adapter = detectAdapter(httpClient);

  return (config: S3CacheConfig): CachedHttpClient => {
    if (!config.bucketName) {
      throw new JsonS3StorageConfigError("S3CacheConfig.bucketName is required");
    }

    const logger = createLogger("cache_json_awss3_storage", import.meta.url);
    logger.info(
      `withS3Cache: creating cached client bucket=${config.bucketName}, ` +
        `region=${config.regionName}, endpoint=${config.endpointUrl}, ttl=${config.ttl}`
    );

    // Create S3 client via existing factory
    const clientConfig = getClientFactory({
      bucketName: config.bucketName,
      regionName: config.regionName,
      endpointUrl: config.endpointUrl,
      awsAccessKeyId: config.awsAccessKeyId,
      awsSecretAccessKey: config.awsSecretAccessKey,
      addressingStyle: config.addressingStyle ?? "path",
      ttl: config.ttl ?? 600,
    });

    const clientHandle = createAsyncClient(clientConfig);

    // Create JsonS3Storage for cache persistence
    const storage = createStorage({
      s3Client: clientHandle.client,
      bucketName: config.bucketName,
      keyPrefix: config.prefix ?? "cache:",
      ttl: config.ttl ?? 600,
      region: config.regionName,
      logger,
    });

    return new CachedHttpClient(adapter, storage, clientHandle, logger, config.ttl);
  };
}
