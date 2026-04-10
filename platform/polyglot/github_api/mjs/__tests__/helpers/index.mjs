/**
 * Shared test utilities for GitHub API SDK tests.
 */

import { vi } from 'vitest';

/**
 * Create a logger spy that captures all log calls.
 */
export function createLoggerSpy() {
  const logs = { trace: [], debug: [], info: [], warn: [], error: [] };
  const mockLogger = {
    trace: vi.fn((msg, data) => logs.trace.push({ msg, data })),
    debug: vi.fn((msg, data) => logs.debug.push({ msg, data })),
    info: vi.fn((msg, data) => logs.info.push({ msg, data })),
    warn: vi.fn((msg, data) => logs.warn.push({ msg, data })),
    error: vi.fn((msg, data, err) => logs.error.push({ msg, data, err })),
  };
  return { logs, mockLogger };
}

export function expectLogContains(logs, level, text) {
  const found = logs[level].some(entry => entry.msg.includes(text));
  if (!found) {
    const all = logs[level].map(e => e.msg).join(', ');
    throw new Error(`Expected log [${level}] containing "${text}" not found. Got: [${all}]`);
  }
}

/**
 * Create a mock GitHubClient for testing domain clients.
 */
export function createMockClient(overrides = {}) {
  return {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    getRaw: vi.fn(),
    getRateLimit: vi.fn().mockResolvedValue({}),
    logger: null,
    ...overrides,
  };
}

/**
 * Create mock response headers for rate limit testing.
 */
export function createRateLimitHeaders(overrides = {}) {
  return {
    'x-ratelimit-limit': '5000',
    'x-ratelimit-remaining': '4999',
    'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
    'x-ratelimit-used': '1',
    'x-ratelimit-resource': 'core',
    ...overrides,
  };
}
