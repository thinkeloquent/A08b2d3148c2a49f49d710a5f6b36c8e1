#!/usr/bin/env node
/**
 * Fastify integration example for computed-url-builder.
 *
 * This example demonstrates:
 * - Using the URL builder as a Fastify plugin
 * - Environment-based configuration
 * - Building URLs in route handlers
 *
 * To run:
 *   export URL_BUILDER_BACKEND=https://httpbin.org
 *   node fastify-integration.mjs
 *
 * Then visit:
 *   http://localhost:3000/proxy/get
 *   http://localhost:3000/config
 */

import Fastify from 'fastify';
import createUrlBuilder from '../src/index.mjs';
import urlBuilderPlugin from '../src/fastify-plugin.mjs';

// Set default environment variables for demo
process.env.URL_BUILDER_BACKEND = process.env.URL_BUILDER_BACKEND || 'https://httpbin.org';
process.env.URL_BUILDER_API = process.env.URL_BUILDER_API || 'https://api.example.com';

// Create Fastify app
const fastify = Fastify({
  logger: true,
});

// Register URL builder plugin (loads from environment)
await fastify.register(urlBuilderPlugin, {
  fromEnv: true,
  envPrefix: 'URL_BUILDER_',
});

// Alternative: Create a builder with static configuration
const staticBuilder = createUrlBuilder(
  {
    dev: 'https://dev.api.example.com',
    prod: 'https://api.example.com',
  },
  '/api/v1'
);

// Root endpoint
fastify.get('/', async (request, reply) => {
  return {
    message: 'Computed URL Builder Fastify Demo',
    endpoints: [
      '/proxy/get - Proxy request using URL builder',
      '/config - Show current URL builder configuration',
      '/static/:env/users - Use static builder configuration',
    ],
  };
});

// Proxy endpoint using URL builder
fastify.get('/proxy/get', async (request, reply) => {
  try {
    const builder = fastify.urlBuilder;
    const url = builder.build('backend') + '/get';

    // Make the request
    const response = await fetch(url);
    const data = await response.json();

    return {
      target_url: url,
      status_code: response.status,
      response: data,
    };
  } catch (error) {
    reply.code(502).send({ error: `Backend error: ${error.message}` });
  }
});

// Configuration endpoint
fastify.get('/config', async (request, reply) => {
  const builder = fastify.urlBuilder;
  return {
    builder_state: builder.toJSON(),
    available_environments: Object.keys(builder.env),
  };
});

// Static builder endpoint
fastify.get('/static/:env/users', async (request, reply) => {
  const { env } = request.params;

  try {
    const url = staticBuilder.build(env) + '/users';
    return {
      url,
      note: 'This uses a static builder, not from environment',
    };
  } catch (error) {
    reply.code(400).send({
      error: `Unknown environment: ${env}. Available: ${Object.keys(staticBuilder.env)}`,
    });
  }
});

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'healthy', service: 'computed-url-builder-demo' };
});

// Start the server
try {
  await fastify.listen({ port: 3000 });
  console.log('Server listening on http://localhost:3000');
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
