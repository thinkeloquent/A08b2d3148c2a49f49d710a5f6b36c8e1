"""
GitHub API SDK -- Basic Usage Examples

Demonstrates core features of the github-api package:
- Token resolution and authentication
- Repository operations (list, get, create)
- Input validation
- Error handling
- Pagination
- Rate limit awareness

Prerequisites:
    export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

Usage:
    python basic_usage.py
"""

import asyncio
import os
import sys
import time

# ---------------------------------------------------------------------------
# Add parent package to path so imports resolve without pip install
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from github_api.sdk.auth import TokenInfo, mask_token, resolve_token
from github_api.sdk.client import GitHubClient
from github_api.sdk.errors import (
    AuthError,
    ConflictError,
    ForbiddenError,
    GitHubError,
    NotFoundError,
    RateLimitError,
    ServerError,
    ValidationError,
    map_response_to_error,
)
from github_api.sdk.pagination import paginate, paginate_all
from github_api.sdk.rate_limit import (
    RateLimitInfo,
    is_secondary_rate_limit,
    parse_rate_limit_headers,
    should_wait_for_rate_limit,
)
from github_api.sdk.repos.client import ReposClient
from github_api.sdk.branches.client import BranchesClient
from github_api.sdk.tags.client import TagsClient
from github_api.sdk.tags.models import SemanticVersion, parse_semantic_version
from github_api.sdk.validation import (
    RESERVED_REPO_NAMES,
    validate_branch_name,
    validate_repository_name,
    validate_username,
)


# ===========================================================================
# Example 1 -- Token Resolution
# ===========================================================================

def example1_token_resolution() -> None:
    """Demonstrate token resolution, masking, and type detection.

    The SDK searches for a GitHub token in this order:
      1. Explicit value passed to resolve_token() / GitHubClient(token=...)
      2. GITHUB_TOKEN environment variable
      3. GH_TOKEN environment variable
      4. GITHUB_ACCESS_TOKEN environment variable
      5. GITHUB_PAT environment variable
    """
    print("=== Example 1: Token Resolution ===\n")

    # --- 1a. Resolve from an explicit value ---
    info: TokenInfo = resolve_token("ghp_exampleClassicPAT00000000000000demo")
    print("Explicit token:")
    print(f"  source : {info.source}")        # "explicit"
    print(f"  type   : {info.type}")           # "classic-pat"
    print(f"  masked : {mask_token(info.token)}")
    print()

    # --- 1b. Token type detection for different prefixes ---
    samples = {
        "github_pat_sampleFineGrainedToken0000000": "fine-grained",
        "ghp_sampleClassicPAT0000000000000000": "classic-pat",
        "gho_sampleOAuthToken000000000000000": "oauth",
        "ghu_sampleUserToServer00000000000000": "user-to-server",
        "ghs_sampleServerToServer000000000000": "server-to-server",
        "a" * 40: "legacy (40-hex-char)",
        "random-unknown-format": "unknown",
    }
    print("Token type detection:")
    for token_value, expected_label in samples.items():
        detected = resolve_token(token_value)
        print(f"  {mask_token(token_value):40s}  ->  type={detected.type}")
    print()

    # --- 1c. Resolve from environment (if set) ---
    env_token = os.environ.get("GITHUB_TOKEN")
    if env_token:
        env_info = resolve_token()  # no explicit value -> checks env vars
        print("Environment token resolved:")
        print(f"  source : {env_info.source}")
        print(f"  type   : {env_info.type}")
        print(f"  masked : {mask_token(env_info.token)}")
    else:
        print("(No GITHUB_TOKEN in environment -- skipping env resolution demo)")
    print()


# ===========================================================================
# Example 2 -- Client Initialization
# ===========================================================================

