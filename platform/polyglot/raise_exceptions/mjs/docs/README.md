# Common Exceptions - TypeScript Package

Standardized exception handling for Fastify applications with Undici client support.

## Installation

```bash
npm install @internal/common-exceptions
# or with pnpm
pnpm add @internal/common-exceptions
```

## Quick Start

```typescript
import Fastify from 'fastify';
import {
  registerExceptionHandlers,
  requestIdPlugin,
  NotFoundException,
  ValidationException,
} from '@internal/common-exceptions';

const server = Fastify({ logger: true });

// Register plugins and handlers
await server.register(requestIdPlugin);
registerExceptionHandlers(server);

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

## Features

- 16 pre-defined exception classes for common HTTP errors
- Automatic serialization to standardized JSON response format
- Zod and AJV validation error normalization
- Undici error wrapping for upstream service calls
- Request ID correlation plugin
- CLI formatting for developer tools
- Agent-friendly error context for LLM integration
- Comprehensive logging with LOG_LEVEL support
- Full TypeScript support with type definitions

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

```typescript
import { createLogger } from '@internal/common-exceptions';

const logger = createLogger('my-module', __filename);

// LOG_LEVEL defaults to "debug"
// Override with environment variable: LOG_LEVEL=info

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

## Undici Integration

Wrap Undici/fetch calls to automatically convert exceptions:

```typescript
import { wrapUndiciErrors, checkUpstreamStatus } from '@internal/common-exceptions';

async function chargePayment(amount: number): Promise<PaymentResult> {
  const response = await wrapUndiciErrors(
    () => fetch('https://payment-api.internal/charge', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
    { service: 'payment-api', operation: 'charge' }
  );

  checkUpstreamStatus(response, 'payment-api', 'charge');
  return response.json();
}
```

## SDK Functions

```typescript
import {
  createException,
  parseErrorResponse,
  isCommonException,
  formatForCli,
  toAgentContext,
} from '@internal/common-exceptions';

// Create exception dynamically
const exc = createException({
  code: 'NOT_FOUND',
  message: 'Resource not found',
});

// Parse upstream error response
const exc = parseErrorResponse(responseJson);

// Type guard for exception checking
if (isCommonException(error)) {
  console.log(formatForCli(error));
}

// Get agent-friendly context
const context = toAgentContext(error);
```

## Requirements

- Node.js >= 18.0.0
- Fastify >= 4.0.0
- TypeScript >= 5.0.0 (for development)
- Zod >= 3.22.0 (optional, for validation)
