# Server Integration Guide for Jira API

This guide covers integrating the `jira_api` package into web applications using Fastify (Node.js) and FastAPI (Python).

---

## Built-in Server

Both stacks include a ready-to-use REST proxy server.

### Node.js (Fastify)

```bash
# Start the built-in server
cd polyglot/jira_api/mjs
node src/server/index.mjs

# Or use the programmatic API
node -e "import('./src/index.mjs').then(m => m.startServer())"
```

```typescript
import { createServer, startServer } from '../../src/index.mjs';

// Option 1: Start with defaults
await startServer();

// Option 2: Create and customize
const server = await createServer({ apiKey: 'my-secret-key' });
await server.listen({ host: '0.0.0.0', port: 8000 });
```

### Python (FastAPI)

```bash
# Start the built-in server
cd polyglot/jira_api/py
uvicorn jira_api.server:app --reload --host 0.0.0.0 --port 8000

# Or use the entry point
python -m jira_api.server
```

```python
from jira_api.server import app, start_server

# Option 1: Start with defaults
start_server()

# Option 2: Import app for ASGI servers
# uvicorn jira_api.server:app
```

---

## Fastify Integration (Node.js)

### Pattern: Fastify Plugin with Decorators

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import {
  JiraFetchClient,
  getConfig,
  UserService,
  IssueService,
  ProjectService,
  JiraApiError,
  JiraConfigurationError,
  createLogger,
} from '../../src/index.mjs';
import { createAuthHook } from '../../src/server/middleware/auth.mjs';
import { createErrorHandler } from '../../src/server/middleware/error-handler.mjs';

async function buildServer() {
  const server = Fastify({ logger: false });

  // CORS
  await server.register(cors, { origin: true });

  // Error handler — maps JiraApiError to HTTP responses
  server.setErrorHandler(createErrorHandler());

  // Auth hook — optional API key
  server.addHook('preHandler', createAuthHook(process.env.SERVER_API_KEY));

  // Jira client factory
  const jiraConfig = getConfig();
  function getClient() {
    const cfg = jiraConfig || getConfig();
    if (!cfg) throw new JiraConfigurationError('JIRA not configured');
    return new JiraFetchClient({
      baseUrl: cfg.baseUrl,
      email: cfg.email,
      apiToken: cfg.apiToken,
    });
  }

  // Health route
  server.get('/health', async () => ({
    status: 'healthy',
    jiraConfigured: !!jiraConfig,
  }));

  // User routes (scoped plugin)
  await server.register(async (scope) => {
    const client = jiraConfig ? getClient() : null;
    const userService = new UserService(client || getClient());

    scope.get('/search', async (request) => {
      const { query, max_results = 50 } = request.query;
      return userService.searchUsers(query, max_results);
    });

    scope.get('/:identifier', async (request) => {
      return userService.getUserByIdentifier(request.params.identifier);
    });
  }, { prefix: '/users' });

  return server;
}

const server = await buildServer();
await server.listen({ host: '0.0.0.0', port: 9000 });
```

### Middleware

**Auth Hook** — Supports both Basic and Bearer authentication:
```typescript
import { createAuthHook } from '../../src/server/middleware/auth.mjs';

// If apiKey is undefined, all requests are allowed
server.addHook('preHandler', createAuthHook(process.env.SERVER_API_KEY));
```

**Error Handler** — Converts `JiraApiError` subclasses to HTTP responses:
```typescript
import { createErrorHandler } from '../../src/server/middleware/error-handler.mjs';

server.setErrorHandler(createErrorHandler());
// JiraNotFoundError → 404, JiraValidationError → 400, etc.
```

### Route Groups

Routes are organized as scoped Fastify plugins:

```typescript
await server.register(async (scope) => {
  scope.get('/:key', handler);
  scope.post('/', handler);
}, { prefix: '/issues' });
```

---

## FastAPI Integration (Python)

### Pattern: Lifespan Context Manager

```python
from contextlib import asynccontextmanager
from typing import Annotated, Any, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from jira_api.config import Settings, get_config
from jira_api.core.client import JiraClient
from jira_api.exceptions import JiraAPIError
from jira_api.services.user_service import UserService
from jira_api.services.issue_service import IssueService
from jira_api.models.user import User

