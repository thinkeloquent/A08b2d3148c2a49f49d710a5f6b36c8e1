#!/usr/bin/env python3
"""
fetch_httpx - Comprehensive Usage Examples

This module provides comprehensive examples for using the fetch_httpx package.
All examples are based on the actual implemented functionality.

Covers:
- Simple GET/POST/PUT/PATCH/DELETE requests
- Authentication (Basic, Digest, Bearer)
- Timeout configuration (granular timeouts)
- Connection limits
- Transport mounts (multi-service routing)
- TLS/SSL and mTLS configuration
- Streaming responses
- Error handling
- Event hooks
- Redirect handling
- FastAPI integration
- SDK usage (core, CLI, agent)
- Logger configuration

Run: python examples.py
"""

from __future__ import annotations

import asyncio
import json

# =============================================================================
# Import from fetch_httpx package
# =============================================================================
from fetch_httpx import (
    URL,
    # Clients
    AsyncClient,
    # Transports
    AsyncHTTPTransport,
    # Authentication
    BasicAuth,
    BearerAuth,
    Client,
    DigestAuth,
    Headers,
    # Exceptions
    HTTPStatusError,
    Limits,
    Proxy,
    Request,
    Response,
    # TLS
    SSLContextBuilder,
    # Configuration
    Timeout,
    TimeoutException,
    create_logger,
    create_ssl_context,
)

# Create logger for examples
logger = create_logger("fetch_httpx.examples", __file__)


# =============================================================================
# Example 1: Simple GET Request
# =============================================================================

async def example1_simple_get() -> None:
    """
    Make a simple GET request to a public API.
    Demonstrates basic client usage and JSON response handling.
    """
    logger.info("Example 1: Simple GET Request")

    async with AsyncClient() as client:
        response = await client.get(
            "https://jsonplaceholder.typicode.com/posts",
            params={"_limit": "5"},
        )

        print(f"Status: {response.status_code}")
        print(f"Is Success: {response.is_success}")
        print(f"Content-Type: {response.headers.get('content-type')}")
        print(f"Posts: {len(response.json())} items")


# =============================================================================
# Example 2: POST Request with JSON Body
# =============================================================================

async def example2_post_json() -> None:
    """
    Make a POST request with JSON payload.
    Demonstrates request body serialization and custom headers.
    """
    logger.info("Example 2: POST Request with JSON")

    async with AsyncClient() as client:
        response = await client.post(
            "https://jsonplaceholder.typicode.com/posts",
            json={
                "title": "New Post",
                "body": "This is the content of my new post.",
                "userId": 1,
            },
            headers={
                "X-Custom-Header": "example-value",
            },
        )

        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Created post ID: {data.get('id')}")


# =============================================================================
# Example 3: PUT and PATCH Requests
# =============================================================================

async def example3_put_patch() -> None:
    """
    Demonstrate PUT (full update) and PATCH (partial update) requests.
    """
    logger.info("Example 3: PUT and PATCH Requests")

    async with AsyncClient(base_url="https://jsonplaceholder.typicode.com") as client:
        # PUT - Full resource replacement
        put_response = await client.put(
            "/posts/1",
            json={
                "id": 1,
                "title": "Updated Title",
                "body": "Updated body content",
                "userId": 1,
            },
        )
        print(f"PUT Status: {put_response.status_code}")

        # PATCH - Partial update
        patch_response = await client.patch(
            "/posts/1",
            json={
                "title": "Only Title Changed",
            },
        )
        print(f"PATCH Status: {patch_response.status_code}")


# =============================================================================
# Example 4: DELETE Request
# =============================================================================

async def example4_delete() -> None:
    """
    Make a DELETE request.
    """
    logger.info("Example 4: DELETE Request")

    async with AsyncClient() as client:
        response = await client.delete(
            "https://jsonplaceholder.typicode.com/posts/1"
        )
        print(f"DELETE Status: {response.status_code}")
        print(f"Is Success: {response.is_success}")


