# Polyglot Fetch Provider Health Check Standards

This document provides standards and instructions for implementing Provider Health Checks using the Fetch Client packages in FastAPI (Python) and Fastify (Node.js) servers.

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Package Overview](#package-overview)
3. [Configuration Schema](#configuration-schema)
4. [Implementation Components](#implementation-components)
5. [FetchAuthEncoder](#fetchauthencoder)
6. [FetchAuthConfig](#fetchauthconfig)
7. [FetchProxyDispatcher](#fetchproxydispatcher)
8. [FetchClient](#fetchclient)
9. [Factory Pattern](#factory-pattern)
10. [Health Check Implementation](#health-check-implementation)
11. [Route Mounting](#route-mounting)
12. [Complete Examples](#complete-examples)

---

## Quick Reference

### Package Import Cheatsheet

| Package                    | Python Import                                | Node.js Import                                    |
| -------------------------- | -------------------------------------------- | ------------------------------------------------- |
| **fetch_client**           | `from fetch_client import logger`            | `import { logger } from 'fetch_client'`           |
| **fetch_base_client**      | `from fetch_base_client import logger`       | `import { logger } from 'fetch_base_client'`      |
| **auth_config**            | `from auth_config import logger`             | `import { logger } from '@internal/auth-config'`  |
| **auth_encoding**          | `from auth_encoding import logger`           | `import { logger } from '@internal/auth-encoding'` |
| **fetch_proxy_dispatcher** | `from fetch_proxy_dispatcher import logger`  | `import { logger } from 'fetch_proxy_dispatcher'` |
| **fetch_types**            | `from fetch_types import FetchResponse, ...` | Type definitions only                             |

### Component Responsibility

| Component              | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `FetchAuthEncoder`     | Encode credentials (base64, bearer, api-key) |
| `FetchAuthConfig`      | Resolve API keys, build auth headers         |
| `FetchProxyDispatcher` | Proxy routing and bypass logic               |
| `FetchClient`          | HTTP client with diagnostics                 |

---

## Package Overview

The Polyglot Fetch ecosystem consists of six packages that work together:

```
fetch_types (Type Definitions)
    ↓
    ├─→ fetch_auth_config (Auth Configuration + Logger)
    ├─→ fetch_auth_encoding (Credential Encoding + Logger)
    ├─→ fetch_base_client (Base Client + Logger)
    ├─→ fetch_proxy_dispatcher (Proxy Routing + Logger)
    └─→ fetch_client (HTTP Client + Logger)
```

### Package Details

| Package                  | Exports           | Purpose                                                                        |
| ------------------------ | ----------------- | ------------------------------------------------------------------------------ |
| `fetch_types`            | Types, Interfaces | `FetchResponse`, `ClientConfig`, `AuthConfig`, `ProxyConfig`, `RequestOptions` |
| `fetch_client`           | `logger.create()` | HTTP client operation logging                                                  |
| `fetch_base_client`      | `logger.create()` | Base client and factory logging                                                |
| `fetch_auth_config`      | `logger.create()` | Auth configuration logging                                                     |
| `fetch_auth_encoding`    | `logger.create()` | Credential encoding logging                                                    |
| `fetch_proxy_dispatcher` | `logger.create()` | Proxy routing logging                                                          |

---

## Configuration Schema

Provider configuration in `server.{env}.yaml`:

```yaml
providers:
  provider_name:
    # Required
    base_url: "https://api.example.com/v1"
    health_endpoint: "/models"              # Endpoint to call for health check

    # Authentication
    endpoint_auth_type: "bearer"            # bearer | x-api-key | basic | custom
    endpoint_auth_token_resolver: "static"  # static | startup | request
    endpoint_api_key: null                  # Static key (usually null, use env)

    # Environment Variable Resolution
    overwrite_from_env:
      endpoint_api_key: "API_KEY_ENV_VAR"   # Single env var
      # OR
      endpoint_api_key:                      # List of fallback env vars
        - "PRIMARY_API_KEY"
        - "SECONDARY_API_KEY"
        - "FALLBACK_API_KEY"

    # Proxy Configuration
    proxy_url: false                         # false = disabled
    # OR
    proxy_url: "http://proxy.example.com:8080"
    # OR
    proxy_url:
      url: "http://proxy.example.com:8080"
      auth:
        username: "proxy_user"
        password: "proxy_pass"
      no_proxy:
        - "localhost"
        - "*.internal.com"

    # Client Configuration
    client:
      timeout_seconds: 30.0                  # Python (float)
      timeout_ms: 30000                      # Node.js (integer)

    # Custom Headers
    headers:
      X-Custom-Header: "value"
      Content-Type: "application/json"

    # Metadata
    model: "gpt-4"                           # Optional model identifier
```

### Supported Auth Types

| Type        | Header Format                   | Use Case                            |
| ----------- | ------------------------------- | ----------------------------------- |
| `bearer`    | `Authorization: Bearer {token}` | OAuth2, JWT, most APIs              |
| `x-api-key` | `x-api-key: {key}`              | Anthropic, some APIs                |
| `basic`     | `Authorization: Basic {base64}` | Basic auth with API key as password |
| `custom`    | `Authorization: {raw_value}`    | Custom schemes                      |

---

## Implementation Components

### Logger Setup

Create loggers for each component at module level:

**Python:**

```python
from fetch_client import logger as fetch_client_logger
from fetch_base_client import logger as fetch_base_client_logger
from auth_config import logger as fetch_auth_config_logger
from auth_encoding import logger as fetch_auth_encoding_logger
from fetch_proxy_dispatcher import logger as fetch_proxy_dispatcher_logger

# Create component-specific loggers
client_logger = fetch_client_logger.create("fetch_client", "provider_health")
base_logger = fetch_base_client_logger.create("fetch_base_client", "provider_health")
auth_config_logger = fetch_auth_config_logger.create("fetch_auth_config", "provider_health")
auth_encoding_logger = fetch_auth_encoding_logger.create("fetch_auth_encoding", "provider_health")
proxy_logger = fetch_proxy_dispatcher_logger.create("fetch_proxy_dispatcher", "provider_health")
```

**Node.js:**

```javascript
import { logger as fetchClientLogger } from "fetch_client";
import { logger as fetchBaseClientLogger } from "fetch_base_client";
import { logger as fetchAuthConfigLogger } from "@internal/auth-config";
import { logger as fetchAuthEncodingLogger } from "@internal/auth-encoding";
import { logger as fetchProxyDispatcherLogger } from "fetch_proxy_dispatcher";

const clientLogger = fetchClientLogger.create(
  "fetch_client",
  "provider_health"
);
const baseLogger = fetchBaseClientLogger.create(
  "fetch_base_client",
  "provider_health"
);
const authConfigLogger = fetchAuthConfigLogger.create(
  "fetch_auth_config",
  "provider_health"
);
const authEncodingLogger = fetchAuthEncodingLogger.create(
  "fetch_auth_encoding",
  "provider_health"
);
const proxyLogger = fetchProxyDispatcherLogger.create(
  "fetch_proxy_dispatcher",
  "provider_health"
);
```

---

## FetchAuthEncoder

Handles credential encoding for different auth types.

### Python Implementation

```python
import base64

class FetchAuthEncoder:
    """Auth encoding utilities following fetch_auth_encoding patterns."""

    @staticmethod
    def encode_basic(username: str, password: str) -> str:
        """Encode basic auth credentials to base64."""
        auth_encoding_logger.debug(f"Encoding basic auth for user: {username[:3]}***")
        credentials = f"{username}:{password}"
        return base64.b64encode(credentials.encode()).decode()

    @staticmethod
    def encode_bearer(token: str) -> str:
        """Format bearer token (passthrough)."""
        auth_encoding_logger.debug(f"Formatting bearer token: {token[:8]}***")
        return token

    @staticmethod
    def encode_api_key(key: str) -> str:
        """Format API key (passthrough)."""
        auth_encoding_logger.debug(f"Formatting API key: {key[:8]}***")
        return key
```

### Node.js Implementation

```javascript
class FetchAuthEncoder {
  static encodeBasic(username, password) {
    authEncodingLogger.debug(
      `Encoding basic auth for user: ${username.slice(0, 3)}***`
    );
    const credentials = `${username}:${password}`;
    return Buffer.from(credentials).toString("base64");
  }

  static encodeBearer(token) {
    authEncodingLogger.debug(
      `Formatting bearer token: ${token.slice(0, 8)}***`
    );
    return token;
  }

  static encodeApiKey(key) {
    authEncodingLogger.debug(`Formatting API key: ${key.slice(0, 8)}***`);
    return key;
  }
}
```

---

## FetchAuthConfig

Resolves API keys from environment and builds auth headers.

### Python Implementation

```python
import os
from typing import Optional

class FetchAuthConfig:
    """Auth configuration handler following fetch_auth_config patterns."""

    def __init__(self, provider_config: dict):
        self.provider_config = provider_config
        self.encoder = FetchAuthEncoder()

    def resolve_api_key(self) -> Optional[str]:
        """Resolve API key from environment variables."""
        overwrite_config = self.provider_config.get("overwrite_from_env", {})

        if not overwrite_config:
            auth_config_logger.debug("No overwrite_from_env config found")
            return self.provider_config.get("endpoint_api_key")

        env_vars = overwrite_config.get("endpoint_api_key")
        if not env_vars:
            return self.provider_config.get("endpoint_api_key")

        # Handle list of env var names (try in order)
        if isinstance(env_vars, list):
            auth_config_logger.debug(f"Trying env vars in order: {env_vars}")
            for var_name in env_vars:
                value = os.getenv(var_name)
                if value:
                    auth_config_logger.info(f"Resolved API key from: {var_name}")
                    return value
            auth_config_logger.warn(f"None of the env vars found: {env_vars}")
            return None

        # Handle single env var name
        if isinstance(env_vars, str):
            value = os.getenv(env_vars)
            if value:
                auth_config_logger.info(f"Resolved API key from: {env_vars}")
            return value

        return None

    def get_auth_type(self) -> str:
        """Get the authentication type from config."""
        return self.provider_config.get("endpoint_auth_type", "bearer")

    def build_auth_headers(self) -> dict[str, str]:
        """Build authentication headers based on config."""
        api_key = self.resolve_api_key()
        if not api_key:
            auth_config_logger.error("No API key available")
            return {}

        auth_type = self.get_auth_type().lower()
        auth_config_logger.info(f"Building auth headers for type: {auth_type}")

        if auth_type == "bearer":
            token = self.encoder.encode_bearer(api_key)
            return {"Authorization": f"Bearer {token}"}
        elif auth_type == "x-api-key":
            return {"x-api-key": self.encoder.encode_api_key(api_key)}
        elif auth_type == "basic":
            encoded = self.encoder.encode_basic("", api_key)
            return {"Authorization": f"Basic {encoded}"}
        elif auth_type == "custom":
            return {"Authorization": api_key}
        else:
            # Default to bearer
            auth_config_logger.warn(f"Unknown auth type '{auth_type}', defaulting to bearer")
            return {"Authorization": f"Bearer {api_key}"}
```

### Node.js Implementation

```javascript
class FetchAuthConfig {
  constructor(providerConfig) {
    this.providerConfig = providerConfig;
    this.encoder = FetchAuthEncoder;
  }

  resolveApiKey() {
    const overwriteConfig = this.providerConfig.overwrite_from_env || {};

    if (Object.keys(overwriteConfig).length === 0) {
      authConfigLogger.debug("No overwrite_from_env config found");
      return this.providerConfig.endpoint_api_key || null;
    }

    const envVars = overwriteConfig.endpoint_api_key;
    if (!envVars) {
      return this.providerConfig.endpoint_api_key || null;
    }

    // Handle array of env var names
    if (Array.isArray(envVars)) {
      authConfigLogger.debug(`Trying env vars in order: ${envVars.join(", ")}`);
      for (const varName of envVars) {
        const value = process.env[varName];
        if (value) {
          authConfigLogger.info(`Resolved API key from: ${varName}`);
          return value;
        }
      }
      authConfigLogger.warn(
        `None of the env vars found: ${envVars.join(", ")}`
      );
      return null;
    }

    // Handle single env var name
    if (typeof envVars === "string") {
      const value = process.env[envVars];
      if (value) {
        authConfigLogger.info(`Resolved API key from: ${envVars}`);
      }
      return value || null;
    }

    return null;
  }

  getAuthType() {
    return this.providerConfig.endpoint_auth_type || "bearer";
  }

  buildAuthHeaders() {
    const apiKey = this.resolveApiKey();
    if (!apiKey) {
      authConfigLogger.error("No API key available");
      return {};
    }

    const authType = this.getAuthType().toLowerCase();
    authConfigLogger.info(`Building auth headers for type: ${authType}`);

    switch (authType) {
      case "bearer":
        return { Authorization: `Bearer ${this.encoder.encodeBearer(apiKey)}` };
      case "x-api-key":
        return { "x-api-key": this.encoder.encodeApiKey(apiKey) };
      case "basic":
        return {
          Authorization: `Basic ${this.encoder.encodeBasic("", apiKey)}`,
        };
      case "custom":
        return { Authorization: apiKey };
      default:
        authConfigLogger.warn(
          `Unknown auth type '${authType}', defaulting to bearer`
        );
        return { Authorization: `Bearer ${apiKey}` };
    }
  }
}
```

---

## FetchProxyDispatcher

Handles proxy configuration and routing decisions.

### Python Implementation

```python
from typing import Optional, Union
from urllib.parse import urlparse

class FetchProxyDispatcher:
    """Proxy dispatcher following fetch_proxy_dispatcher patterns."""

    def __init__(self, proxy_config: Optional[Union[str, dict, bool]]):
        self.proxy_url: Optional[str] = None
        self.no_proxy: list[str] = []
        self.auth: Optional[dict] = None

        if proxy_config is False or proxy_config is None:
            proxy_logger.debug("Proxy disabled")
            return

        if isinstance(proxy_config, str):
            self.proxy_url = proxy_config
            proxy_logger.info(f"Proxy configured: {proxy_config}")
        elif isinstance(proxy_config, dict):
            self.proxy_url = proxy_config.get("url")
            self.no_proxy = proxy_config.get("no_proxy", [])
            self.auth = proxy_config.get("auth")
            proxy_logger.info(f"Proxy configured: {self.proxy_url}")

    def should_bypass(self, url: str) -> bool:
        """Check if URL should bypass proxy."""
        if not self.proxy_url:
            return True

        parsed = urlparse(url)
        host = parsed.hostname or ""

        for pattern in self.no_proxy:
            if pattern.startswith("*."):
                domain = pattern[2:]
                if host.endswith(domain):
                    proxy_logger.debug(f"Bypassing proxy for {host}")
                    return True
            elif host == pattern or host.endswith(f".{pattern}"):
                proxy_logger.debug(f"Bypassing proxy for {host}")
                return True

        return False

    def get_proxy_url(self, url: str) -> Optional[str]:
        """Get proxy URL for a given request URL."""
        if self.should_bypass(url):
            return None
        proxy_logger.debug(f"Using proxy {self.proxy_url} for {url}")
        return self.proxy_url

    def get_proxy_auth(self) -> Optional[tuple[str, str]]:
        """Get proxy authentication credentials."""
        if self.auth:
            return (self.auth.get("username"), self.auth.get("password"))
        return None
```

### Node.js Implementation

```javascript
class FetchProxyDispatcher {
  constructor(proxyConfig) {
    this.proxyUrl = null;
    this.noProxy = [];
    this.auth = null;

    if (
      proxyConfig === false ||
      proxyConfig === null ||
      proxyConfig === undefined
    ) {
      proxyLogger.debug("Proxy disabled");
      return;
    }

    if (typeof proxyConfig === "string") {
      this.proxyUrl = proxyConfig;
      proxyLogger.info(`Proxy configured: ${proxyConfig}`);
    } else if (typeof proxyConfig === "object") {
      this.proxyUrl = proxyConfig.url || null;
      this.noProxy = proxyConfig.no_proxy || [];
      this.auth = proxyConfig.auth || null;
      proxyLogger.info(`Proxy configured: ${this.proxyUrl}`);
    }
  }

  shouldBypass(url) {
    if (!this.proxyUrl) return true;

    const parsed = new URL(url);
    const host = parsed.hostname || "";

    for (const pattern of this.noProxy) {
      if (pattern.startsWith("*.")) {
        const domain = pattern.slice(2);
        if (host.endsWith(domain)) {
          proxyLogger.debug(`Bypassing proxy for ${host}`);
          return true;
        }
      } else if (host === pattern || host.endsWith(`.${pattern}`)) {
        proxyLogger.debug(`Bypassing proxy for ${host}`);
        return true;
      }
    }

    return false;
  }

  getProxyUrl(url) {
    if (this.shouldBypass(url)) return null;
    proxyLogger.debug(`Using proxy ${this.proxyUrl} for ${url}`);
    return this.proxyUrl;
  }

  getProxyAuth() {
    if (this.auth) {
      return {
        username: this.auth.username,
        password: this.auth.password,
      };
    }
    return null;
  }
}
```

---

## FetchClient

HTTP client implementing the `HttpClient` interface from `fetch_types`.

### Response Structure (FetchResponse)

```python
# Python TypedDict / JavaScript Object
{
    "ok": bool,                    # True if 2xx status
    "status": int,                 # HTTP status code
    "status_text": str,            # Status message
    "headers": dict[str, str],     # Response headers
    "data": Any,                   # Parsed response body
    "url": str,                    # Final URL (after redirects)
    "redirected": bool,            # True if redirected
    "diagnostics": list[dict],     # Request lifecycle events
}
```

### Health Check Response Structure

Both FastAPI and Fastify routes return identical response structures:

```json
{
    "healthy": true,
    "timestamp": "2026-01-06T21:34:28Z",
    "providers": {
        "gemini_openai": {
            "provider": "gemini_openai",
            "healthy": true,
            "status_code": 200,
            "latency_ms": 86,
            "error": null,
            "endpoint": "https://generativelanguage.googleapis.com/v1beta/openai/models",
            "model": "gemini-2.0-flash",
            "diagnostics": [
                {
                    "name": "request:start",
                    "timestamp": 1767735268.173,
                    "url": "https://generativelanguage.googleapis.com/v1beta/openai/models",
                    "method": "GET"
                },
                {
                    "name": "request:end",
                    "timestamp": 1767735268.259,
                    "duration": 0.086,
                    "status": 200
                }
            ]
        },
        "openai": {
            "provider": "openai",
            "healthy": true,
            "status_code": 200,
            "latency_ms": 630,
            "error": null,
            "endpoint": "https://api.openai.com/v1/models",
            "model": "gpt-4",
            "diagnostics": [...]
        }
    }
}
```

### Field Naming Convention

**IMPORTANT**: Use `snake_case` for all response fields in both Python and Node.js:

| Field       | Correct       | Incorrect    |
| ----------- | ------------- | ------------ |
| HTTP status | `status_code` | `statusCode` |
| Latency     | `latency_ms`  | `latencyMs`  |
| Base URL    | `base_url`    | `baseUrl`    |

### Diagnostics Events

```python
# request:start - Emitted when request begins
{
    "name": "request:start",
    "timestamp": 1767735268.173,    # Unix timestamp in seconds (float)
    "url": "https://api.example.com/models",
    "method": "GET"
}

# request:end - Emitted on successful response
{
    "name": "request:end",
    "timestamp": 1767735268.259,    # Unix timestamp in seconds (float)
    "duration": 0.086,              # Duration in seconds (float)
    "status": 200                   # HTTP status code
}

# request:error - Emitted on failure
{
    "name": "request:error",
    "timestamp": 1767735268.259,    # Unix timestamp in seconds (float)
    "duration": 0.086,              # Duration in seconds (float)
    "error": "Connection timeout"   # Error message
}
```

### Python Implementation

```python
import time
from typing import Any, Optional
import httpx  # or aiohttp

from fetch_types import FetchResponse, RequestOptions, DiagnosticsEvent

class FetchClient:
    """HTTP Client following fetch_types HttpClient interface."""

    def __init__(
        self,
        base_url: str,
        auth_config: FetchAuthConfig,
        proxy_dispatcher: FetchProxyDispatcher,
        timeout: float = 30.0,
        custom_headers: Optional[dict[str, str]] = None,
    ):
        self.base_url = base_url.rstrip("/")
        self.auth_config = auth_config
        self.proxy_dispatcher = proxy_dispatcher
        self.timeout = timeout
        self.custom_headers = custom_headers or {}

        base_logger.info(f"FetchClient initialized for {self.base_url}")

    def _build_headers(self) -> dict[str, str]:
        """Build complete request headers."""
        headers = {}
        headers.update(self.auth_config.build_auth_headers())
        headers.update(self.custom_headers)
        client_logger.debug(f"Built headers: {list(headers.keys())}")
        return headers

    async def request(self, options: RequestOptions) -> FetchResponse:
        """Make an HTTP request."""
        url = options.get("url", "")
        method = options.get("method", "GET")

        if not url.startswith("http"):
            url = f"{self.base_url}{url}"

        client_logger.info(f"Request: {method} {url}")

        diagnostics: list[DiagnosticsEvent] = []
        start_time = time.time()

        diagnostics.append({
            "name": "request:start",
            "timestamp": start_time,
            "url": url,
            "method": method,
        })

        headers = self._build_headers()
        headers.update(options.get("headers", {}))

        proxy_url = self.proxy_dispatcher.get_proxy_url(url)
        timeout = options.get("timeout", self.timeout)

        response: FetchResponse = {
            "ok": False,
            "status": 0,
            "status_text": "",
            "headers": {},
            "data": None,
            "url": url,
            "redirected": False,
            "diagnostics": diagnostics,
        }

        try:
            async with httpx.AsyncClient(
                timeout=timeout,
                proxy=proxy_url,
                follow_redirects=True,
            ) as client:
                http_response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    content=options.get("data"),
                    params=options.get("params"),
                )

                response["status"] = http_response.status_code
                response["status_text"] = http_response.reason_phrase or ""
                response["headers"] = dict(http_response.headers)
                response["ok"] = 200 <= http_response.status_code < 300
                response["redirected"] = len(http_response.history) > 0

                # Parse response
                content_type = http_response.headers.get("content-type", "")
                if "application/json" in content_type:
                    try:
                        response["data"] = http_response.json()
                    except Exception:
                        response["data"] = http_response.text
                else:
                    response["data"] = http_response.text

                duration = time.time() - start_time
                diagnostics.append({
                    "name": "request:end",
                    "timestamp": time.time(),
                    "duration": duration,
                    "status": http_response.status_code,
                })

                client_logger.info(f"Response: {http_response.status_code} in {duration*1000:.2f}ms")

        except Exception as e:
            client_logger.error(f"Request error: {e}")
            response["status_text"] = str(e)
            diagnostics.append({
                "name": "request:error",
                "timestamp": time.time(),
                "duration": time.time() - start_time,
                "error": str(e),
            })

        return response

    async def get(self, url: str, **options) -> FetchResponse:
        """HTTP GET request."""
        return await self.request({"url": url, "method": "GET", **options})

    async def post(self, url: str, data: Any = None, **options) -> FetchResponse:
        """HTTP POST request."""
        return await self.request({"url": url, "method": "POST", "data": data, **options})
```

### Node.js Implementation

```javascript
class FetchClient {
  constructor({
    baseUrl,
    authConfig,
    proxyDispatcher,
    timeout = 30000,
    customHeaders = {},
  }) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.authConfig = authConfig;
    this.proxyDispatcher = proxyDispatcher;
    this.timeout = timeout;
    this.customHeaders = customHeaders;

    baseLogger.info(`FetchClient initialized for ${this.baseUrl}`);
  }

  _buildHeaders() {
    const headers = {};
    Object.assign(headers, this.authConfig.buildAuthHeaders());
    Object.assign(headers, this.customHeaders);
    clientLogger.debug(`Built headers: ${Object.keys(headers).join(", ")}`);
    return headers;
  }

  async request(options) {
    let url = options.url || "";
    const method = options.method || "GET";

    if (!url.startsWith("http")) {
      url = `${this.baseUrl}${url}`;
    }

    clientLogger.info(`Request: ${method} ${url}`);

    const diagnostics = [];
    const startTime = Date.now();

    diagnostics.push({
      name: "request:start",
      timestamp: startTime,
      url,
      method,
    });

    const headers = this._buildHeaders();
    Object.assign(headers, options.headers || {});

    const proxyUrl = this.proxyDispatcher.getProxyUrl(url);
    const timeout = options.timeout || this.timeout;

    const response = {
      ok: false,
      status: 0,
      statusText: "",
      headers: {},
      data: null,
      url,
      redirected: false,
      diagnostics,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const fetchOptions = {
        method,
        headers,
        signal: controller.signal,
        redirect: "follow",
      };

      if (options.data && ["POST", "PUT", "PATCH"].includes(method)) {
        fetchOptions.body =
          typeof options.data === "object"
            ? JSON.stringify(options.data)
            : options.data;
      }

      const httpResponse = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      response.status = httpResponse.status;
      response.statusText = httpResponse.statusText || "";
      response.headers = Object.fromEntries(httpResponse.headers.entries());
      response.ok = httpResponse.ok;
      response.redirected = httpResponse.redirected;

      const contentType = httpResponse.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          response.data = await httpResponse.json();
        } catch {
          response.data = await httpResponse.text();
        }
      } else {
        response.data = await httpResponse.text();
      }

      const duration = Date.now() - startTime;
      diagnostics.push({
        name: "request:end",
        timestamp: Date.now(),
        duration,
        status: httpResponse.status,
      });

      clientLogger.info(`Response: ${httpResponse.status} in ${duration}ms`);
    } catch (err) {
      clientLogger.error(`Request error: ${err.message}`);
      response.statusText = err.message;
      diagnostics.push({
        name: "request:error",
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        error: err.message,
      });
    }

    return response;
  }

  async get(url, options = {}) {
    return this.request({ url, method: "GET", ...options });
  }

  async post(url, data = null, options = {}) {
    return this.request({ url, method: "POST", data, ...options });
  }
}
```

---

## Factory Pattern

### Standard: Create Client from Provider Config

**Python:**

```python
def create_client_from_config(provider_config: dict) -> FetchClient:
    """Factory function to create a FetchClient from provider configuration."""
    base_logger.info("Creating FetchClient from config")

    base_url = provider_config.get("base_url", "")
    proxy_config = provider_config.get("proxy_url")
    custom_headers = provider_config.get("headers", {})

    client_config = provider_config.get("client", {})
    timeout = client_config.get("timeout_seconds", 30.0)

    auth_config = FetchAuthConfig(provider_config)
    proxy_dispatcher = FetchProxyDispatcher(proxy_config)

    return FetchClient(
        base_url=base_url,
        auth_config=auth_config,
        proxy_dispatcher=proxy_dispatcher,
        timeout=timeout,
        custom_headers=custom_headers,
    )
```

**Node.js:**

```javascript
function createClientFromConfig(providerConfig) {
  baseLogger.info("Creating FetchClient from config");

  const baseUrl = providerConfig.base_url || "";
  const proxyConfig = providerConfig.proxy_url;
  const customHeaders = providerConfig.headers || {};

  const clientConfig = providerConfig.client || {};
  const timeout = clientConfig.timeout_ms || 30000;

  const authConfig = new FetchAuthConfig(providerConfig);
  const proxyDispatcher = new FetchProxyDispatcher(proxyConfig);

  return new FetchClient({
    baseUrl,
    authConfig,
    proxyDispatcher,
    timeout,
    customHeaders,
  });
}
```

---

## Health Check Implementation

### Standard: Check Provider Health Function

**Python:**

```python
async def check_provider_health(provider_name: str, provider_config: dict) -> dict:
    """Check health of a provider using the FetchClient."""
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

    try:
        client = create_client_from_config(provider_config)
        response = await client.get(health_endpoint)

        result["status_code"] = response["status"]
        result["healthy"] = response["ok"]
        result["latency_ms"] = round((time.time() - start_time) * 1000, 2)
        result["diagnostics"] = response.get("diagnostics", [])

        if not response["ok"]:
            error_data = response.get("data")
            if isinstance(error_data, dict):
                result["error"] = error_data.get("error", {}).get("message", response["status_text"])
            else:
                result["error"] = response["status_text"] or f"HTTP {response['status']}"

    except Exception as e:
        client_logger.error(f"Health check failed for {provider_name}: {e}")
        result["error"] = str(e)
        result["latency_ms"] = round((time.time() - start_time) * 1000, 2)

    return result
```

**Node.js:**

```javascript
async function checkProviderHealth(providerName, providerConfig) {
  baseLogger.info(`Checking health for provider: ${providerName}`);
  const startTime = Date.now() / 1000; // Unix timestamp in seconds

  const result = {
    provider: providerName,
    healthy: false,
    status_code: null, // snake_case for polyglot consistency
    latency_ms: null, // snake_case for polyglot consistency
    error: null,
    endpoint: null,
    model: providerConfig.model || null,
    diagnostics: [],
  };

  const healthEndpoint = providerConfig.health_endpoint || "/models";
  const baseUrl = providerConfig.base_url || "";
  const fullUrl = `${baseUrl.replace(/\/$/, "")}${healthEndpoint}`;
  result.endpoint = fullUrl;

  // Add request:start diagnostic
  result.diagnostics.push({
    name: "request:start",
    timestamp: startTime,
    url: fullUrl,
    method: "GET",
  });

  try {
    const client = createClientFromConfig(providerConfig);
    const response = await client.get(healthEndpoint);

    const endTime = Date.now() / 1000;
    const duration = endTime - startTime;

    result.status_code = response.status;
    result.healthy = response.ok;
    result.latency_ms = Math.round(duration * 1000 * 100) / 100;

    // Add request:end diagnostic
    result.diagnostics.push({
      name: "request:end",
      timestamp: endTime,
      duration: duration,
      status: response.status,
    });

    if (!response.ok) {
      const errorData = response.data;
      if (errorData && typeof errorData === "object") {
        result.error = errorData.error?.message || response.statusText;
      } else {
        result.error = response.statusText || `HTTP ${response.status}`;
      }
    }
  } catch (err) {
    const endTime = Date.now() / 1000;
    const duration = endTime - startTime;

    clientLogger.error(
      `Health check failed for ${providerName}: ${err.message}`
    );
    result.error = err.message;
    result.latency_ms = Math.round(duration * 1000 * 100) / 100;

    // Add request:error diagnostic
    result.diagnostics.push({
      name: "request:error",
      timestamp: endTime,
      duration: duration,
      error: err.message,
    });
  }

  return result;
}
```

---

## Route Mounting

### Route Path Convention

All health check routes follow this pattern:

```
/healthz/admin/integration/{integration-name}
/healthz/admin/integration/{integration-name}/{provider}
/healthz/admin/integration/{integration-name}/config
```

Example for gemini-openai integration:

- `/healthz/admin/integration/gemini-openai` - Check both providers
- `/healthz/admin/integration/gemini-openai/gemini` - Check Gemini only
- `/healthz/admin/integration/gemini-openai/openai` - Check OpenAI only
- `/healthz/admin/integration/gemini-openai/config` - View sanitized config

### Timestamp Format

Use ISO 8601 format without milliseconds for consistency:

```javascript
// Node.js
function formatTimestamp() {
    return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}
// Result: "2026-01-06T21:34:28Z"

# Python
import time
timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
# Result: "2026-01-06T21:34:28Z"
```

### Standard: Mount Function Pattern

**Python (FastAPI):**

```python
from fastapi import FastAPI, Request
from app_yaml_static_config import AppYamlConfig

def mount(app: FastAPI):
    """Mount provider health check routes."""

    @app.get("/healthz/admin/integration/{provider_name}")
    async def healthz_provider(request: Request, provider_name: str):
        """Health check for a specific provider."""
        try:
            config = AppYamlConfig.get_instance()
            providers_config = config.get("providers", {})
            provider_config = providers_config.get(provider_name, {})

            if not provider_config:
                return {
                    "healthy": False,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "error": f"Provider '{provider_name}' not configured",
                }

            result = await check_provider_health(provider_name, provider_config)
            result["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            return result

        except Exception as e:
            return {"healthy": False, "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "error": str(e)}

    @app.get("/healthz/admin/integration/{provider_name}/config")
    async def healthz_provider_config(request: Request, provider_name: str):
        """Return sanitized provider configuration."""
        try:
            config = AppYamlConfig.get_instance()
            providers_config = config.get("providers", {})
            provider_config = providers_config.get(provider_name, {})

            # Sanitize sensitive fields
            sanitized = dict(provider_config)
            if "endpoint_api_key" in sanitized:
                sanitized["endpoint_api_key"] = "***"

            return {"initialized": True, "config": sanitized}

        except Exception as e:
            return {"initialized": False, "error": str(e)}
```

**Node.js (Fastify):**

```javascript
import { AppYamlConfig } from "app-yaml-static-config";

function formatTimestamp() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

export async function mount(server) {
  server.get(
    "/healthz/admin/integration/:providerName",
    async (request, reply) => {
      const { providerName } = request.params;

      try {
        const config = AppYamlConfig.getInstance();
        const providersConfig = config.get("providers") || {};
        const providerConfig = providersConfig[providerName] || {};

        if (Object.keys(providerConfig).length === 0) {
          return {
            healthy: false,
            timestamp: formatTimestamp(),
            error: `Provider '${providerName}' not configured`,
          };
        }

        const result = await checkProviderHealth(providerName, providerConfig);
        result.timestamp = formatTimestamp();
        return result;
      } catch (err) {
        return {
          healthy: false,
          timestamp: formatTimestamp(),
          error: err.message,
        };
      }
    }
  );

  server.get(
    "/healthz/admin/integration/:providerName/config",
    async (request, reply) => {
      const { providerName } = request.params;

      try {
        const config = AppYamlConfig.getInstance();
        const providersConfig = config.get("providers") || {};
        const providerConfig = providersConfig[providerName] || {};

        const sanitized = { ...providerConfig };
        if (sanitized.endpoint_api_key) {
          sanitized.endpoint_api_key = "***";
        }

        return { initialized: true, config: sanitized };
      } catch (err) {
        return { initialized: false, error: err.message };
      }
    }
  );
}
```

---

## Complete Examples

### Example 1: Adding a New Provider Health Check

**Step 1: Add provider config to YAML**

```yaml
# server.dev.yaml
providers:
  my_new_provider:
    base_url: "https://api.newprovider.com/v1"
    health_endpoint: "/health"
    endpoint_auth_type: "bearer"
    overwrite_from_env:
      endpoint_api_key: "NEW_PROVIDER_API_KEY"
    client:
      timeout_seconds: 15.0
      timeout_ms: 15000
```

**Step 2: Create route file**

Route files must follow the naming pattern: `healthz_integration_{name}_route.py` (Python) or `healthz_integration_{name}_route.mjs` (Node.js).

```python
# routes/healthz_integration_my_new_provider_route.py

from fastapi import FastAPI, Request
from app_yaml_static_config import AppYamlConfig

# Import all fetch packages (see full implementation above)
# ... imports and class definitions ...

def mount(app: FastAPI):
    @app.get("/healthz/admin/integration/my-new-provider")
    async def healthz_my_new_provider(request: Request):
        config = AppYamlConfig.get_instance()
        provider_config = config.get("providers", {}).get("my_new_provider", {})

        if not provider_config:
            return {
                "healthy": False,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "error": "Provider not configured"
            }

        result = await check_provider_health("my_new_provider", provider_config)
        result["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        return result
```

### Example 2: Multi-Provider Health Check (gemini-openai)

This is the actual implementation pattern used for the gemini-openai integration:

```python
@app.get("/healthz/admin/integration/gemini-openai")
async def healthz_gemini_openai(request: Request):
    """Check health of Gemini OpenAI and OpenAI providers."""
    config = AppYamlConfig.get_instance()
    providers_config = config.get("providers", {})

    results = {
        "healthy": True,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "providers": {},
    }

    # Check Gemini OpenAI
    gemini_config = providers_config.get("gemini_openai", {})
    if gemini_config:
        gemini_result = await check_provider_health("gemini_openai", gemini_config)
        results["providers"]["gemini_openai"] = gemini_result
        if not gemini_result["healthy"]:
            results["healthy"] = False
    else:
        results["providers"]["gemini_openai"] = {"healthy": False, "error": "Provider not configured"}
        results["healthy"] = False

    # Check OpenAI
    openai_config = providers_config.get("openai", {})
    if openai_config:
        openai_result = await check_provider_health("openai", openai_config)
        results["providers"]["openai"] = openai_result
        if not openai_result["healthy"]:
            results["healthy"] = False
    else:
        results["providers"]["openai"] = {"healthy": False, "error": "Provider not configured"}
        results["healthy"] = False

    return results

@app.get("/healthz/admin/integration/gemini-openai/gemini")
async def healthz_gemini_only(request: Request):
    """Check health of Gemini OpenAI provider only."""
    config = AppYamlConfig.get_instance()
    gemini_config = config.get("providers", {}).get("gemini_openai", {})

    if not gemini_config:
        return {
            "healthy": False,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "error": "gemini_openai provider not configured"
        }

    result = await check_provider_health("gemini_openai", gemini_config)
    result["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    return result
```

---

## Summary

### Polyglot Consistency Checklist

When implementing health checks across FastAPI and Fastify:

| Requirement            | Standard                                                       |
| ---------------------- | -------------------------------------------------------------- |
| **Field naming**       | Always use `snake_case` (`status_code`, `latency_ms`)          |
| **Timestamp format**   | ISO 8601 without ms: `2026-01-06T21:34:28Z`                    |
| **Diagnostics array**  | Include `request:start`, `request:end`, `request:error` events |
| **Route path**         | `/healthz/admin/integration/{integration-name}`                |
| **File naming**        | `healthz_integration_{name}_route.py` / `_route.mjs`           |
| **Response structure** | Identical JSON structure between Python and Node.js            |

### Implementation Reference

| Aspect                  | Python (FastAPI)                                     | Node.js (Fastify)                                    |
| ----------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| **HTTP Client**         | `httpx.AsyncClient`                                  | Native `fetch`                                       |
| **Logger Factory**      | `logger.create(pkg, file)`                           | `logger.create(pkg, file)`                           |
| **Config Access**       | `AppYamlConfig.get_instance()`                       | `AppYamlConfig.getInstance()`                        |
| **Timeout Config**      | `client.timeout_seconds`                             | `client.timeout_ms`                                  |
| **Route Pattern**       | `@app.get("/path")`                                  | `server.get('/path', handler)`                       |
| **Mount Pattern**       | `def mount(app: FastAPI)`                            | `export async function mount(server)`                |
| **Timestamp**           | `time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())` | `new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')` |
| **Unix time (seconds)** | `time.time()`                                        | `Date.now() / 1000`                                  |

### Live Endpoints

After implementation, verify both servers return identical structures:

```bash
# Fastify (port 51000)
curl http://localhost:51000/healthz/admin/integration/gemini-openai

# FastAPI (port 52000)
curl http://localhost:52000/healthz/admin/integration/gemini-openai
```

Both should return matching JSON with `providers.gemini_openai` and `providers.openai` containing `status_code`, `latency_ms`, and `diagnostics` arrays.
