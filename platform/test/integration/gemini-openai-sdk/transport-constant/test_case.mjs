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
const constantsMod = await importFile(path.join(platformRoot, 'packages_mjs/fetch_undici_gemini_openai_constant/dist/index.js'));

const { config: appConfig } = await appYamlLoadMod.loadAppYamlConfig({ configDir, appEnv });
const providerConfig = appConfig.getNested(['providers', 'gemini_openai'], {});

// --- Connection test (TCP reachability of GEMINI_ORIGIN) ---
let connectionTest = { skipped: true, reason: 'constants-only package' };
try {
  const res = await fetch(constantsMod.GEMINI_ORIGIN, { method: 'HEAD' });
  connectionTest = { skipped: false, connected: res.status < 500, status: res.status };
} catch (err) {
  connectionTest = { skipped: false, connected: false, error: err.message };
}

const summary = {
  service: 'transport-constant',
  mode: 'direct-package-import',
  mjs_package: 'fetch-undici-gemini-openai-constant',
  app_yaml_initialized: true,
  app_yaml_providers_gemini_openai: providerConfig,
  resolved_config: {
    gemini_origin: constantsMod.GEMINI_ORIGIN,
    chat_completions_path: constantsMod.GEMINI_CHAT_COMPLETIONS_PATH,
    headers_timeout_ms: constantsMod.GEMINI_HEADERS_TIMEOUT_MS,
    body_timeout_ms: constantsMod.GEMINI_BODY_TIMEOUT_MS,
    connect_timeout_ms: constantsMod.GEMINI_CONNECT_TIMEOUT_MS,
    pool_connections: constantsMod.GEMINI_POOL_CONNECTIONS,
    pool_pipelining: constantsMod.GEMINI_POOL_PIPELINING,
    keepalive_timeout_ms: constantsMod.GEMINI_KEEPALIVE_TIMEOUT_MS,
    http2_enabled: constantsMod.GEMINI_HTTP2_ENABLED,
  },
  connection_test: connectionTest,
  uses_app_yaml_directly: false,
  note: 'fetch_undici_gemini_openai_constant provides pre-configured constants for undici Gemini clients.',
};

console.log(JSON.stringify(summary, null, 2));
