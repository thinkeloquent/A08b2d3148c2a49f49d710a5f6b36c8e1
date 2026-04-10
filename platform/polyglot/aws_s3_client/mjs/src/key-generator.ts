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
 * @param data - Object to generate key from
 * @param hashKeys - Optional list of specific keys to use for hashing.
 *                   If undefined, all keys are used (sorted alphabetically).
 * @returns 16-character hexadecimal key
 *
 * @example
 * ```typescript
 * generateKey({ user_id: 123, name: "Alice" });
 * // => 'a1b2c3d4e5f67890'
 *
 * generateKey({ user_id: 123, name: "Alice" }, ["user_id"]);
 * // => 'f0e1d2c3b4a59876'
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
 *
 * @param keyString - Pre-built key string
 * @returns 16-character hexadecimal key
 */
export function generateKeyString(keyString: string): string {
  const hash = createHash("sha256").update(keyString, "utf8").digest("hex");
  return hash.slice(0, 16);
}
