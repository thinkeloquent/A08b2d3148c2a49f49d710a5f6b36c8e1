import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FormatRequestSchema, FormatResultSchema, toJSON } from '../src/schemas.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(__dirname, '../../__fixtures__');

function loadFixture(filename) {
  const content = readFileSync(resolve(FIXTURES_DIR, filename), 'utf-8');
  return JSON.parse(content);
}

describe('Cross-language fixtures: format_request.json', () => {
  const fixture = loadFixture('format_request.json');
  const tests = fixture.format_request_tests;

  it('fixture contains test cases', () => {
    expect(tests.length).toBeGreaterThan(0);
  });

  for (const tc of tests) {
    it(`parses ${tc.id}: ${tc.name}`, () => {
      const result = FormatRequestSchema.parse(tc.input);
      expect(result.source).toBe(tc.input.source);
      expect(result.language).toBe(tc.input.language);
    });

    it(`round-trips ${tc.id}: ${tc.name}`, () => {
      const parsed = FormatRequestSchema.parse(tc.input);
      const serialized = toJSON(parsed);
      const reparsed = FormatRequestSchema.parse(serialized);
      expect(toJSON(reparsed)).toEqual(serialized);
    });
  }
});

describe('Cross-language fixtures: format_result.json', () => {
  const fixture = loadFixture('format_result.json');
  const tests = fixture.format_result_tests;

  it('fixture contains test cases', () => {
    expect(tests.length).toBeGreaterThan(0);
  });

  for (const tc of tests) {
    it(`parses ${tc.id}: ${tc.name}`, () => {
      const result = FormatResultSchema.parse(tc.input);
      expect(result.success).toBe(tc.input.success);
      expect(result.diagnostics).toHaveLength(
        tc.input.diagnostics ? tc.input.diagnostics.length : 0,
      );
    });

    it(`round-trips ${tc.id}: ${tc.name}`, () => {
      const parsed = FormatResultSchema.parse(tc.input);
      const serialized = toJSON(parsed);
      const reparsed = FormatResultSchema.parse(serialized);
      expect(toJSON(reparsed)).toEqual(serialized);
    });
  }
});
