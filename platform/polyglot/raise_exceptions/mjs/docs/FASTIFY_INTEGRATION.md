# Fastify Integration Guide

Detailed guide for integrating common-exceptions with Fastify applications.

## Basic Setup

```typescript
import Fastify from 'fastify';
import { registerExceptionHandlers, requestIdPlugin } from '@internal/common-exceptions';

const server = Fastify({ logger: true });

// Add request ID plugin for correlation
await server.register(requestIdPlugin);

// Register all exception handlers
registerExceptionHandlers(server);

await server.listen({ port: 3000 });
```

## Request ID Plugin

The `requestIdPlugin` generates unique correlation IDs for each request:

```typescript
import { requestIdPlugin } from '@internal/common-exceptions';

// Default configuration
await server.register(requestIdPlugin);

// Custom configuration
await server.register(requestIdPlugin, {
  header: 'X-Request-Id',
  generator: () => crypto.randomUUID(),
  setHeader: true,
});
```

### Accessing Request ID

```typescript
server.get('/example', async (request, reply) => {
  const requestId = request.id; // Fastify built-in
  return { requestId };
});
```

## Exception Handlers

The `registerExceptionHandlers` function sets up:

1. Error handler for `BaseHttpException`
2. Schema error formatter for AJV validation
3. Not found handler for unknown routes

### Custom Error Handler Extension

```typescript
import { createErrorHandler, BaseHttpException, createLogger } from '@internal/common-exceptions';

const logger = createLogger('api', __filename);

const errorHandler = createErrorHandler({
  onError: (error, request, reply) => {
    // Log the error
    logger.error(error.message, error.toLogEntry());

    // Add custom metrics
    metrics.increment('api.errors', { code: error.code });
  },
  includeStack: process.env.NODE_ENV === 'development',
});

server.setErrorHandler(errorHandler);
```

## Validation Errors

### Zod Validation

```typescript
import { z } from 'zod';
import { ValidationException, normalizeZodErrors } from '@internal/common-exceptions';

const UserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
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

### AJV Validation (Fastify Built-in)

```typescript
import { normalizeAjvErrors } from '@internal/common-exceptions';

const schema = {
  body: {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: { type: 'string', minLength: 2 },
      email: { type: 'string', format: 'email' },
    },
  },
};

server.post('/users', { schema }, async (request, reply) => {
  // AJV validation errors are automatically caught and formatted
  return createUser(request.body);
});
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
        {"field": "body.email", "message": "must match format \"email\""},
        {"field": "body.name", "message": "must NOT have fewer than 2 characters"}
      ]
    },
    "timestamp": "2025-01-19T10:00:00.000Z"
  }
}
```

### Manual Validation

```typescript
import { ValidationException } from '@internal/common-exceptions';

server.get('/validate', async (request, reply) => {
  const { name, email } = request.query as { name?: string; email?: string };
  const errors: Array<{ field: string; message: string; code?: string }> = [];

  if (!name) {
    errors.push({
      field: 'query.name',
      message: 'Name is required',
      code: 'required',
    });
  }

  if (!email) {
    errors.push({
      field: 'query.email',
      message: 'Email is required',
      code: 'required',
    });
  } else if (!email.includes('@')) {
    errors.push({
      field: 'query.email',
      message: 'Invalid email format',
      code: 'invalid_email',
    });
  }

  if (errors.length > 0) {
    throw ValidationException.fromFieldErrors(errors, {
      message: `Validation failed for ${errors.length} field(s)`,
    });
  }

  return { status: 'valid' };
});
```

## Authentication & Authorization

### Authentication Hook

```typescript
import { NotAuthenticatedException } from '@internal/common-exceptions';

// Declare module augmentation for user on request
declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}

server.addHook('preHandler', async (request, reply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new NotAuthenticatedException({
      message: 'Authorization header required',
    });
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new NotAuthenticatedException({
      message: 'Invalid authorization format',
      details: { expected: 'Bearer <token>' },
    });
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyJwt(token);
    request.user = await getUser(payload.sub);
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new NotAuthenticatedException({
        message: 'Token has expired',
        details: { hint: 'Request a new token' },
      });
    }
    throw new NotAuthenticatedException({ message: 'Invalid token' });
  }
});
```

### Authorization Decorator

```typescript
import { NotAuthorizedException } from '@internal/common-exceptions';

