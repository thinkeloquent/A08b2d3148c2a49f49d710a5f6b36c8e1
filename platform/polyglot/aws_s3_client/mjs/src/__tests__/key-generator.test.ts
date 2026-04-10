/**
 * Tests for key generation.
 */

import { describe, it, expect } from "vitest";
import { generateKey } from "../key-generator.js";

describe("generateKey", () => {
  it("generates 16 char hex key", () => {
    const key = generateKey({ name: "Alice" });
    expect(key).toHaveLength(16);
    expect(/^[0-9a-f]+$/.test(key)).toBe(true);
  });

  it("is deterministic", () => {
    const data = { user_id: 123, name: "Alice" };
    const key1 = generateKey(data);
    const key2 = generateKey(data);
    expect(key1).toBe(key2);
  });

  it("produces different keys for different data", () => {
    const key1 = generateKey({ name: "Alice" });
    const key2 = generateKey({ name: "Bob" });
    expect(key1).not.toBe(key2);
  });

  it("is key order independent", () => {
    const key1 = generateKey({ a: 1, b: 2 });
    const key2 = generateKey({ b: 2, a: 1 });
    expect(key1).toBe(key2);
  });

  it("respects hashKeys filter", () => {
    const data = { user_id: 123, name: "Alice", timestamp: 12345 };
    const keyAll = generateKey(data);
    const keyFiltered = generateKey(data, ["user_id", "name"]);
    expect(keyAll).not.toBe(keyFiltered);
  });

  it("hashKeys order matters", () => {
    const data = { a: 1, b: 2 };
    const key1 = generateKey(data, ["a", "b"]);
    const key2 = generateKey(data, ["b", "a"]);
    expect(key1).not.toBe(key2);
  });

  it("handles nested objects", () => {
    const data = { user: { name: "Alice", age: 30 } };
    const key = generateKey(data);
    expect(key).toHaveLength(16);
  });

  it("handles arrays", () => {
    const data = { tags: ["python", "aws", "s3"] };
    const key = generateKey(data);
    expect(key).toHaveLength(16);
  });

  it("handles null values", () => {
    const data = { name: "Alice", email: null };
    const key = generateKey(data);
    expect(key).toHaveLength(16);
  });

  it("handles boolean values", () => {
    const data = { active: true, verified: false };
    const key = generateKey(data);
    expect(key).toHaveLength(16);
  });

  it("handles numeric values", () => {
    const data = { count: 42, rate: 3.14 };
    const key = generateKey(data);
    expect(key).toHaveLength(16);
  });
});
