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
const providerConfig = appConfig.getNested(['providers', 'openai_embeddings'], {});
const authOptions = authConfigMod.buildSdkAuthOptions(providerConfig, 'bearer');
const apiKey = authConfigMod.resolveApiKey(providerConfig);

const configResult = {
  service: 'openai-embeddings',
  mode: 'direct-package-import',
  mjs_package: '@internal/auth-config',
  app_yaml_initialized: true,
  app_yaml_providers_openai_embeddings: providerConfig,
  resolved_config: {
    base_url: providerConfig.base_url ?? null,
    model: providerConfig.model ?? null,
    health_endpoint: providerConfig.health_endpoint ?? null,
    auth_type: authOptions?.type ?? null,
    has_api_key: apiKey != null,
  },
  uses_app_yaml_directly: true,
  note: 'auth_config resolves provider auth from AppYamlConfig + env/context.',
};

// Simple embedding test
let embeddingResult;
const effectiveApiKey = (apiKey && !apiKey.startsWith('{{')) ? apiKey : process.env.OPENAI_API_KEY;

if (!effectiveApiKey) {
  embeddingResult = { test: 'embedding', skipped: true, reason: 'no api key' };
} else {
  const baseUrl = providerConfig.base_url ?? 'https://api.openai.com/v1';
  const response = await fetch(`${baseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${effectiveApiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: 'Hello, world!',
    }),
  });

  const data = await response.json();
  const embedding = data.data?.[0]?.embedding ?? [];
  embeddingResult = {
    test: 'embedding',
    skipped: false,
    model: data.model,
    dimensions: embedding.length,
    usage_total_tokens: data.usage?.total_tokens,
    first_5_values: embedding.slice(0, 5),
    passed: embedding.length > 0,
  };
}

const connectionTest = embeddingResult.skipped
  ? { skipped: true, reason: embeddingResult.reason }
  : { skipped: false, connected: embeddingResult.passed, status: 'embedding_returned' };

const summary = { ...configResult, embedding_test: embeddingResult, connection_test: connectionTest };
console.log(JSON.stringify(summary, null, 2));
