# Server Integration Guide for Common Exceptions

This guide covers framework-specific integration patterns for Fastify (Node.js) and FastAPI (Python).

## Fastify Integration (Node.js)

The integration uses Fastify's error handler and plugin system to automatically catch and serialize exceptions.

### Pattern: Register Exception Handlers

```typescript
import Fastify from 'fastify';
import { registerExceptionHandlers, requestIdPlugin } from '@internal/common-exceptions';

const server = Fastify({ logger: true });

// Register request ID plugin (generates correlation IDs)
await server.register(requestIdPlugin);

// Register exception handlers (catches and serializes exceptions)
registerExceptionHandlers(server);

// Your routes...
server.get('/users/:id', async (request, reply) => {
  const user = await findUser(request.params.id);
  if (!user) {
    throw new NotFoundException({
      message: `User ${request.params.id} not found`,
      details: { userId: request.params.id },
    });
  }
  return user;
});

await server.listen({ port: 3000 });
```

### Usage with Zod Validation

```typescript
import { z } from 'zod';
import { ValidationException, normalizeZodErrors } from '@internal/common-exceptions';

const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().positive(),
});

server.post('/users', async (request, reply) => {
  const result = UserSchema.safeParse(request.body);

  if (!result.success) {
    const errors = normalizeZodErrors(result.error.issues);
    throw ValidationException.fromFieldErrors(errors, {
      message: `Validation failed for ${errors.length} field(s)`,
    });
  }

  return createUser(result.data);
});
```

### Usage with AJV Validation

```typescript
import Ajv from 'ajv';
import { ValidationException, normalizeAjvErrors } from '@internal/common-exceptions';

const ajv = new Ajv();
const validate = ajv.compile(userSchema);

server.post('/users', async (request, reply) => {
  const valid = validate(request.body);

  if (!valid && validate.errors) {
    const errors = normalizeAjvErrors(validate.errors);
    throw ValidationException.fromFieldErrors(errors);
  }

  return createUser(request.body);
});
```

### Custom Error Handler Extension

```typescript
import { createErrorHandler, BaseHttpException } from '@internal/common-exceptions';

// Create custom error handler with additional logging
const errorHandler = createErrorHandler({
  onError: (error, request, reply) => {
    // Custom logging or metrics
    metrics.increment('api.errors', { code: error.code });
  },
  includeStack: process.env.NODE_ENV === 'development',
});

server.setErrorHandler(errorHandler);
```

### Request ID Plugin Options

```typescript
import { requestIdPlugin } from '@internal/common-exceptions';

await server.register(requestIdPlugin, {
  header: 'X-Request-Id',      // Header to read/write request ID
  generator: () => uuidv4(),   // Custom ID generator
  setHeader: true,             // Include in response headers
});
```

## FastAPI Integration (Python)

The integration uses FastAPI's exception handlers and ASGI middleware to automatically catch and serialize exceptions.

### Pattern: Register Exception Handlers

```python
from fastapi import FastAPI
from common_exceptions import register_exception_handlers, RequestIdMiddleware

app = FastAPI()

# Add request ID middleware (generates correlation IDs)
app.add_middleware(RequestIdMiddleware)

# Register exception handlers (catches and serializes exceptions)
register_exception_handlers(app)

# Your routes...
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

### Usage with Pydantic Validation

```python
from pydantic import BaseModel, EmailStr, Field
from fastapi import FastAPI
from common_exceptions import register_exception_handlers

app = FastAPI()
register_exception_handlers(app)

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    age: int = Field(..., gt=0)

@app.post("/users")
async def create_user(user: UserCreate):
    # Pydantic validation errors are automatically caught
    # and converted to ValidationException by the handler
    return await save_user(user)
```

### Manual Validation

```python
from common_exceptions import ValidationException

@app.post("/validate")
async def validate_input(name: str = None, email: str = None):
    errors = []

    if not name:
        errors.append({"field": "query.name", "message": "Name is required"})

    if not email:
        errors.append({"field": "query.email", "message": "Email is required"})
    elif "@" not in email:
        errors.append({"field": "query.email", "message": "Invalid email format"})

    if errors:
        raise ValidationException.from_field_errors(
            errors=errors,
            message=f"Validation failed for {len(errors)} field(s)",
        )

    return {"status": "valid"}
