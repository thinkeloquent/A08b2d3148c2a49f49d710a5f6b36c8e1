# Healthz Integration Standard v1.0

This document outlines the standard logic and patterns for creating integration-specific health check routes (e.g., `healthz_integration_*.py/mjs`). These routes are designed to validate connectivity and authentication with external providers using the polyglot SDK stack.

## Core Principles

1.  **Polyglot Parity**: Logic must be identical across Python (FastAPI) and Node.js (Fastify).
2.  **Lifecycle Compliance**: Usage of `AppYamlConfig` via lifecycle hooks (`01-app-yaml`).
3.  **SDK Utilization**: Exclusive use of `fetch_client` and related polyglot packages.
4.  **Diagnostic Detail**: Reports must include latency, timestamps, and step-by-step diagnostics.
5.  **Secure Configuration**: Secrets must never be exposed; use sanitized config endpoints.

---

## 1. File Structure & Naming

### File Naming Convention
```
healthz_integration_{integration_name}_route.py   # FastAPI
healthz_integration_{integration_name}_route.mjs  # Fastify
```

### File Header Template

**Python:**
```python
"""
Health check route for {Integration Name} integration endpoints.

Leverages fetch_client SDK from polyglot packages for HTTP requests.
Uses AppYamlConfig from lifecycle (request.app.state.config) per standards_state_context.md.

Configuration source:
- server.dev.yaml (providers.{provider_name})

Lifecycle dependencies:
- 01_app_yaml.py: Stores config on app.state.config
- 02_create_shared_context.py: Creates app.state.sharedContext
- 03_context_resolver.py: Sets up context resolution

Packages used:
- fetch_client: SDK client for HTTP requests
- fetch_auth_config: Auth configuration resolution
- fetch_auth_encoding: Auth encoding utilities
- fetch_base_client: Base client infrastructure
- fetch_proxy_dispatcher: Proxy configuration
- fetch_types: Type definitions
"""
```

**Node.js:**
```javascript
/**
 * Health check route for {Integration Name} integration endpoints.
 *
 * Leverages fetch_client SDK from polyglot packages for HTTP requests.
 * Uses AppYamlConfig from lifecycle (server.config) per standards_state_context.md.
 *
 * Configuration source:
 * - server.dev.yaml (providers.{provider_name})
 *
 * Lifecycle dependencies:
 * - 01-app-yaml.mjs: Decorates server.config with AppYamlConfig
 * - 02-create_shared_context.mjs: Creates server.sharedContext
 * - 03-context-resolver.mjs: Sets up context resolution
 */
```

---

## 2. Dependencies & Imports

### Python Imports
```python
import os
import time
from typing import Any, Dict, Optional
from fastapi import FastAPI, Request

# Import fetch_client SDK
from fetch_client import (
    create_sdk_client,
    SDKClient,
    SDKClientOptions,
    logger as fetch_client_logger,
)

# Import fetch_auth_config for auth resolution
from auth_config import (
    fetch_auth_config,
    AuthConfig,
    AuthType,
    logger as fetch_auth_config_logger,
)

# Import fetch_auth_encoding for encoding utilities
from auth_encoding import (
    encode_bearer,
    encode_basic,
    logger as fetch_auth_encoding_logger,
)

# Import fetch_base_client logger
from fetch_base_client import logger as fetch_base_client_logger

# Import fetch_proxy_dispatcher for proxy config
from fetch_proxy_dispatcher import (
    create_proxy_config,
    ProxyConfig,
    logger as fetch_proxy_dispatcher_logger,
)

# Import fetch_types for type definitions
from fetch_types import (
    FetchResponse,
    ClientConfig,
    AuthConfig as AuthConfigType,
    HttpMethod,
)
```

### Node.js Imports
```javascript
// Import fetch_client SDK
import {
    createSDKClient,
    SDKClient,
    logger as fetchClientLogger,
} from 'fetch-client';

// Import auth_config for auth resolution
import {
    fetchAuthConfig,
    logger as fetchAuthConfigLogger,
} from '@internal/auth-config';

// Import auth_encoding for encoding utilities
import {
    encodeBearer,
    encodeBasic,
    logger as fetchAuthEncodingLogger,
} from '@internal/auth-encoding';

// Import fetch_base_client logger
import { logger as fetchBaseClientLogger } from 'fetch-base-client';

// Import fetch_proxy_dispatcher for proxy config
import {
    createProxyConfig,
    logger as fetchProxyDispatcherLogger,
} from 'fetch-proxy-dispatcher';
```

