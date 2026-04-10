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
const redisMod = await importFile(path.join(platformRoot, 'packages_mjs/db_connection_redis/dist/index.js'));

const { config: appConfig } = await appYamlLoadMod.loadAppYamlConfig({ configDir, appEnv });
const cfg = new redisMod.RedisConfig();

// --- Connection test ---
let connectionResult = null;
let connectionError = null;
let client = null;
try {
  client = redisMod.getRedisClient(cfg);
  const pong = await client.ping();
  connectionResult = { connected: pong === 'PONG' };
} catch (err) {
  connectionError = err.message;
  connectionResult = { connected: false };
} finally {
  if (client) {
    try { client.disconnect(); } catch (_) {}
  }
}

const summary = {
  service: 'redis',
  mode: 'direct-package-import',
  mjs_package: '@internal/db_connection_redis',
  app_yaml_initialized: true,
  app_yaml_storage_redis: appConfig.getNested(['storage', 'redis'], {}),
  resolved_config: {
    host: cfg.host,
    port: cfg.port,
    db: cfg.db,
    useSsl: cfg.useSsl,
  },
  connection_test: {
    ...connectionResult,
    error: connectionError,
  },
  uses_app_yaml_directly: false,
  note: 'db_connection_redis (mjs) resolves env/config/defaults; AppYamlConfig is not read by package internals.',
};

console.log(JSON.stringify(summary, null, 2));
