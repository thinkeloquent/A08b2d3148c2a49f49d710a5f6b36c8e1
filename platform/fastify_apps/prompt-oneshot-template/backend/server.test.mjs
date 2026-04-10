/**
 * Standalone server for development/testing
 * In production, this plugin is loaded by the main fastify server
 *
 * Usage:
 *   node server.test.mjs
 *   node server.test.mjs --port=3000
 */

import 'dotenv/config';
import { parseArgs } from 'node:util';
import Fastify from 'fastify';
import appPlugin from './src/index.mjs';

// Parse command-line arguments
const { values: args } = parseArgs({
  options: {
    port: {
      type: 'string',
      short: 'p',
    },
    host: {
      type: 'string',
      short: 'h',
    },
    'log-level': {
      type: 'string',
      short: 'l',
    },
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
          headers: {
            host: request.headers.host,
            'content-type': request.headers['content-type'],
          },
        };
      },
      res(reply) {
        return { statusCode: reply.statusCode };
      },
    },
  },
});

// Request/response logging
fastify.addHook('onRequest', async (request, _reply) => {
  request.log.info({
    msg: '→ Incoming request',
    method: request.method,
    url: request.url,
    ip: request.ip,
  });
});

fastify.addHook('onResponse', async (request, reply) => {
  const responseTime = reply.elapsedTime || 0;
  request.log.info({
    msg: '← Response sent',
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    responseTime: `${responseTime.toFixed(2)}ms`,
  });
});

fastify.addHook('onError', async (request, _reply, error) => {
  request.log.error({
    msg: '✗ Request error',
    method: request.method,
    url: request.url,
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
  });
});

// Register the app plugin
await fastify.register(appPlugin);
fastify.log.info('✓ Prompt Oneshot Template plugin registered');

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start the server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    fastify.log.info('🚀 Starting Prompt Oneshot Template Server...');
    fastify.log.info({ port, host, logLevel: process.env.LOG_LEVEL || 'info' }, 'Server configuration');

    await fastify.listen({ port, host });

    fastify.log.info('✓ Server started successfully');
    fastify.log.info(`✓ Health check: http://localhost:${port}/health`);
    fastify.log.info(`✓ API endpoint: http://localhost:${port}/api/prompt-oneshot-template`);
    fastify.log.info('✓ Server ready to accept connections');
  } catch (err) {
    fastify.log.error({
      msg: '✗ Failed to start server',
      error: { message: err.message, stack: err.stack, code: err.code },
    });
    process.exit(1);
  }
};

start();
