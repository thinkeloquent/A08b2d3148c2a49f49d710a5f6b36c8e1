/**
 * Auth token refresh manager with pluggable strategies (Story 2).
 */

import { FetchCacheAuthError } from "./exceptions.js";
import { createLogger } from "./logger.js";
import type { ResolvedAuthConfig } from "./types.js";

const logger = createLogger("token-manager");

// ─── Strategy Interface ──────────────────────────────────────────────────────

export interface TokenStrategy {
  getToken(): Promise<string>;
  isExpired(): boolean;
}

// ─── Built-in Strategies ─────────────────────────────────────────────────────

export class StaticTokenStrategy implements TokenStrategy {
  #token: string;

  constructor(token: string) {
    this.#token = token;
  }

  async getToken(): Promise<string> {
    return this.#token;
  }

  isExpired(): boolean {
    return false;
  }
}

export class CallableTokenStrategy implements TokenStrategy {
  #refreshFn: () => Promise<string>;
  #refreshInterval: number;
  #token: string | null = null;
  #expiresAt = 0;
  #refreshPromise: Promise<string> | null = null;

  constructor(refreshFn: () => Promise<string>, refreshIntervalSeconds = 1200) {
    this.#refreshFn = refreshFn;
    this.#refreshInterval = refreshIntervalSeconds;
  }

  async getToken(): Promise<string> {
    if (!this.isExpired() && this.#token !== null) {
      return this.#token;
    }
    // Mutex via single promise (async-safe)
    if (this.#refreshPromise === null) {
      this.#refreshPromise = this.#refresh();
    }
    try {
      return await this.#refreshPromise;
    } finally {
      this.#refreshPromise = null;
    }
  }

  isExpired(): boolean {
    return performance.now() / 1000 >= this.#expiresAt;
  }

  async #refresh(): Promise<string> {
    try {
      this.#token = await this.#refreshFn();
      this.#expiresAt = performance.now() / 1000 + this.#refreshInterval;
      logger.debug(`token refreshed, expires in ${this.#refreshInterval}s`);
      return this.#token;
    } catch (e) {
      throw new FetchCacheAuthError(
        `Token refresh failed: ${e}`,
        e instanceof Error ? e : undefined,
      );
    }
  }
}

export class ComputedTokenStrategy implements TokenStrategy {
  #resolverName: string;
  #resolveFn: ((name: string) => Promise<string>) | null;
  #refreshInterval: number;
  #token: string | null = null;
  #expiresAt = 0;
  #refreshPromise: Promise<string> | null = null;

  constructor(
    resolverName: string,
    resolveFn: ((name: string) => Promise<string>) | null = null,
    refreshIntervalSeconds = 1200,
  ) {
    this.#resolverName = resolverName;
    this.#resolveFn = resolveFn;
    this.#refreshInterval = refreshIntervalSeconds;
  }

  async getToken(): Promise<string> {
    if (!this.isExpired() && this.#token !== null) {
      return this.#token;
    }
    if (this.#refreshPromise === null) {
      this.#refreshPromise = this.#refresh();
    }
    try {
      return await this.#refreshPromise;
    } finally {
      this.#refreshPromise = null;
    }
  }

  isExpired(): boolean {
    return performance.now() / 1000 >= this.#expiresAt;
  }

  async #refresh(): Promise<string> {
    if (this.#resolveFn === null) {
      throw new FetchCacheAuthError(
        `No resolveFn provided for computed token '${this.#resolverName}'`,
      );
    }
    try {
      this.#token = await this.#resolveFn(this.#resolverName);
      this.#expiresAt = performance.now() / 1000 + this.#refreshInterval;
      logger.debug(`computed token '${this.#resolverName}' refreshed`);
      return this.#token;
    } catch (e) {
      throw new FetchCacheAuthError(
        `Computed token resolution failed for '${this.#resolverName}': ${e}`,
        e instanceof Error ? e : undefined,
      );
    }
  }
}

// ─── Token Refresh Manager ──────────────────────────────────────────────────

export class TokenRefreshManager {
  #strategy: TokenStrategy;
  #authConfig: ResolvedAuthConfig;

  constructor(strategy: TokenStrategy, authConfig: ResolvedAuthConfig) {
    this.#strategy = strategy;
    this.#authConfig = authConfig;
  }

  async getToken(): Promise<string> {
    return this.#strategy.getToken();
  }

  isExpired(): boolean {
    return this.#strategy.isExpired();
  }

  async buildAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();

    // Custom header name override
    if (this.#authConfig.apiAuthHeaderName) {
      return { [this.#authConfig.apiAuthHeaderName]: token };
    }

    // Standard auth encoding
    const authType = this.#authConfig.authType;
    try {
      const { encodeAuth } = await import("@internal/auth-encoding") as any;
      return encodeAuth(authType, { token });
    } catch (e) {
      // Fallback: simple Bearer header
      if (authType === "bearer") {
        return { Authorization: `Bearer ${token}` };
      }
      throw new FetchCacheAuthError(
        `Failed to encode auth headers for type '${authType}': ${e}`,
        e instanceof Error ? e : undefined,
      );
    }
  }
}

// ─── Factory ────────────────────────────────────────────────────────────────

export function createTokenStrategy(authConfig: ResolvedAuthConfig): TokenStrategy {
  if (authConfig.refreshFn !== null) {
    return new CallableTokenStrategy(
      authConfig.refreshFn,
      authConfig.refreshIntervalSeconds,
    );
  }
  if (authConfig.authTokenResolver !== null) {
    return new ComputedTokenStrategy(
      authConfig.authTokenResolver,
      null,
      authConfig.refreshIntervalSeconds,
    );
  }
  if (authConfig.authToken !== null) {
    return new StaticTokenStrategy(authConfig.authToken);
  }
  throw new FetchCacheAuthError(
    "AuthRefreshConfig must provide one of: authToken, authTokenResolver, or refreshFn",
  );
}

export function createTokenManager(authConfig: ResolvedAuthConfig): TokenRefreshManager {
  const strategy = createTokenStrategy(authConfig);
  return new TokenRefreshManager(strategy, authConfig);
}
