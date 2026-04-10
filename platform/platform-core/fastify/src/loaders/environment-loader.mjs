/**
 * Environment Loader — discover -> validate -> import -> register -> report
 * Discovers *.env.mjs files, sorts by numeric prefix, imports each (self-executing).
 */
import path from 'node:path';
import fs from 'node:fs';
import { glob } from 'glob';
import { createLoaderReport, sortByNumericPrefix } from '../../../contracts/bootstrap-contract.mjs';

const LOADER_NAME = 'environment-loader';

export async function loadEnvironment(server, config) {
  const report = createLoaderReport(LOADER_NAME);
  const envDirs = config.paths?.environment;
  if (!envDirs) {
    server.log.debug({ loader: LOADER_NAME }, 'No environment directory configured');
    return report;
  }

  const dirs = Array.isArray(envDirs) ? envDirs : [envDirs];

  // Step 1: Discover from all directories
  let rawFiles = [];
  for (const dir of dirs) {
    const resolved = path.resolve(dir);
    if (fs.existsSync(resolved)) {
      rawFiles.push(...glob.sync(path.join(resolved, '*.env.mjs')));
    }
  }
  const files = sortByNumericPrefix(rawFiles);
  report.discovered = files.length;

  // Step 2: Validate (files exist on disk since glob found them)
  report.validated = files.length;

  // Step 3+4: Import (self-executing)
  for (const filePath of files) {
    const absolutePath = path.resolve(filePath);
    try {
      await import(absolutePath);
      report.imported++;
      report.registered++;
    } catch (err) {
      report.errors.push({ path: absolutePath, step: 'import', error: String(err) });
    }
  }

  server.log.info({ loader: LOADER_NAME, registered: report.registered, errors: report.errors.length }, 'Environment modules loaded');
  return report;
}