---

## 3. Logger Initialization

Create scoped loggers for each component:

**Python:**
```python
client_logger = fetch_client_logger.create("fetch_client", "healthz_integration_{name}")
auth_config_logger = fetch_auth_config_logger.create("fetch_auth_config", "healthz_integration_{name}")
auth_encoding_logger = fetch_auth_encoding_logger.create("fetch_auth_encoding", "healthz_integration_{name}")
base_logger = fetch_base_client_logger.create("fetch_base_client", "healthz_integration_{name}")
proxy_logger = fetch_proxy_dispatcher_logger.create("fetch_proxy_dispatcher", "healthz_integration_{name}")
```

**Node.js:**
```javascript
const clientLogger = fetchClientLogger.create('fetch_client', 'healthz_integration_{name}');
const authConfigLogger = fetchAuthConfigLogger.create('fetch_auth_config', 'healthz_integration_{name}');
const authEncodingLogger = fetchAuthEncodingLogger.create('fetch_auth_encoding', 'healthz_integration_{name}');
const baseLogger = fetchBaseClientLogger.create('fetch_base_client', 'healthz_integration_{name}');
const proxyLogger = fetchProxyDispatcherLogger.create('fetch_proxy_dispatcher', 'healthz_integration_{name}');
```

---

## 4. Configuration Access

Do **not** instantiate `AppYamlConfig` directly. Access the initialized instance from the server state/context.

### Python: `get_config_from_request`
```python
def get_config_from_request(request: Request) -> dict:
    """Get AppYamlConfig from request.app.state per lifecycle pattern."""
    app_config = getattr(request.app.state, 'config', None)
    if app_config is None:
        base_logger.warn("app.state.config not found - lifecycle may not be initialized")
        return {}

    if hasattr(app_config, 'get'):
        return app_config
    elif hasattr(app_config, 'toObject'):
        return app_config.toObject()
    elif hasattr(app_config, 'getAll'):
        return app_config.getAll()
    else:
        return app_config if isinstance(app_config, dict) else {}
```

### Node.js: `getConfigFromServer`
```javascript
function getConfigFromServer(server) {
    const appConfig = server.config;
    if (!appConfig) {
        baseLogger.warn('server.config not found - lifecycle may not be initialized');
        return {};
    }
    return appConfig;
}
```

---

## 5. API Key Resolution

Implement `resolve_api_key_from_env` to handle environment variable resolution:

### Logic Flow
1. Check `provider_config.overwrite_from_env.endpoint_api_key`
2. If **list**: iterate and return first existing environment variable
3. If **string**: return that environment variable's value
4. Fallback to `provider_config.endpoint_api_key`

### Python Implementation
```python
def resolve_api_key_from_env(provider_config: dict) -> Optional[str]:
    overwrite_config = provider_config.get("overwrite_from_env", {})
    if not overwrite_config:
        auth_config_logger.debug("No overwrite_from_env config found")
        return provider_config.get("endpoint_api_key")

    env_vars = overwrite_config.get("endpoint_api_key")
    if not env_vars:
        auth_config_logger.debug("No endpoint_api_key in overwrite config")
        return provider_config.get("endpoint_api_key")

    # Handle list of env var names (try in order)
    if isinstance(env_vars, list):
        auth_config_logger.debug(f"Trying env vars in order: {env_vars}")
        for var_name in env_vars:
            value = os.getenv(var_name)
            if value:
                auth_config_logger.info(f"Resolved API key from env var: {var_name}")
                return value
        auth_config_logger.warn(f"None of the env vars found: {env_vars}")
        return None

    # Handle single env var name
    if isinstance(env_vars, str):
        value = os.getenv(env_vars)
        if value:
            auth_config_logger.info(f"Resolved API key from env var: {env_vars}")
        else:
            auth_config_logger.warn(f"Env var not found: {env_vars}")
        return value

    return None
```

