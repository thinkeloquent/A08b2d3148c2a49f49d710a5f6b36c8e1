# Lifecycle Provider Guide

> How to add a new external-service provider (e.g. Stripe, Slack, Jira) to the
> MTA platform via the lifecycle hook system.  Both FastAPI (Python) and Fastify
> (JavaScript) implementations are covered side-by-side.

---

## 1. Architecture Overview

```
Server Bootstrap
  |
  1. Load environment modules   (*.env.py / *.env.mjs)
  2. Load lifecycle modules      (*.lifecycle.py / *.lifecycle.mjs)
  3. Execute onInit hooks        (FastAPI only -- before ASGI middleware stack)
  4. Autoload route files        (*.route.py / *.route.mjs)
  5. Execute onStartup hooks     (before server.listen)
  6. Server is listening
  ...
  7. Execute onShutdown hooks    (on SIGINT/SIGTERM)
```

Each lifecycle file is a self-contained module that exports **hook functions**.
The bootstrap loader discovers, sorts, imports, and invokes them automatically.

---

## 2. File Naming Convention

### Pattern

```
{NUMERIC_PREFIX}_{provider_name}.lifecycle.py     # FastAPI
{NUMERIC_PREFIX}.{provider_name}.lifecycle.mjs    # Fastify
```

- `NUMERIC_PREFIX` controls load order (lower = earlier).
- Files are sorted **numerically** by prefix, not lexicographically.

### Prefix Range Conventions

| Range   | Purpose                             | Examples                       |
|---------|-------------------------------------|--------------------------------|
| 01 - 09 | Core framework (config, context)   | 01_app_yaml, 06_cors           |
| 10 - 99 | Services (cache, state)            | 20_cache_service               |
| 100-199 | Request middleware / decorators    | 100_on_request_decorators      |
| 200-499 | Advanced features (static apps)    | 200_static_app_loader          |
| 500-999 | **Provider SDKs** (your new code) | 500_github_sdk, 510_stripe_sdk |

**New providers should use prefix 500+.**  Pick a unique number that does not
collide with existing files.

### Location

```
fastapi_server/config/lifecycle/{PREFIX}_{name}.lifecycle.py
fastify_server/config/lifecycle/{PREFIX}.{name}.lifecycle.mjs
```

---

## 3. Available Hook Functions

Export any combination of these named functions from your lifecycle module.

### `onInit(app, config)` -- FastAPI only

- **When:** Immediately after `FastAPI()` is created, **before** the ASGI
  middleware stack is built.
- **Sync only** (no `async`).
- **Use for:** Registering exception/error handlers, adding middleware.
- Fastify has no equivalent because its plugin system handles this during
  `server.register()`.

### `onStartup(app_or_server, config)` -- both runtimes

- **When:** After all lifecycle modules are loaded, **before** the server starts
  listening.
- **Async supported** (auto-detected in Python; always `async` in JS).
- **Use for:** Initializing SDK clients, resolving credentials, registering
  routes, storing shared state.

### `onShutdown(app_or_server, config)` -- both runtimes

- **When:** Server is closing (SIGINT/SIGTERM received, lifespan teardown).
- **Async supported.**
- **Use for:** Closing HTTP clients, releasing connections, flushing buffers.

### Hook Signatures

```python
# Python (FastAPI)
from fastapi import FastAPI
from typing import Any

def onInit(app: FastAPI, config: dict[str, Any]) -> None: ...
async def onStartup(app: FastAPI, config: dict[str, Any]) -> None: ...
async def onShutdown(app: FastAPI, config: dict[str, Any]) -> None: ...
```

```javascript
// JavaScript (Fastify)
export async function onStartup(server, config) { ... }
export async function onShutdown(server, config) { ... }
```

---

## 4. The `config` Object

The second argument passed to every hook is the bootstrap config dict/object.

