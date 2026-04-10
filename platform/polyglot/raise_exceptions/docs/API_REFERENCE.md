# Common Exceptions API Reference

Complete API reference for the common-exceptions polyglot package, showing type signatures and interfaces for both TypeScript and Python implementations.

## Core Components

### ErrorCode

Machine-readable error codes that map to HTTP status codes. All 22 codes are identical between Python and TypeScript.

**TypeScript**
```typescript
const enum ErrorCode {
  // Authentication (401)
  AUTH_NOT_AUTHENTICATED = 'AUTH_NOT_AUTHENTICATED',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_REVOKED = 'AUTH_TOKEN_REVOKED',

  // Authorization (403)
  AUTHZ_NOT_AUTHORIZED = 'AUTHZ_NOT_AUTHORIZED',
  AUTHZ_INSUFFICIENT_PERMISSIONS = 'AUTHZ_INSUFFICIENT_PERMISSIONS',
  AUTHZ_RESOURCE_FORBIDDEN = 'AUTHZ_RESOURCE_FORBIDDEN',

  // Client Errors
  BAD_REQUEST = 'BAD_REQUEST',           // 400
  NOT_FOUND = 'NOT_FOUND',               // 404
  VALIDATION_FAILED = 'VALIDATION_FAILED', // 422
  CONFLICT = 'CONFLICT',                 // 409
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS', // 429

  // Outbound/Upstream Errors
  CONNECT_TIMEOUT = 'CONNECT_TIMEOUT',   // 503
  READ_TIMEOUT = 'READ_TIMEOUT',         // 504
  WRITE_TIMEOUT = 'WRITE_TIMEOUT',       // 504
  NETWORK_ERROR = 'NETWORK_ERROR',       // 503
  UPSTREAM_SERVICE_ERROR = 'UPSTREAM_SERVICE_ERROR', // 502
  UPSTREAM_TIMEOUT = 'UPSTREAM_TIMEOUT', // 504

  // Server Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR', // 500
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',     // 503
  BAD_GATEWAY = 'BAD_GATEWAY',           // 502
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',   // 504
}

function getStatusForCode(code: ErrorCode): number;
function getCodeCategory(code: ErrorCode): 'auth' | 'authz' | 'client' | 'outbound' | 'server';
```

**Python**
```python
class ErrorCode(str, Enum):
    # Authentication (401)
    AUTH_NOT_AUTHENTICATED = "AUTH_NOT_AUTHENTICATED"
    AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED"
    AUTH_TOKEN_INVALID = "AUTH_TOKEN_INVALID"
    AUTH_TOKEN_REVOKED = "AUTH_TOKEN_REVOKED"

    # Authorization (403)
    AUTHZ_NOT_AUTHORIZED = "AUTHZ_NOT_AUTHORIZED"
    AUTHZ_INSUFFICIENT_PERMISSIONS = "AUTHZ_INSUFFICIENT_PERMISSIONS"
    AUTHZ_RESOURCE_FORBIDDEN = "AUTHZ_RESOURCE_FORBIDDEN"

    # Client Errors
    BAD_REQUEST = "BAD_REQUEST"
    NOT_FOUND = "NOT_FOUND"
    VALIDATION_FAILED = "VALIDATION_FAILED"
    CONFLICT = "CONFLICT"
    TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS"

    # Outbound/Upstream Errors
    CONNECT_TIMEOUT = "CONNECT_TIMEOUT"
    READ_TIMEOUT = "READ_TIMEOUT"
    WRITE_TIMEOUT = "WRITE_TIMEOUT"
    NETWORK_ERROR = "NETWORK_ERROR"
    UPSTREAM_SERVICE_ERROR = "UPSTREAM_SERVICE_ERROR"
    UPSTREAM_TIMEOUT = "UPSTREAM_TIMEOUT"

    # Server Errors
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    BAD_GATEWAY = "BAD_GATEWAY"
    GATEWAY_TIMEOUT = "GATEWAY_TIMEOUT"

def get_status_for_code(code: ErrorCode) -> int: ...
def get_code_category(code: ErrorCode) -> Literal['auth', 'authz', 'client', 'outbound', 'server']: ...
```

### BaseHttpException

The base class for all HTTP exceptions. Provides serialization methods for API responses and logging.