# =============================================================================
# Example 5: HEAD and OPTIONS Requests
# =============================================================================

async def example5_head_options() -> None:
    """
    Make HEAD (metadata only) and OPTIONS (CORS preflight) requests.
    """
    logger.info("Example 5: HEAD and OPTIONS Requests")

    async with AsyncClient() as client:
        # HEAD - Get headers without body
        head_response = await client.head("https://httpbin.org/get")
        print(f"HEAD Status: {head_response.status_code}")
        print(f"Content-Length: {head_response.headers.get('content-length')}")

        # OPTIONS - Check allowed methods
        options_response = await client.options("https://httpbin.org/get")
        print(f"OPTIONS Status: {options_response.status_code}")
        print(f"Allow: {options_response.headers.get('allow', 'N/A')}")


# =============================================================================
# Example 6: Basic Authentication
# =============================================================================

async def example6_basic_auth() -> None:
    """
    Authenticate using HTTP Basic Auth.
    Demonstrates credential handling with automatic Base64 encoding.
    """
    logger.info("Example 6: Basic Authentication")

    # Method 1: Tuple shorthand (username, password)
    async with AsyncClient(auth=("user", "passwd")) as client:
        response = await client.get("https://httpbin.org/basic-auth/user/passwd")
        print(f"Tuple auth status: {response.status_code}")

    # Method 2: BasicAuth class (more explicit)
    auth = BasicAuth(username="user", password="passwd")
    async with AsyncClient(auth=auth) as client:
        response = await client.get("https://httpbin.org/basic-auth/user/passwd")
        print(f"BasicAuth class status: {response.status_code}")


# =============================================================================
# Example 7: Bearer Token Authentication
# =============================================================================

async def example7_bearer_auth() -> None:
    """
    Authenticate using Bearer token (OAuth2-style).
    Demonstrates token-based authentication pattern.
    """
    logger.info("Example 7: Bearer Token Authentication")

    # Simulated JWT token
    access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"

    auth = BearerAuth(token=access_token)
    async with AsyncClient(auth=auth) as client:
        response = await client.get("https://httpbin.org/bearer")
        print(f"Bearer auth status: {response.status_code}")
        if response.is_success:
            print(f"Authenticated: {response.json().get('authenticated')}")


# =============================================================================
# Example 8: Digest Authentication
# =============================================================================

async def example8_digest_auth() -> None:
    """
    Authenticate using HTTP Digest Auth (RFC 7616).
    Demonstrates challenge-response authentication.
    """
    logger.info("Example 8: Digest Authentication")

    auth = DigestAuth(username="user", password="passwd")
    async with AsyncClient(auth=auth) as client:
        response = await client.get("https://httpbin.org/digest-auth/auth/user/passwd")
        print(f"Digest auth status: {response.status_code}")


# =============================================================================
# Example 9: Granular Timeout Configuration
# =============================================================================

async def example9_timeouts() -> None:
    """
    Configure granular timeouts for different phases.
    Demonstrates connect vs read timeout separation.
    """
    logger.info("Example 9: Granular Timeouts")

    # Single value (applies to all phases)
    timeout_simple = Timeout(10.0)
    print(f"Simple timeout: connect={timeout_simple.connect}s")

    # Granular configuration
    timeout_granular = Timeout(
        connect=5.0,   # Connection establishment
        read=30.0,     # Response body reading
        write=10.0,    # Request body sending
        pool=5.0,      # Waiting for connection from pool
    )
    print(f"Granular: connect={timeout_granular.connect}, read={timeout_granular.read}")

    async with AsyncClient(timeout=timeout_granular) as client:
        response = await client.get("https://httpbin.org/delay/2")
        print(f"Response status: {response.status_code}")

    # Disable timeouts (use None)
    timeout_disabled = Timeout(None)
    print(f"Disabled timeout: connect={timeout_disabled.connect}")


# =============================================================================
# Example 10: Connection Pool Limits
# =============================================================================

