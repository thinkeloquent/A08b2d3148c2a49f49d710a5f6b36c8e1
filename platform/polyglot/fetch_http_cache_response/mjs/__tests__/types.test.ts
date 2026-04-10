/**
 * Tests for types and config (Story 6, Task 6.1).
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { resolveConfig } from "../src/config.js";

describe("resolveConfig", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  describe("defaults", () => {
    it("returns sane defaults with no input", () => {
      const config = resolveConfig();
      expect(config.http.baseUrl).toBe("");
      expect(config.http.method).toBe("GET");
      expect(config.http.timeout).toBe(30);
      expect(config.http.verify).toBe(true);
      expect(config.http.followRedirects).toBe(true);
      expect(config.auth).toBeNull();
      expect(config.cache.enabled).toBe(true);
      expect(config.cache.ttlSeconds).toBe(600);
      expect(config.cache.storageType).toBe("s3");
      expect(config.cache.keyStrategy).toBe("url");
      expect(config.cache.keyPrefix).toBe("fhcr:");
      expect(config.cache.cacheMethods).toEqual(["GET"]);
      expect(config.debug).toBe(false);
    });
  });

  describe("overrides", () => {
    it("applies override values", () => {
      const config = resolveConfig({
        http: { baseUrl: "https://api.example.com", timeout: 60 },
        cache: { ttlSeconds: 300 },
        debug: true,
      });
      expect(config.http.baseUrl).toBe("https://api.example.com");
      expect(config.http.timeout).toBe(60);
      expect(config.cache.ttlSeconds).toBe(300);
      expect(config.debug).toBe(true);
    });
  });

  describe("YAML config", () => {
    it("uses YAML values", () => {
      const config = resolveConfig({}, {
        http: { base_url: "https://yaml.example.com", timeout: 45 },
        cache: { ttl_seconds: 120, key_prefix: "test:" },
      });
      expect(config.http.baseUrl).toBe("https://yaml.example.com");
      expect(config.http.timeout).toBe(45);
      expect(config.cache.ttlSeconds).toBe(120);
      expect(config.cache.keyPrefix).toBe("test:");
    });

    it("overrides beat YAML", () => {
      const config = resolveConfig(
        { http: { baseUrl: "https://override.example.com" } },
        { http: { base_url: "https://yaml.example.com" } },
      );
      expect(config.http.baseUrl).toBe("https://override.example.com");
    });
  });

  describe("env vars", () => {
    it("reads from environment", () => {
      vi.stubEnv("FETCH_CACHE_BASE_URL", "https://env.example.com");
      vi.stubEnv("FETCH_CACHE_TIMEOUT", "90");
      vi.stubEnv("FETCH_CACHE_DEBUG", "true");
      const config = resolveConfig();
      expect(config.http.baseUrl).toBe("https://env.example.com");
      expect(config.http.timeout).toBe(90);
      expect(config.debug).toBe(true);
    });
  });

  describe("auth config", () => {
    it("creates auth when overrides provided", () => {
      const config = resolveConfig({
        auth: { authType: "bearer", authToken: "tok_123" },
      });
      expect(config.auth).not.toBeNull();
      expect(config.auth!.authType).toBe("bearer");
      expect(config.auth!.authToken).toBe("tok_123");
    });

    it("creates auth from YAML", () => {
      const config = resolveConfig({}, {
        auth: { auth_type: "x-api-key", auth_token: "key_456" },
      });
      expect(config.auth).not.toBeNull();
      expect(config.auth!.authType).toBe("x-api-key");
    });

    it("returns null auth when no auth config", () => {
      const config = resolveConfig();
      expect(config.auth).toBeNull();
    });
  });
});