```python
# Python
config = {
    "title": "FastAPI Integrated Server",
    "port": 8080,
    "bootstrap": {
        "load_env":  "<abs_path>/config/environment",
        "lifecycle": "<abs_path>/config/lifecycle",
        "routes":    "<abs_path>/routes",
    },
    "initial_state": { ... }
}
```

```javascript
// JavaScript
const config = {
  title: "Fastify Integrated Server",
  port: 8080,
  bootstrap: {
    load_env:  "<abs_path>/config/environment",
    lifecycle: "<abs_path>/config/lifecycle",
    routes:    "<abs_path>/routes",
  },
  initial_state: { ... },
};
```

**Runtime configuration** (YAML-based, loaded by the `01_app_yaml` lifecycle)
is available on `app.state.config` (Python) or `server.config` (JS) -- **not**
in the bootstrap `config` parameter.

---

## 5. Storing Shared State

### Python -- `app.state.*`

```python
app.state.my_client = client          # base client
app.state.my_clients = { ... }        # domain-specific clients dict
```

Access in route handlers:

```python
from fastapi import Request

@router.get("/example")
async def example(request: Request):
    client = request.app.state.my_client
```

### JavaScript -- `server.decorate()`

```javascript
if (!server.hasDecorator('myClient')) {
  server.decorate('myClient', client);
}
if (!server.hasDecorator('myClients')) {
  server.decorate('myClients', { ... });
}
```

Access in route handlers:

```javascript
async function handler(req, reply) {
  const client = req.server.myClient;
}
```

---

## 6. Route Registration

### Python -- `APIRouter` + `app.include_router()`

```python
from fastapi import APIRouter

PREFIX = "/api/v1/providers/{provider_name}"

router = APIRouter(prefix=PREFIX)
router.include_router(health_router)
router.include_router(domain_router)

app.include_router(router)
```

### JavaScript -- `server.register()` with prefix

```javascript
const PREFIX = '/api/v1/providers/{provider_name}';

await server.register(
  async function providerRoutes(scope) {
    scope.setErrorHandler(myErrorHandler);
    await scope.register(healthRoutes, { client });
    await scope.register(domainRoutes, { domainClient });
  },
  { prefix: PREFIX },
);
```

**URL convention:** `/api/v1/providers/{provider_name}/*`

---

## 7. Token / Credential Resolution Pattern

Providers typically need an API key or token.  Follow this resolution order:

1. **App YAML config** -- `providers.{name}.token` via `app.state.config.get_nested()`
2. **Environment variables** -- checked by the SDK's `resolve_token()` function
3. **Fail gracefully** -- log a warning and skip route registration (don't crash
   the server).

```python
# Python pattern
def _resolve_token(app):
    config_token = None
    if hasattr(app.state, "config") and hasattr(app.state.config, "get_nested"):
        try:
            config_token = app.state.config.get_nested("providers", "{name}", "token")
        except Exception:
            pass
    return resolve_token(config_token or None)  # SDK helper

async def onStartup(app, config):
    try:
        token_info = _resolve_token(app)
    except Exception as err:
        print(f"[lifecycle:{name}] Token not found -- routes NOT registered. {err}")
        return  # <-- graceful skip, server continues
```

```javascript
// JavaScript pattern
function resolveProviderToken(server) {
  let configToken;
  if (server.config?.getNested) {
    try {
      configToken = server.config.getNested(['providers', '{name}', 'token']);
    } catch (_) {}
  }
  return resolveToken(configToken || undefined);  // SDK helper
}

export async function onStartup(server, config) {
  let resolved;
  try {
    resolved = resolveProviderToken(server);
  } catch (err) {
    console.warn(`[lifecycle:{name}] Token not found -- routes NOT registered.`, err.message);
    return;  // <-- graceful skip
  }
  // ...
}
```

---

## 8. Error Handler Registration

### Python -- `onInit` hook (before middleware stack)

```python
from {provider}.middleware.error_handler import register_error_handlers

def onInit(app, config):
    register_error_handlers(app)
```

