/**
 * Server entry point.
 * Creates and starts the Fastify server with GitHub API routes.
 * Uses close-with-grace for graceful shutdown handling.
 * @module main
 */

import closeWithGrace from 'close-with-grace';
import { loadConfig } from './config.mjs';
import { createServer, startServer } from './server.mjs';

async function main() {
  const config = loadConfig();

  const { server } = await createServer({
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    logLevel: config.logLevel,
  });

  // Graceful shutdown
  closeWithGrace({ delay: 5000 }, async ({ signal, err }) => {
    if (err) {
      server.log.error({ err }, 'Server closing due to error');
    } else {
      server.log.info(`Server closing due to ${signal}`);
    }
    await server.close();
  });

  await startServer(server, {
    port: config.port,
    host: config.host,
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
