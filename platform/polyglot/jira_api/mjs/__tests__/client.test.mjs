/**
 * Unit tests for client/JiraFetchClient and client/FetchClient
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before imports
vi.mock('../src/adapters/UndiciFetchAdapter.mjs', () => ({
  UndiciFetchAdapter: vi.fn().mockImplementation(() => ({
    fetch: vi.fn(),
  })),
}));
vi.mock('../src/logger.mjs', () => ({
  createLogger: () => ({
    debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(),
  }),
}));

import { JiraFetchClient } from '../src/client/JiraFetchClient.mjs';
import { JiraConfigurationError } from '../src/errors.mjs';
import { UndiciFetchAdapter } from '../src/adapters/UndiciFetchAdapter.mjs';

const VALID_OPTS = {
  baseUrl: 'https://test.atlassian.net',
  email: 'user@test.com',
  apiToken: 'tok123',
};

describe('JiraFetchClient', () => {
  describe('Statement Coverage', () => {
    it('constructs with valid options', () => {
      const client = new JiraFetchClient(VALID_OPTS);
      expect(client._baseUrl).toBe('https://test.atlassian.net');
    });

    it('strips trailing slash from baseUrl', () => {
      const client = new JiraFetchClient({ ...VALID_OPTS, baseUrl: 'https://test.atlassian.net/' });
      expect(client._baseUrl).toBe('https://test.atlassian.net');
    });

    it('creates Basic auth header', () => {
      const client = new JiraFetchClient(VALID_OPTS);
      const expected = 'Basic ' + Buffer.from('user@test.com:tok123').toString('base64');
      expect(client._authHeader).toBe(expected);
    });
  });

  describe('Branch Coverage', () => {
    it('throws when baseUrl missing', () => {
      expect(() => new JiraFetchClient({ email: 'a', apiToken: 'b' }))
        .toThrow(JiraConfigurationError);
    });

    it('throws when email missing', () => {
      expect(() => new JiraFetchClient({ baseUrl: 'http://x', apiToken: 'b' }))
        .toThrow(JiraConfigurationError);
    });

    it('throws when apiToken missing', () => {
      expect(() => new JiraFetchClient({ baseUrl: 'http://x', email: 'a' }))
        .toThrow(JiraConfigurationError);
    });
  });

  describe('_buildUrl', () => {
    let client;
    beforeEach(() => { client = new JiraFetchClient(VALID_OPTS); });

    describe('Statement Coverage', () => {
      it('builds URL from path', () => {
        const url = client._buildUrl({ path: '/rest/api/3/issue', method: 'GET' });
        expect(url).toBe('https://test.atlassian.net/rest/api/3/issue');
      });

      it('interpolates path params', () => {
        const url = client._buildUrl({
          path: '/rest/api/3/issue/{issueKey}',
          method: 'GET',
          pathParams: { issueKey: 'PROJ-1' },
        });
        expect(url).toBe('https://test.atlassian.net/rest/api/3/issue/PROJ-1');
      });

      it('encodes path param values', () => {
        const url = client._buildUrl({
          path: '/rest/api/3/issue/{key}',
          method: 'GET',
          pathParams: { key: 'a b' },
        });
        expect(url).toContain('a%20b');
      });

      it('appends query params', () => {
        const url = client._buildUrl({
          path: '/rest/api/3/user/search',
          method: 'GET',
          queryParams: { query: 'test', maxResults: 10 },
        });
        expect(url).toContain('query=test');
        expect(url).toContain('maxResults=10');
      });
    });

    describe('Branch Coverage', () => {
      it('throws for missing path param placeholder', () => {
        expect(() => client._buildUrl({
          path: '/rest/api/3/issue',
          method: 'GET',
          pathParams: { missing: 'val' },
        })).toThrow(JiraConfigurationError);
      });

      it('throws for unreplaced path params', () => {
        expect(() => client._buildUrl({
          path: '/rest/api/3/issue/{key}/{other}',
          method: 'GET',
          pathParams: { key: 'PROJ-1' },
        })).toThrow(JiraConfigurationError);
      });

      it('skips undefined query params', () => {
        const url = client._buildUrl({
          path: '/test', method: 'GET',
          queryParams: { a: 'yes', b: undefined },
        });
        expect(url).toContain('a=yes');
        expect(url).not.toContain('b=');
      });

      it('handles array query params', () => {
        const url = client._buildUrl({
          path: '/test', method: 'GET',
          queryParams: { ids: ['1', '2'] },
        });
        expect(url).toContain('ids=1');
        expect(url).toContain('ids=2');
      });

      it('returns plain URL when no query params', () => {
        const url = client._buildUrl({ path: '/test', method: 'GET' });
        expect(url).not.toContain('?');
      });
    });
  });

  describe('_buildHeaders', () => {
    it('includes Content-Type, Accept, and Authorization', () => {
      const client = new JiraFetchClient(VALID_OPTS);
      const headers = client._buildHeaders({});
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers.Accept).toBe('application/json');
      expect(headers.Authorization).toContain('Basic ');
    });

    it('allows custom headers to override defaults', () => {
      const client = new JiraFetchClient(VALID_OPTS);
      const headers = client._buildHeaders({ headers: { 'X-Custom': 'val' } });
      expect(headers['X-Custom']).toBe('val');
    });
  });

  describe('Convenience Methods', () => {
    let client;
    let mockFetchAdapter;

    beforeEach(() => {
      client = new JiraFetchClient(VALID_OPTS);
      mockFetchAdapter = {
        fetch: vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Map(),
          json: () => Promise.resolve({ data: true }),
          text: () => Promise.resolve('{"data":true}'),
          clone: function () { return this; },
        }),
      };
      client._fetchClient._options = {
        fetchAdapter: mockFetchAdapter,
        timeoutMs: 30000,
      };
    });

    it('get() calls request with GET', async () => {
      const spy = vi.spyOn(client, 'request').mockResolvedValue({ ok: true });
      await client.get('/test');
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET', path: '/test' }));
    });

    it('post() calls request with POST and body', async () => {
      const spy = vi.spyOn(client, 'request').mockResolvedValue({ ok: true });
      await client.post('/test', { x: 1 });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST', path: '/test', body: { x: 1 } }),
      );
    });

    it('put() calls request with PUT and body', async () => {
      const spy = vi.spyOn(client, 'request').mockResolvedValue({ ok: true });
      await client.put('/test', { x: 1 });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'PUT', path: '/test', body: { x: 1 } }),
      );
    });

    it('delete() calls request with DELETE', async () => {
      const spy = vi.spyOn(client, 'request').mockResolvedValue({ ok: true });
      await client.delete('/test');
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ method: 'DELETE', path: '/test' }));
    });

    it('patch() calls request with PATCH and body', async () => {
      const spy = vi.spyOn(client, 'request').mockResolvedValue({ ok: true });
      await client.patch('/test', { x: 1 });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'PATCH', path: '/test', body: { x: 1 } }),
      );
    });
  });

  describe('Error Handling', () => {
    it('JiraConfigurationError is instanceof Error', () => {
      try {
        new JiraFetchClient({});
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e).toBeInstanceOf(JiraConfigurationError);
      }
    });
  });
});
