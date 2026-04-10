/**
 * FetchHttpCacheClient — HTTP client with S3 response caching (Story 3).
 */

import { createHash } from "node:crypto";
import { FetchCacheNetworkError, FetchCacheStorageError, FetchCacheTimeoutError } from "./exceptions.js";
import { createLogger } from "./logger.js";
import type { TokenRefreshManager } from "./token-manager.js";
import type { CachedHttpResponse, FetchResult, ResolvedSDKConfig } from "./types.js";

const logger = createLogger("client");

// ─── Cache Key Generation ───────────────────────────────────────────────────

export type KeyFn = (method: string, url: string, body: unknown) => string;

export function generateCacheKey(
  method: string,
  url: string,
  keyStrategy: string,
  keyPrefix: string,
  body?: unknown,
  keyFn?: KeyFn,
): string {
  let raw: string;
  if (keyStrategy === "custom" && keyFn) {
    raw = keyFn(method, url, body);
  } else if (keyStrategy === "url+body") {
    raw = `${method.toUpperCase()}:${url}`;
    if (body !== undefined && body !== null) {
      raw += `:${JSON.stringify(body, Object.keys(body as Record<string, unknown>).sort())}`;
    }
  } else {
    raw = `${method.toUpperCase()}:${url}`;
  }

  const hashed = createHash("sha256").update(raw).digest("hex").slice(0, 16);
  return `${keyPrefix}${hashed}`;
}

// ─── Client ─────────────────────────────────────────────────────────────────

interface StorageLike {
  load(key: string): Promise<Record<string, unknown> | null>;
  save(entry: Record<string, unknown>): Promise<void>;
  delete(key: string): Promise<void>;
  close?(): Promise<void>;
}

interface HttpClientLike {
  request(method: string, url: string, options?: Record<string, unknown>): Promise<{
    statusCode?: number;
    status?: number;
    headers: Record<string, string> | Headers;
    json(): unknown;
    text?: string;
    body?: unknown;
  }>;
  close?(): Promise<void>;
  destroy?(): Promise<void>;
}

export class FetchHttpCacheClient {
  #config: ResolvedSDKConfig;
  #httpClient: HttpClientLike | null;
  #storage: StorageLike | null;
  #tokenManager: TokenRefreshManager | null;
  #closed = false;
  #logger = logger.child("client");

