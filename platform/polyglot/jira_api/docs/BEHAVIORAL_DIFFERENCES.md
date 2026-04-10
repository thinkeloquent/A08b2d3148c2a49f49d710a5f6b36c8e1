# Behavioral Differences

This document outlines intentional differences between the Node.js and Python implementations of the `jira_api` package. Both implementations provide full feature parity with the Jira Cloud REST API v3, but follow language-specific idioms and conventions.

---

## 1. HTTP Client Library

The underlying HTTP transport differs between stacks.

| Language | Library | Protocol |
|----------|---------|----------|
| **Node.js** | `undici` via `FetchClient` adapter | HTTP/1.1 (undici pool) |
| **Python** | `httpx.Client` | HTTP/1.1 (connection pool) |

**Reasoning**: Node.js uses `undici` — the fetch implementation bundled with Node.js — for maximum performance and zero-dependency HTTP. Python uses `httpx`, the modern replacement for `requests`, providing synchronous operation with connection pooling.

---

## 2. Timeout Units

| Language | Parameter | Unit | Default |
|----------|-----------|------|---------|
| **Node.js** | `timeoutMs` | milliseconds | `30000` |
| **Python** | `timeout` | seconds | `30.0` |

**Reasoning**: Node.js uses milliseconds throughout its standard library (`setTimeout`, `AbortSignal.timeout`). Python uses seconds, matching `httpx`, `asyncio`, and `time.sleep` conventions.

---

## 3. Client Lifecycle

| Language | Pattern | Cleanup |
|----------|---------|---------|
| **Node.js** | No lifecycle management required | GC handles cleanup |
| **Python** | Context manager (`with` statement) | `client.close()` or `__exit__` |

**TypeScript**
```typescript
const client = new JiraFetchClient({ baseUrl, email, apiToken });
const issue = await new IssueService(client).getIssue('PROJ-123');
// No cleanup needed
```

**Python**
```python
with JiraClient(base_url=base_url, email=email, api_token=api_token) as client:
    issue = IssueService(client).get_issue("PROJ-123")
# Connection pool closed automatically
```

**Reasoning**: Python's `httpx.Client` holds connection pool resources that must be explicitly released. Node.js `undici` uses the global dispatcher and does not require manual cleanup.

---

## 4. Naming Conventions

| Language | Properties | Methods | Classes |
|----------|-----------|---------|---------|
| **Node.js** | `camelCase` | `camelCase` | `PascalCase` |
| **Python** | `snake_case` | `snake_case` | `PascalCase` |

Examples:

| Concept | Node.js | Python |
|---------|---------|--------|
| User search | `searchUsers()` | `search_users()` |
| Issue creation | `createIssue()` | `create_issue()` |
| Field access | `user.accountId` | `user.account_id` |
| Error base | `JiraApiError` | `JiraAPIError` |
| Label management | `addLabels()` | `add_labels_to_issue()` |

**Reasoning**: Each language follows its PEP 8 / standard JS conventions.

---

## 5. Async vs Sync Patterns

| Language | Client Methods | Service Methods | SDK Methods |
|----------|---------------|-----------------|-------------|
| **Node.js** | `async` (returns `Promise`) | `async` (returns `Promise`) | `async` (returns `Promise`) |
| **Python** | synchronous | synchronous | synchronous |

**TypeScript**
```typescript
const users = await userService.searchUsers('john');
```

**Python**
```python
users = user_service.search_users("john")
```

**Reasoning**: The Python implementation uses `httpx.Client` (synchronous) for simplicity, which is the common pattern for server-side Jira integrations. The Node.js implementation uses `async/await` throughout, as all I/O in Node.js is inherently asynchronous.

---

## 6. Model / Schema Validation

| Language | Library | Approach |
|----------|---------|----------|
| **Node.js** | Zod | Schema objects (`UserSchema`, `IssueSchema`) with `.parse()` |
| **Python** | Pydantic | Model classes (`User`, `Issue`) with constructor validation |

**TypeScript**
```typescript
import { UserSchema } from 'jira_api';
const user = UserSchema.parse(rawData);  // throws ZodError
```

**Python**
```python
from jira_api import User
user = User(**raw_data)  # throws ValidationError
```

**Reasoning**: Zod is the dominant runtime validation library in the Node.js ecosystem. Pydantic is the standard for Python data validation, offering type-safe models with automatic JSON serialization and `model_dump()`.

---

## 7. Error Serialization

