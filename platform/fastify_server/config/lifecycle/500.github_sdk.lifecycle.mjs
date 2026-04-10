/**
 * GitHub API SDK Lifecycle Hook for Fastify
 *
 * Initializes the GitHub API SDK client and registers all GitHub API routes
 * under the /~/api/rest/{api_release_date}/providers/github_api/{api_version} prefix.
 *
 * Loading Order: 500 (after core services, before static apps)
 *
 * Environment Variables:
 *   GITHUB_TOKEN / GH_TOKEN / GITHUB_ACCESS_TOKEN / GITHUB_PAT - GitHub API token
 *
 * Usage in routes:
 *   const github = req.server.github;            // Base GitHubClient
 *   const repos  = req.server.githubClients.repos;  // ReposClient
 *
 * Registered endpoints (prefix: /~/api/rest/{api_release_date}/providers/github_api/2022-11-28):
 *   GET    /health                                       - Health + rate limit
 *   GET    /health/rate-limit                             - Full rate limit status
 *   GET    /repos/:owner/:repo                            - Get repository
 *   GET    /repos/user/:username                          - List user repos
 *   GET    /repos/me                                      - List authenticated user repos
 *   GET    /repos/org/:org                                - List org repos
 *   POST   /repos                                         - Create repo
 *   POST   /repos/org/:org                                - Create org repo
 *   PATCH  /repos/:owner/:repo                            - Update repo
 *   DELETE /repos/:owner/:repo                            - Delete repo
 *   GET    /repos/:owner/:repo/topics                     - Get topics
 *   PUT    /repos/:owner/:repo/topics                     - Replace topics
 *   GET    /repos/:owner/:repo/languages                  - Get languages
 *   GET    /repos/:owner/:repo/contributors               - List contributors
 *   POST   /repos/:owner/:repo/forks                      - Fork repo
 *   GET    /repos/:owner/:repo/forks                      - List forks
 *   PUT    /repos/:owner/:repo/subscription               - Watch repo
 *   DELETE /repos/:owner/:repo/subscription               - Unwatch repo
 *   GET    /repos/:owner/:repo/commits                     - List commits
 *   GET    /repos/:owner/:repo/contents                    - Get root contents
 *   GET    /repos/:owner/:repo/contents/*                  - Get contents at path
 *   GET    /repos/:owner/:repo/git/trees/:tree_sha        - Get git tree
 *   GET    /repos/:owner/:repo/branches                   - List branches
 *   GET    /repos/:owner/:repo/branches/:branch           - Get branch
 *   GET    /repos/:owner/:repo/branches/:branch/protection - Get protection
 *   PUT    /repos/:owner/:repo/branches/:branch/protection - Update protection
 *   DELETE /repos/:owner/:repo/branches/:branch/protection - Remove protection
 *   POST   /repos/:owner/:repo/branches/:branch/rename    - Rename branch
 *   POST   /repos/:owner/:repo/merges                     - Merge branches
 *   GET    /repos/:owner/:repo/compare/:base...:head      - Compare refs
 *   GET    /repos/:owner/:repo/collaborators               - List collaborators
 *   PUT    /repos/:owner/:repo/collaborators/:username     - Add collaborator
 *   DELETE /repos/:owner/:repo/collaborators/:username     - Remove collaborator
 *   GET    /repos/:owner/:repo/collaborators/:username/permission - Check permission
 *   GET    /repos/:owner/:repo/invitations                 - List invitations
 *   GET    /repos/:owner/:repo/tags                        - List tags
 *   GET    /repos/:owner/:repo/releases                    - List releases
 *   POST   /repos/:owner/:repo/releases                    - Create release
 *   GET    /repos/:owner/:repo/releases/latest             - Latest release
 *   GET    /repos/:owner/:repo/releases/tags/:tag          - Release by tag
 *   GET    /repos/:owner/:repo/releases/:id                - Get release
 *   PATCH  /repos/:owner/:repo/releases/:id                - Update release
 *   DELETE /repos/:owner/:repo/releases/:id                - Delete release
 *   GET    /repos/:owner/:repo/hooks                       - List webhooks
 *   GET    /repos/:owner/:repo/hooks/:hookId               - Get webhook
 *   POST   /repos/:owner/:repo/hooks                       - Create webhook
 *   PATCH  /repos/:owner/:repo/hooks/:hookId               - Update webhook
 *   DELETE /repos/:owner/:repo/hooks/:hookId               - Delete webhook
 *   POST   /repos/:owner/:repo/hooks/:hookId/tests         - Test webhook
 *   POST   /repos/:owner/:repo/hooks/:hookId/pings         - Ping webhook
 *   GET    /repos/:owner/:repo/vulnerability-alerts        - Get vuln alerts
 *   PUT    /repos/:owner/:repo/vulnerability-alerts        - Enable vuln alerts
 *   DELETE /repos/:owner/:repo/vulnerability-alerts        - Disable vuln alerts
 *   GET    /repos/:owner/:repo/rulesets                    - List rulesets
 *   GET    /repos/:owner/:repo/rulesets/:id                - Get ruleset
 *   POST   /repos/:owner/:repo/rulesets                    - Create ruleset
 *   PUT    /repos/:owner/:repo/rulesets/:id                - Update ruleset
 *   DELETE /repos/:owner/:repo/rulesets/:id                - Delete ruleset
 *   GET    /repos/:owner/:repo/actions/workflows             - List workflows
 *   GET    /repos/:owner/:repo/actions/workflows/:id       - Get workflow
 *   GET    /repos/:owner/:repo/actions/workflows/:id/runs  - List workflow runs
 *   GET    /repos/:owner/:repo/actions/runs                - List runs
 *   GET    /repos/:owner/:repo/actions/runs/:id            - Get run
 *   POST   /repos/:owner/:repo/actions/runs/:id/cancel     - Cancel run
 *   POST   /repos/:owner/:repo/actions/runs/:id/rerun      - Re-run workflow
 *   POST   /repos/:owner/:repo/actions/runs/:id/rerun-failed-jobs - Re-run failed jobs
 *   GET    /repos/:owner/:repo/actions/runs/:id/jobs       - List jobs for run
 *   GET    /repos/:owner/:repo/actions/jobs/:id            - Get job
 *   GET    /repos/:owner/:repo/actions/artifacts           - List artifacts
 *   GET    /repos/:owner/:repo/actions/runs/:id/artifacts  - List run artifacts
 *   GET    /repos/:owner/:repo/actions/artifacts/:id       - Get artifact
 *   DELETE /repos/:owner/:repo/actions/artifacts/:id       - Delete artifact
 *   GET    /openapi.yaml                                   - OpenAPI spec (YAML)
 *   GET    /openapi.json                                   - OpenAPI spec (JSON)
 */