**TypeScript**
```typescript
interface BaseHttpExceptionOptions {
  code?: ErrorCode | string;
  message?: string;
  status?: number;
  details?: Record<string, unknown>;
  requestId?: string;
}

interface LogEntry {
  level: 'ERROR' | 'WARN' | 'INFO';
  category: 'exception';
  message: string;
  timestamp: string;
  error: {
    type: string;
    code: string;
    status: number;
    details?: Record<string, unknown>;
    stack?: string;
  };
  requestId?: string;
}

class BaseHttpException extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details: Record<string, unknown>;
  readonly requestId?: string;
  readonly timestamp: string;

  constructor(options: BaseHttpExceptionOptions);

  toResponse(): ErrorResponse;
  toLogEntry(): LogEntry;
}
```

**Python**
```python
@dataclass
class LogEntry:
    level: Literal['ERROR', 'WARN', 'INFO']
    category: Literal['exception']
    message: str
    timestamp: str
    error: dict
    request_id: Optional[str] = None

class BaseHttpException(Exception):
    code: ErrorCode
    message: str
    status: int
    details: dict
    request_id: Optional[str]
    timestamp: str

    def __init__(
        self,
        code: Optional[ErrorCode] = None,
        message: Optional[str] = None,
        status: Optional[int] = None,
        details: Optional[dict] = None,
        request_id: Optional[str] = None,
    ) -> None: ...

    def to_response(self) -> dict: ...
    def to_log_entry(self) -> dict: ...
```

### ErrorResponse

Standardized error response envelope for API responses.

**TypeScript**
```typescript
interface ErrorDetail {
  code: string;
  message: string;
  status: number;
  timestamp: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

interface ErrorResponse {
  error: ErrorDetail;
}

interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}

interface UpstreamErrorDetail {
  service: string;
  operation?: string;
  statusCode?: number;
  timeoutMs?: number;
}
```

**Python**
```python
class ErrorDetail(BaseModel):
    code: str
    message: str
    status: int
    timestamp: str
    details: Optional[dict] = None
    request_id: Optional[str] = Field(None, alias='requestId')

class ErrorResponse(BaseModel):
    error: ErrorDetail

class ValidationErrorDetail(BaseModel):
    field: str
    message: str
    code: Optional[str] = None

class UpstreamErrorDetail(BaseModel):
    service: str
    operation: Optional[str] = None
    status_code: Optional[int] = None
    timeout_ms: Optional[int] = None
```

## Inbound Exceptions

Exceptions raised when processing incoming client requests.

### NotAuthenticatedException

Raised when authentication is required but not provided or invalid.

**TypeScript**
```typescript
class NotAuthenticatedException extends BaseHttpException {
  // code: AUTH_NOT_AUTHENTICATED
  // status: 401
  // default message: 'Authentication required'
}
```

**Python**
```python
class NotAuthenticatedException(BaseHttpException):
    # code: AUTH_NOT_AUTHENTICATED
    # status: 401
    # default message: 'Authentication required'
```

### NotAuthorizedException

Raised when authenticated user lacks required permissions.

**TypeScript**
```typescript
class NotAuthorizedException extends BaseHttpException {
  // code: AUTHZ_NOT_AUTHORIZED
  // status: 403
  // default message: 'Access denied'
}
```

**Python**
```python
class NotAuthorizedException(BaseHttpException):
    # code: AUTHZ_NOT_AUTHORIZED
    # status: 403
    # default message: 'Access denied'
```

### NotFoundException

Raised when a requested resource does not exist.

**TypeScript**
```typescript
class NotFoundException extends BaseHttpException {
  // code: NOT_FOUND
  // status: 404
  // default message: 'Resource not found'
}
```

**Python**
```python
class NotFoundException(BaseHttpException):
    # code: NOT_FOUND
    # status: 404
    # default message: 'Resource not found'
```

### BadRequestException

Raised for malformed or invalid request syntax.

**TypeScript**
```typescript
class BadRequestException extends BaseHttpException {
  // code: BAD_REQUEST
  // status: 400
  // default message: 'Bad request'
}
```

**Python**
```python
class BadRequestException(BaseHttpException):
    # code: BAD_REQUEST
    # status: 400
    # default message: 'Bad request'
```

### ValidationException

Raised when input validation fails. Supports field-level errors.

