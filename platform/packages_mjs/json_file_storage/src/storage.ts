/**
 * JsonFileStorage - File-based JSON storage with hash-based filenames.
 *
 * Provides persistent JSON storage to the local filesystem with configurable
 * key-based filename hashing.
 */

import { createHash } from "crypto";
import { mkdir, readFile, readdir, unlink, writeFile, access } from "fs/promises";
import { constants } from "fs";
import { join, resolve } from "path";

/**
 * Error record for tracking storage errors.
 */
export interface ErrorRecord {
  timestamp: string;
  operation: string;
  errorType: string;
  errorMessage: string;
  key?: string;
  filepath?: string;
}

/**
 * Options for JsonFileStorageError constructor.
 */
export interface JsonFileStorageErrorOptions {
  operation?: string;
  key?: string;
  filepath?: string;
  originalError?: Error;
}

/**
 * Base error class for JsonFileStorage.
 */
export class JsonFileStorageError extends Error {
  operation?: string;
  key?: string;
  filepath?: string;
  originalError?: Error;

  constructor(message: string, options?: JsonFileStorageErrorOptions) {
    super(message);
    this.name = "JsonFileStorageError";
    this.operation = options?.operation;
    this.key = options?.key;
    this.filepath = options?.filepath;
    this.originalError = options?.originalError;
  }

  toString(): string {
    const parts = [this.message];
    if (this.operation) parts.push(`operation=${this.operation}`);
    if (this.key) parts.push(`key=${this.key.slice(0, 50)}...`);
    if (this.filepath) parts.push(`filepath=${this.filepath}`);
    if (this.originalError) {
      parts.push(`caused_by=${this.originalError.name}: ${this.originalError.message}`);
    }
    return parts.join(" | ");
  }
}

export class JsonFileStorageReadError extends JsonFileStorageError {
  constructor(message: string, options?: JsonFileStorageErrorOptions) {
    super(message, options);
    this.name = "JsonFileStorageReadError";
  }
}

export class JsonFileStorageWriteError extends JsonFileStorageError {
  constructor(message: string, options?: JsonFileStorageErrorOptions) {
    super(message, options);
    this.name = "JsonFileStorageWriteError";
  }
}

export class JsonFileStorageSerializationError extends JsonFileStorageError {
  constructor(message: string, options?: JsonFileStorageErrorOptions) {
    super(message, options);
    this.name = "JsonFileStorageSerializationError";
  }
}

/**
 * Storage entry structure.
 */
export interface StorageEntry<T = Record<string, unknown>> {
  key: string;
  data: T;
  createdAt: number;
  expiresAt: number | null;
}

/**
 * Storage statistics.
 */
export interface StorageStats {
  saves: number;
  loads: number;
  hits: number;
  misses: number;
  deletes: number;
}

/**
 * Configuration options for JsonFileStorage.
 */
export interface JsonFileStorageOptions {
  /** Directory to store files (default: ".data") */
  saveToDirectory?: string;
  /** Keys to use for generating filename hash */
  fileNameHashKeys?: string[];
  /** Time-to-live in seconds (default: undefined - no expiry) */
  ttl?: number;
  /** File extension (default: ".json") */
  fileExtension?: string;
  /** Create directory if not exists (default: true) */
  createDir?: boolean;
  /** Enable debug logging (default: false) */
  debug?: boolean;
  /** Maximum error history size (default: 100) */
  maxErrorHistory?: number;
}

/**
 * File-based JSON storage with hash-based filenames.
 *
 * @example
 * ```typescript
 * import { JsonFileStorage } from 'json_file_storage';
 *
 * const storage = new JsonFileStorage({
 *   saveToDirectory: '.data/cache',
 *   fileNameHashKeys: ['userId', 'action'],
 *   ttl: 3600,
 *   debug: true,
 * });
 *
 * await storage.init();
 *
 * // Save data
 * await storage.save({ userId: '123', action: 'login', data: {...} });
 *
 * // Load data
 * const data = await storage.load({ userId: '123', action: 'login' });
 *
 * await storage.close();
 * ```
 */
export class JsonFileStorage {
  private saveToDirectory: string;
  private fileNameHashKeys: string[];
  private ttl: number | undefined;
  private fileExtension: string;
  private debug: boolean;
  private maxErrorHistory: number;
  private errorHistory: ErrorRecord[] = [];
  private lastError: ErrorRecord | null = null;
  private _closed = false;
  private initialized = false;
  private stats: StorageStats = {
    saves: 0,
    loads: 0,
    hits: 0,
    misses: 0,
    deletes: 0,
  };

