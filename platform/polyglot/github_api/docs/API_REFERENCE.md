# GitHub API SDK API Reference

## Core Components

### GitHubClient

Base HTTP client for the GitHub REST API. Handles authentication, rate limit tracking and auto-wait, error mapping, and JSON parsing for all GitHub API requests.

**TypeScript**
```typescript
import { GitHubClient } from '@internal/github-api';

class GitHubClient {
  constructor(options?: {
    token?: string;
    baseUrl?: string;               // default: 'https://api.github.com'
    rateLimitAutoWait?: boolean;     // default: true
    rateLimitThreshold?: number;     // default: 0
    onRateLimit?: (info: RateLimitInfo) => void;
    logger?: Logger;
  });

  // Properties
  lastRateLimit: RateLimitInfo | null;

  // HTTP methods
  async get(path: string, options?: { params?: Record<string, any> }): Promise<object>;
  async post(path: string, body?: object, options?: object): Promise<object>;
  async put(path: string, body?: object, options?: object): Promise<object>;
  async patch(path: string, body?: object, options?: object): Promise<object>;
  async delete(path: string, options?: object): Promise<object>;

  // Raw response access (for pagination)
  async getRaw(path: string): Promise<Response>;

  // Rate limit endpoint
  async getRateLimit(): Promise<object>;
}
```

**Python**
```python
from github_api import GitHubClient

class GitHubClient:
    def __init__(
        self,
        token: str | None = None,
        *,
        base_url: str = "https://api.github.com",
        rate_limit_auto_wait: bool = True,
        rate_limit_threshold: int = 0,
        on_rate_limit: Callable[[RateLimitInfo], Awaitable[None]] | None = None,
        logger: logging.Logger | None = None,
    ) -> None: ...

    # Async context manager
    async def __aenter__(self) -> GitHubClient: ...
    async def __aexit__(self, exc_type, exc, tb) -> None: ...

    # Properties
    @property
    def token_info(self) -> TokenInfo: ...
    @property
    def last_rate_limit(self) -> RateLimitInfo | None: ...

    # HTTP methods
    async def get(self, path: str, *, params: dict | None = None) -> dict: ...
    async def post(self, path: str, *, json: dict | None = None) -> dict: ...
    async def put(self, path: str, *, json: dict | None = None) -> dict: ...
    async def patch(self, path: str, *, json: dict | None = None) -> dict: ...
    async def delete(self, path: str, *, params: dict | None = None) -> dict: ...

    # Raw response access (for pagination)
    async def get_raw(self, url: str, *, params: dict | None = None) -> httpx.Response: ...

    # Rate limit endpoint
    async def get_rate_limit(self) -> dict: ...

    # Lifecycle
    async def close(self) -> None: ...
```

### TokenInfo / ResolvedToken

Resolved GitHub authentication token with metadata.

**TypeScript**
```typescript
// resolveToken() returns a plain object:
interface ResolvedToken {
  token: string;
  source: string;
  type: TokenType;
}

type TokenType =
  | 'fine-grained'
  | 'classic-pat'
  | 'oauth'
  | 'user-to-server'
  | 'server-to-server'
  | 'legacy'
  | 'unknown';
```

**Python**
```python
from github_api import TokenInfo

TokenType = Literal[
    "fine-grained",
    "classic-pat",
    "oauth",
    "user-to-server",
    "server-to-server",
    "legacy",
    "unknown",
]

@dataclass(frozen=True)
class TokenInfo:
    token: str
    source: str
    type: TokenType
```

### Authentication Functions

Token resolution and masking utilities.

**TypeScript**
```typescript
import { resolveToken, maskToken } from '@internal/github-api';

function resolveToken(explicitToken?: string): ResolvedToken;
function maskToken(token: string): string;
```

**Python**
```python
from github_api import resolve_token, mask_token

def resolve_token(explicit_token: str | None = None) -> TokenInfo: ...
def mask_token(token: str) -> str: ...
```

