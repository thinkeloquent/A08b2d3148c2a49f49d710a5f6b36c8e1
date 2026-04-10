/**
 * Health Check Routes
 */

export default async function healthRoutes(fastify, _options) {
  fastify.get("/health", async () => ({
    status: "ok",
    service: "figma-component-inspector",
    timestamp: new Date().toISOString(),
  }));
}
