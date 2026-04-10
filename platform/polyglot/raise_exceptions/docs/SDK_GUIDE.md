# Common Exceptions SDK Guide

The common-exceptions SDK provides a high-level API for CLI tools, LLM Agents, and Developer Tools to interact with the exception handling system.

## Usage

### Node.js

```typescript
import {
  createException,
  parseErrorResponse,
  isCommonException,
  formatForCli,
  toAgentContext,
  ErrorCode,
} from '@internal/common-exceptions';

// Create exception from error code
const exc = createException({
  code: ErrorCode.NOT_FOUND,
  message: 'User not found',
  details: { userId: 'user-123' },
  requestId: 'req-abc',
});

// Parse error response from upstream service
const response = await fetch('/api/users/123');
if (!response.ok) {
  const json = await response.json();
  const exc = parseErrorResponse(json);
  if (exc) {
    console.error(formatForCli(exc));
  }
}

// Check if error is a common exception
try {
  await someOperation();
} catch (error) {
  if (isCommonException(error)) {
    const context = toAgentContext(error);
    console.log(`Retryable: ${context.isRetryable}`);
  }
}
```

### Python

```python
from common_exceptions import (
    create_exception,
    parse_error_response,
    is_common_exception,
    format_for_cli,
    to_agent_context,
    ErrorCode,
)

# Create exception from error code
exc = create_exception(
    code=ErrorCode.NOT_FOUND,
    message='User not found',
    details={'userId': 'user-123'},
    request_id='req-abc',
)

# Parse error response from upstream service
import httpx
response = httpx.get('/api/users/123')
if not response.is_success:
    exc = parse_error_response(response.json())
    if exc:
        print(format_for_cli(exc))

# Check if error is a common exception
try:
    some_operation()
except Exception as error:
    if is_common_exception(error):
        context = to_agent_context(error)
        print(f"Retryable: {context['is_retryable']}")
```

## Features

### Factory Operations

- `createException` / `create_exception`: Create typed exceptions from error codes
- `parseErrorResponse` / `parse_error_response`: Parse upstream error responses
- `isCommonException` / `is_common_exception`: Type guard for common exceptions

### CLI Operations

- `formatForCli` / `format_for_cli`: Format exception for terminal output
- `printError` / `print_error`: Print formatted exception to stderr

### Agent Operations

- `toAgentContext` / `to_agent_context`: Convert exception to agent-friendly context

## CLI Integration

The SDK provides CLI-friendly formatting with optional color support.

### Node.js

```typescript
import { formatForCli, printError, NotFoundException } from '@internal/common-exceptions';

const exc = new NotFoundException({
  message: 'Configuration file not found',
  details: { path: './config.yaml' },
});

// Get formatted string
const output = formatForCli(exc, { useColors: true });
console.error(output);

// Or print directly
printError(exc, { useColors: process.stdout.isTTY });
```

### Python

```python
from common_exceptions import format_for_cli, print_error, NotFoundException

exc = NotFoundException(
    message='Configuration file not found',
    details={'path': './config.yaml'},
)

# Get formatted string
output = format_for_cli(exc, use_colors=True)
print(output, file=sys.stderr)

# Or print directly
print_error(exc, use_colors=sys.stdout.isatty())
```

### Output Format

```
ERROR [NOT_FOUND] Configuration file not found
  Status: 404
  Details:
    path: ./config.yaml
  Request ID: req-123
  Timestamp: 2025-01-19T10:00:00.000Z
```

## Agent Integration

The SDK provides context for LLM agents to understand and handle errors.

### Node.js

```typescript
import { toAgentContext, UpstreamServiceException } from '@internal/common-exceptions';

const exc = new UpstreamServiceException({
  message: 'Payment service returned 503',
  service: 'payment-api',
  operation: 'charge',
  upstreamStatus: 503,
});

const context = toAgentContext(exc);

// Agent-friendly properties
console.log(context.errorType);      // 'UpstreamServiceException'
console.log(context.isRetryable);    // true
console.log(context.isServerError);  // true
console.log(context.suggestedAction); // 'Retry the operation after a delay'
console.log(context.userMessage);    // 'The service is temporarily unavailable'
```

### Python

```python
from common_exceptions import to_agent_context, UpstreamServiceException

exc = UpstreamServiceException(
    message='Payment service returned 503',
    service='payment-api',
    operation='charge',
    upstream_status=503,
)

context = to_agent_context(exc)

# Agent-friendly properties
print(context['error_type'])      # 'UpstreamServiceException'
print(context['is_retryable'])    # True
print(context['is_server_error']) # True
print(context['suggested_action']) # 'Retry the operation after a delay'
print(context['user_message'])    # 'The service is temporarily unavailable'
```

### Agent Context Properties

| Property | Type | Description |
|----------|------|-------------|
| `errorType` | string | Exception class name |
| `errorCode` | string | Machine-readable error code |
| `httpStatus` | number | HTTP status code |
| `message` | string | Original error message |
| `isRetryable` | boolean | Whether operation can be retried |
| `isClientError` | boolean | True for 4xx status codes |
| `isServerError` | boolean | True for 5xx status codes |
| `suggestedAction` | string | Recommended action for the agent |
| `userMessage` | string | User-friendly error message |
| `details` | object | Additional error context |
| `requestId` | string | Correlation ID for tracing |

### Suggested Actions by Error Type

| Error Type | Suggested Action |
|------------|------------------|
| `NotAuthenticatedException` | Request new authentication credentials |
| `NotAuthorizedException` | Request elevated permissions or different resource |
| `NotFoundException` | Verify resource exists or create it |
| `BadRequestException` | Review and correct the request parameters |
| `ValidationException` | Fix validation errors in the input |
| `ConflictException` | Resolve conflict or use different identifier |
| `TooManyRequestsException` | Wait for rate limit window to reset |
| `ConnectTimeoutException` | Retry after delay or check service availability |
| `UpstreamServiceException` | Retry the operation or check upstream service |
| `InternalServerException` | Report error and retry later |

## Logging Integration

The SDK integrates with the built-in logger.

### Node.js

```typescript
import { createLogger, NotFoundException } from '@internal/common-exceptions';

const logger = createLogger('my-cli', __filename);

try {
  await findResource();
} catch (error) {
  if (error instanceof NotFoundException) {
    const logEntry = error.toLogEntry();
    logger.error(logEntry.message, logEntry);
  }
}
```

### Python

```python
from common_exceptions import create_logger, NotFoundException

logger = create_logger('my-cli', __file__)

try:
    find_resource()
except NotFoundException as error:
    log_entry = error.to_log_entry()
    logger.error(log_entry['message'], extra=log_entry)
```

## Type Safety

The SDK provides full type safety for exception creation.

### Node.js

```typescript
import { createException, ErrorCode, BaseHttpException } from '@internal/common-exceptions';

// Type-safe exception creation
const exc: BaseHttpException = createException({
  code: ErrorCode.NOT_FOUND, // IDE autocomplete for error codes
  message: 'User not found',
});

// Type guard narrows type
if (isCommonException(error)) {
  error.status; // TypeScript knows this exists
}
```

### Python

```python
from common_exceptions import create_exception, ErrorCode, BaseHttpException

# Type hints for exception creation
exc: BaseHttpException = create_exception(
    code=ErrorCode.NOT_FOUND,  # IDE autocomplete for error codes
    message='User not found',
)

# Type narrowing with isinstance
if is_common_exception(error):
    print(error.status)  # Type checker knows this exists
```
