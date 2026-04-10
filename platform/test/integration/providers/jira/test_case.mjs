#!/usr/bin/env node

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
const authConfigMod = await importFile(path.join(platformRoot, 'packages_mjs/auth_config/dist/index.js'));

const { config: appConfig } = await appYamlLoadMod.loadAppYamlConfig({ configDir, appEnv });
const providerConfig = appConfig.getNested(['providers', 'jira'], {});
const authOptions = authConfigMod.buildSdkAuthOptions(providerConfig, 'basic_email_token');
const apiKey = authConfigMod.resolveApiKey(providerConfig);
const email = authConfigMod.resolveEmail(providerConfig) ?? null;

// --- Connection test ---
let connectionTest = { skipped: true, reason: 'no health_endpoint or credentials' };
const healthEndpoint = providerConfig.health_endpoint;
const baseUrl = providerConfig.base_url;
if (healthEndpoint && apiKey && email) {
  try {
    const url = baseUrl ? `${baseUrl.replace(/\/+$/, '')}${healthEndpoint}` : healthEndpoint;
    const basicAuth = Buffer.from(`${email}:${apiKey}`).toString('base64');
    const headers = { Authorization: `Basic ${basicAuth}` };
    const res = await fetch(url, { method: 'GET', headers });
    connectionTest = { skipped: false, connected: res.ok, status: res.status };
  } catch (err) {
    connectionTest = { skipped: false, connected: false, error: err.message };
  }
}

const summary = {
  service: 'jira',
  mode: 'direct-package-import',
  mjs_package: '@internal/auth-config',
  app_yaml_initialized: true,
  app_yaml_providers_jira: providerConfig,
  resolved_config: {
    base_url: providerConfig.base_url ?? null,
    health_endpoint: providerConfig.health_endpoint ?? null,
    auth_type: authOptions?.type ?? null,
    has_api_key: apiKey != null,
    email,
  },
  connection_test: connectionTest,
  uses_app_yaml_directly: true,
  note: 'auth_config resolves jira auth (basic_email_token) from AppYamlConfig + env/context.',
};

console.log(JSON.stringify(summary, null, 2));
