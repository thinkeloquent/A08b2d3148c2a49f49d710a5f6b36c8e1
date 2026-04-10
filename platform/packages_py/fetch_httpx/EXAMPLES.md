# fetch_httpx - Usage Examples

> **Version**: 1.0.0
> **Based On**: Implemented functionality in fetch_httpx package

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [HTTP Methods](#2-http-methods)
3. [Authentication](#3-authentication)
4. [Configuration](#4-configuration)
5. [Transport & Routing](#5-transport--routing)
6. [TLS/SSL & Security](#6-tlsssl--security)
7. [Error Handling](#7-error-handling)
8. [Retry & Circuit Breaker](#8-retry--circuit-breaker)
9. [Advanced Features](#9-advanced-features)
10. [SDK Integration](#10-sdk-integration)
11. [FastAPI Integration](#11-fastapi-integration)

---

## 1. Quick Start

### Installation

```bash
cd /Users/Shared/autoload/mta-v800/packages_py/fetch_httpx
make install
```

### Basic Usage

```python
from fetch_httpx import AsyncClient, Client

# Async usage
async with AsyncClient() as client:
    response = await client.get("https://api.example.com/users")
    data = response.json()

# Sync usage
with Client() as client:
    response = client.get("https://api.example.com/users")
    data = response.json()
```

### Convenience Functions

```python
from fetch_httpx import get, post, put, delete

# One-liner requests (creates temporary client)
response = get("https://api.example.com/data")
response = post("https://api.example.com/data", json={"key": "value"})
```

---

## 2. HTTP Methods

### GET Request with Query Parameters

```python
from fetch_httpx import AsyncClient

async with AsyncClient() as client:
    response = await client.get(
        "https://api.example.com/posts",
        params={"page": "1", "limit": "10"},
        headers={"Accept": "application/json"},
    )

    print(f"Status: {response.status_code}")
    print(f"Posts: {response.json()}")
```

### POST Request with JSON Body

```python
async with AsyncClient() as client:
    response = await client.post(
        "https://api.example.com/users",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "role": "admin",
        },
        headers={"X-Custom-Header": "value"},
    )

    print(f"Created: {response.json()}")
```

### PUT Request (Full Update)

```python
async with AsyncClient() as client:
    response = await client.put(
        "https://api.example.com/users/123",
        json={
            "id": 123,
            "name": "Jane Doe",
            "email": "jane@example.com",
        },
    )
```

### PATCH Request (Partial Update)

```python
async with AsyncClient() as client:
    response = await client.patch(
        "https://api.example.com/users/123",
        json={"name": "Updated Name"},
    )
```

### DELETE Request

```python
async with AsyncClient() as client:
    response = await client.delete("https://api.example.com/users/123")
    print(f"Deleted: {response.status_code == 204}")
```

### HEAD Request (Metadata Only)

```python
async with AsyncClient() as client:
    response = await client.head("https://api.example.com/files/report.pdf")
    print(f"Content-Length: {response.headers.get('content-length')}")
    print(f"Last-Modified: {response.headers.get('last-modified')}")
```

### OPTIONS Request (CORS Preflight)

```python
async with AsyncClient() as client:
    response = await client.options(
        "https://api.example.com/cors-endpoint",
        headers={
            "Origin": "https://myapp.example.com",
            "Access-Control-Request-Method": "POST",
        },
    )
    print(f"Allowed Methods: {response.headers.get('access-control-allow-methods')}")
```

---

## 3. Authentication

### Basic Authentication

```python
from fetch_httpx import AsyncClient, BasicAuth

# Method 1: Tuple shorthand
async with AsyncClient(auth=("*****", "*****")) as client:
    response = await client.get("https://api.example.com/protected")

# Method 2: BasicAuth class
auth = BasicAuth(username="*****", password="*****")
async with AsyncClient(auth=auth) as client:
    response = await client.get("https://api.example.com/protected")
```

### Bearer Token Authentication

```python
from fetch_httpx import AsyncClient, BearerAuth

access_token = "*****..."
auth = BearerAuth(token=access_token)

async with AsyncClient(auth=auth) as client:
    response = await client.get("https://api.example.com/me")
```

### Digest Authentication

```python
from fetch_httpx import AsyncClient, DigestAuth

auth = DigestAuth(username="*****", password="*****")

async with AsyncClient(auth=auth) as client:
    # DigestAuth handles the challenge-response flow automatically
    response = await client.get("https://api.example.com/digest-protected")
```

### Per-Request Authentication Override

```python
async with AsyncClient(auth=("default", "*****")) as client:
    # Use client default auth
    response = await client.get("https://api.example.com/resource1")

    # Override with different auth for specific request
    response = await client.get(
        "https://api.example.com/resource2",
        auth=("other", "*****"),
    )
```

---

## 4. Configuration

### Granular Timeout Configuration

```python
from fetch_httpx import AsyncClient, Timeout

# Single value (applies to all phases)
timeout = Timeout(30.0)

# Granular configuration
timeout = Timeout(
    connect=5.0,   # Connection establishment timeout
    read=30.0,     # Response body reading timeout
    write=10.0,    # Request body sending timeout
    pool=5.0,      # Waiting for connection from pool
)

async with AsyncClient(timeout=timeout) as client:
    response = await client.get("https://api.example.com/slow-endpoint")

# Disable timeouts (use with caution)
async with AsyncClient(timeout=Timeout(None)) as client:
    response = await client.get("https://api.example.com/very-slow")

# Per-request timeout override
async with AsyncClient(timeout=Timeout(30.0)) as client:
    response = await client.get(
        "https://api.example.com/endpoint",
        timeout=Timeout(5.0),  # Override for this request only
    )
```

### Connection Pool Limits

```python
from fetch_httpx import AsyncClient, Limits

limits = Limits(
    max_connections=100,           # Maximum total connections
    max_keepalive_connections=20,  # Maximum idle connections to keep
    keepalive_expiry=30.0,         # Seconds before idle connection expires
)

async with AsyncClient(limits=limits) as client:
    # Make many parallel requests efficiently
    tasks = [client.get(f"https://api.example.com/items/{i}") for i in range(50)]
    responses = await asyncio.gather(*tasks)
```

### Base URL Configuration

```python
async with AsyncClient(base_url="https://api.example.com/v1") as client:
    # Paths are joined with base URL
    users = await client.get("/users")       # https://api.example.com/v1/users
    posts = await client.get("/posts")       # https://api.example.com/v1/posts
    item = await client.get("/items/123")    # https://api.example.com/v1/items/123
```

### Default Headers and Cookies

```python
async with AsyncClient(
    headers={
        "User-Agent": "MyApp/1.0",
        "Accept": "application/json",
        "X-API-Version": "2024-01",
    },
    cookies={
        "session_id": "abc123",
        "tracking": "disabled",
    },
) as client:
    # All requests include these headers and cookies
    response = await client.get("https://api.example.com/data")
```

### Redirect Handling

```python
# Don't follow redirects (default)
async with AsyncClient(follow_redirects=False) as client:
    response = await client.get("https://api.example.com/redirect")
    print(f"Status: {response.status_code}")  # 301, 302, etc.
    print(f"Location: {response.headers.get('location')}")

# Follow redirects with limit
async with AsyncClient(follow_redirects=True, max_redirects=10) as client:
    response = await client.get("https://api.example.com/redirect")
    print(f"Final URL: {response.url}")
    print(f"Redirect history: {len(response.history)} hops")
```

---

## 5. Transport & Routing

### Transport Mounts (Multi-Service Routing)

```python
from fetch_httpx import AsyncClient, AsyncHTTPTransport, Timeout, Limits

# Create service-specific transports
mounts = {
    # Internal API with mTLS and retries
    "https://api.internal.corp/": AsyncHTTPTransport(
        cert=("/path/to/cert.pem", "/path/to/key.pem"),
        retries=5,
        timeout=Timeout(connect=2.0, read=60.0),
    ),

    # External API with HTTP/2
    "https://api.external.com/": AsyncHTTPTransport(
        http2=True,
        retries=2,
        limits=Limits(max_connections=50),
    ),

    # Legacy service without HTTP/2
    "https://legacy.example.com/": AsyncHTTPTransport(
        http1=True,
        http2=False,
        verify=False,  # Self-signed cert (testing only)
    ),

    # Slow batch service with many retries
    "https://batch.example.com/": AsyncHTTPTransport(
        retries=10,
        timeout=Timeout(read=300.0),
    ),

    # Default for all HTTPS
    "https://": AsyncHTTPTransport(
        http2=True,
        verify=True,
    ),

    # Fallback for everything else
    "all://": AsyncHTTPTransport(),
}

async with AsyncClient(mounts=mounts) as client:
    # Requests are routed to appropriate transport based on URL pattern
    internal = await client.get("https://api.internal.corp/users")    # Uses mTLS transport
    external = await client.get("https://api.external.com/data")      # Uses HTTP/2 transport
    legacy = await client.get("https://legacy.example.com/old-api")   # Uses legacy transport
    other = await client.get("https://random-api.com/endpoint")       # Uses default HTTPS transport
```

### Custom Transport Configuration

```python
from fetch_httpx import AsyncHTTPTransport, Limits

transport = AsyncHTTPTransport(
    # Protocol settings
    http1=True,                  # Enable HTTP/1.1
    http2=True,                  # Enable HTTP/2

    # TLS settings
    verify=True,                 # Verify SSL certificates
    cert=None,                   # Client certificate for mTLS

    # Connection settings
    limits=Limits(
        max_connections=100,
        max_keepalive_connections=20,
        keepalive_expiry=30.0,
    ),

    # Reliability
    retries=3,                   # Automatic retries on connection errors

    # Timeout
    timeout=Timeout(30.0),

    # Network binding
    local_address="10.0.0.50",   # Bind to specific interface
    uds="/var/run/app.sock",     # Unix domain socket
)
```

---

## 6. TLS/SSL & Security

### Basic TLS Verification

```python
# Enable TLS verification (default)
async with AsyncClient(verify=True) as client:
    response = await client.get("https://secure-api.example.com")

# Disable verification (INSECURE - testing only)
async with AsyncClient(verify=False) as client:
    response = await client.get("https://self-signed.example.com")
```

### Custom CA Bundle

```python
# Use custom CA certificate bundle
async with AsyncClient(verify="/path/to/ca-bundle.pem") as client:
    response = await client.get("https://private-api.example.com")
```

### mTLS (Mutual TLS) with Client Certificates

```python
# Combined PEM file
async with AsyncClient(
    cert="/path/to/combined.pem",
    verify=True,
) as client:
    response = await client.get("https://mtls-api.example.com")

# Separate cert and key files
async with AsyncClient(
    cert=("/path/to/client.crt", "/path/to/client.key"),
    verify=True,
) as client:
    response = await client.get("https://mtls-api.example.com")

# With encrypted private key
async with AsyncClient(
    cert=("/path/to/client.crt", "/path/to/client.key", "key_password"),
    verify=True,
) as client:
    response = await client.get("https://mtls-api.example.com")
```

### SSL Context Builder

```python
from fetch_httpx import SSLContextBuilder
import ssl

# Build custom SSL context
context = (
    SSLContextBuilder()
    .with_ca_bundle("/path/to/ca-bundle.pem")
    .with_client_cert("/path/to/cert.pem", "/path/to/key.pem")
    .with_minimum_version(ssl.TLSVersion.TLSv1_2)
    .build()
)

async with AsyncClient(verify=context) as client:
    response = await client.get("https://strict-tls.example.com")
```

### Proxy Configuration

```python
from fetch_httpx import Proxy

# Simple proxy
proxy = Proxy("http://proxy.example.com:8080")

# Proxy with authentication
proxy = Proxy(
    url="http://proxy.example.com:8080",
    auth=("proxy_user", "proxy_pass"),
)

# Proxy with custom headers
proxy = Proxy(
    url="http://proxy.example.com:8080",
    headers={"Proxy-Authorization": "Bearer token"},
)

# Use in transport
transport = AsyncHTTPTransport(proxy=proxy)
```

---

## 7. Error Handling

### Exception Hierarchy

```python
from fetch_httpx import (
    HTTPError,           # Base exception
    HTTPStatusError,     # 4xx/5xx responses
    TimeoutException,    # All timeouts
    ConnectTimeout,      # Connection timeout
    ReadTimeout,         # Read timeout
    WriteTimeout,        # Write timeout
    PoolTimeout,         # Pool timeout
    NetworkError,        # Network errors
    ConnectError,        # Connection failed
    TooManyRedirects,    # Redirect limit exceeded
    InvalidURL,          # Malformed URL
)
```

### Handling HTTP Status Errors

```python
from fetch_httpx import AsyncClient, HTTPStatusError

async with AsyncClient() as client:
    response = await client.get("https://api.example.com/users/999")

    try:
        response.raise_for_status()
    except HTTPStatusError as e:
        print(f"Status: {e.response.status_code}")
        print(f"URL: {e.request.url}")

        if e.response.is_client_error:
            print("Client error (4xx)")
        elif e.response.is_server_error:
            print("Server error (5xx)")
```

### Handling Timeout Errors

```python
from fetch_httpx import AsyncClient, Timeout, TimeoutException, ConnectTimeout, ReadTimeout

async with AsyncClient(timeout=Timeout(5.0)) as client:
    try:
        response = await client.get("https://slow-api.example.com/data")
    except ConnectTimeout:
        print("Could not establish connection in time")
    except ReadTimeout:
        print("Server took too long to respond")
    except TimeoutException:
        print("Request timed out")
```

### Comprehensive Error Handling

```python
from fetch_httpx import (
    AsyncClient,
    HTTPError,
    HTTPStatusError,
    TimeoutException,
    NetworkError,
    TooManyRedirects,
)

async with AsyncClient() as client:
    try:
        response = await client.get("https://api.example.com/data")
        response.raise_for_status()
        data = response.json()

    except HTTPStatusError as e:
        if e.response.status_code == 404:
            print("Resource not found")
        elif e.response.status_code == 401:
            print("Authentication required")
        elif e.response.status_code >= 500:
            print("Server error - try again later")

    except TimeoutException:
        print("Request timed out")

    except NetworkError:
        print("Network error - check connection")

    except TooManyRedirects:
        print("Too many redirects")

    except HTTPError as e:
        print(f"HTTP error: {e}")
```

### Response Status Helpers

```python
response = await client.get("https://api.example.com/status")

# Status category checks
response.is_informational  # 1xx
response.is_success        # 2xx
response.is_redirect       # 3xx
response.is_client_error   # 4xx
response.is_server_error   # 5xx
response.is_error          # 4xx or 5xx

# Get reason phrase
response.reason_phrase     # "OK", "Not Found", etc.
```

---

## 8. Retry & Circuit Breaker

### Retry Configuration with Exponential Backoff + Jitter

```python
from fetch_httpx import AsyncClient, RetryConfig, JitterStrategy, Timeout

async with AsyncClient(
    base_url="https://api.example.com",
    timeout=Timeout(connect=10.0, read=60.0),
    retry=RetryConfig(
        max_retries=5,              # Maximum retry attempts
        retry_delay=0.5,            # Initial delay: 500ms
        retry_backoff=2.0,          # Multiplier: 2x (0.5s → 1s → 2s → 4s → 8s)
        max_retry_delay=30.0,       # Cap delay at 30 seconds
        jitter=JitterStrategy.FULL, # Randomize to prevent thundering herd
        retry_on_status=[429, 500, 502, 503, 504],  # Transient errors only
        retry_on_exception=True,    # Retry on connection/timeout errors
        respect_retry_after_header=True,   # Honor Retry-After header
    ),
) as client:
    response = await client.get("/data")
```

### Jitter Strategies

```python
from fetch_httpx import JitterStrategy

# No jitter: delay = base * (backoff ^ attempt)
JitterStrategy.NONE

# Full jitter (recommended): delay = random(0, calculated_delay)
JitterStrategy.FULL

# Equal jitter: delay = calculated_delay/2 + random(0, calculated_delay/2)
JitterStrategy.EQUAL

# Decorrelated jitter: delay = random(base, previous_delay * 3)
JitterStrategy.DECORRELATED
```

### Circuit Breaker

```python
from fetch_httpx import AsyncClient, RetryConfig, CircuitBreakerConfig

async with AsyncClient(
    base_url="https://api.example.com",
    retry=RetryConfig(max_retries=3),
    circuit_breaker=CircuitBreakerConfig(
        failure_threshold=5,    # Open circuit after 5 consecutive failures
        success_threshold=2,    # Close circuit after 2 successes in half-open
        timeout=30.0,           # Try half-open after 30 seconds
        enabled=True,
    ),
) as client:
    try:
        response = await client.get("/data")
    except CircuitOpenError:
        print("Circuit is open - service is unhealthy")
```

### Circuit Breaker States

```python
from fetch_httpx import CircuitState

# Normal operation - requests allowed, failures tracked
CircuitState.CLOSED

# Circuit tripped - requests blocked immediately
CircuitState.OPEN

# Testing recovery - limited requests allowed
CircuitState.HALF_OPEN
```

### Idempotency-Aware Retry

```python
from fetch_httpx import AsyncClient, RetryConfig

async with AsyncClient(
    retry=RetryConfig(max_retries=3),
) as client:
    # GET, HEAD, PUT, DELETE - automatically retried (idempotent)
    await client.get("/users/123")
    await client.delete("/users/123")

    # POST, PATCH - NOT retried by default (non-idempotent)
    await client.post("/orders", json={"item": "widget"})

    # POST with Idempotency-Key header - WILL be retried
    await client.post(
        "/orders",
        json={"item": "widget"},
        headers={"Idempotency-Key": "unique-order-123"},
    )
```

### OpenAI/LLM API Client

```python
from fetch_httpx import (
    AsyncClient,
    AsyncHTTPTransport,
    RetryConfig,
    JitterStrategy,
    CircuitBreakerConfig,
    Limits,
    Timeout,
    BearerAuth,
)

# Transport with connection pooling
transport = AsyncHTTPTransport(
    limits=Limits(
        max_connections=50,
        max_keepalive_connections=10,
        keepalive_expiry=30.0,  # Keep connections alive for reuse
    ),
)

# Client optimized for LLM APIs
async with AsyncClient(
    base_url="https://api.openai.com/v1",
    transport=transport,
    auth=BearerAuth("sk-your-api-key"),
    headers={"Content-Type": "application/json"},
    timeout=Timeout(
        connect=10.0,   # Connection establishment
        read=120.0,     # LLM responses can be slow
        write=30.0,     # Sending request
        pool=10.0,      # Waiting for connection
    ),
    retry=RetryConfig(
        max_retries=5,
        retry_delay=0.5,
        retry_backoff=2.0,
        max_retry_delay=30.0,
        jitter=JitterStrategy.FULL,
        retry_on_status=[429, 500, 502, 503, 504],
        respect_retry_after_header=True,
    ),
    circuit_breaker=CircuitBreakerConfig(
        failure_threshold=5,
        timeout=30.0,
    ),
) as client:
    response = await client.post(
        "/chat/completions",
        json={
            "model": "gpt-4",
            "messages": [{"role": "*****", "content": "Hello!"}],
            "max_tokens": 1000,
        },
    )
    print(response.json())
```

### Accessing Circuit Breaker State

```python
async with AsyncClient(
    circuit_breaker=CircuitBreakerConfig(failure_threshold=5),
) as client:
    # Check circuit breaker state
    if client.circuit_breaker:
        print(f"State: {client.circuit_breaker.state.value}")
        print(f"Is Open: {client.circuit_breaker.is_open}")

        # Manually reset if needed
        client.circuit_breaker.reset()
```

---

## 9. Advanced Features

### Event Hooks (Logging/Monitoring)

```python
from fetch_httpx import AsyncClient, Request, Response

async def log_request(request: Request) -> None:
    print(f">>> {request.method} {request.url}")
    print(f">>> Headers: {dict(request.headers.items())}")

async def log_response(response: Response) -> None:
    print(f"<<< {response.status_code}")
    print(f"<<< Content-Length: {len(response.content)}")

async with AsyncClient(
    event_hooks={
        "request": [log_request],
        "response": [log_response],
    }
) as client:
    response = await client.get("https://api.example.com/data")
```

### URL Class

```python
from fetch_httpx import URL

# Parse URL
url = URL("https://api.example.com:8443/v1/users?page=1&limit=10#section")

print(url.scheme)    # "https"
print(url.host)      # "api.example.com"
print(url.port)      # 8443
print(url.path)      # "/v1/users"
print(url.query)     # "page=1&limit=10"
print(url.fragment)  # "section"
print(url.params)    # {"page": ["1"], "limit": ["10"]}

# Create modified copy
new_url = url.copy_with(path="/v2/users", query="page=2")

# Join URLs (RFC 3986)
base = URL("https://api.example.com/v1/")
joined = base.join("users/123")  # https://api.example.com/v1/users/123
```

### Headers Class

```python
from fetch_httpx import Headers

# Create headers
headers = Headers({
    "Content-Type": "application/json",
    "Authorization": "Bearer token",
})

# Case-insensitive access
headers.get("content-type")      # "application/json"
headers.get("CONTENT-TYPE")      # "application/json"
"authorization" in headers       # True

# Multiple values
headers = Headers([
    ("Accept", "application/json"),
    ("Accept", "text/html"),
])
headers.get_list("Accept")       # ["application/json", "text/html"]

# Modify headers
headers.set("X-Custom", "value")  # Replace
headers.add("Accept", "text/xml") # Append
headers.remove("X-Custom")        # Remove all with key
```

### Logger Configuration

```python
from fetch_httpx.logger import Logger, LogLevel, create

# Create logger with custom settings
logger = create(
    package_name="my_app",
    filename=__file__,
    level=LogLevel.DEBUG,
)

# Log at different levels
logger.trace("Trace message", context={"detail": "value"})
logger.debug("Debug message", context={"key": "value"})
logger.info("Info message")
logger.warn("Warning message")
logger.error("Error message", context={"error": "details"})

# Create child logger
child_logger = logger.child("submodule.py")

# Logger with correlation ID
correlated = logger.with_correlation_id("req-12345")
correlated.info("Processing request", context={"user_id": 42})
```

### Synchronous Client

```python
from fetch_httpx import Client

# Sync client for non-async code
with Client(
    base_url="https://api.example.com",
    timeout=30.0,
) as client:
    response = client.get("/users")
    print(response.json())

    response = client.post("/users", json={"name": "John"})
    print(response.status_code)
```

---

## 10. SDK Integration

### SDK Core (High-Level API Client)

```python
from fetch_httpx.sdk import SDK, SDKConfig, create_sdk

# Create SDK with configuration
config = SDKConfig(
    base_url="https://api.example.com/v1",
    auth=("api_key", "secret"),
    timeout=Timeout(30.0),
    max_retries=3,
    retry_delay=1.0,
    retry_backoff=2.0,
    retry_on_status=[429, 500, 502, 503, 504],
    raise_on_error=True,
)

async with SDK(config) as sdk:
    # Automatic retry on failure
    users = await sdk.get("/users", params={"page": 1})

    # Create resource
    new_user = await sdk.post("/users", json={"name": "John"})

    # Update resource
    updated = await sdk.patch("/users/123", json={"name": "Jane"})

    # Delete resource
    await sdk.delete("/users/123")

# Factory function
sdk = create_sdk(
    base_url="https://api.example.com",
    auth=BearerAuth("token"),
    max_retries=5,
)
```

### Agent HTTP Client (AI Integration)

```python
from fetch_httpx.sdk import AgentHTTPClient, AgentResponse, create_agent_client

async with AgentHTTPClient(
    base_url="https://api.example.com",
    timeout=30.0,
    max_response_size=1_000_000,  # 1MB limit
) as agent:
    # Get structured response
    result = await agent.get("/data")

    # AgentResponse properties
    print(result.success)       # True/False
    print(result.status_code)   # HTTP status
    print(result.headers)       # Dict of headers
    print(result.body)          # Parsed body (JSON or text)
    print(result.error)         # Error message if any
    print(result.url)           # Request URL

    # Convert to JSON for AI processing
    json_output = result.to_json()
    dict_output = result.to_dict()

# Get tool definitions for function calling
from fetch_httpx.sdk import get_http_tool_definitions
tools = get_http_tool_definitions()
# Returns OpenAI/Anthropic compatible tool schemas
```

### CLI Client

```python
from fetch_httpx.sdk import CLIContext, create_cli_client

# Create CLI context
context = CLIContext(
    verbose=True,
    quiet=False,
    output_format="json",  # auto, json, text, headers
    color=True,
)

# Create CLI client
with create_cli_client(
    verbose=True,
    base_url="https://api.example.com",
    timeout=30.0,
) as cli:
    # Returns exit code (0 for success)
    exit_code = cli.get("/users")
    exit_code = cli.post("/users", json_data={"name": "John"})
```

---

## 11. FastAPI Integration

### HTTP Client Dependency

```python
from fastapi import FastAPI, Depends
from fetch_httpx.integrations.fastapi import HTTPClientDependency

app = FastAPI()

# Create HTTP client dependency
http_client = HTTPClientDependency(
    base_url="https://api.backend.com",
    timeout=30.0,
    correlation_header="X-Correlation-ID",
    propagate_correlation=True,
)

@app.on_event("startup")
async def startup():
    await http_client.startup()

@app.on_event("shutdown")
async def shutdown():
    await http_client.shutdown()

@app.get("/proxy/users")
async def get_users(client = Depends(http_client)):
    """Proxy endpoint using injected HTTP client."""
    response = await client.get("/users")
    return response.json()

@app.post("/proxy/users")
async def create_user(data: dict, client = Depends(http_client)):
    """Proxy POST request."""
    response = await client.post("/users", json=data)
    return response.json()
```

### Correlation ID Middleware

```python
from fastapi import FastAPI, Request
from fetch_httpx.integrations.fastapi import (
    create_correlation_middleware,
    get_correlation_id,
)

app = FastAPI()

# Create middleware
correlation_middleware = create_correlation_middleware(
    header_name="X-Correlation-ID",
    generate_if_missing=True,
)

@app.middleware("http")
async def add_correlation_id(request: Request, call_next):
    return await correlation_middleware(request, call_next)

@app.get("/data")
async def get_data(request: Request):
    # Access correlation ID in route
    correlation_id = get_correlation_id(request)
    return {"correlation_id": correlation_id}
```

### Complete FastAPI Example

```python
from fastapi import FastAPI, Depends, HTTPException
from fetch_httpx import AsyncClient, Timeout
from fetch_httpx.integrations.fastapi import HTTPClientDependency

app = FastAPI(title="API Gateway")

# Multiple backend clients
users_client = HTTPClientDependency(
    base_url="https://users-service.internal",
    timeout=10.0,
)

orders_client = HTTPClientDependency(
    base_url="https://orders-service.internal",
    timeout=30.0,
)

@app.on_event("startup")
async def startup():
    await users_client.startup()
    await orders_client.startup()

@app.on_event("shutdown")
async def shutdown():
    await users_client.shutdown()
    await orders_client.shutdown()

@app.get("/users/{user_id}")
async def get_user(user_id: int, client = Depends(users_client)):
    response = await client.get(f"/users/{user_id}")
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="User not found")
    return response.json()

@app.get("/users/{user_id}/orders")
async def get_user_orders(
    user_id: int,
    users = Depends(users_client),
    orders = Depends(orders_client),
):
    # Verify user exists
    user_response = await users.get(f"/users/{user_id}")
    if not user_response.is_success:
        raise HTTPException(status_code=404, detail="User not found")

    # Get orders
    orders_response = await orders.get(f"/orders?user_id={user_id}")
    return {
        "*****": user_response.json(),
        "orders": orders_response.json(),
    }
```

---

## Running Examples

```bash
# Run the examples script
python examples.py

# Or run specific example
python -c "
import asyncio
from fetch_httpx import AsyncClient

async def main():
    async with AsyncClient() as client:
        response = await client.get('https://httpbin.org/get')
        print(response.json())

asyncio.run(main())
"
```