async def example2_client_initialization() -> None:
    """Demonstrate GitHubClient creation, configuration, and lifecycle.

    The client manages an httpx.AsyncClient under the hood and must
    be closed when finished.  The preferred pattern is ``async with``.
    """
    print("=== Example 2: Client Initialization ===\n")

    # --- 2a. Basic construction with explicit token ---
    client = GitHubClient(token=os.environ["GITHUB_TOKEN"])
    print("Client created:")
    print(f"  token source : {client.token_info.source}")
    print(f"  token type   : {client.token_info.type}")
    print(f"  token masked : {mask_token(client.token_info.token)}")
    await client.close()
    print()

    # --- 2b. Custom configuration ---
    client = GitHubClient(
        token=os.environ["GITHUB_TOKEN"],
        base_url="https://api.github.com",      # default; override for GHES
        rate_limit_auto_wait=True,               # sleep when rate limit exhausted
        rate_limit_threshold=10,                  # start waiting at 10 remaining
    )
    await client.close()
    print("Custom configuration applied (rate_limit_threshold=10)")
    print()

    # --- 2c. Async context manager (recommended) ---
    async with GitHubClient(token=os.environ["GITHUB_TOKEN"]) as client:
        # The client is automatically closed on exit
        rate_limit = await client.get_rate_limit()
        core = rate_limit.get("resources", {}).get("core", {})
        print("Rate limit status (via async context manager):")
        print(f"  limit     : {core.get('limit')}")
        print(f"  remaining : {core.get('remaining')}")
        print(f"  used      : {core.get('used')}")
        print(f"  resets at : {core.get('reset')}")
    print()


# ===========================================================================
# Example 3 -- Repository Operations
# ===========================================================================

async def example3_repository_operations() -> None:
    """Demonstrate repository listing, fetching, topics, and languages.

    Uses ReposClient which wraps GitHubClient with domain-specific
    methods and automatic input validation.
    """
    print("=== Example 3: Repository Operations ===\n")

    async with GitHubClient(token=os.environ["GITHUB_TOKEN"]) as client:
        repos = ReposClient(client)

        # --- 3a. List repositories for a user ---
        print("Listing public repos for 'octocat':")
        result = await repos.list_for_user(
            "octocat",
            params={"per_page": 5, "sort": "updated"},
        )
        # list_for_user returns the raw JSON which is a list wrapped in
        # a dict with key "data" when the response is a list
        repo_list = result.get("data", result) if isinstance(result, dict) else result
        if isinstance(repo_list, list):
            for r in repo_list[:5]:
                print(f"  - {r['full_name']} ({r.get('language', 'n/a')})")
        else:
            print(f"  (unexpected response shape: {type(repo_list)})")
        print()

        # --- 3b. Get a specific repository ---
        print("Fetching 'octocat/Hello-World':")
        repo = await repos.get("octocat", "Hello-World")
        print(f"  name        : {repo.get('full_name')}")
        print(f"  description : {repo.get('description')}")
        print(f"  stars       : {repo.get('stargazers_count')}")
        print(f"  forks       : {repo.get('forks_count')}")
        print(f"  language    : {repo.get('language')}")
        print(f"  default br  : {repo.get('default_branch')}")
        print()

        # --- 3c. Get repository topics ---
        print("Topics for 'octocat/Hello-World':")
        topics = await repos.get_topics("octocat", "Hello-World")
        print(f"  {topics.get('names', [])}")
        print()

        # --- 3d. Get repository languages ---
        print("Languages for 'octocat/Hello-World':")
        languages = await repos.get_languages("octocat", "Hello-World")
        for lang, byte_count in languages.items():
            print(f"  {lang}: {byte_count} bytes")
        print()


# ===========================================================================
# Example 4 -- Input Validation
# ===========================================================================

