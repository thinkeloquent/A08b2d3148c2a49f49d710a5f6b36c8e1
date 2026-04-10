import { describe, it, expect } from 'vitest';
import { extractJson } from '../src/json-extractor.mjs';
import { buildFormatInstructions } from '../src/structured-output.mjs';

describe('extractJson', () => {
  it('should pass through plain JSON', () => {
    expect(extractJson('{"key": "value"}')).toBe('{"key": "value"}');
  });

  it('should strip json markdown fence', () => {
    expect(extractJson('```json\n{"key": "value"}\n```')).toBe('{"key": "value"}');
  });

  it('should strip generic fence', () => {
    expect(extractJson('```\n{"key": "value"}\n```')).toBe('{"key": "value"}');
  });

  it('should find JSON object in surrounding text', () => {
    const result = extractJson('Here is the result: {"key": "value"} and more');
    expect(result).toContain('"key"');
  });

  it('should return original text when no JSON found', () => {
    expect(extractJson('just plain text')).toBe('just plain text');
  });

  it('should handle JSON arrays', () => {
    expect(extractJson('```json\n[1, 2, 3]\n```')).toBe('[1, 2, 3]');
  });

  it('should handle nested JSON', () => {
    const input = '{"outer": {"inner": "value"}}';
    expect(extractJson(input)).toBe(input);
  });

  it('should handle whitespace', () => {
    expect(extractJson('  \n  {"key": "value"}  \n  ')).toBe('{"key": "value"}');
  });
});

describe('buildFormatInstructions', () => {
  it('should return empty for markdown', () => {
    expect(buildFormatInstructions('markdown')).toBe('');
  });

  it('should build JSON instructions', () => {
    const result = buildFormatInstructions('json');
    expect(result).toContain('JSON');
    expect(result).toContain('MUST');
  });

  it('should build schema instructions', () => {
    const result = buildFormatInstructions('json', 'json_schema', '{"type": "object"}');
    expect(result).toContain('JSON Schema');
    expect(result).toContain('{"type": "object"}');
  });
});
