/**
 * Gemini OpenAI Embedding Routes
 *
 * REST API endpoints exposing OpenAI-compatible embedding functionality.
 * Base path: /api/llm/gemini-openai-embedding-v1/
 *
 * API key resolution uses AppYamlConfig provider config with auth_config,
 * falling back to OPENAI_EMBEDDINGS_API_KEY / OPENAI_API_KEY env vars.
 */

import { EmbeddingClient, DEFAULT_BASE_URL } from '@internal/rag-embedding-client';
import { resolveOpenaiEnv } from '@internal/env-resolver';

const BASE_PATH = '/api/llm/gemini-openai-embedding-v1';
const _openaiEnv = resolveOpenaiEnv();
const _TAG = '[embedding-route]';

// Lazy-initialized client (resolved on first request after AppYamlConfig is ready)
let _client = null;
let _clientModel = null;

/**
 * Check if a value is an unresolved {{...}} template.
 */
function isUnresolvedTemplate(value) {
  return typeof value === 'string' && value.trim().startsWith('{{');
}

/**
 * Redact a secret for safe logging: first 4 chars + *** + last 4 chars.
 */
function _redactKey(value) {
  if (!value || typeof value !== 'string') return '(empty)';
  if (value.length <= 12) return value.slice(0, 3) + '***';
  return value.slice(0, 4) + '***' + value.slice(-4);
}

/**
 * Build a safe-to-log snapshot of connection configuration.
 */
function _buildConfigSnapshot(cfg) {
  return {
    base_url: cfg.baseUrl,
    endpoint: cfg.baseUrl ? `${cfg.baseUrl}/v1/embeddings` : '(unknown)',
    has_api_key: !!cfg.apiKey,
    api_key_preview: _redactKey(cfg.apiKey),
    organization: cfg.organization || '(none)',
    timeout_ms: cfg.timeout,
    proxy_url: cfg.proxyUrl || '(none)',
    config_source: cfg._configSource || 'unknown',
  };
}

/**
 * Resolve embedding provider config from AppYamlConfig + env vars.
 */
async function resolveProviderConfig() {
  let providerConfig = {};
  let configSource = 'env-only';

  // Try reading from AppYamlConfig
  try {
    const { AppYamlConfig } = await import('@internal/app-yaml-static-config');
    const yamlCfg = AppYamlConfig.getInstance();
    providerConfig = yamlCfg.getNested(['providers', 'openai_embeddings'], {}) || {};
    configSource = 'app-yaml';
    console.log(`${_TAG} AppYamlConfig loaded, provider keys: [${Object.keys(providerConfig).join(', ')}]`);
  } catch (err) {
    console.warn(`${_TAG} AppYamlConfig not available: ${err.message}`);
  }

  // --- API key ---
  let apiKey = null;
  let apiKeySource = 'none';
  try {
    const { resolveApiKey } = await import('@internal/auth-config');
    apiKey = resolveApiKey(providerConfig);
    if (apiKey && !isUnresolvedTemplate(apiKey)) {
      apiKeySource = 'auth-config';
    }
  } catch (err) {
    console.warn(`${_TAG} auth-config resolve failed: ${err.message}`);
  }
  if (isUnresolvedTemplate(apiKey)) apiKey = null;
  if (!apiKey) {
    if (_openaiEnv.embeddingsApiKey) {
      apiKey = _openaiEnv.embeddingsApiKey;
      apiKeySource = 'env:OPENAI_EMBEDDINGS_API_KEY';
    } else if (_openaiEnv.apiKey) {
      apiKey = _openaiEnv.apiKey;
      apiKeySource = 'env:OPENAI_API_KEY';
    } else {
      apiKey = '';
      apiKeySource = 'none';
    }
  }

  // --- Base URL ---
  let baseUrl, baseUrlSource;
  if (providerConfig.base_url) {
    baseUrl = providerConfig.base_url;
    baseUrlSource = 'yaml:providers.openai_embeddings.base_url';
  } else if (_openaiEnv.embeddingsBaseUrl) {
    baseUrl = _openaiEnv.embeddingsBaseUrl;
    baseUrlSource = 'env:OPENAI_EMBEDDINGS_BASE_URL';
  } else {
    baseUrl = DEFAULT_BASE_URL;
    baseUrlSource = 'default';
  }
  baseUrl = baseUrl.replace(/\/+$/, '');

  // --- Organization ---
  const organization = providerConfig.organization || _openaiEnv.embeddingsOrg || undefined;

  // --- Timeout ---
  const yamlTimeout = providerConfig.client?.timeout_seconds;
  let timeout;
  if (yamlTimeout != null) {
    timeout = Number(yamlTimeout) * 1000;
  } else {
    const envTimeout = _openaiEnv.embeddingsTimeout;
    timeout = envTimeout ? Number(envTimeout) : 120_000;
  }

  // --- Proxy ---
  let proxyUrl = providerConfig.proxy_url;
  if (proxyUrl === false || proxyUrl == null) {
    proxyUrl = _openaiEnv.embeddingsProxyUrl || undefined;
  }

  // --- SSL ---
  const verifySsl = providerConfig.verify_ssl !== false;
  const caBundlePath = providerConfig.ca_bundle_path || undefined;

  console.log(
    `${_TAG} CONFIG resolved | source=${configSource}` +
    ` base_url=${baseUrl} (${baseUrlSource})` +
    ` api_key=${_redactKey(apiKey)} (${apiKeySource})` +
    ` org=${organization || '(none)'}` +
    ` timeout=${timeout}ms` +
    ` proxy=${typeof proxyUrl === 'string' ? proxyUrl : '(none)'}` +
    ` ssl_verify=${verifySsl}` +
    ` ca_bundle=${caBundlePath || '(none)'}`
  );

  return {
    apiKey, baseUrl, organization, timeout,
    proxyUrl: typeof proxyUrl === 'string' ? proxyUrl : undefined,
    verifySsl, caBundlePath,
    _configSource: configSource, _apiKeySource: apiKeySource, _baseUrlSource: baseUrlSource,
  };
}

