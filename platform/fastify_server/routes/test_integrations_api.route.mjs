/**
 * Test Integrations API Route
 *
 * Dynamically discovers test-integration-* frontend apps
 * and serves them as a JSON listing at /api/test-integrations/apps.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const frontendAppsDir = resolve(__dirname, "..", "..", "frontend_apps");

/** Cache discovered apps for the lifetime of the process. */
let _cachedApps = null;

/**
 * Extract <title> content from an HTML string.
 */
function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : null;
}

/**
 * Humanize a folder suffix: replace hyphens with spaces, title-case words.
 * e.g. "gemini-openai-sdk" → "Gemini Openai Sdk"
 */
function humanize(suffix) {
  return suffix
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Discover test-integration apps by scanning frontend_apps/.
 */
function discoverApps() {
  if (_cachedApps) return _cachedApps;

  const entries = readdirSync(frontendAppsDir, { withFileTypes: true });
  const apps = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!entry.name.startsWith("test-integration-")) continue;
    // Exclude the hub itself
    if (entry.name === "test-integrations") continue;

    const folderName = entry.name;
    const suffix = folderName.replace(/^test-integration-/, "");
    const folderPath = resolve(frontendAppsDir, folderName);

    // Try dist/index.html first, then root index.html for title
    let title = null;
    for (const htmlRelPath of ["dist/index.html", "index.html"]) {
      const htmlPath = resolve(folderPath, htmlRelPath);
      if (existsSync(htmlPath)) {
        title = extractTitle(readFileSync(htmlPath, "utf-8"));
        if (title && title !== "frontend") break;
      }
    }

    // Read optional description from package.json
    let description = null;
    const pkgPath = resolve(folderPath, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
        if (pkg.description) description = pkg.description;
      } catch {
        // ignore malformed package.json
      }
    }

    apps.push({
      name: title || humanize(suffix),
      description: description || null,
      path: `/apps/test-integration/${suffix}`,
      folder: folderName,
    });
  }

  apps.sort((a, b) => a.name.localeCompare(b.name));
  _cachedApps = apps;
  return apps;
}

/**
 * Mount routes to the Fastify application.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  server.get("/api/test-integrations/apps", async () => {
    return { apps: discoverApps() };
  });
}
