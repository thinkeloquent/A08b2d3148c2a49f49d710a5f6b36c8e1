/**
 * Tests for GitHubClient - base HTTP client.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/sdk/client-factory.mjs', () => ({
  httpRequest: vi.fn(),
}));

import { httpRequest } from '../../src/sdk/client-factory.mjs';
import { GitHubClient, createLogger } from '../../src/sdk/client.mjs';
import {
  AuthError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from '../../src/sdk/errors.mjs';

describe('createLogger', () => {
  it('should create a logger with all required methods', () => {
    const logger = createLogger('test');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should prefix messages with the logger name', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = createLogger('my-module');
    logger.info('hello', { foo: 'bar' });
    expect(spy).toHaveBeenCalledWith('[my-module] hello', { foo: 'bar' });
    spy.mockRestore();
  });
});

describe('GitHubClient', () => {
  let client;

  beforeEach(() => {
    client = new GitHubClient({
      token: 'ghp_testtoken1234567890abcdef',
      baseUrl: 'https://api.github.com',
      logger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should set default baseUrl', () => {
      const c = new GitHubClient({ token: 'test' });
      expect(c.baseUrl).toBe('https://api.github.com');
    });

    it('should strip trailing slashes from baseUrl', () => {
      const c = new GitHubClient({
        token: 'test',
        baseUrl: 'https://api.github.com///',
      });
      expect(c.baseUrl).toBe('https://api.github.com');
    });

    it('should default rateLimitAutoWait to true', () => {
      const c = new GitHubClient({ token: 'test' });
      expect(c.rateLimitAutoWait).toBe(true);
    });

    it('should accept a custom logger', () => {
      const customLogger = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };
      const c = new GitHubClient({ token: 'test', logger: customLogger });
      expect(c.logger).toBe(customLogger);
    });
  });

  describe('_buildUrl', () => {
    it('should prepend baseUrl for relative paths', () => {
      expect(client._buildUrl('/repos/owner/repo')).toBe(
        'https://api.github.com/repos/owner/repo',
      );
    });

    it('should add leading slash if missing', () => {
      expect(client._buildUrl('repos/owner/repo')).toBe(
        'https://api.github.com/repos/owner/repo',
      );
    });

    it('should return absolute URLs unchanged', () => {
      const url = 'https://other.api.com/path';
      expect(client._buildUrl(url)).toBe(url);
    });
  });

  describe('_buildHeaders', () => {
    it('should include Accept and Authorization headers', () => {
      const headers = client._buildHeaders();
      expect(headers.Accept).toBe('application/vnd.github+json');
      expect(headers.Authorization).toBe(
        'Bearer ghp_testtoken1234567890abcdef',
      );
    });

    it('should omit Authorization when no token is set', () => {
      const c = new GitHubClient({});
      const headers = c._buildHeaders();
      expect(headers.Authorization).toBeUndefined();
    });

    it('should include API version header', () => {
      const headers = client._buildHeaders();
      expect(headers['X-GitHub-Api-Version']).toBe('2022-11-28');
    });
  });

  describe('HTTP methods', () => {
    it('should call _request with GET method', async () => {
      const mockResponse = {
        ok: true,
        statusCode: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue({ id: 1 }),
      };
      httpRequest.mockResolvedValue(mockResponse);

      const result = await client.get('/repos/owner/repo');
      expect(result).toEqual({ id: 1 });
      expect(httpRequest).toHaveBeenCalledWith(
        'GET',
        'https://api.github.com/repos/owner/repo',
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });

    it('should call _request with POST method and body', async () => {
      const mockResponse = {
        ok: true,
        statusCode: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue({ id: 2, name: 'new-repo' }),
      };
      httpRequest.mockResolvedValue(mockResponse);

      const result = await client.post('/user/repos', { name: 'new-repo' });
      expect(result).toEqual({ id: 2, name: 'new-repo' });

      const call = httpRequest.mock.calls[0];
      expect(call[0]).toBe('POST');
      expect(call[2].json).toEqual({ name: 'new-repo' });
    });

    it('should handle 204 No Content', async () => {
      const mockResponse = {
        ok: true,
        statusCode: 204,
        headers: new Headers({}),
      };
      httpRequest.mockResolvedValue(mockResponse);

      const result = await client.delete('/repos/owner/repo');
      expect(result).toEqual({});
    });

    it('should add query params from options', async () => {
      const mockResponse = {
        ok: true,
        statusCode: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue([]),
      };
      httpRequest.mockResolvedValue(mockResponse);

      await client.get('/repos/owner/repo/branches', {
        params: { per_page: 50, page: 2 },
      });

      const url = httpRequest.mock.calls[0][1];
      expect(url).toContain('per_page=50');
      expect(url).toContain('page=2');
    });
  });

  describe('error handling', () => {
    it('should throw NotFoundError on 404', async () => {
      const mockResponse = {
        ok: false,
        statusCode: 404,
        headers: new Headers({}),
        json: vi.fn().mockResolvedValue({ message: 'Not Found' }),
      };
      httpRequest.mockResolvedValue(mockResponse);

      await expect(client.get('/repos/owner/missing')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw AuthError on 401', async () => {
      const mockResponse = {
        ok: false,
        statusCode: 401,
        headers: new Headers({}),
        json: vi
          .fn()
          .mockResolvedValue({ message: 'Bad credentials' }),
      };
      httpRequest.mockResolvedValue(mockResponse);

      await expect(client.get('/user')).rejects.toThrow(AuthError);
    });

    it('should throw ServerError on 500', async () => {
      const mockResponse = {
        ok: false,
        statusCode: 500,
        headers: new Headers({}),
        json: vi
          .fn()
          .mockResolvedValue({ message: 'Internal Server Error' }),
      };
      httpRequest.mockResolvedValue(mockResponse);

      await expect(client.get('/repos/owner/repo')).rejects.toThrow(
        ServerError,
      );
    });
  });

  describe('rate limit parsing', () => {
    it('should parse rate limit headers from responses', async () => {
      const mockResponse = {
        ok: true,
        statusCode: 200,
        headers: new Headers({
          'content-type': 'application/json',
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-reset': '1700000000',
          'x-ratelimit-used': '1',
          'x-ratelimit-resource': 'core',
        }),
        json: vi.fn().mockResolvedValue({ id: 1 }),
      };
      httpRequest.mockResolvedValue(mockResponse);

      await client.get('/repos/owner/repo');

      expect(client.lastRateLimit).toEqual({
        limit: 5000,
        remaining: 4999,
        reset: 1700000000,
        used: 1,
        resource: 'core',
      });
    });

    it('should call onRateLimit callback when rate limit info is available', async () => {
      const onRateLimit = vi.fn();
      const c = new GitHubClient({
        token: 'test',
        onRateLimit,
        logger: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() },
      });

      const mockResponse = {
        ok: true,
        statusCode: 200,
        headers: new Headers({
          'content-type': 'application/json',
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '4998',
          'x-ratelimit-reset': '1700000000',
          'x-ratelimit-used': '2',
          'x-ratelimit-resource': 'core',
        }),
        json: vi.fn().mockResolvedValue([]),
      };
      httpRequest.mockResolvedValue(mockResponse);

      await c.get('/user/repos');

      expect(onRateLimit).toHaveBeenCalledWith(
        expect.objectContaining({ remaining: 4998 }),
      );
    });
  });

  describe('getRateLimit', () => {
    it('should call GET /rate_limit', async () => {
      const rateLimitData = {
        resources: { core: { limit: 5000, remaining: 4999 } },
      };
      const mockResponse = {
        ok: true,
        statusCode: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue(rateLimitData),
      };
      httpRequest.mockResolvedValue(mockResponse);

      const result = await client.getRateLimit();
      expect(result).toEqual(rateLimitData);
      expect(httpRequest.mock.calls[0][1]).toBe(
        'https://api.github.com/rate_limit',
      );
    });
  });
});
