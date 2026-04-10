/**
 * @fileoverview Centralized kwargs builder for OpenAI-compatible embeddings.
 *
 * Resolves config using a YAML-first cascade:
 *   1. YAML `providers.openai_embeddings.*` (via AppYamlConfig singleton)
 *   2. Environment variable
 *   3. Hardcoded default
 *
 * Environment variables (all optional -- omit to use OpenAI defaults):
 *
 *   OPENAI_EMBEDDINGS_BASE_URL   Custom API base URL
 *   OPENAI_EMBEDDINGS_API_KEY    API key (overrides OPENAI_API_KEY)
 *   OPENAI_EMBEDDINGS_ORG        Organization ID
 *   OPENAI_EMBEDDINGS_PROXY_URL  HTTP/SOCKS proxy for outbound requests
 *   OPENAI_EMBEDDINGS_TIMEOUT    Request timeout in ms (default: 120000)
 *   OPENAI_EMBEDDINGS_CA_BUNDLE  Path to CA certificate bundle
 */

import { DEFAULT_BASE_URL } from './constants.mjs';
import { resolveOpenaiEnv } from '@internal/env-resolver';

const _openaiEnv = resolveOpenaiEnv();

const _TAG = '[embedding-kwargs-openai]';

// ------------------------------------------------------------------
// YAML config helpers
// ------------------------------------------------------------------

/**
 * Return the AppYamlConfig singleton or null when unavailable.
 * CLI usage (no Fastify lifecycle) will not have initialized it,
 * so we silently fall through to env vars.
 * @returns {Promise<object|null>}
 */
async function _tryYamlConfig() {
  try {
    const { AppYamlConfig } = /** @type {any} */ (
      await import('@internal/app-yaml-static-config')
    );
    return AppYamlConfig.getInstance();
  } catch {
    return null;
  }
}

/**
 * Safe nested get that tolerates null config.
 * @param {object|null} yamlCfg
 * @param {string[]} keys
 * @param {*} [defaultValue]
 * @returns {*}
 */
function _yamlGet(yamlCfg, keys, defaultValue = undefined) {
  if (!yamlCfg) return defaultValue;
  return yamlCfg.getNested(keys, defaultValue) ?? defaultValue;
}


// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/**
 * Mask an API key for logging.
 * @param {string} key
 * @returns {string}
 */
function _maskKey(key) {
  if (!key) return '(not set)';
  return key.length > 8 ? key.slice(0, 4) + '...' + key.slice(-4) : '****';
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

/**
 * Build kwargs for `new EmbeddingClient(opts)` using YAML-first cascade.
 *
 * @param {{ embeddingsModelName: string }} cfg
 * @returns {Promise<import('./types.mjs').EmbeddingClientOptions>}
 */
export async function getOpenAIKwargs(cfg) {
  const yamlCfg = await _tryYamlConfig();
  const yamlSource = yamlCfg ? 'yaml' : 'env-only';
  console.log(`${_TAG} _resolveConfig (source=${yamlSource})`);

  // --- baseUrl ---
  const baseUrl = (
    _yamlGet(yamlCfg, ['providers', 'openai_embeddings', 'base_url'])
    || _openaiEnv.embeddingsBaseUrl
    || DEFAULT_BASE_URL
  ).replace(/\/+$/, '');

  // --- apiKey ---
  const { getApiKeySync } = await import('./get_api_key.mjs');
  const apiKey = getApiKeySync(yamlCfg, _yamlGet);

  // --- organization ---
  const organization =
    _yamlGet(yamlCfg, ['providers', 'openai_embeddings', 'organization'])
    || _openaiEnv.embeddingsOrg
    || undefined;

  // --- timeout ---
  const yamlTimeout = _yamlGet(yamlCfg, ['providers', 'openai_embeddings', 'client', 'timeout_seconds']);
  const timeoutStr = _openaiEnv.embeddingsTimeout;
  let timeout;
  if (yamlTimeout != null) {
    timeout = Number(yamlTimeout) * 1000; // YAML is in seconds, JS uses ms
  } else if (timeoutStr) {
    timeout = Number(timeoutStr);
  } else {
    timeout = 120_000;
  }

  // --- caBundle ---
  let caBundle = _openaiEnv.embeddingsCaBundle || undefined;
  if (!caBundle && yamlCfg) {
    caBundle = _yamlGet(yamlCfg, ['global', 'network', 'ca_bundle']) || undefined;
  }

  // --- proxyUrl ---
  const { getProxySync } = await import('./get_proxy.mjs');
  const proxyUrl = getProxySync(yamlCfg, _yamlGet);

  console.log(`${_TAG} Using EmbeddingClient (model=${cfg.embeddingsModelName})`);
  console.log(`${_TAG}   baseUrl = ${baseUrl}`);
  console.log(`${_TAG}   apiKey  = ${_maskKey(apiKey)}`);
  if (organization) console.log(`${_TAG}   org     = ${organization}`);
  if (proxyUrl) console.log(`${_TAG}   proxy   = ${proxyUrl}`);
  if (timeoutStr || yamlTimeout != null) console.log(`${_TAG}   timeout = ${timeout}ms`);
  if (caBundle) console.log(`${_TAG}   caBundle = ${caBundle}`);

  return {
    model: cfg.embeddingsModelName,
    apiKey,
    baseUrl,
    organization,
    proxyUrl,
    timeout,
    caBundle,
  };
}