  constructor(options: JsonFileStorageOptions = {}) {
    this.saveToDirectory = resolve(options.saveToDirectory ?? ".data");
    this.fileNameHashKeys = options.fileNameHashKeys ?? [];
    this.ttl = options.ttl;
    this.fileExtension = options.fileExtension ?? ".json";
    this.debug = options.debug ?? false;
    this.maxErrorHistory = options.maxErrorHistory ?? 100;

    this.log("debug", `Initializing JsonFileStorage: directory=${this.saveToDirectory}`);
    this.log("debug", `Hash keys: ${this.fileNameHashKeys.join(", ")}`);
  }

  /**
   * Initialize the storage (create directory if needed).
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await mkdir(this.saveToDirectory, { recursive: true });
      this.log("debug", `Directory created/verified: ${this.saveToDirectory}`);
    } catch (err) {
      const error = new JsonFileStorageError(`Failed to create directory: ${err}`, {
        operation: "init",
        filepath: this.saveToDirectory,
        originalError: err instanceof Error ? err : undefined,
      });
      this.recordError(error, "init");
      throw error;
    }

    // Verify directory is writable
    try {
      await access(this.saveToDirectory, constants.W_OK);
    } catch (err) {
      const error = new JsonFileStorageError(
        `Directory is not writable: ${this.saveToDirectory}`,
        {
          operation: "init",
          filepath: this.saveToDirectory,
          originalError: err instanceof Error ? err : undefined,
        }
      );
      this.recordError(error, "init");
      throw error;
    }

    this.initialized = true;
    this.log(
      "info",
      `JsonFileStorage initialized: ${this.saveToDirectory} (hashKeys=[${this.fileNameHashKeys.join(", ")}], ttl=${this.ttl}s)`
    );
  }

  private log(level: "debug" | "info" | "warn" | "error", message: string): void {
    if (!this.debug && level === "debug") return;

    const prefix = `[json_file_storage ${level.toUpperCase()}]`;
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

  private recordError(
    error: Error,
    operation: string,
    key?: string,
    filepath?: string
  ): ErrorRecord {
    const record: ErrorRecord = {
      timestamp: new Date().toISOString(),
      operation,
      errorType: error.name,
      errorMessage: error.message,
      key,
      filepath,
    };

    this.errorHistory.push(record);
    this.lastError = record;

    if (this.errorHistory.length > this.maxErrorHistory) {
      this.errorHistory = this.errorHistory.slice(-this.maxErrorHistory);
    }

    this.log("error", `Error recorded: ${operation} | ${error.name}: ${error.message}`);
    return record;
  }

  /**
   * Generate a storage key from data using specified hash keys.
   */
  generateKey(data: Record<string, unknown>): string {
    let keyParts: string[];

    if (this.fileNameHashKeys.length === 0) {
      // If no hash keys specified, use all keys sorted
      keyParts = Object.entries(data)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`);
    } else {
      // Use only specified keys in order
      keyParts = this.fileNameHashKeys.map((key) => {
        const value = data[key] ?? "";
        return `${key}:${value}`;
      });
    }

    const keyString = keyParts.join("|");
    this.log("debug", `Generated key string: ${keyString}`);
    return keyString;
  }

  private keyToFilename(key: string): string {
    const hash = createHash("sha256").update(key).digest("hex").slice(0, 16);
    const filepath = join(this.saveToDirectory, `${hash}${this.fileExtension}`);
    this.log("debug", `Key '${key.slice(0, 50)}...' -> ${hash}${this.fileExtension}`);
    return filepath;
  }

  /**
   * Save JSON data to a file.
   *
   * @param data - Dictionary to save
   * @param options - Save options
   * @returns The generated filename (without path)
   */
  async save(
    data: Record<string, unknown>,
    options?: { ttl?: number; customKey?: string }
  ): Promise<string> {
    if (!this.initialized) await this.init();

    const key = options?.customKey ?? this.generateKey(data);
    const filepath = this.keyToFilename(key);
    this.log("info", `SAVE: key=${key.slice(0, 50)}... -> ${filepath}`);

    const now = Date.now() / 1000;
    const effectiveTtl = options?.ttl ?? this.ttl;
    const expiresAt = effectiveTtl ? now + effectiveTtl : null;

    const entry: StorageEntry = {
      key,
      data,
      createdAt: now,
      expiresAt,
    };

    let jsonData: string;
    try {
      jsonData = JSON.stringify(entry, null, 2);
      this.log("info", `Serialized ${jsonData.length} bytes, writing to ${filepath}`);
    } catch (err) {
      const error = new JsonFileStorageSerializationError(`Failed to serialize data: ${err}`, {
        operation: "save",
        key,
        filepath,
        originalError: err instanceof Error ? err : undefined,
      });
      this.recordError(error, "save", key, filepath);
      throw error;
    }

    try {
      await writeFile(filepath, jsonData, "utf-8");
    } catch (err) {
      const error = new JsonFileStorageWriteError(`Failed to write file: ${err}`, {
        operation: "save",
        key,
        filepath,
        originalError: err instanceof Error ? err : undefined,
      });
      this.recordError(error, "save", key, filepath);
      throw error;
    }

    this.stats.saves++;
    const filename = filepath.split("/").pop() ?? filepath;
    this.log("info", `SUCCESS: File created: ${filename} (${jsonData.length} bytes)`);
    return filename;
  }

  /**
   * Load JSON data from a file.
   *
   * @param dataOrKey - Either a dict (to generate key from) or a string key
   * @param options - Load options
   * @returns The stored data, or null if not found/expired
   */
  async load<T = Record<string, unknown>>(
    dataOrKey: Record<string, unknown> | string,
    options?: { ignoreExpiry?: boolean }
  ): Promise<T | null> {
    if (!this.initialized) await this.init();

    const key = typeof dataOrKey === "string" ? dataOrKey : this.generateKey(dataOrKey);
    const filepath = this.keyToFilename(key);
    this.log("debug", `LOAD: key=${key.slice(0, 50)}... -> ${filepath}`);
    this.stats.loads++;

    let content: string;
    try {
      content = await readFile(filepath, "utf-8");
      this.log("debug", `Read ${content.length} bytes from ${filepath}`);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        this.log("debug", `MISS (not found): ${filepath}`);
        this.stats.misses++;
        return null;
      }

      const error = new JsonFileStorageReadError(`Failed to read file: ${err}`, {
        operation: "load",
        key,
        filepath,
        originalError: err instanceof Error ? err : undefined,
      });
      this.recordError(error, "load", key, filepath);
      this.stats.misses++;
      throw error;
    }

    let entry: StorageEntry<T>;
    try {
      entry = JSON.parse(content);
    } catch (err) {
      const error = new JsonFileStorageSerializationError(`JSON parse error: ${err}`, {
        operation: "load",
        key,
        filepath,
        originalError: err instanceof Error ? err : undefined,
      });
      this.recordError(error, "load", key, filepath);
      this.stats.misses++;
      throw error;
    }

    // Check expiry
    if (entry.expiresAt && !options?.ignoreExpiry) {
      const now = Date.now() / 1000;
      if (now > entry.expiresAt) {
        this.log("debug", `MISS (expired): ${key.slice(0, 50)}...`);
        await this.delete(key);
        this.stats.misses++;
        return null;
      }
    }

    const ttlRemaining = entry.expiresAt ? Math.max(0, entry.expiresAt - Date.now() / 1000) : null;
    this.log("debug", `HIT: ${key.slice(0, 50)}... (ttl remaining: ${ttlRemaining}s)`);
    this.stats.hits++;
    return entry.data;
  }

  /**
   * Check if data exists and is not expired.
   */
  async exists(dataOrKey: Record<string, unknown> | string): Promise<boolean> {
    const result = await this.load(dataOrKey);
    return result !== null;
  }

  /**
   * Delete a stored file.
   */
  async delete(dataOrKey: Record<string, unknown> | string): Promise<boolean> {
    if (!this.initialized) await this.init();

    const key = typeof dataOrKey === "string" ? dataOrKey : this.generateKey(dataOrKey);
    const filepath = this.keyToFilename(key);
    this.log("debug", `DELETE: key=${key.slice(0, 50)}... -> ${filepath}`);

    try {
      await unlink(filepath);
      this.stats.deletes++;
      this.log("info", `DELETED: ${filepath.split("/").pop()}`);
      return true;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        this.log("debug", `DELETE skipped (not found): ${filepath}`);
        return false;
      }

      const error = new JsonFileStorageError(`Failed to delete file: ${err}`, {
        operation: "delete",
        key,
        filepath,
        originalError: err instanceof Error ? err : undefined,
      });
      this.recordError(error, "delete", key, filepath);
      throw error;
    }
  }

  /**
   * Remove all storage files.
   */
  async clear(): Promise<number> {
    if (!this.initialized) await this.init();

    this.log("debug", "CLEAR: Removing all storage files");
    let count = 0;
    const errors: ErrorRecord[] = [];

    const files = await readdir(this.saveToDirectory);
    for (const file of files) {
      if (!file.endsWith(this.fileExtension)) continue;

      const filepath = join(this.saveToDirectory, file);
      try {
        await unlink(filepath);
        count++;
      } catch (err) {
        const record = this.recordError(
          err instanceof Error ? err : new Error(String(err)),
          "clear",
          undefined,
          filepath
        );
        errors.push(record);
      }
    }

    this.log("info", `CLEAR complete: ${count} files removed, ${errors.length} errors`);

    if (errors.length > 0 && count === 0) {
      throw new JsonFileStorageError(`clear failed with ${errors.length} errors`, {
        operation: "clear",
      });
    }

    return count;
  }

  /**
   * List all stored keys.
   */
  async listKeys(): Promise<string[]> {
    if (!this.initialized) await this.init();

    this.log("debug", "LIST_KEYS: Reading all stored keys");
    const keys: string[] = [];
    const errors: ErrorRecord[] = [];

    const files = await readdir(this.saveToDirectory);
    for (const file of files) {
      if (!file.endsWith(this.fileExtension)) continue;

      const filepath = join(this.saveToDirectory, file);
      try {
        const content = await readFile(filepath, "utf-8");
        const data = JSON.parse(content);
        keys.push(data.key ?? file.replace(this.fileExtension, ""));
      } catch (err) {
        this.recordError(
          err instanceof Error ? err : new Error(String(err)),
          "listKeys",
          undefined,
          filepath
        );
        errors.push(this.lastError!);
      }
    }

    this.log("debug", `LIST_KEYS: found ${keys.length} keys, ${errors.length} errors`);
    return keys;
  }

  /**
   * Remove expired entries.
   */
  async cleanupExpired(): Promise<number> {
    if (!this.initialized) await this.init();

    this.log("debug", "CLEANUP: Starting expired entry cleanup");
    let removed = 0;
    const now = Date.now() / 1000;
    const errors: ErrorRecord[] = [];

    const files = await readdir(this.saveToDirectory);
    for (const file of files) {
      if (!file.endsWith(this.fileExtension)) continue;

      const filepath = join(this.saveToDirectory, file);
      try {
        const content = await readFile(filepath, "utf-8");
        const data = JSON.parse(content);
        if (data.expiresAt && data.expiresAt < now) {
          await unlink(filepath);
          removed++;
          this.log("debug", `Expired: ${file}`);
        }
      } catch (err) {
        this.recordError(
          err instanceof Error ? err : new Error(String(err)),
          "cleanupExpired",
          undefined,
          filepath
        );
        errors.push(this.lastError!);
      }
    }

    this.log("info", `CLEANUP complete: ${removed} expired entries removed, ${errors.length} errors`);
    return removed;
  }

  /**
   * Close the storage.
   */
  async close(): Promise<void> {
    this.log("debug", "Closing JsonFileStorage");
    this._closed = true;
    this.log("info", "JsonFileStorage closed");
  }

  /**
   * Get all recorded errors.
   */
  getErrors(): ErrorRecord[] {
    return [...this.errorHistory];
  }

  /**
   * Get the last recorded error.
   */
  getLastError(): ErrorRecord | null {
    return this.lastError;
  }

  /**
   * Clear the error history.
   */
  clearErrors(): void {
    this.errorHistory = [];
    this.lastError = null;
  }

  /**
   * Get debug information about the storage.
   */
  async debugInfo(): Promise<Record<string, unknown>> {
    let fileCount = 0;
    let files: string[] = [];

    try {
      const allFiles = await readdir(this.saveToDirectory);
      files = allFiles.filter((f) => f.endsWith(this.fileExtension)).slice(0, 10);
      fileCount = allFiles.filter((f) => f.endsWith(this.fileExtension)).length;
    } catch {
      // Directory might not exist yet
    }

    return {
      saveToDirectory: this.saveToDirectory,
      directoryExists: this.initialized,
      fileNameHashKeys: this.fileNameHashKeys,
      ttl: this.ttl,
      fileExtension: this.fileExtension,
      fileCount,
      files,
      stats: { ...this.stats },
      errorCount: this.errorHistory.length,
      lastError: this.lastError,
      errors: this.errorHistory.slice(-10),
      closed: this._closed,
    };
  }
}
