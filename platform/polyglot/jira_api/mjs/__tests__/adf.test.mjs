/**
 * Unit tests for utils/adf.mjs
 */
import { describe, it, expect } from 'vitest';
import { textToAdf, commentToAdf } from '../src/utils/adf.mjs';

describe('textToAdf', () => {
  describe('Statement Coverage', () => {
    it('converts plain text to ADF document', () => {
      const result = textToAdf('Hello world');
      expect(result.type).toBe('doc');
      expect(result.version).toBe(1);
      expect(result.content[0].type).toBe('paragraph');
      expect(result.content[0].content[0].text).toBe('Hello world');
    });
  });

  describe('Branch Coverage', () => {
    it('returns null for empty string', () => {
      expect(textToAdf('')).toBeNull();
    });

    it('returns null for null', () => {
      expect(textToAdf(null)).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(textToAdf(undefined)).toBeNull();
    });
  });

  describe('Boundary Values', () => {
    it('handles single character', () => {
      expect(textToAdf('a').content[0].content[0].text).toBe('a');
    });

    it('converts number to string', () => {
      expect(textToAdf(42).content[0].content[0].text).toBe('42');
    });

    it('handles multiline text', () => {
      const result = textToAdf('line1\nline2');
      expect(result.content[0].content[0].text).toContain('line1\nline2');
    });
  });
});

describe('commentToAdf', () => {
  describe('Statement Coverage', () => {
    it('wraps text in body', () => {
      const result = commentToAdf('comment');
      expect(result.body).toBeDefined();
      expect(result.body.type).toBe('doc');
    });
  });

  describe('Branch Coverage', () => {
    it('returns null for empty', () => {
      expect(commentToAdf('')).toBeNull();
    });

    it('returns null for null', () => {
      expect(commentToAdf(null)).toBeNull();
    });
  });
});
