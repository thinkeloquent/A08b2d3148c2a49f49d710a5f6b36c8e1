/**
 * Lifecycle Loader — discover -> validate -> import -> register -> report
 * Discovers *.lifecycle.mjs files, collects onStartup/onShutdown hooks.
 */
import path from 'node:path';
import fs from 'node:fs';
import { glob } from 'glob';
import { createLoaderReport, sortByNumericPrefix } from '../../../contracts/bootstrap-contract.mjs';

const LOADER_NAME = 'lifecycle-loader';

export async function loadLifecycles(server, config) {
  const report = createLoaderReport(LOADER_NAME);
  const startupHooks = [];
  const shutdownHooks = [];

  const lifecycleDirs = config.paths?.lifecycles;
  if (!lifecycleDirs) {
    server.log.debug({ loader: LOADER_NAME }, 'No lifecycle directory configured');
    return { report, startupHooks, shutdownHooks };
  }

  const dirs = Array.isArray(lifecycleDirs) ? lifecycleDirs : [lifecycleDirs];

  // Step 1: Discover from all directories
  let rawFiles = [];
  for (const dir of dirs) {
    const resolved = path.resolve(dir);
    if (fs.existsSync(resolved)) {
      rawFiles.push(...glob.sync(path.join(resolved, '*.lifecycle.mjs')));
    }
  }
  const files = sortByNumericPrefix(rawFiles);
  report.discovered = files.length;

  // Step 2: Validate
  report.validated = files.length;

  // Step 3+4: Import + collect hooks
  for (const filePath of files) {
    const absolutePath = path.resolve(filePath);
    const baseName = path.basename(absolutePath);
    try {
      const mod = await import(absolutePath);
      if (typeof mod.onStartup === 'function') {
        startupHooks.push(mod.onStartup);
      }
      if (typeof mod.onShutdown === 'function') {
        shutdownHooks.push(mod.onShutdown);
      }
      report.imported++;
      report.registered++;
    } catch (err) {
      server.log.error({ loader: LOADER_NAME, module: baseName, error: String(err) }, 'Failed to load lifecycle module');
      report.errors.push({ path: absolutePath, step: 'import', error: String(err) });
    }
  }

  report.details = {
    modules: files.map(f => path.basename(f)),
    startupHooks: startupHooks.length,
    shutdownHooks: shutdownHooks.length,
  };

  server.log.info({ loader: LOADER_NAME, registered: report.registered, startupHooks: startupHooks.length, shutdownHooks: shutdownHooks.length }, 'Lifecycle modules loaded');
  return { report, startupHooks, shutdownHooks };
}