def example4_input_validation() -> None:
    """Demonstrate SDK input validation for repo names, usernames, and branches.

    Validation runs before any HTTP request is made, providing fast
    feedback and preventing unnecessary API calls.
    """
    print("=== Example 4: Input Validation ===\n")

    # --- 4a. Repository name validation ---
    print("Repository name validation:")

    valid_repo_names = ["my-repo", "cool_project", "app.v2", "A" * 100]
    for name in valid_repo_names:
        result = validate_repository_name(name)
        label = name if len(name) <= 30 else name[:27] + "..."
        print(f"  VALID   : {label!r}")

    invalid_repo_names = [
        ("", "empty"),
        ("A" * 101, "too long (101 chars)"),
        ("my repo", "contains space"),
        (".hidden", "starts with dot"),
        ("repo.", "ends with dot"),
        ("settings", "reserved name"),
        ("my/repo", "contains slash"),
    ]
    for name, reason in invalid_repo_names:
        try:
            validate_repository_name(name)
            print(f"  UNEXPECTED PASS: {name!r}")
        except ValidationError as exc:
            label = name if len(name) <= 30 else name[:27] + "..."
            print(f"  INVALID : {label!r:35s} -- {reason} -- {exc.errors}")
    print()

    # --- 4b. Username validation ---
    print("Username validation:")

    valid_usernames = ["octocat", "my-org", "a", "user123"]
    for name in valid_usernames:
        validate_username(name)
        print(f"  VALID   : {name!r}")

    invalid_usernames = [
        ("", "empty"),
        ("A" * 40, "too long (40 chars)"),
        ("-user", "starts with hyphen"),
        ("user-", "ends with hyphen"),
        ("bad--name", "consecutive hyphens"),
        ("has space", "contains space"),
    ]
    for name, reason in invalid_usernames:
        try:
            validate_username(name)
            print(f"  UNEXPECTED PASS: {name!r}")
        except ValidationError:
            print(f"  INVALID : {name!r:35s} -- {reason}")
    print()

    # --- 4c. Branch name validation ---
    print("Branch name validation:")

    valid_branches = ["main", "feature/my-feature", "release/1.0.0", "a/b/c/d", "feature@2"]
    for name in valid_branches:
        validate_branch_name(name)
        print(f"  VALID   : {name!r}")

    invalid_branches = [
        ("", "empty"),
        ("A" * 256, "too long (256 chars)"),
        ("feature//bad", "consecutive slashes"),
        ("@", "single @ sign"),
        ("branch name", "contains space"),
        ("branch~name", "contains tilde"),
        ("branch^name", "contains caret"),
    ]
    for name, reason in invalid_branches:
        try:
            validate_branch_name(name)
            print(f"  UNEXPECTED PASS: {name!r}")
        except ValidationError:
            label = name if len(name) <= 30 else name[:27] + "..."
            print(f"  INVALID : {label!r:35s} -- {reason}")
    print()

    # --- 4d. Show some reserved repository names ---
    print(f"Reserved repo names ({len(RESERVED_REPO_NAMES)} total):")
    sample = sorted(RESERVED_REPO_NAMES)[:12]
    print(f"  {', '.join(sample)}, ...")
    print()


# ===========================================================================
# Example 5 -- Error Handling
# ===========================================================================

def example5_error_handling() -> None:
    """Demonstrate the SDK's typed error hierarchy and error mapping.

    Every non-2xx response from the GitHub API is mapped to a specific
    error class.  Errors carry status, message, request_id, and can
    be serialized with to_dict() for JSON APIs.
    """
    print("=== Example 5: Error Handling ===\n")

    # --- 5a. The error class hierarchy ---
    print("Error class hierarchy:")
    print("  GitHubError (base)")
    for cls in [AuthError, NotFoundError, ValidationError, RateLimitError,
                ConflictError, ForbiddenError, ServerError]:
        print(f"    +-- {cls.__name__}")
    print()

    # --- 5b. map_response_to_error for common status codes ---
    print("Error mapping from HTTP status codes:")

    test_cases = [
        (401, {"message": "Bad credentials"}, {}, "AuthError"),
        (403, {"message": "Forbidden"}, {}, "ForbiddenError"),
        (403, {"message": "Rate limit"}, {"x-ratelimit-remaining": "0", "x-ratelimit-reset": "1700000000"}, "RateLimitError"),
        (404, {"message": "Not Found"}, {"x-github-request-id": "REQ-12345"}, "NotFoundError"),
        (409, {"message": "Conflict"}, {}, "ConflictError"),
        (422, {"message": "Validation Failed", "errors": [{"field": "name", "code": "invalid"}]}, {}, "ValidationError"),
        (429, {"message": "Rate limit exceeded"}, {"retry-after": "60"}, "RateLimitError"),
        (500, {"message": "Internal Server Error"}, {}, "ServerError"),
    ]

    for status, body, headers, expected_class in test_cases:
        error = map_response_to_error(status, body, headers)
        print(f"  HTTP {status} -> {error.__class__.__name__:20s}  message={error.message!r}")

    print()

    # --- 5c. Error serialization with to_dict() ---
    print("Error serialization (to_dict):")
    error = map_response_to_error(
        404,
        {"message": "Not Found", "documentation_url": "https://docs.github.com/rest"},
        {"x-github-request-id": "DEMO-REQ-456"},
    )
    error_dict = error.to_dict()
    for key, value in error_dict.items():
        print(f"  {key:20s}: {value}")
    print()

    # --- 5d. ValidationError includes field-level errors ---
    print("ValidationError with field-level errors:")
    val_error = map_response_to_error(
        422,
        {
            "message": "Validation Failed",
            "errors": [
                {"resource": "Repository", "field": "name", "code": "already_exists"},
                {"resource": "Repository", "field": "name", "code": "custom", "message": "name already taken"},
            ],
        },
        {},
    )
    val_dict = val_error.to_dict()
    print(f"  message: {val_dict['message']}")
    for field_error in val_dict.get("errors", []):
        print(f"  field error: {field_error}")
    print()

    # --- 5e. try/except pattern ---
    print("Recommended try/except pattern:")
    print("""
    try:
        repo = await repos.get("owner", "repo")
    except NotFoundError as exc:
        print(f"Repository not found: {exc.message}")
    except AuthError as exc:
        print(f"Authentication failed: {exc.message}")
    except RateLimitError as exc:
        print(f"Rate limited, retry after: {exc.retry_after}s")
    except ValidationError as exc:
        print(f"Invalid input: {exc.errors}")
    except GitHubError as exc:
        print(f"GitHub API error ({exc.status}): {exc.message}")
    """)


