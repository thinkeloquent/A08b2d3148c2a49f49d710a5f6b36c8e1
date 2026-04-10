/**
 * Unit tests for client module (StatsigClient).
 *
 * Tests cover:
 * - Statement coverage for all HTTP verbs and lifecycle
 * - Branch coverage for API key resolution, response handling
 * - Boundary values for empty responses, 204, non-JSON
 * - Error handling for non-2xx status codes
 * - Log verification for request/response debug logs
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StatsigClient } from '../src/client.mjs';
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
  ServerError,
} from '../src/errors.mjs';

function createMockResponse(options = {}) {
  const {
    status = 200,
    json = {},
    headers = { 'content-type': 'application/json' },
    ok = status >= 200 && status < 300,
    text = '',
  } = options;

  const headersMap = new Map(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
  );

  return {
    status,
    ok,
    headers: {
      get: (key) => headersMap.get(key.toLowerCase()) ?? null,
      forEach: (cb) => headersMap.forEach((v, k) => cb(v, k)),
    },
    json: vi.fn().mockResolvedValue(json),
    text: vi.fn().mockResolvedValue(text || JSON.stringify(json)),
  };
}

describe('StatsigClient', () => {
  let mockFetch;
  let originalEnv;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    originalEnv = process.env.STATSIG_API_KEY;
    delete process.env.STATSIG_API_KEY;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalEnv !== undefined) {
      process.env.STATSIG_API_KEY = originalEnv;
    } else {
      delete process.env.STATSIG_API_KEY;
    }
  });

  describe('Statement Coverage', () => {
    it('should perform GET request', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ json: { data: [{ id: 'g1' }] } })
      );
      const client = new StatsigClient({ apiKey: 'test-key' });
      const result = await client.get('/gates');
      expect(result).toEqual({ data: [{ id: 'g1' }] });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should perform POST request with body', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ json: { id: 'new' } })
      );
      const client = new StatsigClient({ apiKey: 'test-key' });
      const result = await client.post('/gates', { name: 'test' });
      expect(result).toEqual({ id: 'new' });
      const [url, opts] = mockFetch.mock.calls[0];
      expect(opts.method).toBe('POST');
      expect(opts.body).toBe(JSON.stringify({ name: 'test' }));
    });

    it('should perform PUT request', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ json: { updated: true } })
      );
      const client = new StatsigClient({ apiKey: 'test-key' });
      const result = await client.put('/gates/g1', { enabled: true });
      expect(result).toEqual({ updated: true });
    });

    it('should perform PATCH request', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ json: { patched: true } })
      );
      const client = new StatsigClient({ apiKey: 'test-key' });
      const result = await client.patch('/gates/g1', { name: 'new' });
      expect(result).toEqual({ patched: true });
    });

    it('should perform DELETE request', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ json: { deleted: true } })
      );
      const client = new StatsigClient({ apiKey: 'test-key' });
      const result = await client.delete('/gates/g1');
      expect(result).toEqual({ deleted: true });
    });

    it('should perform getRaw request', async () => {
      const response = createMockResponse({ json: { raw: true } });
      mockFetch.mockResolvedValue(response);
      const client = new StatsigClient({ apiKey: 'test-key' });
      const result = await client.getRaw('/test');
      expect(result).toBe(response);
    });

    it('should close without error', () => {
      const client = new StatsigClient({ apiKey: 'test-key' });
      expect(() => client.close()).not.toThrow();
    });
  });

  describe('Branch Coverage', () => {
    it('should resolve API key from constructor', () => {
      const client = new StatsigClient({ apiKey: 'explicit-key' });
      expect(client._apiKey).toBe('explicit-key');
    });

    it('should resolve API key from env', () => {
      process.env.STATSIG_API_KEY = 'env-key';
      const client = new StatsigClient();
      expect(client._apiKey).toBe('env-key');
    });

    it('should handle 204 No Content', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ status: 204, ok: true })
      );
      const client = new StatsigClient({ apiKey: 'test-key' });
      const result = await client.delete('/gates/g1');
      expect(result).toEqual({});
    });

    it('should handle non-JSON success response', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          status: 200,
          headers: { 'content-type': 'text/plain' },
          text: 'plain text',
          json: null,
        })
      );
      // Override json to reject since it's not JSON
      const response = createMockResponse({
        status: 200,
        headers: { 'content-type': 'text/plain' },
        text: 'plain text',
      });
      response.text = vi.fn().mockResolvedValue('plain text');
      response.json = undefined;
      mockFetch.mockResolvedValue(response);

      const client = new StatsigClient({ apiKey: 'test-key' });
      const result = await client.get('/text');
      expect(result).toBeDefined();
    });

    it('should append query params to URL', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ json: { data: [] } })
      );
      const client = new StatsigClient({ apiKey: 'test-key' });
      await client.get('/gates', { params: { limit: '10' } });
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('limit=10');
    });

    it('should strip trailing slash from baseUrl', () => {
      const client = new StatsigClient({
        apiKey: 'key',
        baseUrl: 'https://api.com/v1/',
      });
      expect(client._baseUrl).toBe('https://api.com/v1');
    });

    it('should build correct URL for relative path', () => {
      const client = new StatsigClient({ apiKey: 'key' });
      expect(client._buildUrl('/gates')).toBe(
        'https://statsigapi.net/console/v1/gates'
      );
    });

    it('should pass through absolute URL', () => {
      const client = new StatsigClient({ apiKey: 'key' });
      expect(client._buildUrl('https://other.com/api')).toBe(
        'https://other.com/api'
      );
    });

    it('should include STATSIG-API-KEY header', () => {
      const client = new StatsigClient({ apiKey: 'my-key' });
      const headers = client._buildHeaders();
      expect(headers['STATSIG-API-KEY']).toBe('my-key');
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should omit STATSIG-API-KEY when empty', () => {
      process.env.STATSIG_API_KEY = '';
      const client = new StatsigClient({ apiKey: '' });
      const headers = client._buildHeaders();
      expect(headers['STATSIG-API-KEY']).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw AuthenticationError for 401', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          status: 401,
          ok: false,
          json: { message: 'Unauthorized' },
        })
      );
      const client = new StatsigClient({ apiKey: 'bad-key' });
      await expect(client.get('/gates')).rejects.toThrow(AuthenticationError);
    });

    it('should throw NotFoundError for 404', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          status: 404,
          ok: false,
          json: { message: 'Not found' },
        })
      );
      const client = new StatsigClient({ apiKey: 'test-key' });
      await expect(client.get('/gates/nope')).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for 400', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          status: 400,
          ok: false,
          json: { message: 'Bad request' },
        })
      );
      const client = new StatsigClient({ apiKey: 'test-key' });
      await expect(client.post('/gates', {})).rejects.toThrow(ValidationError);
    });

    it('should throw ServerError for 500', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          status: 500,
          ok: false,
          json: { message: 'Internal error' },
        })
      );
      const client = new StatsigClient({ apiKey: 'test-key' });
      await expect(client.get('/test')).rejects.toThrow(ServerError);
    });

    it('should handle non-JSON error response', async () => {
      const resp = createMockResponse({
        status: 503,
        ok: false,
        text: 'Service Unavailable',
      });
      resp.json = vi.fn().mockRejectedValue(new Error('not json'));
      resp.text = vi.fn().mockResolvedValue('Service Unavailable');
      mockFetch.mockResolvedValue(resp);

      const client = new StatsigClient({ apiKey: 'test-key' });
      await expect(client.get('/test')).rejects.toThrow(ServerError);
    });

    it('should rethrow timeout errors', async () => {
      const timeoutError = new Error('timeout');
      timeoutError.name = 'TimeoutError';
      mockFetch.mockRejectedValue(timeoutError);

      const client = new StatsigClient({ apiKey: 'test-key' });
      await expect(client.get('/test')).rejects.toThrow('timeout');
    });
  });

  describe('Log Verification', () => {
    it('should log request debug info', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ json: { ok: true } })
      );
      const mockLogger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };
      const client = new StatsigClient({
        apiKey: 'test-key',
        logger: mockLogger,
      });
      await client.get('/gates');

      const debugCalls = mockLogger.debug.mock.calls.map((c) => c[0]);
      expect(debugCalls.some((c) => c.includes('GET'))).toBe(true);
    });

    it('should log response status', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ json: { ok: true } })
      );
      const mockLogger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };
      const client = new StatsigClient({
        apiKey: 'test-key',
        logger: mockLogger,
      });
      await client.get('/test');

      const debugCalls = mockLogger.debug.mock.calls.map((c) => c[0]);
      expect(debugCalls.some((c) => c.includes('response'))).toBe(true);
    });

    it('should log error on API error', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          status: 500,
          ok: false,
          json: { message: 'fail' },
        })
      );
      const mockLogger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };
      const client = new StatsigClient({
        apiKey: 'test-key',
        logger: mockLogger,
      });

      try {
        await client.get('/test');
      } catch (_) {}

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should expose lastRateLimit property', () => {
      const client = new StatsigClient({ apiKey: 'test-key' });
      expect(client.lastRateLimit).toBeNull();
    });

    it('should delegate list to pagination', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          json: { data: [{ id: 'a' }], pagination: {} },
        })
      );
      const client = new StatsigClient({ apiKey: 'test-key' });
      const result = await client.list('/gates');
      expect(result).toEqual([{ id: 'a' }]);
    });
  });
});
