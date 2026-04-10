# Common Exceptions - Python Package

Standardized exception handling for FastAPI applications with HTTPX client support.

## Installation

```bash
pip install common-exceptions
# or with poetry
poetry add common-exceptions
```

## Quick Start

```python
from fastapi import FastAPI
from common_exceptions import (
    register_exception_handlers,
    RequestIdMiddleware,
    NotFoundException,
    ValidationException,
)

app = FastAPI()

# Register middleware and handlers
app.add_middleware(RequestIdMiddleware)
register_exception_handlers(app)

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    user = await find_user(user_id)
    if not user:
        raise NotFoundException(
            message=f"User {user_id} not found",
            details={"userId": user_id},
        )
    return user
```

## Features

- 16 pre-defined exception classes for common HTTP errors
- Automatic serialization to standardized JSON response format
- Pydantic validation error normalization
- HTTPX error wrapping for upstream service calls
- Request ID correlation middleware
- CLI formatting for developer tools
- Agent-friendly error context for LLM integration
- Comprehensive logging with LOG_LEVEL support

## Exception Classes

### Inbound (Client Errors)

| Class | Status | Code |
|-------|--------|------|
| `NotAuthenticatedException` | 401 | AUTH_NOT_AUTHENTICATED |
| `NotAuthorizedException` | 403 | AUTHZ_NOT_AUTHORIZED |
| `NotFoundException` | 404 | NOT_FOUND |
| `BadRequestException` | 400 | BAD_REQUEST |
| `ValidationException` | 422 | VALIDATION_FAILED |
| `ConflictException` | 409 | CONFLICT |
| `TooManyRequestsException` | 429 | TOO_MANY_REQUESTS |

### Outbound (Upstream Errors)

| Class | Status | Code |
|-------|--------|------|
| `ConnectTimeoutException` | 503 | CONNECT_TIMEOUT |
| `ReadTimeoutException` | 504 | READ_TIMEOUT |
| `WriteTimeoutException` | 504 | WRITE_TIMEOUT |
| `NetworkException` | 503 | NETWORK_ERROR |
| `UpstreamServiceException` | 502 | UPSTREAM_SERVICE_ERROR |
| `UpstreamTimeoutException` | 504 | UPSTREAM_TIMEOUT |

### Internal (Server Errors)

| Class | Status | Code |
|-------|--------|------|
| `InternalServerException` | 500 | INTERNAL_SERVER_ERROR |
| `ServiceUnavailableException` | 503 | SERVICE_UNAVAILABLE |
| `BadGatewayException` | 502 | BAD_GATEWAY |

## Logging

The package uses a factory-based logger with LOG_LEVEL support:

```python
from common_exceptions import create_logger

logger = create_logger("my_module", __file__)

# LOG_LEVEL defaults to "debug"
# Override with environment variable: LOG_LEVEL=info

logger.debug("Debug message")
logger.info("Info message")
logger.warn("Warning message")
logger.error("Error message")
```

## HTTPX Integration

Wrap HTTPX calls to automatically convert exceptions:

```python
from common_exceptions import wrap_httpx_errors
import httpx

@wrap_httpx_errors(service="payment-api")
async def charge_payment(amount: int):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://payment-api.internal/charge",
            json={"amount": amount},
        )
        response.raise_for_status()
        return response.json()
```

## SDK Functions

```python
from common_exceptions import (
    create_exception,
    parse_error_response,
    is_common_exception,
    format_for_cli,
    to_agent_context,
)

# Create exception dynamically
exc = create_exception(
    code="NOT_FOUND",
    message="Resource not found",
)

# Parse upstream error response
exc = parse_error_response(response_json)

# Check exception type
if is_common_exception(error):
    print(format_for_cli(error))

# Get agent-friendly context
context = to_agent_context(error)
```

## Requirements

- Python >= 3.10
- FastAPI >= 0.115.0
- Pydantic >= 2.0.0
- HTTPX >= 0.27.0 (optional, for client wrappers)