### Node.js Implementation
```javascript
function resolveApiKeyFromEnv(providerConfig) {
    const overwriteConfig = providerConfig.overwrite_from_env || {};
    if (Object.keys(overwriteConfig).length === 0) {
        authConfigLogger.debug('No overwrite_from_env config found');
        return providerConfig.endpoint_api_key || null;
    }

    const envVars = overwriteConfig.endpoint_api_key;
    if (!envVars) {
        authConfigLogger.debug('No endpoint_api_key in overwrite config');
        return providerConfig.endpoint_api_key || null;
    }

    // Handle list of env var names (try in order)
    if (Array.isArray(envVars)) {
        authConfigLogger.debug(`Trying env vars in order: ${envVars.join(', ')}`);
        for (const varName of envVars) {
            const value = process.env[varName];
            if (value) {
                authConfigLogger.info(`Resolved API key from env var: ${varName}`);
                return value;
            }
        }
        authConfigLogger.warn(`None of the env vars found: ${envVars.join(', ')}`);
        return null;
    }

    // Handle single env var name
    if (typeof envVars === 'string') {
        const value = process.env[envVars];
        if (value) {
            authConfigLogger.info(`Resolved API key from env var: ${envVars}`);
        } else {
            authConfigLogger.warn(`Env var not found: ${envVars}`);
        }
        return value || null;
    }

    return null;
}
```

---

## 6. Auth Options Builder

Map YAML auth types to SDK auth options:

| YAML `endpoint_auth_type` | SDK Auth Options |
|---------------------------|------------------|
| `bearer` | `{ type: 'bearer', token: apiKey }` |
| `x-api-key` | `{ type: 'x-api-key', token: apiKey }` |
| `basic` | `{ type: 'basic', username: '', password: apiKey }` |
| `custom` | `{ type: 'custom', token: apiKey }` |
| (default) | `{ type: 'bearer', token: apiKey }` |

### Python Implementation
```python
def build_sdk_auth_options(provider_config: dict) -> Optional[dict]:
    api_key = resolve_api_key_from_env(provider_config)
    if not api_key:
        return None

    auth_type = provider_config.get("endpoint_auth_type", "bearer").lower()
    auth_encoding_logger.debug(f"Building auth options for type: {auth_type}")

    if auth_type == "bearer":
        return {"type": "bearer", "token": api_key}
    elif auth_type == "x-api-key":
        return {"type": "x-api-key", "token": api_key}
    elif auth_type == "basic":
        return {"type": "basic", "username": "", "password": api_key}
    elif auth_type == "custom":
        return {"type": "custom", "token": api_key}
    else:
        auth_encoding_logger.warn(f"Unknown auth type '{auth_type}', defaulting to bearer")
        return {"type": "bearer", "token": api_key}
```

### Node.js Implementation
```javascript
function buildSdkAuthOptions(providerConfig) {
    const apiKey = resolveApiKeyFromEnv(providerConfig);
    if (!apiKey) {
        return null;
    }

    const authType = (providerConfig.endpoint_auth_type || 'bearer').toLowerCase();
    authEncodingLogger.debug(`Building auth options for type: ${authType}`);

    switch (authType) {
        case 'bearer':
            return { type: 'bearer', token: apiKey };
        case 'x-api-key':
            return { type: 'x-api-key', token: apiKey };
        case 'basic':
            return { type: 'basic', username: '', password: apiKey };
        case 'custom':
            return { type: 'custom', token: apiKey };
        default:
            authEncodingLogger.warn(`Unknown auth type '${authType}', defaulting to bearer`);
            return { type: 'bearer', token: apiKey };
    }
}
```

---

## 7. SDK Client Creation

### Python Implementation
```python
def create_client_from_provider_config(provider_config: dict) -> SDKClient:
    base_url = provider_config.get("base_url", "")
    client_config = provider_config.get("client", {})
    timeout_ms = client_config.get("timeout_ms", 30000)
    custom_headers = provider_config.get("headers", {})

    options: SDKClientOptions = {
        "base_url": base_url,
        "headers": custom_headers,
        "timeout": {"total": timeout_ms},
    }

    auth_options = build_sdk_auth_options(provider_config)
    if auth_options:
        options["auth"] = auth_options

    base_logger.info(f"Creating SDK client for {base_url}")
    return create_sdk_client(options)
```

### Node.js Implementation
```javascript
function createClientFromProviderConfig(providerConfig) {
    const baseUrl = providerConfig.base_url || '';
    const clientConfig = providerConfig.client || {};
    const timeoutMs = clientConfig.timeout_ms || 30000;
    const customHeaders = providerConfig.headers || {};

    const options = {
        baseUrl: baseUrl,
        headers: customHeaders,
        timeout: { total: timeoutMs },
    };

    const authOptions = buildSdkAuthOptions(providerConfig);
    if (authOptions) {
        options.auth = authOptions;
    }

    baseLogger.info(`Creating SDK client for ${baseUrl}`);
    return createSDKClient(options);
}
```

