#!/usr/bin/env node

import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolveGithubEnv } from "@internal/env-resolver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const platformRoot = path.resolve(__dirname, "..", "..", "..", "..");
const DEFAULT_CONFIG_DIR = path.join(platformRoot, "common", "config");
const DEFAULT_REPO_JSON = path.join(
  platformRoot,
  "common",
  "data",
  "repo.json",
);

const args = process.argv.slice(2);
const hasArg = (name) => args.includes(name);
const readArg = (name, fallback) => {
  const idx = args.indexOf(name);
  return idx >= 0 ? args[idx + 1] : fallback;
};

if (hasArg("--help") || hasArg("-h")) {
  console.log(`Usage: node sync-repo-with-github-meta.mjs [options]

Options:
  --config-dir <path>   AppYaml config directory (default: ${DEFAULT_CONFIG_DIR})
  --app-env <name>      App environment (default: APP_ENV or "dev")
  --repo-file <path>    Repo json path (default: ${DEFAULT_REPO_JSON})
  --dry-run             Do not write file; show summary only
  --refresh-all         Overwrite github-derived fields even when already present
  --prefer-config-token Prefer AppYaml token over environment token
`);
  process.exit(0);
}

const appEnv = readArg("--app-env", process.env.APP_ENV || "dev");
const configDir = readArg(
  "--config-dir",
  process.env.CONFIG_DIR || DEFAULT_CONFIG_DIR,
);
const repoFile = readArg("--repo-file", DEFAULT_REPO_JSON);
const dryRun = hasArg("--dry-run");
const refreshAll = hasArg("--refresh-all");
const preferConfigToken = hasArg("--prefer-config-token");

const importFile = async (absPath) => import(pathToFileURL(absPath).href);
const appYamlLoadMod = await importFile(
  path.join(platformRoot, "polyglot/app_yaml_load/mjs/dist/index.js"),
);
const githubSdkMod = await importFile(
  path.join(platformRoot, "polyglot/github_api/mjs/src/index.mjs"),
);
const githubCliSdkMod = await importFile(
  path.join(platformRoot, "packages_mjs/github-api-sdk-cli/dist/index.js"),
);

const { resolveToken } = githubSdkMod;
const { createGitHubClient, createLogger, createDebugLogger } = githubCliSdkMod;

function isMissingString(value) {
  return typeof value !== "string" || value.trim() === "";
}

function isMissingNumber(value) {
  return value === null || value === undefined || Number.isNaN(value);
}

function isMissingArray(value) {
  return !Array.isArray(value) || value.length === 0;
}

