/**
 * Confluence Data Center REST API v9.2.3 Lifecycle Hook for Fastify
 *
 * Initializes the Confluence API client and registers all Confluence API
 * proxy routes under the /~/api/rest/{api_release_date}/providers/confluence_api prefix.
 *
 * Loading Order: 525 (after core services, GitHub SDK, Figma SDK, and Jira SDK)
 *
 * Environment Variables:
 *   CONFLUENCE_BASE_URL  - Confluence Data Center base URL
 *   CONFLUENCE_USERNAME  - Confluence username for Basic Auth
 *   CONFLUENCE_API_TOKEN - Confluence API token / password
 *
 * Usage in routes:
 *   const confluenceClient = req.server.confluenceApi;             // ConfluenceFetchClient
 *   const services         = req.server.confluenceApiServices;     // Service modules dict
 *
 * Registered endpoints (prefix: /~/api/rest/{api_release_date}/providers/confluence_api):
 *   GET    /health                                             - Health check
 *   GET    /v9/content                                         - List content
 *   POST   /v9/content                                         - Create content
 *   GET    /v9/content/:contentId                              - Get content
 *   PUT    /v9/content/:contentId                              - Update content
 *   DELETE /v9/content/:contentId                              - Delete content
 *   GET    /v9/search                                          - Search (CQL)
 *   GET    /v9/space                                           - List spaces
 *   POST   /v9/space                                           - Create space
 *   GET    /v9/space/:spaceKey                                 - Get space
 *   PUT    /v9/space/:spaceKey                                 - Update space
 *   DELETE /v9/space/:spaceKey                                 - Delete space
 *   GET    /v9/user                                            - Search users
 *   GET    /v9/user/current                                    - Get current user
 *   GET    /v9/user/anonymous                                  - Get anonymous user
 *   GET    /v9/group                                           - List groups
 *   GET    /v9/group/:groupName/member                         - Get group members
 *   GET    /v9/server-information                              - Get server info
 */

import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

import {
  ConfluenceFetchClient,
  ConfluenceApiError,
  createErrorHandler,
} from '../../../polyglot/confluence_api/mjs/src/index.mjs';
import { resolveConfluenceEnv } from '@internal/env-resolver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..');

const VENDOR = 'confluence_api';
const VENDOR_VERSION = 'v9.2.3';

/**
 * Resolve Confluence credentials from server config or environment variables.
 * @param {import('fastify').FastifyInstance} server
 * @returns {{ baseUrl: string, username: string, apiToken: string }}
 */
function resolveConfluenceCredentials(server) {
  let configBaseUrl, configUsername, configApiToken;

  if (server.config && typeof server.config.getNested === 'function') {
    try { configBaseUrl = server.config.getNested(['providers', 'confluence', 'base_url']); } catch { /* */ }
    try { configUsername = server.config.getNested(['providers', 'confluence', 'username']) || server.config.getNested(['providers', 'confluence', 'email']); } catch { /* */ }
    try { configApiToken = server.config.getNested(['providers', 'confluence', 'endpoint_api_key']); } catch { /* */ }
  }

  const _confluenceEnv = resolveConfluenceEnv();
  const baseUrl = configBaseUrl || _confluenceEnv.baseUrl;
  const username = configUsername || _confluenceEnv.username;
  const apiToken = configApiToken || _confluenceEnv.apiToken;

  if (!baseUrl || !username || !apiToken) {
    throw new Error(
      'Confluence credentials not found. ' +
      'Set providers.confluence.base_url, providers.confluence.username, providers.confluence.endpoint_api_key in config ' +
      'or CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN env vars.',
    );
  }
  return { baseUrl, username, apiToken };
}

