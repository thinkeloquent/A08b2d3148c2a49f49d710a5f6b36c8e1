# SDK Guide -- github_api (Python 3.11+ / FastAPI 0.115.0)

A practical guide to using the `github_api` Python SDK for interacting with the GitHub REST API.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Client Initialization](#client-initialization)
- [Repository Operations](#repository-operations)
- [Branch Management](#branch-management)
- [Collaborator Management](#collaborator-management)
- [Tags and Releases](#tags-and-releases)
- [Webhooks](#webhooks)
- [Security](#security)
- [Error Handling](#error-handling)
- [Pagination](#pagination)
- [Rate Limiting](#rate-limiting)
- [Input Validation](#input-validation)

---

## Installation

Install the package in editable mode with development dependencies:

```bash
pip install -e ".[dev]"
```

**Runtime dependencies** (installed automatically):
- `fastapi==0.115.0`
- `uvicorn>=0.30.0`
- `pydantic>=2.0.0`
- `httpx>=0.25.0`

**Development dependencies** (with `[dev]`):
- `pytest>=8.0.0`
- `pytest-asyncio>=0.23.0`
- `respx>=0.20.0`
- `coverage>=7.0.0`

**Requirements:** Python 3.11 or higher.

---

## Quick Start

```python
import asyncio
from github_api.sdk.client import GitHubClient
from github_api.sdk.repos import ReposClient

async def main():
    async with GitHubClient(token="ghp_your_token_here") as client:
        repos = ReposClient(client)
        repo = await repos.get("octocat", "Hello-World")
        print(repo["full_name"], repo["stargazers_count"])

asyncio.run(main())
```

Set the token via environment variable instead of hardcoding:

```bash
export GITHUB_TOKEN=ghp_your_token_here
```

```python
async with GitHubClient() as client:  # Resolves token from GITHUB_TOKEN
    ...
```

---

## Authentication

The SDK resolves tokens from multiple sources in priority order.

### Automatic Resolution

When no explicit token is passed, the SDK checks environment variables:

```python
from github_api.sdk.auth import resolve_token

# Checks: GITHUB_TOKEN -> GH_TOKEN -> GITHUB_ACCESS_TOKEN -> GITHUB_PAT
info = resolve_token()
print(info.source)  # e.g., "GITHUB_TOKEN"
print(info.type)    # e.g., "classic-pat"
```

### Explicit Token

```python
from github_api.sdk.auth import resolve_token, mask_token

info = resolve_token("ghp_abc123def456")
print(info.source)  # "explicit"
print(info.type)    # "classic-pat"
print(mask_token(info.token))  # "ghp_****f456"
```

### Token Type Detection

The SDK detects the token type from its prefix:

```python
from github_api.sdk.auth import resolve_token

# Fine-grained personal access token
resolve_token("github_pat_xxxx").type  # "fine-grained"

# Classic personal access token
resolve_token("ghp_xxxx").type  # "classic-pat"

# OAuth token
resolve_token("gho_xxxx").type  # "oauth"

# User-to-server (GitHub App)
resolve_token("ghu_xxxx").type  # "user-to-server"

# Server-to-server (GitHub App)
resolve_token("ghs_xxxx").type  # "server-to-server"

# Legacy 40-hex-character token
resolve_token("a" * 40).type  # "legacy"
```

### Handling Missing Tokens

```python
from github_api.sdk.auth import resolve_token
from github_api.sdk.errors import AuthError

try:
    info = resolve_token()
except AuthError as exc:
    print(f"No token found: {exc.message}")
    # "No GitHub token found. Provide a token explicitly or set one of:
    #  GITHUB_TOKEN, GH_TOKEN, GITHUB_ACCESS_TOKEN, GITHUB_PAT"
```

---

## Client Initialization

### Basic Usage with Async Context Manager

The recommended pattern uses `async with` to ensure the HTTP client is properly closed:

```python
import asyncio
from github_api.sdk.client import GitHubClient

async def main():
    async with GitHubClient() as client:
        rate_limit = await client.get_rate_limit()
        print(rate_limit["resources"]["core"]["remaining"])

asyncio.run(main())
```

### Manual Lifecycle

```python
client = GitHubClient(token="ghp_your_token")
try:
    data = await client.get("/repos/octocat/Hello-World")
finally:
    await client.close()
```

### Custom Configuration

```python
async with GitHubClient(
    token="ghp_your_token",
    base_url="https://github.example.com/api/v3",  # GitHub Enterprise
    rate_limit_auto_wait=True,
    rate_limit_threshold=10,       # Start waiting at 10 remaining requests
) as client:
    ...
```

### Inspecting Token Info

```python
async with GitHubClient() as client:
    info = client.token_info
    print(f"Source: {info.source}")  # "GITHUB_TOKEN"
    print(f"Type: {info.type}")      # "classic-pat"
```

### Rate Limit Callback

```python
from github_api.sdk.rate_limit import RateLimitInfo

async def on_rate_limit(info: RateLimitInfo) -> None:
    print(f"Rate limit: {info.remaining}/{info.limit}")

async with GitHubClient(on_rate_limit=on_rate_limit) as client:
    ...
```

---

## Repository Operations

All repository operations use `ReposClient`, which wraps `GitHubClient` with domain-specific methods and automatic input validation.

```python
from github_api.sdk.client import GitHubClient
from github_api.sdk.repos import ReposClient
```

### Get a Repository

```python
async with GitHubClient() as client:
    repos = ReposClient(client)
    repo = await repos.get("octocat", "Hello-World")
    print(repo["full_name"])        # "octocat/Hello-World"
    print(repo["stargazers_count"]) # 2500
    print(repo["language"])         # "Python"
```

### List Repositories

```python
async with GitHubClient() as client:
    repos = ReposClient(client)

    # List for a specific user
    user_repos = await repos.list_for_user(
        "octocat",
        params={"per_page": 10, "sort": "updated"},
    )

    # List for an organization
    org_repos = await repos.list_for_org("github")

    # List for the authenticated user
    my_repos = await repos.list_for_authenticated_user(
        params={"visibility": "private"},
    )
```

### Create a Repository

```python
async with GitHubClient() as client:
    repos = ReposClient(client)

    # Create for authenticated user
    new_repo = await repos.create({
        "name": "my-new-repo",
        "description": "Created via the SDK",
        "private": True,
        "auto_init": True,
    })
    print(new_repo["html_url"])

    # Create in an organization
    org_repo = await repos.create_in_org("my-org", {
        "name": "org-project",
        "description": "Organization project",
        "private": False,
    })
```

### Update a Repository

```python
async with GitHubClient() as client:
    repos = ReposClient(client)
    updated = await repos.update("octocat", "Hello-World", {
        "description": "Updated description",
        "has_issues": True,
        "has_wiki": False,
    })
```

### Delete a Repository

```python
async with GitHubClient() as client:
    repos = ReposClient(client)
    await repos.delete("my-user", "repo-to-delete")
```

### Topics and Languages

```python
async with GitHubClient() as client:
    repos = ReposClient(client)

    # Get topics
    topics = await repos.get_topics("octocat", "Hello-World")
    print(topics["names"])  # ["hello", "world"]

    # Replace all topics
    await repos.replace_topics("my-user", "my-repo", ["python", "api", "sdk"])

    # Get language breakdown (language -> bytes)
    languages = await repos.get_languages("octocat", "Hello-World")
    # {"Python": 15000, "Shell": 2400}
```

### Forks and Stars

```python
async with GitHubClient() as client:
    repos = ReposClient(client)

    # Fork a repository
    fork = await repos.fork("octocat", "Hello-World")

    # List forks
    forks = await repos.list_forks("octocat", "Hello-World")

    # Star / unstar
    await repos.star("octocat", "Hello-World")
    is_starred = await repos.is_starred("octocat", "Hello-World")  # True
    await repos.unstar("octocat", "Hello-World")

    # Watch / unwatch
    await repos.watch("octocat", "Hello-World")
    sub = await repos.get_subscription("octocat", "Hello-World")
    await repos.unwatch("octocat", "Hello-World")
```

### Transfer a Repository

```python
async with GitHubClient() as client:
    repos = ReposClient(client)
    await repos.transfer("old-owner", "my-repo", "new-owner")
```

---

## Branch Management

```python
from github_api.sdk.client import GitHubClient
from github_api.sdk.branches import BranchesClient
```

### List and Get Branches

```python
async with GitHubClient() as client:
    branches = BranchesClient(client)

    # List all branches
    branch_list = await branches.list("octocat", "Hello-World")

    # Get a specific branch
    main = await branches.get("octocat", "Hello-World", "main")
    print(main["commit"]["sha"])
```

### Branch Protection

```python
async with GitHubClient() as client:
    branches = BranchesClient(client)

    # Get current protection
    protection = await branches.get_protection("my-org", "my-repo", "main")

    # Update protection with full configuration
    await branches.update_protection("my-org", "my-repo", "main", {
        "required_pull_request_reviews": {
            "dismiss_stale_reviews": True,
            "require_code_owner_reviews": True,
            "required_approving_review_count": 2,
        },
        "required_status_checks": {
            "strict": True,
            "contexts": ["ci/build", "ci/test"],
        },
        "enforce_admins": True,
        "restrictions": None,
    })

    # Remove all protection
    await branches.remove_protection("my-org", "my-repo", "main")
```

### Protection Templates

Apply predefined protection configurations:

```python
async with GitHubClient() as client:
    branches = BranchesClient(client)

    # "minimal" -- 1 PR review, no status checks
    await branches.create_protection_template(
        "my-org", "my-repo", "develop", template="minimal"
    )

    # "standard" -- 1 PR review, strict status checks
    await branches.create_protection_template(
        "my-org", "my-repo", "main", template="standard"
    )

    # "strict" -- 2 PR reviews, dismiss stale, CODEOWNERS, admin enforcement
    await branches.create_protection_template(
        "my-org", "my-repo", "release", template="strict"
    )
```

### Status Checks and Reviews

```python
async with GitHubClient() as client:
    branches = BranchesClient(client)

    # Get and update status checks
    checks = await branches.get_status_checks("my-org", "my-repo", "main")
    await branches.update_status_checks("my-org", "my-repo", "main", {
        "strict": True,
        "contexts": ["ci/build", "ci/lint"],
    })

    # Get and update review protection
    reviews = await branches.get_review_protection("my-org", "my-repo", "main")
    await branches.update_review_protection("my-org", "my-repo", "main", {
        "dismiss_stale_reviews": True,
        "required_approving_review_count": 2,
    })
    await branches.delete_review_protection("my-org", "my-repo", "main")
```

### Admin Enforcement and Push Restrictions

```python
async with GitHubClient() as client:
    branches = BranchesClient(client)

    # Admin enforcement
    await branches.set_admin_enforcement("my-org", "my-repo", "main")
    status = await branches.get_admin_enforcement("my-org", "my-repo", "main")
    await branches.remove_admin_enforcement("my-org", "my-repo", "main")

    # Push restrictions
    restrictions = await branches.get_push_restrictions("my-org", "my-repo", "main")
    await branches.update_push_restrictions("my-org", "my-repo", "main", {
        "users": ["admin-user"],
        "teams": ["release-team"],
    })
    await branches.delete_push_restrictions("my-org", "my-repo", "main")
```

### Rename, Merge, and Compare

```python
async with GitHubClient() as client:
    branches = BranchesClient(client)

    # Rename a branch
    await branches.rename("my-org", "my-repo", "old-name", "new-name")

    # Merge branches
    merge_result = await branches.merge("my-org", "my-repo", {
        "base": "main",
        "head": "feature-branch",
        "commit_message": "Merge feature-branch into main",
    })

    # Compare two refs
    comparison = await branches.compare(
        "my-org", "my-repo", "main", "feature-branch"
    )
    print(f"Ahead by {comparison['ahead_by']} commits")
    print(f"Behind by {comparison['behind_by']} commits")
```

---

## Collaborator Management

```python
from github_api.sdk.client import GitHubClient
from github_api.sdk.collaborators import CollaboratorsClient
```

### List, Add, and Remove

```python
async with GitHubClient() as client:
    collabs = CollaboratorsClient(client)

    # List all collaborators
    collaborators = await collabs.list("my-org", "my-repo")

    # Add a collaborator with a specific permission
    await collabs.add(
        "my-org", "my-repo", "new-user", permission="push"
    )
    # Permission options: "pull", "triage", "push", "maintain", "admin"

    # Remove a collaborator
    await collabs.remove("my-org", "my-repo", "old-user")
```

### Check Permissions

```python
async with GitHubClient() as client:
    collabs = CollaboratorsClient(client)

    # Get detailed permission info
    perm = await collabs.check_permission("my-org", "my-repo", "some-user")
    print(perm["permission"])  # "push"

    # Check minimum permission level
    can_write = await collabs.has_permission(
        "my-org", "my-repo", "some-user", "push"
    )
    print(can_write)  # True or False
```

### Bulk Operations

```python
async with GitHubClient() as client:
    collabs = CollaboratorsClient(client)

    # Add multiple collaborators at once
    results = await collabs.bulk_add("my-org", "my-repo", [
        {"username": "user1", "permission": "push"},
        {"username": "user2", "permission": "admin"},
        {"username": "user3"},  # defaults to "push"
    ])
    for result in results:
        print(f"{result['username']}: {result['status']}")
```

### Statistics

```python
async with GitHubClient() as client:
    collabs = CollaboratorsClient(client)
    stats = await collabs.get_stats("my-org", "my-repo")
    print(f"Total: {stats['total']}")
    print(f"Admins: {stats['admins']}")
    print(f"Writers: {stats['writers']}")
```

---

## Tags and Releases

```python
from github_api.sdk.client import GitHubClient
from github_api.sdk.tags import TagsClient
```

### List Tags and Releases

```python
async with GitHubClient() as client:
    tags = TagsClient(client)

    # List tags
    tag_list = await tags.list_tags("octocat", "Hello-World")

    # List releases
    releases = await tags.list_releases("octocat", "Hello-World")

    # Get latest release
    latest = await tags.get_latest_release("octocat", "Hello-World")
    print(latest["tag_name"])
```

### Create and Manage Releases

```python
async with GitHubClient() as client:
    tags = TagsClient(client)

    # Create a release
    release = await tags.create_release("my-org", "my-repo", {
        "tag_name": "v1.0.0",
        "name": "Version 1.0.0",
        "body": "First stable release.",
        "draft": False,
        "prerelease": False,
    })
    print(release["html_url"])

    # Update a release
    await tags.update_release("my-org", "my-repo", release["id"], {
        "body": "Updated release notes.",
    })

    # Delete a release
    await tags.delete_release("my-org", "my-repo", release["id"])
```

### Get Releases by ID or Tag

```python
async with GitHubClient() as client:
    tags = TagsClient(client)

    # By release ID
    release = await tags.get_release("my-org", "my-repo", 12345)

    # By tag name
    release = await tags.get_release_by_tag("my-org", "my-repo", "v1.0.0")
```

### Tag Protection Rules

```python
async with GitHubClient() as client:
    tags = TagsClient(client)

    # List protections
    protections = await tags.list_tag_protections("my-org", "my-repo")

    # Create protection (glob pattern)
    await tags.create_tag_protection("my-org", "my-repo", "v*")

    # Delete protection
    await tags.delete_tag_protection("my-org", "my-repo", protection_id=42)
```

### Semantic Versioning Utilities

These are static methods that work offline (no API calls):

```python
from github_api.sdk.tags import TagsClient
from github_api.sdk.tags.models import parse_semantic_version

# Parse version strings
sv = parse_semantic_version("v1.2.3")
print(sv.major, sv.minor, sv.patch)  # 1 2 3

# Calculate next version
next_patch = TagsClient.get_next_version(sv, bump="patch")   # 1.2.4
next_minor = TagsClient.get_next_version(sv, bump="minor")   # 1.3.0
next_major = TagsClient.get_next_version(sv, bump="major")   # 2.0.0

# Sort tags by version (descending)
tags = [{"name": "v1.0.0"}, {"name": "v2.1.0"}, {"name": "v0.1.0"}]
sorted_tags = TagsClient.sort_by_version(tags, descending=True)
# [{"name": "v2.1.0"}, {"name": "v1.0.0"}, {"name": "v0.1.0"}]
```

---

## Webhooks

```python
from github_api.sdk.client import GitHubClient
from github_api.sdk.webhooks import WebhooksClient
```

### CRUD Operations

```python
async with GitHubClient() as client:
    webhooks = WebhooksClient(client)

    # List all webhooks
    hooks = await webhooks.list("my-org", "my-repo")

    # Get a specific webhook
    hook = await webhooks.get("my-org", "my-repo", hook_id=12345)

    # Create a webhook
    new_hook = await webhooks.create("my-org", "my-repo", {
        "config": {
            "url": "https://example.com/webhook",
            "content_type": "json",
            "secret": "my-webhook-secret",
            "insecure_ssl": "0",
        },
        "events": ["push", "pull_request"],
        "active": True,
    })

    # Update a webhook
    await webhooks.update("my-org", "my-repo", new_hook["id"], {
        "active": False,
    })

    # Delete a webhook
    await webhooks.delete("my-org", "my-repo", new_hook["id"])
```

### Testing and Pinging

```python
async with GitHubClient() as client:
    webhooks = WebhooksClient(client)

    # Send a test delivery (latest push event)
    await webhooks.test("my-org", "my-repo", hook_id=12345)

    # Ping the webhook
    await webhooks.ping("my-org", "my-repo", hook_id=12345)
```

---

## Security

```python
from github_api.sdk.client import GitHubClient
from github_api.sdk.security import SecurityClient
```

### Vulnerability Alerts

```python
async with GitHubClient() as client:
    security = SecurityClient(client)

    # Check if alerts are enabled
    status = await security.get_vulnerability_alerts("my-org", "my-repo")
    print(status["enabled"])  # True or False

    # Enable alerts
    await security.enable_vulnerability_alerts("my-org", "my-repo")

    # Disable alerts
    await security.disable_vulnerability_alerts("my-org", "my-repo")
```

### Security Analysis Settings

```python
async with GitHubClient() as client:
    security = SecurityClient(client)

    # Get current settings
    analysis = await security.get_security_analysis("my-org", "my-repo")

    # Update settings
    await security.update_security_analysis("my-org", "my-repo", {
        "advanced_security": {"status": "enabled"},
        "secret_scanning": {"status": "enabled"},
        "secret_scanning_push_protection": {"status": "enabled"},
    })
```

### Repository Rulesets

```python
async with GitHubClient() as client:
    security = SecurityClient(client)

    # List rulesets
    rulesets = await security.list_rulesets("my-org", "my-repo")

    # Get a specific ruleset
    ruleset = await security.get_ruleset("my-org", "my-repo", ruleset_id=1)

    # Create a ruleset
    new_ruleset = await security.create_ruleset("my-org", "my-repo", {
        "name": "Branch Protection",
        "target": "branch",
        "enforcement": "active",
        "rules": [
            {"type": "deletion"},
            {"type": "non_fast_forward"},
        ],
    })

    # Update a ruleset
    await security.update_ruleset("my-org", "my-repo", new_ruleset["id"], {
        "enforcement": "disabled",
    })

    # Delete a ruleset
    await security.delete_ruleset("my-org", "my-repo", new_ruleset["id"])
```

---

## Error Handling

The SDK maps every non-2xx GitHub API response to a typed exception.

### Basic Pattern

```python
from github_api.sdk.errors import (
    AuthError,
    NotFoundError,
    ValidationError,
    RateLimitError,
    ForbiddenError,
    ConflictError,
    ServerError,
    GitHubError,
)

async with GitHubClient() as client:
    repos = ReposClient(client)

    try:
        repo = await repos.get("owner", "repo-name")
    except NotFoundError as exc:
        print(f"Not found: {exc.message}")
        print(f"Status: {exc.status}")           # 404
        print(f"Request ID: {exc.request_id}")
    except AuthError as exc:
        print(f"Auth failed: {exc.message}")      # 401
    except ForbiddenError as exc:
        print(f"Forbidden: {exc.message}")         # 403
    except RateLimitError as exc:
        print(f"Rate limited: {exc.message}")      # 429
        print(f"Retry after: {exc.retry_after}s")
        print(f"Resets at: {exc.reset_at}")
    except ValidationError as exc:
        print(f"Validation: {exc.message}")        # 422
        for err in exc.errors:
            print(f"  Field: {err['field']}, Code: {err['code']}")
    except ConflictError as exc:
        print(f"Conflict: {exc.message}")          # 409
    except ServerError as exc:
        print(f"Server error: {exc.message}")      # 5xx
    except GitHubError as exc:
        print(f"Other error ({exc.status}): {exc.message}")
```

### Error Serialization

All errors support `to_dict()` for JSON serialization:

```python
try:
    await repos.get("owner", "nonexistent")
except GitHubError as exc:
    error_dict = exc.to_dict()
    # {
    #     "error": "NotFoundError",
    #     "message": "Not Found",
    #     "status": 404,
    #     "request_id": "ABCD-1234",
    #     "documentation_url": "https://docs.github.com/rest",
    # }
```

### Validation Errors from Input

Input validation errors are raised before any HTTP request:

```python
from github_api.sdk.validation import validate_repository_name
from github_api.sdk.errors import ValidationError

try:
    validate_repository_name("settings")  # Reserved name
except ValidationError as exc:
    print(exc.message)   # "Repository name 'settings' is reserved by GitHub"
    print(exc.errors)    # [{"field": "name", "code": "reserved"}]
    print(exc.status)    # 422
```

---

## Pagination

The SDK provides two pagination utilities that follow GitHub's `Link` header `rel="next"` automatically.

### Async Generator (Page by Page)

```python
from github_api.sdk.pagination import paginate

async with GitHubClient() as client:
    page_num = 0
    async for page in paginate(
        client,
        "/users/octocat/repos",
        per_page=10,
        max_pages=5,
    ):
        page_num += 1
        print(f"Page {page_num}: {len(page)} items")
        for repo in page:
            print(f"  - {repo['name']}")
```

### Collect All Items

```python
from github_api.sdk.pagination import paginate_all

async with GitHubClient() as client:
    all_repos = await paginate_all(
        client,
        "/users/octocat/repos",
        per_page=100,
        max_pages=10,
    )
    print(f"Total: {len(all_repos)} repositories")
```

### With Domain Clients

Domain clients return single pages. Use pagination with the base client for full traversal:

```python
from github_api.sdk.pagination import paginate_all

async with GitHubClient() as client:
    # Paginate all branches
    all_branches = await paginate_all(
        client,
        "/repos/octocat/Hello-World/branches",
        per_page=100,
    )

    # Paginate all contributors
    all_contributors = await paginate_all(
        client,
        "/repos/octocat/Hello-World/contributors",
        per_page=100,
    )
```

---

## Rate Limiting

### Automatic Wait (Default)

By default, the client automatically sleeps when the rate limit is exhausted:

```python
async with GitHubClient(rate_limit_auto_wait=True) as client:
    # If rate limit hits 0, the client sleeps until the window resets,
    # then retries automatically.
    repo = await client.get("/repos/octocat/Hello-World")
```

### Custom Threshold

Start waiting before the limit is fully exhausted:

```python
async with GitHubClient(
    rate_limit_auto_wait=True,
    rate_limit_threshold=10,  # Wait when remaining <= 10
) as client:
    ...
```

### Disable Auto-Wait

```python
async with GitHubClient(rate_limit_auto_wait=False) as client:
    # RateLimitError will be raised instead of sleeping
    try:
        await client.get("/repos/octocat/Hello-World")
    except RateLimitError as exc:
        print(f"Rate limited! Retry after {exc.retry_after}s")
```

### Manual Rate Limit Checking

```python
from github_api.sdk.rate_limit import (
    RateLimitInfo,
    parse_rate_limit_headers,
    should_wait_for_rate_limit,
    wait_for_rate_limit,
)

async with GitHubClient() as client:
    # Check current rate limit via API
    rate_data = await client.get_rate_limit()
    core = rate_data["resources"]["core"]
    print(f"Remaining: {core['remaining']}/{core['limit']}")

    # Check last rate limit from response headers
    info = client.last_rate_limit
    if info:
        print(f"Remaining: {info.remaining}")
        print(f"Resets at: {info.reset_at.isoformat()}")
        print(f"Seconds until reset: {info.seconds_until_reset:.0f}")
        print(f"Exhausted: {info.is_exhausted}")
```

### Secondary Rate Limit Detection

```python
from github_api.sdk.rate_limit import is_secondary_rate_limit

# Detects abuse/secondary rate limits from response
is_secondary = is_secondary_rate_limit(
    status=403,
    body={"message": "You have exceeded a secondary rate limit"},
)
print(is_secondary)  # True
```

The client handles secondary rate limits automatically by reading the `Retry-After` header and sleeping before retrying once.

---

## Input Validation

All domain clients validate inputs before making API requests. You can also use validators directly.

### Repository Names

```python
from github_api.sdk.validation import validate_repository_name, RESERVED_REPO_NAMES

# Valid names return the name unchanged
name = validate_repository_name("my-cool-repo")  # "my-cool-repo"

# Invalid names raise ValidationError
from github_api.sdk.errors import ValidationError

try:
    validate_repository_name("")             # Empty
    validate_repository_name("A" * 101)      # Too long
    validate_repository_name("my repo")      # Space
    validate_repository_name(".hidden")      # Starts with dot
    validate_repository_name("settings")     # Reserved
except ValidationError as exc:
    print(exc.message)
    print(exc.errors)  # [{"field": "name", "code": "..."}]

# Check reserved names
print(len(RESERVED_REPO_NAMES))  # 56+
print("settings" in RESERVED_REPO_NAMES)  # True
```

### Usernames

```python
from github_api.sdk.validation import validate_username

validate_username("octocat")      # OK
validate_username("my-org")       # OK

# These raise ValidationError:
# validate_username("-invalid")   # Starts with hyphen
# validate_username("bad--name")  # Consecutive hyphens
# validate_username("A" * 40)     # Too long (max 39)
```

### Branch Names

```python
from github_api.sdk.validation import validate_branch_name

validate_branch_name("main")               # OK
validate_branch_name("feature/my-branch")  # OK
validate_branch_name("release/1.0.0")      # OK

# These raise ValidationError:
# validate_branch_name("")                 # Empty
# validate_branch_name("feat//bad")        # Consecutive slashes
# validate_branch_name("@")               # Single @
# validate_branch_name("has space")        # Contains space
```
