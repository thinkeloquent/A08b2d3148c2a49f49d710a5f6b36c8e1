import { describe, it, expect } from 'vitest';
import {
  compareValues,
  getFieldChanges,
  hasChanges,
  formatValue,
} from '@/lib/diff';

describe('diff utilities', () => {
  describe('compareValues', () => {
    it('compares primitive values', () => {
      expect(compareValues('a', 'a')).toBe(true);
      expect(compareValues('a', 'b')).toBe(false);
      expect(compareValues(1, 1)).toBe(true);
      expect(compareValues(1, 2)).toBe(false);
      expect(compareValues(true, true)).toBe(true);
      expect(compareValues(true, false)).toBe(false);
    });

    it('compares arrays', () => {
      expect(compareValues([1, 2], [1, 2])).toBe(true);
      expect(compareValues([1, 2], [1, 3])).toBe(false);
      expect(compareValues([1, 2], [1, 2, 3])).toBe(false);
      expect(compareValues([], [])).toBe(true);
    });

    it('compares objects', () => {
      expect(compareValues({ a: 1 }, { a: 1 })).toBe(true);
      expect(compareValues({ a: 1 }, { a: 2 })).toBe(false);
      expect(compareValues({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it('handles different types', () => {
      expect(compareValues('1', 1)).toBe(false);
      expect(compareValues(null, undefined)).toBe(false);
    });
  });

  describe('getFieldChanges', () => {
    it('detects unchanged fields', () => {
      const original = { name: 'test', value: 1 };
      const modified = { name: 'test', value: 1 };
      const changes = getFieldChanges(original, modified, ['name', 'value']);

      expect(changes).toHaveLength(2);
      expect(changes[0].type).toBe('unchanged');
      expect(changes[1].type).toBe('unchanged');
    });

    it('detects modified fields', () => {
      const original = { name: 'test', value: 1 };
      const modified = { name: 'changed', value: 2 };
      const changes = getFieldChanges(original, modified, ['name', 'value']);

      expect(changes).toHaveLength(2);
      expect(changes[0].type).toBe('modified');
      expect(changes[0].oldValue).toBe('test');
      expect(changes[0].newValue).toBe('changed');
    });

    it('detects added fields', () => {
      const original = { name: '' };
      const modified = { name: 'new value' };
      const changes = getFieldChanges(original, modified, ['name']);

      expect(changes[0].type).toBe('added');
    });

    it('detects removed fields', () => {
      const original = { name: 'value' };
      const modified = { name: '' };
      const changes = getFieldChanges(original, modified, ['name']);

      expect(changes[0].type).toBe('removed');
    });
  });

  describe('hasChanges', () => {
    it('returns false when no changes', () => {
      const original = { name: 'test', value: 1 };
      const modified = { name: 'test', value: 1 };
      expect(hasChanges(original, modified, ['name', 'value'])).toBe(false);
    });

    it('returns true when there are changes', () => {
      const original = { name: 'test', value: 1 };
      const modified = { name: 'changed', value: 1 };
      expect(hasChanges(original, modified, ['name', 'value'])).toBe(true);
    });
  });

  describe('formatValue', () => {
    it('formats null/undefined as dash', () => {
      expect(formatValue(null)).toBe('-');
      expect(formatValue(undefined)).toBe('-');
    });

    it('formats arrays', () => {
      expect(formatValue(['a', 'b', 'c'])).toBe('a, b, c');
      expect(formatValue([])).toBe('-');
    });

    it('formats booleans', () => {
      expect(formatValue(true)).toBe('Yes');
      expect(formatValue(false)).toBe('No');
    });

    it('formats primitives', () => {
      expect(formatValue('test')).toBe('test');
      expect(formatValue(123)).toBe('123');
    });
  });
});