/**
 * Startup hook -- Initialize Confluence API client and register routes.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:confluence_api] Initializing Confluence API SDK...');

  try {
  const apiReleaseDate = server.config?.getNested?.(
    ['api_release_date', 'contract_snapshot_date', 'provider_confluence_api'],
  ) ?? '02-01-2026';
  const PREFIX = `/~/api/rest/${apiReleaseDate}/providers/${VENDOR}`;
  server.log.info({ PREFIX, apiReleaseDate, VENDOR }, '[lifecycle:confluence_api] Resolved API route prefix');

  let configured = false;
  let client, services;
  try {
    server.log.info('[lifecycle:confluence_api] Resolving Confluence credentials from config or environment');
    const { baseUrl, username, apiToken } = resolveConfluenceCredentials(server);
    configured = true;

    const maskedToken = apiToken.length > 8
      ? apiToken.slice(0, 4) + '****' + apiToken.slice(-4)
      : '****';
    server.log.info({ username, maskedToken, baseUrl }, `[lifecycle:confluence_api] Credentials resolved (username: ${username}, token: ${maskedToken})`);

    client = new ConfluenceFetchClient({ baseUrl, username, apiToken });

    services = {
      content: { client },
      search: { client },
      space: { client },
      user: { client },
      group: { client },
      system: { client },
    };

    if (!server.hasDecorator('confluenceApi')) server.decorate('confluenceApi', client);
    if (!server.hasDecorator('confluenceApiServices')) server.decorate('confluenceApiServices', services);
    server.log.info('[lifecycle:confluence_api] Confluence client and services initialized');
  } catch (err) {
    server.log.warn({ err }, '[lifecycle:confluence_api] Confluence credentials not found -- v9 routes will NOT be registered.');
  }

  const confluenceErrorHandler = createErrorHandler();

  await server.register(
    async function confluenceApiRoutes(scope) {
      scope.setErrorHandler(confluenceErrorHandler);

      // Health -- always registered
      scope.get('/health', async () => ({
        status: 'ok',
        vendor: VENDOR,
        vendor_version: VENDOR_VERSION,
        configured,
      }));

      if (!configured) return;

      // v9 routes -- only when credentials are available
      await scope.register(async (v9) => {
        // Content
        v9.get('/content', async (req) => {
          const { type, spaceKey, title, status, expand, start, limit } = req.query;
          const params = {};
          if (type) params.type = type;
          if (spaceKey) params.spaceKey = spaceKey;
          if (title) params.title = title;
          if (status) params.status = status;
          if (expand) params.expand = expand;
          params.start = Number(start) || 0;
          params.limit = Number(limit) || 25;
          return client.get('/rest/api/content', { queryParams: params });
        });

        v9.post('/content', async (req) => {
          return client.post('/rest/api/content', req.body);
        });

        v9.get('/content/:contentId', async (req) => {
          const params = {};
          if (req.query.expand) params.expand = req.query.expand;
          return client.get(`/rest/api/content/${req.params.contentId}`, {
            queryParams: Object.keys(params).length > 0 ? params : undefined,
          });
        });

        v9.put('/content/:contentId', async (req) => {
          return client.put(`/rest/api/content/${req.params.contentId}`, req.body);
        });

        v9.delete('/content/:contentId', async (req) => {
          const params = {};
          if (req.query.status) params.status = req.query.status;
          return client.delete(`/rest/api/content/${req.params.contentId}`, {
            queryParams: Object.keys(params).length > 0 ? params : undefined,
          });
        });

        // Search
        v9.get('/search', async (req) => {
          const { cql, cqlcontext, excerpt, expand, start, limit } = req.query;
          const params = { cql };
          if (cqlcontext) params.cqlcontext = cqlcontext;
          if (excerpt) params.excerpt = excerpt;
          if (expand) params.expand = expand;
          params.start = Number(start) || 0;
          params.limit = Number(limit) || 25;
          return client.get('/rest/api/search', { queryParams: params });
        });

        // Space
        v9.get('/space', async (req) => {
          const { spaceKey, type, status, expand, start, limit } = req.query;
          const params = {};
          if (spaceKey) params.spaceKey = spaceKey;
          if (type) params.type = type;
          if (status) params.status = status;
          if (expand) params.expand = expand;
          params.start = Number(start) || 0;
          params.limit = Number(limit) || 25;
          return client.get('/rest/api/space', { queryParams: params });
        });

        v9.post('/space', async (req) => {
          return client.post('/rest/api/space', req.body);
        });

        v9.get('/space/:spaceKey', async (req) => {
          const params = {};
          if (req.query.expand) params.expand = req.query.expand;
          return client.get(`/rest/api/space/${req.params.spaceKey}`, {
            queryParams: Object.keys(params).length > 0 ? params : undefined,
          });
        });

        v9.put('/space/:spaceKey', async (req) => {
          return client.put(`/rest/api/space/${req.params.spaceKey}`, req.body);
        });

        v9.delete('/space/:spaceKey', async (req) => {
          return client.delete(`/rest/api/space/${req.params.spaceKey}`);
        });

        // User
        v9.get('/user', async (req) => {
          const params = {};
          if (req.query.username) params.username = req.query.username;
          if (req.query.key) params.key = req.query.key;
          if (req.query.expand) params.expand = req.query.expand;
          return client.get('/rest/api/user', {
            queryParams: Object.keys(params).length > 0 ? params : undefined,
          });
        });

        v9.get('/user/current', async (req) => {
          const params = {};
          if (req.query.expand) params.expand = req.query.expand;
          return client.get('/rest/api/user/current', {
            queryParams: Object.keys(params).length > 0 ? params : undefined,
          });
        });

        v9.get('/user/anonymous', async (req) => {
          const params = {};
          if (req.query.expand) params.expand = req.query.expand;
          return client.get('/rest/api/user/anonymous', {
            queryParams: Object.keys(params).length > 0 ? params : undefined,
          });
        });

        // Group
        v9.get('/group', async (req) => {
          const params = {
            start: Number(req.query.start) || 0,
            limit: Number(req.query.limit) || 25,
          };
          if (req.query.expand) params.expand = req.query.expand;
          return client.get('/rest/api/group', { queryParams: params });
        });

        v9.get('/group/:groupName/member', async (req) => {
          const params = {
            start: Number(req.query.start) || 0,
            limit: Number(req.query.limit) || 25,
          };
          if (req.query.expand) params.expand = req.query.expand;
          return client.get(`/rest/api/group/${req.params.groupName}/member`, { queryParams: params });
        });

        // System
        v9.get('/server-information', async () => {
          return client.get('/rest/api/server-information');
        });

        return Promise.resolve();
      }, { prefix: '/v9' });

      return Promise.resolve();
    },
    { prefix: PREFIX },
  );

  server.addHook('onClose', async () => {
    server.log.info('[confluence_api] Cleaning up Confluence API resources...');
  });

  if (configured) {
    server.log.info({ PREFIX }, `[lifecycle:confluence_api] Confluence API initialized -- routes registered at ${PREFIX}/*`);
  } else {
    server.log.info({ PREFIX }, `[lifecycle:confluence_api] Health endpoint registered at ${PREFIX}/health (v9 routes skipped -- no credentials)`);
  }

  } catch (err) {
    server.log.error({ err, hookName: '525.confluence_api' }, '[lifecycle:confluence_api] Confluence API SDK initialization failed');
    throw err;
  }
}

/**
 * Shutdown hook.
 * @param {import('fastify').FastifyInstance} server
 */
export async function onShutdown(server) {
  server.log.info('[lifecycle:confluence_api] Confluence API shutdown complete');
}
