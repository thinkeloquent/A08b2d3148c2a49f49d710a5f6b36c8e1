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
const s3Mod = await importFile(path.join(platformRoot, 'polyglot/aws_s3_client/mjs/dist/index.js'));

const { config: appConfig } = await appYamlLoadMod.loadAppYamlConfig({ configDir, appEnv });
const yamlS3 = appConfig.getNested(['storage', 's3'], {}) || {};
const resolved = s3Mod.configFromEnv(undefined, yamlS3);

// --- Connection test ---
let connectionResult = null;
let connectionError = null;
try {
  const sdk = s3Mod.createSDK(resolved);
  await sdk.listKeys();
  connectionResult = { connected: true };
  await sdk.close();
} catch (err) {
  connectionError = err.message;
  connectionResult = { connected: false };
}

const summary = {
  service: 's3',
  mode: 'direct-package-import',
  mjs_package: 'aws-s3-client',
  app_yaml_initialized: true,
  app_yaml_storage_s3: yamlS3,
  resolved_config: {
    bucketName: resolved.bucketName,
    region: resolved.region,
    endpointUrl: resolved.endpointUrl,
    proxyUrl: resolved.proxyUrl,
    forcePathStyle: resolved.forcePathStyle,
  },
  connection_test: {
    ...connectionResult,
    error: connectionError,
  },
  uses_app_yaml_directly: true,
  note: 'configFromEnv supports yaml config (storage.s3) and env/default fallback.',
};

console.log(JSON.stringify(summary, null, 2));
