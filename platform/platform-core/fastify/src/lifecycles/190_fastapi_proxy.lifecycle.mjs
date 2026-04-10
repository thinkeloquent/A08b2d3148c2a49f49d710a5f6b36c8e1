/**
 * FastAPI Reverse Proxy Lifecycle Module
 *
 * Proxies /api/py/* requests to the FastAPI upstream server.
 * Strips the /api/py prefix so FastAPI receives the original path.
 *
 * Example: GET /api/py/apps/chromadb_rag_ingest/frameworks
 *       -> GET http://localhost:52000/apps/chromadb_rag_ingest/frameworks
 */

import httpProxy from "@fastify/http-proxy";

/**
 * Register the FastAPI reverse proxy on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:fastapi-proxy] Initializing FastAPI reverse proxy...');

  try {
    const upstream = process.env.FASTAPI_UPSTREAM || "http://localhost:52000";
    server.log.info({ upstream, FASTAPI_UPSTREAM: process.env.FASTAPI_UPSTREAM || null }, `[lifecycle:fastapi-proxy] Proxying /api/py/* -> ${upstream}`);

    await server.register(httpProxy, {
      upstream,
      prefix: "/api/py",
      rewritePrefix: "",
    });

    server.log.info({ upstream, prefix: '/api/py' }, '[lifecycle:fastapi-proxy] FastAPI reverse proxy registered successfully');
  } catch (err) {
    server.log.error({ err, hookName: '190-fastapi_proxy' }, '[lifecycle:fastapi-proxy] FastAPI reverse proxy initialization failed');
    throw err;
  }
}