async def example10_connection_limits() -> None:
    """
    Configure connection pool limits.
    Demonstrates resource management for high-throughput scenarios.
    """
    logger.info("Example 10: Connection Limits")

    limits = Limits(
        max_connections=100,           # Total connections
        max_keepalive_connections=20,  # Persistent connections
        keepalive_expiry=30.0,         # Idle connection timeout (seconds)
    )

    print(f"Max connections: {limits.max_connections}")
    print(f"Keepalive connections: {limits.max_keepalive_connections}")

    async with AsyncClient(limits=limits) as client:
        # Make parallel requests
        tasks = [
            client.get(f"https://httpbin.org/get?id={i}")
            for i in range(3)
        ]
        responses = await asyncio.gather(*tasks)
        print(f"Completed {len(responses)} parallel requests")


# =============================================================================
# Example 11: Transport Mounts (Multi-Service Routing)
# =============================================================================

async def example11_transport_mounts() -> None:
    """
    Route requests to different backends with service-specific config.
    Demonstrates mount-based transport routing for microservices.
    """
    logger.info("Example 11: Transport Mounts")

    # Define transports with different configurations
    mounts = {
        # High-reliability service with retries
        "https://api.reliable.example.com/": AsyncHTTPTransport(
            retries=5,
            timeout=Timeout(connect=5.0, read=60.0),
        ),

        # Fast service with no retries
        "https://api.fast.example.com/": AsyncHTTPTransport(
            retries=0,
            timeout=Timeout(5.0),
        ),

        # HTTP/2 enabled service
        "https://api.modern.example.com/": AsyncHTTPTransport(
            http2=True,
            retries=2,
        ),

        # Default for all HTTPS
        "https://": AsyncHTTPTransport(
            timeout=Timeout(30.0),
        ),

        # Fallback for all URLs
        "all://": AsyncHTTPTransport(),
    }

    async with AsyncClient(mounts=mounts) as client:
        # Each request routes to appropriate transport based on URL
        response = await client.get("https://httpbin.org/get")
        print(f"Routed request status: {response.status_code}")


# =============================================================================
# Example 12: TLS/SSL Configuration
# =============================================================================

async def example12_tls_config() -> None:
    """
    Configure TLS/SSL settings including custom CA and client certificates.
    """
    logger.info("Example 12: TLS/SSL Configuration")

    # Build custom SSL context using builder
    SSLContextBuilder()
    print("SSL Context Builder created")

    # Example: Create SSL context with verification disabled (INSECURE - testing only)
    # ssl_context = ssl_builder.without_verification().build()

    # Example: Create SSL context from verify parameter
    ssl_context = create_ssl_context(verify=True, cert=None)
    print(f"SSL context created: {ssl_context}")

    # Client with TLS verification
    async with AsyncClient(verify=True) as client:
        response = await client.get("https://httpbin.org/get")
        print(f"TLS verified request: {response.status_code}")


# =============================================================================
# Example 13: mTLS (Mutual TLS) with Client Certificates
# =============================================================================

async def example13_mtls() -> None:
    """
    Configure mutual TLS with client certificates.
    Demonstrates enterprise mTLS patterns.
    """
    logger.info("Example 13: mTLS Configuration")

    # Example paths (would be real certificates in production)
    cert_path = "/path/to/client-cert.pem"
    key_path = "/path/to/client-key.pem"

    # Create client with mTLS (would work with real certs)
    # async with AsyncClient(
    #     cert=(cert_path, key_path),
    #     verify=True,
    # ) as client:
    #     response = await client.get("https://mtls-api.example.com/secure")

    print("mTLS configuration example (requires real certificates)")
    print(f"Cert tuple: ({cert_path}, {key_path})")


# =============================================================================
# Example 14: Proxy Configuration
# =============================================================================

