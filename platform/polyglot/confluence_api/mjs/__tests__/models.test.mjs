/**
 * Unit tests for confluence_api Zod model schemas.
 *
 * Tests cover:
 * - Statement coverage for schema parsing
 * - Branch coverage for optional fields, defaults
 * - Boundary value analysis (empty objects, missing fields)
 */

import { describe, it, expect } from 'vitest';
import {
  ValidationResultSchema,
  RestErrorSchema,
  PaginationLinksSchema,
  PaginatedResponseSchema,
  OperationCheckResultSchema,
  IconSchema,
  PersonSchema,
  ContentSchema,
  ContentCreateSchema,
  ContentUpdateSchema,
  SpaceSchema,
  SpaceCreateSchema,
  GroupSchema,
  LabelSchema,
  SearchResultSchema,
  ContainerSummarySchema,
  ServerInformationSchema,
  InstanceMetricsSchema,
} from '../src/models/index.mjs';

describe('Common Schemas', () => {
  describe('Statement Coverage', () => {
    it('should parse ValidationResult with defaults', () => {
      const result = ValidationResultSchema.parse({});
      expect(result.authorized).toBe(false);
      expect(result.valid).toBe(false);
      expect(result.successful).toBe(false);
    });

    it('should parse ValidationResult with values', () => {
      const result = ValidationResultSchema.parse({
        authorized: true,
        valid: true,
        successful: true,
        allowedInReadOnlyMode: true,
      });
      expect(result.authorized).toBe(true);
    });

    it('should parse RestError', () => {
      const result = RestErrorSchema.parse({
        statusCode: 404,
        message: 'Not found',
        reason: 'missing',
      });
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('Not found');
    });

    it('should parse PaginationLinks', () => {
      const result = PaginationLinksSchema.parse({
        base: 'http://conf.test',
        self: '/api/content',
        next: '/api/content?start=25',
      });
      expect(result.base).toBe('http://conf.test');
    });

    it('should parse PaginatedResponse with defaults', () => {
      const result = PaginatedResponseSchema.parse({});
      expect(result.results).toEqual([]);
      expect(result.start).toBe(0);
      expect(result.limit).toBe(25);
      expect(result.size).toBe(0);
    });

    it('should parse PaginatedResponse with results', () => {
      const result = PaginatedResponseSchema.parse({
        results: [{ id: '1' }, { id: '2' }],
        size: 2,
      });
      expect(result.results).toHaveLength(2);
    });

    it('should parse OperationCheckResult', () => {
      const result = OperationCheckResultSchema.parse({
        operation: 'update',
        targetType: 'page',
      });
      expect(result.operation).toBe('update');
    });
  });
});

describe('Content Schemas', () => {
  describe('Statement Coverage', () => {
    it('should parse Icon with all required fields', () => {
      const result = IconSchema.parse({ path: '', width: 0, height: 0, isDefault: false });
      expect(result.path).toBe('');
      expect(result.width).toBe(0);
    });

    it('should parse Icon with values', () => {
      const result = IconSchema.parse({ path: '/icon.png', width: 48, height: 48, isDefault: true });
      expect(result.isDefault).toBe(true);
    });

    it('should parse Person', () => {
      const result = PersonSchema.parse({
        displayName: 'John Doe',
        type: 'known',
      });
      expect(result.displayName).toBe('John Doe');
    });

    it('should parse Content with minimal data', () => {
      const result = ContentSchema.parse({});
      expect(result.id).toBeUndefined();
      expect(result.type).toBe('page');
      expect(result.title).toBe('');
    });

    it('should parse ContentCreate', () => {
      const result = ContentCreateSchema.parse({
        type: 'page',
        title: 'Test Page',
        space: { key: 'DEV' },
        body: { storage: { value: '<p>Hello</p>', representation: 'storage' } },
      });
      expect(result.type).toBe('page');
      expect(result.title).toBe('Test Page');
    });

    it('should parse ContentUpdate', () => {
      const result = ContentUpdateSchema.parse({
        version: { number: 2 },
        title: 'Updated Page',
        type: 'page',
      });
      expect(result.title).toBe('Updated Page');
    });
  });
});

describe('Space Schemas', () => {
  it('should parse Space with defaults', () => {
    const result = SpaceSchema.parse({});
    expect(result.key).toBe('');
    expect(result.name).toBe('');
  });

  it('should parse SpaceCreate', () => {
    const result = SpaceCreateSchema.parse({ key: 'DEV', name: 'Development' });
    expect(result.key).toBe('DEV');
  });
});

describe('Group and Label Schemas', () => {
  it('should parse Group', () => {
    const result = GroupSchema.parse({ name: 'developers' });
    expect(result.name).toBe('developers');
  });

  it('should parse Label', () => {
    const result = LabelSchema.parse({ name: 'architecture' });
    expect(result.name).toBe('architecture');
  });
});

describe('Search Schemas', () => {
  it('should parse SearchResult with defaults', () => {
    const result = SearchResultSchema.parse({});
    expect(result.title).toBe('');
  });

  it('should parse ContainerSummary', () => {
    const result = ContainerSummarySchema.parse({});
    expect(result.title).toBe('');
  });
});

describe('System Schemas', () => {
  it('should parse ServerInformation', () => {
    const result = ServerInformationSchema.parse({
      baseUrl: 'https://conf.test',
      version: '9.2.3',
    });
    expect(result.version).toBe('9.2.3');
  });

  it('should parse InstanceMetrics', () => {
    const result = InstanceMetricsSchema.parse({});
    expect(result).toBeDefined();
  });
});
