import { describe, it, expect } from 'vitest';
import {
  LanguageSchema,
  SeveritySchema,
  FormatRequestSchema,
  FormatResultSchema,
  DiagnosticSchema,
  toJSON,
} from '../src/schemas.mjs';

describe('LanguageSchema', () => {
  const expected = ['go', 'python', 'node', 'rust', 'shell', 'sql', 'markup'];

  it('accepts all valid language values', () => {
    for (const lang of expected) {
      expect(LanguageSchema.parse(lang)).toBe(lang);
    }
  });

  it('has exactly the expected enum values', () => {
    expect(LanguageSchema.options).toEqual(expected);
  });

  it('rejects invalid language', () => {
    expect(() => LanguageSchema.parse('java')).toThrow();
    expect(() => LanguageSchema.parse('')).toThrow();
    expect(() => LanguageSchema.parse(123)).toThrow();
  });
});

describe('SeveritySchema', () => {
  const expected = ['error', 'warning', 'info', 'hint'];

  it('accepts all valid severity values', () => {
    for (const sev of expected) {
      expect(SeveritySchema.parse(sev)).toBe(sev);
    }
  });

  it('has exactly the expected enum values', () => {
    expect(SeveritySchema.options).toEqual(expected);
  });

  it('rejects invalid severity', () => {
    expect(() => SeveritySchema.parse('critical')).toThrow();
  });
});

describe('FormatRequestSchema', () => {
  it('parses a full request', () => {
    const input = {
      source: 'const x = 1;\n',
      language: 'node',
      options: { semicolons: true },
      context: { caller: 'test' },
    };
    const result = FormatRequestSchema.parse(input);
    expect(result.source).toBe(input.source);
    expect(result.language).toBe('node');
    expect(result.options).toEqual({ semicolons: true });
    expect(result.context).toEqual({ caller: 'test' });
  });

  it('parses a minimal request (no options/context)', () => {
    const input = { source: 'x = 1\n', language: 'python' };
    const result = FormatRequestSchema.parse(input);
    expect(result.source).toBe('x = 1\n');
    expect(result.language).toBe('python');
    expect(result.options).toBeUndefined();
    expect(result.context).toBeUndefined();
  });

  it('round-trips through JSON without loss', () => {
    const input = {
      source: 'package main\n',
      language: 'go',
      options: { tab_width: 4 },
      context: { workspace: '/repo' },
    };
    const parsed = FormatRequestSchema.parse(input);
    const serialized = toJSON(parsed);
    const reparsed = FormatRequestSchema.parse(serialized);
    expect(reparsed).toEqual(parsed);
  });

  it('optional fields absent from JSON when undefined', () => {
    const input = { source: 'x = 1\n', language: 'python' };
    const parsed = FormatRequestSchema.parse(input);
    const json = toJSON(parsed);
    expect(Object.keys(json)).toEqual(['source', 'language']);
    expect('options' in json).toBe(false);
    expect('context' in json).toBe(false);
  });

  it('rejects missing source', () => {
    expect(() => FormatRequestSchema.parse({ language: 'go' })).toThrow();
  });

  it('rejects missing language', () => {
    expect(() => FormatRequestSchema.parse({ source: 'x' })).toThrow();
  });
});

describe('FormatResultSchema', () => {
  it('parses a successful result', () => {
    const input = {
      success: true,
      formatted: 'const x = 1;\n',
      diagnostics: [],
      metadata: { duration_ms: 5 },
    };
    const result = FormatResultSchema.parse(input);
    expect(result.success).toBe(true);
    expect(result.formatted).toBe('const x = 1;\n');
    expect(result.diagnostics).toEqual([]);
    expect(result.metadata).toEqual({ duration_ms: 5 });
  });

  it('diagnostics array defaults to empty', () => {
    const input = { success: true };
    const result = FormatResultSchema.parse(input);
    expect(result.diagnostics).toEqual([]);
  });

  it('parses a failure result with diagnostics', () => {
    const input = {
      success: false,
      diagnostics: [
        {
          file: 'main.go',
          line: 5,
          column: 10,
          severity: 'error',
          message: "expected ';', found 'EOF'",
          rule: 'syntax',
        },
      ],
    };
    const result = FormatResultSchema.parse(input);
    expect(result.success).toBe(false);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].severity).toBe('error');
    expect(result.diagnostics[0].file).toBe('main.go');
  });

  it('round-trips through JSON without loss', () => {
    const input = {
      success: true,
      formatted: 'fn main() {}\n',
      diff: '@@ some diff @@',
      diagnostics: [{ severity: 'warning', message: 'unused var' }],
      metadata: { formatter: 'rustfmt' },
    };
    const parsed = FormatResultSchema.parse(input);
    const serialized = toJSON(parsed);
    const reparsed = FormatResultSchema.parse(serialized);
    expect(reparsed).toEqual(parsed);
  });

  it('optional fields absent from JSON when undefined', () => {
    const input = { success: true };
    const parsed = FormatResultSchema.parse(input);
    const json = toJSON(parsed);
    expect('formatted' in json).toBe(false);
    expect('diff' in json).toBe(false);
    expect('metadata' in json).toBe(false);
    // diagnostics should be present (defaults to [])
    expect(json.diagnostics).toEqual([]);
  });
});

describe('DiagnosticSchema', () => {
  it('parses a full diagnostic', () => {
    const input = {
      file: 'app.mjs',
      line: 10,
      column: 5,
      severity: 'warning',
      message: 'Prefer const over let',
      rule: 'prefer-const',
    };
    const result = DiagnosticSchema.parse(input);
    expect(result).toEqual(input);
  });

  it('parses a minimal diagnostic (severity + message only)', () => {
    const input = { severity: 'info', message: 'Formatted 0 of 1 files' };
    const result = DiagnosticSchema.parse(input);
    expect(result.severity).toBe('info');
    expect(result.message).toBe('Formatted 0 of 1 files');
    expect(result.file).toBeUndefined();
    expect(result.line).toBeUndefined();
  });

  it('rejects non-integer line numbers', () => {
    expect(() =>
      DiagnosticSchema.parse({ severity: 'error', message: 'err', line: 1.5 }),
    ).toThrow();
  });
});

describe('toJSON', () => {
  it('strips undefined values', () => {
    const obj = { a: 1, b: undefined, c: 'hello' };
    const result = toJSON(obj);
    expect(result).toEqual({ a: 1, c: 'hello' });
    expect('b' in result).toBe(false);
  });
});
