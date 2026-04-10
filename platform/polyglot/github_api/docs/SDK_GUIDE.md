# GitHub API SDK Guide

The GitHub API SDK provides a high-level API for CLI tools, LLM Agents, and Developer Tools to interact with the GitHub REST API. Available as `@internal/github-api` (npm) and `github_api` (Python), both implementations share the same interface surface with language-idiomatic conventions.

## Usage

### Node.js

```typescript
import { GitHubClient, ReposClient, BranchesClient, resolveToken } from '@internal/github-api';

// Resolve token (checks GITHUB_TOKEN, GH_TOKEN, GITHUB_ACCESS_TOKEN, GITHUB_PAT)
const resolved = resolveToken();
console.log(`Using token from ${resolved.source} (type: ${resolved.type})`);

// Initialize the client
const client = new GitHubClient({
  token: resolved.token,
  rateLimitAutoWait: true,
  rateLimitThreshold: 10,
});

// Create domain clients
const repos = new ReposClient(client);
const branches = new BranchesClient(client);

// Fetch a repository
const repo = await repos.get('octocat', 'Hello-World');
console.log(`${repo.full_name}: ${repo.description}`);
```

### Python

```python
from github_api import GitHubClient, ReposClient, BranchesClient, resolve_token

# Resolve token (checks GITHUB_TOKEN, GH_TOKEN, GITHUB_ACCESS_TOKEN, GITHUB_PAT)
token_info = resolve_token()
print(f"Using token from {token_info.source} (type: {token_info.type})")

# Initialize the client with async context manager
async with GitHubClient(
    token=token_info.token,
    rate_limit_auto_wait=True,
    rate_limit_threshold=10,
) as client:
    # Create domain clients
    repos = ReposClient(client)
    branches = BranchesClient(client)

    # Fetch a repository
    repo = await repos.get("octocat", "Hello-World")
    print(f"{repo['full_name']}: {repo['description']}")
```

## Authentication

Token resolution follows a priority chain across environment variables.

### Node.js

```typescript
import { resolveToken, maskToken } from '@internal/github-api';

// Automatic resolution from environment
const resolved = resolveToken();
console.log(`Token: ${maskToken(resolved.token)}`);  // ghp_****abcd
console.log(`Source: ${resolved.source}`);             // 'GITHUB_TOKEN'
console.log(`Type: ${resolved.type}`);                 // 'classic-pat'

// Explicit token
const explicit = resolveToken('ghp_mytoken123456789abcdefghij');
console.log(`Source: ${explicit.source}`);  // 'explicit'
```

### Python

```python
from github_api import resolve_token, mask_token

# Automatic resolution from environment
token_info = resolve_token()
print(f"Token: {mask_token(token_info.token)}")  # ghp_****abcd
print(f"Source: {token_info.source}")              # 'GITHUB_TOKEN'
print(f"Type: {token_info.type}")                  # 'classic-pat'

# Explicit token
explicit = resolve_token("ghp_mytoken123456789abcdefghij")
print(f"Source: {explicit.source}")  # 'explicit'
```

## Repository Operations

### Node.js

```typescript
import { GitHubClient, ReposClient } from '@internal/github-api';

const client = new GitHubClient({ token: 'ghp_...' });
const repos = new ReposClient(client);

// Get a repository
const repo = await repos.get('octocat', 'Hello-World');

// List repositories for a user
const userRepos = await repos.listForUser('octocat');

// List repositories for the authenticated user
const myRepos = await repos.listForAuthenticatedUser();

// Create a repository
const newRepo = await repos.create({
  name: 'my-new-repo',
  description: 'Created via SDK',
  private: true,
});

// Update a repository
await repos.update('octocat', 'Hello-World', {
  description: 'Updated description',
});

// Manage topics
const topics = await repos.getTopics('octocat', 'Hello-World');
await repos.replaceTopics('octocat', 'Hello-World', ['sdk', 'api', 'github']);

// Star and watch
await repos.star('octocat', 'Hello-World');
const starred = await repos.isStarred('octocat', 'Hello-World');
await repos.watch('octocat', 'Hello-World');
```

