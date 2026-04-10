/**
 * Test helpers and utilities for cache_json_awss3_storage tests.
 *
 * Provides:
 * - Mock S3 client factory
 * - Logger spy utilities for log verification
 * - Sample data fixtures
 */

import type { Logger } from "../src/logger.js";
import type { S3ClientInterface, StorageEntry } from "../src/types.js";
import { vi } from "vitest";

/**
 * Create a mock S3 client for unit tests.
 */
export function createMockS3Client(): S3ClientInterface {
  return {
    send: vi.fn().mockResolvedValue({}),
  } as unknown as S3ClientInterface;
}

/**
 * Create a mock response for GetObject.
 */
export function createGetObjectResponse(entry: StorageEntry): {
  Body: { transformToString: () => Promise<string> };
} {
  return {
    Body: {
      transformToString: () => Promise.resolve(JSON.stringify(entry)),
    },
  };
}

/**
 * Log capture structure for verification.
 */
export interface LogCapture {
  debug: Array<{ msg: string; data?: unknown }>;
  info: Array<{ msg: string; data?: unknown }>;
  warn: Array<{ msg: string; data?: unknown }>;
  error: Array<{ msg: string; data?: unknown; err?: Error }>;
}

/**
 * Create a logger spy that captures all log messages.
 */
export function createLoggerSpy(): { logs: LogCapture; mockLogger: Logger } {
  const logs: LogCapture = {
    debug: [],
    info: [],
    warn: [],
    error: [],
  };

  const mockLogger: Logger = {
    debug: (msg: string) => logs.debug.push({ msg }),
    info: (msg: string) => logs.info.push({ msg }),
    warn: (msg: string) => logs.warn.push({ msg }),
    error: (msg: string) => logs.error.push({ msg }),
  };

  return { logs, mockLogger };
}

/**
 * Assert that logs contain expected text at specified level.
 */
export function expectLogContains(
  logs: LogCapture,
  level: keyof LogCapture,
  text: string
): void {
  const found = logs[level].some((entry) => entry.msg.includes(text));
  if (!found) {
    const messages = logs[level].map((e) => e.msg);
    throw new Error(
      `Expected log containing '${text}' in ${level} logs not found.\n` +
        `Captured ${level} logs: ${JSON.stringify(messages, null, 2)}`
    );
  }
}

/**
 * Sample data for tests.
 */
export const sampleData = {
  user_id: 123,
  name: "Alice",
  email: "alice@example.com",
};

/**
 * Create a sample storage entry.
 */
export function createSampleEntry(
  overrides: Partial<StorageEntry> = {}
): StorageEntry {
  return {
    key: "abc123def456",
    data: { user_id: 123, name: "Alice" },
    created_at: Date.now() / 1000,
    expires_at: null,
    ...overrides,
  };
}

/**
 * Create an expired storage entry.
 */
export function createExpiredEntry(): StorageEntry {
  return {
    key: "expired123",
    data: { test: "data" },
    created_at: Date.now() / 1000 - 7200, // 2 hours ago
    expires_at: Date.now() / 1000 - 3600, // Expired 1 hour ago
  };
}
