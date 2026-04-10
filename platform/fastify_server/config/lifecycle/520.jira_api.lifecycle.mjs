/**
 * Jira REST API v3 Lifecycle Hook for Fastify
 *
 * Initializes the Jira API client and registers all Jira API
 * proxy routes under the /~/api/rest/{api_release_date}/providers/jira_api prefix.
 *
 * Loading Order: 520 (after core services, GitHub SDK, and Figma SDK)
 *
 * Environment Variables:
 *   JIRA_BASE_URL  - Jira Cloud base URL
 *   JIRA_EMAIL     - Jira user email
 *   JIRA_API_TOKEN - Jira API token
 *
 * Usage in routes:
 *   const jiraClient = req.server.jiraApi;                     // JiraFetchClient
 *   const services   = req.server.jiraApiServices;             // Service modules dict
 *
 * Registered endpoints (prefix: /~/api/rest/{api_release_date}/providers/jira_api):
 *   GET    /health                                             - Health check
 *   GET    /v3/users/search                                    - Search users
 *   GET    /v3/users/:identifier                               - Get user
 *   POST   /v3/issues                                          - Create issue
 *   GET    /v3/issues/:issueKey                                - Get issue
 *   PATCH  /v3/issues/:issueKey                                - Update issue
 *   PUT    /v3/issues/:issueKey/assign/:email                  - Assign issue
 *   GET    /v3/issues/:issueKey/transitions                    - Get transitions
 *   POST   /v3/issues/:issueKey/transitions                    - Transition issue
 *   GET    /v3/projects/:projectKey                            - Get project
 *   GET    /v3/projects/:projectKey/versions                   - Get versions
 *   POST   /v3/projects/:projectKey/versions                   - Create version
 */

import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

import {
  JiraFetchClient,
  UserService,
  IssueService,
  ProjectService,
  JiraApiError,
  createErrorHandler,
} from '../../../polyglot/jira_api/mjs/src/index.mjs';
import { resolveJiraEnv } from '@internal/env-resolver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..');

const VENDOR = 'jira_api';
const VENDOR_VERSION = 'v3';

/**
 * Resolve Jira credentials from server config or environment variables.
 * @param {import('fastify').FastifyInstance} server
 * @returns {{ baseUrl: string, email: string, apiToken: string }}
 */
function resolveJiraCredentials(server) {
  let configBaseUrl, configEmail, configApiToken;

  if (server.config && typeof server.config.getNested === 'function') {
    try { configBaseUrl = server.config.getNested(['providers', 'jira', 'base_url']); } catch { /* */ }
    try { configEmail = server.config.getNested(['providers', 'jira', 'email']); } catch { /* */ }
    try { configApiToken = server.config.getNested(['providers', 'jira', 'endpoint_api_key']); } catch { /* */ }
  }

  const _jiraEnv = resolveJiraEnv();
  const baseUrl = configBaseUrl || _jiraEnv.baseUrl;
  const email = configEmail || _jiraEnv.email;
  const apiToken = configApiToken || _jiraEnv.apiToken;

  if (!baseUrl || !email || !apiToken) {
    throw new Error(
      'Jira credentials not found. ' +
      'Set providers.jira.base_url, providers.jira.email, providers.jira.endpoint_api_key in config ' +
      'or JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN env vars.',
    );
  }
  return { baseUrl, email, apiToken };
}

