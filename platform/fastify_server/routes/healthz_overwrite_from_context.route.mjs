/**
 * Mount overwrite-from-context health check routes to the Fastify application.
 * This function is called by the server bootstrap process.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  server.get("/healthz/admin/overwrite-from-context/status", async (request, reply) => {
    try {
      const registry = server.contextRegistry;
      if (!registry) {
        return {
          initialized: false,
          error: "Context resolver not configured",
        };
      }
      return {
        initialized: true,
        registeredFunctions: registry.list(),
      };
    } catch (e) {
      return {
        initialized: false,
        error: e.message,
      };
    }
  });

  server.get("/healthz/admin/overwrite-from-context/json", async (request, reply) => {
    try {
      const registry = server.contextRegistry;
      const rawConfig = server.contextRawConfig;
      const resolvedConfig = server.resolvedConfig;

      if (!registry) {
        return {
          initialized: false,
          error: "Context resolver not configured",
        };
      }

      const functionNames = registry.list();
      const functionScopes = {};
      for (const name of functionNames) {
        functionScopes[name] = registry.getScope(name);
      }
      return {
        initialized: true,
        config: {
          registeredFunctions: functionNames,
          functionScopes,
          rawConfig,
          resolvedConfig,
        },
      };
    } catch (e) {
      return {
        initialized: false,
        error: e.message,
      };
    }
  });

  server.get("/healthz/admin/overwrite-from-context/keys", async (request, reply) => {
    try {
      const registry = server.contextRegistry;

      if (!registry) {
        return {
          initialized: false,
          error: "Context resolver not configured",
        };
      }

      return {
        initialized: true,
        registeredFunctions: registry.list(),
      };
    } catch (e) {
      return {
        initialized: false,
        error: e.message,
      };
    }
  });

  server.get("/healthz/admin/overwrite-from-context/overwrite", async (request, reply) => {
    try {
      const registry = server.contextRegistry;
      const rawConfig = server.contextRawConfig;

      if (!registry) {
        return {
          initialized: false,
          error: "Context resolver not configured",
        };
      }

      // Import resolver and utilities from app-yaml-overwrites
      let createResolver, ComputeScope, applyOverwritesFromContext;
      try {
        const mod = await import("app_yaml_overwrites");
        createResolver = mod.createResolver;
        ComputeScope = mod.ComputeScope;
        applyOverwritesFromContext = mod.applyOverwritesFromContext;
      } catch (e) {
        return {
          initialized: false,
          error: "app-yaml-overwrites not installed",
        };
      }

      // Get app config from server.config (AppYamlConfig instance)
      const serverConfig = server.config;
      const appConfigDict = serverConfig?.getAll?.() || serverConfig?.toObject?.() || rawConfig || {};

      // Build REQUEST context
      const requestContext = {
        env: process.env,
        config: rawConfig,
        app: appConfigDict?.app || {},
        state: request.state || {},
        request: {
          headers: request.headers,
          query: request.query,
          params: request.params,
          body: request.body,
        },
      };

      // Create resolver instance
      const resolver = createResolver(registry);

      // Apply overwrites with template resolution if available
      let finalConfig;
      if (applyOverwritesFromContext) {
        finalConfig = await applyOverwritesFromContext(rawConfig, requestContext, {
          resolver,
          scope: ComputeScope.REQUEST,
          removeOverwriteKey: false, // Keep for debugging visibility
        });
      } else {
        // Fallback: just resolve templates without applying overwrites
        finalConfig = await resolver.resolveObject(
          rawConfig,
          requestContext,
          ComputeScope.REQUEST
        );
      }

      return {
        initialized: true,
        overwriteResolved: finalConfig,
        overwriteFromContextApplied: !!applyOverwritesFromContext,
      };
    } catch (e) {
      return {
        initialized: false,
        error: e.message,
      };
    }
  });
}