async function getClient(model = 'text-embedding-3-small') {
  if (!_client || _clientModel !== model) {
    console.log(`${_TAG} creating client for model=${model}`);
    const cfg = await resolveProviderConfig();
    _client = new EmbeddingClient({
      model,
      apiKey: cfg.apiKey,
      baseUrl: cfg.baseUrl,
      organization: cfg.organization,
      timeout: cfg.timeout,
      proxyUrl: cfg.proxyUrl,
      verifySsl: cfg.verifySsl,
    });
    _client._resolvedConfig = cfg;
    _clientModel = model;
    console.log(`${_TAG} client ready: endpoint=${_client._endpoint} timeout=${_client._timeout}ms`);
  }
  return _client;
}

/**
 * Request body schemas for Fastify validation
 */
const embedRequestSchema = {
  type: 'object',
  required: ['input'],
  properties: {
    input: {},
    model: { type: 'string', default: 'text-embedding-3-small' },
  },
};

const embedQueryRequestSchema = {
  type: 'object',
  required: ['text'],
  properties: {
    text: { type: 'string' },
    model: { type: 'string', default: 'text-embedding-3-small' },
  },
};

/**
 * Mount routes to the Fastify application.
 * This function is called by the server bootstrap process.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  /**
   * Shared health/diagnostic handler for GET and POST.
   * POST accepts optional { text, model } to override defaults.
   */
  async function handleHealthDiagnostic(request) {
    const body = request.body || {};
    const testText = body.text || 'Hello, this is a connection test.';
    const model = body.model || 'text-embedding-3-small';

    let client;
    let configSnapshot = {};
    try {
      client = await getClient(model);
      configSnapshot = _buildConfigSnapshot(client._resolvedConfig || await resolveProviderConfig());
    } catch (err) {
      console.error(`${_TAG} HEALTH client-init FAILED: ${err.message}`);
      try { configSnapshot = _buildConfigSnapshot(await resolveProviderConfig()); } catch { /* ignore */ }
      return {
        status: 'error',
        service: 'gemini-openai-embedding-v1',
        error: `Client initialization failed: ${err.message}`,
        connection_config: configSnapshot,
      };
    }

    console.log(`${_TAG} HEALTH check: model=${model} endpoint=${client._endpoint}`);
    try {
      const start = Date.now();
      const result = await client.embedQuery(testText);
      const latencyMs = Date.now() - start;
      const norm = Math.sqrt(result.reduce((sum, v) => sum + v * v, 0));

      return {
        status: 'ok',
        service: 'gemini-openai-embedding-v1',
        model: client.model,
        endpoint: client._endpoint,
        timeout: client._timeout,
        proxy_url: client._proxyUrl || '(none)',
        test_text: testText,
        dimensions: result.length,
        latency_ms: latencyMs,
        latency: `${(latencyMs / 1000).toFixed(3)}s`,
        vector_preview: result.slice(0, 5).map(v => Number(v.toFixed(6))),
        vector_norm: Number(norm.toFixed(6)),
        connection_config: configSnapshot,
      };
    } catch (err) {
      console.error(`${_TAG} HEALTH check FAILED: ${err.message} | endpoint=${client._endpoint} proxy=${client._proxyUrl || '(none)'}`);
      return {
        status: 'error',
        service: 'gemini-openai-embedding-v1',
        error: err.message,
        connection_config: configSnapshot,
      };
    }
  }

  /**
   * GET /api/llm/gemini-openai-embedding-v1/health
   */
  server.get(`${BASE_PATH}/health`, async (request) => handleHealthDiagnostic(request));

  /**
   * POST /api/llm/gemini-openai-embedding-v1/health
   * Accepts optional { text, model } for diagnostic testing
   */
  server.post(`${BASE_PATH}/health`, async (request) => handleHealthDiagnostic(request));

  /**
   * POST /api/llm/gemini-openai-embedding-v1/embed
   * Generate embeddings for one or more inputs
   */
  server.post(
    `${BASE_PATH}/embed`,
    { schema: { body: embedRequestSchema } },
    async (request, reply) => {
      const { input, model } = request.body;
      let client;
      try {
        client = await getClient(model);
      } catch (err) {
        console.error(`${_TAG} EMBED client-init FAILED: ${err.message}`);
        reply.code(502);
        return { error: `Client initialization failed: ${err.message}` };
      }

      const texts = Array.isArray(input) ? input : [input];
      console.log(`${_TAG} EMBED: ${texts.length} text(s), model=${model}, endpoint=${client._endpoint}`);
      try {
        const embeddings = await client._post(texts);
        const data = embeddings.map((emb, i) => ({
          object: 'embedding',
          index: i,
          embedding: emb,
        }));
        return {
          object: 'list',
          data,
          model: client.model,
          usage: { total_tokens: texts.reduce((sum, t) => sum + t.split(/\s+/).length, 0) },
        };
      } catch (err) {
        const cfg = client._resolvedConfig || {};
        console.error(
          `${_TAG} EMBED FAILED: ${err.message}` +
          ` | endpoint=${client._endpoint}` +
          ` | proxy=${client._proxyUrl || '(none)'}` +
          ` | api_key=${_redactKey(cfg.apiKey)}` +
          ` | timeout=${client._timeout}ms` +
          ` | texts=${texts.length}`
        );
        reply.code(502);
        return {
          error: err.message,
          connection_config: _buildConfigSnapshot(cfg),
        };
      }
    }
  );

  /**
   * POST /api/llm/gemini-openai-embedding-v1/embed-query
   * Embed a single query string and return the vector
   */
  server.post(
    `${BASE_PATH}/embed-query`,
    { schema: { body: embedQueryRequestSchema } },
    async (request, reply) => {
      const { text, model } = request.body;
      let client;
      try {
        client = await getClient(model);
      } catch (err) {
        console.error(`${_TAG} EMBED-QUERY client-init FAILED: ${err.message}`);
        reply.code(502);
        return { error: `Client initialization failed: ${err.message}` };
      }

      console.log(`${_TAG} EMBED-QUERY: model=${model}, endpoint=${client._endpoint}`);
      try {
        const embedding = await client.embedQuery(text);
        return {
          object: 'embedding',
          embedding,
          model: client.model,
          dimensions: embedding.length,
        };
      } catch (err) {
        const cfg = client._resolvedConfig || {};
        console.error(
          `${_TAG} EMBED-QUERY FAILED: ${err.message}` +
          ` | endpoint=${client._endpoint}` +
          ` | proxy=${client._proxyUrl || '(none)'}` +
          ` | api_key=${_redactKey(cfg.apiKey)}` +
          ` | timeout=${client._timeout}ms`
        );
        reply.code(502);
        return {
          error: err.message,
          connection_config: _buildConfigSnapshot(cfg),
        };
      }
    }
  );

  /**
   * POST /api/llm/gemini-openai-embedding-v1/embed-batch
   * Embed a batch of texts with automatic sub-batching
   */
  server.post(
    `${BASE_PATH}/embed-batch`,
    { schema: { body: embedRequestSchema } },
    async (request, reply) => {
      const { input, model } = request.body;
      let client;
      try {
        client = await getClient(model);
      } catch (err) {
        console.error(`${_TAG} EMBED-BATCH client-init FAILED: ${err.message}`);
        reply.code(502);
        return { error: `Client initialization failed: ${err.message}` };
      }

      const texts = Array.isArray(input) ? input : [input];
      console.log(`${_TAG} EMBED-BATCH: ${texts.length} text(s), model=${model}, endpoint=${client._endpoint}`);
      try {
        const embeddings = await client.embedDocuments(texts);
        const data = embeddings.map((emb, i) => ({
          object: 'embedding',
          index: i,
          embedding: emb,
        }));
        return {
          object: 'list',
          data,
          model: client.model,
          usage: { total_tokens: texts.reduce((sum, t) => sum + t.split(/\s+/).length, 0) },
        };
      } catch (err) {
        const cfg = client._resolvedConfig || {};
        console.error(
          `${_TAG} EMBED-BATCH FAILED: ${err.message}` +
          ` | endpoint=${client._endpoint}` +
          ` | proxy=${client._proxyUrl || '(none)'}` +
          ` | api_key=${_redactKey(cfg.apiKey)}` +
          ` | timeout=${client._timeout}ms` +
          ` | texts=${texts.length}`
        );
        reply.code(502);
        return {
          error: err.message,
          connection_config: _buildConfigSnapshot(cfg),
        };
      }
    }
  );
}
