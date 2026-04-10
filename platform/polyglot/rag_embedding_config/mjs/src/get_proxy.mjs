/**
 * @fileoverview Async proxy URL resolution for OpenAI-compatible embedding providers.
 *
 * Centralizes proxy lookup so it can be awaited from any transport builder.
 * Resolution order:
 *
 *   1. YAML `providers.openai_embeddings.proxy_url`
 *      - `false` → disabled (return undefined)
 *      - string  → use it
 *      - `null`  → inherit from global
 *   2. YAML `global.network.proxy_urls.{APP_ENV}`
 *   3. `OPENAI_EMBEDDINGS_PROXY_URL` env var
 *   4. undefined
 */

import { resolveOpenaiEnv } from '@internal/env-resolver';

const _openaiEnv = resolveOpenaiEnv();

const _TAG = '[embedding-kwargs-openai]';

/**
 * Return the resolved proxy URL for OpenAI embeddings.
 *
 * @param {object|null} [yamlCfg] - Optional YAML config object.
 * @param {(cfg: object|null, keys: string[], defaultValue?: *) => *} [yamlGet] - YAML getter function.
 * @returns {Promise<string|undefined>}
 */
export async function getProxy(yamlCfg = null, yamlGet = _defaultYamlGet) {
  return _resolve(yamlCfg, yamlGet);
}

/**
 * Synchronous variant of {@link getProxy}.
 *
 * @param {object|null} [yamlCfg]
 * @param {(cfg: object|null, keys: string[], defaultValue?: *) => *} [yamlGet]
 * @returns {string|undefined}
 */
export function getProxySync(yamlCfg = null, yamlGet = _defaultYamlGet) {
  return _resolve(yamlCfg, yamlGet);
}

/**
 * Shared resolution logic.
 * @param {object|null} yamlCfg
 * @param {(cfg: object|null, keys: string[], defaultValue?: *) => *} yamlGet
 * @returns {string|undefined}
 */
function _resolve(yamlCfg, yamlGet) {
  const providerProxy = yamlGet(yamlCfg, ['providers', 'openai_embeddings', 'proxy_url']);

  if (providerProxy !== undefined && providerProxy !== null) {
    if (providerProxy === false) {
      console.log(`${_TAG}   proxy: disabled (provider=false)`);
      return undefined;
    }
    if (typeof providerProxy === 'string' && providerProxy) {
      console.log(`${_TAG}   proxy: ${providerProxy} (provider)`);
      return providerProxy;
    }
  }

  // Inherit from global network config
  const appEnv = (process.env.APP_ENV || 'dev').toLowerCase();
  const globalProxy = yamlGet(yamlCfg, ['global', 'network', 'proxy_urls', appEnv]);
  if (globalProxy) {
    console.log(`${_TAG}   proxy: ${globalProxy} (global.network.proxy_urls.${appEnv})`);
    return globalProxy;
  }

  // Env var fallback
  const envProxy = _openaiEnv.embeddingsProxyUrl;
  if (envProxy) {
    console.log(`${_TAG}   proxy: ${envProxy} (env)`);
    return envProxy;
  }

  console.log(`${_TAG}   proxy: (none)`);
  return undefined;
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
