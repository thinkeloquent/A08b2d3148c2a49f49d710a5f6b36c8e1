/**
 * Redis-based JSON storage with size limits, TTL, and configurable eviction policies.
 *
 * This module provides a Redis-backed storage system with features including:
 * - Configurable size limits (by count or memory)
 * - TTL (time-to-live) support for automatic expiration
 * - Multiple eviction policies (FIFO, LRU, LFU)
 * - Rotation mode for log/token storage
 * - Key prefix/namespace support
 * - Comprehensive error handling and diagnostics
 */

import { createHash } from "node:crypto";

// =============================================================================
// Enums
// =============================================================================

export enum EvictionPolicy {
  FIFO = "fifo", // First In First Out (default)
  LRU = "lru", // Least Recently Used
  LFU = "lfu", // Least Frequently Used
}

// =============================================================================
// Interfaces
// =============================================================================

/**
 * Protocol interface for Redis client operations.
 * Compatible with ioredis and other async Redis clients.
 */
export interface RedisClientInterface {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    exMode?: "EX",
    exValue?: number
  ): Promise<"OK" | null>;
  del(...keys: string[]): Promise<number>;
  exists(...keys: string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  ttl(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  incr(key: string): Promise<number>;
  incrby(key: string, increment: number): Promise<number>;
  memory?(subcommand: "USAGE", key: string): Promise<number | null>;
  scan(
    cursor: number | string,
    ...args: (string | number)[]
  ): Promise<[string, string[]]>;
}

export interface ErrorRecord {
  timestamp: string;
  operation: string;
  errorType: string;
  errorMessage: string;
  key?: string;
}

export interface StorageEntry<T = Record<string, unknown>> {
  key: string;
  data: T;
  createdAt: number;
  expiresAt: number | null;
  accessCount: number;
  lastAccessedAt: number | null;
}

export interface StorageStats {
  saves: number;
  loads: number;
  hits: number;
  misses: number;
  deletes: number;
  evictions: number;
  rotations: number;
}

export interface StorageLimits {
  maxEntries?: number;
  maxMemoryBytes?: number;
  rotationSize?: number;
}

export interface JsonRedisStorageOptions {
  redisClient: RedisClientInterface;
  keyPrefix?: string;
  hashKeys?: string[];
  ttl?: number;
  evictionPolicy?: EvictionPolicy;
  maxEntries?: number;
  maxMemoryBytes?: number;
  rotationSize?: number;
  debug?: boolean;
  maxErrorHistory?: number;
}

// =============================================================================
// Exceptions
// =============================================================================

export class JsonRedisStorageError extends Error {
  operation?: string;
  key?: string;
  originalError?: Error;

  constructor(
    message: string,
    options?: {
      operation?: string;
      key?: string;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = "JsonRedisStorageError";
    this.operation = options?.operation;
    this.key = options?.key;
    this.originalError = options?.originalError;
  }

  toString(): string {
    return this.message;
  }
}

export class JsonRedisStorageReadError extends JsonRedisStorageError {
  constructor(
    message: string,
    options?: { operation?: string; key?: string; originalError?: Error }
  ) {
    super(message, options);
    this.name = "JsonRedisStorageReadError";
  }
}

export class JsonRedisStorageWriteError extends JsonRedisStorageError {
  constructor(
    message: string,
    options?: { operation?: string; key?: string; originalError?: Error }
  ) {
    super(message, options);
    this.name = "JsonRedisStorageWriteError";
  }
}

export class JsonRedisStorageSerializationError extends JsonRedisStorageError {
  constructor(
    message: string,
    options?: { operation?: string; key?: string; originalError?: Error }
  ) {
    super(message, options);
    this.name = "JsonRedisStorageSerializationError";
  }
}

export class JsonRedisStorageConnectionError extends JsonRedisStorageError {
  constructor(
    message: string,
    options?: { operation?: string; key?: string; originalError?: Error }
  ) {
    super(message, options);
    this.name = "JsonRedisStorageConnectionError";
  }
}

// =============================================================================
// Main Storage Class
// =============================================================================

/**
 * Redis-based JSON storage with size limits and eviction policies.
 *
 * This class provides a high-level interface for storing JSON data in Redis
 * with support for:
 * - Size limits (by entry count or memory usage)
 * - TTL (time-to-live) for automatic expiration
 * - Multiple eviction policies (FIFO, LRU, LFU)
 * - Rotation mode for log/token storage
 * - Key prefix namespacing
 *
 * @example
 * ```typescript
 * import Redis from 'ioredis';
 * import { JsonRedisStorage } from 'json_redis_storage';
 *
 * const client = new Redis();
 * const storage = new JsonRedisStorage({
 *   redisClient: client,
 *   keyPrefix: 'myapp:cache:',
 *   maxEntries: 1000,
 *   ttl: 3600,
 * });
 *
 * // Save data
 * const key = await storage.save({ userId: '123', action: 'login' });
 *
 * // Load data
 * const data = await storage.load({ userId: '123', action: 'login' });
 * ```
 */
export class JsonRedisStorage {
  private client: RedisClientInterface;
  private keyPrefix: string;
  private hashKeys: string[];
  private defaultTtl: number | undefined;
  private evictionPolicy: EvictionPolicy;
  private limits: StorageLimits;
  private debug: boolean;
  private maxErrorHistory: number;

  private errorHistory: ErrorRecord[] = [];
  private lastError: ErrorRecord | null = null;
  private stats: StorageStats = {
    saves: 0,
    loads: 0,
    hits: 0,
    misses: 0,
    deletes: 0,
    evictions: 0,
    rotations: 0,
  };
  private closed = false;

  // Internal keys for metadata
  private metaKey: string;
  private orderKey: string;
  private accessKey: string;
  private freqKey: string;

  constructor(options: JsonRedisStorageOptions) {
    this.client = options.redisClient;
    this.keyPrefix = options.keyPrefix ?? "jrs:";
    this.hashKeys = options.hashKeys ?? [];
    this.defaultTtl = options.ttl;
    this.evictionPolicy = options.evictionPolicy ?? EvictionPolicy.FIFO;
    this.limits = {
      maxEntries: options.maxEntries,
      maxMemoryBytes: options.maxMemoryBytes,
      rotationSize: options.rotationSize,
    };
    this.debug = options.debug ?? false;
    this.maxErrorHistory = options.maxErrorHistory ?? 100;

    this.metaKey = `${this.keyPrefix}_meta`;
    this.orderKey = `${this.keyPrefix}_order`;
    this.accessKey = `${this.keyPrefix}_access`;
    this.freqKey = `${this.keyPrefix}_freq`;

    this.log(
      "info",
      `JsonRedisStorage initialized with prefix: ${this.keyPrefix}`
    );
  }

  // ---------------------------------------------------------------------------
  // Logging
  // ---------------------------------------------------------------------------

  private log(
    level: "debug" | "info" | "warn" | "error",
    message: string
  ): void {
    if (level === "debug" && !this.debug) return;

    const prefix = `[json_redis_storage ${level.toUpperCase()}]`;
    switch (level) {
      case "error":
        console.error(prefix, message);
        break;
      case "warn":
        console.warn(prefix, message);
        break;
      default:
        console.log(prefix, message);
    }
  }

  // ---------------------------------------------------------------------------
  // Key Generation
  // ---------------------------------------------------------------------------

  /**
   * Generate a storage key from data.
   *
   * If hashKeys is specified, only those keys are used in order.
   * Otherwise, all keys are used sorted alphabetically.
   */
  generateKey(data: Record<string, unknown>): string {
    let parts: string[];

    if (this.hashKeys.length > 0) {
      parts = this.hashKeys.map((k) => `${k}:${data[k] ?? ""}`);
    } else {
      parts = Object.keys(data)
        .sort()
        .map((k) => `${k}:${data[k] ?? ""}`);
    }

    const key = parts.join("|");
    this.log("debug", `Generated key: ${key}`);
    return key;
  }

  private keyToRedisKey(key: string): string {
    const hash = createHash("sha256").update(key).digest("hex").slice(0, 16);
    return `${this.keyPrefix}${hash}`;
  }

  // ---------------------------------------------------------------------------
  // Error Handling
  // ---------------------------------------------------------------------------

  private recordError(
    error: Error,
    operation: string,
    key?: string
  ): ErrorRecord {
    const record: ErrorRecord = {
      timestamp: new Date().toISOString(),
      operation,
      errorType: error.name,
      errorMessage: error.message,
      key,
    };

    this.errorHistory.push(record);
    this.lastError = record;

    if (this.errorHistory.length > this.maxErrorHistory) {
      this.errorHistory = this.errorHistory.slice(-this.maxErrorHistory);
    }

    this.log("error", `Error in ${operation}: ${error.message}`);
    return record;
  }

  getErrors(): ErrorRecord[] {
    return [...this.errorHistory];
  }

  getLastError(): ErrorRecord | null {
    return this.lastError;
  }

  clearErrors(): void {
    this.errorHistory = [];
    this.lastError = null;
  }

  // ---------------------------------------------------------------------------
  // Metadata Helpers
  // ---------------------------------------------------------------------------

  private isMetadataKey(key: string): boolean {
    return [this.metaKey, this.orderKey, this.accessKey, this.freqKey].includes(
      key
    );
  }

  // ---------------------------------------------------------------------------
  // Eviction Logic
  // ---------------------------------------------------------------------------

  private async getEntryCount(): Promise<number> {
    const pattern = `${this.keyPrefix}*`;
    let count = 0;
    let cursor = "0";

    do {
      const [newCursor, keys] = await this.client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = newCursor;
      count += keys.filter((k) => !this.isMetadataKey(k)).length;
    } while (cursor !== "0");

    return count;
  }

  private async getTotalMemory(): Promise<number> {
    if (!this.client.memory) return 0;

    const pattern = `${this.keyPrefix}*`;
    let total = 0;
    let cursor = "0";

    do {
      const [newCursor, keys] = await this.client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = newCursor;

      for (const key of keys) {
        if (!this.isMetadataKey(key)) {
          const mem = await this.client.memory("USAGE", key);
          if (mem) total += mem;
        }
      }
    } while (cursor !== "0");

    return total;
  }

  private async shouldEvict(): Promise<boolean> {
    if (this.limits.maxEntries !== undefined) {
      const count = await this.getEntryCount();
      if (count >= this.limits.maxEntries) return true;
    }

    if (this.limits.maxMemoryBytes !== undefined) {
      const memory = await this.getTotalMemory();
      if (memory >= this.limits.maxMemoryBytes) return true;
    }

    return false;
  }

  private async evictOne(): Promise<boolean> {
    let keyToEvict: string | undefined;

    if (this.evictionPolicy === EvictionPolicy.FIFO) {
      const orderData = await this.client.get(this.orderKey);
      if (orderData) {
        const orderList: string[] = JSON.parse(orderData);
        if (orderList.length > 0) {
          keyToEvict = orderList[0];
        }
      }
    } else if (this.evictionPolicy === EvictionPolicy.LRU) {
      const accessData = await this.client.get(this.accessKey);
      if (accessData) {
        const accessTimes: Record<string, number> = JSON.parse(accessData);
        const entries = Object.entries(accessTimes);
        if (entries.length > 0) {
          keyToEvict = entries.reduce((min, curr) =>
            curr[1] < min[1] ? curr : min
          )[0];
        }
      }
    } else if (this.evictionPolicy === EvictionPolicy.LFU) {
      const freqData = await this.client.get(this.freqKey);
      if (freqData) {
        const frequencies: Record<string, number> = JSON.parse(freqData);
        const entries = Object.entries(frequencies);
        if (entries.length > 0) {
          keyToEvict = entries.reduce((min, curr) =>
            curr[1] < min[1] ? curr : min
          )[0];
        }
      }
    }

    if (keyToEvict) {
      await this.deleteInternal(keyToEvict, true);
      this.stats.evictions++;
      this.log("debug", `Evicted key: ${keyToEvict}`);
      return true;
    }

    return false;
  }

  private async evictUntilWithinLimits(): Promise<number> {
    let evicted = 0;
    while (await this.shouldEvict()) {
      if (await this.evictOne()) {
        evicted++;
      } else {
        break;
      }
    }
    return evicted;
  }

  // ---------------------------------------------------------------------------
  // Metadata Management
  // ---------------------------------------------------------------------------

  private async addToOrder(redisKey: string): Promise<void> {
    const orderData = await this.client.get(this.orderKey);
    const orderList: string[] = orderData ? JSON.parse(orderData) : [];

    if (!orderList.includes(redisKey)) {
      orderList.push(redisKey);
      await this.client.set(this.orderKey, JSON.stringify(orderList));
    }
  }

  private async removeFromOrder(redisKey: string): Promise<void> {
    const orderData = await this.client.get(this.orderKey);
    if (orderData) {
      const orderList: string[] = JSON.parse(orderData);
      const index = orderList.indexOf(redisKey);
      if (index > -1) {
        orderList.splice(index, 1);
        await this.client.set(this.orderKey, JSON.stringify(orderList));
      }
    }
  }

  private async updateAccessTime(redisKey: string): Promise<void> {
    const accessData = await this.client.get(this.accessKey);
    const accessTimes: Record<string, number> = accessData
      ? JSON.parse(accessData)
      : {};

    accessTimes[redisKey] = Date.now() / 1000;
    await this.client.set(this.accessKey, JSON.stringify(accessTimes));
  }

  private async removeAccessTime(redisKey: string): Promise<void> {
    const accessData = await this.client.get(this.accessKey);
    if (accessData) {
      const accessTimes: Record<string, number> = JSON.parse(accessData);
      delete accessTimes[redisKey];
      await this.client.set(this.accessKey, JSON.stringify(accessTimes));
    }
  }

  private async incrementFrequency(redisKey: string): Promise<void> {
    const freqData = await this.client.get(this.freqKey);
    const frequencies: Record<string, number> = freqData
      ? JSON.parse(freqData)
      : {};

    frequencies[redisKey] = (frequencies[redisKey] ?? 0) + 1;
    await this.client.set(this.freqKey, JSON.stringify(frequencies));
  }

  private async removeFrequency(redisKey: string): Promise<void> {
    const freqData = await this.client.get(this.freqKey);
    if (freqData) {
      const frequencies: Record<string, number> = JSON.parse(freqData);
      delete frequencies[redisKey];
      await this.client.set(this.freqKey, JSON.stringify(frequencies));
    }
  }

  // ---------------------------------------------------------------------------
  // Core Operations
  // ---------------------------------------------------------------------------

  /**
   * Save JSON data to Redis.
   *
   * @param data - Dictionary to store
   * @param options - Save options (ttl, customKey)
   * @returns The storage key used
   */
  async save(
    data: Record<string, unknown>,
    options?: { ttl?: number; customKey?: string }
  ): Promise<string> {
    if (this.closed) {
      throw new JsonRedisStorageError("Storage is closed", {
        operation: "save",
      });
    }

    const key = options?.customKey ?? this.generateKey(data);
    const redisKey = this.keyToRedisKey(key);
    const effectiveTtl = options?.ttl ?? this.defaultTtl;

    try {
      // Evict if needed before saving
      await this.evictUntilWithinLimits();

      // Handle rotation mode
      if (this.limits.rotationSize !== undefined) {
        let count = await this.getEntryCount();
        while (count >= this.limits.rotationSize) {
          if (await this.evictOne()) {
            this.stats.rotations++;
            count--;
          } else {
            break;
          }
        }
      }

      // Create entry
      const now = Date.now() / 1000;
      const entry: StorageEntry = {
        key,
        data,
        createdAt: now,
        expiresAt: effectiveTtl ? now + effectiveTtl : null,
        accessCount: 0,
        lastAccessedAt: now,
      };

      // Serialize
      let jsonData: string;
      try {
        jsonData = JSON.stringify(entry);
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        this.recordError(error, "save", key);
        throw new JsonRedisStorageSerializationError(
          `Failed to serialize data: ${error.message}`,
          { operation: "save", key, originalError: error }
        );
      }

      // Save to Redis
      if (effectiveTtl) {
        await this.client.set(redisKey, jsonData, "EX", Math.floor(effectiveTtl));
      } else {
        await this.client.set(redisKey, jsonData);
      }

      // Update metadata for eviction tracking
      await this.addToOrder(redisKey);
      await this.updateAccessTime(redisKey);
      await this.incrementFrequency(redisKey);

      this.stats.saves++;
      this.log("debug", `Saved key: ${key} -> ${redisKey}`);
      return key;
    } catch (e) {
      if (e instanceof JsonRedisStorageError) throw e;

      const error = e instanceof Error ? e : new Error(String(e));
      this.recordError(error, "save", key);
      throw new JsonRedisStorageWriteError(
        `Failed to save data: ${error.message}`,
        { operation: "save", key, originalError: error }
      );
    }
  }

  /**
   * Load JSON data from Redis.
   *
   * @param dataOrKey - Dictionary to generate key from, or key string directly
   * @param options - Load options (ignoreExpiry)
   * @returns Stored data, or null if not found/expired
   */
  async load<T = Record<string, unknown>>(
    dataOrKey: Record<string, unknown> | string,
    options?: { ignoreExpiry?: boolean }
  ): Promise<T | null> {
    if (this.closed) {
      throw new JsonRedisStorageError("Storage is closed", {
        operation: "load",
      });
    }

    const key =
      typeof dataOrKey === "string" ? dataOrKey : this.generateKey(dataOrKey);
    const redisKey = this.keyToRedisKey(key);

    try {
      this.stats.loads++;

      const rawData = await this.client.get(redisKey);
      if (rawData === null) {
        this.stats.misses++;
        this.log("debug", `Key not found: ${key}`);
        return null;
      }

      // Deserialize
      let entry: StorageEntry<T>;
      try {
        entry = JSON.parse(rawData) as StorageEntry<T>;
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        this.recordError(error, "load", key);
        throw new JsonRedisStorageSerializationError(
          `Failed to deserialize data: ${error.message}`,
          { operation: "load", key, originalError: error }
        );
      }

      // Check expiration (backup check - Redis TTL should handle this)
      if (
        entry.expiresAt &&
        !options?.ignoreExpiry &&
        Date.now() / 1000 > entry.expiresAt
      ) {
        await this.delete(key);
        this.stats.misses++;
        this.log("debug", `Key expired: ${key}`);
        return null;
      }

      // Update access tracking for LRU/LFU
      await this.updateAccessTime(redisKey);
      await this.incrementFrequency(redisKey);

      this.stats.hits++;
      this.log("debug", `Loaded key: ${key}`);
      return entry.data;
    } catch (e) {
      if (e instanceof JsonRedisStorageError) throw e;

      const error = e instanceof Error ? e : new Error(String(e));
      this.recordError(error, "load", key);
      throw new JsonRedisStorageReadError(
        `Failed to load data: ${error.message}`,
        { operation: "load", key, originalError: error }
      );
    }
  }

  /**
   * Check if an entry exists and is not expired.
   */
  async exists(dataOrKey: Record<string, unknown> | string): Promise<boolean> {
    return (await this.load(dataOrKey)) !== null;
  }

  /**
   * Delete an entry from storage.
   */
  async delete(dataOrKey: Record<string, unknown> | string): Promise<boolean> {
    const key =
      typeof dataOrKey === "string" ? dataOrKey : this.generateKey(dataOrKey);
    return this.deleteInternal(key, false);
  }

  private async deleteInternal(
    key: string,
    isEviction: boolean
  ): Promise<boolean> {
    if (this.closed) {
      throw new JsonRedisStorageError("Storage is closed", {
        operation: "delete",
      });
    }

    const redisKey = this.keyToRedisKey(key);

    try {
      const result = await this.client.del(redisKey);

      if (result > 0) {
        await this.removeFromOrder(redisKey);
        await this.removeAccessTime(redisKey);
        await this.removeFrequency(redisKey);

        if (!isEviction) {
          this.stats.deletes++;
        }
        this.log("debug", `Deleted key: ${key}`);
        return true;
      }

      return false;
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      this.recordError(error, "delete", key);
      throw new JsonRedisStorageError(`Failed to delete data: ${error.message}`, {
        operation: "delete",
        key,
        originalError: error,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Batch Operations
  // ---------------------------------------------------------------------------

  /**
   * Remove all entries from storage.
   * @returns Number of entries deleted
   */
  async clear(): Promise<number> {
    if (this.closed) {
      throw new JsonRedisStorageError("Storage is closed", {
        operation: "clear",
      });
    }

    const pattern = `${this.keyPrefix}*`;
    let deleted = 0;
    let cursor = "0";

    try {
      do {
        const [newCursor, keys] = await this.client.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100
        );
        cursor = newCursor;

        if (keys.length > 0) {
          const result = await this.client.del(...keys);
          deleted += result;
        }
      } while (cursor !== "0");

      this.log("info", `Cleared ${deleted} entries`);
      return deleted;
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      this.recordError(error, "clear");
      throw new JsonRedisStorageError(
        `Failed to clear storage: ${error.message}`,
        { operation: "clear", originalError: error }
      );
    }
  }

  /**
   * List all stored keys.
   * @returns List of storage keys (not Redis keys)
   */
  async listKeys(): Promise<string[]> {
    if (this.closed) {
      throw new JsonRedisStorageError("Storage is closed", {
        operation: "listKeys",
      });
    }

    const pattern = `${this.keyPrefix}*`;
    const keys: string[] = [];
    let cursor = "0";

    try {
      do {
        const [newCursor, redisKeys] = await this.client.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100
        );
        cursor = newCursor;

        for (const redisKey of redisKeys) {
          if (this.isMetadataKey(redisKey)) continue;

          const rawData = await this.client.get(redisKey);
          if (rawData) {
            try {
              const entry = JSON.parse(rawData) as StorageEntry;
              if (entry.key) {
                keys.push(entry.key);
              }
            } catch {
              // Skip invalid entries
            }
          }
        }
      } while (cursor !== "0");

      return keys;
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      this.recordError(error, "listKeys");
      throw new JsonRedisStorageError(
        `Failed to list keys: ${error.message}`,
        { operation: "listKeys", originalError: error }
      );
    }
  }

  /**
   * Remove all expired entries.
   * @returns Number of entries deleted
   */
  async cleanupExpired(): Promise<number> {
    if (this.closed) {
      throw new JsonRedisStorageError("Storage is closed", {
        operation: "cleanupExpired",
      });
    }

    const pattern = `${this.keyPrefix}*`;
    let deleted = 0;
    let cursor = "0";
    const now = Date.now() / 1000;

    try {
      do {
        const [newCursor, redisKeys] = await this.client.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100
        );
        cursor = newCursor;

        for (const redisKey of redisKeys) {
          if (this.isMetadataKey(redisKey)) continue;

          const rawData = await this.client.get(redisKey);
          if (rawData) {
            try {
              const entry = JSON.parse(rawData) as StorageEntry;
              if (entry.expiresAt && now > entry.expiresAt && entry.key) {
                await this.deleteInternal(entry.key, false);
                deleted++;
              }
            } catch {
              // Skip invalid entries
            }
          }
        }
      } while (cursor !== "0");

      this.log("info", `Cleaned up ${deleted} expired entries`);
      return deleted;
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      this.recordError(error, "cleanupExpired");
      throw new JsonRedisStorageError(
        `Failed to cleanup expired entries: ${error.message}`,
        { operation: "cleanupExpired", originalError: error }
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Mark storage as closed.
   */
  async close(): Promise<void> {
    this.closed = true;
    this.log("info", "JsonRedisStorage closed");
  }

  // ---------------------------------------------------------------------------
  // Diagnostics
  // ---------------------------------------------------------------------------

  /**
   * Get comprehensive debug information.
   */
  async debugInfo(): Promise<Record<string, unknown>> {
    const entryCount = await this.getEntryCount();
    let memoryUsage = 0;
    if (this.limits.maxMemoryBytes !== undefined) {
      memoryUsage = await this.getTotalMemory();
    }

    return {
      keyPrefix: this.keyPrefix,
      hashKeys: this.hashKeys,
      ttl: this.defaultTtl,
      evictionPolicy: this.evictionPolicy,
      limits: {
        maxEntries: this.limits.maxEntries,
        maxMemoryBytes: this.limits.maxMemoryBytes,
        rotationSize: this.limits.rotationSize,
      },
      entryCount,
      memoryUsageBytes: memoryUsage,
      stats: { ...this.stats },
      errorCount: this.errorHistory.length,
      lastError: this.lastError,
      errors: this.errorHistory.slice(-10),
      closed: this.closed,
    };
  }
}