# ===========================================================================
# Example 6 -- Pagination
# ===========================================================================

async def example6_pagination() -> None:
    """Demonstrate paginated API traversal using the SDK's pagination helpers.

    paginate()     -- async generator yielding one page (list) at a time.
    paginate_all() -- convenience that collects every item into one list.

    Both follow the Link header rel="next" and support max_pages safety.
    """
    print("=== Example 6: Pagination ===\n")

    async with GitHubClient(token=os.environ["GITHUB_TOKEN"]) as client:

        # --- 6a. paginate() async generator -- page by page ---
        print("Paginating repos for 'octocat' (2 items/page, max 3 pages):")
        page_num = 0
        async for page in paginate(
            client,
            "/users/octocat/repos",
            per_page=2,
            max_pages=3,
        ):
            page_num += 1
            names = [r["name"] for r in page]
            print(f"  Page {page_num}: {names}")
        print()

        # --- 6b. paginate_all() -- collect everything ---
        print("Collecting all repos for 'octocat' (max 2 pages):")
        all_repos = await paginate_all(
            client,
            "/users/octocat/repos",
            per_page=5,
            max_pages=2,
        )
        print(f"  Total collected: {len(all_repos)} repos")
        for r in all_repos[:5]:
            print(f"    - {r['name']}")
        if len(all_repos) > 5:
            print(f"    ... and {len(all_repos) - 5} more")
        print()


# ===========================================================================
# Example 7 -- Rate Limit Awareness
# ===========================================================================

def example7_rate_limit_awareness() -> None:
    """Demonstrate rate limit parsing, detection, and decision helpers.

    These utilities work on raw HTTP headers and do not require a live
    connection, making them useful for offline testing and middleware.
    """
    print("=== Example 7: Rate Limit Awareness ===\n")

    # --- 7a. Parse rate limit info from headers ---
    print("Parsing rate limit headers:")
    headers = {
        "x-ratelimit-limit": "5000",
        "x-ratelimit-remaining": "4987",
        "x-ratelimit-reset": str(int(time.time()) + 3600),
        "x-ratelimit-used": "13",
        "x-ratelimit-resource": "core",
    }
    info = parse_rate_limit_headers(headers)
    if info:
        print(f"  limit            : {info.limit}")
        print(f"  remaining        : {info.remaining}")
        print(f"  used             : {info.used}")
        print(f"  resource         : {info.resource}")
        print(f"  reset_at (UTC)   : {info.reset_at.isoformat()}")
        print(f"  seconds to reset : {info.seconds_until_reset:.0f}")
        print(f"  is_exhausted     : {info.is_exhausted}")
    print()

    # --- 7b. Missing headers return None ---
    print("Missing headers -> None:")
    missing = parse_rate_limit_headers({})
    print(f"  parse_rate_limit_headers({{}}) = {missing}")
    print()

    # --- 7c. Exhausted rate limit ---
    print("Exhausted rate limit detection:")
    exhausted = RateLimitInfo(
        limit=5000,
        remaining=0,
        reset=int(time.time()) + 120,
        used=5000,
        resource="core",
    )
    print(f"  remaining=0  -> is_exhausted={exhausted.is_exhausted}")
    print(f"  seconds_until_reset={exhausted.seconds_until_reset:.0f}")
    print()

    # --- 7d. should_wait_for_rate_limit ---
    print("should_wait_for_rate_limit:")
    healthy = RateLimitInfo(limit=5000, remaining=4000, reset=int(time.time()) + 3600, used=1000)
    low = RateLimitInfo(limit=5000, remaining=5, reset=int(time.time()) + 300, used=4995)

    print(f"  remaining=4000, auto_wait=True,  threshold=0  -> {should_wait_for_rate_limit(healthy, auto_wait=True, threshold=0)}")
    print(f"  remaining=5,    auto_wait=True,  threshold=10 -> {should_wait_for_rate_limit(low, auto_wait=True, threshold=10)}")
    print(f"  remaining=0,    auto_wait=False, threshold=0  -> {should_wait_for_rate_limit(exhausted, auto_wait=False, threshold=0)}")
    print()

    # --- 7e. Secondary (abuse) rate limit detection ---
    print("Secondary rate limit detection:")
    secondary_cases = [
        (403, {"message": "You have exceeded a secondary rate limit"}, True),
        (429, {"message": "Rate limit exceeded. Please retry later"}, True),
        (403, {"message": "Resource not accessible by integration"}, False),
        (200, {"message": "OK"}, False),
    ]
    for status, body, expected in secondary_cases:
        result = is_secondary_rate_limit(status, body)
        print(f"  HTTP {status}, msg={body['message']!r:50s} -> {result}")
    print()


