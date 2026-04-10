import { AppYamlConfig } from "@internal/app-yaml-static-config";

/**
 * Mount security origins route to the Fastify application.
 * Exposes CORS origins loaded from security.yml
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  /**
   * GET /api/runtime-app-config/origins
   * Returns all configured CORS origins
   */
  server.get("/api/runtime-app-config/origins", async (request, reply) => {
    try {
      const instance = AppYamlConfig.getInstance();
      const origins = instance.getNested(["cors", "origins"]) || [];
      return {
        success: true,
        origins,
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
