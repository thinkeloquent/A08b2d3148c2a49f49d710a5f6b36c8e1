#!/usr/bin/env node

/**
 * Connection test for OpenAI Embeddings API via Node.js stdlib (node:https).
 *
 * Tests proxy, verify_ssl, ca_bundle, and client cert configuration
 * by resolving config from AppYamlConfig and making a health-check request
 * using only native Node.js modules — no third-party HTTP libraries.
 */

import https from 'node:https';
import http from 'node:http';
import net from 'node:net';
import tls from 'node:tls';
import fs from 'node:fs';
import path from 'node:path';
import { URL, pathToFileURL } from 'node:url';

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
// API key resolution (template guard)
// ---------------------------------------------------------------------------

const cfgKey = providerConfig.api_key || '';
const apiKey = (cfgKey && !cfgKey.startsWith('{{'))
  ? cfgKey
  : (process.env.OPENAI_EMBEDDINGS_API_KEY || process.env.OPENAI_API_KEY || null);

const baseUrl = providerConfig.base_url || 'https://api.openai.com/v1';
const model = providerConfig.model || 'text-embedding-3-small';

// ---------------------------------------------------------------------------
// Native HTTPS proxy CONNECT tunnel
// ---------------------------------------------------------------------------

function connectThroughProxy(proxyUrl, targetHost, targetPort, tlsOptions) {
  return new Promise((resolve, reject) => {
    const proxy = new URL(proxyUrl);
    const proxyReq = http.request({
      host: proxy.hostname,
      port: proxy.port || 80,
      method: 'CONNECT',
      path: `${targetHost}:${targetPort}`,
    });
    proxyReq.on('connect', (_res, socket) => {
      const tlsSocket = tls.connect({
        host: targetHost,
        socket,
        ...tlsOptions,
      }, () => resolve(tlsSocket));
      tlsSocket.on('error', reject);
    });
    proxyReq.on('error', reject);
    proxyReq.setTimeout(15_000, () => {
      proxyReq.destroy(new Error('Proxy CONNECT timeout (15s)'));
    });
    proxyReq.end();
  });
}

// ---------------------------------------------------------------------------
// Native HTTPS request helper (with proxy support)
// ---------------------------------------------------------------------------

function nativeRequest(url, options, body, proxyUrl) {
  return new Promise(async (resolve, reject) => {
    const parsedUrl = new URL(url);

    // If proxy is configured and target is HTTPS, tunnel via CONNECT
    if (proxyUrl && parsedUrl.protocol === 'https:') {
      try {
        const tlsOpts = {};
        if (options.ca) tlsOpts.ca = options.ca;
        if (options.cert) tlsOpts.cert = options.cert;
        if (options.key) tlsOpts.key = options.key;
        if (options.rejectUnauthorized !== undefined) {
          tlsOpts.rejectUnauthorized = options.rejectUnauthorized;
        }
        const socket = await connectThroughProxy(
          proxyUrl, parsedUrl.hostname, parsedUrl.port || 443, tlsOpts,
        );
        options.socket = socket;
      } catch (err) {
        return reject(err);
      }
    }

    const mod = parsedUrl.protocol === 'https:' ? https : http;

    const req = mod.request(url, options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve({ statusCode: res.statusCode, headers: res.headers, body: raw });
      });
    });

    req.on('error', reject);
    req.setTimeout(15_000, () => {
      req.destroy(new Error('Request timeout (15s)'));
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Connection test
// ---------------------------------------------------------------------------

let connectionTest;

if (!apiKey) {
  connectionTest = { skipped: true, reason: 'no OPENAI_EMBEDDINGS_API_KEY, OPENAI_API_KEY, or api_key in config' };
} else {
  try {
    const url = `${baseUrl}/embeddings`;
    const payload = JSON.stringify({ model, input: 'Hello, world!' });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'openai-embeddings-connection-test/1.0',
      },
    };

    // TLS options
    if (connCfg.caBundlePath) {
      requestOptions.ca = fs.readFileSync(connCfg.caBundlePath);
    }
    if (connCfg.clientCert) {
      requestOptions.cert = fs.readFileSync(connCfg.clientCert);
    }
    if (connCfg.clientKey) {
      requestOptions.key = fs.readFileSync(connCfg.clientKey);
    }
    // CodeQL: js/disabling-certificate-validation — only disable cert validation
    // when the connection config explicitly opts out AND we are in a test context
    if (!connCfg.verifySsl && process.env.NODE_ENV === 'test') {
      requestOptions.rejectUnauthorized = false;
    }

    const start = performance.now();
    const response = await nativeRequest(url, requestOptions, payload, connCfg.proxyUrl);
    const latency = Math.round(performance.now() - start);

    const data = JSON.parse(response.body);
    const embeddingLength = data.data?.[0]?.embedding?.length ?? 0;

    connectionTest = {
      skipped: false,
      connected: response.statusCode >= 200 && response.statusCode < 300,
      endpoint: `POST ${baseUrl}/embeddings`,
      status_code: response.statusCode,
      model: data.model,
      dimensions: embeddingLength,
      usage_total_tokens: data.usage?.total_tokens,
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
  service: 'openai-embeddings-native-mjs',
  mode: 'connection-test',
  mjs_module: 'node:https',
  app_yaml_initialized: true,
  connection_config: connCfg,
  connection_test: connectionTest,
  overall: connectionTest.connected ? 'PASS' : connectionTest.skipped ? 'SKIP' : 'FAIL',
};

// Redact sensitive fields before logging (CodeQL js/clear-text-logging)
const redactedSummary = { ...summary, connection_config: { ...summary.connection_config, proxyUrl: summary.connection_config.proxyUrl ? '*******' : null, clientKey: summary.connection_config.clientKey ? '*******' : null } };
console.log(JSON.stringify(redactedSummary, null, 2));