function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new NotAuthenticatedException({ message: 'Not authenticated' });
    }

    if (!roles.includes(request.user.role)) {
      throw new NotAuthorizedException({
        message: `One of [${roles.join(', ')}] role required`,
        details: {
          requiredRoles: roles,
          userRole: request.user.role,
        },
      });
    }
  };
}

server.delete('/users/:userId', {
  preHandler: requireRole('admin'),
}, async (request, reply) => {
  await deleteUser(request.params.userId);
  reply.status(204);
});
```

## Resource Operations

### Not Found Pattern

```typescript
import { NotFoundException } from '@internal/common-exceptions';

server.get<{ Params: { userId: string } }>('/users/:userId', async (request, reply) => {
  const user = await findUser(request.params.userId);

  if (!user) {
    throw new NotFoundException({
      message: `User with ID '${request.params.userId}' not found`,
      details: { userId: request.params.userId },
    });
  }

  return user;
});
```

### Conflict Pattern

```typescript
import { ConflictException } from '@internal/common-exceptions';

server.post('/users', async (request, reply) => {
  const { email } = request.body as { email: string };
  const existing = await findUserByEmail(email);

  if (existing) {
    throw new ConflictException({
      message: 'User with this email already exists',
      details: {
        email,
        existingId: existing.id,
      },
    });
  }

  const user = await createUser(request.body);
  reply.status(201);
  return user;
});
```

## Rate Limiting

```typescript
import { TooManyRequestsException } from '@internal/common-exceptions';

// Simple in-memory rate limiter (use Redis in production)
const requestCounts = new Map<string, number>();

server.addHook('preHandler', async (request, reply) => {
  const clientIp = request.ip;
  const count = (requestCounts.get(clientIp) ?? 0) + 1;
  requestCounts.set(clientIp, count);

  const limit = 100;
  if (count > limit) {
    throw new TooManyRequestsException({
      message: 'Rate limit exceeded',
      retryAfter: 60,
      details: {
        limit,
        current: count,
        window: '1m',
      },
    });
  }
});
```

## Undici Client Integration

```typescript
import { wrapUndiciErrors, checkUpstreamStatus, UpstreamServiceException } from '@internal/common-exceptions';

async function chargePayment(amount: number, currency: string): Promise<Payment> {
  const response = await wrapUndiciErrors(
    () => fetch('https://payment.internal/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency }),
    }),
    { service: 'payment-api', operation: 'charge', timeoutMs: 30000 }
  );

  checkUpstreamStatus(response, 'payment-api', 'charge');
  return response.json();
}

server.post('/checkout', async (request, reply) => {
  try {
    const payment = await chargePayment(order.total, 'USD');
    return { paymentId: payment.id };
  } catch (error) {
    if (error instanceof UpstreamServiceException) {
      logger.error(`Payment failed: ${error.message}`);
    }
    throw error;
  }
});
```

## Plugin Pattern

Create a reusable plugin for your application:

```typescript
import fp from 'fastify-plugin';
import { registerExceptionHandlers, requestIdPlugin, createLogger } from '@internal/common-exceptions';

const logger = createLogger('app', __filename);

export const exceptionPlugin = fp(async (fastify, opts) => {
  // Register request ID
  await fastify.register(requestIdPlugin);

  // Register exception handlers
  registerExceptionHandlers(fastify);

  logger.info('Exception handling configured');
});

// Usage
const server = Fastify();
await server.register(exceptionPlugin);
```

## Type-Safe Routes

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { NotFoundException } from '@internal/common-exceptions';

interface GetUserParams {
  userId: string;
}

interface CreateUserBody {
  name: string;
  email: string;
}

server.get<{ Params: GetUserParams }>(
  '/users/:userId',
  async (request: FastifyRequest<{ Params: GetUserParams }>, reply: FastifyReply) => {
    const { userId } = request.params;
    const user = await findUser(userId);

    if (!user) {
      throw new NotFoundException({
        message: `User ${userId} not found`,
        details: { userId },
      });
    }

    return user;
  }
);

server.post<{ Body: CreateUserBody }>(
  '/users',
  async (request: FastifyRequest<{ Body: CreateUserBody }>, reply: FastifyReply) => {
    const user = await createUser(request.body);
    reply.status(201);
    return user;
  }
);
```
