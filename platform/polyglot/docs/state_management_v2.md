# State Management in Polyglot Servers

This document details how Application State (Startup) and Request State are managed in the FastAPI (Python) and Fastify (Node.js) servers, with a focus on the unified patterns provided by `runtime_template_resolver` and `AppYamlConfig`.

## Overview

State management is divided into two scopes:
1.  **App State (Startup)**: Initialized once during server bootstrapping. Immutable references to singletons like Configuration, SDKs, and Registries.
2.  **Request State**: Derived or created for each individual HTTP request, containing context-aware data (e.g., Request IDs, Auth Tokens, Dynamic Configuration).

## Application State (Startup)

Application state is available globally to the server instance.

### Python (FastAPI)

In FastAPI, state is managed using the `app.state` generic object.

| Property | Type | Description |
| :--- | :--- | :--- |
| `app.state.config` | `AppYamlConfig` | The static, immutable configuration loaded from YAML files. |
| `app.state.sdk` | `AppYamlConfigSDK` | The SDK instance for querying providers and raw config. |
| `app.state.context_registry` | `ComputeRegistry` | Registry of available compute functions (Startup & Request scope). |
| `app.state.context_raw_config`| `Dict` | The raw dictionary representation of the config (used for re-resolution). |
| `app.state.resolved_config` | `Dict` | The **CONTEXT-RESOLVED** configuration for `STARTUP` scope. |

**Access Example:**
```python
@app.get("/")
def read_root(request: Request):
    # Access static config
    service_name = request.app.state.config.get("app.name")
    
    # Access resolved config (with startup variables replaced)
    resolved_db_host = request.app.state.resolved_config.get("database.host")
```

### Node.js (Fastify)

In Fastify, state is managed using the **Decoration** API (`server.decorate`).

| Property | Type | Description |
| :--- | :--- | :--- |
| `server.config` | `AppYamlConfig` | The static, immutable configuration loaded from YAML files. |
| `server.sdk` | `AppYamlConfigSDK` | The SDK instance for querying providers and raw config. |
| `server.contextRegistry` | `ComputeRegistry` | Registry of available compute functions. |
| `server.contextRawConfig` | `Object` | The raw object representation of the config. |
| `server.resolvedConfig` | `Object` | The **CONTEXT-RESOLVED** configuration for `STARTUP` scope. |

**Access Example:**
```javascript
server.get('/', async (request, reply) => {
  // Access static config
  const serviceName = server.config.get('app.name');
  
  // Access resolved config
  const resolvedDbHost = server.resolvedConfig.database.host;
});
```

---

## Request State

Request state involves dynamic resolution of configuration values based on the current request context (headers, query params, etc.).

### Python (FastAPI)

FastAPI implementation prioritizes explicit dependency injection. Request-scoped configuration resolution is **Lazy/Opt-in**.

-   **Mechanism**: `Depends(get_request_config)`
-   **Behavior**: The configuration is NOT resolved for every request automatically (to preserve performance). Endpoints must verify/request it explicitly.

**Usage:**
```python
from runtime_template_resolver.integrations.fastapi import get_request_config

@app.get("/dynamic-route")
async def dynamic_route(resolved_config: dict = Depends(get_request_config)):
    # This config has REQUEST-scoped variables resolved (e.g. {{ request.header.x-tenant-id }})
    tenant_id = resolved_config.get("tenant_id")
```

### Node.js (Fastify)

Fastify implementation uses hooks to ensure consistent state. Request-scoped configuration resolution is **Automatic/Eager** (configured via plugin).

-   **Mechanism**: `onRequest` Hook & `request.resolvedConfig`
-   **Behavior**: The `runtime-template-resolver` plugin automatically runs for every request, resolves the configuration, and attaches it to the request object.

**Usage:**
```javascript
server.get('/dynamic-route', async (request, reply) => {
  // Automatically populated by 'runtime-template-resolver' plugin
  const resolvedConfig = request.resolvedConfig;
  
  // Or use the helper to resolve specific expressions
  const specificValue = await request.resolveContext('{{ request.headers.x-tenant-id }}');
});
```

## Polyglot Function Parity

Both runtimes expose a similar Context Object (`ctx`) to Compute Functions.

| Context Path | Python (`dict`) | Node.js (`Object`) | Source |
| :--- | :--- | :--- | :--- |
| `ctx.env` | `os.environ` | `process.env` | System Environment |
| `ctx.config` | `config` (dict) | `config` (Object) | Raw Config |
| `ctx.app` | `config['app']` | `config.app` | App Metadata |
| `ctx.request` | `fastapi.Request` | `FastifyRequest` | Native Request Object |
| `ctx.state` | `request.state` | `request.state` (or implicit) | Request State |

## Summary of Differences

| Feature | Python (FastAPI) | Node.js (Fastify) |
| :--- | :--- | :--- |
| **Startup Setup** | `config/lifecycle/*.py` -> `app.state` | `config/lifecycle/*.mjs` -> `server.decorate` |
| **Request Resolution** | **Lazy** via `Depends()` | **Eager** via `onRequest` hook |
| **Resolution Access** | `resolved = await get_request_config(req)` | `req.resolvedConfig` |

## Real-World Examples

### 1. Defining Initial State in Config

Both servers allow defining an `initial_state` object in the main configuration dictionary. This is often used for build metadata or default values.

**Node.js (`fastify_server/src/main.mjs`)**:
```javascript
const config = {
  // ...
  initial_state: {
    build_info: {
      build_id: process.env.BUILD_ID || "",
      build_version: process.env.BUILD_VERSION || "",
      app_env: process.env.APP_ENV || "",
      id: `${process.env.BUILD_ID || ""} ${process.env.BUILD_VERSION || ""} ${process.env.APP_ENV || ""}`,
    },
  },
};
```

**Python (`fastapi_server/app/main.py`)**:
```python
config = {
    # ...
    "initial_state": {
        "build_info": {
            "build_id": os.getenv("BUILD_ID", ""),
            "build_version": os.getenv("BUILD_VERSION", ""),
            "app_env": os.getenv("APP_ENV", ""),
            "id": f"{os.getenv('BUILD_ID', '')} {os.getenv('BUILD_VERSION', '')} {os.getenv('APP_ENV', '')}"
        }
    }
}
```

### 2. Binding State at Startup

**Python (`fastapi_server/app/main.py`)**:
FastAPI uses `app.state` to store global instances like configuration and lifecycle hooks.
```python
app = init(config)

# Store hooks in app.state for lifespan to execute
app.state.startup_hooks = _startup_hooks
app.state.shutdown_hooks = _shutdown_hooks
# Store raw config for reference
app.state.config = config
```

### 3. Using Request State in Routes

**Node.js (`polyglot/server/mjs/examples/fastify-app/server.mjs`)**:
Fastify allows accessing custom state properties on the request object.
```javascript
// Current user endpoint
server.get("/me", async (request, reply) => {
    // Destructuring state populated by hooks
    const { user, authenticated, permissions } = request.state;

    return {
        user,
        authenticated,
        permissions,
    };
});
```