function parseGitHubOwnerRepo(githubUrl) {
  if (isMissingString(githubUrl)) return null;
  const match = githubUrl
    .trim()
    .match(
      /^https?:\/\/(?:www\.)?[^/]+\/([^/]+)\/([^/?#]+?)(?:\.git)?(?:[/?#].*)?$/i,
    );
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

function formatRelativeDate(isoDate) {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const deltaMs = now.getTime() - date.getTime();
  if (deltaMs < 0) return "just now";

  const oneDayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor(deltaMs / oneDayMs);
  if (days <= 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30)
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? "" : "s"} ago`;
  if (days < 365)
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? "" : "s"} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) === 1 ? "" : "s"} ago`;
}

function formatSizeFromKb(kb) {
  if (!Number.isFinite(kb) || kb < 0) return null;
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(kb))} KB`;
}

function licenseFromGitHub(repo) {
  if (!repo?.license) return null;
  if (repo.license.spdx_id && repo.license.spdx_id !== "NOASSERTION")
    return repo.license.spdx_id;
  return repo.license.name || null;
}

function applyField(
  target,
  key,
  nextValue,
  isMissingFn,
  stats,
  source,
  force = false,
  changes = null,
) {
  if (nextValue === null || nextValue === undefined) return;
  const current = target[key];
  const shouldSet = force || isMissingFn(current);
  if (!shouldSet) return;
  if (current === nextValue) return;
  if (changes) changes.push({ field: key, from: current, to: nextValue });
  target[key] = nextValue;
  stats.updatedFields += 1;
  stats.updatedByField[key] = (stats.updatedByField[key] || 0) + 1;
  stats.updatedFrom[source] = (stats.updatedFrom[source] || 0) + 1;
}

function resolveGitHubProviderConfig(appConfig) {
  return (
    appConfig.getNested(["providers", "github"], null) ||
    appConfig.getNested(["provider", "github"], null) ||
    {}
  );
}

function resolveGitHubToken(providerConfig) {
  const fromConfig =
    providerConfig.token ||
    providerConfig.endpoint_api_key ||
    providerConfig.access_token ||
    null;
  if (preferConfigToken) {
    return resolveToken(fromConfig || undefined);
  }

  try {
    return resolveToken(undefined);
  } catch {
    return resolveToken(fromConfig || undefined);
  }
}

function isAuthError(err) {
  return Number(err?.status) === 401;
}

function formatChangeValue(val) {
  if (val === null || val === undefined) return "(empty)";
  if (Array.isArray(val)) return `[${val.join(", ")}]`;
  if (typeof val === "string" && val.length > 60) return `"${val.slice(0, 57)}..."`;
  if (typeof val === "string") return `"${val}"`;
  return String(val);
}

function makeClient({ token, baseUrl, apiCalls }) {
  const clientConfig = {
    token,
    baseUrl,
    delay: 0.25,
    verbose: false,
    debug: false,
  };
  const { log } = createLogger(clientConfig);
  const { debugLog } = createDebugLogger(clientConfig);
  return createGitHubClient(clientConfig, { log, debugLog, apiCalls });
}

async function main() {
  const stats = {
    totalItems: 0,
    githubItems: 0,
    fetched: 0,
    updatedItems: 0,
    updatedFields: 0,
    skippedNoGithubUrl: 0,
    skippedInvalidGithubUrl: 0,
    errors: 0,
    updatedByField: {},
    updatedFrom: {},
  };

  const { config: appConfig } = await appYamlLoadMod.loadAppYamlConfig({
    configDir,
    appEnv,
  });
  const githubCfg = resolveGitHubProviderConfig(appConfig);
  let resolvedToken = resolveGitHubToken(githubCfg);

  const apiCalls = [];
  const githubBaseUrl =
    githubCfg.base_url ||
    resolveGithubEnv().baseApiUrl;

  let { makeRequest } = makeClient({
    token: resolvedToken.token,
    baseUrl: githubBaseUrl,
    apiCalls,
  });

  let beforeRateLimit;
  try {
    beforeRateLimit = await makeRequest("GET /rate_limit");
  } catch (err) {
    if (isAuthError(err)) {
      console.warn(
        "[sync-repo-with-github-meta] Configured token rejected by GitHub (401). Falling back to unauthenticated mode for public repos.",
      );
      console.warn(
        "[sync-repo-with-github-meta] Set a valid token with: export GITHUB_TOKEN=ghp_xxx",
      );
      console.warn(
        '[sync-repo-with-github-meta] Print current value with: echo "$GITHUB_TOKEN"',
      );
      resolvedToken = { token: undefined, source: "none", type: "none" };
      ({ makeRequest } = makeClient({
        token: undefined,
        baseUrl: githubBaseUrl,
        apiCalls,
      }));
      beforeRateLimit = await makeRequest("GET /rate_limit");
    } else {
      throw err;
    }
  }

  const raw = await readFile(repoFile, "utf-8");
  const items = JSON.parse(raw);
  stats.totalItems = items.length;

  const TAG = "[sync-repo]";
  const rateBefore = beforeRateLimit?.rate;
  console.log("");
  console.log(`${TAG} ── Sync repo.json with GitHub metadata ──`);
  console.log(`${TAG}   repos: ${items.length}  |  mode: ${refreshAll ? "refresh-all" : "fill-missing"}  |  dry-run: ${dryRun}`);
  console.log(`${TAG}   token: ${resolvedToken.source} (${resolvedToken.type})  |  rate-limit: ${rateBefore?.remaining ?? "?"}/${rateBefore?.limit ?? "?"}`);
  console.log("");

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const idx = `[${i + 1}/${items.length}]`;

    if (isMissingString(item.githubUrl)) {
      console.log(`${TAG} ${idx} SKIP  ${item.name ?? "(unnamed)"}  — no githubUrl`);
      stats.skippedNoGithubUrl += 1;
      continue;
    }

    stats.githubItems += 1;
    const ownerRepo = parseGitHubOwnerRepo(item.githubUrl);
    if (!ownerRepo) {
      console.log(`${TAG} ${idx} SKIP  ${item.name ?? "(unnamed)"}  — invalid githubUrl: ${item.githubUrl}`);
      stats.skippedInvalidGithubUrl += 1;
      continue;
    }

    const slug = `${ownerRepo.owner}/${ownerRepo.repo}`;

    try {
      const repo = await makeRequest("GET /repos/{owner}/{repo}", {
        owner: ownerRepo.owner,
        repo: ownerRepo.repo,
      });
      stats.fetched += 1;
      const beforeSnapshot = JSON.stringify(item);
      const changes = [];

      applyField(item, "githubUrl", repo.html_url, isMissingString, stats, "githubUrl", refreshAll, changes);
      applyField(item, "description", repo.description, isMissingString, stats, "description", refreshAll, changes);
      applyField(item, "stars", repo.stargazers_count, isMissingNumber, stats, "stargazers_count", refreshAll, changes);
      applyField(item, "forks", repo.forks_count, isMissingNumber, stats, "forks_count", refreshAll, changes);
      applyField(item, "language", repo.language, isMissingString, stats, "language", refreshAll, changes);
      applyField(item, "license", licenseFromGitHub(repo), isMissingString, stats, "license", refreshAll, changes);
      applyField(item, "size", formatSizeFromKb(repo.size), isMissingString, stats, "size", refreshAll, changes);
      applyField(item, "lastUpdated", formatRelativeDate(repo.pushed_at), isMissingString, stats, "pushed_at", refreshAll, changes);
      applyField(item, "maintainer", repo.owner?.login, isMissingString, stats, "owner.login", refreshAll, changes);

      if (
        (refreshAll || isMissingArray(item.tags)) &&
        Array.isArray(repo.topics) &&
        repo.topics.length > 0
      ) {
        const oldTags = item.tags;
        const tagsChanged =
          !Array.isArray(oldTags) ||
          oldTags.length !== repo.topics.length ||
          oldTags.some((t, j) => t !== repo.topics[j]);
        if (tagsChanged) {
          item.tags = repo.topics;
          changes.push({ field: "tags", from: oldTags, to: repo.topics });
          stats.updatedFields += 1;
          stats.updatedByField.tags = (stats.updatedByField.tags || 0) + 1;
          stats.updatedFrom.topics = (stats.updatedFrom.topics || 0) + 1;
        }
      }

      const afterSnapshot = JSON.stringify(item);
      if (afterSnapshot !== beforeSnapshot) {
        stats.updatedItems += 1;
      }

      if (changes.length === 0) {
        console.log(`${TAG} ${idx} OK    ${slug}  — no changes`);
      } else {
        console.log(`${TAG} ${idx} OK    ${slug}  — ${changes.length} field(s) updated:`);
        for (const c of changes) {
          const from = formatChangeValue(c.from);
          const to = formatChangeValue(c.to);
          console.log(`${TAG}          ${c.field}: ${from} -> ${to}`);
        }
      }
    } catch (err) {
      stats.errors += 1;
      console.error(`${TAG} ${idx} FAIL  ${slug}  — ${err?.message || String(err)}`);
    }
  }

  const afterRateLimit = await makeRequest("GET /rate_limit");
  const rateAfter = afterRateLimit?.rate;

  if (!dryRun && stats.updatedItems > 0) {
    await writeFile(repoFile, `${JSON.stringify(items, null, 2)}\n`, "utf-8");
  }

  console.log("");
  console.log(`${TAG} ── Summary ──`);
  console.log(`${TAG}   total: ${stats.totalItems}  |  fetched: ${stats.fetched}  |  updated: ${stats.updatedItems}  |  errors: ${stats.errors}`);
  console.log(`${TAG}   fields changed: ${stats.updatedFields}  |  skipped: ${stats.skippedNoGithubUrl + stats.skippedInvalidGithubUrl}`);
  console.log(`${TAG}   rate-limit: ${rateAfter?.remaining ?? "?"}/${rateAfter?.limit ?? "?"} remaining (used ${(rateBefore?.remaining ?? 0) - (rateAfter?.remaining ?? 0)} this run)`);
  if (dryRun) {
    console.log(`${TAG}   dry-run: file NOT written`);
  } else if (stats.updatedItems > 0) {
    console.log(`${TAG}   wrote: ${repoFile}`);
  } else {
    console.log(`${TAG}   no changes — file not written`);
  }
  if (Object.keys(stats.updatedByField).length > 0) {
    console.log(`${TAG}   fields: ${Object.entries(stats.updatedByField).map(([k, v]) => `${k}(${v})`).join(", ")}`);
  }
  console.log("");
}

main().catch((err) => {
  console.error("[sync-repo-with-github-meta] fatal error:", err);
  process.exitCode = 1;
});