### JavaScript -- scoped error handler inside `server.register()`

```javascript
import { createErrorHandler } from '{provider_sdk_path}';

await server.register(async function routes(scope) {
  scope.setErrorHandler(createErrorHandler());
  // ...register routes...
}, { prefix: PREFIX });
```

---

## 9. Polyglot SDK Structure

Provider SDKs live under `polyglot/{provider_name}/` with dual implementations:

```
polyglot/{provider_name}/
  py/
    {provider_name}/
      __init__.py           # barrel exports
      sdk/
        __init__.py          # re-exports: Client, resolve_token, mask_token, errors
        client.py            # base HTTP client for this provider
        {domain}.py          # domain-specific client (e.g. repos, issues)
      routes/
        __init__.py
        health.py            # GET /health, GET /health/rate-limit
        {domain}.py          # domain routes
      middleware/
        error_handler.py     # register_error_handlers(app)
    __tests__/               # pytest tests
  mjs/
    src/
      index.mjs              # barrel exports
      sdk/
        index.mjs
        client.mjs
        {domain}.mjs
      routes/
        index.mjs
        health.mjs
        {domain}.mjs
      middleware/
        error-handler.mjs
    __tests__/               # vitest tests
    package.json
```

### Importing from polyglot in lifecycle files

**Python:** Add the polyglot path to `sys.path`, then import normally.

```python
import sys
from pathlib import Path

_root = Path(__file__).parent.parent.parent.parent
_polyglot_path = _root / "polyglot" / "{provider_name}" / "py"
_packages_py_path = _root / "packages_py"
if str(_packages_py_path) not in sys.path:
    sys.path.insert(0, str(_packages_py_path))
if str(_polyglot_path) not in sys.path:
    sys.path.insert(0, str(_polyglot_path))

from {provider_name}.sdk import Client, resolve_token, mask_token
from {provider_name}.routes.health import router as health_router
```

**JavaScript:** Use relative imports from the lifecycle file.

```javascript
import {
  Client, resolveToken, maskToken, createErrorHandler,
} from '../../../polyglot/{provider_name}/mjs/src/index.mjs';

import healthRoutes from '../../../polyglot/{provider_name}/mjs/src/routes/health.mjs';
```

---

## 10. Complete Template -- Python (FastAPI)

```python
"""
{Provider} API SDK Lifecycle Hook for FastAPI

Loading Order: {PREFIX_NUMBER} (after core services, before static apps)

Environment Variables:
    {PROVIDER}_TOKEN / {PROVIDER}_API_KEY - API token

Usage in routes:
    client = request.app.state.{provider}_client
    clients = request.app.state.{provider}_clients
"""

import logging
import sys
from pathlib import Path
from typing import Any

from fastapi import APIRouter, FastAPI

# Add polyglot package to sys.path
_root = Path(__file__).parent.parent.parent.parent
_polyglot_path = _root / "polyglot" / "{provider_name}" / "py"
_packages_py_path = _root / "packages_py"
if str(_packages_py_path) not in sys.path:
    sys.path.insert(0, str(_packages_py_path))
if str(_polyglot_path) not in sys.path:
    sys.path.insert(0, str(_polyglot_path))

from {provider_name}.sdk import Client, DomainClient, resolve_token, mask_token
from {provider_name}.middleware.error_handler import register_error_handlers
from {provider_name}.routes.health import router as health_router
from {provider_name}.routes.{domain} import router as {domain}_router

logger = logging.getLogger("lifecycle.{provider_name}")

PREFIX = "/api/v1/providers/{provider_name}"


def onInit(app: FastAPI, config: dict[str, Any]) -> None:
    """Register error handlers before middleware stack is built."""
    register_error_handlers(app)


def _resolve_token(app: FastAPI):
    """Resolve token from app config then environment variables."""
    config_token = None
    if hasattr(app.state, "config") and hasattr(app.state.config, "get_nested"):
        try:
            config_token = app.state.config.get_nested(
                "providers", "{provider_name}", "token"
            )
        except Exception:
            pass
    return resolve_token(config_token or None)


async def onStartup(app: FastAPI, config: dict[str, Any]) -> None:
    """Initialize SDK client and register routes."""
    print("[lifecycle:{provider_name}] Initializing...")

    # Token
    try:
        token_info = _resolve_token(app)
    except Exception as err:
        print(f"[lifecycle:{provider_name}] Token not found -- skipping. {err}")
        return

    logger.info("Token resolved from %s", token_info.source)

    # Base client
    client = Client(token=token_info.token)

    # Domain clients
    domain = DomainClient(client)
    clients = {"domain": domain}

    # Store on app.state
    app.state.{provider}_client = client
    app.state.{provider}_clients = clients

    # Routes
    router = APIRouter(prefix=PREFIX)
    router.include_router(health_router)
    router.include_router({domain}_router)
    app.include_router(router)

    print(f"[lifecycle:{provider_name}] Routes registered at {PREFIX}/*")


async def onShutdown(app: FastAPI, config: dict[str, Any]) -> None:
    """Close the SDK client."""
    client = getattr(app.state, "{provider}_client", None)
    if client:
        print("[lifecycle:{provider_name}] Closing client...")
        await client.close()
```

