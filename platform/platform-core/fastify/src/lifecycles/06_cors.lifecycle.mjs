/**
 * CORS Configuration Lifecycle Module
 *
 * Enables Cross-Origin Resource Sharing for the Fastify server.
 * This allows the frontend app served from a different port to make API requests.
 */

import cors from '@fastify/cors';

/**
 * Configure CORS on startup (before server.listen).
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:cors] Configuring CORS middleware...');

  try {
    // Read CORS settings from config (loaded by 01-app-yaml.lifecycle.mjs)
    server.log.info('[lifecycle:cors] Reading CORS settings from config');
    const origins = server.config?.getNested?.(['cors', 'origins']) || [];
    const originDefault = server.config?.getNested?.(['fastify', 'cors', 'origin']) ?? false;
    const methods = server.config?.getNested?.(['cors', 'methods']) || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const allowedHeaders = server.config?.getNested?.(['cors', 'allowedHeaders']) || ['Content-Type', 'Authorization'];
    const credentials = server.config?.getNested?.(['cors', 'credentials']) ?? true;
    const maxAge = server.config?.getNested?.(['cors', 'maxAge']) ?? 86400;

    server.log.debug({ origins, originDefault, methods, allowedHeaders, credentials, maxAge }, '[lifecycle:cors] CORS config values');

    // Use explicit origins list if available, otherwise fall back to origin default
    const origin = origins.length > 0 ? origins : originDefault;

    if (!origin || (Array.isArray(origin) && origin.length === 0)) {
      throw new Error('[lifecycle:cors] No CORS origins provided in config. Set cors.origins in security.yml');
    }

    server.log.info({ origin }, '[lifecycle:cors] Resolved CORS origins');

    await server.register(cors, {
      origin,
      methods,
      allowedHeaders,
      credentials,
      maxAge,
    });

    server.log.info({ methods, credentials, maxAge }, '[lifecycle:cors] CORS enabled successfully');
  } catch (err) {
    server.log.error({ err, hookName: '06-cors' }, '[lifecycle:cors] CORS configuration failed');
    throw err;
  }
}
