# FastAPI Integration Guide

Detailed guide for integrating common-exceptions with FastAPI applications.

## Basic Setup

```python
from fastapi import FastAPI
from common_exceptions import register_exception_handlers, RequestIdMiddleware

app = FastAPI()

# Add request ID middleware for correlation
app.add_middleware(RequestIdMiddleware)

# Register all exception handlers
register_exception_handlers(app)
```

## Request ID Middleware

The `RequestIdMiddleware` generates unique correlation IDs for each request:

```python
from common_exceptions import RequestIdMiddleware

# Default configuration
app.add_middleware(RequestIdMiddleware)

# Custom configuration
app.add_middleware(
    RequestIdMiddleware,
    header_name="X-Request-Id",
    generate_if_missing=True,
)
```

### Accessing Request ID

```python
from fastapi import Request

@app.get("/example")
async def example(request: Request):
    request_id = request.state.request_id
    return {"requestId": request_id}
```

## Exception Handlers

The `register_exception_handlers` function registers handlers for:

1. `BaseHttpException` - All common-exceptions types
2. `RequestValidationError` - Pydantic validation errors
3. `Exception` - Fallback for unhandled exceptions

### Custom Handler Extension

```python
from fastapi import Request
from fastapi.responses import JSONResponse
from common_exceptions import BaseHttpException, create_logger

logger = create_logger("api", __file__)

@app.exception_handler(BaseHttpException)
async def custom_handler(request: Request, exc: BaseHttpException):
    # Log the error
    logger.error(exc.message, extra=exc.to_log_entry())

    # Add custom metrics
    metrics.increment("api.errors", tags={"code": exc.code.value})

    # Return standard response
    return JSONResponse(
        status_code=exc.status,
        content=exc.to_response(),
        headers={
            "X-Request-Id": exc.request_id or "",
            "X-Error-Code": exc.code.value,
        },
    )
```

## Validation Errors

### Automatic Pydantic Handling

Pydantic validation errors are automatically converted to `ValidationException`:

```python
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    age: int = Field(..., ge=0, le=150)

@app.post("/users")
async def create_user(user: UserCreate):
    # If validation fails, a ValidationException is raised automatically
    return await save_user(user)
```

Response for invalid input:
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed for 2 field(s)",
    "status": 422,
    "details": {
      "errors": [
        {"field": "body.email", "message": "value is not a valid email address"},
        {"field": "body.age", "message": "ensure this value is greater than or equal to 0"}
      ]
    },
    "timestamp": "2025-01-19T10:00:00.000Z"
  }
}
```

### Manual Validation

```python
from common_exceptions import ValidationException

@app.post("/validate")
async def validate_data(
    name: str = Query(None),
    email: str = Query(None),
):
    errors = []

    if not name:
        errors.append({
            "field": "query.name",
            "message": "Name is required",
            "code": "required",
        })

    if not email:
        errors.append({
            "field": "query.email",
            "message": "Email is required",
            "code": "required",
        })
    elif "@" not in email:
        errors.append({
            "field": "query.email",
            "message": "Invalid email format",
            "code": "invalid_email",
        })

    if errors:
        raise ValidationException.from_field_errors(
            errors=errors,
            message=f"Validation failed for {len(errors)} field(s)",
        )

    return {"status": "valid"}
```

## Authentication & Authorization

### Authentication Dependency

```python
from fastapi import Depends, Header
from common_exceptions import NotAuthenticatedException

async def get_current_user(
    authorization: str | None = Header(None)
) -> User:
    if not authorization:
        raise NotAuthenticatedException(
            message="Authorization header required",
        )

    if not authorization.startswith("Bearer "):
        raise NotAuthenticatedException(
            message="Invalid authorization format",
            details={"expected": "Bearer <token>"},
        )

    token = authorization[7:]

    try:
        payload = verify_jwt(token)
        return await get_user(payload["sub"])
    except JWTExpiredError:
        raise NotAuthenticatedException(
            message="Token has expired",
            details={"hint": "Request a new token"},
        )
    except JWTInvalidError:
        raise NotAuthenticatedException(message="Invalid token")

@app.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return user
```

### Authorization Dependency

```python
from common_exceptions import NotAuthorizedException

def require_role(*roles: str):
    async def dependency(user: User = Depends(get_current_user)):
        if user.role not in roles:
            raise NotAuthorizedException(
                message=f"One of {roles} role required",
                details={
                    "required_roles": list(roles),
                    "user_role": user.role,
                },
            )
        return user
    return dependency

@app.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin: User = Depends(require_role("admin")),
):
    return await remove_user(user_id)
```

## Resource Operations

### Not Found Pattern

```python
from common_exceptions import NotFoundException

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    user = await find_user(user_id)

    if not user:
        raise NotFoundException(
            message=f"User with ID '{user_id}' not found",
            details={"userId": user_id},
        )

    return user
```

### Conflict Pattern

```python
from common_exceptions import ConflictException

@app.post("/users")
async def create_user(user: UserCreate):
    existing = await find_user_by_email(user.email)

    if existing:
        raise ConflictException(
            message="User with this email already exists",
            details={
                "email": user.email,
                "existingId": existing.id,
            },
        )

    return await save_user(user)
```

## Rate Limiting

```python
from common_exceptions import TooManyRequestsException
from fastapi import Request

# Simple in-memory rate limiter (use Redis in production)
request_counts: dict[str, int] = {}

async def rate_limit(request: Request, limit: int = 100):
    client_ip = request.client.host
    count = request_counts.get(client_ip, 0) + 1
    request_counts[client_ip] = count

    if count > limit:
        raise TooManyRequestsException(
            message="Rate limit exceeded",
            retry_after=60,
            details={
                "limit": limit,
                "current": count,
                "window": "1m",
            },
        )

@app.get("/api/data")
async def get_data(request: Request):
    await rate_limit(request)
    return {"data": "..."}
```

## HTTPX Client Integration

```python
import httpx
from common_exceptions import wrap_httpx_errors, UpstreamServiceException

@wrap_httpx_errors(service="payment-api")
async def charge_payment(amount: int, currency: str):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://payment.internal/charge",
            json={"amount": amount, "currency": currency},
        )
        response.raise_for_status()
        return response.json()

@app.post("/checkout")
async def checkout(order: Order):
    try:
        payment = await charge_payment(order.total, "USD")
        return {"paymentId": payment["id"]}
    except UpstreamServiceException as e:
        # Log and re-raise or handle gracefully
        logger.error(f"Payment failed: {e.message}")
        raise
```

## Lifespan Events

```python
from contextlib import asynccontextmanager
from common_exceptions import create_logger, register_exception_handlers

logger = create_logger("api", __file__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting application")
    yield
    # Shutdown
    logger.info("Shutting down application")

app = FastAPI(lifespan=lifespan)
register_exception_handlers(app)
```
