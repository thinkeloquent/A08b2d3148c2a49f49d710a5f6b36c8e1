/**
 * Key Generation Utilities
 *
 * Provides deterministic SHA256-based key generation for storage entries.
 * Ensures cross-language parity with the Python implementation.
 */

import { createHash } from "node:crypto";

/**
 * Serialize a value to string for key generation.
 *
 * Handles nested objects by JSON serialization with sorted keys.
 */
function serializeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    // Use JSON with sorted keys for deterministic output
    return JSON.stringify(value, Object.keys(value as object).sort());
  }
  return String(value);
}

/**
 * Generate a deterministic storage key from data.
 *
 * Uses SHA256 hash with 16-character hex output for uniqueness.
 * Key generation is deterministic: same input always produces same output.
 *
 * @param data - Object of data to generate key from
 * @param hashKeys - Optional array of specific keys to use for hashing.
 *                   If undefined, all keys are used (sorted alphabetically).
 * @returns 16-character hexadecimal key
 *
 * @example
 * ```typescript
 * generateKey({ user_id: 123, name: "Alice" })
 * // => "a1b2c3d4e5f67890"
 *
 * generateKey({ user_id: 123, name: "Alice" }, ["user_id"])
 * // => "f0e1d2c3b4a59876"
 * ```
 */
export function generateKey(
  data: Record<string, unknown>,
  hashKeys?: string[]
): string {
  let parts: string[];

  if (hashKeys && hashKeys.length > 0) {
    // Use only specified keys in order
    parts = hashKeys.map((k) => `${k}:${serializeValue(data[k])}`);
  } else {
    // Use all keys sorted alphabetically
    const sortedKeys = Object.keys(data).sort();
    parts = sortedKeys.map((k) => `${k}:${serializeValue(data[k])}`);
  }

  // Join with pipe separator
  const keyString = parts.join("|");

  // Generate SHA256 hash and take first 16 characters
  const hash = createHash("sha256").update(keyString, "utf8").digest("hex");
  return hash.slice(0, 16);
}

/**
 * Generate a storage key from a pre-built key string.
 *
 * Useful when the caller has already constructed the key string.
 */
export function generateKeyString(keyString: string): string {
  const hash = createHash("sha256").update(keyString, "utf8").digest("hex");
  return hash.slice(0, 16);
}

/**
 * Generate a storage key from object value hash.
 *
 * Hashes the entire object (all keys and values) to create a deterministic key.
 * Useful for content-addressable storage where the same data always produces
 * the same key.
 *
 * @param data - Object to hash
 * @returns 16-character hexadecimal key
 *
 * @example
 * ```typescript
 * const key = generateKeyFromValue({ name: "Alice", score: 100 });
 * await storage.save(key, { name: "Alice", score: 100 });
 * ```
 */
export function generateKeyFromValue(data: Record<string, unknown>): string {
  // Sort keys recursively and serialize to JSON for deterministic output
  const sortedJson = JSON.stringify(data, Object.keys(data).sort());
  const hash = createHash("sha256").update(sortedJson, "utf8").digest("hex");
  return hash.slice(0, 16);
}

/**
 * Generate a storage key from specific object fields.
 *
 * Extracts specified fields from the object and hashes them. Useful when
 * you want to key by certain fields (like userId, sessionId) regardless
 * of other data in the object.
 *
 * @param data - Object containing the fields
 * @param fields - Array of field names to use for key generation
 * @returns 16-character hexadecimal key
 *
 * @example
 * ```typescript
 * const key = generateKeyFromFields(
 *   { userId: 123, action: "login", timestamp: Date.now() },
 *   ["userId", "action"]
 * );
 * // Key is based only on userId and action, not timestamp
 * ```
 */
export function generateKeyFromFields(
  data: Record<string, unknown>,
  fields: string[]
): string {
  return generateKey(data, fields);
}
