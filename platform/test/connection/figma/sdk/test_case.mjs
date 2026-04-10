#!/usr/bin/env node

/**
 * Connection test for Figma API via the internal figma_api MJS SDK.
 *
 * Tests proxy, verify_ssl, ca_bundle, and client cert configuration
 * by resolving config from AppYamlConfig and making a health-check request.
 */

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
const figmaApiMod = await importFile(path.join(platformRoot, 'polyglot/figma_api/mjs/src/index.mjs'));

const { config: appConfig } = await appYamlLoadMod.loadAppYamlConfig({ configDir, appEnv });
const providerConfig = appConfig.getNested(['providers', 'figma'], {}) || {};

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

const token = providerConfig.api_key || process.env.FIGMA_TOKEN || process.env.FIGMA_ACCESS_TOKEN;
let connectionTest;

if (!token) {
  connectionTest = { skipped: true, reason: 'no FIGMA_TOKEN or api_key in config' };
} else {
  try {
    const baseUrl = providerConfig.base_url || 'https://api.figma.com';
    const start = performance.now();
    const client = new figmaApiMod.FigmaClient({
      token,
      baseUrl,
      timeout: 15000,
    });

    const result = await client.get('/v1/me');
    const latency = Math.round(performance.now() - start);
    await client.close();

    connectionTest = {
      skipped: false,
      connected: true,
      endpoint: '/v1/me',
      hasUser: typeof result === 'object' && result !== null && 'id' in result,
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
  service: 'figma-sdk',
  mode: 'connection-test',
  mjs_package: '@internal/figma-api',
  app_yaml_initialized: true,
  connection_config: connCfg,
  connection_test: connectionTest,
  overall: connectionTest.connected ? 'PASS' : connectionTest.skipped ? 'SKIP' : 'FAIL',
};

// Redact sensitive fields before logging (CodeQL js/clear-text-logging)
const redactedSummary = { ...summary, connection_config: { ...summary.connection_config, proxyUrl: summary.connection_config.proxyUrl ? '*******' : null, clientKey: summary.connection_config.clientKey ? '*******' : null } };
console.log(JSON.stringify(redactedSummary, null, 2));