| Language | Method | Output |
|----------|--------|--------|
| **Node.js** | `toJSON()` | `{ name, message, code, status, responseData, url, method }` |
| **Python** | `to_dict()` | `{ name, message, status_code, response_data, url, method }` |

| Field | Node.js | Python |
|-------|---------|--------|
| Status | `status` | `status_code` |
| Response | `responseData` | `response_data` |
| Error code | `code` (ErrorCode enum) | (not present) |

**Reasoning**: Node.js uses `toJSON()` to integrate with `JSON.stringify()`. Python uses `to_dict()` following common Python serialization patterns. The Node.js implementation includes a machine-readable `ErrorCode` enum (`NETWORK`, `RESPONSE`, `TIMEOUT`, `CONFIGURATION`, `RATE_LIMIT`).

---

## 8. Configuration Management

| Language | Config Model | Server Settings |
|----------|-------------|-----------------|
| **Node.js** | Plain objects (`{ baseUrl, email, apiToken }`) | `getServerConfig()` function |
| **Python** | `JiraConfig` Pydantic model | `Settings` Pydantic BaseSettings |

**TypeScript**
```typescript
const config = getConfig();      // { baseUrl, email, apiToken } | null
const server = getServerConfig(); // { host, port, reload, apiKey }
```

**Python**
```python
config = get_config()        # JiraConfig | None
settings = Settings()        # auto-loads from env (pydantic-settings)
```

**Reasoning**: Python uses `pydantic-settings` to provide validated, typed settings with automatic environment variable binding. Node.js uses plain objects since there is no equivalent standard for typed settings in the ESM ecosystem.

---

## 9. Server Framework

| Language | Framework | Server Creation | Route Registration |
|----------|-----------|----------------|-------------------|
| **Node.js** | Fastify ^4.0 | `createServer()` factory | Scoped plugins (`server.register`) |
| **Python** | FastAPI 0.115 | Module-level `app` instance | Decorator-based (`@app.get`) |

| Aspect | Fastify (Node.js) | FastAPI (Python) |
|--------|-------------------|------------------|
| Auth middleware | `preHandler` hook | `Depends(verify_api_key)` |
| Error handling | `setErrorHandler()` | `try/except` in route + `HTTPException` |
| CORS | `@fastify/cors` plugin | `CORSMiddleware` |
| Lifecycle | Plugin chain | `lifespan` context manager |

**Reasoning**: Each framework uses its native patterns. Fastify uses a plugin-based architecture with hooks, while FastAPI uses dependency injection and decorators.

---

## 10. Module System

| Language | Module System | Import Style |
|----------|--------------|-------------|
| **Node.js** | ESM (`.mjs`) | `import { X } from 'jira_api'` |
| **Python** | Standard packages | `from jira_api import X` |

**TypeScript**
```typescript
import { JiraFetchClient, UserService, JiraApiError } from '../../src/index.mjs';
```

**Python**
```python
from jira_api import JiraClient, JiraAPIError
from jira_api.services.user_service import UserService
```

**Reasoning**: The Node.js package uses pure ESM with a single `index.mjs` barrel export. The Python package uses standard `__init__.py` with selective re-exports, while deeper imports use the full module path.

---

## 11. Jira API Format Conversion

Both stacks convert model data to the Jira REST API v3 format, but with different patterns.

| Language | Pattern | Example |
|----------|---------|---------|
| **Node.js** | Standalone converter functions | `issueCreateToJiraFormat(data)` |
| **Python** | Instance methods on Pydantic models | `issue_data.to_jira_format()` |

**TypeScript**
```typescript
import { issueCreateToJiraFormat } from 'jira_api';
const body = issueCreateToJiraFormat({ projectId, summary, issueTypeId });
```

**Python**
```python
issue_data = IssueCreate(project_id=project_id, summary=summary, issue_type_id=issue_type_id)
body = issue_data.to_jira_format()
```

**Reasoning**: The Node.js implementation uses pure functions for data transformation, following a functional style. The Python implementation attaches conversion methods to Pydantic models, keeping related logic co-located with the data it transforms.

---

## 12. Base URL Handling

| Language | Client | Behavior |
|----------|--------|----------|
| **Node.js** | `JiraFetchClient` | Strips trailing `/`, uses full API paths in services (`/rest/api/3/...`) |
| **Python** | `JiraClient` | Appends `rest/api/3/` to base URL, uses relative endpoints in services |

**Reasoning**: The Node.js implementation gives services full control over API paths, allowing flexibility for non-standard endpoints. The Python implementation centralizes the API version prefix in the client constructor, reducing repetition in service calls.