Environment variable priority: `GITHUB_TOKEN` > `GH_TOKEN` > `GITHUB_ACCESS_TOKEN` > `GITHUB_PAT`. Raises `AuthError` if no token can be resolved.

### Error Hierarchy

All errors extend `GitHubError` (JS: `Error`, Python: `Exception`).

**TypeScript**
```typescript
import {
  GitHubError,
  AuthError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ConflictError,
  ForbiddenError,
  ServerError,
  mapResponseToError,
} from '@internal/github-api';

class GitHubError extends Error {
  constructor(message: string, status?: number, requestId?: string, documentationUrl?: string);
  status?: number;
  requestId?: string;
  documentationUrl?: string;
}

class AuthError extends GitHubError { /* status: 401 */ }
class NotFoundError extends GitHubError { /* status: 404 */ }
class ValidationError extends GitHubError { /* status: 422 */ }
class RateLimitError extends GitHubError {
  /* status: 429 or 403 */
  resetAt?: Date;
  retryAfter?: number;
}
class ConflictError extends GitHubError { /* status: 409 */ }
class ForbiddenError extends GitHubError { /* status: 403 */ }
class ServerError extends GitHubError { /* status: 500 (default) */ }

function mapResponseToError(status: number, body: object, headers: Headers | object): GitHubError;
```

**Python**
```python
from github_api import (
    GitHubError, AuthError, NotFoundError, ValidationError,
    RateLimitError, ConflictError, ForbiddenError, ServerError,
    map_response_to_error,
)

class GitHubError(Exception):
    def __init__(
        self,
        message: str,
        *,
        status: int | None = None,
        request_id: str | None = None,
        documentation_url: str | None = None,
        response_body: dict | None = None,
    ) -> None: ...

    def to_dict(self) -> dict: ...
    def __repr__(self) -> str: ...

class AuthError(GitHubError):       # status: 401
    ...

class NotFoundError(GitHubError):   # status: 404
    ...

class ValidationError(GitHubError): # status: 422
    errors: list[dict]               # structured field/code data

class RateLimitError(GitHubError):   # status: 429 or 403
    reset_at: datetime | None
    retry_after: int | None

class ConflictError(GitHubError):    # status: 409
    ...

class ForbiddenError(GitHubError):   # status: 403
    ...

class ServerError(GitHubError):      # status: 502 (default)
    ...

def map_response_to_error(
    status: int,
    body: dict | None,
    headers: dict | None = None,
) -> GitHubError: ...
```

### Validation Functions

Input validation for repository names, usernames, and branch names.

**TypeScript**
```typescript
import {
  validateRepositoryName,
  validateUsername,
  validateBranchName,
  RESERVED_REPO_NAMES,
} from '@internal/github-api';

function validateRepositoryName(name: string): void;
function validateUsername(owner: string): void;
function validateBranchName(branch: string): void;

const RESERVED_REPO_NAMES: Set<string>;  // 56+ reserved names
```

**Python**
```python
from github_api import (
    validate_repository_name,
    validate_username,
    validate_branch_name,
    RESERVED_REPO_NAMES,
)

def validate_repository_name(name: str) -> str: ...
def validate_username(owner: str) -> str: ...
def validate_branch_name(branch: str) -> str: ...

RESERVED_REPO_NAMES: frozenset[str]  # 56+ reserved names
```

Validation rules:
- **Repository name**: Max 100 chars, alphanumeric + hyphens/underscores/dots, no leading/trailing dots, checked against 56+ reserved names.
- **Username**: Max 39 chars, alphanumeric + hyphens, no leading/trailing/consecutive hyphens.
- **Branch name**: Max 255 chars, no control chars, no special chars (`space ~ ^ : ? * [ \`), no consecutive slashes, cannot be a single `@`.

### RateLimitInfo

Parsed rate limit information from GitHub API response headers.

**TypeScript**
```typescript
import { parseRateLimitHeaders } from '@internal/github-api';

// Plain object returned by parseRateLimitHeaders:
interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;        // Unix timestamp
  used: number;
  resource: string;     // default: 'core'
}
```

**Python**
```python
from github_api import RateLimitInfo

