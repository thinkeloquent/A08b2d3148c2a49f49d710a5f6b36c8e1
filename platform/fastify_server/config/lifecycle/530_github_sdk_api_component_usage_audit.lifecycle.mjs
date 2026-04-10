/**
 * GitHub SDK API Component Usage Audit — Fastify Lifecycle Hook
 *
 * Registers a stub route for the component usage audit.
 * The actual audit logic runs through the Python/FastAPI server;
 * this hook is a placeholder for future Fastify-native implementation.
 *
 * Loading Order: 530 (after 500.github_sdk which provides the GitHub client)
 *
 * Registered endpoints:
 *   POST /~/api/rest/{api_release_date}/providers/github_sdk_api_component_usage_audit/v1/audit
 */

/**
 * Startup hook — Register component usage audit routes.
 *
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config - Bootstrap config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:github_sdk_api_component_usage_audit] Initializing component usage audit routes...');

  try {
    // Verify that the GitHub SDK client was initialized
    if (!server.hasDecorator('github')) {
      server.log.warn(
        '[lifecycle:github_sdk_api_component_usage_audit] ' +
        'GitHub client not found — skipping route registration. ' +
        'Ensure 500.github_sdk lifecycle runs first.',
      );
      return;
    }

    server.log.info('[lifecycle:github_sdk_api_component_usage_audit] GitHub client found, proceeding with route registration');

    const apiReleaseDate = server.config?.getNested?.(
      ['api_release_date', 'contract_snapshot_date', 'provider_github'],
    ) ?? '02-01-2026';
    const PREFIX = `/~/api/rest/${apiReleaseDate}/providers/github_sdk_api_component_usage_audit/v1`;
    server.log.info({ PREFIX, apiReleaseDate }, '[lifecycle:github_sdk_api_component_usage_audit] Resolved route prefix');

    await server.register(
      async function componentUsageAuditRoutes(scope) {
        scope.post('/audit', async (request, reply) => {
          // Proxy to the FastAPI server for now
          const { componentName, minStars, maxPages, minFileSize } = request.body || {};

          if (!componentName) {
            return reply.code(400).send({ error: 'componentName is required' });
          }

          return reply.code(501).send({
            message: 'Component usage audit is served by the FastAPI server. ' +
              'POST to the FastAPI endpoint instead.',
            fastapi_endpoint: `${PREFIX}/audit`,
          });
        });

        return Promise.resolve();
      },
      { prefix: PREFIX },
    );

    server.log.info(
      { PREFIX },
      `[lifecycle:github_sdk_api_component_usage_audit] Routes registered at ${PREFIX}/*`,
    );
  } catch (err) {
    server.log.error({ err, hookName: '530_github_sdk_api_component_usage_audit' }, '[lifecycle:github_sdk_api_component_usage_audit] Component usage audit route registration failed');
    throw err;
  }
}

/**
 * Shutdown hook.
 *
 * @param {import('fastify').FastifyInstance} server
 */
export async function onShutdown(server) {
  server.log.info('[lifecycle:github_sdk_api_component_usage_audit] Shutdown complete');
}
