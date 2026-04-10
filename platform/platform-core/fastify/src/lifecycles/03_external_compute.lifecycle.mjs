/**
 * External/Cloud Compute Functions Registration Lifecycle
 *
 * This lifecycle runs BEFORE 04-context-resolver to ensure external compute functions
 * are registered before YamlConfig overwrites are resolved.
 *
 * Auto-loading from directories:
 *   Set EXTERNAL_COMPUTE_DIRS env var (colon-separated paths) to auto-load
 *   *.compute.mjs files from additional directories.
 *
 *   Example: EXTERNAL_COMPUTE_DIRS=/app/cloud-compute:/app/provider-compute
 *
 * Manual registration:
 *   Set server.externalComputeFunctions as an object:
 *   {
 *     "function_name": {
 *       fn: (ctx) => value,  // The compute function
 *       scope: ComputeScope.STARTUP  // or ComputeScope.REQUEST
 *     }
 *   }
 *
 *   Or simply:
 *   {
 *     "function_name": (ctx) => value  // defaults to STARTUP scope
 *   }
 *
 * Cloud providers should import and call registerExternalCompute() to add their functions.
 */

import { readdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

let ComputeScope;
let HAS_COMPUTE_SCOPE = false;

try {
  const resolver = await import("app_yaml_overwrites");
  ComputeScope = resolver.ComputeScope;
  HAS_COMPUTE_SCOPE = true;
} catch (e) {
  // app-yaml-overwrites not available
}

/**
 * Auto-load compute functions from *.compute.mjs files in a directory.
 *
 * @param {Object} server - Fastify server instance
 * @param {string} baseDir - Directory to scan
 * @param {Object} [logger] - Logger instance
 * @returns {Promise<string[]>} - List of loaded function names
 */
async function autoLoadFromDirectory(server, baseDir, logger = console) {
  if (!existsSync(baseDir)) {
    return [];
  }

  const loaded = [];

  try {
    const files = await readdir(baseDir);
    const computeFiles = files.filter((f) => f.endsWith(".compute.mjs"));

    for (const file of computeFiles) {
      const filepath = join(baseDir, file);
      const funcName = file.replace(".compute.mjs", "");

      try {
        const fileUrl = `file://${filepath}`;
        const module = await import(fileUrl);

        if (typeof module.register !== "function") {
          logger.warn({ filepath }, `[03-external-compute] ${filepath} does not export 'register' function, skipping`);
          continue;
        }

        const name = module.NAME || funcName;
        const scope = module.SCOPE || (HAS_COMPUTE_SCOPE ? ComputeScope.STARTUP : null);

        // Store in externalComputeFunctions for later registration
        server.externalComputeFunctions[name] = {
          fn: module.register,
          scope,
        };
        loaded.push(name);

        logger.info({ name, baseDir }, `[03-external-compute] Loaded from ${baseDir}: ${name}`);
      } catch (e) {
        logger.error({ err: e, filepath }, `[03-external-compute] Error loading ${filepath}: ${e.message}`);
      }
    }
  } catch (e) {
    logger.error({ err: e, baseDir }, `[03-external-compute] Error scanning directory ${baseDir}: ${e.message}`);
  }

  return loaded;
}

/**
 * Register an external compute function to be loaded before YAML resolution.
 *
 * @param {Object} server - Fastify server instance
 * @param {string} name - Function name (used as {{fn:name}} in YAML templates)
 * @param {Function} fn - The compute function - receives ctx object, returns value
 * @param {Object} [scope] - ComputeScope.STARTUP (cached) or ComputeScope.REQUEST (per-call)
 */
export function registerExternalCompute(server, name, fn, scope = null) {
  if (!server.externalComputeFunctions) {
    if (!server.hasDecorator("externalComputeFunctions")) {
      server.decorate("externalComputeFunctions", {});
    }
  }

  // Default to STARTUP scope
  const resolvedScope =
    scope || (HAS_COMPUTE_SCOPE ? ComputeScope.STARTUP : null);

  server.externalComputeFunctions[name] = {
    fn,
    scope: resolvedScope,
  };

  server.log.info({ name }, `[03-external-compute] Registered: ${name}`);
}

/**
 * Register multiple external compute functions at once.
 *
 * @param {Object} server - Fastify server instance
 * @param {Object} functions - Object mapping name -> fn or name -> {fn, scope}
 */
export function registerExternalComputeBatch(server, functions) {
  for (const [name, config] of Object.entries(functions)) {
    if (typeof config === "function") {
      registerExternalCompute(server, name, config);
    } else if (config?.fn) {
      registerExternalCompute(server, name, config.fn, config.scope);
    }
  }
}

/**
 * Lifecycle startup hook.
 * Initialize external compute functions registry and auto-load from directories.
 *
 * Environment variables:
 *   EXTERNAL_COMPUTE_DIRS - Colon-separated paths to scan for *.compute.mjs files
 *
 * Cloud provider modules should have already called registerExternalCompute()
 * before this lifecycle runs, or place files in EXTERNAL_COMPUTE_DIRS.
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:external-compute] External compute registration lifecycle starting...");

  try {
    // Initialize the externalComputeFunctions object if not exists
    if (!server.hasDecorator("externalComputeFunctions")) {
      server.log.info("[lifecycle:external-compute] Initializing externalComputeFunctions decorator");
      server.decorate("externalComputeFunctions", {});
    }

    // Auto-load from EXTERNAL_COMPUTE_DIRS environment variable
    const externalDirs = process.env.EXTERNAL_COMPUTE_DIRS;
    server.log.debug({ EXTERNAL_COMPUTE_DIRS: externalDirs || null }, "[lifecycle:external-compute] Checking EXTERNAL_COMPUTE_DIRS");

    if (externalDirs) {
      const dirs = externalDirs.split(":").filter(Boolean);
      server.log.info({ dirs }, "[lifecycle:external-compute] Loading from EXTERNAL_COMPUTE_DIRS");

      for (const dir of dirs) {
        const loaded = await autoLoadFromDirectory(server, dir.trim(), server.log);
        if (loaded.length > 0) {
          server.log.info({ dir, loaded }, `[lifecycle:external-compute] Auto-loaded from ${dir}: ${loaded.join(", ")}`);
        } else {
          server.log.debug({ dir }, "[lifecycle:external-compute] No compute files found in dir");
        }
      }
    }

    // Also check config for additional directories
    const configDirs = config?.external_compute_dirs || config?.externalComputeDirs;
    if (configDirs && Array.isArray(configDirs)) {
      server.log.info({ configDirs }, "[lifecycle:external-compute] Loading from config directories");
      for (const dir of configDirs) {
        const loaded = await autoLoadFromDirectory(server, dir, server.log);
        if (loaded.length > 0) {
          server.log.info({ dir, loaded }, `[lifecycle:external-compute] Auto-loaded from config dir ${dir}: ${loaded.join(", ")}`);
        }
      }
    }

    // Log current state
    const registered = Object.keys(server.externalComputeFunctions || {});
    if (registered.length > 0) {
      server.log.info({ registered }, `[lifecycle:external-compute] Total external functions ready: ${registered.join(", ")}`);
    } else {
      server.log.info("[lifecycle:external-compute] No external compute functions loaded");
    }

    server.log.info("[lifecycle:external-compute] External compute registration lifecycle complete");
  } catch (err) {
    server.log.error({ err, hookName: "03-external-compute" }, "[lifecycle:external-compute] External compute registration failed");
    throw err;
  }
}
