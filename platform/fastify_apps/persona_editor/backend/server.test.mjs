/**
 * Standalone development server for Persona Editor
 * Run with: node server.test.mjs
 */

import 'dotenv/config';
import Fastify from 'fastify';
import personaEditorPlugin from './src/index.mjs';

const PORT = process.env.PERSONA_EDITOR_PORT || 3030;
const HOST = process.env.PERSONA_EDITOR_HOST || '127.0.0.1';

async function start() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  try {
    // Register the persona editor plugin
    await fastify.register(personaEditorPlugin, {
      apiPrefix: '/~/api/persona_editor',
    });

    // Start the server
    await fastify.listen({ port: PORT, host: HOST });

    console.log(`\n🚀 Persona Editor API running at http://${HOST}:${PORT}`);
    console.log(`   API endpoints: http://${HOST}:${PORT}/~/api/persona_editor`);
    console.log(`   Health check:  http://${HOST}:${PORT}/~/api/persona_editor/health\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
