/**
 * Unit tests for key-generator module.
 *
 * Tests cover:
 * - Statement coverage for all code paths
 * - Branch coverage for all conditionals
 * - Boundary value analysis
 * - Cross-language parity verification
 */

import { describe, expect, it } from "vitest";
import { generateKey } from "../src/key-generator.js";

describe("generateKey", () => {
  // ===========================================================================
  // Statement Coverage
  // ===========================================================================

  describe("Statement Coverage", () => {
    it("generates deterministic key", () => {
      const data = { user_id: 123, name: "Alice" };

      const key1 = generateKey(data);
      const key2 = generateKey(data);

      expect(key1).toBe(key2);
      expect(key1).toHaveLength(16);
    });

    it("produces valid hexadecimal", () => {
      const data = { test: "value" };

      const key = generateKey(data);

      expect(key).toHaveLength(16);
      expect(/^[a-f0-9]+$/.test(key)).toBe(true);
    });
  });

  // ===========================================================================
  // Branch Coverage
  // ===========================================================================

  describe("Branch Coverage", () => {
    it("uses all keys sorted by default (no hashKeys)", () => {
      const data1 = { b: 2, a: 1 };
      const data2 = { a: 1, b: 2 };

      const key1 = generateKey(data1);
      const key2 = generateKey(data2);

      // Same keys, same values, same result regardless of order
      expect(key1).toBe(key2);
    });

    it("uses only specified hashKeys when provided", () => {
      const data = { user_id: 123, name: "Alice", email: "alice@example.com" };

      const keyAll = generateKey(data);
      const keyPartial = generateKey(data, ["user_id"]);

      expect(keyAll).not.toBe(keyPartial);
    });

    it("respects hashKeys order", () => {
      const data = { a: 1, b: 2 };

      const key1 = generateKey(data, ["a", "b"]);
      const key2 = generateKey(data, ["b", "a"]);

      expect(key1).not.toBe(key2);
    });
  });

  // ===========================================================================
  // Boundary Value Analysis
  // ===========================================================================

  describe("Boundary Values", () => {
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
      expect(keyInt).not.toBe(keyFloat);
    });

    it("handles missing hashKeys gracefully", () => {
      const data = { user_id: 123 };

      const key = generateKey(data, ["user_id", "missing_key"]);

      expect(key).toHaveLength(16);
    });
  });

  // ===========================================================================
  // Error Handling
  // ===========================================================================

  describe("Error Handling", () => {
    it("generates consistent keys for edge case data", () => {
      const edgeCases = [
        { special: "chars!@#$%^&*()" },
        { unicode: "你好世界" },
        { empty_string: "" },
        { zero: 0 },
        { negative: -1 },
      ];

      for (const data of edgeCases) {
        const key1 = generateKey(data);
        const key2 = generateKey(data);
        expect(key1).toBe(key2);
        expect(key1).toHaveLength(16);
      }
    });
  });

  // ===========================================================================
  // Cross-Language Parity
  // ===========================================================================

  describe("Cross-Language Parity", () => {
    it("matches Python implementation for standard test data", () => {
      const data = { user_id: 123, name: "Alice" };

      const key = generateKey(data);

      // This key should match Python: a3a1025004e50a9b
      expect(key).toBe("a3a1025004e50a9b");
    });

    it("produces consistent results for empty object", () => {
      const data = {};

      const key = generateKey(data);

      // Empty object hash should be consistent
      expect(key).toHaveLength(16);
    });
  });
});
