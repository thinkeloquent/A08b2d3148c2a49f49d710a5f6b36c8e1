/**
 * Vite Environment Defaults Loader
 *
 * Reads default_envs from vite.yaml and returns a Vite `define` map.
 * Actual process.env values take precedence over YAML defaults.
 *
 * Usage in vite.config.ts:
 *   import { loadViteEnvDefaults } from '../../common/config/vite-env-defaults.mjs';
 *   export default defineConfig({ define: loadViteEnvDefaults() });
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VITE_YAML_PATH = resolve(__dirname, 'vite.yaml');

/**
 * Minimal parser for the default_envs section of vite.yaml.
 * Handles flat key: "value" and key: value lines under default_envs:.
 *
 * @param {string} yamlText - Raw YAML content
 * @returns {Record<string, string>} Parsed key-value pairs
 */
function parseDefaultEnvs(yamlText) {
  const lines = yamlText.split('\n');
  const result = {};
  let inSection = false;

  for (const line of lines) {
    const trimmed = line.trimEnd();

    // Detect start of default_envs section
    if (/^default_envs\s*:/.test(trimmed)) {
      inSection = true;
      continue;
    }

    // Exit section on next top-level key or blank line after section
    if (inSection && trimmed.length > 0 && !trimmed.startsWith(' ') && !trimmed.startsWith('\t')) {
      break;
    }

    if (!inSection) continue;

    // Parse indented key: value lines
    const match = trimmed.match(/^\s+(\w+)\s*:\s*(.+)$/);
    if (match) {
      const [, key, rawValue] = match;
      // Strip quotes if present
      result[key] = rawValue.replace(/^["']|["']$/g, '').trim();
    }
  }

  return result;
}

/**
 * Load vite.yaml default_envs and return a Vite `define` map.
 *
 * Resolution order per key:
 *   1. process.env[key] (actual environment)
 *   2. vite.yaml default_envs[key]
 *
 * Returns an object suitable for Vite's `define` option:
 *   { 'import.meta.env.VITE_GITHUB_BASE_URL': '"https://github.com"' }
 *
 * @param {object} [options]
 * @param {string} [options.yamlPath] - Override path to vite.yaml
 * @returns {Record<string, string>} Vite define map
 */
export function loadViteEnvDefaults(options = {}) {
  const yamlPath = options.yamlPath || VITE_YAML_PATH;

  let yamlText;
  try {
    yamlText = readFileSync(yamlPath, 'utf-8');
  } catch {
    return {};
  }

  const defaults = parseDefaultEnvs(yamlText);
  const define = {};

  for (const [key, defaultValue] of Object.entries(defaults)) {
    // Actual env var takes precedence over YAML default
    const value = process.env[key] || defaultValue;
    define[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return define;
}