class RateLimitInfo(BaseModel):
    limit: int
    remaining: int
    reset: int              # Unix timestamp
    used: int = 0
    resource: str = "core"

    # Computed properties
    @property
    def reset_at(self) -> datetime: ...           # UTC datetime
    @property
    def seconds_until_reset(self) -> float: ...   # seconds remaining
    @property
    def is_exhausted(self) -> bool: ...           # True if remaining == 0
```

### Rate Limit Functions

Utilities for parsing, evaluating, and waiting on rate limits.

**TypeScript**
```typescript
import {
  parseRateLimitHeaders,
  shouldWaitForRateLimit,
  waitForRateLimit,
  isSecondaryRateLimit,
} from '@internal/github-api';

function parseRateLimitHeaders(headers: Headers | object): RateLimitInfo | null;
function shouldWaitForRateLimit(
  info: RateLimitInfo,
  options?: { autoWait?: boolean; threshold?: number }
): boolean;
function waitForRateLimit(info: RateLimitInfo, logger?: Logger): Promise<void>;
function isSecondaryRateLimit(status: number, body?: object): boolean;
```

**Python**
```python
from github_api.sdk.rate_limit import (
    parse_rate_limit_headers,
    should_wait_for_rate_limit,
    wait_for_rate_limit,
    is_secondary_rate_limit,
)

def parse_rate_limit_headers(headers: Mapping[str, str]) -> RateLimitInfo | None: ...
def should_wait_for_rate_limit(
    info: RateLimitInfo,
    *,
    auto_wait: bool = True,
    threshold: int = 0,
) -> bool: ...
async def wait_for_rate_limit(
    info: RateLimitInfo,
    logger: logging.Logger | None = None,
) -> None: ...
def is_secondary_rate_limit(status: int, body: dict | None = None) -> bool: ...
```

### Pagination Functions

Traverse paginated GitHub API responses using Link header `rel="next"`.

**TypeScript**
```typescript
import { paginate, paginateAll } from '@internal/github-api';

async function* paginate(
  client: GitHubClient,
  path: string,
  options?: { perPage?: number; maxPages?: number; params?: object }
): AsyncGenerator<object[]>;

async function paginateAll(
  client: GitHubClient,
  path: string,
  options?: { perPage?: number; maxPages?: number; params?: object }
): Promise<object[]>;
```

**Python**
```python
from github_api.sdk.pagination import paginate, paginate_all

async def paginate(
    client: GitHubClient,
    path: str,
    *,
    params: dict | None = None,
    per_page: int = 100,
    max_pages: int = 1000,
) -> AsyncGenerator[list[Any], None]: ...

async def paginate_all(
    client: GitHubClient,
    path: str,
    *,
    params: dict | None = None,
    per_page: int = 100,
    max_pages: int = 1000,
) -> list[Any]: ...
```

## SDK

### Domain Clients

All domain clients accept a `GitHubClient` in their constructor.

**TypeScript**
```typescript
import {
  ReposClient,
  BranchesClient,
  CollaboratorsClient,
  TagsClient,
  WebhooksClient,
  SecurityClient,
} from '@internal/github-api';

const repos = new ReposClient(client);
const branches = new BranchesClient(client);
```

**Python**
```python
from github_api import (
    ReposClient,
    BranchesClient,
    CollaboratorsClient,
    TagsClient,
    WebhooksClient,
    SecurityClient,
)

repos = ReposClient(client)
branches = BranchesClient(client)
```

### ReposClient

Repository domain client with 21 methods for CRUD, topics, forks, stars, and subscriptions.

**TypeScript**
```typescript
class ReposClient {
  constructor(client: GitHubClient);

