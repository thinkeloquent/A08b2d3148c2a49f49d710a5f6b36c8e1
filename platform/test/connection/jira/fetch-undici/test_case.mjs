#!/usr/bin/env node

/**
 * Connection test for Jira API via the internal fetch_undici package.
 *
 * Tests proxy, verify_ssl, ca_bundle, and client cert configuration
 * by resolving config from AppYamlConfig and making a health-check request
 * using AsyncClient with TLSConfig and Proxy support.
 *
 * Auth: Basic auth (email + API token).
 * Health-check endpoint: {baseUrl}/rest/api/3/myself
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
const providerConfig = appConfig.getNested(['providers', 'jira'], {}) || {};

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

const email =
  providerConfig.email ||
  process.env.JIRA_EMAIL;

const apiToken =
  providerConfig.api_token ||
  process.env.JIRA_API_TOKEN;

const baseUrl =
  providerConfig.base_url ||
  process.env.JIRA_BASE_URL;

let connectionTest;

if (!email || !apiToken || !baseUrl) {
  const missing = [
    !email && 'JIRA_EMAIL',
    !apiToken && 'JIRA_API_TOKEN',
    !baseUrl && 'JIRA_BASE_URL',
  ].filter(Boolean);
  connectionTest = {
    skipped: true,
    reason: `missing required credential(s) or config: ${missing.join(', ')}`,
  };
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

    const basicCredential = Buffer.from(`${email}:${apiToken}`).toString('base64');
    const endpoint = `${baseUrl.replace(/\/$/, '')}/rest/api/3/myself`;

    const start = performance.now();
    const response = await client.get(endpoint, {
      headers: {
        'Authorization': `Basic ${basicCredential}`,
        'Accept': 'application/json',
      },
    });
    const latency = Math.round(performance.now() - start);

    const body = await response.json();
    await client.close();

    connectionTest = {
      skipped: false,
      connected: true,
      endpoint,
      status_code: response.statusCode,
      hasAccountId: typeof body === 'object' && body !== null && 'accountId' in body,
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
  service: 'jira-fetch-undici',
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