settings = Settings()
security = HTTPBasic(auto_error=False)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: validate Jira configuration."""
    config = get_config()
    app.state.jira_config = config
    if config:
        print(f"Jira configured: {config.base_url}")
    yield
    print("Shutting down")


app = FastAPI(title="My Jira App", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Dependency Injection

```python
def verify_api_key(
    credentials: Optional[HTTPBasicCredentials] = Depends(security),
) -> bool:
    """Verify API key if configured."""
    if not settings.server_api_key:
        return True
    if not credentials or credentials.username != settings.server_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Basic"},
        )
    return True


def get_jira_client() -> JiraClient:
    """Get a JiraClient from environment configuration."""
    config = get_config()
    if not config:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="JIRA not configured",
        )
    return JiraClient(
        base_url=config.base_url,
        email=config.email,
        api_token=config.api_token,
    )


# Type aliases for clean route signatures
Auth = Annotated[bool, Depends(verify_api_key)]
Client = Annotated[JiraClient, Depends(get_jira_client)]
```

### Route Definitions

```python
@app.get("/users/search", response_model=list[User], tags=["Users"])
async def search_users(
    query: str = Query(...),
    max_results: int = Query(50, ge=1, le=100),
    _auth: Auth = True,
    client: Client = None,
) -> list[User]:
    try:
        with client:
            return UserService(client).search_users(query, max_results)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))


@app.get("/issues/{issue_key}", tags=["Issues"])
async def get_issue(
    issue_key: str,
    _auth: Auth = True,
    client: Client = None,
):
    try:
        with client:
            return IssueService(client).get_issue(issue_key)
    except JiraAPIError as e:
        raise HTTPException(status_code=e.status_code or 400, detail=str(e))
```

---

## Route Reference

Both servers expose the same REST API:

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Health check |
| `GET` | `/users/search?query=...&max_results=50` | — | Search users |
| `GET` | `/users/{identifier}` | — | Get user by ID or email |
| `POST` | `/issues` | `IssueCreate` JSON | Create issue |
| `GET` | `/issues/{issueKey}` | — | Get issue by key |
| `PATCH` | `/issues/{issueKey}` | `IssueUpdate` JSON | Update issue |
| `PUT` | `/issues/{issueKey}/assign/{email}` | — | Assign issue |
| `GET` | `/issues/{issueKey}/transitions` | — | Get transitions |
| `POST` | `/issues/{issueKey}/transitions` | `{ transition_name, comment?, resolution_name? }` | Transition issue |
| `GET` | `/projects/{projectKey}` | — | Get project |
| `GET` | `/projects/{projectKey}/versions?released=true` | — | Get versions |
| `POST` | `/projects/{projectKey}/versions` | `{ name, description? }` | Create version |

---

## Environment Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `JIRA_BASE_URL` | Jira Cloud instance URL | (required) |
| `JIRA_EMAIL` | Jira account email | (required) |
| `JIRA_API_TOKEN` | Jira API token | (required) |
| `SERVER_HOST` | Server bind address | `0.0.0.0` |
| `SERVER_PORT` | Server port | `8000` |
| `SERVER_API_KEY` | Optional API key for auth | — |
| `SERVER_RELOAD` | Enable auto-reload | `false` |
| `LOG_LEVEL` | Logging level | `info` / `INFO` |

---

## Error Handling

### Fastify

The built-in `createErrorHandler()` automatically maps `JiraApiError` subclasses to HTTP status codes:

```typescript
server.setErrorHandler(createErrorHandler());
// JiraAuthenticationError → 401
// JiraPermissionError → 403
// JiraNotFoundError → 404
// JiraValidationError → 400
// JiraRateLimitError → 429
// JiraServerError → 500
```

### FastAPI

Errors are caught in route handlers and re-raised as `HTTPException`:

```python
try:
    with client:
        return IssueService(client).get_issue(issue_key)
except JiraAPIError as e:
    raise HTTPException(status_code=e.status_code or 400, detail=str(e))
```
