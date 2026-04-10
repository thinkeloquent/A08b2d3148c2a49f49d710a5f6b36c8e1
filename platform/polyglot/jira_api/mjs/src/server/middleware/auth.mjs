/**
 * @module server/middleware/auth
 * @description API key authentication middleware for Fastify.
 */

import { createLogger } from '../../logger.mjs';

const log = createLogger('jira-api', import.meta.url);

/**
 * Create an API key verification hook for Fastify.
 * @param {string|undefined} apiKey
 * @returns {import('fastify').preHandlerHookHandler}
 */
export function createAuthHook(apiKey) {
  return async (request, reply) => {
    if (!apiKey) return; // No key configured, allow all

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      reply.code(401).send({ error: 'Authentication required' });
      return;
    }

    // Support Basic auth (key as username, empty password)
    if (authHeader.startsWith('Basic ')) {
      const decoded = Buffer.from(authHeader.slice(6), 'base64').toString();
      const [username] = decoded.split(':');
      if (username === apiKey) return;
    }

    // Support Bearer token
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      if (token === apiKey) return;
    }

    log.warn('auth failed', { ip: request.ip });
    reply.code(401).send({ error: 'Invalid API key' });
  };
}
