/**
 * Standalone development server for Chroma Explorer
 * In production, this plugin is loaded by the main fastify server.
 *
 * Usage:
 *   node server.test.mjs
 *   node server.test.mjs --port=3001
 */

import 'dotenv/config';
import { parseArgs } from 'node:util';
import Fastify from 'fastify';
import appPlugin from './src/index.mjs';

// Parse command-line arguments
const { values: args } = parseArgs({
  options: {
    port: { type: 'string', short: 'p' },
    host: { type: 'string', short: 'h' },
    'log-level': { type: 'string', short: 'l' },
  },
  strict: false,
});

if (args.port) process.env.PORT = args.port;
if (args.host) process.env.HOST = args.host;
if (args['log-level']) process.env.LOG_LEVEL = args['log-level'];

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        colorize: true,
        singleLine: false,
      },
    },
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          path: request.routeOptions?.url,
          parameters: request.params,
        };
      },
      res(reply) {
        return { statusCode: reply.statusCode };
      },
    },
  },
});

fastify.addHook('onRequest', async (request, _reply) => {
  request.log.info({ msg: '→ Incoming request', method: request.method, url: request.url });
});

fastify.addHook('onResponse', async (request, reply) => {
  request.log.info({
    msg: '← Response sent',
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    responseTime: `${(reply.elapsedTime || 0).toFixed(2)}ms`,
  });
});

// Register the app plugin
await fastify.register(appPlugin);

// Health check
fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    fastify.log.info('Starting Chroma Explorer Server...');
    await fastify.listen({ port, host });

    fastify.log.info(`✓ Server started on http://localhost:${port}`);
    fastify.log.info(`✓ Health check: http://localhost:${port}/health`);
    fastify.log.info(`✓ API: http://localhost:${port}/api/chroma-explorer`);
    fastify.log.info(`✓ Databases: http://localhost:${port}/api/chroma-explorer/databases`);
  } catch (err) {
    fastify.log.error({ msg: 'Failed to start server', error: err.message });
    process.exit(1);
  }
};

start();
