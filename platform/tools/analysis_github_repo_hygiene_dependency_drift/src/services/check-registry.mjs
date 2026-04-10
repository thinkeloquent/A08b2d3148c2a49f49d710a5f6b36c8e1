import semver from "semver";
import { DRIFT_THRESHOLDS } from "../domain/models.mjs";

/**
 * Check the latest version of an npm package from the registry.
 * @param {string} packageName
 * @param {{ log: Function, debugLog: Function, cache: Map }} ctx
 * @returns {Promise<{latestVersion: string, publishedAt: string} | null>}
 */
export async function checkNpmRegistry(packageName, ctx) {
  const { log, debugLog, cache } = ctx;

  const cacheKey = `npm:${packageName}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        log(`npm package '${packageName}' not found on registry`);
        cache.set(cacheKey, null);
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const latestVersion = data["dist-tags"]?.latest;

    if (!latestVersion) {
      cache.set(cacheKey, null);
      return null;
    }

    // Get publish date of latest version
    const publishedAt = data.time?.[latestVersion] || null;

    const result = { latestVersion, publishedAt };
    cache.set(cacheKey, result);

    await debugLog("npm_registry_check", { packageName, latestVersion, publishedAt });

    return result;
  } catch (error) {
    log(`Failed to check npm registry for '${packageName}': ${error.message}`, "warn");
    cache.set(cacheKey, null);
    return null;
  }
}

/**
 * Check the latest version of a PyPI package from the registry.
 * @param {string} packageName
 * @param {{ log: Function, debugLog: Function, cache: Map }} ctx
 * @returns {Promise<{latestVersion: string, publishedAt: string} | null>}
 */
export async function checkPypiRegistry(packageName, ctx) {
  const { log, debugLog, cache } = ctx;

  const cacheKey = `pypi:${packageName}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const url = `https://pypi.org/pypi/${encodeURIComponent(packageName)}/json`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        log(`PyPI package '${packageName}' not found on registry`);
        cache.set(cacheKey, null);
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const latestVersion = data.info?.version;

    if (!latestVersion) {
      cache.set(cacheKey, null);
      return null;
    }

    // Get upload date of latest release
    const latestRelease = data.releases?.[latestVersion];
    const publishedAt = latestRelease?.[0]?.upload_time_iso_8601 || null;

    const result = { latestVersion, publishedAt };
    cache.set(cacheKey, result);

    await debugLog("pypi_registry_check", { packageName, latestVersion, publishedAt });

    return result;
  } catch (error) {
    log(`Failed to check PyPI registry for '${packageName}': ${error.message}`, "warn");
    cache.set(cacheKey, null);
    return null;
  }
}

/**
 * Compute version drift between current and latest versions.
 * @param {string} currentVersion - Current version string
 * @param {string} latestVersion - Latest version string
 * @param {string} ecosystem - "npm" or "pypi"
 * @returns {{ versionsBehind: {major: number, minor: number, patch: number}, severity: string } | null}
 */
export function computeVersionDrift(currentVersion, latestVersion, ecosystem) {
  if (!currentVersion || !latestVersion) return null;
  if (currentVersion === "unknown") return null;

  // Try semver comparison for npm
  if (ecosystem === "npm") {
    const current = semver.coerce(currentVersion);
    const latest = semver.coerce(latestVersion);

    if (!current || !latest) return null;

    const majorDiff = latest.major - current.major;
    const minorDiff = majorDiff === 0 ? latest.minor - current.minor : 0;
    const patchDiff = majorDiff === 0 && minorDiff === 0 ? latest.patch - current.patch : 0;

    return {
      versionsBehind: {
        major: Math.max(0, majorDiff),
        minor: Math.max(0, minorDiff),
        patch: Math.max(0, patchDiff),
      },
      severity: classifySeverity(Math.max(0, majorDiff), Math.max(0, minorDiff), Math.max(0, patchDiff)),
    };
  }

  // For PyPI, attempt best-effort semver coercion
  const current = semver.coerce(currentVersion);
  const latest = semver.coerce(latestVersion);

  if (!current || !latest) {
    // Fallback: simple string comparison
    if (currentVersion === latestVersion) {
      return {
        versionsBehind: { major: 0, minor: 0, patch: 0 },
        severity: "current",
      };
    }
    return {
      versionsBehind: { major: 0, minor: 0, patch: 0 },
      severity: "minor",
    };
  }

  const majorDiff = latest.major - current.major;
  const minorDiff = majorDiff === 0 ? latest.minor - current.minor : 0;
  const patchDiff = majorDiff === 0 && minorDiff === 0 ? latest.patch - current.patch : 0;

  return {
    versionsBehind: {
      major: Math.max(0, majorDiff),
      minor: Math.max(0, minorDiff),
      patch: Math.max(0, patchDiff),
    },
    severity: classifySeverity(Math.max(0, majorDiff), Math.max(0, minorDiff), Math.max(0, patchDiff)),
  };
}

/**
 * Classify drift severity based on version differences.
 * @param {number} major
 * @param {number} minor
 * @param {number} patch
 * @returns {string}
 */