---

## 8. Health Check Logic (`check_provider_health`)

### Execution Sequence

1. **Start Timer**: Capture `start_time` (Python: `time.time()`, Node.js: `Date.now() / 1000`)
2. **Initialize Result Object**:
   ```json
   {
     "provider": "provider_name",
     "healthy": false,
     "status_code": null,
     "latency_ms": null,
     "error": null,
     "endpoint": "full_url",
     "model": "model_name",
     "diagnostics": []
   }
   ```
3. **Diagnostic - Start**: Append `request:start` event
4. **Pre-flight Check**: Verify API key exists; if not, return error immediately
5. **Create Client**: `create_client_from_provider_config(provider_config)`
6. **Execute Request**: `client.get(health_endpoint)`
7. **Update Result**: Set `status_code`, `healthy`, `latency_ms`
8. **Diagnostic - End**: Append `request:end` event with status
9. **Error Handling**: Catch exceptions, append `request:error` diagnostic
10. **Cleanup**: Close client in `finally` block

### Diagnostic Event Formats

**request:start:**
```json
{
  "name": "request:start",
  "timestamp": 1736361000.123,
  "url": "https://api.example.com/health",
  "method": "GET"
}
```

**request:end:**
```json
{
  "name": "request:end",
  "timestamp": 1736361000.456,
  "duration": 0.333,
  "status": 200
}
```

**request:error:**
```json
{
  "name": "request:error",
  "timestamp": 1736361000.456,
  "duration": 0.333,
  "error": "Error message"
}
```

### Python Implementation
```python
async def check_provider_health(provider_name: str, provider_config: dict) -> dict:
    base_logger.info(f"Checking health for provider: {provider_name}")
    start_time = time.time()

    result = {
        "provider": provider_name,
        "healthy": False,
        "status_code": None,
        "latency_ms": None,
        "error": None,
        "endpoint": None,
        "model": provider_config.get("model"),
        "diagnostics": [],
    }

    health_endpoint = provider_config.get("health_endpoint", "/models")
    base_url = provider_config.get("base_url", "")
    result["endpoint"] = f"{base_url.rstrip('/')}{health_endpoint}"

    # Diagnostic: request:start
    result["diagnostics"].append({
        "name": "request:start",
        "timestamp": start_time,
        "url": result["endpoint"],
        "method": "GET",
    })

    # Pre-flight: Check API key
    api_key = resolve_api_key_from_env(provider_config)
    if not api_key:
        client_logger.error(f"No API key available for {provider_name}")
        result["error"] = "API key not configured"
        result["latency_ms"] = round((time.time() - start_time) * 1000, 2)
        result["diagnostics"].append({
            "name": "request:error",
            "timestamp": time.time(),
            "duration": time.time() - start_time,
            "error": "API key not configured",
        })
        return result

    client: Optional[SDKClient] = None
    try:
        client = create_client_from_provider_config(provider_config)
        client_logger.info(f"Making health check request to {health_endpoint}")
        response = await client.get(health_endpoint)

        result["status_code"] = response["status"]
        result["healthy"] = response["ok"]
        result["latency_ms"] = round((time.time() - start_time) * 1000, 2)

        # Diagnostic: request:end
        result["diagnostics"].append({
            "name": "request:end",
            "timestamp": time.time(),
            "duration": time.time() - start_time,
            "status": response["status"],
        })

        if not response["ok"]:
            error_data = response.get("data")
            if isinstance(error_data, dict):
                result["error"] = error_data.get("error", {}).get("message", f"HTTP {response['status']}")
            else:
                result["error"] = f"HTTP {response['status']}"

        client_logger.info(f"Health check completed: {response['status']} in {result['latency_ms']}ms")

    except Exception as e:
        client_logger.error(f"Health check failed for {provider_name}: {e}")
        result["error"] = str(e)
        result["latency_ms"] = round((time.time() - start_time) * 1000, 2)
        result["diagnostics"].append({
            "name": "request:error",
            "timestamp": time.time(),
            "duration": time.time() - start_time,
            "error": str(e),
        })
    finally:
        if client:
            try:
                await client.close()
            except Exception:
                pass

    return result
```

---

## 9. Route Structure

### Mount Function Signature

**Python:**
```python
def mount(app: FastAPI):
    """Mount integration health check routes."""
```

