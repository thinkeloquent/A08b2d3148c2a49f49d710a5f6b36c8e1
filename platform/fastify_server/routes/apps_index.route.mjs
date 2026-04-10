/**
 * Apps Index Route
 *
 * Dynamically discovers and serves a listing page at /apps
 * by globbing fastify_apps/<name>/frontend/ directories.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const appsDir = resolve(__dirname, "..", "..", "fastify_apps");
const frontendAppsDir = resolve(__dirname, "..", "..", "frontend_apps");
const frontendDir = resolve(frontendAppsDir, "apps_index");

/** Cache discovered apps for the lifetime of the process. */
let _cachedApps = null;

/** Read and cache template + stylesheet from disk at startup. */
const _htmlTemplate = readFileSync(resolve(frontendDir, "index.html"), "utf-8");
const _css = readFileSync(resolve(frontendDir, "index.css"), "utf-8");

/**
 * Extract <title> content from an HTML string.
 */
function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : null;
}

/**
 * Humanize a folder name: replace underscores/hyphens with spaces, title-case.
 */
function humanize(name) {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Resolve the URL path for an app by checking the Fastify route table.
 * Tries the folder name as-is, hyphenated, and with common prefixes stripped.
 */
function resolveAppPath(server, folderName) {
  const candidates = new Set();
  const hyphenated = folderName.replace(/_/g, "-");
  candidates.add(`/apps/${folderName}`);
  candidates.add(`/apps/${hyphenated}`);

  // Strip common prefixes (e.g. app_ai_ask_v2 -> ai_ask_v2 -> ai-ask-v2)
  const stripped = folderName.replace(/^app[_-]/, "");
  if (stripped !== folderName) {
    candidates.add(`/apps/${stripped}`);
    candidates.add(`/apps/${stripped.replace(/_/g, "-")}`);
  }

  // Try replacing each hyphen with a slash to match nested route paths
  // (e.g. test-integration-storage -> test-integration/storage)
  for (let i = 0; i < hyphenated.length; i++) {
    if (hyphenated[i] === "-") {
      candidates.add(`/apps/${hyphenated.slice(0, i)}/${hyphenated.slice(i + 1)}`);
    }
  }

  for (const url of candidates) {
    if (server.hasRoute({ method: "GET", url })) return url;
  }
  // Fallback to folder name
  return `/apps/${folderName}`;
}

/**
 * Discover apps by scanning fastify_apps/<name>/frontend/ directories
 * and frontend_apps/<name>/dist/ directories (static-app-loader apps).
 */
function discoverApps(server) {
  if (_cachedApps) return _cachedApps;

  const apps = [];

  // 1. Scan fastify_apps/<name>/frontend/index.html
  const HIDE_FASTIFY_APPS = new Set(["conditional_control_logic_viewer"]);
  const fastifyEntries = readdirSync(appsDir, { withFileTypes: true });
  for (const entry of fastifyEntries) {
    if (!entry.isDirectory() || entry.name.startsWith("_") || HIDE_FASTIFY_APPS.has(entry.name)) continue;

    const appFrontendDir = resolve(appsDir, entry.name, "frontend");
    const indexPath = resolve(appFrontendDir, "index.html");

    if (!existsSync(indexPath)) continue;

    const html = readFileSync(indexPath, "utf-8");
    const title = extractTitle(html);
    const folderName = entry.name;

    apps.push({
      name: title && title !== "frontend" ? title : humanize(folderName),
      path: resolveAppPath(server, folderName),
      folder: `fastify_apps/${folderName}`,
    });
  }

  // 2. Scan frontend_apps/<name>/dist/index.html (static SPA apps)
  const SKIP_FRONTEND_DIRS = new Set(["apps_index", "node_modules"]);
  const HIDE_PREFIX = "test-integration-";
  const frontendEntries = readdirSync(frontendAppsDir, { withFileTypes: true });
  for (const entry of frontendEntries) {
    if (!entry.isDirectory() || entry.name.startsWith("_") || entry.name.startsWith(".") || SKIP_FRONTEND_DIRS.has(entry.name) || entry.name.startsWith(HIDE_PREFIX)) continue;

    const distIndexPath = resolve(frontendAppsDir, entry.name, "dist", "index.html");
    if (!existsSync(distIndexPath)) continue;

    const html = readFileSync(distIndexPath, "utf-8");
    const title = extractTitle(html);
    const folderName = entry.name;
    const appPath = resolveAppPath(server, folderName);

    apps.push({
      name: title && title !== "Vite + React + TS" ? title : humanize(folderName),
      path: appPath,
      folder: `frontend_apps/${folderName}`,
    });
  }

  apps.sort((a, b) => a.name.localeCompare(b.name));
  _cachedApps = apps;
  return apps;
}

function renderHtml(apps) {
  const appCards = apps
    .map(
      (app) => `
        <a href="${app.path}" class="card">
          <div class="card-content">
            <div>
              <h2>${app.name}</h2>
              <code class="path">${app.folder}</code>
            </div>
            <svg class="arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </div>
        </a>`,
    )
    .join("\n");

  return _htmlTemplate.replace("{{APP_CARDS}}", appCards);
}

/**
 * Mount routes to the Fastify application.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  server.get("/apps/_index.css", async (request, reply) => {
    reply.type("text/css");
    return _css;
  });

  server.get("/apps", async (request, reply) => {
    const apps = discoverApps(server);
    reply.type("text/html");
    return renderHtml(apps);
  });
}