  async get(owner: string, repo: string): Promise<object>;
  async listForUser(username: string, options?: object): Promise<object>;
  async listForAuthenticatedUser(options?: object): Promise<object>;
  async listForOrg(org: string, options?: object): Promise<object>;
  async create(data: object): Promise<object>;
  async createInOrg(org: string, data: object): Promise<object>;
  async update(owner: string, repo: string, data: object): Promise<object>;
  async delete(owner: string, repo: string): Promise<object>;
  async getTopics(owner: string, repo: string): Promise<object>;
  async replaceTopics(owner: string, repo: string, names: string[]): Promise<object>;
  async getLanguages(owner: string, repo: string): Promise<object>;
  async listContributors(owner: string, repo: string, options?: object): Promise<object>;
  async fork(owner: string, repo: string, options?: object): Promise<object>;
  async listForks(owner: string, repo: string, options?: object): Promise<object>;
  async transfer(owner: string, repo: string, newOwner: string, options?: object): Promise<object>;
  async star(owner: string, repo: string): Promise<object>;
  async unstar(owner: string, repo: string): Promise<object>;
  async isStarred(owner: string, repo: string): Promise<boolean>;
  async watch(owner: string, repo: string): Promise<object>;
  async unwatch(owner: string, repo: string): Promise<object>;
  async getSubscription(owner: string, repo: string): Promise<object>;
}
```

**Python**
```python
class ReposClient:
    def __init__(self, client: GitHubClient) -> None: ...

    async def get(self, owner: str, repo: str) -> dict: ...
    async def list_for_user(self, username: str, *, params: dict | None = None) -> dict: ...
    async def list_for_authenticated_user(self, *, params: dict | None = None) -> dict: ...
    async def list_for_org(self, org: str, *, params: dict | None = None) -> dict: ...
    async def create(self, data: dict) -> dict: ...
    async def create_in_org(self, org: str, data: dict) -> dict: ...
    async def update(self, owner: str, repo: str, data: dict) -> dict: ...
    async def delete(self, owner: str, repo: str) -> dict: ...
    async def get_topics(self, owner: str, repo: str) -> dict: ...
    async def replace_topics(self, owner: str, repo: str, names: list[str]) -> dict: ...
    async def get_languages(self, owner: str, repo: str) -> dict: ...
    async def list_contributors(self, owner: str, repo: str, *, params: dict | None = None) -> dict: ...
    async def fork(self, owner: str, repo: str, *, options: dict | None = None) -> dict: ...
    async def list_forks(self, owner: str, repo: str, *, params: dict | None = None) -> dict: ...
    async def transfer(self, owner: str, repo: str, new_owner: str, *, options: dict | None = None) -> dict: ...
    async def star(self, owner: str, repo: str) -> dict: ...
    async def unstar(self, owner: str, repo: str) -> dict: ...
    async def is_starred(self, owner: str, repo: str) -> bool: ...
    async def watch(self, owner: str, repo: str) -> dict: ...
    async def unwatch(self, owner: str, repo: str) -> dict: ...
    async def get_subscription(self, owner: str, repo: str) -> dict: ...
```

### BranchesClient

Branch domain client with 20 methods for listing, protection, renaming, merging, and comparing.

**TypeScript**
```typescript
class BranchesClient {
  constructor(client: GitHubClient);

