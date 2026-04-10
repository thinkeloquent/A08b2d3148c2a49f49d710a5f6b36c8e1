/**
 * Tests for TokenRefreshManager (Story 6, Task 6.2).
 */

import { describe, it, expect, vi } from "vitest";
import { FetchCacheAuthError } from "../src/exceptions.js";
import {
  CallableTokenStrategy,
  ComputedTokenStrategy,
  StaticTokenStrategy,
  createTokenManager,
  createTokenStrategy,
} from "../src/token-manager.js";
import type { ResolvedAuthConfig } from "../src/types.js";

function makeAuthConfig(overrides: Partial<ResolvedAuthConfig> = {}): ResolvedAuthConfig {
  return {
    authType: "bearer",
    authToken: null,
    authTokenResolver: null,
    refreshIntervalSeconds: 1200,
    refreshFn: null,
    apiAuthHeaderName: null,
    ...overrides,
  };
}

describe("StaticTokenStrategy", () => {
  it("returns static token", async () => {
    const strategy = new StaticTokenStrategy("my-token");
    expect(await strategy.getToken()).toBe("my-token");
  });

  it("never expires", () => {
    const strategy = new StaticTokenStrategy("my-token");
    expect(strategy.isExpired()).toBe(false);
  });
});

describe("CallableTokenStrategy", () => {
  it("fetches token on first call", async () => {
    let count = 0;
    const strategy = new CallableTokenStrategy(async () => {
      count++;
      return `token-${count}`;
    }, 60);
    expect(await strategy.getToken()).toBe("token-1");
    expect(count).toBe(1);
  });

  it("caches token within interval", async () => {
    let count = 0;
    const strategy = new CallableTokenStrategy(async () => {
      count++;
      return `token-${count}`;
    }, 60);
    const t1 = await strategy.getToken();
    const t2 = await strategy.getToken();
    expect(t1).toBe(t2);
    expect(count).toBe(1);
  });

  it("refresh failure throws FetchCacheAuthError", async () => {
    const strategy = new CallableTokenStrategy(async () => {
      throw new Error("remote error");
    });
    await expect(strategy.getToken()).rejects.toThrow(FetchCacheAuthError);
  });

  it("concurrent access single refresh", async () => {
    let count = 0;
    const strategy = new CallableTokenStrategy(async () => {
      count++;
      await new Promise((r) => setTimeout(r, 50));
      return `token-${count}`;
    }, 60);
    const results = await Promise.all([
      strategy.getToken(),
      strategy.getToken(),
      strategy.getToken(),
    ]);
    expect(new Set(results).size).toBe(1);
    expect(count).toBe(1);
  });
});

describe("ComputedTokenStrategy", () => {
  it("resolves token", async () => {
    const strategy = new ComputedTokenStrategy(
      "github_api",
      async (name) => `computed-${name}`,
      60,
    );
    expect(await strategy.getToken()).toBe("computed-github_api");
  });

  it("throws when no resolve fn", async () => {
    const strategy = new ComputedTokenStrategy("test");
    await expect(strategy.getToken()).rejects.toThrow(FetchCacheAuthError);
  });
});

describe("createTokenStrategy", () => {
  it("static from token", () => {
    const strategy = createTokenStrategy(makeAuthConfig({ authToken: "tok" }));
    expect(strategy).toBeInstanceOf(StaticTokenStrategy);
  });

  it("callable from refreshFn", () => {
    const strategy = createTokenStrategy(
      makeAuthConfig({ refreshFn: async () => "new" }),
    );
    expect(strategy).toBeInstanceOf(CallableTokenStrategy);
  });

  it("computed from resolver", () => {
    const strategy = createTokenStrategy(
      makeAuthConfig({ authTokenResolver: "my_resolver" }),
    );
    expect(strategy).toBeInstanceOf(ComputedTokenStrategy);
  });

  it("throws when no source", () => {
    expect(() => createTokenStrategy(makeAuthConfig())).toThrow(FetchCacheAuthError);
  });
});

describe("TokenRefreshManager", () => {
  it("builds custom auth headers", async () => {
    const config = makeAuthConfig({
      authToken: "fig_123",
      apiAuthHeaderName: "X-Figma-Token",
    });
    const manager = createTokenManager(config);
    const headers = await manager.buildAuthHeaders();
    expect(headers).toEqual({ "X-Figma-Token": "fig_123" });
  });
});
