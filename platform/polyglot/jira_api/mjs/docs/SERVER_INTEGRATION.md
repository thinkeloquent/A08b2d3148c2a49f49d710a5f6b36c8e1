# Jira API — Fastify Server Integration

Guide for integrating the `jira_api` Node.js package into Fastify applications.

---

## Built-in Server

The package includes a ready-to-use Fastify server with all routes pre-configured.

### Quick Start

```bash
# Set environment variables
export JIRA_BASE_URL="https://yourteam.atlassian.net"
export JIRA_EMAIL="you@example.com"
export JIRA_API_TOKEN="your-api-token"

# Start the server
node src/server/index.mjs
```

### Programmatic Start

```typescript
import { createServer, startServer } from '../../src/index.mjs';

// Option 1: Start with default configuration from env
await startServer();

// Option 2: Create server with overrides
const server = await createServer({ apiKey: 'my-secret-key' });
await server.listen({ host: '0.0.0.0', port: 8000 });
```

---

## Custom Integration

### Server Factory Pattern

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import {
  JiraFetchClient,
  getConfig,
  getServerConfig,
  UserService,
  IssueService,
  ProjectService,
  JiraApiError,
  JiraConfigurationError,
  createLogger,
} from '../../src/index.mjs';
import { createAuthHook } from '../../src/server/middleware/auth.mjs';
import { createErrorHandler } from '../../src/server/middleware/error-handler.mjs';

const log = createLogger('my-app', import.meta.url);

async function buildServer() {
  const server = Fastify({ logger: false });

  // ── Plugins ─────────────────────────────────────
  await server.register(cors, { origin: true });

  // ── Error Handler ───────────────────────────────
  // Maps JiraApiError → HTTP status codes automatically
  server.setErrorHandler(createErrorHandler());

  // ── Auth Hook ───────────────────────────────────
  // Supports Basic and Bearer auth; no-op if no key
  server.addHook('preHandler', createAuthHook(process.env.SERVER_API_KEY));

  // ── Request State ───────────────────────────────
  let requestCount = 0;
  server.decorateRequest('requestId', '');
  server.addHook('onRequest', async (request) => {
    requestCount += 1;
    request.requestId = crypto.randomUUID();
  });

  // ── Jira Client Factory ─────────────────────────
  const jiraConfig = getConfig();

  function getClient() {
    const cfg = jiraConfig || getConfig();
    if (!cfg) {
      throw new JiraConfigurationError(
        'JIRA not configured. Set JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN.',
      );
    }
    return new JiraFetchClient({
      baseUrl: cfg.baseUrl,
      email: cfg.email,
      apiToken: cfg.apiToken,
    });
  }

  // ── Health ──────────────────────────────────────
  server.get('/health', async () => ({
    status: 'healthy',
    service: 'my-jira-app',
    jiraConfigured: !!jiraConfig,
  }));

  // ── Route Groups ────────────────────────────────
  // Users
  await server.register(async (scope) => {
    const client = jiraConfig ? getClient() : null;

    scope.get('/search', async (request) => {
      const c = client || getClient();
      const { query, max_results = 50 } = request.query;
      return new UserService(c).searchUsers(query, max_results);
    });

    scope.get('/:identifier', async (request) => {
      const c = client || getClient();
      return new UserService(c).getUserByIdentifier(request.params.identifier);
    });
  }, { prefix: '/users' });

  // Issues
  await server.register(async (scope) => {
    const client = jiraConfig ? getClient() : null;

    scope.get('/:issueKey', async (request) => {
      const c = client || getClient();
      return new IssueService(c).getIssue(request.params.issueKey);
    });

    scope.post('/', async (request) => {
      const c = client || getClient();
      const { projectId, summary, issueTypeId, description, priorityId, labels } = request.body;
      return new IssueService(c).createIssue({
        projectId, summary, issueTypeId, description, priorityId, labels,
      });
    });

    scope.get('/:issueKey/transitions', async (request) => {
      const c = client || getClient();
      return new IssueService(c).getAvailableTransitions(request.params.issueKey);
    });

    scope.post('/:issueKey/transitions', async (request) => {
      const c = client || getClient();
      const { transition_name, comment, resolution_name } = request.body;
      await new IssueService(c).transitionIssueByName(
        request.params.issueKey, transition_name, comment, resolution_name,
      );
      return { message: `Issue transitioned` };
    });
  }, { prefix: '/issues' });

  // Projects
  await server.register(async (scope) => {
    const client = jiraConfig ? getClient() : null;

    scope.get('/:projectKey', async (request) => {
      const c = client || getClient();
      return new ProjectService(c).getProject(request.params.projectKey);
    });

    scope.get('/:projectKey/versions', async (request) => {
      const c = client || getClient();
      const { released } = request.query;
      const releasedOnly = released === undefined ? null : released === 'true';
      return new ProjectService(c).getProjectVersions(request.params.projectKey, releasedOnly);
    });

    scope.post('/:projectKey/versions', async (request) => {
      const c = client || getClient();
      const { name, description } = request.body;
      return new ProjectService(c).createVersion({
        projectKey: request.params.projectKey,
        versionName: name,
        description,
      });
    });
  }, { prefix: '/projects' });

  return server;
}
```

---

## Middleware

### Auth Hook

The `createAuthHook` factory returns a Fastify `preHandler` hook that validates API keys.

```typescript
import { createAuthHook } from '../../src/server/middleware/auth.mjs';