---

## 11. Complete Template -- JavaScript (Fastify)

```javascript
/**
 * {Provider} API SDK Lifecycle Hook for Fastify
 *
 * Loading Order: {PREFIX_NUMBER} (after core services, before static apps)
 *
 * Environment Variables:
 *   {PROVIDER}_TOKEN / {PROVIDER}_API_KEY - API token
 *
 * Usage in routes:
 *   const client = req.server.{provider};
 *   const domain = req.server.{provider}Clients.domain;
 */

import {
  Client,
  DomainClient,
  resolveToken,
  maskToken,
  createErrorHandler,
} from '../../../polyglot/{provider_name}/mjs/src/index.mjs';

import healthRoutes from '../../../polyglot/{provider_name}/mjs/src/routes/health.mjs';
import domainRoutes from '../../../polyglot/{provider_name}/mjs/src/routes/{domain}.mjs';

const PREFIX = '/api/v1/providers/{provider_name}';

/**
 * Resolve token from server config or environment.
 */
function resolveProviderToken(server) {
  let configToken;
  if (server.config && typeof server.config.getNested === 'function') {
    try {
      configToken = server.config.getNested(['providers', '{provider_name}', 'token']);
    } catch (_) {}
  }
  return resolveToken(configToken || undefined);
}

/**
 * Startup hook -- Initialize SDK client and register routes.
 */
export async function onStartup(server, config) {
  console.log('[lifecycle:{provider_name}] Initializing...');

  // Token
  let resolved;
  try {
    resolved = resolveProviderToken(server);
  } catch (err) {
    console.warn(
      '[lifecycle:{provider_name}] Token not found -- skipping.',
      err.message,
    );
    return;
  }

  // Base client
  const client = new Client({
    token: resolved.token,
  });

  // Domain clients
  const domain = new DomainClient(client);
  const clients = { domain };

  // Server decorators
  if (!server.hasDecorator('{provider}')) {
    server.decorate('{provider}', client);
  }
  if (!server.hasDecorator('{provider}Clients')) {
    server.decorate('{provider}Clients', clients);
  }

  // Routes (scoped with error handler)
  const errorHandler = createErrorHandler();

  await server.register(
    async function providerRoutes(scope) {
      scope.setErrorHandler(errorHandler);
      await scope.register(healthRoutes, { client });
      await scope.register(domainRoutes, { domain });
    },
    { prefix: PREFIX },
  );

  // Cleanup hook
  server.addHook('onClose', async () => {
    server.log.info('[{provider_name}] Cleaning up...');
  });

  console.log(`[lifecycle:{provider_name}] Routes registered at ${PREFIX}/*`);
}

/**
 * Shutdown hook.
 */