### Python

```python
from github_api import GitHubClient, ReposClient

async with GitHubClient(token="ghp_...") as client:
    repos = ReposClient(client)

    # Get a repository
    repo = await repos.get("octocat", "Hello-World")

    # List repositories for a user
    user_repos = await repos.list_for_user("octocat")

    # List repositories for the authenticated user
    my_repos = await repos.list_for_authenticated_user()

    # Create a repository
    new_repo = await repos.create({
        "name": "my-new-repo",
        "description": "Created via SDK",
        "private": True,
    })

    # Update a repository
    await repos.update("octocat", "Hello-World", {
        "description": "Updated description",
    })

    # Manage topics
    topics = await repos.get_topics("octocat", "Hello-World")
    await repos.replace_topics("octocat", "Hello-World", ["sdk", "api", "github"])

    # Star and watch
    await repos.star("octocat", "Hello-World")
    starred = await repos.is_starred("octocat", "Hello-World")
    await repos.watch("octocat", "Hello-World")
```

## Branch Management

### Node.js

```typescript
import { GitHubClient, BranchesClient } from '@internal/github-api';

const client = new GitHubClient({ token: 'ghp_...' });
const branches = new BranchesClient(client);

// List branches
const branchList = await branches.list('octocat', 'Hello-World');

// Get a specific branch
const main = await branches.get('octocat', 'Hello-World', 'main');

// Get branch protection
const protection = await branches.getProtection('octocat', 'Hello-World', 'main');

// Apply a protection template
await branches.createProtectionTemplate('octocat', 'Hello-World', 'main');

// Merge branches
const mergeResult = await branches.merge('octocat', 'Hello-World', {
  base: 'main',
  head: 'feature-branch',
  commit_message: 'Merge feature into main',
});

// Compare two refs
const comparison = await branches.compare('octocat', 'Hello-World', 'main', 'develop');
console.log(`${comparison.ahead_by} commits ahead, ${comparison.behind_by} behind`);
```

### Python

```python
from github_api import GitHubClient, BranchesClient

async with GitHubClient(token="ghp_...") as client:
    branches = BranchesClient(client)

    # List branches
    branch_list = await branches.list("octocat", "Hello-World")

    # Get a specific branch
    main = await branches.get("octocat", "Hello-World", "main")

    # Get branch protection
    protection = await branches.get_protection("octocat", "Hello-World", "main")

    # Apply a protection template (presets: 'standard', 'strict', 'minimal')
    await branches.create_protection_template(
        "octocat", "Hello-World", "main", template="strict"
    )

    # Merge branches
    merge_result = await branches.merge("octocat", "Hello-World", {
        "base": "main",
        "head": "feature-branch",
        "commit_message": "Merge feature into main",
    })

    # Compare two refs
    comparison = await branches.compare("octocat", "Hello-World", "main", "develop")
    print(f"{comparison['ahead_by']} commits ahead, {comparison['behind_by']} behind")
```

## Error Handling

### Node.js

```typescript
import {
  GitHubClient,
  ReposClient,
  NotFoundError,
  AuthError,
  RateLimitError,
  ValidationError,
} from '@internal/github-api';

const client = new GitHubClient({ token: 'ghp_...' });
const repos = new ReposClient(client);

try {
  const repo = await repos.get('octocat', 'nonexistent-repo');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error(`Repository not found: ${error.message}`);
  } else if (error instanceof AuthError) {
    console.error(`Authentication failed: ${error.message}`);
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Resets at: ${error.resetAt}`);
    console.error(`Retry after: ${error.retryAfter}s`);
  } else if (error instanceof ValidationError) {
    console.error(`Validation error: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error.status} - ${error.message}`);
  }
}
```

### Python

```python
from github_api import (
    GitHubClient,
    ReposClient,
    NotFoundError,
    AuthError,
    RateLimitError,
    ValidationError,
    GitHubError,
)