async def example14_proxy() -> None:
    """
    Configure HTTP/HTTPS proxy settings.
    """
    logger.info("Example 14: Proxy Configuration")

    # Create proxy configuration
    proxy = Proxy(
        url="http://proxy.example.com:8080",
        auth=("proxy_user", "proxy_pass"),
        headers={"Proxy-Authorization": "custom-header"},
    )

    print(f"Proxy URL: {proxy.url}")
    print(f"Proxy has auth: {proxy.auth is not None}")

    # Client with proxy (would work with real proxy)
    # async with AsyncClient(proxy=proxy) as client:
    #     response = await client.get("https://api.example.com/data")


# =============================================================================
# Example 15: Error Handling
# =============================================================================

async def example15_error_handling() -> None:
    """
    Handle various error conditions gracefully.
    Demonstrates exception hierarchy and recovery patterns.
    """
    logger.info("Example 15: Error Handling")

    async with AsyncClient(timeout=Timeout(5.0)) as client:
        # Handle HTTP status errors
        try:
            response = await client.get("https://httpbin.org/status/404")
            response.raise_for_status()
        except HTTPStatusError as e:
            print(f"HTTP Status Error: {e.response.status_code}")
            print(f"  Is Client Error: {e.response.is_client_error}")
            print(f"  Is Server Error: {e.response.is_server_error}")

        # Handle timeout errors
        try:
            response = await client.get(
                "https://httpbin.org/delay/10",
                timeout=Timeout(1.0),  # Override client timeout
            )
        except TimeoutException as e:
            print(f"Timeout Error: {type(e).__name__}")
        except Exception as e:
            print(f"Other Error: {type(e).__name__}: {e}")


# =============================================================================
# Example 16: Response Status Helpers
# =============================================================================

async def example16_status_helpers() -> None:
    """
    Use response status helper properties.
    """
    logger.info("Example 16: Response Status Helpers")

    async with AsyncClient() as client:
        # Success response
        response = await client.get("https://httpbin.org/status/200")
        print(f"200 - is_success: {response.is_success}")
        print(f"200 - is_error: {response.is_error}")

        # Redirect response (not following)
        response = await client.get(
            "https://httpbin.org/redirect/1",
            follow_redirects=False,
        )
        print(f"302 - is_redirect: {response.is_redirect}")

        # Client error response
        response = await client.get("https://httpbin.org/status/404")
        print(f"404 - is_client_error: {response.is_client_error}")

        # Server error response
        response = await client.get("https://httpbin.org/status/500")
        print(f"500 - is_server_error: {response.is_server_error}")


# =============================================================================
# Example 17: Redirect Handling
# =============================================================================

async def example17_redirects() -> None:
    """
    Control redirect following behavior.
    """
    logger.info("Example 17: Redirect Handling")

    # Don't follow redirects (default)
    async with AsyncClient(follow_redirects=False) as client:
        response = await client.get("https://httpbin.org/redirect/3")
        print(f"Without follow: {response.status_code}")
        print(f"Location: {response.headers.get('location')}")

    # Follow redirects with limit
    async with AsyncClient(follow_redirects=True, max_redirects=10) as client:
        response = await client.get("https://httpbin.org/redirect/3")
        print(f"With follow: {response.status_code}")
        print(f"Redirect history: {len(response.history)} hops")


# =============================================================================
# Example 18: Event Hooks (Logging/Monitoring)
# =============================================================================

async def example18_event_hooks() -> None:
    """
    Add request/response hooks for logging and monitoring.
    """
    logger.info("Example 18: Event Hooks")

    async def log_request(request: Request) -> None:
        """Log outgoing request details."""
        print(f"[REQUEST] {request.method} {request.url}")

    async def log_response(response: Response) -> None:
        """Log incoming response details."""
        print(f"[RESPONSE] {response.status_code} ({len(response.content)} bytes)")

    event_hooks = {
        "request": [log_request],
        "response": [log_response],
    }

    async with AsyncClient(event_hooks=event_hooks) as client:
        response = await client.get("https://httpbin.org/get")
        print(f"Final status: {response.status_code}")


# =============================================================================
# Example 19: Base URL Configuration
# =============================================================================

