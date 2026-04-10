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
const geminiMod = await importFile(path.join(platformRoot, 'polyglot/gemini_openai_sdk/mjs/gemini-openai-sdk/index.mjs'));

const { config: appConfig } = await appYamlLoadMod.loadAppYamlConfig({ configDir, appEnv });
const providerConfig = appConfig.getNested(['providers', 'gemini_openai'], {});

let apiKey = null;
try {
  apiKey = geminiMod.getApiKey();
} catch (_) {}

// --- Connection test ---
let connectionTest = { skipped: true, reason: 'no api_key' };
if (apiKey) {
  try {
    const client = new geminiMod.GeminiClient();
    const healthResult = await client.healthCheck();
    connectionTest = { skipped: false, connected: !!healthResult };
    await client.close();
  } catch (err) {
    connectionTest = { skipped: false, connected: false, error: err.message };
  }
}

const summary = {
  service: 'client-config',
  mode: 'direct-package-import',
  mjs_package: 'gemini-openai-sdk',
  app_yaml_initialized: true,
  app_yaml_providers_gemini_openai: providerConfig,
  resolved_config: {
    has_api_key: apiKey != null,
    default_model: geminiMod.DEFAULT_MODEL,
    defaults: geminiMod.DEFAULTS,
  },
  connection_test: connectionTest,
  uses_app_yaml_directly: true,
  note: 'gemini_openai_sdk resolves Gemini config from AppYamlConfig + env.',
};

console.log(JSON.stringify(summary, null, 2));
