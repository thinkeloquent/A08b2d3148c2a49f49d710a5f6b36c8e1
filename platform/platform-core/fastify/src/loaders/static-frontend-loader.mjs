/**
 * Static Frontend Loader — discover -> validate -> import -> register -> report
 * Mounts frontend bundle directories as @fastify/static instances with SPA fallback.
 */
import path from 'node:path';
import fs from 'node:fs';
import { glob } from 'glob';
import { parse as parseYaml } from 'yaml';
import { createLoaderReport } from '../../../contracts/bootstrap-contract.mjs';

const LOADER_NAME = 'static-frontend-loader';

/** Simple per-IP rate limit config for SPA HTML routes (not static assets). */
const SPA_RATE_LIMIT = { max: 120, timeWindow: '1 minute' };

function normalizeAppPrefix(rawPath, appName) {
  if (!rawPath) return `/apps/${appName}`;
  if (rawPath.startsWith('/apps/')) return rawPath;
  const clean = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  return `/apps${clean}`;
}

async function mountFromDirectory(server, resolvedDir, activeProfile) {
  const results = { loaded: 0, errors: [], skipped: [], mounted: [] };
  const pattern = path.join(resolvedDir, '**/app.manifest.yaml');
  const manifestFiles = glob.sync(pattern);

  for (const manifestPath of manifestFiles) {
    const appDir = path.dirname(manifestPath);
    let manifest;
    try {
      manifest = parseYaml(fs.readFileSync(manifestPath, 'utf-8'));
    } catch { continue; }

    const bundlePath = manifest?.frontend?.bundlePath;
    if (!bundlePath) continue;

    const appName = manifest.id || manifest.name || path.basename(appDir);

    if (manifest.profiles?.length > 0 && !manifest.profiles.includes(activeProfile)) {
      results.skipped.push(appName);
      continue;
    }

    const resolvedBundlePath = path.resolve(appDir, bundlePath);
    if (!fs.existsSync(resolvedBundlePath)) {
      results.skipped.push(appName);
      continue;
    }

    const rawPrefix = manifest.frontend?.prefix || manifest.frontend?.mountPath;
    const staticPrefix = normalizeAppPrefix(rawPrefix, appName);

    try {
      const { default: fastifyStatic } = await import('@fastify/static');
      const indexHtmlPath = path.join(resolvedBundlePath, 'index.html');
      const isSpa = manifest.frontend?.spa !== false;

      await server.register(fastifyStatic, {
        root: resolvedBundlePath,
        prefix: `${staticPrefix}/`,
        decorateReply: false,
        wildcard: false,
      });

      if (isSpa && fs.existsSync(indexHtmlPath)) {
        const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
        server.get(staticPrefix, { config: { rateLimit: SPA_RATE_LIMIT } }, (_req, reply) => reply.type('text/html').send(indexHtml));
        server.get(`${staticPrefix}/*`, { config: { rateLimit: SPA_RATE_LIMIT } }, (req, reply) => {
          const wildcard = req.params['*'];
          const filePath = path.join(resolvedBundlePath, wildcard);
          if (!filePath.startsWith(resolvedBundlePath)) return reply.code(403).send({ error: 'Forbidden' });
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            return reply.sendFile(wildcard);
          }
          return reply.type('text/html').send(indexHtml);
        });
      }

      results.loaded++;
      results.mounted.push({ name: appName, prefix: staticPrefix, path: resolvedBundlePath });
    } catch (err) {
      results.errors.push({ app: appName, error: String(err) });
    }

    // Admin frontend
    if (manifest?.admin?.bundlePath && manifest?.admin?.mountPath) {
      const adminBundle = path.resolve(appDir, manifest.admin.bundlePath);
      if (fs.existsSync(adminBundle)) {
        try {
          const { default: fastifyStatic } = await import('@fastify/static');
          const adminPrefix = manifest.admin.mountPath.startsWith('/') ? manifest.admin.mountPath : `/${manifest.admin.mountPath}`;
          await server.register(fastifyStatic, {
            root: adminBundle,
            prefix: `${adminPrefix}/`,
            decorateReply: false,
            wildcard: false,
          });
          const adminIndex = path.join(adminBundle, 'index.html');
          if (fs.existsSync(adminIndex)) {
            const html = fs.readFileSync(adminIndex, 'utf-8');
            server.get(adminPrefix, { config: { rateLimit: SPA_RATE_LIMIT } }, (_req, reply) => reply.type('text/html').send(html));
            server.get(`${adminPrefix}/*`, { config: { rateLimit: SPA_RATE_LIMIT } }, (req, reply) => {
              const wildcard = req.params['*'];
              const fp = path.join(adminBundle, wildcard);
              if (!fp.startsWith(adminBundle)) return reply.code(403).send({ error: 'Forbidden' });
              if (fs.existsSync(fp) && fs.statSync(fp).isFile()) return reply.sendFile(wildcard);
              return reply.type('text/html').send(html);
            });
          }
          results.loaded++;
          results.mounted.push({ name: `${appName}-admin`, prefix: adminPrefix });
        } catch (err) {
          results.errors.push({ app: `${appName}-admin`, error: String(err) });
        }
      }
    }
  }

  return results;
}

export async function loadStaticFrontends(server, config) {
  const report = createLoaderReport(LOADER_NAME);
  const activeProfile = config.profile || process.env.PLATFORM_PROFILE || 'dev';

  // Both apps and frontendApps may be strings or arrays after mergeConfig
  const rawDirs = [
    ...(Array.isArray(config.paths?.apps) ? config.paths.apps : config.paths?.apps ? [config.paths.apps] : []),
    ...(Array.isArray(config.paths?.frontendApps) ? config.paths.frontendApps : config.paths?.frontendApps ? [config.paths.frontendApps] : []),
  ];

  for (const dir of rawDirs) {
    if (!dir) continue;
    const resolved = path.resolve(dir);
    if (!fs.existsSync(resolved)) continue;

    const result = await mountFromDirectory(server, resolved, activeProfile);
    report.registered += result.loaded;
    report.skipped += result.skipped.length;
    report.errors.push(...result.errors);
  }

  report.discovered = report.registered + report.skipped + report.errors.length;
  report.validated = report.registered + report.skipped;

  server.log.info({ loader: LOADER_NAME, registered: report.registered, skipped: report.skipped }, 'Static frontends processed');
  return report;
}