  async list(owner: string, repo: string, options?: object): Promise<object>;
  async get(owner: string, repo: string, branch: string): Promise<object>;
  async getProtection(owner: string, repo: string, branch: string): Promise<object>;
  async updateProtection(owner: string, repo: string, branch: string, data: object): Promise<object>;
  async removeProtection(owner: string, repo: string, branch: string): Promise<object>;
  async getStatusChecks(owner: string, repo: string, branch: string): Promise<object>;
  async updateStatusChecks(owner: string, repo: string, branch: string, data: object): Promise<object>;
  async getReviewProtection(owner: string, repo: string, branch: string): Promise<object>;
  async updateReviewProtection(owner: string, repo: string, branch: string, data: object): Promise<object>;
  async deleteReviewProtection(owner: string, repo: string, branch: string): Promise<object>;
  async getAdminEnforcement(owner: string, repo: string, branch: string): Promise<object>;
  async setAdminEnforcement(owner: string, repo: string, branch: string): Promise<object>;
  async removeAdminEnforcement(owner: string, repo: string, branch: string): Promise<object>;
  async getPushRestrictions(owner: string, repo: string, branch: string): Promise<object>;
  async updatePushRestrictions(owner: string, repo: string, branch: string, data: object): Promise<object>;
  async deletePushRestrictions(owner: string, repo: string, branch: string): Promise<object>;
  async rename(owner: string, repo: string, branch: string, newName: string): Promise<object>;
  async merge(owner: string, repo: string, data: object): Promise<object>;
  async compare(owner: string, repo: string, baseRef: string, headRef: string): Promise<object>;
  async createProtectionTemplate(owner: string, repo: string, branch: string, options?: object): Promise<object>;
}
```

**Python**
```python
class BranchesClient:
    def __init__(self, client: GitHubClient) -> None: ...

    async def list(self, owner: str, repo: str, *, params: dict | None = None) -> dict: ...
    async def get(self, owner: str, repo: str, branch: str) -> dict: ...
    async def get_protection(self, owner: str, repo: str, branch: str) -> dict: ...
    async def update_protection(self, owner: str, repo: str, branch: str, data: dict) -> dict: ...
    async def remove_protection(self, owner: str, repo: str, branch: str) -> dict: ...
    async def get_status_checks(self, owner: str, repo: str, branch: str) -> dict: ...
    async def update_status_checks(self, owner: str, repo: str, branch: str, data: dict) -> dict: ...
    async def get_review_protection(self, owner: str, repo: str, branch: str) -> dict: ...
    async def update_review_protection(self, owner: str, repo: str, branch: str, data: dict) -> dict: ...
    async def delete_review_protection(self, owner: str, repo: str, branch: str) -> dict: ...
    async def get_admin_enforcement(self, owner: str, repo: str, branch: str) -> dict: ...
    async def set_admin_enforcement(self, owner: str, repo: str, branch: str) -> dict: ...
    async def remove_admin_enforcement(self, owner: str, repo: str, branch: str) -> dict: ...
    async def get_push_restrictions(self, owner: str, repo: str, branch: str) -> dict: ...
    async def update_push_restrictions(self, owner: str, repo: str, branch: str, data: dict) -> dict: ...
    async def delete_push_restrictions(self, owner: str, repo: str, branch: str) -> dict: ...
    async def rename(self, owner: str, repo: str, branch: str, new_name: str) -> dict: ...
    async def merge(self, owner: str, repo: str, data: dict) -> dict: ...
    async def compare(self, owner: str, repo: str, base_ref: str, head_ref: str) -> dict: ...
    async def create_protection_template(
        self, owner: str, repo: str, branch: str, *, template: str = "standard"
    ) -> dict: ...
```

### CollaboratorsClient

Collaborator management with 4 methods.

**TypeScript**
```typescript
class CollaboratorsClient {
  constructor(client: GitHubClient);

  async list(owner: string, repo: string, options?: object): Promise<object>;
  async get(owner: string, repo: string, username: string): Promise<object>;
  async add(owner: string, repo: string, username: string, data?: object): Promise<object>;
  async remove(owner: string, repo: string, username: string): Promise<object>;
}
```

**Python**
```python
class CollaboratorsClient:
    def __init__(self, client: GitHubClient) -> None: ...

    async def list(self, owner: str, repo: str, *, params: dict | None = None) -> dict: ...
    async def get(self, owner: str, repo: str, username: str) -> dict: ...
    async def add(self, owner: str, repo: str, username: str, data: dict | None = None) -> dict: ...
    async def remove(self, owner: str, repo: str, username: str) -> dict: ...
