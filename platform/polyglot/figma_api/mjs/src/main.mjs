/**
 * Main Entry Point — Figma API SDK (Node.js)
 *
 * Starts the Fastify server with configuration from environment.
 */

import closeWithGrace from 'close-with-grace';
import { loadConfig } from './config.mjs';
import { createServer, startServer } from './server.mjs';
import { create } from './logger.mjs';

const log = create('figma-api', import.meta.url);

async function main() {
  const config = loadConfig();

  log.info('starting figma-api server', {
    port: config.port,
    host: config.host,
    logLevel: config.logLevel,
  });

  const { server, client } = await createServer({
    token: config.figmaToken,
    baseUrl: config.figmaApiBaseUrl,
    logLevel: config.logLevel,
    rateLimitAutoWait: config.rateLimitAutoWait,
    rateLimitThreshold: config.rateLimitThreshold,
  });

  closeWithGrace({ delay: 5000 }, async ({ signal, err }) => {
    if (err) log.error('server closing due to error', { error: err.message });
    else log.info('server closing', { signal });
    await server.close();
  });

  await startServer(server, { port: config.port, host: config.host });
}

main().catch((err) => {
  log.error('fatal error', { error: err.message, stack: err.stack });
  process.exit(1);
});
