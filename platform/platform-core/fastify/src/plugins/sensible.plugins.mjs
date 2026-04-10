/**
 * Sensible Plugin
 *
 * Registers @fastify/sensible with correct fp() wrapping pattern:
 * arrow function wrapper → fp() — never wrap the function directly.
 */

import fp from 'fastify-plugin';
import sensible from '@fastify/sensible';

async function sensiblePlugin(fastify, opts) {
  await fastify.register(sensible, opts);
}

export default fp((f, o) => sensiblePlugin(f, o), {
  name: 'platform-sensible',
  fastify: '>=5.0.0',
});
