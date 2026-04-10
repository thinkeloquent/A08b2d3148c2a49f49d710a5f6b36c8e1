/**
 * Test utilities and shared helpers for static-app-loader tests.
 */

import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import Fastify, { FastifyInstance } from 'fastify';
import type { ILogger } from '../../src/types.js';

/**
 * Create a logger spy for testing log output.
 */
export function createLoggerSpy() {
  const logs: {
    debug: Array<{ msg: string; data?: Record<string, unknown> }>;
    info: Array<{ msg: string; data?: Record<string, unknown> }>;
    warn: Array<{ msg: string; data?: Record<string, unknown> }>;
    error: Array<{ msg: string; data?: Record<string, unknown> }>;
    trace: Array<{ msg: string; data?: Record<string, unknown> }>;
  } = {
    debug: [],
    info: [],
    warn: [],
    error: [],
    trace: [],
  };

  const mockLogger: ILogger = {
    debug: (msg, data) => logs.debug.push({ msg, data }),
    info: (msg, data) => logs.info.push({ msg, data }),
    warn: (msg, data) => logs.warn.push({ msg, data }),
    error: (msg, data) => logs.error.push({ msg, data }),
    trace: (msg, data) => logs.trace.push({ msg, data }),
  };

  return { logs, mockLogger };
}

/**
 * Assert that a log level contains a specific message.
 */
export function expectLogContains(
  logs: ReturnType<typeof createLoggerSpy>['logs'],
  level: keyof typeof logs,
  text: string
): void {
  const found = logs[level].some((entry) => entry.msg.includes(text));
  if (!found) {
    const allLogs = logs[level].map((e) => e.msg).join('\n');
    throw new Error(
      `Expected log at level '${level}' containing '${text}' not found.\nCaptured logs:\n${allLogs}`
    );
  }
}

/**
 * Create a temporary directory with static files for testing.
 */
export async function createTempStaticDir(): Promise<string> {
  const tempDir = join(tmpdir(), `static-app-loader-test-${randomUUID()}`);
  await mkdir(tempDir, { recursive: true });

  // Create index.html
  await writeFile(
    join(tempDir, 'index.html'),
    `<!DOCTYPE html>
<html>
<head>
    <title>Test App</title>
    <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
    <h1>Test App</h1>
    <script src="/assets/main.js"></script>
</body>
</html>`
  );

  // Create assets directory
  const assetsDir = join(tempDir, 'assets');
  await mkdir(assetsDir, { recursive: true });
  await writeFile(join(assetsDir, 'style.css'), 'body { margin: 0; }');
  await writeFile(join(assetsDir, 'main.js'), "console.log('Hello');");

  return tempDir;
}

/**
 * Clean up a temporary directory.
 */
export async function cleanupTempDir(tempDir: string): Promise<void> {
  try {
    await rm(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Create a test Fastify server instance.
 */
export async function createTestServer(
  options: { logger?: boolean | ILogger } = {}
): Promise<FastifyInstance> {
  const server = Fastify({
    logger: options.logger ?? false,
  });

  return server;
}

/**
 * Helper to inject HTTP requests into Fastify server.
 */
export async function injectRequest(
  server: FastifyInstance,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers?: Record<string, string>;
    payload?: unknown;
  }
) {
  return server.inject({
    method: options.method ?? 'GET',
    url: options.url,
    headers: options.headers ?? {},
    payload: options.payload,
  });
}
