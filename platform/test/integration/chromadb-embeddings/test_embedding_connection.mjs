#!/usr/bin/env node

/**
 * Integration test for OpenAI Embeddings connection (Node.js / ESM).
 *
 * Resolves config via AppYamlConfig (three-tier: YAML → env → default),
 * then builds an EmbeddingClient and sends a test embed request.
 *
 * Usage:
 *     node test/integration/chromadb-embeddings/test_embedding_connection.mjs \
 *       --config-dir common/config
 */

import { execSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';

// ── CLI args ──
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

// ── Resolve project root (platform/) ──
const platformRoot = path.resolve(configDir, '..', '..');
const importFile = async (absPath) => import(pathToFileURL(absPath).href);

// ── Load AppYamlConfig (initializes singleton for downstream kwargs builders) ──
const appYamlLoadMod = await importFile(
  path.join(platformRoot, 'polyglot/app_yaml_load/mjs/dist/index.js'),
);
const { config: appConfig } = await appYamlLoadMod.loadAppYamlConfig({ configDir, appEnv });
const providerConfig = appConfig.getNested(['providers', 'openai_embeddings'], {}) || {};

// ── Import embedding packages (singleton is now initialized) ──
const embeddingConfigMod = await importFile(
  path.join(platformRoot, 'polyglot/rag_embedding_config/mjs/src/index.mjs'),
);
const embeddingClientMod = await importFile(
  path.join(platformRoot, 'polyglot/rag_embedding_client/mjs/src/client.mjs'),
);

const { getOpenAIKwargs, DEFAULT_BASE_URL } = embeddingConfigMod;
const { EmbeddingClient } = embeddingClientMod;

const _TAG = '[test-embedding]';
const _SEP = '='.repeat(50);

// ── Environment diagnostics ──
function printEnvDebug() {
  const nodeVersion = process.version;
  const platformStr = `${os.platform()}-${os.arch()}`;
  let opensslVersion = '(unknown)';
  try {
    opensslVersion = execSync('openssl version', { encoding: 'utf8' }).trim();
  } catch { /* ignore */ }

  console.log(`\n${_SEP}`);
  console.log('  Environment & Runtime');
  console.log(_SEP);
  console.log(`  Node.js:       ${nodeVersion}`);
  console.log(`  Platform:      ${platformStr}`);
  console.log(`  SSL:           ${opensslVersion}`);
  console.log(`  cwd:           ${process.cwd()}`);
  console.log(`  project_root:  ${platformRoot}`);

  // Embedding-related env vars
  const embedVars = [
    'OPENAI_EMBEDDINGS_BASE_URL',
    'OPENAI_EMBEDDINGS_API_KEY',
    'OPENAI_API_KEY',
    'OPENAI_EMBEDDINGS_ORG',
    'OPENAI_EMBEDDINGS_PROXY_URL',
    'OPENAI_EMBEDDINGS_TIMEOUT',
    'OPENAI_EMBEDDINGS_CA_BUNDLE',
    'RAG_EMBEDDING_BACKEND',
    'EMBEDDINGS_MODEL_NAME',
  ];
  console.log('\n  Embedding env vars:');
  for (const varName of embedVars) {
    const val = process.env[varName];
    if (val == null) {
      console.log(`    ${varName} = (not set)`);
    } else if (varName.includes('KEY') || varName.includes('API')) {
      const masked = val.length > 8 ? val.slice(0, 4) + '...' + val.slice(-4) : '****';
      console.log(`    ${varName} = ${masked}`);
    } else {
      console.log(`    ${varName} = ${val}`);
    }
  }

  // Network proxy env vars
  const proxyVars = ['HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY', 'http_proxy', 'https_proxy', 'no_proxy'];
  const hasProxy = proxyVars.some((v) => process.env[v]);
  if (hasProxy) {
    console.log('\n  Network proxy env vars:');
    for (const varName of proxyVars) {
      const val = process.env[varName];
      if (val) console.log(`    ${varName} = ${val}`);
    }
  }

  console.log();
}

// ── Main test ──
async function testEmbedding() {
  console.log(`${_TAG} CLI started`);
  console.log(`${_TAG} AppYamlConfig initialized (configDir=${configDir}, appEnv=${appEnv})`);

  // Environment
  printEnvDebug();

  // ── AppYamlConfig provider section ──
  console.log(`${_SEP}`);
  console.log('  AppYamlConfig: providers.openai_embeddings');
  console.log(_SEP);
  console.log(`  base_url:          ${providerConfig.base_url ?? '(not set)'}`);
  console.log(`  model:             ${providerConfig.model ?? '(not set)'}`);
  console.log(`  health_endpoint:   ${providerConfig.health_endpoint ?? '(not set)'}`);
  console.log(`  endpoint_auth_type: ${providerConfig.endpoint_auth_type ?? '(not set)'}`);
  console.log(`  has_api_key:       ${providerConfig.endpoint_api_key != null && !String(providerConfig.endpoint_api_key).startsWith('{{')}`);
  const clientCfg = providerConfig.client || {};
  console.log(`  timeout_seconds:   ${clientCfg.timeout_seconds ?? '(not set)'}`);
  console.log();

  // Model name: YAML → env → default
  const modelName = providerConfig.model || process.env.EMBEDDINGS_MODEL_NAME || 'text-embedding-3-small';

  // ── Config resolution via getOpenAIKwargs (reads AppYamlConfig singleton) ──
  console.log(`${_TAG} Building EmbeddingClient kwargs (model=${modelName})...`);
  const kwargs = await getOpenAIKwargs({ embeddingsModelName: modelName });

  console.log(`\n${_SEP}`);
  console.log('  Resolved Configuration');
  console.log(_SEP);
  console.log(`  model:         ${kwargs.model}`);
  console.log(`  baseUrl:       ${kwargs.baseUrl}`);
  console.log(`  apiKey:        ${kwargs.apiKey ? (kwargs.apiKey.slice(0, 4) + '****') : '(not set)'}`);
  console.log(`  organization:  ${kwargs.organization ?? '(not set)'}`);
  console.log(`  proxyUrl:      ${kwargs.proxyUrl ? '*******' : '(none)'}`);
  console.log(`  timeout:       ${kwargs.timeout}ms`);
  if (kwargs.caBundle) console.log(`  caBundle:      ${kwargs.caBundle}`);
  console.log();

  // ── Client construction ──
  console.log(`${_TAG} Building embeddings client...`);
  const client = new EmbeddingClient(kwargs);
  console.log(`${_TAG}   client type: EmbeddingClient`);
  console.log(`${_TAG}   client._endpoint: ${client._endpoint}`);
  console.log(`${_TAG}   client._timeout: ${client._timeout}`);
  console.log(`${_TAG}   client._proxyUrl: ${client._proxyUrl ?? '(none)'}`);
  console.log(`${_TAG}   client.model: ${client.model}`);

  const baseUrl = kwargs.baseUrl || DEFAULT_BASE_URL;

  console.log(`\n${_SEP}`);
  console.log('  Embedding Connection Test');
  console.log(_SEP);
  console.log(`  Model:     ${modelName}`);
  console.log(`  Endpoint:  ${baseUrl}`);
  console.log(`  Backend:   native fetch`);
  console.log();

  let start;
  try {
    const testText = 'Hello, this is a connection test.';
    console.log(`${_TAG} Sending embed request to API...`);
    console.log(`  Sending:   "${testText}"`);

    start = performance.now();
    const result = await client.aEmbedQuery(testText);
    const elapsed = ((performance.now() - start) / 1000).toFixed(3);

    console.log(`${_TAG} Response received (${elapsed}s)`);

    const dim = result.length;
    const preview = result.slice(0, 5).map((v) => v.toFixed(6)).join(', ');
    const norm = Math.sqrt(result.reduce((sum, v) => sum + v * v, 0)).toFixed(6);

    console.log('  Status:    OK');
    console.log(`  Latency:   ${elapsed}s`);
    console.log(`  Dimension: ${dim}`);
    console.log(`  Preview:   [${preview}, ...]`);
    console.log(`  Vec norm:  ${norm}`);
    console.log(_SEP);
    console.log('  Result: SUCCESS');
    console.log(_SEP);
    console.log();
  } catch (exc) {
    const elapsed = start ? ((performance.now() - start) / 1000).toFixed(3) : '0.000';
    console.log(`${_TAG} API call failed after ${elapsed}s`);
    console.log('  Status:    FAILED');
    console.log(`  Error:     ${exc.constructor.name}: ${exc.message}`);

    // Connection-specific diagnostics
    const excStr = String(exc.message).toLowerCase();
    if (excStr.includes('connect') || excStr.includes('timeout')) {
      console.log('\n  Connection debug:');
      console.log(`    target:  ${baseUrl}`);
      console.log(`    proxy:   ${process.env.OPENAI_EMBEDDINGS_PROXY_URL ?? '(none)'}`);
      console.log(`    timeout: ${process.env.OPENAI_EMBEDDINGS_TIMEOUT ?? '120000 (default)'}ms`);
    }
    if (excStr.includes('ssl') || excStr.includes('certificate')) {
      console.log('\n  SSL debug:');
      console.log(`    ca_bundle: ${process.env.OPENAI_EMBEDDINGS_CA_BUNDLE ?? '(not set)'}`);
      console.log(`    NODE_EXTRA_CA_CERTS: ${process.env.NODE_EXTRA_CA_CERTS ? '(set)' : '(not set)'}`);
    }
    if (String(exc).includes('401') || excStr.includes('auth') || excStr.includes('key')) {
      const apiKey = process.env.OPENAI_EMBEDDINGS_API_KEY || process.env.OPENAI_API_KEY || '';
      // Redact API key for logging (CodeQL js/clear-text-logging)
      const keyDisplay = apiKey.length > 8 ? apiKey.slice(0, 4) + '****' : '(empty or short)';
      console.log('\n  Auth debug:');
      console.log(`    api_key source: ${process.env.OPENAI_EMBEDDINGS_API_KEY ? 'OPENAI_EMBEDDINGS_API_KEY' : 'OPENAI_API_KEY (fallback)'}`);
      console.log(`    api_key value:  ${keyDisplay}`);
    }

    console.log('\n  Full traceback:');
    console.error(exc.stack || exc);
    console.log(_SEP);
    console.log('  Result: FAILED');
    console.log(_SEP);
    console.log();
    process.exit(1);
  }

  console.log(`${_TAG} CLI finished`);
}

await testEmbedding();
