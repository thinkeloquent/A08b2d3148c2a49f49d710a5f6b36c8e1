/**
 * Tests for key generation utilities.
 */

import { describe, expect, it } from "vitest";

import { generateKey } from "../key-generator.js";

describe("generateKey", () => {
  it("generates deterministic key", () => {
    const data = { user_id: 123, name: "Alice" };

    const key1 = generateKey(data);
    const key2 = generateKey(data);

    expect(key1).toBe(key2);
    expect(key1).toHaveLength(16);
  });

  it("generates different keys for different data", () => {
    const data1 = { user_id: 123, name: "Alice" };
    const data2 = { user_id: 456, name: "Bob" };

    const key1 = generateKey(data1);
    const key2 = generateKey(data2);

    expect(key1).not.toBe(key2);
  });

  it("uses all keys sorted by default", () => {
    const data1 = { b: 2, a: 1 };
    const data2 = { a: 1, b: 2 };

    const key1 = generateKey(data1);
    const key2 = generateKey(data2);

    // Same keys, same values, same result regardless of order
    expect(key1).toBe(key2);
  });

  it("uses only specified hashKeys", () => {
    const data = { user_id: 123, name: "Alice", email: "alice@example.com" };

    const keyAll = generateKey(data);
    const keyPartial = generateKey(data, ["user_id"]);

    expect(keyAll).not.toBe(keyPartial);
  });

  it("hashKeys order matters", () => {
    const data = { a: 1, b: 2 };

    const key1 = generateKey(data, ["a", "b"]);
    const key2 = generateKey(data, ["b", "a"]);

    expect(key1).not.toBe(key2);
  });

  it("handles empty object", () => {
    const data = {};

    const key = generateKey(data);

    expect(key).toHaveLength(16);
    expect(/^[a-f0-9]+$/.test(key)).toBe(true);
  });

  it("handles null values", () => {
    const data = { user_id: 123, optional: null };

    const key = generateKey(data);

    expect(key).toHaveLength(16);
  });

  it("handles undefined values", () => {
    const data = { user_id: 123, optional: undefined };

    const key = generateKey(data);

    expect(key).toHaveLength(16);
  });

  it("handles nested objects", () => {
    const data = { user: { id: 123, name: "Alice" }, active: true };

    const key1 = generateKey(data);
    const key2 = generateKey(data);

    expect(key1).toBe(key2);
    expect(key1).toHaveLength(16);
  });

  it("handles arrays", () => {
    const data = { items: [1, 2, 3], name: "test" };

    const key1 = generateKey(data);
    const key2 = generateKey(data);

    expect(key1).toBe(key2);
  });

  it("handles boolean values", () => {
    const data1 = { active: true };
    const data2 = { active: false };

    const key1 = generateKey(data1);
    const key2 = generateKey(data2);

    expect(key1).not.toBe(key2);
  });

  it("handles numeric values", () => {
    const dataInt = { value: 42 };
    const dataFloat = { value: 42.5 };

    const keyInt = generateKey(dataInt);
    const keyFloat = generateKey(dataFloat);

    expect(keyInt).toHaveLength(16);
    expect(keyFloat).toHaveLength(16);
  });

  it("handles missing hashKeys", () => {
    const data = { user_id: 123 };

    const key = generateKey(data, ["user_id", "missing_key"]);

    expect(key).toHaveLength(16);
  });

  it("produces valid hexadecimal", () => {
    const data = { test: "value" };

    const key = generateKey(data);

    // Should be valid hex
    expect(() => parseInt(key, 16)).not.toThrow();
    expect(/^[a-f0-9]+$/.test(key)).toBe(true);
  });
});
