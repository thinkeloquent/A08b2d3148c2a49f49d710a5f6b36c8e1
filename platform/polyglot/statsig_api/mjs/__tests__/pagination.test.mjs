/**
 * Unit tests for pagination module.
 *
 * Tests cover:
 * - Statement coverage for paginate() and listAll()
 * - Branch coverage for pagination links and response formats
 * - Boundary values for empty data and missing fields
 */

import { describe, it, expect, vi } from 'vitest';
import { paginate, listAll } from '../src/pagination.mjs';

function createMockClient(responses) {
  let callIndex = 0;
  return {
    get: vi.fn(async () => {
      const resp = responses[callIndex] || { data: [] };
      callIndex++;
      return resp;
    }),
  };
}

describe('paginate', () => {
  describe('Statement Coverage', () => {
    it('should yield single page', async () => {
      const client = createMockClient([
        { data: [{ id: 'g1' }, { id: 'g2' }], pagination: {} },
      ]);

      const pages = [];
      for await (const page of paginate(client, '/gates')) {
        pages.push(page);
      }

      expect(pages).toHaveLength(1);
      expect(pages[0]).toHaveLength(2);
      expect(client.get).toHaveBeenCalledTimes(1);
    });

    it('should yield multiple pages', async () => {
      const client = createMockClient([
        {
          data: [{ id: 'g1' }],
          pagination: { nextPage: 'https://api.com/gates?page=2' },
        },
        {
          data: [{ id: 'g2' }],
          pagination: {},
        },
      ]);

      const pages = [];
      for await (const page of paginate(client, '/gates')) {
        pages.push(page);
      }

      expect(pages).toHaveLength(2);
      expect(pages[0]).toEqual([{ id: 'g1' }]);
      expect(pages[1]).toEqual([{ id: 'g2' }]);
    });
  });

  describe('Branch Coverage', () => {
    it('should stop when nextPage is null', async () => {
      const client = createMockClient([
        { data: [{ id: 'x' }], pagination: { nextPage: null } },
      ]);

      const pages = [];
      for await (const page of paginate(client, '/test')) {
        pages.push(page);
      }

      expect(pages).toHaveLength(1);
    });

    it('should handle response without pagination key', async () => {
      const client = createMockClient([{ data: [{ id: 'y' }] }]);

      const pages = [];
      for await (const page of paginate(client, '/test')) {
        pages.push(page);
      }

      expect(pages).toHaveLength(1);
    });

    it('should handle array response without data key', async () => {
      const client = createMockClient([[{ id: 'z' }]]);

      const pages = [];
      for await (const page of paginate(client, '/test')) {
        pages.push(page);
      }

      expect(pages).toHaveLength(1);
      expect(pages[0]).toEqual([{ id: 'z' }]);
    });
  });

  describe('Boundary Values', () => {
    it('should yield empty array for empty data', async () => {
      const client = createMockClient([{ data: [], pagination: {} }]);

      const pages = [];
      for await (const page of paginate(client, '/empty')) {
        pages.push(page);
      }

      expect(pages).toEqual([[]]);
    });

    it('should handle null response', async () => {
      const client = createMockClient([null]);

      const pages = [];
      for await (const page of paginate(client, '/null')) {
        pages.push(page);
      }

      expect(pages).toEqual([[]]);
    });
  });
});

describe('listAll', () => {
  describe('Statement Coverage', () => {
    it('should collect all pages into flat array', async () => {
      const client = createMockClient([
        {
          data: [{ id: 'a' }, { id: 'b' }],
          pagination: { nextPage: 'https://api.com/x?page=2' },
        },
        {
          data: [{ id: 'c' }],
          pagination: {},
        },
      ]);

      const result = await listAll(client, '/x');
      expect(result).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    });
  });

  describe('Boundary Values', () => {
    it('should return empty array for empty result', async () => {
      const client = createMockClient([{ data: [], pagination: {} }]);
      const result = await listAll(client, '/empty');
      expect(result).toEqual([]);
    });
  });
});
