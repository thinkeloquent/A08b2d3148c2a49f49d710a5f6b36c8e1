/**
 * Figma API SDK Lifecycle Hook for Fastify
 *
 * Initializes the Figma API SDK client and registers all Figma API routes
 * under the /~/api/rest/{api_release_date}/providers/figma_api prefix.
 *
 * Loading Order: 510 (after core services and GitHub SDK, before static apps)
 *
 * Environment Variables:
 *   FIGMA_TOKEN / FIGMA_ACCESS_TOKEN - Figma API token
 *
 * Usage in routes:
 *   const figma  = req.server.figma;                        // Base FigmaClient
 *   const files  = req.server.figmaClients.files;           // FilesClient
 *   const projects = req.server.figmaClients.projects;      // ProjectsClient
 *
 * Registered endpoints (prefix: /~/api/rest/{api_release_date}/providers/figma_api):
 *   GET    /health                                           - Health check
 *   GET    /v1/files/:fileKey                                - Get file
 *   GET    /v1/files/:fileKey/nodes                          - Get file nodes
 *   GET    /v1/images/:fileKey                               - Get images
 *   GET    /v1/files/:fileKey/images                         - Get image fills
 *   GET    /v1/files/:fileKey/versions                       - Get file versions
 *   GET    /v1/teams/:teamId/projects                        - List team projects
 *   GET    /v1/projects/:projectId/files                     - List project files
 *   GET    /v1/files/:fileKey/comments                       - List comments
 *   POST   /v1/files/:fileKey/comments                       - Add comment
 *   DELETE /v1/files/:fileKey/comments/:commentId            - Delete comment
 *   GET    /v1/components/:key                               - Get component
 *   GET    /v1/files/:fileKey/components                     - List file components
 *   GET    /v1/teams/:teamId/components                      - List team components
 *   GET    /v1/component_sets/:key                           - Get component set
 *   GET    /v1/teams/:teamId/component_sets                  - List team component sets
 *   GET    /v1/teams/:teamId/styles                          - List team styles
 *   GET    /v1/styles/:key                                   - Get style
 *   GET    /v1/files/:fileKey/variables/local                - Get local variables
 *   GET    /v1/files/:fileKey/variables/published            - Get published variables
 *   POST   /v1/files/:fileKey/variables                      - Create variables
 *   GET    /v1/files/:fileKey/dev_resources                  - List dev resources
 *   POST   /v1/files/:fileKey/dev_resources                  - Create dev resource
 *   PUT    /v1/files/:fileKey/dev_resources                  - Update dev resources
 *   DELETE /v1/files/:fileKey/dev_resources/:devResourceId   - Delete dev resource
 *   GET    /v1/analytics/libraries/:teamId/actions           - Library actions
 *   GET    /v1/analytics/libraries/:teamId/usages            - Library usages
 *   GET    /v2/webhooks/:webhookId                           - Get webhook
 *   GET    /v2/teams/:teamId/webhooks                        - List team webhooks
 *   POST   /v2/webhooks                                      - Create webhook
 *   PUT    /v2/webhooks/:webhookId                           - Update webhook
 *   DELETE /v2/webhooks/:webhookId                           - Delete webhook
 *   GET    /v2/webhooks/:webhookId/requests                  - List webhook requests
 *   GET    /openapi.yaml                                    - OpenAPI spec (YAML)
 *   GET    /openapi.json                                    - OpenAPI spec (JSON)
 *   GET    /docs/endpoints                                  - Endpoint summary table
 *   GET    /docs/curl                                       - Curl cheat-sheet
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

import {
  FigmaClient,
  resolveToken,
  maskToken,
  ProjectsClient,
  FilesClient,
  CommentsClient,
  ComponentsClient,
  VariablesClient,
  DevResourcesClient,
  LibraryAnalyticsClient,
  WebhooksClient,
  createErrorHandler,
} from '../../../polyglot/figma_api/mjs/src/index.mjs';

import healthRoutes from '../../../polyglot/figma_api/mjs/src/routes/health.mjs';
import projectsRoutes from '../../../polyglot/figma_api/mjs/src/routes/projects.mjs';
import filesRoutes from '../../../polyglot/figma_api/mjs/src/routes/files.mjs';
import commentsRoutes from '../../../polyglot/figma_api/mjs/src/routes/comments.mjs';
import componentsRoutes from '../../../polyglot/figma_api/mjs/src/routes/components.mjs';
import variablesRoutes from '../../../polyglot/figma_api/mjs/src/routes/variables.mjs';
import devResourcesRoutes from '../../../polyglot/figma_api/mjs/src/routes/dev-resources.mjs';
import libraryAnalyticsRoutes from '../../../polyglot/figma_api/mjs/src/routes/library-analytics.mjs';
import webhooksRoutes from '../../../polyglot/figma_api/mjs/src/routes/webhooks.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..');

const FIGMA_DOCS_DIR = path.join(
  ROOT, '__SPECS__', 'mta-SPECS', 'v800', 'CODE',
  'figma-api-module-main', 'docs',
);
const OPENAPI_TABLE_PATH = path.join(FIGMA_DOCS_DIR, 'figma.v3.1.0.openapi.table.md');
const OPENAPI_CURL_PATH = path.join(FIGMA_DOCS_DIR, 'figma.v3.1.0.curl.md');

const VENDOR = 'figma_api';

/**
 * Resolve Figma token from server config or environment variables.
 *
 * @param {import('fastify').FastifyInstance} server
 * @returns {{ token: string, source: string }}
 */
