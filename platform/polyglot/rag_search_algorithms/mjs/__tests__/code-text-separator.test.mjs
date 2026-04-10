import { describe, it, expect } from 'vitest';
import { separateCodeText, CODE_FILE_EXTENSIONS } from '../src/code-text-separator.mjs';
import { contentHash } from '../src/content-hash.mjs';

describe('contentHash', () => {
  it('should be deterministic', () => {
    expect(contentHash('hello')).toBe(contentHash('hello'));
  });

  it('should differ for different inputs', () => {
    expect(contentHash('hello')).not.toBe(contentHash('world'));
  });

  it('should return a 32-char hex string', () => {
    const result = contentHash('test');
    expect(result).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe('CODE_FILE_EXTENSIONS', () => {
  it('should contain common extensions', () => {
    expect(CODE_FILE_EXTENSIONS.has('.ts')).toBe(true);
    expect(CODE_FILE_EXTENSIONS.has('.tsx')).toBe(true);
    expect(CODE_FILE_EXTENSIONS.has('.js')).toBe(true);
    expect(CODE_FILE_EXTENSIONS.has('.py')).toBe(true);
    expect(CODE_FILE_EXTENSIONS.has('.css')).toBe(true);
  });

  it('should not contain text extensions', () => {
    expect(CODE_FILE_EXTENSIONS.has('.txt')).toBe(false);
    expect(CODE_FILE_EXTENSIONS.has('.md')).toBe(false);
  });
});

describe('separateCodeText', () => {
  it('should return empty for empty content', () => {
    expect(separateCodeText('')).toEqual({ codeParts: [], textParts: [] });
  });

  it('should treat code files as all code', () => {
    const result = separateCodeText('const x = 1;', 'test.ts');
    expect(result.codeParts).toHaveLength(1);
    expect(result.textParts).toHaveLength(0);
  });

  it('should extract fenced code blocks', () => {
    const content = 'Some text\n\n```js\nconst x = 1;\n```\n\nMore text';
    const result = separateCodeText(content);
    expect(result.codeParts.length).toBeGreaterThan(0);
  });

  it('should classify plain text', () => {
    const content = 'This is just regular text about components.';
    const result = separateCodeText(content);
    expect(result.textParts.length).toBeGreaterThan(0);
  });
});
