import { readdir } from "fs/promises";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { registerComputeFunctions } from "./04-context-resolver.registry.mjs";

let createRegistry,
  ComputeScope,
  createSdk,
  createSharedContext,
  contextResolverPlugin;
let HAS_RESOLVER = false;

try {
  const resolver = await import("app_yaml_overwrites");
  createRegistry = resolver.createRegistry;
  ComputeScope = resolver.ComputeScope;
  createSdk = resolver.createSdk;
  createSharedContext = resolver.createSharedContext;

  // Attempt to load plugin (checking for both new and legacy names if needed)
  contextResolverPlugin = resolver.configPlugin;

  if (!contextResolverPlugin) {
    // Fallback or explicit import if not exported in main index
    const integrations = await import(
      "app_yaml_overwrites/integrations/fastify"
    );
    contextResolverPlugin =
      integrations.configPlugin || integrations.contextResolverPlugin;
  }

  HAS_RESOLVER = true;
} catch (e) {
  console.warn("[lifecycle:context-resolver] app_yaml_overwrites not available:", e.message);
}

/**
 * Auto-load compute functions from *.compute.mjs files in computed_functions directory.
 *
 * Each file should expose:
 * - register: function - The compute function to register
 * - NAME (optional): string - Name to register under (defaults to filename without .compute.mjs)
 * - SCOPE (optional): ComputeScope - Scope for the function (defaults to ComputeScope.STARTUP)
 *
 * @param {Object} registry - The compute function registry
 * @param {string} [baseDir] - Base directory to scan (defaults to ../computed_functions)
 * @param {Object} [logger] - Logger instance
 * @returns {Promise<string[]>} - List of loaded function names
 */
async function autoLoadComputeFunctions(
  registry,
  baseDir = null,
  logger = console
) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  if (!baseDir) {
    baseDir = join(__dirname, "..", "..", "computed_functions");
  }

  if (!existsSync(baseDir)) {
    return [];
  }

  const loaded = [];

  try {
    const files = await readdir(baseDir);
    const computeFiles = files.filter((f) => f.endsWith(".compute.mjs"));

    // Log files that don't match the *.compute.mjs pattern
    const allMjsFiles = files.filter((f) => f.endsWith(".mjs"));
    const ignoredFiles = allMjsFiles.filter((f) => !f.endsWith(".compute.mjs"));
    if (ignoredFiles.length > 0) {
      logger.info(
        { ignoredFiles },
        "[lifecycle:context-resolver] Ignored files in computed_functions/ (don't match *.compute.mjs pattern)"
      );
    }

    for (const file of computeFiles) {
      const filepath = join(baseDir, file);
      const funcName = file.replace(".compute.mjs", "");

      try {
        // Dynamic import using file:// URL
        const fileUrl = `file://${filepath}`;
        const module = await import(fileUrl);

        // Get required register function
        if (typeof module.register !== "function") {
          logger.warn(
            { filepath },
            `[lifecycle:context-resolver] ${filepath} does not export 'register' function, skipping`
          );
          continue;
        }

        const registerFunc = module.register;

        // Get optional NAME (defaults to filename)
        const name = module.NAME || funcName;

        // Get optional SCOPE (defaults to STARTUP)
        const scope = module.SCOPE || ComputeScope.STARTUP;

        // Register the function
        registry.register(name, registerFunc, scope);
        loaded.push(name);
        logger.debug({ name, scope }, "[lifecycle:context-resolver] Registered compute function");
      } catch (e) {
        logger.error(
          { err: e, filepath },
          `[lifecycle:context-resolver] Error loading compute function from ${filepath}: ${e.message}`
        );
      }
    }
  } catch (e) {
    logger.error(
      { err: e, baseDir },
      `[lifecycle:context-resolver] Error scanning computed_functions directory: ${e.message}`
    );
  }

  return loaded;
}


