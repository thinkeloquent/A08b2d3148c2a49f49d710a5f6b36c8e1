import { describe, expect, it, test } from 'vitest';
import { ImportExtractor } from '../src/extractor.js';

const extractor = new ImportExtractor();

describe('ImportExtractor.extractImports', () => {
  test.each<{ label: string; code: string; expected: [string, string[]][] }>([
    {
      label: 'default import',
      code: 'import X from "m";',
      expected: [['m', ['default: X']]],
    },
    {
      label: 'namespace import',
      code: 'import * as X from "m";',
      expected: [['m', ['namespace: X']]],
    },
    {
      label: 'single named import',
      code: 'import { A } from "m";',
      expected: [['m', ['named: A']]],
    },
    {
      label: 'aliased named import',
      code: 'import { A as B } from "m";',
      expected: [['m', ['named: A as B']]],
    },
    {
      label: 'default-as named import',
      code: 'import { default as X } from "m";',
      expected: [['m', ['named: default as X']]],
    },
    {
      label: 'multiple named imports',
      code: 'import { A, B } from "m";',
      expected: [['m', ['named: A', 'named: B']]],
    },
    {
      label: 'side-effect import',
      code: 'import "m";',
      expected: [['m', []]],
    },
    {
      label: 'default + named import',
      code: 'import X, { A } from "m";',
      expected: [['m', ['default: X', 'named: A']]],
    },
    {
      label: 'default + namespace import',
      code: 'import X, * as Y from "m";',
      expected: [['m', ['default: X', 'namespace: Y']]],
    },
  ])('$label: $code', ({ code, expected }) => {
    const result = extractor.extractImports(code);
    expect(result).toEqual(expected);
  });

  it('should handle multiple imports from different modules', () => {
    const code = `
      import A from "mod-a";
      import { B } from "mod-b";
      import "mod-c";
    `;
    const result = extractor.extractImports(code);
    expect(result).toEqual([
      ['mod-a', ['default: A']],
      ['mod-b', ['named: B']],
      ['mod-c', []],
    ]);
  });

  it('should handle TypeScript type imports', () => {
    const code = 'import type { T } from "m";';
    const result = extractor.extractImports(code);
    expect(result).toEqual([['m', ['named: T']]]);
  });

  it('should throw on invalid syntax', () => {
    const code = 'import {{{ from "m";';
    expect(() => extractor.extractImports(code)).toThrow();
  });
});
