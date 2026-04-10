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
const pgMod = await importFile(path.join(platformRoot, 'packages_mjs/db_connection_postgres/dist/index.js'));

const { config: appConfig } = await appYamlLoadMod.loadAppYamlConfig({ configDir, appEnv });
const cfg = new pgMod.PostgresConfig();

// --- Connection test ---
let connectionResult = null;
let connectionError = null;
let client = null;
try {
  client = pgMod.getPostgresClient(cfg);
  await pgMod.checkConnection(client);
  connectionResult = { connected: true };
} catch (err) {
  connectionError = err.message;
  connectionResult = { connected: false };
} finally {
  if (client) {
    try { await client.close(); } catch (_) {}
  }
}

const summary = {
  service: 'postgres',
  mode: 'direct-package-import',
  mjs_package: '@internal/db_connection_postgres',
  app_yaml_initialized: true,
  app_yaml_storage_postgres: appConfig.getNested(['storage', 'postgres'], {}),
  resolved_config: {
    host: cfg.host,
    port: cfg.port,
    database: cfg.database,
    schema: cfg.schema,
    sslMode: cfg.sslMode,
  },
  connection_test: {
    ...connectionResult,
    error: connectionError,
  },
  uses_app_yaml_directly: false,
  note: 'db_connection_postgres (mjs) resolves env/config/defaults; it does not read AppYamlConfig internally.',
};

console.log(JSON.stringify(summary, null, 2));
