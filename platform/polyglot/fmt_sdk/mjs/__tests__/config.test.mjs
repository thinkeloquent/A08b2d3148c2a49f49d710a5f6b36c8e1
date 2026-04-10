import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../src/config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = resolve(__dirname, '../../__fixtures__/config.toml');

describe('loadConfig', () => {
  it('loads the config file without error', () => {
    const config = loadConfig(FIXTURE_PATH);
    expect(config).toBeDefined();
    expect(config.formatters).toBeDefined();
  });

  it('loads exactly 4 formatters', () => {
    const config = loadConfig(FIXTURE_PATH);
    const names = Object.keys(config.formatters);
    expect(names).toHaveLength(4);
    expect(names).toEqual(expect.arrayContaining(['go', 'python', 'node', 'rust']));
  });

  it('go formatter has correct fields', () => {
    const { formatters } = loadConfig(FIXTURE_PATH);
    const go = formatters.go;
    expect(go.command).toBe('gofmt');
    expect(go.args).toEqual(['-w']);
    expect(go.extensions).toEqual(['.go']);
    expect(go.includes).toEqual(['**/*.go']);
    expect(go.excludes).toEqual(['vendor/**']);
  });

  it('python formatter has correct fields', () => {
    const { formatters } = loadConfig(FIXTURE_PATH);
    const py = formatters.python;
    expect(py.command).toBe('ruff');
    expect(py.args).toEqual(['format', '--check']);
    expect(py.extensions).toEqual(['.py']);
    expect(py.excludes).toEqual(['__pycache__/**', '.venv/**']);
  });

  it('node formatter has 4 extensions including .mjs', () => {
    const { formatters } = loadConfig(FIXTURE_PATH);
    const node = formatters.node;
    expect(node.command).toBe('biome');
    expect(node.args).toEqual(['format', '--write']);
    expect(node.extensions).toHaveLength(4);
    expect(node.extensions).toContain('.mjs');
    expect(node.extensions).toEqual(['.js', '.ts', '.mjs', '.mts']);
  });

  it('rust formatter has correct fields', () => {
    const { formatters } = loadConfig(FIXTURE_PATH);
    const rust = formatters.rust;
    expect(rust.command).toBe('rustfmt');
    expect(rust.args).toEqual(['--edition', '2021']);
    expect(rust.extensions).toEqual(['.rs']);
    expect(rust.includes).toEqual(['src/**/*.rs']);
    expect(rust.excludes).toEqual(['target/**']);
  });

  it('throws on non-existent file', () => {
    expect(() => loadConfig('/nonexistent/path.toml')).toThrow();
  });
});
