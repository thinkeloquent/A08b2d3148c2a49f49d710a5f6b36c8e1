/**
 * App Manifest Loader — discover -> validate -> import -> register -> report
 * Discovers app.manifest.yaml files, validates, imports entrypoint, registers as Fastify plugin.
 */
import path from 'node:path';
import fs from 'node:fs';
import { glob } from 'glob';
import { parse as parseYaml } from 'yaml';
import { createLoaderReport } from '../../../contracts/bootstrap-contract.mjs';

const LOADER_NAME = 'app-manifest-loader';

function normalizeManifest(manifest) {
  if (manifest.id && manifest.backend?.entrypoint) {
    return {
      ...manifest,
      name: manifest.id,
      entrypoint: manifest.backend.entrypoint,
      prefix: manifest.backend.apiPrefix || `/${manifest.id}`,
    };
  }
  return manifest;
}

function validateManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') {
    return ['Manifest must be a YAML object'];
  }
  if (!manifest.name || typeof manifest.name !== 'string') {
    errors.push('manifest.name (or manifest.id) is required');
  }
  if (!manifest.runtime) {
    errors.push('manifest.runtime is required');
  }
  if (!manifest.entrypoint || typeof manifest.entrypoint !== 'string') {
    errors.push('manifest.entrypoint (or manifest.backend.entrypoint) is required');
  }
  return errors;
}

export async function loadAppManifests(server, config) {
  const report = createLoaderReport(LOADER_NAME);
  const appsDirs = config.paths?.apps;
  const activeProfile = config.profile || process.env.PLATFORM_PROFILE || 'dev';

  if (!appsDirs) {
    server.log.debug({ loader: LOADER_NAME }, 'No apps directory configured');
    return report;
  }

  const dirs = Array.isArray(appsDirs) ? appsDirs : [appsDirs];

  // Step 1: Discover from all directories
  let manifestFiles = [];
  for (const dir of dirs) {
    const resolved = path.resolve(dir);
    if (fs.existsSync(resolved)) {
      manifestFiles.push(...glob.sync(path.join(resolved, '**/app.manifest.yaml')));
    }
  }
  report.discovered = manifestFiles.length;

  const loadedApps = [];
  const skippedApps = [];

  for (const manifestPath of manifestFiles) {
    const appDir = path.dirname(manifestPath);
    const appDirName = path.basename(appDir);

    // Step 2: Validate — parse YAML
    let manifest;
    try {
      const raw = fs.readFileSync(manifestPath, 'utf-8');
      manifest = parseYaml(raw);
    } catch (err) {
      report.errors.push({ path: manifestPath, step: 'validate', error: String(err) });
      continue;
    }

    manifest = normalizeManifest(manifest);
    const validationErrors = validateManifest(manifest);
    if (validationErrors.length > 0) {
      report.skipped++;
      skippedApps.push({ name: appDirName, reason: validationErrors.join(', ') });
      continue;
    }

    report.validated++;

    // Filter by runtime
    const runtime = Array.isArray(manifest.runtime) ? manifest.runtime : [manifest.runtime];
    if (!runtime.includes('fastify')) {
      report.skipped++;
      skippedApps.push({ name: manifest.name, reason: `runtime: ${runtime.join(',')}` });
      continue;
    }

    // Filter by profile
    if (manifest.profiles && manifest.profiles.length > 0 && !manifest.profiles.includes(activeProfile)) {
      report.skipped++;
      skippedApps.push({ name: manifest.name, reason: `profile mismatch` });
      continue;
    }

    // Step 3: Import
    const entrypointPath = path.resolve(appDir, manifest.entrypoint);
    if (!fs.existsSync(entrypointPath)) {
      report.errors.push({ path: manifestPath, step: 'import', error: `Entrypoint not found: ${entrypointPath}` });
      skippedApps.push({ name: manifest.name, reason: 'entrypoint not found' });
      continue;
    }

    try {
      const mod = await import(entrypointPath);
      const pluginFn = mod.default ?? mod.plugin;
      if (typeof pluginFn !== 'function') {
        throw new Error(`App entrypoint must export default function or 'plugin'. Got: ${typeof pluginFn}`);
      }

      // Step 4: Register
      const prefix = manifest.prefix || `/${manifest.name}`;
      await server.register(pluginFn, { prefix });
      report.imported++;
      report.registered++;
      loadedApps.push({ name: manifest.name, prefix, entrypoint: entrypointPath });
    } catch (err) {
      report.errors.push({ path: manifestPath, step: 'register', error: String(err) });
      skippedApps.push({ name: manifest.name, reason: String(err) });
    }
  }

  // Decorate server
  if (!server.hasDecorator('_loadedApps')) {
    server.decorate('_loadedApps', loadedApps);
  }
  if (!server.hasDecorator('_skippedApps')) {
    server.decorate('_skippedApps', skippedApps);
  }

  report.details = { loadedApps, skippedApps, activeProfile };
  server.log.info({ loader: LOADER_NAME, registered: report.registered, skipped: report.skipped }, 'App manifests processed');
  return report;
}
