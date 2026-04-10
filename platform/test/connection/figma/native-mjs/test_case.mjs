#!/usr/bin/env node

/**
 * Connection test for Figma API via undici directly — no local packages.
 *
 * Resolves all config from environment variables only.
 * Uses undici's request() API with ProxyAgent / Agent dispatchers.
 */

import { request, ProxyAgent, Agent } from 'undici';
import fs from 'node:fs';

// ---------------------------------------------------------------------------
// Connection config resolution (env vars only)
// ---------------------------------------------------------------------------

const connCfg = {
  proxyUrl: process.env.HTTPS_PROXY || process.env.HTTP_PROXY || null,
  verifySsl: (process.env.VERIFY_SSL || 'true').toLowerCase() !== 'false',
  caBundlePath: process.env.SSL_CERT_FILE || process.env.NODE_EXTRA_CA_CERTS || null,
  clientCert: process.env.CLIENT_CERT || null,
  clientKey: process.env.CLIENT_KEY || null,
};

// ---------------------------------------------------------------------------
// Connection test
// ---------------------------------------------------------------------------

const token = process.env.FIGMA_TOKEN || process.env.FIGMA_ACCESS_TOKEN;
let connectionTest;

if (!token) {
  connectionTest = { skipped: true, reason: 'no FIGMA_TOKEN or FIGMA_ACCESS_TOKEN env var' };
} else {
  try {
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

    const url = 'https://api.figma.com/v1/me';
    const start = performance.now();

    const { statusCode, body } = await request(url, {
      method: 'GET',
      headers: {
        'X-Figma-Token': token,
        'User-Agent': 'figma-connection-test/1.0',
      },
      dispatcher,
    });

    const data = await body.json();
    const latency = Math.round(performance.now() - start);

    connectionTest = {
      skipped: false,
      connected: statusCode >= 200 && statusCode < 300,
      endpoint: '/v1/me',
      status_code: statusCode,
      hasUser: typeof data === 'object' && data !== null && 'id' in data,
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
  service: 'figma-native-mjs',
  mode: 'connection-test',
  mjs_package: 'undici',
  app_yaml_initialized: false,
  connection_config: connCfg,
  connection_test: connectionTest,
  overall: connectionTest.connected ? 'PASS' : connectionTest.skipped ? 'SKIP' : 'FAIL',
};

// Redact sensitive fields before logging (CodeQL js/clear-text-logging)
const redactedSummary = { ...summary, connection_config: { ...summary.connection_config, proxyUrl: summary.connection_config.proxyUrl ? '*******' : null, clientKey: summary.connection_config.clientKey ? '*******' : null } };
console.log(JSON.stringify(redactedSummary, null, 2));