**TypeScript**
```typescript
interface ValidationExceptionOptions extends BaseHttpExceptionOptions {
  errors?: ValidationErrorDetail[];
}

class ValidationException extends BaseHttpException {
  // code: VALIDATION_FAILED
  // status: 422
  // default message: 'Validation failed'

  readonly errors: ValidationErrorDetail[];

  static fromFieldErrors(
    errors: ValidationErrorDetail[],
    options?: Partial<ValidationExceptionOptions>
  ): ValidationException;
}
```

**Python**
```python
class ValidationException(BaseHttpException):
    # code: VALIDATION_FAILED
    # status: 422
    # default message: 'Validation failed'

    errors: list[dict]

    @classmethod
    def from_field_errors(
        cls,
        errors: list[dict],
        message: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> 'ValidationException': ...
```

### ConflictException

Raised when a resource conflict occurs (e.g., duplicate entry).

**TypeScript**
```typescript
class ConflictException extends BaseHttpException {
  // code: CONFLICT
  // status: 409
  // default message: 'Resource conflict'
}
```

**Python**
```python
class ConflictException(BaseHttpException):
    # code: CONFLICT
    # status: 409
    # default message: 'Resource conflict'
```

### TooManyRequestsException

Raised when rate limit is exceeded. Supports retry-after header.

**TypeScript**
```typescript
interface TooManyRequestsExceptionOptions extends BaseHttpExceptionOptions {
  retryAfter?: number;
}

class TooManyRequestsException extends BaseHttpException {
  // code: TOO_MANY_REQUESTS
  // status: 429
  // default message: 'Too many requests'

  readonly retryAfter?: number;
}
```

**Python**
```python
class TooManyRequestsException(BaseHttpException):
    # code: TOO_MANY_REQUESTS
    # status: 429
    # default message: 'Too many requests'

    retry_after: Optional[int]
```

## Outbound Exceptions

Exceptions raised when calling upstream services.

### ConnectTimeoutException

Raised when connection to upstream service times out.

**TypeScript**
```typescript
interface TimeoutExceptionOptions extends BaseHttpExceptionOptions {
  service?: string;
  operation?: string;
  timeoutMs?: number;
}

class ConnectTimeoutException extends BaseHttpException {
  // code: CONNECT_TIMEOUT
  // status: 503

  readonly service?: string;
  readonly operation?: string;
  readonly timeoutMs?: number;
}
```

**Python**
```python
class ConnectTimeoutException(BaseHttpException):
    # code: CONNECT_TIMEOUT
    # status: 503

    service: Optional[str]
    operation: Optional[str]
    timeout_ms: Optional[int]
```

### ReadTimeoutException / WriteTimeoutException

Raised when read/write operations to upstream service time out.

**TypeScript**
```typescript
class ReadTimeoutException extends BaseHttpException {
  // code: READ_TIMEOUT, status: 504
}

class WriteTimeoutException extends BaseHttpException {
  // code: WRITE_TIMEOUT, status: 504
}
```

**Python**
```python
class ReadTimeoutException(BaseHttpException):
    # code: READ_TIMEOUT, status: 504

class WriteTimeoutException(BaseHttpException):
    # code: WRITE_TIMEOUT, status: 504
```

### NetworkException

Raised for network-level failures (DNS, connection refused, etc.).

**TypeScript**
```typescript
class NetworkException extends BaseHttpException {
  // code: NETWORK_ERROR
  // status: 503

  readonly service?: string;
}
```

**Python**
```python
class NetworkException(BaseHttpException):
    # code: NETWORK_ERROR
    # status: 503

    service: Optional[str]
```

### UpstreamServiceException

Raised when upstream service returns an error response.

**TypeScript**
```typescript
interface UpstreamServiceExceptionOptions extends BaseHttpExceptionOptions {
  service?: string;
  operation?: string;
  upstreamStatus?: number;
}

class UpstreamServiceException extends BaseHttpException {
  // code: UPSTREAM_SERVICE_ERROR
  // status: 502

  readonly service?: string;
  readonly operation?: string;
  readonly upstreamStatus?: number;
}
```

**Python**
```python
class UpstreamServiceException(BaseHttpException):
    # code: UPSTREAM_SERVICE_ERROR
    # status: 502

    service: Optional[str]
    operation: Optional[str]
    upstream_status: Optional[int]
```

### UpstreamTimeoutException

