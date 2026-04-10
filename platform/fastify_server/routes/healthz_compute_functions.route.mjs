/**
 * Mount compute functions health check routes to the Fastify application.
 * This function is called by the server bootstrap process.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
    server.get("/healthz/admin/compute-functions/list", async (request, reply) => {
        try {
            const registry = server.contextRegistry;
            if (!registry) {
                return {
                    initialized: false,
                    error: "Context registry not initialized",
                };
            }

            const functions = registry.list();
            return {
                initialized: true,
                count: functions.length,
                functions,
            };
        } catch (e) {
            return {
                initialized: false,
                error: e.message,
            };
        }
    });

    server.get("/healthz/admin/compute-functions/details", async (request, reply) => {
        try {
            const registry = server.contextRegistry;
            if (!registry) {
                return {
                    initialized: false,
                    error: "Context registry not initialized",
                };
            }

            const functions = registry.list();
            const details = functions.map(name => {
                const funcInfo = { name };
                if (typeof registry.getScope === 'function') {
                    try {
                        const scope = registry.getScope(name);
                        funcInfo.scope = scope ? String(scope) : "unknown";
                    } catch {
                        funcInfo.scope = "unknown";
                    }
                }
                return funcInfo;
            });

            return {
                initialized: true,
                count: details.length,
                functions: details,
            };
        } catch (e) {
            return {
                initialized: false,
                error: e.message,
            };
        }
    });
}
