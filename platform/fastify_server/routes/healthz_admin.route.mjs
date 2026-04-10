/**
 * Admin route to display environment variables.
 * WARNING: This endpoint exposes sensitive information. Secure in production.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  server.get("/healthz/admin", async (request, reply) => {
    return {
      env: process.env,
    };
  });
}
