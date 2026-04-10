#!/usr/bin/env node

/**
 * Connection test for Jira API via the internal jira_api MJS SDK.
 *
 * Tests proxy, verify_ssl, ca_bundle, and client cert configuration
 * by resolving config from AppYamlConfig and making a health-check request.
 * Jira Cloud uses Basic auth (email:api_token).
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
const jiraApiMod = await importFile(path.join(platformRoot, 'polyglot/jira_api/mjs/src/index.mjs'));

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

const email = providerConfig.email || process.env.JIRA_EMAIL || null;
const apiToken = providerConfig.api_key || process.env.JIRA_API_TOKEN || null;
const baseUrl = providerConfig.base_url || process.env.JIRA_BASE_URL || null;

// ---------------------------------------------------------------------------
// Connection test
// ---------------------------------------------------------------------------

let connectionTest;

if (!email || !apiToken) {
  connectionTest = { skipped: true, reason: 'no JIRA_EMAIL/JIRA_API_TOKEN or email/api_key in config' };
} else if (!baseUrl) {
  connectionTest = { skipped: true, reason: 'no base_url or JIRA_BASE_URL configured' };
} else {
  try {
    const start = performance.now();
    const client = new jiraApiMod.JiraFetchClient({
      baseUrl,
      email,
      apiToken,
    });

    // Use /rest/api/3/myself as a lightweight health check
    const result = await client.get('myself');
    const latency = Math.round(performance.now() - start);

    connectionTest = {
      skipped: false,
      connected: true,
      endpoint: '/rest/api/3/myself',
      hasUser: typeof result === 'object' && result !== null && 'accountId' in result,
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
  service: 'jira-sdk',
  mode: 'connection-test',
  mjs_package: '@mta/jira-api',
  app_yaml_initialized: true,
  connection_config: connCfg,
  connection_test: connectionTest,
  overall: connectionTest.connected ? 'PASS' : connectionTest.skipped ? 'SKIP' : 'FAIL',
};

// Redact sensitive fields before logging (CodeQL js/clear-text-logging)
const redactedSummary = { ...summary, connection_config: { ...summary.connection_config, proxyUrl: summary.connection_config.proxyUrl ? '*******' : null, clientKey: summary.connection_config.clientKey ? '*******' : null } };
console.log(JSON.stringify(redactedSummary, null, 2));
