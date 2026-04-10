/**
 * Apps Discovery Service
 *
 * Discovers registered apps by scanning fastify_apps directories
 * and extracting metadata from their frontend index.html files.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appsDir = resolve(__dirname, "../../../../");

const HIDDEN_APPS = new Set([
  "overview",
  "conditional_control_logic_viewer",
  "_shared",
]);

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : null;
}

function humanize(name) {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function discoverApps() {
  const apps = [];

  let entries;
  try {
    entries = readdirSync(appsDir, { withFileTypes: true });
  } catch {
    return apps;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || HIDDEN_APPS.has(entry.name)) continue;

    const frontendIndex = resolve(appsDir, entry.name, "frontend", "index.html");
    const distIndex = resolve(appsDir, entry.name, "frontend", "dist", "index.html");
    const indexPath = existsSync(distIndex) ? distIndex : existsSync(frontendIndex) ? frontendIndex : null;

    if (!indexPath) continue;

    const html = readFileSync(indexPath, "utf-8");
    const rawTitle = extractTitle(html);
    const folderName = entry.name;
    const hyphenated = folderName.replace(/_/g, "-");
    const stripped = folderName.replace(/^app[_-]/, "");

    const hasBackend = existsSync(resolve(appsDir, entry.name, "backend", "src", "index.mjs"));
    const hasAdmin = existsSync(resolve(appsDir, entry.name, "frontend-admin", "index.html"))
      || existsSync(resolve(appsDir, entry.name, "frontend-admin", "dist", "index.html"));

    apps.push({
      id: folderName,
      name: rawTitle && rawTitle !== "frontend" && rawTitle !== "Vite + React + TS"
        ? rawTitle
        : humanize(folderName),
      slug: hyphenated,
      path: `/apps/${stripped !== folderName ? stripped.replace(/_/g, "-") : hyphenated}`,
      folder: `fastify_apps/${folderName}`,
      hasBackend,
      hasAdmin,
    });
  }

  apps.sort((a, b) => a.name.localeCompare(b.name));
  return apps;
}