```

### TagsClient

Tag and release management with 7 methods.

**TypeScript**
```typescript
class TagsClient {
  constructor(client: GitHubClient);

  async list(owner: string, repo: string, options?: object): Promise<object>;
  async listReleases(owner: string, repo: string, options?: object): Promise<object>;
  async getLatestRelease(owner: string, repo: string): Promise<object>;
  async getRelease(owner: string, repo: string, releaseId: number): Promise<object>;
  async createRelease(owner: string, repo: string, data: object): Promise<object>;
  async updateRelease(owner: string, repo: string, releaseId: number, data: object): Promise<object>;
  async deleteRelease(owner: string, repo: string, releaseId: number): Promise<object>;
}
```

**Python**
```python
class TagsClient:
    def __init__(self, client: GitHubClient) -> None: ...

    async def list(self, owner: str, repo: str, *, params: dict | None = None) -> dict: ...
    async def list_releases(self, owner: str, repo: str, *, params: dict | None = None) -> dict: ...
    async def get_latest_release(self, owner: str, repo: str) -> dict: ...
    async def get_release(self, owner: str, repo: str, release_id: int) -> dict: ...
    async def create_release(self, owner: str, repo: str, data: dict) -> dict: ...
    async def update_release(self, owner: str, repo: str, release_id: int, data: dict) -> dict: ...
    async def delete_release(self, owner: str, repo: str, release_id: int) -> dict: ...
```

### WebhooksClient

Webhook management with 5 methods.

**TypeScript**
```typescript
class WebhooksClient {
  constructor(client: GitHubClient);

  async list(owner: string, repo: string, options?: object): Promise<object>;
  async get(owner: string, repo: string, hookId: number): Promise<object>;
  async create(owner: string, repo: string, data: object): Promise<object>;
  async update(owner: string, repo: string, hookId: number, data: object): Promise<object>;
  async delete(owner: string, repo: string, hookId: number): Promise<object>;
  async test(owner: string, repo: string, hookId: number): Promise<object>;
}
```

**Python**
```python
class WebhooksClient:
    def __init__(self, client: GitHubClient) -> None: ...

    async def list(self, owner: str, repo: str, *, params: dict | None = None) -> dict: ...
    async def get(self, owner: str, repo: str, hook_id: int) -> dict: ...
    async def create(self, owner: str, repo: str, data: dict) -> dict: ...
    async def update(self, owner: str, repo: str, hook_id: int, data: dict) -> dict: ...
    async def delete(self, owner: str, repo: str, hook_id: int) -> dict: ...
    async def test(self, owner: str, repo: str, hook_id: int) -> dict: ...
```

### SecurityClient

Security and vulnerability management with 4 methods.

**TypeScript**
```typescript
class SecurityClient {
  constructor(client: GitHubClient);

  async listVulnerabilityAlerts(owner: string, repo: string, options?: object): Promise<object>;
  async listDependabotAlerts(owner: string, repo: string, options?: object): Promise<object>;
  async getDependabotAlert(owner: string, repo: string, alertNumber: number): Promise<object>;
  async updateDependabotAlert(owner: string, repo: string, alertNumber: number, data: object): Promise<object>;
}
```

**Python**
```python
class SecurityClient:
    def __init__(self, client: GitHubClient) -> None: ...

    async def list_vulnerability_alerts(self, owner: str, repo: str, *, params: dict | None = None) -> dict: ...
    async def list_dependabot_alerts(self, owner: str, repo: str, *, params: dict | None = None) -> dict: ...
    async def get_dependabot_alert(self, owner: str, repo: str, alert_number: int) -> dict: ...
    async def update_dependabot_alert(self, owner: str, repo: str, alert_number: int, data: dict) -> dict: ...
```

## Configuration

**TypeScript**
```typescript
import { loadConfig } from '@internal/github-api';