export async function onShutdown(server) {
  server.log?.info?.('[{provider_name}] Shutdown complete');
}
```

---

## 12. Checklist for Adding a New Provider

1. **Choose a numeric prefix** (500+) that doesn't collide with existing files.
2. **Create the polyglot SDK** under `polyglot/{provider_name}/` with `py/` and
   `mjs/` sub-trees following the structure in section 9.
3. **Create the lifecycle files:**
   - `fastapi_server/config/lifecycle/{PREFIX}_{provider_name}.lifecycle.py`
   - `fastify_server/config/lifecycle/{PREFIX}.{provider_name}.lifecycle.mjs`
4. **Implement the three hooks** (`onInit`, `onStartup`, `onShutdown`).
   - `onInit`: register error handlers (Python only).
   - `onStartup`: resolve credentials, create clients, store state, register routes.
   - `onShutdown`: close clients, release resources.
5. **Register routes** under `/api/v1/providers/{provider_name}`.
6. **Include a `/health` endpoint** that validates the SDK can reach the
   external service.
7. **Handle missing credentials gracefully** -- log and return, don't crash.
8. **Test** that the server boots without the provider's token set (graceful
   skip) and with it set (routes appear).

---

## 13. Reference: GitHub Provider (the canonical example)

| Aspect                | Python file                                                          | JavaScript file                                                      |
|-----------------------|----------------------------------------------------------------------|----------------------------------------------------------------------|
| Lifecycle file        | `fastapi_server/config/lifecycle/500_github_sdk.lifecycle.py`        | `fastify_server/config/lifecycle/500.github_sdk.lifecycle.mjs`       |
| Polyglot SDK          | `polyglot/github_api/py/github_api/`                                 | `polyglot/github_api/mjs/src/`                                       |
| Route prefix          | `/api/v1/providers/github_api`                                       | `/api/v1/providers/github_api`                                       |
| State key (base)      | `app.state.github_client`                                            | `server.github`                                                      |
| State key (domains)   | `app.state.github_clients["repos"]`                                  | `server.githubClients.repos`                                         |
| Token env vars        | `GITHUB_TOKEN`, `GH_TOKEN`, `GITHUB_ACCESS_TOKEN`, `GITHUB_PAT`     | same                                                                 |
| Config path           | `providers.github.token`                                             | same                                                                 |
| Error handlers        | `onInit` -> `register_error_handlers(app)`                           | scoped `scope.setErrorHandler(createErrorHandler())`                 |

---

## 14. Hook Execution Timeline (visual)

```
Module Load Time
  |  _load_lifecycle_modules() / glob *.lifecycle.*
  |  Extract: onInit, onStartup, onShutdown
  v
onInit Phase          [Python only]
  |  Register error handlers
  |  Add middleware
  v
Route Autoload        autoload_routes(app, bootstrap)
  v
onStartup Phase       [Both runtimes]
  |  01: Load YAML config        -> app.state.config
  |  02: Create shared context   -> app.state.sharedContext
  |  03: Load compute functions   -> app.state.external_compute
  |  04: Resolve context templates -> app.state.context_registry
  |  05: State machine setup      -> app.state.StateContainerClass
  |  06: CORS middleware          (Python: onInit instead)
  |  20: Cache service            -> app.state.cache
  |  100: Request decorators      -> request.context middleware
  |  500: YOUR PROVIDER           -> app.state.{provider}_client
  v
server.listen()
  ...requests...
  v
onShutdown Phase      [Both runtimes, reverse conceptual order]
  |  500: Close provider client
  |  ...
  v