  constructor(
    config: ResolvedSDKConfig,
    httpClient: HttpClientLike | null = null,
    storage: StorageLike | null = null,
    tokenManager: TokenRefreshManager | null = null,
  ) {
    this.#config = config;
    this.#httpClient = httpClient;
    this.#storage = storage;
    this.#tokenManager = tokenManager;

    if (config.debug) {
      this.#logger.debug(
        `initialized: baseUrl=${config.http.baseUrl}, cache=${config.cache.enabled ? "enabled" : "disabled"}`,
      );
    }
  }

  // ── Lazy init ─────────────────────────────────────────────────────────

  async #ensureHttpClient(): Promise<HttpClientLike> {
    if (this.#httpClient === null) {
      try {
        const { AsyncClient } = await import("fetch-undici") as any;
        this.#httpClient = new AsyncClient({
          baseUrl: this.#config.http.baseUrl || undefined,
          timeout: { connect: this.#config.http.timeout * 1000, read: this.#config.http.timeout * 1000 },
          headers: this.#config.http.headers,
        }) as unknown as HttpClientLike;
      } catch {
        throw new FetchCacheNetworkError("Failed to create HTTP client: @internal/fetch-undici not available");
      }
    }
    return this.#httpClient;
  }

  async #ensureStorage(): Promise<StorageLike | null> {
    if (this.#storage === null && this.#config.cache.enabled) {
      if (this.#config.cache.storageType === "s3") {
        try {
          const mod = await import("cache_json_awss3_storage") as any;
          const s3Cfg = this.#config.cache.s3Config ?? {};
          this.#storage = mod.createStorage({
            bucketName: (s3Cfg as Record<string, string>).bucketName ?? "",
            keyPrefix: this.#config.cache.keyPrefix,
            ttl: this.#config.cache.ttlSeconds,
          }) as unknown as StorageLike;
        } catch {
          this.#logger.warn("@internal/cache-json-awss3-storage not available, caching disabled");
          this.#config.cache.enabled = false;
        }
      }
    }
    return this.#storage;
  }

  // ── Auth headers ──────────────────────────────────────────────────────

  async #getAuthHeaders(): Promise<Record<string, string>> {
    if (this.#tokenManager === null) return {};
    return this.#tokenManager.buildAuthHeaders();
  }

  // ── Cache operations ──────────────────────────────────────────────────

  async #cacheGet(key: string): Promise<CachedHttpResponse | null> {
    const storage = await this.#ensureStorage();
    if (storage === null) return null;

    try {
      const entry = await storage.load(key);
      if (entry === null) return null;

      const data = (entry.data ?? entry) as Record<string, unknown>;
      const expiresAt = (data.expires_at ?? entry.expires_at) as number | undefined;
      const now = Date.now() / 1000;

      if (expiresAt && now > expiresAt) {
        const staleWindow = this.#config.cache.staleWhileRevalidate;
        if (staleWindow && now < expiresAt + staleWindow) {
          this.#logger.debug(`serving stale cache for key=${key}`);
          const resp = (data.response ?? data) as Record<string, unknown>;
          return {
            statusCode: (resp.status_code ?? resp.statusCode ?? 200) as number,
            headers: (resp.headers ?? {}) as Record<string, string>,
            body: resp.body ?? resp,
            cacheHit: true,
            cacheKey: key,
            cacheAge: now - ((data.created_at ?? now) as number),
            cacheExpiresAt: expiresAt,
          };
        }
        return null;
      }

      const resp = (data.response ?? data) as Record<string, unknown>;
      return {
        statusCode: (resp.status_code ?? resp.statusCode ?? 200) as number,
        headers: (resp.headers ?? {}) as Record<string, string>,
        body: resp.body ?? resp,
        cacheHit: true,
        cacheKey: key,
        cacheAge: now - ((data.created_at ?? now) as number),
        cacheExpiresAt: expiresAt ?? null,
      };
    } catch (e) {
      this.#logger.warn(`cache read failed for key=${key}: ${e}`);
      return null;
    }
  }

  async #cacheSet(key: string, response: CachedHttpResponse): Promise<void> {
    const storage = await this.#ensureStorage();
    if (storage === null) return;

    const now = Date.now() / 1000;
    const entry = {
      key,
      data: {
        response: {
          status_code: response.statusCode,
          headers: response.headers,
          body: response.body,
        },
        created_at: now,
        expires_at: now + this.#config.cache.ttlSeconds,
      },
      created_at: now,
      expires_at: now + this.#config.cache.ttlSeconds,
    };

    try {
      await storage.save(entry);
      this.#logger.debug(`cached response: key=${key}, ttl=${this.#config.cache.ttlSeconds}s`);
    } catch (e) {
      throw new FetchCacheStorageError(
        `Failed to cache response for key=${key}: ${e}`,
        e instanceof Error ? e : undefined,
      );
    }
  }

  // ── HTTP methods ──────────────────────────────────────────────────────

  async request(
    method: string,
    url: string,
    options: {
      headers?: Record<string, string>;
      body?: unknown;
      params?: Record<string, string>;
      keyFn?: KeyFn;
    } = {},
  ): Promise<FetchResult> {
    const start = performance.now();

    // Build merged headers
    const mergedHeaders: Record<string, string> = { ...this.#config.http.headers };
    const authHeaders = await this.#getAuthHeaders();
    Object.assign(mergedHeaders, authHeaders);
    if (options.headers) Object.assign(mergedHeaders, options.headers);

    // Resolve full URL
    let fullUrl = url;
    if (this.#config.http.baseUrl && !url.startsWith("http://") && !url.startsWith("https://")) {
      const base = this.#config.http.baseUrl.replace(/\/$/, "");
      fullUrl = `${base}/${url.replace(/^\//, "")}`;
    }

    // Cache check
    let cacheKey: string | null = null;
    const shouldCache = this.#config.cache.enabled
      && this.#config.cache.cacheMethods.includes(method.toUpperCase());

    if (shouldCache) {
      cacheKey = generateCacheKey(
        method, fullUrl,
        this.#config.cache.keyStrategy,
        this.#config.cache.keyPrefix,
        options.body,
        options.keyFn,
      );

      const cached = await this.#cacheGet(cacheKey);
      if (cached !== null) {
        const elapsed = performance.now() - start;
        this.#logger.debug(`cache hit: key=${cacheKey}, elapsed=${elapsed.toFixed(1)}ms`);

        // Background revalidation for stale entries
        if (
          cached.cacheExpiresAt
          && Date.now() / 1000 > cached.cacheExpiresAt
          && this.#config.cache.staleWhileRevalidate
        ) {
          this.#backgroundRevalidate(method, url, mergedHeaders, options.body, cacheKey).catch(() => {});
        }

        return {
          success: true,
          data: cached.body,
          cached: true,
          cacheKey,
          elapsedMs: elapsed,
          error: null,
        };
      }
    }

    // Make HTTP request
    try {
      const client = await this.#ensureHttpClient();

      const requestOpts: Record<string, unknown> = { headers: mergedHeaders };
      if (options.body !== undefined) requestOpts.json = options.body;
      if (options.params !== undefined) requestOpts.params = options.params;

      const response = await client.request(method.toUpperCase(), url, requestOpts);
      const elapsed = performance.now() - start;
      const statusCode = response.statusCode ?? response.status ?? 200;

      let responseBody: unknown;
      try {
        responseBody = response.json();
      } catch {
        responseBody = response.text ?? String(response.body);
      }

      const responseHeaders: Record<string, string> = {};
      if (response.headers instanceof Headers) {
        response.headers.forEach((v, k) => { responseHeaders[k] = v; });
      } else {
        Object.assign(responseHeaders, response.headers);
      }

      // Cache successful responses
      if (shouldCache && cacheKey && statusCode >= 200 && statusCode < 400) {
        const cachedResp: CachedHttpResponse = {
          statusCode,
          headers: responseHeaders,
          body: responseBody,
          cacheHit: false,
          cacheKey,
        };
        try {
          await this.#cacheSet(cacheKey, cachedResp);
        } catch {
          this.#logger.warn(`failed to cache response for key=${cacheKey}`);
        }
      }

      this.#logger.debug(`fetch: ${method.toUpperCase()} ${url} -> ${statusCode} (${elapsed.toFixed(1)}ms)`);

      return {
        success: true,
        data: responseBody,
        cached: false,
        cacheKey,
        elapsedMs: elapsed,
        error: null,
      };
    } catch (e) {
      const elapsed = performance.now() - start;
      if (e instanceof FetchCacheStorageError) throw e;

      const message = e instanceof Error ? e.message : String(e);
      if (message.includes("timeout") || message.includes("Timeout")) {
        throw new FetchCacheTimeoutError(
          `Request timed out: ${method.toUpperCase()} ${url}`,
          e instanceof Error ? e : undefined,
        );
      }
      throw new FetchCacheNetworkError(
        `HTTP request failed: ${method.toUpperCase()} ${url}: ${message}`,
        e instanceof Error ? e : undefined,
      );
    }
  }

  async #backgroundRevalidate(
    method: string,
    url: string,
    headers: Record<string, string>,
    body: unknown,
    cacheKey: string,
  ): Promise<void> {
    try {
      const client = await this.#ensureHttpClient();
      const opts: Record<string, unknown> = { headers };
      if (body !== undefined) opts.json = body;
      const response = await client.request(method.toUpperCase(), url, opts);
      const statusCode = response.statusCode ?? response.status ?? 200;

      if (statusCode >= 200 && statusCode < 400) {
        let responseBody: unknown;
        try { responseBody = response.json(); } catch { responseBody = response.text; }
        const responseHeaders: Record<string, string> = {};
        if (response.headers instanceof Headers) {
          response.headers.forEach((v, k) => { responseHeaders[k] = v; });
        } else {
          Object.assign(responseHeaders, response.headers);
        }

        await this.#cacheSet(cacheKey, {
          statusCode,
          headers: responseHeaders,
          body: responseBody,
          cacheHit: false,
          cacheKey,
        });
        this.#logger.debug(`background revalidation complete: key=${cacheKey}`);
      }
    } catch (e) {
      this.#logger.warn(`background revalidation failed: key=${cacheKey}: ${e}`);
    }
  }

  // ── Convenience methods ───────────────────────────────────────────────

  async get(url: string, options?: Parameters<FetchHttpCacheClient["request"]>[2]): Promise<FetchResult> {
    return this.request("GET", url, options);
  }

  async post(url: string, options?: Parameters<FetchHttpCacheClient["request"]>[2]): Promise<FetchResult> {
    return this.request("POST", url, options);
  }

  async put(url: string, options?: Parameters<FetchHttpCacheClient["request"]>[2]): Promise<FetchResult> {
    return this.request("PUT", url, options);
  }

  async delete(url: string, options?: Parameters<FetchHttpCacheClient["request"]>[2]): Promise<FetchResult> {
    return this.request("DELETE", url, options);
  }

  async head(url: string, options?: Parameters<FetchHttpCacheClient["request"]>[2]): Promise<FetchResult> {
    return this.request("HEAD", url, options);
  }

  // ── Cache management ──────────────────────────────────────────────────

  async invalidateCache(key: string): Promise<void> {
    const storage = await this.#ensureStorage();
    if (storage !== null) {
      try {
        await storage.delete(key);
        this.#logger.debug(`invalidated cache: key=${key}`);
      } catch (e) {
        throw new FetchCacheStorageError(
          `Failed to invalidate cache key=${key}: ${e}`,
          e instanceof Error ? e : undefined,
        );
      }
    }
  }

  // ── Cleanup ───────────────────────────────────────────────────────────

  async close(): Promise<void> {
    if (this.#closed) return;
    this.#closed = true;

    if (this.#httpClient?.close) await this.#httpClient.close();
    else if (this.#httpClient?.destroy) await this.#httpClient.destroy();
    if (this.#storage?.close) await this.#storage.close();

    this.#logger.debug("client closed");
  }

  [Symbol.dispose](): void {
    this.close().catch(() => {});
  }
}
