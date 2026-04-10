/**
 * Route Loader — discover -> validate -> import -> register -> report
 * Discovers *.routes.mjs and *.route.mjs files, registers with Fastify.
 */
import path from 'node:path';
import fs from 'node:fs';
import { glob } from 'glob';
import { createLoaderReport, sortByNumericPrefix } from '../../../contracts/bootstrap-contract.mjs';

const LOADER_NAME = 'route-loader';

export async function loadRoutes(server, config) {
  const report = createLoaderReport(LOADER_NAME);

  const routesDirs = config.paths?.routes;
  if (!routesDirs) {
    server.log.debug({ loader: LOADER_NAME }, 'No routes directory configured');
    return report;
  }

  const dirs = Array.isArray(routesDirs) ? routesDirs : [routesDirs];

  // Step 1: Discover from all directories — support both *.routes.mjs and *.route.mjs during migration
  let allFiles = [];
  for (const dir of dirs) {
    const resolved = path.resolve(dir);
    if (fs.existsSync(resolved)) {
      allFiles.push(
        ...glob.sync(path.join(resolved, '*.routes.mjs')),
        ...glob.sync(path.join(resolved, '*.route.mjs')),
      );
    }
  }
  const files = sortByNumericPrefix([...new Set(allFiles)]);
  report.discovered = files.length;

  // Step 2: Validate
  report.validated = files.length;

  // Step 3+4: Import + Register
  for (const filePath of files) {
    const absolutePath = path.resolve(filePath);
    const baseName = path.basename(absolutePath);
    try {
      const mod = await import(absolutePath);
      const routeFn = mod.default ?? mod.mount;
      if (typeof routeFn !== 'function') {
        report.skipped++;
        server.log.warn({ loader: LOADER_NAME, module: baseName }, 'Route module has no default export or mount function, skipping');
        continue;
      }

      // Use register for encapsulation (route modules get their own scope)
      await server.register(routeFn);
      report.imported++;
      report.registered++;
    } catch (err) {
      server.log.error({ loader: LOADER_NAME, module: baseName, error: String(err) }, 'Failed to register route');
      report.errors.push({ path: absolutePath, step: 'register', error: String(err) });
    }
  }

  server.log.info({ loader: LOADER_NAME, registered: report.registered, errors: report.errors.length }, 'Route modules loaded');
  return report;
}