Process exits
```

---

## 15. OpenAPI Spec for Generating Provider Integrations

An OpenAPI specification is the **source of truth** for building a new lifecycle
provider integration.  The spec defines the external service's endpoints,
parameters, authentication, and schemas -- everything needed to derive the SDK
client layer, route handlers, and supporting documentation.

### 15.1 Spec Placement

Store the upstream OpenAPI YAML under the `__SPECS__/` tree:

```
__SPECS__/mta-SPECS/v800/CODE/{provider_name}-module-main/
  docs/
    {provider_name}.v{VERSION}.openapi.yaml     # the spec itself
    {provider_name}.v{VERSION}.openapi.table.md  # endpoint summary table (generated)
    {provider_name}.v{VERSION}.curl.md            # curl cheat-sheet (generated)
```

**Canonical examples:**

| Provider | Spec file |
|----------|-----------|
| Figma    | `__SPECS__/.../figma-api-module-main/docs/figma.v3.1.0.openapi.yaml` |
| GitHub   | `__SPECS__/.../github-api-module-main/node.v24/docs/github-rest.v3.openapi.yaml` |

### 15.2 Key Spec Elements and What They Drive

| OpenAPI element | Maps to | Example |
|-----------------|---------|---------|
| `info.title` / `info.version` | SDK docstrings, module header comments | `Figma API v0.33.0` |
| `servers[].url` | Base URL in `Client.__init__` / `new Client({ baseUrl })` | `https://api.figma.com` |
| `tags[]` | **Domain clients** -- one SDK client class per tag | Tags `Files`, `Comments` → `FilesClient`, `CommentsClient` |
| `paths` | **Route handlers** -- one route per operation | `/v1/files/{file_key}` → `@router.get("/files/{file_key}")` |
| `paths.*.parameters` (path) | Path parameters in route signature | `file_key: str` |
| `paths.*.parameters` (query) | Optional keyword arguments on client method + route query params | `version: Optional[str] = None` |
| `paths.*.requestBody` | Pydantic model / JSON body in route | `POST` body → `data: CreateCommentRequest` |
| `paths.*.operationId` | Client method name (snake_case) | `getFile` → `get_file()` |
| `paths.*.responses` | Error hierarchy classes, response models | `404` → `NotFoundError`, `429` → `RateLimitError` |
| `security` / `securitySchemes` | Token resolution strategy, auth header format | `PersonalAccessToken` → `X-Figma-Token` header |
| `components.schemas` | Pydantic models / TypeScript types (optional) | `FileResponse`, `Comment` |

### 15.3 Generation Cycle -- Step by Step

```
 ┌──────────────────────────────────────────────────────┐
 │  1. OBTAIN the OpenAPI spec                          │
 │     (download from vendor or write from API docs)    │
 └───────────────────────┬──────────────────────────────┘
                         │
 ┌───────────────────────▼──────────────────────────────┐
 │  2. ANALYZE the spec                                 │
 │     • List all tags → plan domain client modules     │
 │     • List all paths → plan route handler files      │
 │     • Identify auth scheme → plan token resolution   │
 │     • Identify error codes → plan error hierarchy    │
 └───────────────────────┬──────────────────────────────┘
                         │
 ┌───────────────────────▼──────────────────────────────┐
 │  3. SCAFFOLD the polyglot SDK                        │
 │     polyglot/{provider}/                             │
 │       py/{provider}/sdk/{domain}/client.py  (×N)     │
 │       py/{provider}/routes/{domain}.py      (×N)     │
 │       py/{provider}/middleware/error_handler.py       │
 │       mjs/src/sdk/{domain}.mjs              (×N)     │
 │       mjs/src/routes/{domain}.mjs           (×N)     │
 │       mjs/src/middleware/error-handler.mjs            │
 └───────────────────────┬──────────────────────────────┘
                         │
 ┌───────────────────────▼──────────────────────────────┐
 │  4. IMPLEMENT each domain client                     │
 │     For each operation under a tag:                  │
 │     • Create an async method matching operationId    │
 │     • Map path params → positional args              │
 │     • Map query params → optional keyword args       │
 │     • Map request body → typed dict / model arg      │
 │     • Call self._client.{method}(path, ...)          │
 └───────────────────────┬──────────────────────────────┘
                         │
 ┌───────────────────────▼──────────────────────────────┐
 │  5. IMPLEMENT route handlers                         │
 │     For each client method:                          │
 │     • @router.{method}(openapi_path)                 │
 │     • Mirror the same parameters                     │
 │     • Delegate to the domain client                  │
 └───────────────────────┬──────────────────────────────┘
                         │
 ┌───────────────────────▼──────────────────────────────┐
 │  6. IMPLEMENT lifecycle hooks                        │
 │     Wire everything together per sections 10–11      │
 └───────────────────────┬──────────────────────────────┘
                         │
 ┌───────────────────────▼──────────────────────────────┐
 │  7. GENERATE supporting docs                         │
 │     • openapi.table.md   (endpoint summary)          │
 │     • curl.md            (curl cheat-sheet)           │
 │     • API_REFERENCE.md   (full signature reference)  │
 └──────────────────────────────────────────────────────┘
```

