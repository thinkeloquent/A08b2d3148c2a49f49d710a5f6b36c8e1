/**
 * Test helpers for fetch-http-cache-response.
 */

import { vi } from "vitest";

export function createMockHttpClient() {
  const response = {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    json: () => ({ result: "ok" }),
    text: '{"result": "ok"}',
  };
  return {
    request: vi.fn().mockResolvedValue(response),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

export function createMockStorage() {
  return {
    load: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

export function createMockTokenManager() {
  return {
    getToken: vi.fn().mockResolvedValue("test-token-123"),
    buildAuthHeaders: vi.fn().mockResolvedValue({
      Authorization: "Bearer test-token-123",
    }),
    isExpired: vi.fn().mockReturnValue(false),
  };
}
