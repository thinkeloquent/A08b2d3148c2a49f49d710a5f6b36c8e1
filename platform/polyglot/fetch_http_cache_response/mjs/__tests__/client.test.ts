/**
 * Tests for FetchHttpCacheClient (Story 6, Task 6.3).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { FetchHttpCacheClient, generateCacheKey } from "../src/client.js";
import { FetchCacheNetworkError } from "../src/exceptions.js";
import { resolveConfig } from "../src/config.js";
import { createMockHttpClient, createMockStorage, createMockTokenManager } from "./helpers.js";
import type { ResolvedSDKConfig } from "../src/types.js";
import type { TokenRefreshManager } from "../src/token-manager.js";

function makeConfig(overrides: Partial<ResolvedSDKConfig> = {}): ResolvedSDKConfig {
  return resolveConfig({
    http: { baseUrl: "https://api.example.com" },
    ...overrides,
  });
}

describe("generateCacheKey", () => {
  it("url strategy produces consistent keys", () => {
    const k1 = generateCacheKey("GET", "https://api.example.com/data", "url", "fhcr:");
    const k2 = generateCacheKey("GET", "https://api.example.com/data", "url", "fhcr:");
    expect(k1).toBe(k2);
    expect(k1).toMatch(/^fhcr:[0-9a-f]{16}$/);
  });

  it("different methods produce different keys", () => {
    const k1 = generateCacheKey("GET", "https://api.example.com/data", "url", "fhcr:");
    const k2 = generateCacheKey("POST", "https://api.example.com/data", "url", "fhcr:");
    expect(k1).not.toBe(k2);
  });

  it("url+body strategy includes body", () => {
    const k1 = generateCacheKey("POST", "https://api.example.com", "url+body", "fhcr:", { q: "a" });
    const k2 = generateCacheKey("POST", "https://api.example.com", "url+body", "fhcr:", { q: "b" });
    expect(k1).not.toBe(k2);
  });

  it("custom strategy uses keyFn", () => {
    const key = generateCacheKey(
      "GET", "https://api.example.com", "custom", "fhcr:",
      undefined, (m, u) => `${m}:${u}:custom`,
    );
    expect(key).toMatch(/^fhcr:/);
  });

  it("respects custom prefix", () => {
    const key = generateCacheKey("GET", "https://api.example.com", "url", "myapp:");
    expect(key.startsWith("myapp:")).toBe(true);
  });
});

describe("FetchHttpCacheClient", () => {
  it("cache miss fetches and stores", async () => {
    const httpClient = createMockHttpClient();
    const storage = createMockStorage();
    const config = makeConfig();
    const client = new FetchHttpCacheClient(config, httpClient as any, storage as any);

    const result = await client.get("/data");
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ result: "ok" });
    expect(result.cached).toBe(false);
    expect(httpClient.request).toHaveBeenCalledOnce();
    expect(storage.save).toHaveBeenCalledOnce();
  });

  it("cache hit skips HTTP call", async () => {
    const httpClient = createMockHttpClient();
    const storage = createMockStorage();
    const now = Date.now() / 1000;
    storage.load.mockResolvedValue({
      key: "fhcr:abc123",
      data: {
        response: { status_code: 200, headers: {}, body: { cached: true } },
        created_at: now,
        expires_at: now + 600,
      },
      created_at: now,
      expires_at: now + 600,
    });
    const config = makeConfig();
    const client = new FetchHttpCacheClient(config, httpClient as any, storage as any);

    const result = await client.get("/data");
    expect(result.success).toBe(true);
    expect(result.cached).toBe(true);
    expect(result.data).toEqual({ cached: true });
    expect(httpClient.request).not.toHaveBeenCalled();
  });

  it("cache disabled always fetches", async () => {
    const httpClient = createMockHttpClient();
    const storage = createMockStorage();
    const config = makeConfig({ cache: { ...resolveConfig().cache, enabled: false } });
    const client = new FetchHttpCacheClient(config, httpClient as any, storage as any);

    const result = await client.get("/data");
    expect(result.success).toBe(true);
    expect(result.cached).toBe(false);
    expect(storage.load).not.toHaveBeenCalled();
  });

  it("injects auth headers from token manager", async () => {
    const httpClient = createMockHttpClient();
    const storage = createMockStorage();
    const tokenManager = createMockTokenManager();
    const config = makeConfig();
    const client = new FetchHttpCacheClient(
      config, httpClient as any, storage as any, tokenManager as any,
    );

    await client.get("/data");
    const callHeaders = httpClient.request.mock.calls[0][2]?.headers;
    expect(callHeaders?.Authorization).toBe("Bearer test-token-123");
  });

  it("HTTP error throws FetchCacheNetworkError", async () => {
    const httpClient = {
      request: vi.fn().mockRejectedValue(new Error("connection refused")),
      close: vi.fn(),
    };
    const storage = createMockStorage();
    const config = makeConfig();
    const client = new FetchHttpCacheClient(config, httpClient as any, storage as any);

    await expect(client.get("/data")).rejects.toThrow(FetchCacheNetworkError);
  });

  it("POST not cached by default", async () => {
    const httpClient = createMockHttpClient();
    const storage = createMockStorage();
    const config = makeConfig();
    const client = new FetchHttpCacheClient(config, httpClient as any, storage as any);

    await client.post("/data", { body: { key: "value" } });
    expect(storage.load).not.toHaveBeenCalled();
    expect(storage.save).not.toHaveBeenCalled();
  });

  it("invalidateCache calls storage.delete", async () => {
    const httpClient = createMockHttpClient();
    const storage = createMockStorage();
    const config = makeConfig();
    const client = new FetchHttpCacheClient(config, httpClient as any, storage as any);

    await client.invalidateCache("fhcr:abc123");
    expect(storage.delete).toHaveBeenCalledWith("fhcr:abc123");
  });

  it("close cleans up resources", async () => {
    const httpClient = createMockHttpClient();
    const storage = createMockStorage();
    const config = makeConfig();
    const client = new FetchHttpCacheClient(config, httpClient as any, storage as any);

    await client.close();
    expect(httpClient.close).toHaveBeenCalledOnce();
    expect(storage.close).toHaveBeenCalledOnce();
  });

  it("expired cache entry triggers re-fetch", async () => {
    const httpClient = createMockHttpClient();
    const storage = createMockStorage();
    const now = Date.now() / 1000;
    storage.load.mockResolvedValue({
      key: "fhcr:abc123",
      data: {
        response: { status_code: 200, headers: {}, body: { stale: true } },
        created_at: now - 700,
        expires_at: now - 100,
      },
      created_at: now - 700,
      expires_at: now - 100,
    });
    const config = makeConfig();
    const client = new FetchHttpCacheClient(config, httpClient as any, storage as any);

    const result = await client.get("/data");
    expect(result.cached).toBe(false);
    expect(httpClient.request).toHaveBeenCalledOnce();
  });
});