import {
  GitHubClient,
  createLogger,
  resolveToken,
  maskToken,
  ReposClient,
  BranchesClient,
  CollaboratorsClient,
  TagsClient,
  WebhooksClient,
  SecurityClient,
  ActionsClient,
  createErrorHandler,
} from '../../../polyglot/github_api/mjs/src/index.mjs';
import { resolveGithubEnv } from '@internal/env-resolver';

import healthRoutes from '../../../polyglot/github_api/mjs/src/routes/health.mjs';
import repoRoutes from '../../../polyglot/github_api/mjs/src/routes/repos.mjs';
import branchRoutes from '../../../polyglot/github_api/mjs/src/routes/branches.mjs';
import collaboratorRoutes from '../../../polyglot/github_api/mjs/src/routes/collaborators.mjs';
import tagRoutes from '../../../polyglot/github_api/mjs/src/routes/tags.mjs';
import webhookRoutes from '../../../polyglot/github_api/mjs/src/routes/webhooks.mjs';
import securityRoutes from '../../../polyglot/github_api/mjs/src/routes/security.mjs';
import actionRoutes from '../../../polyglot/github_api/mjs/src/routes/actions.mjs';

const GITHUB_API_VERSION = '2022-11-28';

/**
 * Resolve GitHub token from AppYamlConfig → env-resolver → SDK fallback.
 *
 * Resolution order:
 *   1. AppYamlConfig: providers.github.endpoint_api_key (template-resolved via {{fn:provider_api_keys.github}})
 *   2. @internal/env-resolver: resolveGithubEnv().token (GITHUB_TOKEN, GH_TOKEN, etc.)
 *   3. SDK resolveToken: final fallback with AuthError if nothing found
 *
 * @param {import('fastify').FastifyInstance} server
 * @returns {{ token: string, source: string, type: string }}
 */
function resolveGitHubToken(server) {
  // 1. Try AppYamlConfig first (providers.github.endpoint_api_key, resolved from {{fn:provider_api_keys.github}})
  let configToken;
  if (server.config && typeof server.config.getNested === 'function') {
    try {
      configToken = server.config.getNested(['providers', 'github', 'endpoint_api_key']);
    } catch (_) { /* not configured */ }
  }

  // Skip unresolved templates ({{fn:...}}, {{env:...}}) — they aren't real tokens
  if (configToken && !configToken.startsWith('{{')) {
    return resolveToken(configToken);
  }

  // 2. Fall back to @internal/env-resolver (GITHUB_TOKEN, GH_TOKEN, GITHUB_ACCESS_TOKEN, GITHUB_PAT)
  const envResolved = resolveGithubEnv();
  if (envResolved.token) {
    return resolveToken(envResolved.token);
  }

  // 3. Final fallback — SDK resolveToken throws AuthError if nothing found
  return resolveToken(undefined);
}

/**
 * Resolve GitHub API base URL from AppYamlConfig (providers.github.base_url).
 * Three-tier resolution: overwrite_from_context ({{env.GITHUB_API_BASE_URL}}) → YAML → default.
 *
 * @param {import('fastify').FastifyInstance} server
 * @returns {string} GitHub API base URL
 */
function resolveGitHubBaseUrl(server) {
  let configBaseUrl;
  if (server.config && typeof server.config.getNested === 'function') {
    try {
      configBaseUrl = server.config.getNested(['providers', 'github', 'base_url']);
    } catch (_) { /* not configured */ }
  }

  // Fall back to env-resolver (in case AppYamlConfig template didn't resolve)
  const baseUrl = configBaseUrl || resolveGithubEnv().baseApiUrl;
  return baseUrl;
}

