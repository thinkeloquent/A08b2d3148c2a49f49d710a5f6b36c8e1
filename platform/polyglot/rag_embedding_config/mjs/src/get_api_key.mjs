/**
 * @fileoverview Async API key resolution for OpenAI-compatible embedding providers.
 *
 * Centralizes API key lookup so it can be awaited from any transport builder.
 * Resolution order (first non-empty wins):
 *
 *   1. YAML `providers.openai_embeddings.endpoint_api_key`
 *   2. `OPENAI_EMBEDDINGS_API_KEY` env var
 *   3. `OPENAI_API_KEY` env var
 *   4. Empty string (allow provider to fail with its own error)
 */

import { resolveOpenaiEnv } from '@internal/env-resolver';

const _openaiEnv = resolveOpenaiEnv();

/**
 * Return the resolved API key for OpenAI embeddings.
 *
 * @param {object|null} [yamlCfg] - Optional YAML config object (AppYamlConfig instance or resolved dict).
 *   When `null`/`undefined` the YAML layer is skipped and only env vars are checked.
 * @param {(cfg: object|null, keys: string[], defaultValue?: *) => *} [yamlGet] - YAML getter function.
 * @returns {Promise<string>}
 */
export async function getApiKey(yamlCfg = null, yamlGet = _defaultYamlGet) {
  return (
    yamlGet(yamlCfg, ['providers', 'openai_embeddings', 'endpoint_api_key'])
    || _openaiEnv.embeddingsApiKey
    || _openaiEnv.apiKey
    || ''
  );
}

/**
 * Synchronous variant of {@link getApiKey}.
 *
 * @param {object|null} [yamlCfg]
 * @param {(cfg: object|null, keys: string[], defaultValue?: *) => *} [yamlGet]
 * @returns {string}
 */
export function getApiKeySync(yamlCfg = null, yamlGet = _defaultYamlGet) {
  return (
    yamlGet(yamlCfg, ['providers', 'openai_embeddings', 'endpoint_api_key'])
    || _openaiEnv.embeddingsApiKey
    || _openaiEnv.apiKey
    || ''
  );
}

/**
 * Minimal fallback yaml getter when no custom one is provided.
 * @param {object|null} cfg
 * @param {string[]} keys
 * @param {*} [defaultValue]
 * @returns {*}
 */
function _defaultYamlGet(cfg, keys, defaultValue = undefined) {
  if (!cfg) return defaultValue;
  if (typeof cfg.getNested === 'function') {
    return cfg.getNested(keys, defaultValue) ?? defaultValue;
  }
  let current = cfg;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  return current;
}