# ===========================================================================
# Example 8 -- Semantic Versioning Utilities
# ===========================================================================

def example8_semantic_versioning() -> None:
    """Demonstrate tag/version parsing and bumping utilities.

    TagsClient includes static helpers for semantic version operations
    that work entirely offline (no API calls needed).
    """
    print("=== Example 8: Semantic Versioning Utilities ===\n")

    # --- 8a. Parse version strings ---
    print("Parsing version strings:")
    version_strings = ["v1.2.3", "2.0.0", "v3.1.0-beta.1", "v0.0.1+build.42", "not-a-version"]
    for vs in version_strings:
        sv = parse_semantic_version(vs)
        if sv:
            print(f"  {vs:25s} -> major={sv.major} minor={sv.minor} patch={sv.patch} pre={sv.prerelease} build={sv.build}")
        else:
            print(f"  {vs:25s} -> None (not valid semver)")
    print()

    # --- 8b. Version bumping ---
    print("Version bumping:")
    current = parse_semantic_version("v1.2.3")
    if current:
        for bump_type in ("patch", "minor", "major"):
            next_ver = TagsClient.get_next_version(current, bump=bump_type)
            print(f"  {current} + {bump_type:5s} -> {next_ver}")
    print()

    # --- 8c. Sort tags by semantic version ---
    print("Sorting tags by version (descending):")
    tags = [
        {"name": "v1.0.0"},
        {"name": "v2.1.0"},
        {"name": "v1.9.0"},
        {"name": "v0.1.0"},
        {"name": "v2.0.0-beta.1"},
        {"name": "latest"},
    ]
    sorted_tags = TagsClient.sort_by_version(tags, descending=True)
    for t in sorted_tags:
        print(f"  {t['name']}")
    print()


# ===========================================================================
# Main -- orchestrate all examples
# ===========================================================================

async def main() -> None:
    """Run all examples, separating network-dependent ones."""

    print()
    print("=" * 65)
    print("  GitHub API SDK -- Basic Usage Examples")
    print("=" * 65)
    print()

    # ------------------------------------------------------------------
    # Offline examples (no network / no token required)
    # ------------------------------------------------------------------
    try:
        example1_token_resolution()
    except Exception as exc:
        print(f"  [Example 1 failed: {exc}]\n")

    try:
        example4_input_validation()
    except Exception as exc:
        print(f"  [Example 4 failed: {exc}]\n")

    try:
        example5_error_handling()
    except Exception as exc:
        print(f"  [Example 5 failed: {exc}]\n")

    try:
        example7_rate_limit_awareness()
    except Exception as exc:
        print(f"  [Example 7 failed: {exc}]\n")

    try:
        example8_semantic_versioning()
    except Exception as exc:
        print(f"  [Example 8 failed: {exc}]\n")

    # ------------------------------------------------------------------
    # Network examples (require GITHUB_TOKEN)
    # ------------------------------------------------------------------
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("=" * 65)
        print("  GITHUB_TOKEN not set -- skipping network examples (2, 3, 6)")
        print("  Set it to run the full demo:")
        print("    export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx")
        print("=" * 65)
        print()
        return

    print("-" * 65)
    print("  Running network examples (GITHUB_TOKEN detected)")
    print("-" * 65)
    print()

    try:
        await example2_client_initialization()
    except Exception as exc:
        print(f"  [Example 2 failed: {exc}]\n")

    try:
        await example3_repository_operations()
    except Exception as exc:
        print(f"  [Example 3 failed: {exc}]\n")

    try:
        await example6_pagination()
    except Exception as exc:
        print(f"  [Example 6 failed: {exc}]\n")

    print("=" * 65)
    print("  All examples complete.")
    print("=" * 65)
    print()


if __name__ == "__main__":
    asyncio.run(main())
