import { loadAppYamlConfig } from "@internal/app-yaml-load";

// This file matches the signature bound by `server.mjs`:
// if (module.onStartup) startupHooks.push(module.onStartup);

export async function onStartup(server, config) {
  server.log.info("[lifecycle:app-yaml] Initializing App Yaml Static Config...");

  try {
    const { config: appConfig, sdk } = await loadAppYamlConfig();

    server.log.info({ providers: sdk.listProviders() }, "[lifecycle:app-yaml] Configuration loaded");

    // Debug: print security config values
    const corsOrigins = appConfig.getNested(["cors", "origins"], []);
    const cspDirectives = appConfig.getNested(
      ["contentSecurityPolicy", "directives"],
      {},
    );
    server.log.info({ corsOrigins }, "[lifecycle:app-yaml] [security.yml] cors.origins");
    for (const [directive, values] of Object.entries(cspDirectives)) {
      server.log.debug({ directive, values }, "[lifecycle:app-yaml] [security.yml] contentSecurityPolicy.directives");
    }

    // Decorate Fastify instance for global access.
    // server.mjs and app.mjs intentionally do NOT decorate 'config' so that
    // this hook is the sole owner of server.config (AppYamlConfig instance).
    if (!server.hasDecorator("config")) {
      server.log.info("[lifecycle:app-yaml] Decorating server with AppYamlConfig");
      server.decorate("config", appConfig);
    } else {
      // Fallback: if something else decorated config, force-replace via defineProperty
      server.log.warn("[lifecycle:app-yaml] server.config already decorated — force-replacing with AppYamlConfig");
      Object.defineProperty(server, 'config', {
        value: appConfig,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
    if (!server.hasDecorator("sdk")) {
      server.log.info("[lifecycle:app-yaml] Decorating server with sdk");
      server.decorate("sdk", sdk);
    }

    // Verify the decoration worked — catch assignment failures early
    if (typeof server.config?.getNested !== 'function') {
      throw new Error('[lifecycle:app-yaml] CRITICAL: server.config.getNested is not a function after decoration. server.config type: ' + typeof server.config);
    }

    server.log.info("[lifecycle:app-yaml] App Yaml Static Config initialized successfully");
  } catch (err) {
    server.log.error({ err, hookName: "01-app-yaml" }, "[lifecycle:app-yaml] App Yaml Static Config initialization failed");
    throw err;
  }
}
