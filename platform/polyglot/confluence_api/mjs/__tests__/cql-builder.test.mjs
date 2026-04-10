/**
 * Unit tests for the confluence_api CQL builder module.
 *
 * Tests cover:
 * - Statement coverage for all builder methods
 * - Branch coverage for order direction, empty build
 * - Boundary value analysis (special characters, single items)
 * - Error handling (missing field, empty build)
 */

import { describe, it, expect } from 'vitest';
import { CQLBuilder, cql } from '../src/utils/cql-builder.mjs';

describe('CQLBuilder', () => {
  describe('Statement Coverage', () => {
    it('should produce equality condition', () => {
      const result = cql('type').equals('page').build();
      expect(result).toBe('type = "page"');
    });

    it('should produce not-equals condition', () => {
      const result = cql('type').notEquals('comment').build();
      expect(result).toBe('type != "comment"');
    });

    it('should produce contains condition', () => {
      const result = cql('title').contains('architecture').build();
      expect(result).toBe('title ~ "architecture"');
    });

    it('should produce not-contains condition', () => {
      const result = cql('title').notContains('draft').build();
      expect(result).toBe('title !~ "draft"');
    });

    it('should produce IN clause', () => {
      const result = cql('space').inList(['DEV', 'OPS']).build();
      expect(result).toBe('space in ("DEV", "OPS")');
    });

    it('should produce NOT IN clause', () => {
      const result = cql('space').notInList(['TEST']).build();
      expect(result).toBe('space not in ("TEST")');
    });

    it('should produce IS NOT NULL', () => {
      const result = cql('label').isNotNull().build();
      expect(result).toBe('label is not null');
    });

    it('should produce IS NULL', () => {
      const result = cql('label').isNull().build();
      expect(result).toBe('label is null');
    });

    it('should join with AND', () => {
      const result = cql('type')
        .equals('page')
        .and()
        .field('space')
        .equals('DEV')
        .build();
      expect(result).toBe('type = "page" AND space = "DEV"');
    });

    it('should join with OR', () => {
      const result = cql('space')
        .equals('DEV')
        .or()
        .field('space')
        .equals('OPS')
        .build();
      expect(result).toBe('space = "DEV" OR space = "OPS"');
    });

    it('should add NOT prefix', () => {
      const result = new CQLBuilder()
        .not()
        .field('type')
        .equals('comment')
        .build();
      expect(result).toBe('NOT type = "comment"');
    });

    it('should add ORDER BY ASC', () => {
      const result = cql('type').equals('page').orderBy('created', 'ASC').build();
      expect(result).toContain('ORDER BY created ASC');
    });

    it('should add ORDER BY DESC', () => {
      const result = cql('type')
        .equals('page')
        .orderBy('lastModified', 'DESC')
        .build();
      expect(result).toContain('ORDER BY lastModified DESC');
    });

    it('should build complex query', () => {
      const result = cql('type')
        .equals('page')
        .and()
        .field('space')
        .equals('DEV')
        .and()
        .field('title')
        .contains('architecture')
        .orderBy('lastModified', 'DESC')
        .build();
      expect(result).toBe(
        'type = "page" AND space = "DEV" AND title ~ "architecture" ORDER BY lastModified DESC',
      );
    });
  });

  describe('Branch Coverage', () => {
    it('should default ORDER BY to ASC', () => {
      const result = cql('type').equals('page').orderBy('created').build();
      expect(result).toContain('ORDER BY created ASC');
    });

    it('should not include ORDER BY if not specified', () => {
      const result = cql('type').equals('page').build();
      expect(result).not.toContain('ORDER BY');
    });
  });

  describe('Boundary Values', () => {
    it('should escape double quotes in values', () => {
      const result = cql('title').equals('say "hello"').build();
      expect(result).toBe('title = "say \\"hello\\""');
    });

    it('should escape backslashes in values', () => {
      const result = cql('title').equals('path\\to\\file').build();
      expect(result).toBe('title = "path\\\\to\\\\file"');
    });

    it('should handle single-item in list', () => {
      const result = cql('space').inList(['DEV']).build();
      expect(result).toBe('space in ("DEV")');
    });

    it('should return CQLBuilder instance from field()', () => {
      const builder = new CQLBuilder();
      const returned = builder.field('space');
      expect(returned).toBe(builder);
    });
  });

  describe('Error Handling', () => {
    it('should throw when building empty query', () => {
      expect(() => new CQLBuilder().build()).toThrow(/empty/);
    });

    it('should throw when calling equals without field', () => {
      expect(() => new CQLBuilder().equals('value')).toThrow(/field/);
    });

    it('should throw when calling contains without field', () => {
      expect(() => new CQLBuilder().contains('value')).toThrow(/field/);
    });

    it('should throw when calling inList without field', () => {
      expect(() => new CQLBuilder().inList(['a'])).toThrow(/field/);
    });
  });
});

describe('cql() shortcut', () => {
  it('should return CQLBuilder instance', () => {
    expect(cql('space')).toBeInstanceOf(CQLBuilder);
  });

  it('should set initial field', () => {
    const result = cql('space').equals('DEV').build();
    expect(result).toBe('space = "DEV"');
  });
});