function classifySeverity(major, minor, patch) {
  if (major === 0 && minor === 0 && patch === 0) return "current";
  if (major === 0) return "minor";
  if (major < DRIFT_THRESHOLDS.MAJOR) return "moderate";
  if (major < DRIFT_THRESHOLDS.CRITICAL) return "major";
  return "critical";
}

/**
 * Compute drift in days between the latest publish date and now.
 * @param {string | null} publishedAt - ISO date of latest publish
 * @returns {number | null}
 */
export function computeDriftDays(publishedAt) {
  if (!publishedAt) return null;

  const published = new Date(publishedAt);
  const now = new Date();
  const diffMs = now.getTime() - published.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// ── Maven Central ────────────────────────────────────────────────────

/**
 * Check the latest version of a Maven artifact from Maven Central.
 * Package name format: "groupId:artifactId"
 * @param {string} packageName
 * @param {{ log: Function, debugLog: Function, cache: Map }} ctx
 * @returns {Promise<{latestVersion: string, publishedAt: string} | null>}
 */
export async function checkMavenRegistry(packageName, ctx) {
  const { log, debugLog, cache } = ctx;
  const cacheKey = `maven:${packageName}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const [groupId, artifactId] = packageName.split(":");
    if (!groupId || !artifactId) {
      cache.set(cacheKey, null);
      return null;
    }

    const url = `https://search.maven.org/solrsearch/select?q=g:%22${encodeURIComponent(groupId)}%22+AND+a:%22${encodeURIComponent(artifactId)}%22&rows=1&wt=json`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        log(`Maven package '${packageName}' not found on registry`);
        cache.set(cacheKey, null);
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const doc = data.response?.docs?.[0];
    if (!doc) {
      cache.set(cacheKey, null);
      return null;
    }

    const latestVersion = doc.latestVersion || doc.v;
    const publishedAt = doc.timestamp ? new Date(doc.timestamp).toISOString() : null;

    const result = { latestVersion, publishedAt };
    cache.set(cacheKey, result);
    await debugLog("maven_registry_check", { packageName, latestVersion, publishedAt });
    return result;
  } catch (error) {
    log(`Failed to check Maven Central for '${packageName}': ${error.message}`, "warn");
    cache.set(cacheKey, null);
    return null;
  }
}

// ── Go Proxy ─────────────────────────────────────────────────────────

/**
 * Check the latest version of a Go module via the Go module proxy.
 * @param {string} packageName - Go module path (e.g. "github.com/gin-gonic/gin")
 * @param {{ log: Function, debugLog: Function, cache: Map }} ctx
 * @returns {Promise<{latestVersion: string, publishedAt: string} | null>}
 */
export async function checkGoRegistry(packageName, ctx) {
  const { log, debugLog, cache } = ctx;
  const cacheKey = `go:${packageName}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    // Go module path encoding: uppercase letters become !lowercase
    const encoded = packageName.replace(/[A-Z]/g, (c) => `!${c.toLowerCase()}`);
    const url = `https://proxy.golang.org/${encoded}/@latest`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 410) {
        log(`Go module '${packageName}' not found on proxy`);
        cache.set(cacheKey, null);
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const latestVersion = data.Version;
    const publishedAt = data.Time || null;

    if (!latestVersion) {
      cache.set(cacheKey, null);
      return null;
    }

    const result = { latestVersion, publishedAt };
    cache.set(cacheKey, result);
    await debugLog("go_registry_check", { packageName, latestVersion, publishedAt });
    return result;
  } catch (error) {
    log(`Failed to check Go proxy for '${packageName}': ${error.message}`, "warn");
    cache.set(cacheKey, null);
    return null;
  }
}

// ── RubyGems ─────────────────────────────────────────────────────────

/**
 * Check the latest version of a Ruby gem from RubyGems.org.
 * @param {string} packageName
 * @param {{ log: Function, debugLog: Function, cache: Map }} ctx
 * @returns {Promise<{latestVersion: string, publishedAt: string} | null>}
 */
export async function checkRubygemsRegistry(packageName, ctx) {
  const { log, debugLog, cache } = ctx;
  const cacheKey = `rubygems:${packageName}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const url = `https://rubygems.org/api/v1/gems/${encodeURIComponent(packageName)}.json`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        log(`RubyGems package '${packageName}' not found on registry`);
        cache.set(cacheKey, null);
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const latestVersion = data.version;
    const publishedAt = data.version_created_at || null;

    if (!latestVersion) {
      cache.set(cacheKey, null);
      return null;
    }

    const result = { latestVersion, publishedAt };
    cache.set(cacheKey, result);
    await debugLog("rubygems_registry_check", { packageName, latestVersion, publishedAt });
    return result;
  } catch (error) {
    log(`Failed to check RubyGems for '${packageName}': ${error.message}`, "warn");
    cache.set(cacheKey, null);
    return null;
  }
}

// ── crates.io (Rust / Cargo) ─────────────────────────────────────────

/**
 * Check the latest version of a Rust crate from crates.io.
 * @param {string} packageName
 * @param {{ log: Function, debugLog: Function, cache: Map }} ctx
 * @returns {Promise<{latestVersion: string, publishedAt: string} | null>}
 */