/**
 * Startup hook -- Initialize GitHub SDK client and register routes.
 *
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config - Bootstrap config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:github_sdk] Initializing GitHub API SDK...');

  try {
  // ── Token Resolution ──────────────────────────────────────────────
  let resolved;
  try {
    server.log.info('[lifecycle:github_sdk] Resolving GitHub token from config or environment');
    resolved = resolveGitHubToken(server);
  } catch (err) {
    server.log.warn(
      { err },
      '[lifecycle:github_sdk] GitHub token not found -- SDK routes will NOT be registered.',
    );
    return;
  }

  const logger = createLogger('github-sdk');
  server.log.info({ source: resolved.source, type: resolved.type }, `[lifecycle:github_sdk] Token resolved from ${resolved.source} (type: ${resolved.type})`);
  server.log.info({ maskedToken: maskToken(resolved.token) }, `[lifecycle:github_sdk] Masked token: ${maskToken(resolved.token)}`);

  // ── Base URL Resolution (AppYamlConfig: providers.github.base_url) ──
  const baseUrl = resolveGitHubBaseUrl(server);
  server.log.info({ baseUrl }, `[lifecycle:github_sdk] GitHub API base URL: ${baseUrl}`);

  // ── Base Client ───────────────────────────────────────────────────
  server.log.info('[lifecycle:github_sdk] Creating GitHubClient instance');
  const github = new GitHubClient({
    token: resolved.token,
    baseUrl,
    rateLimitAutoWait: true,
    rateLimitThreshold: 10,
    onRateLimit: (info) => {
      server.log.info(
        { remaining: info.remaining, limit: info.limit, resource: info.resource },
        '[github_sdk] Rate limit update',
      );
    },
    logger,
  });

  // ── Domain Clients ────────────────────────────────────────────────
  server.log.info('[lifecycle:github_sdk] Creating domain clients');
  const repos = new ReposClient(github);
  const branches = new BranchesClient(github);
  const collaborators = new CollaboratorsClient(github);
  const tags = new TagsClient(github);
  const webhooks = new WebhooksClient(github);
  const security = new SecurityClient(github);
  const actions = new ActionsClient(github);

  const clients = { repos, branches, collaborators, tags, webhooks, security, actions };

  // ── Server Decorators ─────────────────────────────────────────────
  if (!server.hasDecorator('github')) {
    server.decorate('github', github);
  }
  if (!server.hasDecorator('githubClients')) {
    server.decorate('githubClients', clients);
  }

  // ── Error Handler (scoped to prefix) ──────────────────────────────
  const githubErrorHandler = createErrorHandler();

  // ── API Release Date ──────────────────────────────────────────────
  const githubApiReleaseDate = server.config?.getNested?.(
    ['api_release_date', 'contract_snapshot_date', 'provider_github'],
  ) ?? '02-01-2026';
  const PREFIX = `/~/api/rest/${githubApiReleaseDate}/providers/github_api/${GITHUB_API_VERSION}`;
  server.log.info({ PREFIX, githubApiReleaseDate, GITHUB_API_VERSION }, '[lifecycle:github_sdk] Resolved API route prefix');

  // ── Route Registration ────────────────────────────────────────────
  server.log.info('[lifecycle:github_sdk] Registering GitHub API routes');
  await server.register(
    async function githubApiRoutes(scope) {
      // Scoped error handler so GitHub SDK errors are mapped correctly
      // without affecting other server routes.
      scope.setErrorHandler(githubErrorHandler);

      // Health routes at prefix root
      await scope.register(healthRoutes, { client: github });

      // Domain routes
      await scope.register(repoRoutes, { repos });
      await scope.register(branchRoutes, { branches });
      await scope.register(collaboratorRoutes, { collaborators });
      await scope.register(tagRoutes, { tags });
      await scope.register(webhookRoutes, { webhooks });
      await scope.register(securityRoutes, { security });
      await scope.register(actionRoutes, { actions });

      // Stub openapi routes — handlers replaced by 490_openapi_dynamic lifecycle
      scope.get('/openapi.json', async () => ({}));
      scope.get('/openapi.yaml', async () => '');

      return Promise.resolve();
    },
    { prefix: PREFIX },
  );

  // ── Cleanup ───────────────────────────────────────────────────────
  server.addHook('onClose', async () => {
    server.log.info('[github_sdk] Cleaning up GitHub SDK resources...');
  });

  server.log.info({ PREFIX }, `[lifecycle:github_sdk] GitHub API SDK initialized -- routes registered at ${PREFIX}/*`);

  } catch (err) {
    server.log.error({ err, hookName: '500.github_sdk' }, '[lifecycle:github_sdk] GitHub API SDK initialization failed');
    throw err;
  }
}

/**
 * Shutdown hook.
 *
 * @param {import('fastify').FastifyInstance} server
 */
export async function onShutdown(server) {
  server.log.info('[lifecycle:github_sdk] GitHub SDK shutdown complete');
}