Raised when upstream service request times out.

**TypeScript**
```typescript
class UpstreamTimeoutException extends BaseHttpException {
  // code: UPSTREAM_TIMEOUT
  // status: 504

  readonly service?: string;
  readonly operation?: string;
  readonly timeoutMs?: number;
}
```

**Python**
```python
class UpstreamTimeoutException(BaseHttpException):
    # code: UPSTREAM_TIMEOUT
    # status: 504

    service: Optional[str]
    operation: Optional[str]
    timeout_ms: Optional[int]
```

## Internal Exceptions

Exceptions for server-side errors.

### InternalServerException

Raised for unexpected server errors.

**TypeScript**
```typescript
class InternalServerException extends BaseHttpException {
  // code: INTERNAL_SERVER_ERROR
  // status: 500
}
```

**Python**
```python
class InternalServerException(BaseHttpException):
    # code: INTERNAL_SERVER_ERROR
    # status: 500
```

### ServiceUnavailableException

Raised when service is temporarily unavailable.

**TypeScript**
```typescript
class ServiceUnavailableException extends BaseHttpException {
  // code: SERVICE_UNAVAILABLE
  // status: 503

  readonly retryAfter?: number;
}
```

**Python**
```python
class ServiceUnavailableException(BaseHttpException):
    # code: SERVICE_UNAVAILABLE
    # status: 503

    retry_after: Optional[int]
```

### BadGatewayException

Raised when acting as gateway and receives invalid response.

**TypeScript**
```typescript
class BadGatewayException extends BaseHttpException {
  // code: BAD_GATEWAY
  // status: 502
}
```

**Python**
```python
class BadGatewayException(BaseHttpException):
    # code: BAD_GATEWAY
    # status: 502
```

## SDK

### Factory Functions

**TypeScript**
```typescript
function createException(options: {
  code: ErrorCode | string;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
  requestId?: string;
}): BaseHttpException;

function parseErrorResponse(response: ErrorResponse): BaseHttpException | null;

function isCommonException(error: unknown): error is BaseHttpException;
```

**Python**
```python
def create_exception(
    code: Union[ErrorCode, str],
    message: str,
    status: Optional[int] = None,
    details: Optional[dict] = None,
    request_id: Optional[str] = None,
) -> BaseHttpException: ...

def parse_error_response(response: dict) -> Optional[BaseHttpException]: ...

def is_common_exception(error: Any) -> bool: ...
```

### CLI Formatting

**TypeScript**
```typescript
interface FormatCliOptions {
  useColors?: boolean;
  includeTimestamp?: boolean;
  includeStack?: boolean;
}

function formatForCli(
  exception: BaseHttpException,
  options?: FormatCliOptions
): string;

function printError(
  exception: BaseHttpException,
  options?: FormatCliOptions
): void;
```

**Python**
```python
def format_for_cli(
    exception: BaseHttpException,
    use_colors: bool = True,
    include_timestamp: bool = True,
    include_stack: bool = False,
) -> str: ...

def print_error(
    exception: BaseHttpException,
    use_colors: bool = True,
) -> None: ...
```

### Agent Context

**TypeScript**
```typescript
interface AgentErrorContext {
  errorType: string;
  errorCode: string;
  httpStatus: number;
  message: string;
  isRetryable: boolean;
  isClientError: boolean;
  isServerError: boolean;
  suggestedAction: string;
  userMessage: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

function toAgentContext(exception: BaseHttpException): AgentErrorContext;
```

**Python**
```python
@dataclass
class AgentErrorContext:
    error_type: str
    error_code: str
    http_status: int
    message: str
    is_retryable: bool
    is_client_error: bool
    is_server_error: bool
    suggested_action: str
    user_message: str
    details: Optional[dict] = None
    request_id: Optional[str] = None

def to_agent_context(exception: BaseHttpException) -> AgentErrorContext: ...
```

## Logger

**TypeScript**
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

function createLogger(
  packageName: string,
  filename: string,
  level?: LogLevel,
  customLogger?: Logger
): Logger;
```

**Python**
```python
LogLevel = Literal['debug', 'info', 'warn', 'error']

def create(
    package_name: str,
    filename: str,
    level: Optional[LogLevel] = None,
    custom_logger: Optional[logging.Logger] = None,
) -> logging.Logger: ...
```