function loadConfig(): {
  githubToken: string | undefined;
  githubApiBaseUrl: string;     // default: 'https://api.github.com'
  logLevel: string;             // default: 'info'
  port: number;                 // default: 3100
  host: string;                 // default: '0.0.0.0'
};
```

**Python**
```python
from github_api.config import Config

@dataclass(frozen=True)
class Config:
    github_token: str              # resolved from env vars
    base_url: str = "https://api.github.com"
    log_level: str = "INFO"
    port: int = 3100
    host: str = "0.0.0.0"
    rate_limit_auto_wait: bool = True
    rate_limit_threshold: int = 0

    @classmethod
    def from_env(cls) -> Config: ...
```

## Server Factory

**TypeScript**
```typescript
import { createServer, startServer } from '@internal/github-api';

async function createServer(options?: {
  token?: string;
  baseUrl?: string;
  logLevel?: string;
  corsOptions?: object;
}): Promise<{ server: FastifyInstance; client: GitHubClient }>;

async function startServer(
  server: FastifyInstance,
  options?: { port?: number; host?: string }
): Promise<string>;
```

**Python**
```python
from github_api.server import create_app

def create_app(config: Config | None = None) -> FastAPI: ...
```

## Middleware

**TypeScript**
```typescript
import {
  response204Hook,
  jsonFallbackHook,
  requestIdHook,
  rateLimitHook,
  createErrorHandler,
} from '@internal/github-api';
```

**Python**
```python
from github_api.middleware.error_handler import register_error_handlers

def register_error_handlers(app: FastAPI) -> None: ...
```

### SDK Operations

- `get(owner, repo)`: Retrieve a single repository.
- `listForUser(username)` / `list_for_user(username)`: List public repositories for a user.
- `listForAuthenticatedUser()` / `list_for_authenticated_user()`: List repositories for the authenticated user.
- `listForOrg(org)` / `list_for_org(org)`: List repositories for an organization.
- `create(data)`: Create a repository for the authenticated user.
- `createInOrg(org, data)` / `create_in_org(org, data)`: Create a repository in an organization.
- `update(owner, repo, data)`: Update repository settings.
- `delete(owner, repo)`: Delete a repository.
- `getTopics(owner, repo)` / `get_topics(owner, repo)`: Get repository topics.
- `replaceTopics(owner, repo, names)` / `replace_topics(owner, repo, names)`: Replace all topics.
- `getLanguages(owner, repo)` / `get_languages(owner, repo)`: Get language breakdown.
- `listContributors(owner, repo)` / `list_contributors(owner, repo)`: List contributors.
- `fork(owner, repo)`: Create a fork.
- `listForks(owner, repo)` / `list_forks(owner, repo)`: List forks.
- `transfer(owner, repo, newOwner)` / `transfer(owner, repo, new_owner)`: Transfer ownership.
- `star(owner, repo)` / `unstar(owner, repo)`: Star or unstar a repository.
- `isStarred(owner, repo)` / `is_starred(owner, repo)`: Check star status.
- `watch(owner, repo)` / `unwatch(owner, repo)`: Subscribe or unsubscribe.
- `getSubscription(owner, repo)` / `get_subscription(owner, repo)`: Get subscription status.
- `list(owner, repo)`: List branches.
- `getProtection(owner, repo, branch)` / `get_protection(owner, repo, branch)`: Get branch protection.
- `updateProtection(owner, repo, branch, data)` / `update_protection(owner, repo, branch, data)`: Update protection.
- `rename(owner, repo, branch, newName)` / `rename(owner, repo, branch, new_name)`: Rename a branch.
- `merge(owner, repo, data)`: Merge branches.
- `compare(owner, repo, baseRef, headRef)` / `compare(owner, repo, base_ref, head_ref)`: Compare refs.
- `createProtectionTemplate(owner, repo, branch)` / `create_protection_template(owner, repo, branch, *, template)`: Apply protection template.
- `paginate(client, path, options)`: Async generator yielding pages.
- `paginateAll(client, path, options)` / `paginate_all(client, path, options)`: Collect all items.
