/**
 * @module config
 * @description TOML config parser for formatter definitions.
 *
 * Usage:
 *   import { loadConfig } from './config.mjs';
 *   const config = loadConfig('./polyglot.toml');
 *   console.log(config.formatters.go.command); // 'gofmt'
 */

import TOML from '@iarna/toml';
import { readFileSync } from 'node:fs';

/**
 * Load a TOML formatter config file.
 *
 * @param {string} path - Path to the TOML config file
 * @returns {{ formatters: Record<string, { command: string, args: string[], extensions: string[], includes: string[], excludes: string[] }> }}
 */
export function loadConfig(path) {
  const content = readFileSync(path, 'utf-8');
  const data = TOML.parse(content);
  const formatters = {};
  for (const [name, entry] of Object.entries(data.formatter || {})) {
    formatters[name] = {
      command: entry.command,
      args: entry.args || [],
      extensions: entry.extensions || [],
      includes: entry.includes || [],
      excludes: entry.excludes || [],
    };
  }
  return { formatters };
}