async def example19_base_url() -> None:
    """
    Configure base URL for API client.
    """
    logger.info("Example 19: Base URL Configuration")

    async with AsyncClient(base_url="https://jsonplaceholder.typicode.com") as client:
        # Paths are joined with base URL
        posts = await client.get("/posts", params={"_limit": "2"})
        print(f"GET /posts: {posts.status_code}")

        users = await client.get("/users", params={"_limit": "2"})
        print(f"GET /users: {users.status_code}")

        # POST with relative path
        new_post = await client.post(
            "/posts",
            json={"title": "Test", "body": "Content", "userId": 1},
        )
        print(f"POST /posts: {new_post.status_code}")


# =============================================================================
# Example 20: Default Headers and Cookies
# =============================================================================

async def example20_headers_cookies() -> None:
    """
    Set default headers and cookies for all requests.
    """
    logger.info("Example 20: Headers and Cookies")

    async with AsyncClient(
        headers={
            "User-Agent": "fetch-httpx-example/1.0",
            "Accept": "application/json",
            "X-API-Version": "2024-01",
        },
        cookies={
            "session_id": "abc123",
            "preference": "dark_mode",
        },
    ) as client:
        response = await client.get("https://httpbin.org/headers")
        data = response.json()
        print(f"Sent headers: {json.dumps(data['headers'], indent=2)}")

        response = await client.get("https://httpbin.org/cookies")
        data = response.json()
        print(f"Sent cookies: {data['cookies']}")


# =============================================================================
# Example 21: Synchronous Client
# =============================================================================

def example21_sync_client() -> None:
    """
    Use synchronous client for non-async code.
    """
    logger.info("Example 21: Synchronous Client")

    with Client() as client:
        response = client.get("https://httpbin.org/get")
        print(f"Sync GET status: {response.status_code}")

        response = client.post(
            "https://httpbin.org/post",
            json={"key": "value"},
        )
        print(f"Sync POST status: {response.status_code}")


# =============================================================================
# Example 22: URL Class Usage
# =============================================================================

def example22_url_class() -> None:
    """
    Demonstrate URL parsing and manipulation.
    """
    logger.info("Example 22: URL Class Usage")

    # Parse URL
    url = URL("https://api.example.com:8443/v1/users?page=1&limit=10#section")

    print(f"Scheme: {url.scheme}")
    print(f"Host: {url.host}")
    print(f"Port: {url.port}")
    print(f"Path: {url.path}")
    print(f"Query: {url.query}")
    print(f"Fragment: {url.fragment}")

    # Modify URL
    new_url = url.copy_with(path="/v2/users", query="page=2")
    print(f"Modified URL: {new_url}")

    # Join URLs
    base = URL("https://api.example.com/v1/")
    relative = "users/123"
    joined = base.join(relative)
    print(f"Joined URL: {joined}")


# =============================================================================
# Example 23: Headers Class Usage
# =============================================================================

def example23_headers_class() -> None:
    """
    Demonstrate Headers class functionality.
    """
    logger.info("Example 23: Headers Class Usage")

    # Create headers from dict
    headers = Headers({
        "Content-Type": "application/json",
        "Authorization": "Bearer token123",
    })

    # Case-insensitive access
    print(f"content-type: {headers.get('content-type')}")
    print(f"CONTENT-TYPE: {headers.get('CONTENT-TYPE')}")

    # Check existence
    print(f"Has Authorization: {'authorization' in headers}")

    # Create headers with multiple values
    multi_headers = Headers([
        ("Accept", "application/json"),
        ("Accept", "text/html"),
    ])
    print(f"Accept values: {multi_headers.get_list('Accept')}")


# =============================================================================
# Example 24: Logger Configuration
# =============================================================================

