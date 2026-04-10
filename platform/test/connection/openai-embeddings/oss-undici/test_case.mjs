#!/usr/bin/env node

/**
 * Connection test for OpenAI Embeddings API via raw open-source undici library.
 *
 * Tests proxy, verify_ssl, ca_bundle, and client cert configuration
 * by resolving config from AppYamlConfig and making a health-check request
 * using undici's low-level request() API with ProxyAgent / Agent dispatchers.
 */

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { request, ProxyAgent, Agent } from 'undici';
import fs from 'node:fs';

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
// Connection test
// ---------------------------------------------------------------------------

const resolvedApiKey = providerConfig.api_key || process.env.OPENAI_EMBEDDINGS_API_KEY || process.env.OPENAI_API_KEY;

// Treat unresolved template placeholders as missing
const apiKey = resolvedApiKey && !resolvedApiKey.startsWith('{{') ? resolvedApiKey : null;

let connectionTest;

if (!apiKey) {
  connectionTest = {
    skipped: true,
    reason: 'no OPENAI_EMBEDDINGS_API_KEY, OPENAI_API_KEY or api_key in config',
  };
} else {
  try {
    const baseUrl = providerConfig.base_url || 'https://api.openai.com/v1';

    // Build TLS connect options
    const connectOptions = {};
    if (connCfg.caBundlePath) {
      connectOptions.ca = fs.readFileSync(connCfg.caBundlePath);
    }
    if (connCfg.clientCert) {
      connectOptions.cert = fs.readFileSync(connCfg.clientCert);
    }
    if (connCfg.clientKey) {
      connectOptions.key = fs.readFileSync(connCfg.clientKey);
    }
    // CodeQL: js/disabling-certificate-validation — only disable cert validation
    // when the connection config explicitly opts out AND we are in a test context
    if (!connCfg.verifySsl && process.env.NODE_ENV === 'test') {
      connectOptions.rejectUnauthorized = false;
    }

    // Create dispatcher (ProxyAgent or Agent)
    let dispatcher;
    if (connCfg.proxyUrl) {
      dispatcher = new ProxyAgent({
        uri: connCfg.proxyUrl,
        requestTls: connectOptions,
      });
    } else if (Object.keys(connectOptions).length > 0) {
      dispatcher = new Agent({ connect: connectOptions });
    }

    const url = `${baseUrl}/embeddings`;
    const start = performance.now();

    const { statusCode, headers, body } = await request(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'openai-embeddings-connection-test/1.0',
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: 'Hello, world!' }),
      dispatcher,
    });

    const data = await body.json();
    const latency = Math.round(performance.now() - start);

    connectionTest = {
      skipped: false,
      connected: statusCode >= 200 && statusCode < 300,
      endpoint: '/embeddings',
      status_code: statusCode,
      hasEmbedding: data.data?.[0]?.embedding?.length > 0,
      latency_ms: latency,
      connection: {
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
  service: 'openai-embeddings-oss-undici',
  mode: 'connection-test',
  mjs_package: 'undici:request',
  app_yaml_initialized: true,
  connection_config: connCfg,
  connection_test: connectionTest,
  overall: connectionTest.connected ? 'PASS' : connectionTest.skipped ? 'SKIP' : 'FAIL',
};

// Redact sensitive fields before logging (CodeQL js/clear-text-logging)
const redactedSummary = { ...summary, connection_config: { ...summary.connection_config, proxyUrl: summary.connection_config.proxyUrl ? '*******' : null, clientKey: summary.connection_config.clientKey ? '*******' : null } };
console.log(JSON.stringify(redactedSummary, null, 2));