async with GitHubClient(token="ghp_...") as client:
    repos = ReposClient(client)

    try:
        repo = await repos.get("octocat", "nonexistent-repo")
    except NotFoundError as e:
        print(f"Repository not found: {e.message}")
    except AuthError as e:
        print(f"Authentication failed: {e.message}")
    except RateLimitError as e:
        print(f"Rate limited. Resets at: {e.reset_at}")
        print(f"Retry after: {e.retry_after}s")
    except ValidationError as e:
        print(f"Validation error: {e.message}")
        for err in e.errors:
            print(f"  Field: {err['field']}, Code: {err['code']}")
    except GitHubError as e:
        print(f"Unexpected error: {e.status} - {e.message}")
        print(f"Response body: {e.response_body}")
```

## Pagination

### Node.js

```typescript
import { GitHubClient, paginate, paginateAll } from '@internal/github-api';

const client = new GitHubClient({ token: 'ghp_...' });

// Async generator — process page by page
for await (const page of paginate(client, '/repos/octocat/Hello-World/issues', {
  perPage: 50,
  maxPages: 10,
})) {
  console.log(`Got ${page.length} issues in this page`);
  for (const issue of page) {
    console.log(`  #${issue.number}: ${issue.title}`);
  }
}

// Collect all items at once
const allIssues = await paginateAll(client, '/repos/octocat/Hello-World/issues', {
  perPage: 100,
  params: { state: 'open' },
});
console.log(`Total open issues: ${allIssues.length}`);
```

### Python

```python
from github_api import GitHubClient
from github_api.sdk.pagination import paginate, paginate_all

async with GitHubClient(token="ghp_...") as client:
    # Async generator -- process page by page
    async for page in paginate(
        client,
        "/repos/octocat/Hello-World/issues",
        per_page=50,
        max_pages=10,
    ):
        print(f"Got {len(page)} issues in this page")
        for issue in page:
            print(f"  #{issue['number']}: {issue['title']}")

    # Collect all items at once
    all_issues = await paginate_all(
        client,
        "/repos/octocat/Hello-World/issues",
        per_page=100,
        params={"state": "open"},
    )
    print(f"Total open issues: {len(all_issues)}")
```

## Rate Limiting

### Node.js

```typescript
import {
  GitHubClient,
  parseRateLimitHeaders,
  shouldWaitForRateLimit,
  isSecondaryRateLimit,
} from '@internal/github-api';

// Auto-wait configuration (enabled by default)
const client = new GitHubClient({
  token: 'ghp_...',
  rateLimitAutoWait: true,     // automatically sleep when exhausted
  rateLimitThreshold: 10,      // start waiting at 10 remaining
  onRateLimit: (info) => {
    console.log(`Rate limit: ${info.remaining}/${info.limit}`);
  },
});

// Check rate limit manually
const rateLimit = await client.getRateLimit();
console.log(`Core limit: ${rateLimit.resources.core.remaining}/${rateLimit.resources.core.limit}`);

// Access last known rate limit
if (client.lastRateLimit) {
  console.log(`Remaining: ${client.lastRateLimit.remaining}`);
}
```

### Python

```python
from github_api import GitHubClient

# Auto-wait configuration (enabled by default)
async with GitHubClient(
    token="ghp_...",
    rate_limit_auto_wait=True,       # automatically sleep when exhausted
    rate_limit_threshold=10,          # start waiting at 10 remaining
) as client:
    # Check rate limit manually
    rate_limit = await client.get_rate_limit()
    core = rate_limit["resources"]["core"]
    print(f"Core limit: {core['remaining']}/{core['limit']}")

    # Access last known rate limit (RateLimitInfo with computed properties)
    if client.last_rate_limit:
        info = client.last_rate_limit
        print(f"Remaining: {info.remaining}")
        print(f"Resets at: {info.reset_at.isoformat()}")
        print(f"Seconds until reset: {info.seconds_until_reset:.0f}")
        print(f"Is exhausted: {info.is_exhausted}")
```

## Validation

### Node.js

```typescript
import {
  validateRepositoryName,
  validateUsername,
  validateBranchName,
  RESERVED_REPO_NAMES,
  ValidationError,
} from '@internal/github-api';

