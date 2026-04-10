#!/usr/bin/env node

/**
 * Integration test for cache_json_awss3_storage — S3 JSON Cache workbench.
 *
 * Mirrors the webapp workbench operations:
 *   1. Resolves config via getClientFactoryFromAppConfig (three-tier).
 *   2. Creates an async S3 client + JsonS3Storage instance.
 *   3. SAVE  — write a JSON entry with TTL.
 *   4. LOAD  — read it back, verify data round-trips.
 *   5. EXISTS — confirm the key is present.
 *   6. LIST  — list keys with prefix, confirm the test key appears.
 *   7. DELETE — remove the key.
 *   8. LOAD (miss) — confirm load returns null after delete.
 *   9. Cleanup: close storage + destroy client.
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
const cacheMod = await importFile(path.join(platformRoot, 'polyglot/cache_json_awss3_storage/mjs/dist/index.js'));

const { config: appConfig } = await appYamlLoadMod.loadAppYamlConfig({ configDir, appEnv });
const yamlS3 = appConfig.getNested(['storage', 's3'], {}) || {};

// Resolve bucket: CLI arg → YAML → env → default test bucket
const bucketOverride = readArg('--bucket', process.env.AWS_S3_BUCKET || '');
const DEFAULT_TEST_BUCKET = 'figma-component-inspector';

const cfg = cacheMod.getClientFactoryFromAppConfig(
  yamlS3,
  bucketOverride ? { bucketName: bucketOverride } : undefined,
);

// If config resolution left bucket empty, use the default test bucket
if (!cfg.bucketName) {
  cfg.bucketName = bucketOverride || DEFAULT_TEST_BUCKET;
}

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const TEST_KEY = `integ-mjs-${Date.now()}`;
const TEST_DATA = {
  source: 'test_case.mjs',
  id: TEST_KEY,
  items: [1, 2, 3],
  nested: { ok: true },
};
const TEST_TTL = 600;
const KEY_PREFIX = 'jss3:';

// ---------------------------------------------------------------------------
// Run workbench-style operations
// ---------------------------------------------------------------------------

const results = {
  service: 's3-cached-key',
  mode: 'storage-workbench',
  mjs_package: 'cache_json_awss3_storage',
  app_yaml_initialized: true,
  config: {
    bucketName: cfg.bucketName,
    regionName: cfg.regionName,
    endpointUrl: cfg.endpointUrl || '(default)',
    keyPrefix: KEY_PREFIX,
    ttl: TEST_TTL,
  },
  steps: {},
};

const handle = cacheMod.createAsyncClient(cfg);
let storage = null;

try {
  // Step 1: Create storage
  storage = cacheMod.createStorage({
    s3Client: handle.client,
    bucketName: cfg.bucketName,
    keyPrefix: KEY_PREFIX,
    ttl: TEST_TTL,
    region: cfg.regionName,
  });
  results.steps.create_storage = { ok: true };

  // Step 2: SAVE
  const saveStart = performance.now();
  const savedKey = await storage.save(TEST_KEY, TEST_DATA, { ttl: TEST_TTL });
  const saveLatency = Math.round(performance.now() - saveStart);
  results.steps.save = {
    ok: savedKey === TEST_KEY,
    key: savedKey,
    s3_key: `${KEY_PREFIX}${savedKey}`,
    ttl: TEST_TTL,
    latency_ms: saveLatency,
  };

  // Step 3: LOAD
  const loadStart = performance.now();
  const loaded = await storage.load(TEST_KEY);
  const loadLatency = Math.round(performance.now() - loadStart);
  const dataMatches = loaded !== null && JSON.stringify(loaded) === JSON.stringify(TEST_DATA);
  results.steps.load = {
    ok: dataMatches,
    key: TEST_KEY,
    found: loaded !== null,
    data_matches: dataMatches,
    latency_ms: loadLatency,
  };

  // Step 4: EXISTS
  const existsStart = performance.now();
  const doesExist = await storage.exists(TEST_KEY);
  const existsLatency = Math.round(performance.now() - existsStart);
  results.steps.exists = {
    ok: doesExist === true,
    key: TEST_KEY,
    exists: doesExist,
    latency_ms: existsLatency,
  };

  // Step 5: LIST
  const listStart = performance.now();
  const keys = await storage.listKeys();
  const listLatency = Math.round(performance.now() - listStart);
  const testKeyInList = keys.includes(TEST_KEY);
  results.steps.list = {
    ok: testKeyInList,
    key_prefix: KEY_PREFIX,
    count: keys.length,
    test_key_found: testKeyInList,
    latency_ms: listLatency,
  };

  // Step 6: DELETE
  const deleteStart = performance.now();
  const deleted = await storage.delete(TEST_KEY);
  const deleteLatency = Math.round(performance.now() - deleteStart);
  results.steps.delete = {
    ok: deleted === true,
    key: TEST_KEY,
    deleted,
    latency_ms: deleteLatency,
  };

  // Step 7: LOAD after delete (should be null)
  const loadMissStart = performance.now();
  const loadedAfterDelete = await storage.load(TEST_KEY);
  const loadMissLatency = Math.round(performance.now() - loadMissStart);
  results.steps.load_after_delete = {
    ok: loadedAfterDelete === null,
    key: TEST_KEY,
    found: loadedAfterDelete !== null,
    latency_ms: loadMissLatency,
  };

  // Overall
  const allOk = Object.values(results.steps).every((s) => s.ok);
  results.overall = allOk ? 'PASS' : 'FAIL';
} catch (err) {
  results.error = { name: err.name, message: err.message };
  results.overall = 'FAIL';
} finally {
  if (storage) {
    try { await storage.close(); } catch (_) { /* ignore */ }
  }
  try { handle.destroy(); } catch (_) { /* ignore */ }
}

console.log(JSON.stringify(results, null, 2));
