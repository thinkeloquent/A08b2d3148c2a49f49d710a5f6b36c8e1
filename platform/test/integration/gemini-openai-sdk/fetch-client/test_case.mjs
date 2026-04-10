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
const fetchMod = await importFile(path.join(platformRoot, 'packages_mjs/fetch_undici_gemini_openai_protocols/dist/index.js'));

const { config: appConfig } = await appYamlLoadMod.loadAppYamlConfig({ configDir, appEnv });
const providerConfig = appConfig.getNested(['providers', 'gemini_openai'], {});

const config = fetchMod.getConfig();
const validation = fetchMod.validateConfig(config);
const chatEndpoint = fetchMod.getChatEndpoint();

// --- Connection test (HEAD request to chat endpoint) ---
let connectionTest = { skipped: true, reason: 'no valid config' };
const isValid = validation === true || validation?.valid === true;
if (isValid && config.apiKey) {
  try {
    const res = await fetch(chatEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'gemini-2.0-flash',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
      }),
    });
    connectionTest = { skipped: false, connected: res.status < 500, status: res.status };
  } catch (err) {
    connectionTest = { skipped: false, connected: false, error: err.message };
  }
}

const summary = {
  service: 'fetch-client',
  mode: 'direct-package-import',
  mjs_package: 'fetch_undici_gemini_openai_protocols',
  app_yaml_initialized: true,
  app_yaml_providers_gemini_openai: providerConfig,
  resolved_config: {
    defaults: fetchMod.DEFAULTS,
    chat_endpoint: chatEndpoint,
    config_valid: isValid,
  },
  connection_test: connectionTest,
  uses_app_yaml_directly: true,
  note: 'fetch_undici_gemini_openai_protocols resolves Gemini client config from AppYamlConfig + env.',
};

console.log(JSON.stringify(summary, null, 2));