export async function onStartup(server, config) {
  server.log.info(
    { HAS_RESOLVER },
    "[lifecycle:context-resolver] Initializing context resolver..."
  );

  try {
    if (!HAS_RESOLVER) {
      server.log.warn(
        "[lifecycle:context-resolver] app_yaml_overwrites not installed, context resolver skipping."
      );
      return;
    }

    server.log.info("[lifecycle:context-resolver] Initializing app_yaml_overwrites...");

    // server.config is AppYamlConfig instance (decorated in 01)
    const appConfig = server.config;
    server.log.info(
      { appConfigExists: !!appConfig, appConfigType: typeof appConfig },
      "[lifecycle:context-resolver] Checking server.config"
    );
    if (!appConfig) {
      server.log.warn("[lifecycle:context-resolver] server.config not found. Context resolver skipping.");
      return;
    }

    // Get raw config
    server.log.info("[lifecycle:context-resolver] Extracting raw config from AppYamlConfig");
    const rawConfig = appConfig.toObject
      ? appConfig.toObject()
      : appConfig.getAll
      ? appConfig.getAll()
      : {};

    server.log.info("[lifecycle:context-resolver] Creating compute function registry");
    const registry = createRegistry(server.log);
    registerComputeFunctions(registry, ComputeScope);
    server.log.info("[lifecycle:context-resolver] Built-in compute functions registered");

    // Auto-load compute functions from computed_functions directory
    server.log.info("[lifecycle:context-resolver] Auto-loading compute functions from computed_functions directory");
    const autoLoaded = await autoLoadComputeFunctions(registry, null, server.log);
    if (autoLoaded.length > 0) {
      server.log.info({ autoLoaded }, `[lifecycle:context-resolver] Auto-loaded compute functions: ${autoLoaded.join(", ")}`);
    } else {
      server.log.info("[lifecycle:context-resolver] No additional compute functions found in computed_functions directory");
    }

    // Register external/cloud compute functions from server.externalComputeFunctions
    // These should be set by an earlier lifecycle (e.g., 03-external-compute.lifecycle.mjs)
    const externalComputeFunctions = server.externalComputeFunctions;
    server.log.debug({ hasExternal: !!(externalComputeFunctions && Object.keys(externalComputeFunctions).length) }, "[lifecycle:context-resolver] Checking externalComputeFunctions");
    if (externalComputeFunctions && typeof externalComputeFunctions === "object") {
      const externalLoaded = [];
      for (const [name, funcConfig] of Object.entries(externalComputeFunctions)) {
        try {
          const fn = typeof funcConfig === "function" ? funcConfig : funcConfig?.fn;
          const scope =
            typeof funcConfig === "function"
              ? ComputeScope.STARTUP
              : funcConfig?.scope || ComputeScope.STARTUP;
          if (fn) {
            registry.register(name, fn, scope);
            externalLoaded.push(name);
          }
        } catch (e) {
          server.log.error({ err: e, name }, `[lifecycle:context-resolver] Error registering external compute function '${name}': ${e.message}`);
        }
      }
      if (externalLoaded.length > 0) {
        server.log.info({ externalLoaded }, `[lifecycle:context-resolver] Registered external compute functions: ${externalLoaded.join(", ")}`);
      }
    }

    // Initialize SDK and SharedContext (Standard Compliance)
    // Note: server.sdk might be decorated with AppYamlConfigSDK from 01-app-yaml.mjs,
    // but we need ConfigSDK from app-yaml-overwrites which has getResolved() method.
    // We use a different decorator name 'configSdk' to avoid conflicts.
    let sdkInstance;
    if (createSdk) {
      if (
        server.hasDecorator("configSdk") &&
        typeof server.configSdk?.getResolved === "function"
      ) {
        sdkInstance = server.configSdk;
        server.log.info("[lifecycle:context-resolver] Using existing server.configSdk");
      } else {
        server.log.info("[lifecycle:context-resolver] Creating new ConfigSDK instance");
        sdkInstance = await createSdk({ config: rawConfig, registry: registry });
        if (!server.hasDecorator("configSdk")) {
          server.decorate("configSdk", sdkInstance);
        }
        server.log.info("[lifecycle:context-resolver] Created new ConfigSDK instance");
        server.log.debug(
          { methods: Object.getOwnPropertyNames(Object.getPrototypeOf(sdkInstance)) },
          "[lifecycle:context-resolver] ConfigSDK available methods"
        );
      }
    }

    // SharedContext is now created in 02-create_shared_context.mjs
    // Just verify it exists for the plugin
    if (createSharedContext) {
      const sharedContext = server.sharedContext || createSharedContext();
      if (!server.hasDecorator("sharedContext")) {
        server.decorate("sharedContext", sharedContext);
        server.log.info("[lifecycle:context-resolver] Created fallback SharedContext instance");
      } else {
        server.log.info(
          "[lifecycle:context-resolver] Using existing server.sharedContext from 02-create_shared_context.mjs"
        );
      }
    }

    // Register plugin which handles decoration and STARTUP resolution
    // We pass the manually created SDK to avoid duplication
    try {
      server.log.info("[lifecycle:context-resolver] Registering contextResolverPlugin");
      await server.register(contextResolverPlugin, {
        sdk: sdkInstance, // Pass the manual ConfigSDK instance
        registry: registry,
        decoratorName: "configSdk", // Use 'configSdk' to avoid conflict with AppYamlConfigSDK on 'sdk'
        resolveOnStartup: true,
        perRequestResolution: true, // Enable if needed (FastAPI has manual middleware, Fastify has hook)
        logger: server.log,
      });
      server.log.info("[lifecycle:context-resolver] contextResolverPlugin registered successfully");
    } catch (pluginErr) {
      server.log.error(
        { err: pluginErr },
        `[lifecycle:context-resolver] Failed to register contextResolverPlugin: ${pluginErr.message}`
      );
    }

    // Decorate server with registry for healthz access (always do this, even if plugin failed)
    if (!server.hasDecorator("contextRegistry")) {
      server.decorate("contextRegistry", registry);
      server.log.info("[lifecycle:context-resolver] Decorated server with contextRegistry");
    }
    if (!server.hasDecorator("contextRawConfig")) {
      server.decorate("contextRawConfig", rawConfig);
      server.log.info("[lifecycle:context-resolver] Decorated server with contextRawConfig");
    }

    // Log all registered compute functions
    const allFunctions = registry.list();
    server.log.info(
      { count: allFunctions.length, functions: allFunctions },
      "[lifecycle:context-resolver] app_yaml_overwrites initialized"
    );
  } catch (err) {
    server.log.error({ err, hookName: "04-context-resolver" }, "[lifecycle:context-resolver] Context resolver initialization failed");
    throw err;
  }
}