```

### Lifespan Context Manager

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from common_exceptions import create_logger, register_exception_handlers

logger = create_logger("api", __file__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Application starting")
    register_exception_handlers(app)
    yield
    # Shutdown
    logger.info("Application shutting down")

app = FastAPI(lifespan=lifespan)
```

### Custom Exception Handler Extension

```python
from fastapi import Request
from fastapi.responses import JSONResponse
from common_exceptions import BaseHttpException

@app.exception_handler(BaseHttpException)
async def custom_exception_handler(request: Request, exc: BaseHttpException):
    # Custom logging or metrics
    logger.error(f"API error: {exc.code}", extra=exc.to_log_entry())

    return JSONResponse(
        status_code=exc.status,
        content=exc.to_response(),
        headers={"X-Request-Id": exc.request_id} if exc.request_id else {},
    )
```

### Request ID Middleware Options

```python
from common_exceptions import RequestIdMiddleware

app.add_middleware(
    RequestIdMiddleware,
    header_name="X-Request-Id",     # Header to read/write request ID
    generator=lambda: str(uuid4()), # Custom ID generator
)
```

## Response Format

Both implementations produce identical JSON response format:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User user-123 not found",
    "status": 404,
    "details": {
      "userId": "user-123"
    },
    "requestId": "req-abc-123",
    "timestamp": "2025-01-19T10:00:00.000Z"
  }
}
```

## HTTP Headers

Both implementations set appropriate HTTP headers:

| Header | Description |
|--------|-------------|
| `X-Request-Id` | Correlation ID for tracing |
| `Content-Type` | `application/json` |
| `Retry-After` | Seconds to wait (for 429/503 responses) |

## Error Logging

Both implementations log errors with structured format:

```json
{
  "level": "ERROR",
  "category": "exception",
  "message": "User user-123 not found",
  "timestamp": "2025-01-19T10:00:00.000Z",
  "error": {
    "type": "NotFoundException",
    "code": "NOT_FOUND",
    "status": 404,
    "details": { "userId": "user-123" }
  },
  "requestId": "req-abc-123"
}
```

## Authentication/Authorization Pattern

### Fastify

```typescript
import { NotAuthenticatedException, NotAuthorizedException } from '@internal/common-exceptions';

// Prehandler for authentication
server.addHook('preHandler', async (request, reply) => {
  const token = request.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new NotAuthenticatedException({
      message: 'Authorization header required',
    });
  }

  try {
    request.user = await verifyToken(token);
  } catch {
    throw new NotAuthenticatedException({
      message: 'Invalid or expired token',
    });
  }
});

// Route-level authorization
server.get('/admin', {
  preHandler: async (request) => {
    if (request.user.role !== 'admin') {
      throw new NotAuthorizedException({
        message: 'Admin access required',
        details: { requiredRole: 'admin', userRole: request.user.role },
      });
    }
  },
}, async (request, reply) => {
  return { message: 'Admin area' };
});
```

### FastAPI

```python
from fastapi import Depends, Header
from common_exceptions import NotAuthenticatedException, NotAuthorizedException

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise NotAuthenticatedException(message="Authorization header required")

    token = authorization.replace("Bearer ", "")
    try:
        return await verify_token(token)
    except Exception:
        raise NotAuthenticatedException(message="Invalid or expired token")

async def require_admin(user = Depends(get_current_user)):
    if user.role != "admin":
        raise NotAuthorizedException(
            message="Admin access required",
            details={"requiredRole": "admin", "userRole": user.role},
        )
    return user

@app.get("/admin")
async def admin_area(user = Depends(require_admin)):
    return {"message": "Admin area"}
```

## Upstream Service Integration

### Fastify with Undici

```typescript
import { wrapUndiciErrors, checkUpstreamStatus } from '@internal/common-exceptions';

server.get('/payment/:id', async (request, reply) => {
  const response = await wrapUndiciErrors(
    () => fetch(`https://payment-api.internal/payments/${request.params.id}`),
    { service: 'payment-api', operation: 'getPayment' }
  );

  // Check upstream status
  checkUpstreamStatus(response, 'payment-api', 'getPayment');

  return response.json();
});
```

### FastAPI with HTTPX

```python
import httpx
from common_exceptions import wrap_httpx_errors

@wrap_httpx_errors(service="payment-api")
async def get_payment(payment_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://payment-api.internal/payments/{payment_id}"
        )
        response.raise_for_status()
        return response.json()

@app.get("/payment/{payment_id}")
async def get_payment_route(payment_id: str):
    return await get_payment(payment_id)
```
