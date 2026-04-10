#!/usr/bin/env node

/**
 * Connection test for OpenAI Embeddings API via the internal fetch_undici package.
 *
 * Tests proxy, verify_ssl, ca_bundle, and client cert configuration
 * by resolving config from AppYamlConfig and making a health-check request
 * using AsyncClient with TLSConfig and Proxy support.
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const readArg = (name, fallback) => {
  const idx = args.indexOf(name);
  return idx >= 0 ? args[idx + 1] : fallback;
};

const appEnv = readArg('--app-env', process.env.APP_ENV || 'dev');
const configDir = readArg('--config-dir', process.env.CONFIG_DIR);
if (!configDir) {
  console.error('Missing --config-dir');
  process.exit(2);
}

const platformRoot = path.resolve(configDir, '..', '..');
const importFile = async (absPath) => import(pathToFileURL(absPath).href);

const appYamlLoadMod = await importFile(path.join(platformRoot, 'polyglot/app_yaml_load/mjs/dist/index.js'));
const fetchUndiciMod = await importFile(path.join(platformRoot, 'packages_mjs/fetch_undici/dist/index.js'));

const { config: appConfig } = await appYamlLoadMod.loadAppYamlConfig({ configDir, appEnv });
const providerConfig = appConfig.getNested(['providers', 'openai_embeddings'], {}) || {};

// ---------------------------------------------------------------------------
// Connection config resolution
// ---------------------------------------------------------------------------

const connCfg = {
  proxyUrl: providerConfig.proxy_url || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || null,
  verifySsl: providerConfig.verify_ssl ?? true,
  caBundlePath: providerConfig.ca_bundle || process.env.SSL_CERT_FILE || process.env.NODE_EXTRA_CA_CERTS || null,
  clientCert: providerConfig.client_cert || null,
  clientKey: providerConfig.client_key || null,
};

// ---------------------------------------------------------------------------
// API key resolution (template guard)
// ---------------------------------------------------------------------------

const cfgKey = providerConfig.api_key || '';
const apiKey = (cfgKey && !cfgKey.startsWith('{{'))
  ? cfgKey
  : (process.env.OPENAI_EMBEDDINGS_API_KEY || process.env.OPENAI_API_KEY || null);

const baseUrl = providerConfig.base_url || 'https://api.openai.com/v1';
const model = providerConfig.model || 'text-embedding-3-small';

// ---------------------------------------------------------------------------
// Connection test
// ---------------------------------------------------------------------------

let connectionTest;

if (!apiKey) {
  connectionTest = { skipped: true, reason: 'no OPENAI_EMBEDDINGS_API_KEY, OPENAI_API_KEY, or api_key in config' };
} else {
  try {
    const tlsConfig = fetchUndiciMod.createTLSConfig({
      verify: connCfg.verifySsl,
      ca: connCfg.caBundlePath ? fs.readFileSync(connCfg.caBundlePath) : null,
      cert: connCfg.clientCert ? fs.readFileSync(connCfg.clientCert) : null,
      key: connCfg.clientKey ? fs.readFileSync(connCfg.clientKey) : null,
    });

    const proxy = connCfg.proxyUrl ? fetchUndiciMod.createProxy(connCfg.proxyUrl) : null;

    const client = new fetchUndiciMod.AsyncClient({
      tls: tlsConfig,
      proxy,
      trustEnv: true,
    });

    const payload = JSON.stringify({ model, input: 'Hello, world!' });

    const start = performance.now();
    const response = await client.post(`${baseUrl}/embeddings`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: payload,
    });
    const latency = Math.round(performance.now() - start);

    const body = await response.json();
    await client.close();

    const embeddingLength = body.data?.[0]?.embedding?.length ?? 0;

    connectionTest = {
      skipped: false,
      connected: embeddingLength > 0,
      endpoint: `POST ${baseUrl}/embeddings`,
      status_code: response.statusCode,
      model: body.model,
      dimensions: embeddingLength,
      usage_total_tokens: body.usage?.total_tokens,
      latency_ms: latency,
      connection: {
        base_url: baseUrl,
        proxy: connCfg.proxyUrl || '(none)',
        verify_ssl: connCfg.verifySsl,
        ca_bundle: connCfg.caBundlePath || '(default)',
        has_client_cert: Boolean(connCfg.clientCert),
      },
    };
  } catch (err) {
    connectionTest = {
      skipped: false,
      connected: false,
      error: { name: err.name, message: err.message },
    };
  }
}

const summary = {
  service: 'openai-embeddings-fetch-undici',
  mode: 'connection-test',
  mjs_package: '@internal/fetch-undici',
  app_yaml_initialized: true,
  connection_config: connCfg,
  connection_test: connectionTest,
  overall: connectionTest.connected ? 'PASS' : connectionTest.skipped ? 'SKIP' : 'FAIL',
};

// Redact sensitive fields before logging (CodeQL js/clear-text-logging)
const redactedSummary = { ...summary, connection_config: { ...summary.connection_config, proxyUrl: summary.connection_config.proxyUrl ? '*******' : null, clientKey: summary.connection_config.clientKey ? '*******' : null } };
console.log(JSON.stringify(redactedSummary, null, 2));