**Node.js:**
```javascript
export async function mount(server) {
    // Routes here
}
```

### Standard Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /healthz/admin/integration/{name}` | **Combined Check**: Checks all sub-providers. Returns aggregate health. |
| `GET /healthz/admin/integration/{name}/{provider}` | **Individual Check**: Checks specific provider. |
| `GET /healthz/admin/integration/{name}/config` | **Debug Config**: Returns sanitized configuration & lifecycle status. |

### Timestamp Format
```python
# Python
time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
```
```javascript
// Node.js
new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
```

---

## 10. Config Endpoint Requirements

The config endpoint must return:

| Field | Description |
|-------|-------------|
| `initialized` | boolean - Whether config is loaded |
| `lifecycle_state` | Object checking existence of `config`, `sharedContext`, `sdk` |
| `packages_loaded` | Boolean map of required polyglot packages |
| `sdk_version` | Version string (e.g., `"1.0.0"`) |
| `{provider}_config` | Sanitized provider config (secrets masked with `***`) |
| `env_vars_available` | Boolean map of expected env vars (true/false, NO values) |

### Sanitization Function

**Python:**
```python
def sanitize_config(cfg: dict) -> dict:
    sanitized = dict(cfg)
    if "endpoint_api_key" in sanitized:
        sanitized["endpoint_api_key"] = "***"
    return sanitized
```

**Node.js:**
```javascript
const sanitize = (cfg) => {
    const s = { ...cfg };
    if (s.endpoint_api_key) s.endpoint_api_key = '***';
    return s;
};
```

### Lifecycle State Check

**Python:**
```python
has_config = hasattr(request.app.state, 'config')
has_shared_context = hasattr(request.app.state, 'sharedContext')
has_sdk = hasattr(request.app.state, 'sdk')
```

**Node.js:**
```javascript
const hasConfig = server.hasDecorator('config');
const hasSharedContext = server.hasDecorator('sharedContext');
const hasSdk = server.hasDecorator('sdk');
const hasConfigSdk = server.hasDecorator('configSdk');
```

---

## 11. Response Formats

### Health Check Success
```json
{
  "healthy": true,
  "timestamp": "2026-01-08T19:30:00Z",
  "providers": {
    "provider_a": {
      "provider": "provider_a",
      "healthy": true,
      "status_code": 200,
      "latency_ms": 245.32,
      "error": null,
      "endpoint": "https://api.example.com/models",
      "model": "model-name",
      "diagnostics": [...]
    }
  }
}
```

### Health Check Error
```json
{
  "healthy": false,
  "timestamp": "2026-01-08T19:30:00Z",
  "providers": {
    "provider_a": {
      "provider": "provider_a",
      "healthy": false,
      "status_code": null,
      "latency_ms": 0.15,
      "error": "API key not configured",
      "endpoint": "https://api.example.com/models",
      "model": "model-name",
      "diagnostics": [...]
    }
  }
}
```

### Config Endpoint
```json
{
  "initialized": true,
  "lifecycle_state": {
    "config": true,
    "sharedContext": true,
    "sdk": true
  },
  "packages_loaded": {
    "fetch_client": true,
    "fetch_base_client": true,
    "fetch_auth_config": true,
    "fetch_auth_encoding": true,
    "fetch_proxy_dispatcher": true,
    "fetch_types": true
  },
  "sdk_version": "1.0.0",
  "provider_a": { "base_url": "...", "endpoint_api_key": "***" },
  "env_vars_available": {
    "PROVIDER_A_API_KEY": true,
    "PROVIDER_A_API_KEY_2": false
  }
}
```

---

## 12. YAML Configuration Example

```yaml
providers:
  my_provider:
    base_url: "https://api.example.com/v1"
    model: "model-name"
    health_endpoint: "/models"
    endpoint_api_key: null
    endpoint_auth_type: "bearer"         # bearer, basic, x-api-key, custom
    endpoint_auth_token_resolver: "request"
    overwrite_from_env:
      endpoint_api_key: ["MY_PROVIDER_API_KEY", "MY_PROVIDER_API_KEY_BACKUP"]
    proxy_url: false
    client:
      timeout_seconds: 30.0
      timeout_ms: 30000
    headers:
      X-Custom-Header: "value"
```

---

## Reference Implementations

*   **Python**: `fastapi_server/routes/healthz_integration_gemini_openai_route.py`
*   **Node.js**: `fastify_server/routes/healthz_integration_gemini_openai_route.mjs`