### 15.4 Worked Example -- Deriving Structure from Figma OpenAPI

Given this fragment of the Figma OpenAPI spec:

```yaml
tags:
  - name: Files
  - name: Comments
  - name: Projects
  - name: Webhooks

paths:
  /v1/files/{file_key}:
    get:
      tags: [Files]
      operationId: getFile
      parameters:
        - name: file_key
          in: path
          required: true
          schema: { type: string }
        - name: version
          in: query
          schema: { type: string }
        - name: ids
          in: query
          schema: { type: string }
        - name: depth
          in: query
          schema: { type: number }
```

The derived code artifacts are:

**SDK client method** (`polyglot/figma_api/py/figma_api/sdk/files/client.py`):

```python
class FilesClient:
    async def get_file(
        self,
        file_key: str,                          # path param  → positional
        *,
        version: Optional[str] = None,          # query param → keyword
        ids: Optional[List[str]] = None,         # query param → keyword
        depth: Optional[int] = None,             # query param → keyword
    ) -> Dict[str, Any]:
        """GET /v1/files/{file_key}"""
        params = {}
        if version is not None:
            params["version"] = version
        if ids is not None:
            params["ids"] = ",".join(ids)
        if depth is not None:
            params["depth"] = depth
        return await self._client.get(f"/v1/files/{file_key}", params=params or None)
```

**Route handler** (`polyglot/figma_api/py/figma_api/routes/files.py`):

```python
@router.get("/files/{file_key}")
async def get_file(
    file_key: str,                              # path param
    version: Optional[str] = None,              # query param
    ids: Optional[str] = None,                  # query param
    depth: Optional[int] = None,                # query param
    client=Depends(get_files_client),
):
    return await client.get_file(
        file_key, version=version, ids=ids, depth=depth,
    )
```

**JavaScript equivalent** (`polyglot/figma_api/mjs/src/sdk/files.mjs`):

```javascript
export class FilesClient {
  async getFile(fileKey, { version, ids, depth } = {}) {
    const params = {};
    if (version) params.version = version;
    if (ids) params.ids = Array.isArray(ids) ? ids.join(',') : ids;
    if (depth) params.depth = depth;
    return this.client.get(`/v1/files/${fileKey}`, { params });
  }
}
```

### 15.5 Mapping Auth Schemes to Token Resolution

| OpenAPI `securitySchemes` type | Token resolution strategy |
|-------------------------------|--------------------------|
| `apiKey` (header) | Environment variable → config YAML → header injection in base client |
| `oauth2` | OAuth2 token flow; store bearer token; same resolution pattern |
| `http` / `bearer` | Bearer token in `Authorization` header; same env/config resolution |

The auth scheme determines which header the base `Client` class uses:

```yaml
# OpenAPI spec — Figma (apiKey)
securitySchemes:
  PersonalAccessToken:
    type: apiKey
    in: header
    name: X-Figma-Token        # ← this becomes the auth header
```

```python
# Derived base client
class FigmaClient:
    def __init__(self, token: str):
        self._headers = {"X-Figma-Token": token}
```