try {
  validateUsername('octocat');
  validateRepositoryName('my-repo');
  validateBranchName('feature/my-feature');
  console.log('All inputs are valid');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Invalid input: ${error.message}`);
  }
}

// Check reserved names
console.log(RESERVED_REPO_NAMES.has('settings'));  // true
console.log(RESERVED_REPO_NAMES.size);             // 56+
```

### Python

```python
from github_api import (
    validate_repository_name,
    validate_username,
    validate_branch_name,
    RESERVED_REPO_NAMES,
    ValidationError,
)

try:
    owner = validate_username("octocat")           # returns "octocat"
    repo = validate_repository_name("my-repo")     # returns "my-repo"
    branch = validate_branch_name("feature/my-feature")  # returns "feature/my-feature"
    print("All inputs are valid")
except ValidationError as e:
    print(f"Invalid input: {e.message}")
    for err in e.errors:
        print(f"  Field: {err['field']}, Code: {err['code']}")

# Check reserved names
print("settings" in RESERVED_REPO_NAMES)  # True
print(len(RESERVED_REPO_NAMES))           # 56+
```

## Features

- **Repository Operations**: `get`, `listForUser`/`list_for_user`, `listForAuthenticatedUser`/`list_for_authenticated_user`, `listForOrg`/`list_for_org`, `create`, `createInOrg`/`create_in_org`, `update`, `delete`
- **Repository Metadata**: `getTopics`/`get_topics`, `replaceTopics`/`replace_topics`, `getLanguages`/`get_languages`, `listContributors`/`list_contributors`
- **Repository Social**: `fork`, `listForks`/`list_forks`, `transfer`, `star`, `unstar`, `isStarred`/`is_starred`, `watch`, `unwatch`, `getSubscription`/`get_subscription`
- **Branch Operations**: `list`, `get`, `rename`, `merge`, `compare`
- **Branch Protection**: `getProtection`/`get_protection`, `updateProtection`/`update_protection`, `removeProtection`/`remove_protection`, `createProtectionTemplate`/`create_protection_template`
- **Branch Status Checks**: `getStatusChecks`/`get_status_checks`, `updateStatusChecks`/`update_status_checks`
- **Branch Review Protection**: `getReviewProtection`/`get_review_protection`, `updateReviewProtection`/`update_review_protection`, `deleteReviewProtection`/`delete_review_protection`
- **Branch Admin Enforcement**: `getAdminEnforcement`/`get_admin_enforcement`, `setAdminEnforcement`/`set_admin_enforcement`, `removeAdminEnforcement`/`remove_admin_enforcement`
- **Branch Push Restrictions**: `getPushRestrictions`/`get_push_restrictions`, `updatePushRestrictions`/`update_push_restrictions`, `deletePushRestrictions`/`delete_push_restrictions`
- **Collaborator Operations**: `list`, `get`, `add`, `remove`
- **Tag and Release Operations**: `list`, `listReleases`/`list_releases`, `getLatestRelease`/`get_latest_release`, `getRelease`/`get_release`, `createRelease`/`create_release`, `updateRelease`/`update_release`, `deleteRelease`/`delete_release`
- **Webhook Operations**: `list`, `get`, `create`, `update`, `delete`, `test`
- **Security Operations**: `listVulnerabilityAlerts`/`list_vulnerability_alerts`, `listDependabotAlerts`/`list_dependabot_alerts`, `getDependabotAlert`/`get_dependabot_alert`, `updateDependabotAlert`/`update_dependabot_alert`
- **Pagination**: `paginate`/`paginate`, `paginateAll`/`paginate_all`
- **Validation**: `validateRepositoryName`/`validate_repository_name`, `validateUsername`/`validate_username`, `validateBranchName`/`validate_branch_name`
- **Authentication**: `resolveToken`/`resolve_token`, `maskToken`/`mask_token`
- **Rate Limiting**: `parseRateLimitHeaders`/`parse_rate_limit_headers`, `shouldWaitForRateLimit`/`should_wait_for_rate_limit`, `waitForRateLimit`/`wait_for_rate_limit`, `isSecondaryRateLimit`/`is_secondary_rate_limit`
