import { AppYamlConfig } from "@internal/app-yaml-static-config";

/**
 * Mount endpoint configuration routes to the Fastify application.
 * Exposes endpoints loaded from endpoint.${APP_ENV}.yaml
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  /**
   * GET /api/runtime-app-config/endpoints
   * Returns all configured endpoints
   */
  server.get("/api/runtime-app-config/endpoints", async (request, reply) => {
    try {
      const instance = AppYamlConfig.getInstance();
      const endpoints = instance.get("endpoints") || {};
      return {
        success: true,
        endpoints,
      };
    } catch (e) {
      reply.status(500);
      return {
        success: false,
        error: e.message,
      };
    }
  });

  /**
   * POST /api/runtime-app-config/endpoints/refresh
   * Re-reads endpoint YAML from disk
   */
  server.post("/api/runtime-app-config/endpoints/refresh", async (request, reply) => {
    try {
      const sdk = server.endpointConfigSdk;
      if (!sdk) {
        reply.status(503);
        return { success: false, error: "EndpointConfigSDK not initialized" };
      }
      sdk.refreshConfig();
      return { success: true, keys: sdk.listKeys() };
    } catch (e) {
      reply.status(500);
      return { success: false, error: e.message };
    }
  });

  /**
   * GET /api/runtime-app-config/endpoints/by-name/:name
   * Returns an endpoint matching the given human-friendly name
   */
  server.get("/api/runtime-app-config/endpoints/by-name/:name", async (request, reply) => {
    try {
      const sdk = server.endpointConfigSdk;
      if (!sdk) {
        reply.status(503);
        return { success: false, error: "EndpointConfigSDK not initialized" };
      }
      const { name } = request.params;
      const endpoint = sdk.getByName(decodeURIComponent(name));
      if (!endpoint) {
        reply.status(404);
        return { success: false, error: `No endpoint with name '${name}'` };
      }
      return { success: true, endpoint };
    } catch (e) {
      reply.status(500);
      return { success: false, error: e.message };
    }
  });

  /**
   * GET /api/runtime-app-config/endpoints/by-tag/:tag
   * Returns all endpoints matching the given tag
   */
  server.get("/api/runtime-app-config/endpoints/by-tag/:tag", async (request, reply) => {
    try {
      const sdk = server.endpointConfigSdk;
      if (!sdk) {
        reply.status(503);
        return { success: false, error: "EndpointConfigSDK not initialized" };
      }
      const { tag } = request.params;
      const endpoints = sdk.getByTag(tag);
      return { success: true, tag, endpoints };
    } catch (e) {
      reply.status(500);
      return { success: false, error: e.message };
    }
  });

  /**
   * GET /api/runtime-app-config/endpoints/:name
   * Returns a specific endpoint by name
   */
  server.get("/api/runtime-app-config/endpoints/:name", async (request, reply) => {
    try {
      const instance = AppYamlConfig.getInstance();
      const endpoints = instance.get("endpoints") || {};
      const { name } = request.params;

      if (!endpoints[name]) {
        reply.status(404);
        return {
          success: false,
          error: `Endpoint '${name}' not found`,
        };
      }

      return {
        success: true,
        name,
        endpoint: endpoints[name],
      };
    } catch (e) {
      reply.status(500);
      return {
        success: false,
        error: e.message,
      };
    }
  });

  /**
   * GET /api/runtime-app-config/intent-mapping
   * Returns the intent to endpoint mapping configuration
   */
  server.get("/api/runtime-app-config/intent-mapping", async (request, reply) => {
    try {
      const instance = AppYamlConfig.getInstance();
      const intentMapping = instance.get("intent_mapping") || {};
      return {
        success: true,
        intent_mapping: intentMapping,
      };
    } catch (e) {
      reply.status(500);
      return {
        success: false,
        error: e.message,
      };
    }
  });

  /**
   * GET /api/runtime-app-config/resolve-intent/:intent
   * Resolves an intent to its configured endpoint
   */
  server.get("/api/runtime-app-config/resolve-intent/:intent", async (request, reply) => {
    try {
      const instance = AppYamlConfig.getInstance();
      const endpoints = instance.get("endpoints") || {};
      const intentMapping = instance.get("intent_mapping") || {};
      const { intent } = request.params;

      const mappings = intentMapping.mappings || {};
      const defaultIntent = intentMapping.default_intent || null;

      // Resolve intent to endpoint name
      const endpointName = mappings[intent] || defaultIntent;

      if (!endpointName) {
        reply.status(404);
        return {
          success: false,
          error: `No mapping found for intent '${intent}' and no default configured`,
        };
      }

      const endpoint = endpoints[endpointName];
      if (!endpoint) {
        reply.status(404);
        return {
          success: false,
          error: `Endpoint '${endpointName}' mapped from intent '${intent}' not found`,
        };
      }

      return {
        success: true,
        intent,
        resolved_endpoint: endpointName,
        endpoint,
      };
    } catch (e) {
      reply.status(500);
      return {
        success: false,
        error: e.message,
      };
    }
  });
}