```yaml
# OpenAPI spec — GitHub (bearer)
securitySchemes:
  BearerToken:
    type: http
    scheme: bearer
```

```python
# Derived base client
class GitHubClient:
    def __init__(self, token: str):
        self._headers = {"Authorization": f"Bearer {token}"}
```

### 15.6 Mapping Error Responses to Error Hierarchy

Scan the spec's `responses` across all operations to derive error classes:

| HTTP Status | Error class | When raised |
|------------|-------------|-------------|
| 400 | `ValidationError` | Bad request parameters |
| 401 | `AuthError` | Invalid or missing token |
| 403 | `ForbiddenError` | Insufficient permissions / scopes |
| 404 | `NotFoundError` | Resource not found |
| 409 | `ConflictError` | State conflict (e.g. duplicate) |
| 429 | `RateLimitError` | Rate limit exceeded |
| 5xx | `ServerError` | Upstream service failure |

Implement a `map_response_to_error(status, body)` function in
`sdk/errors.py` that converts HTTP status codes into the appropriate
exception class, and register it in the error handler middleware
(see section 8).

### 15.7 Generating the Endpoint Summary Table

Produce a `{provider}.v{VERSION}.openapi.table.md` file that lists every
endpoint grouped by tag.  Format:

```markdown
# {Provider} API Endpoints Documentation

**Base URL:** `{servers[0].url}`

## Authentication

{Describe auth methods from securitySchemes}

---

## {Tag Name}

| Method | Endpoint | Summary | Authentication Scopes |
|--------|----------|---------|-----------------------|
| GET    | `/v1/files/{file_key}` | Get file JSON | `file_content:read` |
| ...    | ...      | ...     | ...                   |
```

This table is derived directly from iterating `paths` → each operation's
`tags`, `summary`, and `security` fields.

### 15.8 Generating the Curl Cheat-Sheet

Produce a `{provider}.v{VERSION}.curl.md` with one curl example per
endpoint.  Derive each example from the spec:

- **Method:** from the HTTP verb key under the path
- **URL:** `{base_url}{path}` with sample path parameter values
- **Query params:** from `parameters` where `in: query`
- **Headers:** from `securitySchemes` (auth header) and `requestBody` content type
- **Body:** from `requestBody.content.application/json.schema` (sample values)

````markdown
## {Tag Name}

### {operation.summary}

```bash
curl -X {METHOD} "{base_url}{path}" \
  -H "{auth_header}: $TOKEN"
```
````

### 15.9 Checklist -- OpenAPI-Driven Provider Generation

1. **Obtain spec** -- download the vendor's OpenAPI YAML (or write one from
   their API docs).  Place it under `__SPECS__/`.
2. **Validate spec** -- run a linter (e.g. `redocly lint`, `swagger-cli validate`)
   to catch issues before building.
3. **Extract tags** -- each tag becomes a domain client module and a route
   module (both Python and JavaScript).
4. **Extract operations** -- each `operationId` becomes:
   - A client method (async, with typed params derived from spec parameters)
   - A route handler (delegating to the client method)
5. **Extract auth** -- derive the base client's auth header and the token
   resolution env var names.
6. **Extract errors** -- derive the error class hierarchy from response status
   codes across all operations.
7. **Scaffold files** -- create the polyglot directory structure (section 9)
   with one module per tag.
8. **Implement base client** -- HTTP client class with auth, base URL, error
   mapping, and optional rate-limit tracking.
9. **Implement domain clients** -- one class per tag; one method per operation.
10. **Implement routes** -- one file per tag; one handler per operation.
11. **Implement error handler** -- middleware that catches SDK errors and
    returns appropriate HTTP responses.
12. **Create lifecycle hooks** -- `onInit`, `onStartup`, `onShutdown` per
    sections 10–11.
13. **Generate docs** -- endpoint table, curl cheat-sheet, API reference.
14. **Test** -- unit tests for client methods, integration tests for routes.