export async function checkCargoRegistry(packageName, ctx) {
  const { log, debugLog, cache } = ctx;
  const cacheKey = `cargo:${packageName}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const url = `https://crates.io/api/v1/crates/${encodeURIComponent(packageName)}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "dependency-drift-analyzer",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        log(`Cargo crate '${packageName}' not found on registry`);
        cache.set(cacheKey, null);
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const latestVersion = data.crate?.max_version || data.crate?.newest_version;
    const publishedAt = data.versions?.[0]?.created_at || data.crate?.updated_at || null;

    if (!latestVersion) {
      cache.set(cacheKey, null);
      return null;
    }

    const result = { latestVersion, publishedAt };
    cache.set(cacheKey, result);
    await debugLog("cargo_registry_check", { packageName, latestVersion, publishedAt });
    return result;
  } catch (error) {
    log(`Failed to check crates.io for '${packageName}': ${error.message}`, "warn");
    cache.set(cacheKey, null);
    return null;
  }
}

// ── NuGet ────────────────────────────────────────────────────────────

/**
 * Check the latest version of a NuGet package.
 * @param {string} packageName
 * @param {{ log: Function, debugLog: Function, cache: Map }} ctx
 * @returns {Promise<{latestVersion: string, publishedAt: string | null} | null>}
 */
export async function checkNugetRegistry(packageName, ctx) {
  const { log, debugLog, cache } = ctx;
  const cacheKey = `nuget:${packageName}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const lowerName = packageName.toLowerCase();
    const url = `https://api.nuget.org/v3-flatcontainer/${encodeURIComponent(lowerName)}/index.json`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        log(`NuGet package '${packageName}' not found on registry`);
        cache.set(cacheKey, null);
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const versions = data.versions;
    if (!versions || versions.length === 0) {
      cache.set(cacheKey, null);
      return null;
    }

    // Prefer latest stable version (no pre-release suffix)
    const stableVersions = versions.filter((v) => !v.includes("-"));
    const latestVersion = stableVersions.length > 0
      ? stableVersions[stableVersions.length - 1]
      : versions[versions.length - 1];

    const result = { latestVersion, publishedAt: null };
    cache.set(cacheKey, result);
    await debugLog("nuget_registry_check", { packageName, latestVersion });
    return result;
  } catch (error) {
    log(`Failed to check NuGet registry for '${packageName}': ${error.message}`, "warn");
    cache.set(cacheKey, null);
    return null;
  }
}

// ── Packagist (PHP / Composer) ───────────────────────────────────────

/**
 * Check the latest version of a Composer package from Packagist.
 * @param {string} packageName - "vendor/package" format
 * @param {{ log: Function, debugLog: Function, cache: Map }} ctx
 * @returns {Promise<{latestVersion: string, publishedAt: string} | null>}
 */
export async function checkComposerRegistry(packageName, ctx) {
  const { log, debugLog, cache } = ctx;
  const cacheKey = `composer:${packageName}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const url = `https://repo.packagist.org/p2/${packageName}.json`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        log(`Packagist package '${packageName}' not found on registry`);
        cache.set(cacheKey, null);
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const pkgVersions = data.packages?.[packageName];
    if (!pkgVersions || pkgVersions.length === 0) {
      cache.set(cacheKey, null);
      return null;
    }

    // Find latest stable version (not dev, not pre-release)
    const stable = pkgVersions.find(
      (v) => v.version && /^\d/.test(v.version) && !v.version.includes("-")
    );
    const latest = stable || pkgVersions[0];
    const latestVersion = latest.version;
    const publishedAt = latest.time || null;

    if (!latestVersion) {
      cache.set(cacheKey, null);
      return null;
    }

    const result = { latestVersion, publishedAt };
    cache.set(cacheKey, result);
    await debugLog("composer_registry_check", { packageName, latestVersion, publishedAt });
    return result;
  } catch (error) {
    log(`Failed to check Packagist for '${packageName}': ${error.message}`, "warn");
    cache.set(cacheKey, null);
    return null;
  }
}

// ── Unified registry dispatcher ──────────────────────────────────────

/**
 * Route to the appropriate registry checker based on ecosystem.
 * @param {string} ecosystem
 * @param {string} packageName
 * @param {object} ctx
 * @returns {Promise<{latestVersion: string, publishedAt: string | null} | null>}
 */
export async function checkRegistryForPackage(ecosystem, packageName, ctx) {
  switch (ecosystem) {
    case "npm": return checkNpmRegistry(packageName, ctx);
    case "pypi": return checkPypiRegistry(packageName, ctx);
    case "maven": return checkMavenRegistry(packageName, ctx);
    case "go": return checkGoRegistry(packageName, ctx);
    case "rubygems": return checkRubygemsRegistry(packageName, ctx);
    case "cargo": return checkCargoRegistry(packageName, ctx);
    case "nuget": return checkNugetRegistry(packageName, ctx);
    case "composer": return checkComposerRegistry(packageName, ctx);
    default: return null;
  }
}
