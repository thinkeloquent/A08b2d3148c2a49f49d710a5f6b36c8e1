import { describe, expect, test } from 'vitest';
import { ImportExtractor } from '../src/extractor.js';

const extractor = new ImportExtractor();

describe('ImportExtractor.extractExports', () => {
  test.each<{ label: string; code: string; expected: [string, string[]][] }>([
    {
      label: 'export default named function',
      code: 'export default function App() {}',
      expected: [['<self>', ['export-default: App']]],
    },
    {
      label: 'export default named class',
      code: 'export default class Name {}',
      expected: [['<self>', ['export-default: Name']]],
    },
    {
      label: 'export default anonymous arrow',
      code: 'export default () => {};',
      expected: [['<self>', ['export-default: <anonymous>']]],
    },
    {
      label: 'export const',
      code: 'export const foo = 1;',
      expected: [['<self>', ['export-named: foo']]],
    },
    {
      label: 'export function',
      code: 'export function bar() {}',
      expected: [['<self>', ['export-named: bar']]],
    },
    {
      label: 'export class',
      code: 'export class Baz {}',
      expected: [['<self>', ['export-named: Baz']]],
    },
    {
      label: 'export specifiers with alias',
      code: 'const a = 1; const b = 2; export { a, b as c };',
      expected: [['<self>', ['export-named: a', 'export-named: b as c']]],
    },
    {
      label: 're-export named specifier',
      code: "export { x } from 'm';",
      expected: [['m', ['export-named: x']]],
    },
    {
      label: 're-export aliased specifier',
      code: "export { x as y } from 'm';",
      expected: [['m', ['export-named: x as y']]],
    },
    {
      label: 'export all',
      code: "export * from 'm';",
      expected: [['m', ['export-all']]],
    },
    {
      label: 'export namespace',
      code: "export * as ns from 'm';",
      expected: [['m', ['export-namespace: ns']]],
    },
  ])('$label: $code', ({ code, expected }) => {
    const result = extractor.extractExports(code);
    expect(result).toEqual(expected);
  });
});