// If apiKey is undefined/null, all requests pass through
server.addHook('preHandler', createAuthHook(process.env.SERVER_API_KEY));
```

Supported auth schemes:
- **Basic Auth**: Username is the API key, password is ignored
- **Bearer Token**: Token is the API key
- **No auth**: If `SERVER_API_KEY` is not set, all requests are allowed

### Error Handler

The `createErrorHandler` factory returns a Fastify error handler that maps `JiraApiError` subclasses to appropriate HTTP responses.

```typescript
import { createErrorHandler } from '../../src/server/middleware/error-handler.mjs';

server.setErrorHandler(createErrorHandler());
```

Error mapping:

| Error Class | HTTP Status |
|-------------|-------------|
| `JiraAuthenticationError` | 401 |
| `JiraPermissionError` | 403 |
| `JiraNotFoundError` | 404 |
| `JiraValidationError` | 400 |
| `JiraRateLimitError` | 429 |
| `JiraServerError` | 500 |
| `JiraConfigurationError` | 503 |
| Other `JiraApiError` | `error.status` or 500 |
| Non-Jira errors | 500 |

---

## Route Groups

Routes are organized as scoped Fastify plugins, providing encapsulation and prefix-based routing.

```typescript
await server.register(async (scope) => {
  // Routes registered on `scope` are prefixed with /users
  scope.get('/search', handler);
  scope.get('/:identifier', handler);
}, { prefix: '/users' });
```

---

## Route Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/users/search?query=...&max_results=50` | Search users |
| `GET` | `/users/:identifier` | Get user by ID or email |
| `POST` | `/issues` | Create issue |
| `GET` | `/issues/:issueKey` | Get issue |
| `PATCH` | `/issues/:issueKey` | Update issue |
| `PUT` | `/issues/:issueKey/assign/:email` | Assign issue |
| `GET` | `/issues/:issueKey/transitions` | Get transitions |
| `POST` | `/issues/:issueKey/transitions` | Transition issue |
| `GET` | `/projects/:projectKey` | Get project |
| `GET` | `/projects/:projectKey/versions` | Get versions |
| `POST` | `/projects/:projectKey/versions` | Create version |

---

## Graceful Shutdown

```typescript
const shutdown = async () => {
  log.info('shutting down');
  await server.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

---

## Environment Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `JIRA_BASE_URL` | Jira Cloud instance URL | (required) |
| `JIRA_EMAIL` | Jira account email | (required) |
| `JIRA_API_TOKEN` | Jira API token | (required) |
| `SERVER_HOST` | Server bind address | `0.0.0.0` |
| `SERVER_PORT` | Server port | `8000` |
| `SERVER_API_KEY` | Optional API key | — |
| `SERVER_RELOAD` | Enable reload | `false` |
| `LOG_LEVEL` | Log level | `info` |
| `PORT` | Alternative port (examples) | `9000` |