def example24_logger_config() -> None:
    """
    Configure and use the logger module.
    """
    logger.info("Example 24: Logger Configuration")

    # Create logger with custom settings
    from fetch_httpx.logger import Logger, LogLevel

    custom_logger = Logger(
        package_name="my_app",
        filename=__file__,
        level=LogLevel.DEBUG,
    )

    # Log at different levels
    custom_logger.debug("Debug message", context={"key": "value"})
    custom_logger.info("Info message")
    custom_logger.warn("Warning message")
    custom_logger.error("Error message")

    # Create child logger for different file
    child_logger = custom_logger.child("child_module.py")
    child_logger.info("Message from child logger")

    # Logger with correlation ID
    correlated = custom_logger.with_correlation_id("req-12345")
    correlated.info("Request processing", context={"user": "john"})


# =============================================================================
# Example 25: SDK Core Usage
# =============================================================================

async def example25_sdk_core() -> None:
    """
    Use the SDK for high-level API client operations.
    """
    logger.info("Example 25: SDK Core Usage")

    from fetch_httpx.sdk import SDK, SDKConfig

    # Create SDK with configuration
    config = SDKConfig(
        base_url="https://jsonplaceholder.typicode.com",
        timeout=Timeout(30.0),
        max_retries=3,
        retry_on_status=[429, 500, 502, 503, 504],
    )

    async with SDK(config) as sdk:
        # GET with automatic retry
        posts = await sdk.get("/posts", params={"_limit": 2})
        print(f"SDK GET status: {posts.status_code}")

        # POST with retry
        new_post = await sdk.post(
            "/posts",
            json={"title": "SDK Test", "body": "Content", "userId": 1},
        )
        print(f"SDK POST status: {new_post.status_code}")


# =============================================================================
# Example 26: Agent HTTP Client
# =============================================================================

async def example26_agent_client() -> None:
    """
    Use the Agent HTTP client for AI agent integration.
    """
    logger.info("Example 26: Agent HTTP Client")

    from fetch_httpx.sdk import AgentHTTPClient

    async with AgentHTTPClient(
        base_url="https://jsonplaceholder.typicode.com",
        timeout=30.0,
        max_response_size=1_000_000,  # 1MB limit
    ) as agent_client:
        # Make request and get structured response
        result = await agent_client.get("/posts/1")

        print(f"Success: {result.success}")
        print(f"Status: {result.status_code}")
        print(f"Body type: {type(result.body).__name__}")

        if result.error:
            print(f"Error: {result.error}")

        # Convert to JSON for AI processing
        json_output = result.to_json()
        print(f"JSON output length: {len(json_output)} chars")


# =============================================================================
# Example 27: FastAPI Integration
# =============================================================================

def example27_fastapi_integration() -> None:
    """
    Demonstrate FastAPI integration patterns.
    (Shows the code structure - requires FastAPI to run)
    """
    logger.info("Example 27: FastAPI Integration")

    # Example FastAPI integration code
    code_example = '''
from fastapi import FastAPI, Depends
from fetch_httpx.integrations.fastapi import HTTPClientDependency

app = FastAPI()

# Create HTTP client dependency
http_client = HTTPClientDependency(
    base_url="https://api.backend.com",
    timeout=30.0,
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
    """Proxy endpoint that uses injected HTTP client."""
    response = await client.get("/users")
    return response.json()
'''

    print("FastAPI integration example:")
    print(code_example)


# =============================================================================
# Example 28: Complete Production Setup
# =============================================================================

