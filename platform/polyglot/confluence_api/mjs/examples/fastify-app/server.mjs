/**
 * Fastify Integration Example — Confluence API
 *
 * Demonstrates how to integrate the confluence_api package into a Fastify server
 * with decorators, hooks, route registration, and error handling.
 *
 * Usage:
 *   node examples/fastify-app/server.mjs
 *
 * Environment Variables:
 *   CONFLUENCE_BASE_URL   — e.g. https://confluence.example.com
 *   CONFLUENCE_USERNAME   — Confluence username
 *   CONFLUENCE_API_TOKEN  — Confluence API token / password
 *   SERVER_API_KEY        — Optional API key for this server
 *   PORT                  — Server port (default: 9000)
 *   LOG_LEVEL             — Optional (default: info)
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';

import {
  ConfluenceFetchClient,
  getConfig,
  ContentService,
  AttachmentService,
  SearchService,
  SpaceService,
  UserService,
  LabelService,
  SystemService,
  ConfluenceApiError,
  ConfluenceConfigurationError,
  createErrorHandler,
  createLogger,
} from '../../src/index.mjs';

const log = createLogger('confluence-api-example', import.meta.url);
const PORT = parseInt(process.env.PORT || '9000', 10);

// ─── Mock Configuration ─────────────────────────────────────────────────────

const MOCK_CONFIG = {
  title: 'Confluence API Example Server',
  version: '0.1.0',
  logLevel: process.env.LOG_LEVEL || 'info',
};


// ─── Server Factory ─────────────────────────────────────────────────────────

async function buildServer() {
  const server = Fastify({ logger: false });

  // Register CORS
  await server.register(cors, { origin: true });

  // Decorate server with app config
  server.decorate('appConfig', MOCK_CONFIG);

  // Request state — each request gets a unique ID and a counter
  let requestCount = 0;
  server.decorateRequest('requestId', '');
  server.decorateRequest('requestState', null);

  server.addHook('onRequest', async (request) => {
    requestCount += 1;
    request.requestId = crypto.randomUUID();
    request.requestState = { requestCount, requestId: request.requestId };
  });

  server.addHook('onResponse', async (request, reply) => {
    log.debug('request completed', {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      requestId: request.requestId,
    });
  });

  // Error handler — maps ConfluenceApiError to HTTP responses
  server.setErrorHandler(createErrorHandler());

  // Auth hook — optional API key authentication
  const apiKey = process.env.SERVER_API_KEY;
  if (apiKey) {
    server.addHook('preHandler', async (request, reply) => {
      // Skip auth for health endpoint
      if (request.url === '/health') return;

      const authHeader = request.headers.authorization;
      if (!authHeader) {
        reply.code(401).send({ error: 'Authentication required' });
        return;
      }

      // Support Basic auth: username is the API key
      try {
        const encoded = authHeader.replace('Basic ', '');
        const decoded = Buffer.from(encoded, 'base64').toString();
        const [username] = decoded.split(':');
        if (username !== apiKey) {
          reply.code(401).send({ error: 'Invalid API key' });
          return;
        }
      } catch {
        reply.code(401).send({ error: 'Invalid authorization header' });
      }
    });
  }

  // ── Confluence Client Factory ──────────────────────────────────────────

  const confluenceConfig = getConfig();
  if (confluenceConfig?.baseUrl && confluenceConfig?.username && confluenceConfig?.apiToken) {
    log.info('Confluence configured', { baseUrl: confluenceConfig.baseUrl });
  } else {
    log.warn('No Confluence configuration found — set CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN');
  }

  function getClient() {
    const cfg = confluenceConfig?.baseUrl ? confluenceConfig : getConfig();
    if (!cfg?.baseUrl || !cfg?.username || !cfg?.apiToken) {
      throw new ConfluenceConfigurationError(
        'Confluence not configured. Set CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN.',
      );
    }
    return new ConfluenceFetchClient({
      baseUrl: cfg.baseUrl,
      username: cfg.username,
      apiToken: cfg.apiToken,
    });
  }

  // ── Health ──────────────────────────────────────────────────────────

  server.get('/health', async () => ({
    status: 'healthy',
    service: MOCK_CONFIG.title,
    version: MOCK_CONFIG.version,
    confluenceConfigured: !!(confluenceConfig?.baseUrl),
  }));

  // ── Config / Debug ──────────────────────────────────────────────────

  server.get('/config', async () => MOCK_CONFIG);

  server.get('/state', async (request) => ({
    requestId: request.requestId,
    requestState: request.requestState,
  }));

  // ── Content ────────────────────────────────────────────────────────

  await server.register(async (scope) => {
    scope.get('/', {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            spaceKey: { type: 'string' },
            limit: { type: 'integer', default: 25 },
            start: { type: 'integer', default: 0 },
            expand: { type: 'string' },
          },
        },
      },
    }, async (request) => {
      const c = getClient();
      const { type, spaceKey, limit = 25, start = 0, expand } = request.query;
      return new ContentService(c).getContents({ type, spaceKey, expand, start, limit });
    });

    scope.get('/:contentId', async (request) => {
      const c = getClient();
      const { expand } = request.query;
      return new ContentService(c).getContent(request.params.contentId, { expand });
    });

    scope.post('/', async (request) => {
      const c = getClient();
      return new ContentService(c).createContent(request.body);
    });

    scope.put('/:contentId', async (request) => {
      const c = getClient();
      return new ContentService(c).updateContent(request.params.contentId, request.body);
    });

    scope.delete('/:contentId', async (request) => {
      const c = getClient();
      await new ContentService(c).deleteContent(request.params.contentId);
      return { message: `Content ${request.params.contentId} deleted` };
    });

    // ── Content Labels ──────────────────────────────────────────────

    scope.get('/:contentId/labels', async (request) => {
      const c = getClient();
      return new ContentService(c).getLabels(request.params.contentId);
    });

    scope.post('/:contentId/labels', async (request) => {
      const c = getClient();
      return new ContentService(c).addLabels(request.params.contentId, request.body);
    });

    // ── Content Attachments ──────────────────────────────────────────

    scope.get('/:contentId/attachments', {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', default: 25 },
            start: { type: 'integer', default: 0 },
            expand: { type: 'string' },
          },
        },
      },
    }, async (request) => {
      const c = getClient();
      const { limit = 25, start = 0, expand } = request.query;
      return new AttachmentService(c).getAttachments(request.params.contentId, { expand, start, limit });
    });

    scope.delete('/:contentId/attachments/:attachmentId', async (request) => {
      const c = getClient();
      await new AttachmentService(c).deleteAttachment(request.params.contentId, request.params.attachmentId);
      return { message: `Attachment ${request.params.attachmentId} deleted` };
    });
  }, { prefix: '/content' });

  // ── Spaces ─────────────────────────────────────────────────────────

  await server.register(async (scope) => {
    scope.get('/', {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', default: 25 },
            start: { type: 'integer', default: 0 },
            expand: { type: 'string' },
          },
        },
      },
    }, async (request) => {
      const c = getClient();
      const { limit = 25, start = 0, expand } = request.query;
      return new SpaceService(c).getSpaces({ expand, start, limit });
    });

    scope.get('/:spaceKey', async (request) => {
      const c = getClient();
      const { expand } = request.query;
      return new SpaceService(c).getSpace(request.params.spaceKey, { expand });
    });
  }, { prefix: '/spaces' });

  // ── Search ─────────────────────────────────────────────────────────

  await server.register(async (scope) => {
    scope.get('/', {
      schema: {
        querystring: {
          type: 'object',
          required: ['cql'],
          properties: {
            cql: { type: 'string' },
            limit: { type: 'integer', default: 25 },
            start: { type: 'integer', default: 0 },
            expand: { type: 'string' },
          },
        },
      },
    }, async (request) => {
      const c = getClient();
      const { cql, limit = 25, start = 0, expand } = request.query;
      return new SearchService(c).searchContent(cql, { expand, start, limit });
    });
  }, { prefix: '/search' });

  // ── Users ──────────────────────────────────────────────────────────

  await server.register(async (scope) => {
    scope.get('/current', async () => {
      const c = getClient();
      return new UserService(c).getCurrentUser();
    });

    scope.get('/:username', async (request) => {
      const c = getClient();
      return new UserService(c).getUser(request.params.username);
    });
  }, { prefix: '/user' });

  // ── Labels ─────────────────────────────────────────────────────────

  await server.register(async (scope) => {
    scope.get('/recent', async () => {
      const c = getClient();
      return new LabelService(c).getRecentLabels();
    });

    scope.get('/:labelName/related', async (request) => {
      const c = getClient();
      return new LabelService(c).getRelatedLabels(request.params.labelName);
    });
  }, { prefix: '/labels' });

  // ── System ─────────────────────────────────────────────────────────

  await server.register(async (scope) => {
    scope.get('/info', async () => {
      const c = getClient();
      return new SystemService(c).getServerInfo();
    });

    scope.get('/metrics', async () => {
      const c = getClient();
      return new SystemService(c).getInstanceMetrics();
    });
  }, { prefix: '/system' });

  return server;
}


// ─── Start ────────────────────────────────────────────────────────────────────

async function start() {
  const server = await buildServer();

  try {
    await server.listen({ host: '0.0.0.0', port: PORT });
    log.info('server started', { host: '0.0.0.0', port: PORT });
    console.log(`\n  Confluence API Example Server running at http://localhost:${PORT}`);
    console.log('  Endpoints:');
    console.log('    GET  /health');
    console.log('    GET  /config');
    console.log('    GET  /state');
    console.log('    GET  /content?type=page&spaceKey=DEV');
    console.log('    GET  /content/:contentId');
    console.log('    POST /content');
    console.log('    PUT  /content/:contentId');
    console.log('    DELETE /content/:contentId');
    console.log('    GET  /content/:contentId/labels');
    console.log('    POST /content/:contentId/labels');
    console.log('    GET  /content/:contentId/attachments');
    console.log('    DELETE /content/:contentId/attachments/:attachmentId');
    console.log('    GET  /spaces');
    console.log('    GET  /spaces/:spaceKey');
    console.log('    GET  /search?cql=type="page"');
    console.log('    GET  /user/current');
    console.log('    GET  /user/:username');
    console.log('    GET  /labels/recent');
    console.log('    GET  /labels/:labelName/related');
    console.log('    GET  /system/info');
    console.log('    GET  /system/metrics\n');
  } catch (err) {
    log.error('server start failed', { error: err.message });
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async () => {
    log.info('shutting down');
    await server.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