function resolveFigmaToken(server) {
  // Try server config first (e.g. from server.dev.yaml providers.figma)
  let configToken;
  if (server.config && typeof server.config.getNested === 'function') {
    try {
      configToken = server.config.getNested(['providers', 'figma', 'token']);
    } catch (_) { /* not configured */ }
  }

  // resolveToken checks FIGMA_TOKEN, FIGMA_ACCESS_TOKEN
  return resolveToken(configToken || undefined);
}

/**
 * Startup hook -- Initialize Figma SDK client and register routes.
 *
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config - Bootstrap config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:figma_sdk] Initializing Figma API SDK...');

  try {
  // ── Token Resolution ──────────────────────────────────────────────
  let resolved;
  try {
    server.log.info('[lifecycle:figma_sdk] Resolving Figma token from config or environment');
    resolved = resolveFigmaToken(server);
  } catch (err) {
    server.log.warn(
      { err },
      '[lifecycle:figma_sdk] Figma token not found -- SDK routes will NOT be registered.',
    );
    return;
  }

  server.log.info({ source: resolved.source }, `[lifecycle:figma_sdk] Token resolved from ${resolved.source}`);
  server.log.info({ maskedToken: maskToken(resolved.token) }, `[lifecycle:figma_sdk] Masked token: ${maskToken(resolved.token)}`);

  // ── Base Client ───────────────────────────────────────────────────
  server.log.info('[lifecycle:figma_sdk] Creating FigmaClient instance');
  const figma = new FigmaClient({
    token: resolved.token,
    rateLimitAutoWait: true,
    onRateLimit: (info) => {
      server.log.info(
        { remaining: info.remaining, limit: info.limit },
        '[figma_sdk] Rate limit update',
      );
    },
  });

  // ── Domain Clients ────────────────────────────────────────────────
  server.log.info('[lifecycle:figma_sdk] Creating domain clients');
  const projectsClient = new ProjectsClient(figma);
  const filesClient = new FilesClient(figma);
  const commentsClient = new CommentsClient(figma);
  const componentsClient = new ComponentsClient(figma);
  const variablesClient = new VariablesClient(figma);
  const devResourcesClient = new DevResourcesClient(figma);
  const libraryAnalyticsClient = new LibraryAnalyticsClient(figma);
  const webhooksClient = new WebhooksClient(figma);

  const clients = {
    projects: projectsClient,
    files: filesClient,
    comments: commentsClient,
    components: componentsClient,
    variables: variablesClient,
    devResources: devResourcesClient,
    libraryAnalytics: libraryAnalyticsClient,
    webhooks: webhooksClient,
  };

  // ── Server Decorators ─────────────────────────────────────────────
  if (!server.hasDecorator('figma')) {
    server.decorate('figma', figma);
  }
  if (!server.hasDecorator('figmaClients')) {
    server.decorate('figmaClients', clients);
  }

  // ── Error Handler (scoped to prefix) ──────────────────────────────
  const figmaErrorHandler = createErrorHandler();

  // ── API Release Date ──────────────────────────────────────────────
  const figmaApiReleaseDate = server.config?.getNested?.(
    ['api_release_date', 'contract_snapshot_date', 'provider_figma'],
  ) ?? '02-01-2026';
  const PREFIX = `/~/api/rest/${figmaApiReleaseDate}/providers/${VENDOR}`;
  server.log.info({ PREFIX, figmaApiReleaseDate, VENDOR }, '[lifecycle:figma_sdk] Resolved API route prefix');

  // ── Route Registration ────────────────────────────────────────────
  server.log.info('[lifecycle:figma_sdk] Registering Figma API routes');
  await server.register(
    async function figmaApiRoutes(scope) {
      // Scoped error handler so Figma SDK errors are mapped correctly
      // without affecting other server routes.
      scope.setErrorHandler(figmaErrorHandler);

      // Health routes at prefix root
      await scope.register(healthRoutes);

      // v1 API routes
      await scope.register(async (v1) => {
        await v1.register(projectsRoutes, { projectsClient });
        await v1.register(filesRoutes, { filesClient });
        await v1.register(commentsRoutes, { commentsClient });
        await v1.register(componentsRoutes, { componentsClient });
        await v1.register(variablesRoutes, { variablesClient });
        await v1.register(devResourcesRoutes, { devResourcesClient });
        await v1.register(libraryAnalyticsRoutes, { libraryAnalyticsClient });
        return Promise.resolve();
      }, { prefix: '/v1' });

      // v2 API routes (webhooks)
      await scope.register(async (v2) => {
        await v2.register(webhooksRoutes, { webhooksClient });
        return Promise.resolve();
      }, { prefix: '/v2' });

      // Stub openapi routes — handlers replaced by 490_openapi_dynamic lifecycle
      scope.get('/openapi.json', async () => ({}));
      scope.get('/openapi.yaml', async () => '');

      // Documentation routes (file-based)
      try {
        const tableMd = await readFile(OPENAPI_TABLE_PATH, 'utf-8');
        scope.get('/docs/endpoints', async (_req, reply) => {
          reply.type('text/markdown').send(tableMd);
        });
      } catch { /* file not found -- skip */ }

      try {
        const curlMd = await readFile(OPENAPI_CURL_PATH, 'utf-8');
        scope.get('/docs/curl', async (_req, reply) => {
          reply.type('text/markdown').send(curlMd);
        });
      } catch { /* file not found -- skip */ }

      return Promise.resolve();
    },
    { prefix: PREFIX },
  );

  // ── Cleanup ───────────────────────────────────────────────────────
  server.addHook('onClose', async () => {
    server.log.info('[figma_sdk] Cleaning up Figma SDK resources...');
    if (typeof figma.close === 'function') {
      await figma.close();
    }
  });

  server.log.info({ PREFIX }, `[lifecycle:figma_sdk] Figma API SDK initialized -- routes registered at ${PREFIX}/*`);

  } catch (err) {
    server.log.error({ err, hookName: '510.figma_sdk' }, '[lifecycle:figma_sdk] Figma API SDK initialization failed');
    throw err;
  }
}

/**
 * Shutdown hook.
 *
 * @param {import('fastify').FastifyInstance} server
 */
export async function onShutdown(server) {
  server.log.info('[lifecycle:figma_sdk] Figma SDK shutdown complete');
}