/**
 * Startup hook -- Initialize Jira API client and register routes.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:jira_api] Initializing Jira API SDK...');

  try {
  const apiReleaseDate = server.config?.getNested?.(
    ['api_release_date', 'contract_snapshot_date', 'provider_jira'],
  ) ?? '02-01-2026';
  const PREFIX = `/~/api/rest/${apiReleaseDate}/providers/${VENDOR}`;
  server.log.info({ PREFIX, apiReleaseDate, VENDOR }, '[lifecycle:jira_api] Resolved API route prefix');

  let configured = false;
  let client, services;
  try {
    server.log.info('[lifecycle:jira_api] Resolving Jira credentials from config or environment');
    const { baseUrl, email, apiToken } = resolveJiraCredentials(server);
    configured = true;

    const maskedToken = apiToken.length > 8
      ? apiToken.slice(0, 4) + '****' + apiToken.slice(-4)
      : '****';
    server.log.info({ email, maskedToken, baseUrl }, `[lifecycle:jira_api] Credentials resolved (email: ${email}, token: ${maskedToken})`);

    client = new JiraFetchClient({ baseUrl, email, apiToken });

    services = {
      users: new UserService(client),
      issues: new IssueService(client),
      projects: new ProjectService(client),
    };

    if (!server.hasDecorator('jiraApi')) server.decorate('jiraApi', client);
    if (!server.hasDecorator('jiraApiServices')) server.decorate('jiraApiServices', services);
    server.log.info('[lifecycle:jira_api] Jira client and services initialized');
  } catch (err) {
    server.log.warn({ err }, '[lifecycle:jira_api] Jira credentials not found -- v3 routes will NOT be registered.');
  }

  const jiraErrorHandler = createErrorHandler();

  await server.register(
    async function jiraApiRoutes(scope) {
      scope.setErrorHandler(jiraErrorHandler);

      // Health — always registered
      scope.get('/health', async () => ({
        status: 'ok',
        vendor: VENDOR,
        vendor_version: VENDOR_VERSION,
        configured,
      }));

      if (!configured) return;

      // v3 routes — only when credentials are available
      await scope.register(async (v3) => {
        // Users
        v3.get('/users/search', async (req) => {
          return services.users.searchUsers(req.query.query, Number(req.query.max_results) || 50);
        });

        v3.get('/users/:identifier', async (req) => {
          const user = await services.users.getUserByIdentifier(req.params.identifier);
          if (!user) return { error: true, message: `User '${req.params.identifier}' not found` };
          return user;
        });

        // Issues
        v3.post('/issues', async (req) => {
          return services.issues.createIssue(req.body);
        });

        v3.get('/issues/:issueKey', async (req) => {
          return services.issues.getIssue(req.params.issueKey);
        });

        v3.patch('/issues/:issueKey', async (req) => {
          const { issueKey } = req.params;
          const { summary, labelsAdd, labelsRemove } = req.body;
          if (summary) await services.issues.updateIssueSummary(issueKey, summary);
          if (labelsAdd?.length) await services.issues.addLabels(issueKey, labelsAdd);
          if (labelsRemove?.length) await services.issues.removeLabels(issueKey, labelsRemove);
          return { message: `Issue ${issueKey} updated` };
        });

        v3.put('/issues/:issueKey/assign/:email', async (req) => {
          await services.issues.assignIssueByEmail(req.params.issueKey, req.params.email);
          return { message: `Issue ${req.params.issueKey} assigned to ${req.params.email}` };
        });

        v3.get('/issues/:issueKey/transitions', async (req) => {
          return services.issues.getAvailableTransitions(req.params.issueKey);
        });

        v3.post('/issues/:issueKey/transitions', async (req) => {
          const { issueKey } = req.params;
          const { transition_name, comment, resolution_name } = req.body;
          await services.issues.transitionIssueByName(issueKey, transition_name, comment, resolution_name);
          return { message: `Issue ${issueKey} transitioned using '${transition_name}'` };
        });

        // Projects
        v3.get('/projects/:projectKey', async (req) => {
          return services.projects.getProject(req.params.projectKey);
        });

        v3.get('/projects/:projectKey/versions', async (req) => {
          const released = req.query.released;
          const releasedOnly = released === undefined ? null : released === 'true';
          return services.projects.getProjectVersions(req.params.projectKey, releasedOnly);
        });

        v3.post('/projects/:projectKey/versions', async (req) => {
          const { projectKey } = req.params;
          const { name, description } = req.body;
          return services.projects.createVersion({ projectKey, versionName: name, description });
        });

        return Promise.resolve();
      }, { prefix: '/v3' });

      return Promise.resolve();
    },
    { prefix: PREFIX },
  );

  server.addHook('onClose', async () => {
    server.log.info('[jira_api] Cleaning up Jira API resources...');
  });

  if (configured) {
    server.log.info({ PREFIX }, `[lifecycle:jira_api] Jira API initialized -- routes registered at ${PREFIX}/*`);
  } else {
    server.log.info({ PREFIX }, `[lifecycle:jira_api] Health endpoint registered at ${PREFIX}/health (v3 routes skipped -- no credentials)`);
  }

  } catch (err) {
    server.log.error({ err, hookName: '520.jira_api' }, '[lifecycle:jira_api] Jira API SDK initialization failed');
    throw err;
  }
}

/**
 * Shutdown hook.
 * @param {import('fastify').FastifyInstance} server
 */
export async function onShutdown(server) {
  server.log.info('[lifecycle:jira_api] Jira API shutdown complete');
}
