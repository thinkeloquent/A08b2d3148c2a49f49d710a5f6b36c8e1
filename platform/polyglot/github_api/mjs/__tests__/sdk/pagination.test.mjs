/**
 * Tests for pagination utilities: paginate() and paginateAll().
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { paginate, paginateAll } from '../../src/sdk/pagination.mjs';
import { createLoggerSpy, expectLogContains } from '../helpers/index.mjs';

/**
 * Helper: create a mock client whose getRaw returns sequential pages.
 * Each page entry describes { body, linkHeader }.
 */
function createPaginatingClient(pages, logger = null) {
  let callIndex = 0;
  return {
    logger,
    getRaw: vi.fn(async () => {
      const page = pages[callIndex] || { body: [], linkHeader: null };
      callIndex++;
      return {
        json: async () => page.body,
        headers: {
          get: (name) => {
            if (name === 'link') return page.linkHeader;
            return null;
          },
        },
      };
    }),
  };
}

describe('pagination', () => {
  // ---------------------------------------------------------------------------
  // Statement Coverage
  // ---------------------------------------------------------------------------
  describe('Statement Coverage', () => {
    it('should yield pages from API responses via paginate', async () => {
      const client = createPaginatingClient([
        { body: [{ id: 1 }, { id: 2 }], linkHeader: null },
      ]);

      const pages = [];
      for await (const page of paginate(client, '/repos/owner/repo/branches')) {
        pages.push(page);
      }

      expect(pages).toHaveLength(1);
      expect(pages[0]).toEqual([{ id: 1 }, { id: 2 }]);
      expect(client.getRaw).toHaveBeenCalledTimes(1);
    });

    it('should collect all pages into a flat array via paginateAll', async () => {
      const client = createPaginatingClient([
        {
          body: [{ id: 1 }],
          linkHeader: '<https://api.github.com/repos?page=2&per_page=100>; rel="next"',
        },
        { body: [{ id: 2 }], linkHeader: null },
      ]);

      const results = await paginateAll(client, '/repos');
      expect(results).toEqual([{ id: 1 }, { id: 2 }]);
      expect(client.getRaw).toHaveBeenCalledTimes(2);
    });

    it('should parse Link header and extract next URL correctly', async () => {
      const client = createPaginatingClient([
        {
          body: [{ id: 1 }],
          linkHeader: '<https://api.github.com/repos?page=2&per_page=100>; rel="next", <https://api.github.com/repos?page=5&per_page=100>; rel="last"',
        },
        { body: [{ id: 2 }], linkHeader: null },
      ]);

      const results = await paginateAll(client, '/repos');
      expect(results).toEqual([{ id: 1 }, { id: 2 }]);

      // Second call should use the path extracted from the full URL
      const secondCallUrl = client.getRaw.mock.calls[1][0];
      expect(secondCallUrl).toContain('/repos');
      expect(secondCallUrl).toContain('page=2');
    });

    it('should build initial URL with per_page and additional params', async () => {
      const client = createPaginatingClient([
        { body: [], linkHeader: null },
      ]);

      for await (const _page of paginate(client, '/items', {
        perPage: 50,
        params: { sort: 'updated' },
      })) {
        // consume
      }

      const calledUrl = client.getRaw.mock.calls[0][0];
      expect(calledUrl).toContain('per_page=50');
      expect(calledUrl).toContain('sort=updated');
    });
  });

  // ---------------------------------------------------------------------------
  // Branch Coverage
  // ---------------------------------------------------------------------------
  describe('Branch Coverage', () => {
    it('should stop pagination when there is no Link header', async () => {
      const client = createPaginatingClient([
        { body: [{ id: 1 }], linkHeader: null },
      ]);

      const pages = [];
      for await (const page of paginate(client, '/repos')) {
        pages.push(page);
      }

      expect(pages).toHaveLength(1);
      expect(client.getRaw).toHaveBeenCalledTimes(1);
    });

    it('should stop pagination when Link header has no "next" rel', async () => {
      const client = createPaginatingClient([
        {
          body: [{ id: 1 }],
          linkHeader: '<https://api.github.com/repos?page=1>; rel="prev"',
        },
      ]);

      const pages = [];
      for await (const page of paginate(client, '/repos')) {
        pages.push(page);
      }

      expect(pages).toHaveLength(1);
      expect(client.getRaw).toHaveBeenCalledTimes(1);
    });

    it('should continue to next page when Link header has "next" rel', async () => {
      const client = createPaginatingClient([
        {
          body: [{ id: 1 }],
          linkHeader: '<https://api.github.com/repos?page=2>; rel="next"',
        },
        {
          body: [{ id: 2 }],
          linkHeader: '<https://api.github.com/repos?page=3>; rel="next"',
        },
        { body: [{ id: 3 }], linkHeader: null },
      ]);

      const results = await paginateAll(client, '/repos');
      expect(results).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
      expect(client.getRaw).toHaveBeenCalledTimes(3);
    });

    it('should stop when maxPages limit is reached', async () => {
      const { mockLogger } = createLoggerSpy();
      const client = createPaginatingClient(
        [
          {
            body: [{ id: 1 }],
            linkHeader: '<https://api.github.com/repos?page=2>; rel="next"',
          },
          {
            body: [{ id: 2 }],
            linkHeader: '<https://api.github.com/repos?page=3>; rel="next"',
          },
          { body: [{ id: 3 }], linkHeader: null },
        ],
        mockLogger,
      );

      const results = await paginateAll(client, '/repos', { maxPages: 2 });
      expect(results).toEqual([{ id: 1 }, { id: 2 }]);
      expect(client.getRaw).toHaveBeenCalledTimes(2);
    });

    it('should wrap non-array response body in an array', async () => {
      const client = createPaginatingClient([
        { body: { id: 1, name: 'single-object' }, linkHeader: null },
      ]);

      const pages = [];
      for await (const page of paginate(client, '/repos/owner/repo')) {
        pages.push(page);
      }

      expect(pages).toHaveLength(1);
      expect(pages[0]).toEqual([{ id: 1, name: 'single-object' }]);
    });

    it('should extract path from full URL in Link header', async () => {
      const client = createPaginatingClient([
        {
          body: [{ id: 1 }],
          linkHeader: '<https://api.github.com/repos/owner/repo/branches?page=2&per_page=100>; rel="next"',
        },
        { body: [{ id: 2 }], linkHeader: null },
      ]);

      await paginateAll(client, '/repos/owner/repo/branches');

      const secondUrl = client.getRaw.mock.calls[1][0];
      expect(secondUrl).toBe('/repos/owner/repo/branches?page=2&per_page=100');
    });

    it('should use link URL as-is when it is not a valid URL', async () => {
      const client = createPaginatingClient([
        {
          body: [{ id: 1 }],
          // Not a valid absolute URL - the try/catch should use it as-is
          linkHeader: '<not-a-valid-url>; rel="next"',
        },
        { body: [{ id: 2 }], linkHeader: null },
      ]);

      await paginateAll(client, '/repos');

      const secondUrl = client.getRaw.mock.calls[1][0];
      expect(secondUrl).toBe('not-a-valid-url');
    });

    it('should use a no-op logger when client.logger is null', async () => {
      const client = createPaginatingClient(
        [{ body: [{ id: 1 }], linkHeader: null }],
        null,
      );

      // Should not throw even with null logger
      const results = await paginateAll(client, '/repos');
      expect(results).toEqual([{ id: 1 }]);
    });
  });

  // ---------------------------------------------------------------------------
  // Boundary Values
  // ---------------------------------------------------------------------------
  describe('Boundary Values', () => {
    it('should handle empty first page (empty array)', async () => {
      const client = createPaginatingClient([
        { body: [], linkHeader: null },
      ]);

      const results = await paginateAll(client, '/repos');
      expect(results).toEqual([]);
    });

    it('should handle single page of results', async () => {
      const client = createPaginatingClient([
        { body: [{ id: 1 }], linkHeader: null },
      ]);

      const results = await paginateAll(client, '/repos');
      expect(results).toEqual([{ id: 1 }]);
    });

    it('should handle perPage=1', async () => {
      const client = createPaginatingClient([
        {
          body: [{ id: 1 }],
          linkHeader: '<https://api.github.com/repos?page=2&per_page=1>; rel="next"',
        },
        { body: [{ id: 2 }], linkHeader: null },
      ]);

      const results = await paginateAll(client, '/repos', { perPage: 1 });
      expect(results).toEqual([{ id: 1 }, { id: 2 }]);

      const firstUrl = client.getRaw.mock.calls[0][0];
      expect(firstUrl).toContain('per_page=1');
    });

    it('should handle maxPages=1 to fetch only one page', async () => {
      const client = createPaginatingClient([
        {
          body: [{ id: 1 }],
          linkHeader: '<https://api.github.com/repos?page=2>; rel="next"',
        },
        { body: [{ id: 2 }], linkHeader: null },
      ]);

      const results = await paginateAll(client, '/repos', { maxPages: 1 });
      expect(results).toEqual([{ id: 1 }]);
      expect(client.getRaw).toHaveBeenCalledTimes(1);
    });

    it('should handle very large maxPages value', async () => {
      const client = createPaginatingClient([
        { body: [{ id: 1 }], linkHeader: null },
      ]);

      const results = await paginateAll(client, '/repos', { maxPages: 999999 });
      expect(results).toEqual([{ id: 1 }]);
    });

    it('should handle perPage=0', async () => {
      const client = createPaginatingClient([
        { body: [], linkHeader: null },
      ]);

      const results = await paginateAll(client, '/repos', { perPage: 0 });
      expect(results).toEqual([]);

      const calledUrl = client.getRaw.mock.calls[0][0];
      expect(calledUrl).toContain('per_page=0');
    });

    it('should use defaults when options is empty', async () => {
      const client = createPaginatingClient([
        { body: [{ id: 1 }], linkHeader: null },
      ]);

      const results = await paginateAll(client, '/repos', {});
      expect(results).toEqual([{ id: 1 }]);

      const calledUrl = client.getRaw.mock.calls[0][0];
      expect(calledUrl).toContain('per_page=100');
    });
  });

  // ---------------------------------------------------------------------------
  // Error Handling
  // ---------------------------------------------------------------------------
  describe('Error Handling', () => {
    it('should propagate errors when client.getRaw throws', async () => {
      const client = {
        logger: null,
        getRaw: vi.fn().mockRejectedValue(new Error('Network failure')),
      };

      await expect(paginateAll(client, '/repos')).rejects.toThrow('Network failure');
    });

    it('should propagate errors from response.json()', async () => {
      const client = {
        logger: null,
        getRaw: vi.fn().mockResolvedValue({
          json: async () => { throw new SyntaxError('Unexpected token'); },
          headers: { get: () => null },
        }),
      };

      await expect(paginateAll(client, '/repos')).rejects.toThrow('Unexpected token');
    });
  });

  // ---------------------------------------------------------------------------
  // Log Verification
  // ---------------------------------------------------------------------------
  describe('Log Verification', () => {
    it('should log debug message for each page fetch with page number', async () => {
      const { logs, mockLogger } = createLoggerSpy();
      const client = createPaginatingClient(
        [
          {
            body: [{ id: 1 }],
            linkHeader: '<https://api.github.com/repos?page=2>; rel="next"',
          },
          { body: [{ id: 2 }], linkHeader: null },
        ],
        mockLogger,
      );

      await paginateAll(client, '/repos');

      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
      expectLogContains(logs, 'debug', 'Fetching page 1');
      expectLogContains(logs, 'debug', 'Fetching page 2');
    });

    it('should log warning when maxPages limit is reached', async () => {
      const { logs, mockLogger } = createLoggerSpy();
      const client = createPaginatingClient(
        [
          {
            body: [{ id: 1 }],
            linkHeader: '<https://api.github.com/repos?page=2>; rel="next"',
          },
          {
            body: [{ id: 2 }],
            linkHeader: '<https://api.github.com/repos?page=3>; rel="next"',
          },
        ],
        mockLogger,
      );

      await paginateAll(client, '/repos', { maxPages: 2 });

      expect(mockLogger.warn).toHaveBeenCalled();
      expectLogContains(logs, 'warn', 'maximum page limit');
    });

    it('should not log warning when all pages consumed before maxPages', async () => {
      const { mockLogger } = createLoggerSpy();
      const client = createPaginatingClient(
        [{ body: [{ id: 1 }], linkHeader: null }],
        mockLogger,
      );

      await paginateAll(client, '/repos', { maxPages: 10 });

      expect(mockLogger.warn).not.toHaveBeenCalled();
    });
  });
});
