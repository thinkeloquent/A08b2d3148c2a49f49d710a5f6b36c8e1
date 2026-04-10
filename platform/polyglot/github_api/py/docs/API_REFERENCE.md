# API Reference -- github_api (Python 3.11+ / FastAPI 0.115.0)

Complete Python API reference for the `github_api` SDK and FastAPI server.

---

## Table of Contents

- [GitHubClient](#githubclient)
- [Authentication](#authentication)
- [Error Hierarchy](#error-hierarchy)
- [Validation](#validation)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)
- [Domain Clients](#domain-clients)
  - [ReposClient](#reposclient)
  - [BranchesClient](#branchesclient)
  - [CollaboratorsClient](#collaboratorsclient)
  - [TagsClient](#tagsclient)
  - [WebhooksClient](#webhooksclient)
  - [SecurityClient](#securityclient)
- [Configuration](#configuration)
- [Server](#server)
- [Middleware](#middleware)
- [REST Endpoints](#rest-endpoints)

---

## GitHubClient

```python
from github_api.sdk.client import GitHubClient
```

Async HTTP client for the GitHub REST API. Handles authentication, rate limit tracking with auto-wait, error mapping, and JSON parsing.

### Constructor

```python
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
    ) -> None
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `token` | `str \| None` | `None` | GitHub personal access token. If `None`, resolved from environment variables. |
| `base_url` | `str` | `"https://api.github.com"` | GitHub API base URL. Override for GitHub Enterprise Server. |
| `rate_limit_auto_wait` | `bool` | `True` | Automatically sleep when rate limit is exhausted. |
| `rate_limit_threshold` | `int` | `0` | Remaining request count at which to trigger auto-wait. |
| `on_rate_limit` | `Callable \| None` | `None` | Optional async callback invoked when rate limit info is updated. |
| `logger` | `logging.Logger \| None` | `None` | Logger instance. Defaults to `logging.getLogger("github_api.sdk.client")`. |

### HTTP Methods

```python
async def get(self, path: str, *, params: dict[str, Any] | None = None) -> dict[str, Any]
async def post(self, path: str, *, json: dict[str, Any] | None = None) -> dict[str, Any]
async def put(self, path: str, *, json: dict[str, Any] | None = None) -> dict[str, Any]
async def patch(self, path: str, *, json: dict[str, Any] | None = None) -> dict[str, Any]
async def delete(self, path: str, *, params: dict[str, Any] | None = None) -> dict[str, Any]
```

All methods return parsed JSON response bodies. A `204 No Content` response returns `{}`. Any non-2xx status raises a `GitHubError` subclass.

### Raw Response Access

```python
async def get_raw(self, url: str, *, params: dict[str, Any] | None = None) -> httpx.Response
```

Returns the raw `httpx.Response` object. Used internally by pagination to access `Link` headers.

### Rate Limit Endpoint

```python
async def get_rate_limit(self) -> dict[str, Any]
```

Fetches the current rate limit status from `GET /rate_limit`.

### Lifecycle

```python
async def close(self) -> None
```

Closes the underlying `httpx.AsyncClient`. Called automatically when using the async context manager.

### Properties

```python
@property
def token_info(self) -> TokenInfo
```

Returns the resolved `TokenInfo` for the current client.

```python
@property
def last_rate_limit(self) -> RateLimitInfo | None
```

Returns the most recently parsed rate limit info from the last API response, or `None` if no requests have been made.

### Async Context Manager

```python
async with GitHubClient(token="ghp_...") as client:
    repo = await client.get("/repos/octocat/Hello-World")
# client.close() is called automatically on exit
```

---

## Authentication

```python
from github_api.sdk.auth import TokenInfo, TokenType, resolve_token, mask_token
```

### TokenInfo

```python
@dataclass(frozen=True)
class TokenInfo:
    token: str       # The raw token string
    source: str      # "explicit", "GITHUB_TOKEN", "GH_TOKEN", etc.
    type: TokenType  # Detected token type
```

### TokenType

```python
TokenType = Literal[
    "fine-grained",      # github_pat_ prefix
    "classic-pat",       # ghp_ prefix
    "oauth",             # gho_ prefix
    "user-to-server",    # ghu_ prefix
    "server-to-server",  # ghs_ prefix
    "legacy",            # 40-character hex string
    "unknown",           # Unrecognized format
]
```

### resolve_token

```python
def resolve_token(explicit_token: str | None = None) -> TokenInfo
```

Resolves a GitHub authentication token. Checks an explicit token first, then iterates through environment variables in priority order:

1. `GITHUB_TOKEN`
2. `GH_TOKEN`
3. `GITHUB_ACCESS_TOKEN`
4. `GITHUB_PAT`

**Raises:** `AuthError` if no token can be resolved from any source.

### mask_token

```python
def mask_token(token: str) -> str
```

Masks a token for safe logging. Shows first 4 and last 4 characters:

```python
mask_token("ghp_abc123def456xyz789")
# "ghp_************x789"
```

Tokens with 8 or fewer characters return `"****"`.

---

## Error Hierarchy

```python
from github_api.sdk.errors import (
    GitHubError,
    AuthError,
    NotFoundError,
    ValidationError,
    RateLimitError,
    ConflictError,
    ForbiddenError,
    ServerError,
    map_response_to_error,
)
```

All errors inherit from `GitHubError(Exception)`.

### GitHubError (Base)

```python
class GitHubError(Exception):
    def __init__(
        self,
        message: str,
        *,
        status: int | None = None,
        request_id: str | None = None,
        documentation_url: str | None = None,
        response_body: dict[str, Any] | None = None,
    ) -> None

    # Attributes
    message: str
    status: int | None
    request_id: str | None
    documentation_url: str | None
    response_body: dict[str, Any]

    def to_dict(self) -> dict[str, Any]
```

`to_dict()` returns a serializable dictionary suitable for JSON error responses.

### Subclasses

| Class | Default Status | Extra Attributes | Description |
|---|---|---|---|
| `AuthError` | 401 | -- | Invalid or missing token |
| `NotFoundError` | 404 | -- | Resource not found |
| `ValidationError` | 422 | `errors: list[dict]` | Invalid parameters or body |
| `RateLimitError` | 429 | `reset_at: datetime \| None`, `retry_after: int \| None` | Rate limit exceeded |
| `ConflictError` | 409 | -- | Resource already exists or state conflict |
| `ForbiddenError` | 403 | -- | Insufficient permissions |
| `ServerError` | 502 | -- | GitHub server error (5xx) |

### map_response_to_error

```python
def map_response_to_error(
    status: int,
    body: dict[str, Any] | None,
    headers: dict[str, str] | None = None,
) -> GitHubError
```

Maps an HTTP response status code to the appropriate `GitHubError` subclass. Automatically extracts `x-github-request-id` from headers and `documentation_url` from the body.

Special behavior for `403`: If `x-ratelimit-remaining` is `"0"` or a `retry-after` header is present, returns `RateLimitError` instead of `ForbiddenError` (secondary rate limit detection).

---

## Validation

```python
from github_api.sdk.validation import (
    validate_repository_name,
    validate_username,
    validate_branch_name,
    RESERVED_REPO_NAMES,
)
```

All validators raise `ValidationError` on invalid input and return the validated string on success. Validation runs before any HTTP request is made.

### validate_repository_name

```python
def validate_repository_name(name: str) -> str
```

**Rules:**
- Non-empty, max 100 characters
- Only alphanumeric characters, hyphens (`-`), underscores (`_`), and dots (`.`)
- Cannot start or end with a dot
- Cannot be a reserved name (case-insensitive)

### validate_username

```python
def validate_username(owner: str) -> str
```

**Rules:**
- Non-empty, max 39 characters
- Alphanumeric and single hyphens only
- Cannot start or end with a hyphen
- No consecutive hyphens (`--`)

### validate_branch_name

```python
def validate_branch_name(branch: str) -> str
```

**Rules:**
- Non-empty, max 255 characters
- No control characters (U+0000-U+001F, U+007F)
- No space, `~`, `^`, `:`, `?`, `*`, `[`, or backslash
- No consecutive slashes (`//`)
- Cannot be a single `@`

### RESERVED_REPO_NAMES

```python
RESERVED_REPO_NAMES: frozenset[str]
```

A frozen set of 56+ reserved repository names including: `settings`, `security`, `pulls`, `issues`, `actions`, `apps`, `codespaces`, `copilot`, `discussions`, `explore`, `features`, `marketplace`, `new`, `notifications`, `organizations`, `packages`, `projects`, `search`, `sponsors`, `stars`, `topics`, `trending`, `wiki`, `about`, `api`, `docs`, `join`, `rest`, and more.

---

## Rate Limiting

```python
from github_api.sdk.rate_limit import (
    RateLimitInfo,
    parse_rate_limit_headers,
    should_wait_for_rate_limit,
    wait_for_rate_limit,
    is_secondary_rate_limit,
)
```

### RateLimitInfo

```python
class RateLimitInfo(BaseModel):
    limit: int           # Maximum requests per window
    remaining: int       # Requests remaining in current window
    reset: int           # Unix timestamp when the window resets
    used: int = 0        # Requests used in current window
    resource: str = "core"  # Rate limit resource category

    @property
    def reset_at(self) -> datetime      # Reset time as UTC datetime

    @property
    def seconds_until_reset(self) -> float  # Seconds until window resets (min 0)

    @property
    def is_exhausted(self) -> bool      # True when remaining == 0
```

### parse_rate_limit_headers

```python
def parse_rate_limit_headers(headers: Mapping[str, str]) -> RateLimitInfo | None
```

Parses `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`, `x-ratelimit-used`, and `x-ratelimit-resource` from response headers. Returns `None` if required headers are missing.

### should_wait_for_rate_limit

```python
def should_wait_for_rate_limit(
    info: RateLimitInfo,
    *,
    auto_wait: bool = True,
    threshold: int = 0,
) -> bool
```

Returns `True` if `auto_wait` is enabled and `remaining <= threshold`.

### wait_for_rate_limit

```python
async def wait_for_rate_limit(
    info: RateLimitInfo,
    logger: logging.Logger | None = None,
) -> None
```

Sleeps until the rate limit window resets (plus 1-second buffer). Logs a warning if a logger is provided.

### is_secondary_rate_limit

```python
def is_secondary_rate_limit(status: int, body: dict[str, Any] | None = None) -> bool
```

Detects secondary (abuse) rate limits. Returns `True` when `status` is 403 or 429 and the response message contains indicators such as `"rate limit"`, `"abuse detection"`, or `"secondary rate"`.

---

## Pagination

```python
from github_api.sdk.pagination import paginate, paginate_all
```

### paginate

```python
async def paginate(
    client: GitHubClient,
    path: str,
    *,
    params: dict[str, Any] | None = None,
    per_page: int = 100,
    max_pages: int = 1000,
) -> AsyncGenerator[list[Any], None]
```

Async generator that yields pages (lists) of results. Follows the `Link` header `rel="next"` URL automatically. Stops when there is no next page or `max_pages` is reached. `per_page` is capped at 100.

### paginate_all

```python
async def paginate_all(
    client: GitHubClient,
    path: str,
    *,
    params: dict[str, Any] | None = None,
    per_page: int = 100,
    max_pages: int = 1000,
) -> list[Any]
```

Convenience function that collects all items from `paginate()` into a single flat list.

---

## Domain Clients

All domain clients accept a `GitHubClient` instance in their constructor and validate inputs before making API calls.

---

### ReposClient

```python
from github_api.sdk.repos import ReposClient
```

```python
class ReposClient:
    def __init__(self, client: GitHubClient) -> None
```

| Method | Signature | Description |
|---|---|---|
| `get` | `async def get(owner: str, repo: str) -> dict` | Get a repository by owner and name |
| `list_for_user` | `async def list_for_user(username: str, *, params: dict \| None = None) -> dict` | List public repositories for a user |
| `list_for_authenticated_user` | `async def list_for_authenticated_user(*, params: dict \| None = None) -> dict` | List repositories for the authenticated user |
| `list_for_org` | `async def list_for_org(org: str, *, params: dict \| None = None) -> dict` | List repositories for an organization |
| `create` | `async def create(data: dict) -> dict` | Create a repository for the authenticated user |
| `create_in_org` | `async def create_in_org(org: str, data: dict) -> dict` | Create a repository in an organization |
| `update` | `async def update(owner: str, repo: str, data: dict) -> dict` | Update a repository |
| `delete` | `async def delete(owner: str, repo: str) -> dict` | Delete a repository |
| `get_topics` | `async def get_topics(owner: str, repo: str) -> dict` | Get repository topics |
| `replace_topics` | `async def replace_topics(owner: str, repo: str, names: list[str]) -> dict` | Replace all repository topics |
| `get_languages` | `async def get_languages(owner: str, repo: str) -> dict` | Get language-to-bytes breakdown |
| `list_contributors` | `async def list_contributors(owner: str, repo: str, *, params: dict \| None = None) -> dict` | List repository contributors |
| `fork` | `async def fork(owner: str, repo: str, *, options: dict \| None = None) -> dict` | Create a fork |
| `list_forks` | `async def list_forks(owner: str, repo: str, *, params: dict \| None = None) -> dict` | List forks |
| `transfer` | `async def transfer(owner: str, repo: str, new_owner: str, *, options: dict \| None = None) -> dict` | Transfer to a new owner |
| `star` | `async def star(owner: str, repo: str) -> dict` | Star a repository |
| `unstar` | `async def unstar(owner: str, repo: str) -> dict` | Unstar a repository |
| `is_starred` | `async def is_starred(owner: str, repo: str) -> bool` | Check if authenticated user has starred |
| `watch` | `async def watch(owner: str, repo: str) -> dict` | Watch (subscribe to) a repository |
| `unwatch` | `async def unwatch(owner: str, repo: str) -> dict` | Unwatch (unsubscribe from) a repository |
| `get_subscription` | `async def get_subscription(owner: str, repo: str) -> dict` | Get subscription status |

---

### BranchesClient

```python
from github_api.sdk.branches import BranchesClient
```

```python
class BranchesClient:
    def __init__(self, client: GitHubClient) -> None
```

| Method | Signature | Description |
|---|---|---|
| `list` | `async def list(owner: str, repo: str, *, params: dict \| None = None) -> dict` | List branches for a repository |
| `get` | `async def get(owner: str, repo: str, branch: str) -> dict` | Get a specific branch |
| `get_protection` | `async def get_protection(owner: str, repo: str, branch: str) -> dict` | Get branch protection rules |
| `update_protection` | `async def update_protection(owner: str, repo: str, branch: str, data: dict) -> dict` | Update branch protection rules |
| `remove_protection` | `async def remove_protection(owner: str, repo: str, branch: str) -> dict` | Remove branch protection |
| `get_status_checks` | `async def get_status_checks(owner: str, repo: str, branch: str) -> dict` | Get required status checks |
| `update_status_checks` | `async def update_status_checks(owner: str, repo: str, branch: str, data: dict) -> dict` | Update required status checks |
| `get_review_protection` | `async def get_review_protection(owner: str, repo: str, branch: str) -> dict` | Get required PR reviews protection |
| `update_review_protection` | `async def update_review_protection(owner: str, repo: str, branch: str, data: dict) -> dict` | Update required PR reviews |
| `delete_review_protection` | `async def delete_review_protection(owner: str, repo: str, branch: str) -> dict` | Delete required PR reviews protection |
| `get_admin_enforcement` | `async def get_admin_enforcement(owner: str, repo: str, branch: str) -> dict` | Get admin enforcement status |
| `set_admin_enforcement` | `async def set_admin_enforcement(owner: str, repo: str, branch: str) -> dict` | Enable admin enforcement |
| `remove_admin_enforcement` | `async def remove_admin_enforcement(owner: str, repo: str, branch: str) -> dict` | Remove admin enforcement |
| `get_push_restrictions` | `async def get_push_restrictions(owner: str, repo: str, branch: str) -> dict` | Get push restrictions |
| `update_push_restrictions` | `async def update_push_restrictions(owner: str, repo: str, branch: str, data: dict) -> dict` | Update push restrictions |
| `delete_push_restrictions` | `async def delete_push_restrictions(owner: str, repo: str, branch: str) -> dict` | Delete push restrictions |
| `rename` | `async def rename(owner: str, repo: str, branch: str, new_name: str) -> dict` | Rename a branch |
| `merge` | `async def merge(owner: str, repo: str, data: dict) -> dict` | Perform a branch merge |
| `compare` | `async def compare(owner: str, repo: str, base_ref: str, head_ref: str) -> dict` | Compare two branches/commits/tags |
| `create_protection_template` | `async def create_protection_template(owner: str, repo: str, branch: str, *, template: str = "standard") -> dict` | Apply a predefined protection template |

**Protection templates** for `create_protection_template`:

| Template | PR Reviews | Status Checks | Admin Enforcement | Dismiss Stale | CODEOWNERS |
|---|---|---|---|---|---|
| `"minimal"` | 1 approval | None | No | No | No |
| `"standard"` | 1 approval | Strict, empty contexts | No | No | No |
| `"strict"` | 2 approvals | Strict, empty contexts | Yes | Yes | Yes |

---

### CollaboratorsClient

```python
from github_api.sdk.collaborators import CollaboratorsClient
```

```python
class CollaboratorsClient:
    def __init__(self, client: GitHubClient) -> None
```

| Method | Signature | Description |
|---|---|---|
| `list` | `async def list(owner: str, repo: str, *, params: dict \| None = None) -> dict` | List repository collaborators |
| `get` | `async def check_permission(owner: str, repo: str, username: str) -> dict` | Check a user's permission level |
| `add` | `async def add(owner: str, repo: str, username: str, *, permission: str = "push") -> dict` | Add a collaborator (permission: pull, triage, push, maintain, admin) |
| `remove` | `async def remove(owner: str, repo: str, username: str) -> dict` | Remove a collaborator |
| `check_permission` | `async def check_permission(owner: str, repo: str, username: str) -> dict` | Check permission level |
| `has_permission` | `async def has_permission(owner: str, repo: str, username: str, required: str \| Permission) -> bool` | Check if user meets minimum permission |
| `list_invitations` | `async def list_invitations(owner: str, repo: str, *, params: dict \| None = None) -> dict` | List pending invitations |
| `update_invitation` | `async def update_invitation(owner: str, repo: str, invitation_id: int, *, permission: str = "push") -> dict` | Update a pending invitation |
| `delete_invitation` | `async def delete_invitation(owner: str, repo: str, invitation_id: int) -> dict` | Delete a pending invitation |
| `bulk_add` | `async def bulk_add(owner: str, repo: str, users: list[dict[str, str]]) -> list[dict]` | Add multiple collaborators |
| `get_stats` | `async def get_stats(owner: str, repo: str) -> dict[str, int]` | Get collaborator permission statistics |

**Permission hierarchy** (via `Permission` enum):

```
NONE < PULL < TRIAGE < PUSH < MAINTAIN < ADMIN
```

---

### TagsClient

```python
from github_api.sdk.tags import TagsClient
```

```python
class TagsClient:
    def __init__(self, client: GitHubClient) -> None
```

| Method | Signature | Description |
|---|---|---|
| `list_tags` | `async def list_tags(owner: str, repo: str, *, params: dict \| None = None) -> dict` | List repository tags |
| `get_tag` | `async def get_tag(owner: str, repo: str, tag_sha: str) -> dict` | Get a tag object by SHA |
| `list_releases` | `async def list_releases(owner: str, repo: str, *, params: dict \| None = None) -> dict` | List repository releases |
| `get_latest_release` | `async def get_latest_release(owner: str, repo: str) -> dict` | Get the latest published release |
| `get_release` | `async def get_release(owner: str, repo: str, release_id: int) -> dict` | Get a release by ID |
| `get_release_by_tag` | `async def get_release_by_tag(owner: str, repo: str, tag: str) -> dict` | Get a release by tag name |
| `create_release` | `async def create_release(owner: str, repo: str, data: dict) -> dict` | Create a new release |
| `update_release` | `async def update_release(owner: str, repo: str, release_id: int, data: dict) -> dict` | Update an existing release |
| `delete_release` | `async def delete_release(owner: str, repo: str, release_id: int) -> dict` | Delete a release |
| `list_tag_protections` | `async def list_tag_protections(owner: str, repo: str) -> dict` | List tag protection rules |
| `create_tag_protection` | `async def create_tag_protection(owner: str, repo: str, pattern: str) -> dict` | Create a tag protection rule |
| `delete_tag_protection` | `async def delete_tag_protection(owner: str, repo: str, protection_id: int) -> dict` | Delete a tag protection rule |
| `parse_semantic_version` | `@staticmethod parse_semantic_version(version_str: str) -> SemanticVersion \| None` | Parse a version string into SemanticVersion |
| `get_next_version` | `@staticmethod get_next_version(current: SemanticVersion, bump: str = "patch") -> SemanticVersion` | Calculate next semantic version |
| `sort_by_version` | `@staticmethod sort_by_version(tags: list[dict], *, descending: bool = True) -> list[dict]` | Sort tag dicts by semantic version |

---

### WebhooksClient

```python
from github_api.sdk.webhooks import WebhooksClient
```

```python
class WebhooksClient:
    def __init__(self, client: GitHubClient) -> None
```

| Method | Signature | Description |
|---|---|---|
| `list` | `async def list(owner: str, repo: str, *, params: dict \| None = None) -> dict` | List repository webhooks |
| `get` | `async def get(owner: str, repo: str, hook_id: int) -> dict` | Get a specific webhook |
| `create` | `async def create(owner: str, repo: str, data: dict) -> dict` | Create a repository webhook |
| `update` | `async def update(owner: str, repo: str, hook_id: int, data: dict) -> dict` | Update a webhook |
| `delete` | `async def delete(owner: str, repo: str, hook_id: int) -> dict` | Delete a webhook |
| `test` | `async def test(owner: str, repo: str, hook_id: int) -> dict` | Trigger a test delivery |
| `ping` | `async def ping(owner: str, repo: str, hook_id: int) -> dict` | Ping a webhook |
| `validate_config` | `@staticmethod validate_config(config: dict) -> None` | Validate webhook config (URL scheme, content_type, insecure_ssl) |

**Webhook config validation rules:**
- `url` must start with `http://` or `https://`
- `content_type` must be `"json"` or `"form"`
- `insecure_ssl` must be `"0"` or `"1"`

---

### SecurityClient

```python
from github_api.sdk.security import SecurityClient
```

```python
class SecurityClient:
    def __init__(self, client: GitHubClient) -> None
```

| Method | Signature | Description |
|---|---|---|
| `get_security_analysis` | `async def get_security_analysis(owner: str, repo: str) -> dict` | Get repository security and analysis settings |
| `update_security_analysis` | `async def update_security_analysis(owner: str, repo: str, data: dict) -> dict` | Update security and analysis settings |
| `get_vulnerability_alerts` | `async def get_vulnerability_alerts(owner: str, repo: str) -> dict` | Check if vulnerability alerts are enabled |
| `enable_vulnerability_alerts` | `async def enable_vulnerability_alerts(owner: str, repo: str) -> dict` | Enable vulnerability alerts |
| `disable_vulnerability_alerts` | `async def disable_vulnerability_alerts(owner: str, repo: str) -> dict` | Disable vulnerability alerts |
| `list_rulesets` | `async def list_rulesets(owner: str, repo: str, *, params: dict \| None = None) -> dict` | List repository rulesets |
| `get_ruleset` | `async def get_ruleset(owner: str, repo: str, ruleset_id: int) -> dict` | Get a specific ruleset |
| `create_ruleset` | `async def create_ruleset(owner: str, repo: str, data: dict) -> dict` | Create a repository ruleset |
| `update_ruleset` | `async def update_ruleset(owner: str, repo: str, ruleset_id: int, data: dict) -> dict` | Update a ruleset |
| `delete_ruleset` | `async def delete_ruleset(owner: str, repo: str, ruleset_id: int) -> dict` | Delete a ruleset |

---

## Configuration

```python
from github_api.config import Config
```

```python
@dataclass(frozen=True)
class Config:
    github_token: str              # Resolved from env if not provided
    base_url: str = "https://api.github.com"
    log_level: str = "INFO"
    port: int = 3100
    host: str = "0.0.0.0"
    rate_limit_auto_wait: bool = True
    rate_limit_threshold: int = 0

    @classmethod
    def from_env(cls) -> Config
```

`from_env()` reads the following environment variables:

| Environment Variable | Config Field | Default |
|---|---|---|
| `GITHUB_TOKEN` / `GH_TOKEN` / `GITHUB_ACCESS_TOKEN` / `GITHUB_PAT` | `github_token` | `""` |
| `GITHUB_BASE_URL` | `base_url` | `"https://api.github.com"` |
| `LOG_LEVEL` | `log_level` | `"INFO"` |
| `PORT` | `port` | `3100` |
| `HOST` | `host` | `"0.0.0.0"` |
| `RATE_LIMIT_AUTO_WAIT` | `rate_limit_auto_wait` | `true` |
| `RATE_LIMIT_THRESHOLD` | `rate_limit_threshold` | `0` |

---

## Server

```python
from github_api.server import create_app
```

```python
def create_app(config: Config | None = None) -> FastAPI
```

Creates and configures the FastAPI application with:

- CORS middleware (all origins, methods, headers)
- Error handler registration (maps SDK errors to HTTP responses)
- Route registration under `/api/github` prefix
- `GitHubClient` lifecycle management via startup/shutdown events

If `config` is `None`, loads from environment via `Config.from_env()`.

---

## Middleware

### Error Handlers

```python
from github_api.middleware.error_handler import register_error_handlers
```

```python
def register_error_handlers(app: FastAPI) -> None
```

Registers FastAPI exception handlers that map SDK errors to HTTP responses:

| SDK Error | HTTP Status | Content |
|---|---|---|
| `ValidationError` | 400 | `exc.to_dict()` |
| `AuthError` | 401 | `exc.to_dict()` |
| `ForbiddenError` | 403 | `exc.to_dict()` |
| `NotFoundError` | 404 | `exc.to_dict()` |
| `ConflictError` | 409 | `exc.to_dict()` |
| `RateLimitError` | 429 | `exc.to_dict()` + `Retry-After` header |
| `ServerError` | 502 | `exc.to_dict()` |
| `GitHubError` (fallback) | `exc.status or 500` | `exc.to_dict()` |

### Response Hooks

```python
from github_api.middleware.github_hooks import (
    response_204_hook,
    json_fallback_hook,
    request_id_hook,
    rate_limit_hook,
)
```

| Hook | Signature | Description |
|---|---|---|
| `response_204_hook` | `(response: httpx.Response) -> dict` | Returns `{}` for 204 responses |
| `json_fallback_hook` | `(response: httpx.Response) -> dict` | Safe JSON parse with text fallback |
| `request_id_hook` | `(response: httpx.Response) -> str \| None` | Extracts `x-github-request-id` header |
| `rate_limit_hook` | `(response: httpx.Response) -> RateLimitInfo \| None` | Parses rate limit headers |

---

## REST Endpoints

All routes are prefixed with `/api/github`.

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/github/health` | Basic health check (returns status, service, version) |
| `GET` | `/api/github/health/rate-limit` | Health check with current rate limit info |

### Repositories

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/github/repos/{owner}/{repo}` | Get a repository |
| `GET` | `/api/github/repos/user/{username}` | List user repositories |
| `GET` | `/api/github/repos/me` | List authenticated user repositories |
| `GET` | `/api/github/repos/org/{org}` | List organization repositories |
| `POST` | `/api/github/repos` | Create a repository |
| `POST` | `/api/github/repos/org/{org}` | Create repository in organization |
| `PATCH` | `/api/github/repos/{owner}/{repo}` | Update a repository |
| `DELETE` | `/api/github/repos/{owner}/{repo}` | Delete a repository |
| `GET` | `/api/github/repos/{owner}/{repo}/topics` | Get repository topics |
| `PUT` | `/api/github/repos/{owner}/{repo}/topics` | Replace repository topics |
| `GET` | `/api/github/repos/{owner}/{repo}/languages` | Get language breakdown |
| `GET` | `/api/github/repos/{owner}/{repo}/contributors` | List contributors |
| `POST` | `/api/github/repos/{owner}/{repo}/forks` | Create a fork |
| `GET` | `/api/github/repos/{owner}/{repo}/forks` | List forks |
| `PUT` | `/api/github/repos/{owner}/{repo}/subscription` | Watch a repository |
| `DELETE` | `/api/github/repos/{owner}/{repo}/subscription` | Unwatch a repository |

### Branches

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/github/repos/{owner}/{repo}/branches` | List branches |
| `GET` | `/api/github/repos/{owner}/{repo}/branches/{branch}` | Get a branch |
| `GET` | `/api/github/repos/{owner}/{repo}/branches/{branch}/protection` | Get branch protection |
| `PUT` | `/api/github/repos/{owner}/{repo}/branches/{branch}/protection` | Update branch protection |
| `DELETE` | `/api/github/repos/{owner}/{repo}/branches/{branch}/protection` | Remove branch protection |
| `POST` | `/api/github/repos/{owner}/{repo}/branches/{branch}/rename` | Rename a branch |
| `POST` | `/api/github/repos/{owner}/{repo}/merges` | Merge branches |
| `GET` | `/api/github/repos/{owner}/{repo}/compare/{base...head}` | Compare branches |

### Collaborators

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/github/repos/{owner}/{repo}/collaborators` | List collaborators |
| `PUT` | `/api/github/repos/{owner}/{repo}/collaborators/{username}` | Add a collaborator |
| `DELETE` | `/api/github/repos/{owner}/{repo}/collaborators/{username}` | Remove a collaborator |
| `GET` | `/api/github/repos/{owner}/{repo}/collaborators/{username}/permission` | Check permission level |
| `GET` | `/api/github/repos/{owner}/{repo}/invitations` | List pending invitations |

### Tags and Releases

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/github/repos/{owner}/{repo}/tags` | List tags |
| `GET` | `/api/github/repos/{owner}/{repo}/releases` | List releases |
| `POST` | `/api/github/repos/{owner}/{repo}/releases` | Create a release |
| `GET` | `/api/github/repos/{owner}/{repo}/releases/latest` | Get latest release |
| `GET` | `/api/github/repos/{owner}/{repo}/releases/tags/{tag}` | Get release by tag |
| `GET` | `/api/github/repos/{owner}/{repo}/releases/{release_id}` | Get release by ID |
| `PATCH` | `/api/github/repos/{owner}/{repo}/releases/{release_id}` | Update a release |
| `DELETE` | `/api/github/repos/{owner}/{repo}/releases/{release_id}` | Delete a release |

### Webhooks

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/github/repos/{owner}/{repo}/hooks` | List webhooks |
| `GET` | `/api/github/repos/{owner}/{repo}/hooks/{hook_id}` | Get a webhook |
| `POST` | `/api/github/repos/{owner}/{repo}/hooks` | Create a webhook |
| `PATCH` | `/api/github/repos/{owner}/{repo}/hooks/{hook_id}` | Update a webhook |
| `DELETE` | `/api/github/repos/{owner}/{repo}/hooks/{hook_id}` | Delete a webhook |
| `POST` | `/api/github/repos/{owner}/{repo}/hooks/{hook_id}/tests` | Test a webhook |
| `POST` | `/api/github/repos/{owner}/{repo}/hooks/{hook_id}/pings` | Ping a webhook |

### Security

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/github/repos/{owner}/{repo}/vulnerability-alerts` | Check vulnerability alerts status |
| `PUT` | `/api/github/repos/{owner}/{repo}/vulnerability-alerts` | Enable vulnerability alerts |
| `DELETE` | `/api/github/repos/{owner}/{repo}/vulnerability-alerts` | Disable vulnerability alerts |
| `GET` | `/api/github/repos/{owner}/{repo}/rulesets` | List rulesets |
| `GET` | `/api/github/repos/{owner}/{repo}/rulesets/{ruleset_id}` | Get a ruleset |
| `POST` | `/api/github/repos/{owner}/{repo}/rulesets` | Create a ruleset |
| `PUT` | `/api/github/repos/{owner}/{repo}/rulesets/{ruleset_id}` | Update a ruleset |
| `DELETE` | `/api/github/repos/{owner}/{repo}/rulesets/{ruleset_id}` | Delete a ruleset |