async def example28_production_setup() -> None:
    """
    Complete production-ready client configuration.
    """
    logger.info("Example 28: Production Setup")

    # Production-ready transport configuration
    production_transport = AsyncHTTPTransport(
        http2=True,
        http1=True,  # Fallback
        verify=True,
        limits=Limits(
            max_connections=100,
            max_keepalive_connections=20,
            keepalive_expiry=30.0,
        ),
        retries=3,
    )

    # Internal service transport with mTLS
    # internal_transport = AsyncHTTPTransport(
    #     http2=True,
    #     verify=True,
    #     cert=("/path/to/cert.pem", "/path/to/key.pem"),
    #     retries=5,
    # )

    async def log_request(request: Request) -> None:
        logger.info(
            "Outgoing request",
            context={"method": request.method, "url": str(request.url)},
        )

    async def log_response(response: Response) -> None:
        logger.info(
            "Incoming response",
            context={"status": response.status_code},
        )

    # Production client with full configuration
    async with AsyncClient(
        headers={
            "User-Agent": "MyApp/1.0",
            "Accept": "application/json",
        },
        timeout=Timeout(
            connect=5.0,
            read=30.0,
            write=10.0,
            pool=5.0,
        ),
        mounts={
            "https://": production_transport,
            "all://": production_transport,
        },
        event_hooks={
            "request": [log_request],
            "response": [log_response],
        },
        follow_redirects=True,
        max_redirects=5,
    ) as client:
        response = await client.get("https://httpbin.org/get")
        print(f"Production request status: {response.status_code}")


# =============================================================================
# Example 30: Retry with Exponential Backoff + Jitter
# =============================================================================

async def example30_retry_config() -> None:
    """
    Configure retry with exponential backoff and jitter.
    Demonstrates industry-standard retry patterns.
    """
    logger.info("Example 30: Retry Configuration")

    from fetch_httpx import JitterStrategy, RetryConfig

    # Configure retry with all options
    retry = RetryConfig(
        max_retries=5,              # Maximum retry attempts
        retry_delay=0.5,            # Initial delay: 500ms
        retry_backoff=2.0,          # Multiplier: 2x
        max_retry_delay=30.0,       # Cap delay at 30 seconds
        jitter=JitterStrategy.FULL, # Prevent thundering herd
        retry_on_status=[429, 500, 502, 503, 504],
        retry_on_exception=True,    # Retry on connection/timeout errors
        respect_retry_after_header=True,   # Honor Retry-After header
    )

    async with AsyncClient(
        base_url="https://httpbin.org",
        retry=retry,
    ) as client:
        # This will automatically retry on transient errors
        response = await client.get("/get")
        print(f"Retry config test status: {response.status_code}")


# =============================================================================
# Example 31: Circuit Breaker
# =============================================================================

async def example31_circuit_breaker() -> None:
    """
    Configure circuit breaker to prevent cascading failures.
    """
    logger.info("Example 31: Circuit Breaker")

    from fetch_httpx import CircuitBreakerConfig, CircuitOpenError

    async with AsyncClient(
        base_url="https://httpbin.org",
        circuit_breaker=CircuitBreakerConfig(
            failure_threshold=5,    # Open after 5 failures
            success_threshold=2,    # Close after 2 successes
            timeout=30.0,           # Try half-open after 30s
        ),
    ) as client:
        # Check circuit state
        if client.circuit_breaker:
            print(f"Circuit state: {client.circuit_breaker.state.value}")
            print(f"Is open: {client.circuit_breaker.is_open}")

        try:
            response = await client.get("/get")
            print(f"Circuit breaker test status: {response.status_code}")
        except CircuitOpenError:
            print("Circuit is open - requests blocked")


# =============================================================================
# Example 32: Idempotency-Aware Retry
# =============================================================================

async def example32_idempotent_retry() -> None:
    """
    Demonstrate idempotency-aware retry behavior.
    """
    logger.info("Example 32: Idempotency-Aware Retry")

    from fetch_httpx import RetryConfig

    async with AsyncClient(
        base_url="https://httpbin.org",
        retry=RetryConfig(max_retries=3),
    ) as client:
        # GET is idempotent - will be retried automatically
        response = await client.get("/get")
        print(f"GET (idempotent): {response.status_code}")

        # POST is NOT retried by default
        response = await client.post("/post", json={"key": "value"})
        print(f"POST (non-idempotent): {response.status_code}")

        # POST with Idempotency-Key WILL be retried
        response = await client.post(
            "/post",
            json={"key": "value"},
            headers={"Idempotency-Key": "unique-key-123"},
        )
        print(f"POST with Idempotency-Key: {response.status_code}")


# =============================================================================
# Example 33: LLM/OpenAI API Client
# =============================================================================

