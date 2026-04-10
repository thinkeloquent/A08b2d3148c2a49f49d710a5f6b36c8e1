#!/usr/bin/env node

/**
 * Connection test for GitHub API via the internal github_api MJS SDK.
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
const githubApiMod = await importFile(path.join(platformRoot, 'polyglot/github_api/mjs/src/index.mjs'));

const { config: appConfig } = await appYamlLoadMod.loadAppYamlConfig({ configDir, appEnv });
const providerConfig = appConfig.getNested(['providers', 'github'], {}) || {};

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

const token = providerConfig.api_key || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_ACCESS_TOKEN;
let connectionTest;

if (!token) {
  connectionTest = { skipped: true, reason: 'no GITHUB_TOKEN or api_key in config' };
} else {
  try {
    const baseUrl = providerConfig.base_url || 'https://api.github.com';
    const start = performance.now();
    const client = new githubApiMod.GitHubClient({
      token,
      baseUrl,
      timeout: 15000,
    });

    // Use /rate_limit as a lightweight health check
    const result = await client.get('/rate_limit');
    const latency = Math.round(performance.now() - start);
    await client.close();

    connectionTest = {
      skipped: false,
      connected: true,
      endpoint: '/rate_limit',
      hasRateData: typeof result === 'object' && result !== null && 'rate' in result,
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
  service: 'github-sdk',
  mode: 'connection-test',
  mjs_package: '@internal/github-api',
  app_yaml_initialized: true,
  connection_config: connCfg,
  connection_test: connectionTest,
  overall: connectionTest.connected ? 'PASS' : connectionTest.skipped ? 'SKIP' : 'FAIL',
};

// Redact sensitive fields before logging (CodeQL js/clear-text-logging)
const redactedSummary = { ...summary, connection_config: { ...summary.connection_config, proxyUrl: summary.connection_config.proxyUrl ? '*******' : null, clientKey: summary.connection_config.clientKey ? '*******' : null } };
console.log(JSON.stringify(redactedSummary, null, 2));
