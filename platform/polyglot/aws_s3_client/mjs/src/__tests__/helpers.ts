/**
 * Test utilities and shared helpers for AWS S3 Client tests.
 */

import type { Logger } from "../logger.js";

/**
 * Create a logger spy for testing log verification.
 */
export function createLoggerSpy(): {
  logs: {
    debug: Array<{ msg: string; data?: unknown }>;
    info: Array<{ msg: string; data?: unknown }>;
    warn: Array<{ msg: string; data?: unknown }>;
    error: Array<{ msg: string; data?: unknown; err?: Error }>;
  };
  mockLogger: Logger;
} {
  const logs = {
    debug: [] as Array<{ msg: string; data?: unknown }>,
    info: [] as Array<{ msg: string; data?: unknown }>,
    warn: [] as Array<{ msg: string; data?: unknown }>,
    error: [] as Array<{ msg: string; data?: unknown; err?: Error }>,
  };

  const mockLogger: Logger = {
    debug: (msg: string, data?: unknown) => {
      logs.debug.push({ msg, data });
    },
    info: (msg: string, data?: unknown) => {
      logs.info.push({ msg, data });
    },
    warn: (msg: string, data?: unknown) => {
      logs.warn.push({ msg, data });
    },
    error: (msg: string, data?: unknown, err?: Error) => {
      logs.error.push({ msg, data, err });
    },
  };

  return { logs, mockLogger };
}

/**
 * Assert that logs contain expected text.
 */
export function expectLogContains(
  logs: { debug: Array<{ msg: string }>; info: Array<{ msg: string }>; warn: Array<{ msg: string }>; error: Array<{ msg: string }> },
  level: "debug" | "info" | "warn" | "error",
  text: string
): boolean {
  const found = logs[level].some((entry) => entry.msg.includes(text));
  if (!found) {
    const allLogs = logs[level].map((e) => e.msg).join("\n");
    throw new Error(`Expected log containing "${text}" not found in ${level} logs.\nLogs:\n${allLogs}`);
  }
  return true;
}

/**
 * Create a mock S3 client for testing.
 */
export function createMockS3Client(options?: {
  getObjectResponse?: Record<string, unknown>;
  getObjectError?: Error;
  putObjectError?: Error;
  headObjectError?: Error;
}) {
  const storedObjects = new Map<string, string>();

  return {
    send: async (command: { constructor: { name: string }; input?: Record<string, unknown> }) => {
      const commandName = command.constructor.name;

      if (commandName === "PutObjectCommand") {
        if (options?.putObjectError) {
          throw options.putObjectError;
        }
        const key = (command.input as Record<string, unknown>)?.Key as string;
        const body = (command.input as Record<string, unknown>)?.Body as string;
        storedObjects.set(key, body);
        return { ETag: '"abc123"' };
      }

      if (commandName === "GetObjectCommand") {
        if (options?.getObjectError) {
          throw options?.getObjectError;
        }
        const key = (command.input as Record<string, unknown>)?.Key as string;
        const stored = storedObjects.get(key);

        if (options?.getObjectResponse) {
          return {
            Body: {
              transformToString: async () => JSON.stringify(options.getObjectResponse),
            },
          };
        }

        if (stored) {
          return {
            Body: {
              transformToString: async () => stored,
            },
          };
        }

        throw new Error("NoSuchKey: The specified key does not exist.");
      }

      if (commandName === "HeadObjectCommand") {
        if (options?.headObjectError) {
          throw options.headObjectError;
        }
        const key = (command.input as Record<string, unknown>)?.Key as string;
        if (storedObjects.has(key)) {
          return { ContentLength: 100 };
        }
        throw new Error("404 Not Found");
      }

      if (commandName === "DeleteObjectCommand") {
        const key = (command.input as Record<string, unknown>)?.Key as string;
        storedObjects.delete(key);
        return {};
      }

      if (commandName === "DeleteObjectsCommand") {
        return { Deleted: [] };
      }

      if (commandName === "ListObjectsV2Command") {
        const keys = Array.from(storedObjects.keys()).map((key) => ({ Key: key }));
        return {
          Contents: keys,
          IsTruncated: false,
        };
      }

      return {};
    },
    destroy: () => {},
  };
}

/**
 * Sample data for testing.
 */
export const sampleData = {
  user_id: 123,
  name: "Alice",
  email: "alice@example.com",
  tags: ["typescript", "aws"],
};