async def example33_llm_client() -> None:
    """
    Production-ready configuration for LLM APIs like OpenAI.
    """
    logger.info("Example 33: LLM/OpenAI API Client")

    from fetch_httpx import CircuitBreakerConfig, JitterStrategy, RetryConfig

    # Transport with connection pooling
    transport = AsyncHTTPTransport(
        limits=Limits(
            max_connections=50,
            max_keepalive_connections=10,
            keepalive_expiry=30.0,
        ),
    )

    # LLM-optimized client configuration
    async with AsyncClient(
        base_url="https://httpbin.org",  # Using httpbin for demo
        transport=transport,
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
        # Simulate LLM API call
        response = await client.post(
            "/post",
            json={
                "model": "gpt-4",
                "messages": [{"role": "user", "content": "Hello!"}],
            },
        )
        print(f"LLM client test status: {response.status_code}")
        print(f"Circuit state: {client.circuit_breaker.state.value}")


# =============================================================================
# Convenience Functions
# =============================================================================

def example29_convenience_functions() -> None:
    """
    Use module-level convenience functions.
    """
    logger.info("Example 29: Convenience Functions")

    from fetch_httpx import get, post

    # Simple one-off requests
    response = get("https://httpbin.org/get")
    print(f"Convenience GET: {response.status_code}")

    response = post(
        "https://httpbin.org/post",
        json={"key": "value"},
    )
    print(f"Convenience POST: {response.status_code}")


# =============================================================================
# Main Runner
# =============================================================================

async def main() -> None:
    """Run all examples."""
    print("=" * 70)
    print("fetch_httpx - Comprehensive Usage Examples")
    print("=" * 70)

    async_examples = [
        ("Simple GET Request", example1_simple_get),
        ("POST with JSON", example2_post_json),
        ("PUT and PATCH", example3_put_patch),
        ("DELETE Request", example4_delete),
        ("HEAD and OPTIONS", example5_head_options),
        ("Basic Authentication", example6_basic_auth),
        ("Bearer Token Auth", example7_bearer_auth),
        ("Digest Authentication", example8_digest_auth),
        ("Granular Timeouts", example9_timeouts),
        ("Connection Limits", example10_connection_limits),
        ("Transport Mounts", example11_transport_mounts),
        ("TLS Configuration", example12_tls_config),
        ("mTLS Setup", example13_mtls),
        ("Proxy Configuration", example14_proxy),
        ("Error Handling", example15_error_handling),
        ("Status Helpers", example16_status_helpers),
        ("Redirect Handling", example17_redirects),
        ("Event Hooks", example18_event_hooks),
        ("Base URL", example19_base_url),
        ("Headers & Cookies", example20_headers_cookies),
        ("SDK Core", example25_sdk_core),
        ("Agent Client", example26_agent_client),
        ("Production Setup", example28_production_setup),
        ("Retry Config", example30_retry_config),
        ("Circuit Breaker", example31_circuit_breaker),
        ("Idempotent Retry", example32_idempotent_retry),
        ("LLM Client", example33_llm_client),
    ]

    sync_examples = [
        ("Sync Client", example21_sync_client),
        ("URL Class", example22_url_class),
        ("Headers Class", example23_headers_class),
        ("Logger Config", example24_logger_config),
        ("FastAPI Integration", example27_fastapi_integration),
        ("Convenience Functions", example29_convenience_functions),
    ]

    # Run async examples
    for name, func in async_examples:
        print(f"\n{'='*70}")
        print(f" {name}")
        print("=" * 70)
        try:
            await func()
        except Exception as e:
            print(f"Error: {type(e).__name__}: {e}")

    # Run sync examples
    for name, func in sync_examples:
        print(f"\n{'='*70}")
        print(f" {name}")
        print("=" * 70)
        try:
            func()
        except Exception as e:
            print(f"Error: {type(e).__name__}: {e}")

    print("\n" + "=" * 70)
    print("All examples completed!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
