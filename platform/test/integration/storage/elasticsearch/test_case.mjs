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
const esMod = await importFile(path.join(platformRoot, 'packages_mjs/db-connection-elasticsearch/dist/index.js'));

const { config: appConfig } = await appYamlLoadMod.loadAppYamlConfig({ configDir, appEnv });
const cfg = new esMod.ElasticsearchConfig();

// --- Connection test ---
const connectionTest = await esMod.checkConnection(cfg);

const summary = {
  service: 'elasticsearch',
  mode: 'direct-package-import',
  mjs_package: '@internal/db-connection-elasticsearch',
  app_yaml_initialized: true,
  app_yaml_storage_elasticsearch: appConfig.getNested(['storage', 'elasticsearch'], {}),
  resolved_config: {
    vendorType: cfg.options.vendorType,
    host: cfg.options.host,
    port: cfg.options.port,
    scheme: cfg.options.scheme,
    index: cfg.options.index,
  },
  connection_test: {
    connected: connectionTest.success,
    info: connectionTest.info ?? null,
    error: connectionTest.error ?? null,
  },
  uses_app_yaml_directly: false,
  note: 'db-connection-elasticsearch (mjs) resolves env/config/defaults; it does not read AppYamlConfig internally.',
};

console.log(JSON.stringify(summary, null, 2));
