# SDK Guide -- @internal/github-api

> Node.js 20+ | ESM | Fastify 4

A hands-on guide to using the `@internal/github-api` SDK. Every example uses ESM `import` syntax and runs on Node.js 20+.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Initialization](#initialization)
- [Authentication](#authentication)
- [Repository Operations](#repository-operations)
- [Branch Management](#branch-management)
- [Collaborators](#collaborators)
- [Tags and Releases](#tags-and-releases)
- [Webhooks](#webhooks)
- [Security](#security)
- [Error Handling](#error-handling)
- [Pagination](#pagination)
- [Rate Limiting](#rate-limiting)
- [Input Validation](#input-validation)

---

## Installation

The package is an internal workspace dependency. Install all dependencies with pnpm from the `mjs/` directory:

```bash
cd mjs/
pnpm install
```

Package details:

| Field | Value |
|-------|-------|
| Name | `@internal/github-api` |
| Type | `module` (ESM) |
| Entry point | `src/index.mjs` |
| Engines | `node >= 20.0.0` |
| Runtime dependencies | `fastify ^4.0.0`, `@fastify/cors ^9.0.0`, `@fastify/sensible ^5.0.0`, `close-with-grace ^1.2.0` |

---

## Quick Start

```javascript
import { GitHubClient, resolveToken, ReposClient } from '@internal/github-api';

// 1. Resolve token from environment
const { token } = resolveToken();

// 2. Create the HTTP client
const client = new GitHubClient({ token });

// 3. Create a domain client
const repos = new ReposClient(client);

// 4. Use it
const repo = await repos.get('octocat', 'Hello-World');
console.log(repo.full_name, repo.stargazers_count);
```

---

## Initialization

### Basic Client

```javascript
import { GitHubClient } from '@internal/github-api';

const client = new GitHubClient({
  token: process.env.GITHUB_TOKEN,
});
```

### Fully Configured Client

```javascript
import { GitHubClient, createLogger } from '@internal/github-api';

const client = new GitHubClient({
  token: process.env.GITHUB_TOKEN,
  baseUrl: 'https://api.github.com',
  rateLimitAutoWait: true,
  rateLimitThreshold: 10,
  onRateLimit: (info) => {
    console.log(`Rate limit: ${info.remaining}/${info.limit} remaining`);
  },
  logger: createLogger('my-app'),
});
```

### Creating Domain Clients

Each domain client wraps the base `GitHubClient`:

```javascript
import {
  GitHubClient,
  ReposClient,
  BranchesClient,
  CollaboratorsClient,
  TagsClient,
  WebhooksClient,
  SecurityClient,
} from '@internal/github-api';

const client = new GitHubClient({ token: process.env.GITHUB_TOKEN });

const repos = new ReposClient(client);
const branches = new BranchesClient(client);
const collaborators = new CollaboratorsClient(client);
const tags = new TagsClient(client);
const webhooks = new WebhooksClient(client);
const security = new SecurityClient(client);
```

---

## Authentication

### Automatic Token Resolution

`resolveToken()` checks multiple sources in priority order:

```javascript
import { resolveToken, maskToken } from '@internal/github-api';

// Checks: explicit param > GITHUB_TOKEN > GH_TOKEN > GITHUB_ACCESS_TOKEN > GITHUB_PAT
const resolved = resolveToken();

console.log(resolved.source);  // 'GITHUB_TOKEN'
console.log(resolved.type);    // 'classic-pat'
console.log(maskToken(resolved.token));  // 'ghp_****...****abcd'
```

### Explicit Token

```javascript
const resolved = resolveToken('github_pat_11AAAAAA...');
console.log(resolved.source);  // 'explicit'
console.log(resolved.type);    // 'fine-grained'
```

### Token Type Detection

The SDK automatically detects the token format:

```javascript
import { resolveToken } from '@internal/github-api';

// Each prefix maps to a token type:
resolveToken('github_pat_ABC123').type;  // 'fine-grained'
resolveToken('ghp_ABC123').type;          // 'classic-pat'
resolveToken('gho_ABC123').type;          // 'oauth'
resolveToken('ghu_ABC123').type;          // 'user-to-server'
resolveToken('ghs_ABC123').type;          // 'server-to-server'
```

### Handling Missing Tokens

```javascript
import { resolveToken, AuthError } from '@internal/github-api';

try {
  const resolved = resolveToken();
} catch (err) {
  if (err instanceof AuthError) {
    console.error('No token found. Set GITHUB_TOKEN environment variable.');
    process.exit(1);
  }
}
```

---

## Repository Operations

### Get a Repository

```javascript
import { GitHubClient, ReposClient } from '@internal/github-api';

const client = new GitHubClient({ token: process.env.GITHUB_TOKEN });
const repos = new ReposClient(client);

const repo = await repos.get('octocat', 'Hello-World');
console.log(repo.full_name);        // 'octocat/Hello-World'
console.log(repo.description);      // 'My first repository on GitHub!'
console.log(repo.stargazers_count); // 2345
console.log(repo.default_branch);   // 'master'
```

### List Repositories

```javascript
// List repos for a specific user
const userRepos = await repos.listForUser('octocat', {
  sort: 'updated',
  per_page: 10,
});

// List repos for the authenticated user
const myRepos = await repos.listForAuthenticatedUser({
  type: 'owner',
  sort: 'pushed',
});

// List repos for an organization
const orgRepos = await repos.listForOrg('github', {
  type: 'public',
  per_page: 50,
});
```

### Create a Repository

```javascript
// Create a personal repository
const newRepo = await repos.create({
  name: 'my-new-project',
  description: 'A new project',
  private: true,
  auto_init: true,
});
console.log(newRepo.html_url);

// Create a repository in an organization
const orgRepo = await repos.createInOrg('my-org', {
  name: 'team-project',
  description: 'Team project repository',
  private: true,
});
```

### Update a Repository

```javascript
const updated = await repos.update('octocat', 'Hello-World', {
  description: 'Updated description',
  has_wiki: false,
  has_issues: true,
});
```

### Delete a Repository

```javascript
await repos.delete('octocat', 'old-project');
```

### Topics

```javascript
// Get topics
const topics = await repos.getTopics('octocat', 'Hello-World');
console.log(topics.names);  // ['javascript', 'api', 'sdk']

// Replace all topics
await repos.replaceTopics('octocat', 'Hello-World', [
  'javascript',
  'node',
  'github-api',
]);
```

### Languages and Contributors

```javascript
// Get language breakdown (bytes of code)
const languages = await repos.getLanguages('octocat', 'Hello-World');
// { JavaScript: 15000, TypeScript: 8000, CSS: 2000 }

// List contributors
const contributors = await repos.listContributors('octocat', 'Hello-World', {
  per_page: 10,
});
```

### Fork, Star, and Watch

```javascript
// Fork a repository
const fork = await repos.fork('octocat', 'Hello-World', {
  organization: 'my-org',
  name: 'my-fork',
});

// List forks
const forks = await repos.listForks('octocat', 'Hello-World', {
  sort: 'newest',
});

// Star / unstar
await repos.star('octocat', 'Hello-World');
await repos.unstar('octocat', 'Hello-World');
const starred = await repos.isStarred('octocat', 'Hello-World');  // true/false

// Watch / unwatch
await repos.watch('octocat', 'Hello-World');
await repos.unwatch('octocat', 'Hello-World');
const subscription = await repos.getSubscription('octocat', 'Hello-World');
```

### Transfer a Repository

```javascript
const transferred = await repos.transfer('old-owner', 'my-repo', 'new-owner', {
  team_ids: [123, 456],
});
```

---

## Branch Management

### List and Get Branches

```javascript
import { GitHubClient, BranchesClient } from '@internal/github-api';

const client = new GitHubClient({ token: process.env.GITHUB_TOKEN });
const branches = new BranchesClient(client);

// List all branches
const allBranches = await branches.list('octocat', 'Hello-World');
for (const branch of allBranches) {
  console.log(`${branch.name} (protected: ${branch.protected})`);
}

// List only protected branches
const protectedBranches = await branches.list('octocat', 'Hello-World', {
  protected: true,
});

// Get a specific branch
const main = await branches.get('octocat', 'Hello-World', 'main');
console.log(main.commit.sha);
```

### Branch Protection

```javascript
// Get current protection
const protection = await branches.getProtection('octocat', 'Hello-World', 'main');

// Use the template builder
const template = branches.createProtectionTemplate({
  requireStatusChecks: true,
  statusCheckContexts: ['ci/build', 'ci/test'],
  strictStatusChecks: true,
  requireReviews: true,
  requiredReviewers: 2,
  dismissStaleReviews: true,
  requireCodeOwnerReviews: true,
  enforceAdmins: true,
  requiredLinearHistory: true,
  allowForcePushes: false,
  allowDeletions: false,
});

// Apply the template
await branches.updateProtection('octocat', 'Hello-World', 'main', template);

// Remove all protection
await branches.removeProtection('octocat', 'Hello-World', 'main');
```

### Status Checks and Review Protection

```javascript
// Get required status checks
const checks = await branches.getStatusChecks('octocat', 'Hello-World', 'main');

// Update status checks
await branches.updateStatusChecks('octocat', 'Hello-World', 'main', {
  strict: true,
  contexts: ['ci/build', 'ci/lint'],
});

// Get/update PR review protection
const reviews = await branches.getReviewProtection('octocat', 'Hello-World', 'main');
await branches.updateReviewProtection('octocat', 'Hello-World', 'main', {
  dismiss_stale_reviews: true,
  require_code_owner_reviews: true,
  required_approving_review_count: 2,
});

// Delete review protection
await branches.deleteReviewProtection('octocat', 'Hello-World', 'main');
```

### Admin Enforcement and Push Restrictions

```javascript
// Admin enforcement
const enforcement = await branches.getAdminEnforcement('octocat', 'Hello-World', 'main');
await branches.setAdminEnforcement('octocat', 'Hello-World', 'main');
await branches.removeAdminEnforcement('octocat', 'Hello-World', 'main');

// Push restrictions
const restrictions = await branches.getPushRestrictions('octocat', 'Hello-World', 'main');
await branches.updatePushRestrictions('octocat', 'Hello-World', 'main', {
  users: ['admin-user'],
  teams: ['release-team'],
});
await branches.deletePushRestrictions('octocat', 'Hello-World', 'main');
```

### Rename, Merge, and Compare

```javascript
// Rename a branch
await branches.rename('octocat', 'Hello-World', 'old-name', 'new-name');

// Merge feature branch into main
const mergeResult = await branches.merge('octocat', 'Hello-World', 'main', 'feature-branch', {
  commit_message: 'Merge feature-branch into main',
});
console.log(mergeResult.sha);

// Compare two branches
const comparison = await branches.compare('octocat', 'Hello-World', 'main', 'feature-branch');
console.log(`${comparison.ahead_by} ahead, ${comparison.behind_by} behind`);
console.log(`Status: ${comparison.status}`);  // 'ahead' | 'behind' | 'diverged' | 'identical'
```

---

## Collaborators

```javascript
import { GitHubClient, CollaboratorsClient } from '@internal/github-api';

const client = new GitHubClient({ token: process.env.GITHUB_TOKEN });
const collaborators = new CollaboratorsClient(client);

// List all collaborators
const collabs = await collaborators.list('octocat', 'Hello-World', {
  affiliation: 'all',
});

// Add a collaborator with specific permission
await collaborators.add('octocat', 'Hello-World', 'alice', 'push');

// Check permission level
const perm = await collaborators.checkPermission('octocat', 'Hello-World', 'alice');
console.log(perm.permission);  // 'push'

// Check if user has at least 'maintain' permission
const hasMaintain = await collaborators.hasPermission(
  'octocat', 'Hello-World', 'alice', 'maintain',
);  // false (push < maintain)

// Remove a collaborator
await collaborators.remove('octocat', 'Hello-World', 'alice');

// Bulk add multiple collaborators
const results = await collaborators.bulkAdd('octocat', 'Hello-World', [
  { username: 'alice', permission: 'push' },
  { username: 'bob', permission: 'admin' },
  { username: 'charlie' },  // defaults to 'push'
]);
for (const result of results) {
  console.log(`${result.username}: ${result.success ? 'added' : result.error}`);
}

// Get collaborator statistics
const stats = await collaborators.getStats('octocat', 'Hello-World');
console.log(`Total: ${stats.total}`);
console.log(`Admins: ${stats.byPermission.admin}`);

// Manage invitations
const invitations = await collaborators.listInvitations('octocat', 'Hello-World');
await collaborators.updateInvitation('octocat', 'Hello-World', 123, 'maintain');
await collaborators.deleteInvitation('octocat', 'Hello-World', 123);
```

---

## Tags and Releases

```javascript
import { GitHubClient, TagsClient } from '@internal/github-api';

const client = new GitHubClient({ token: process.env.GITHUB_TOKEN });
const tags = new TagsClient(client);

// List tags
const allTags = await tags.listTags('octocat', 'Hello-World');

// Sort tags by semantic version (newest first)
const sorted = tags.sortByVersion(allTags);
console.log(sorted[0].name);  // 'v2.1.0'

// Parse a semantic version
const ver = tags.parseSemanticVersion('v1.2.3-beta.1');
// { major: 1, minor: 2, patch: 3, prerelease: 'beta.1', raw: 'v1.2.3-beta.1' }

// Calculate next version
tags.getNextVersion('v1.2.3', 'minor');  // 'v1.3.0'
tags.getNextVersion('v1.2.3', 'major');  // 'v2.0.0'
tags.getNextVersion('v1.2.3', 'patch');  // 'v1.2.4'

// Create a release
const release = await tags.createRelease('octocat', 'Hello-World', {
  tag_name: 'v2.0.0',
  target_commitish: 'main',
  name: 'Version 2.0.0',
  body: '## Changes\n- Feature A\n- Feature B',
  draft: false,
  prerelease: false,
  generate_release_notes: true,
});

// Get releases
const latest = await tags.getLatestRelease('octocat', 'Hello-World');
const byTag = await tags.getReleaseByTag('octocat', 'Hello-World', 'v2.0.0');
const byId = await tags.getRelease('octocat', 'Hello-World', release.id);
const allReleases = await tags.listReleases('octocat', 'Hello-World');

// Update a release
await tags.updateRelease('octocat', 'Hello-World', release.id, {
  body: 'Updated release notes',
});

// Delete a release
await tags.deleteRelease('octocat', 'Hello-World', release.id);

// Tag protection rules
const protections = await tags.listTagProtections('octocat', 'Hello-World');
await tags.createTagProtection('octocat', 'Hello-World', 'v*');
await tags.deleteTagProtection('octocat', 'Hello-World', protections[0].id);
```

---

## Webhooks

```javascript
import { GitHubClient, WebhooksClient } from '@internal/github-api';

const client = new GitHubClient({ token: process.env.GITHUB_TOKEN });
const webhooks = new WebhooksClient(client);

// List webhooks
const hooks = await webhooks.list('octocat', 'Hello-World');

// Create a webhook
const hook = await webhooks.create('octocat', 'Hello-World', {
  url: 'https://example.com/webhook',
  content_type: 'json',
  secret: 'my-webhook-secret',
  events: ['push', 'pull_request'],
  active: true,
});

// Get a webhook
const detail = await webhooks.get('octocat', 'Hello-World', hook.id);

// Update a webhook
await webhooks.update('octocat', 'Hello-World', hook.id, {
  events: ['push', 'pull_request', 'issues'],
  config: {
    url: 'https://example.com/webhook-v2',
    content_type: 'json',
  },
});

// Test and ping
await webhooks.test('octocat', 'Hello-World', hook.id);
await webhooks.ping('octocat', 'Hello-World', hook.id);

// Delete a webhook
await webhooks.delete('octocat', 'Hello-World', hook.id);
```

---

## Security

```javascript
import { GitHubClient, SecurityClient } from '@internal/github-api';

const client = new GitHubClient({ token: process.env.GITHUB_TOKEN });
const security = new SecurityClient(client);

// Get security analysis settings
const analysis = await security.getSecurityAnalysis('octocat', 'Hello-World');
console.log(analysis.advanced_security.status);           // 'enabled' or 'disabled'
console.log(analysis.secret_scanning.status);              // 'enabled' or 'disabled'
console.log(analysis.secret_scanning_push_protection.status);

// Update security settings
await security.updateSecurityAnalysis('octocat', 'Hello-World', {
  secret_scanning: { status: 'enabled' },
  secret_scanning_push_protection: { status: 'enabled' },
});

// Vulnerability alerts
const alerts = await security.getVulnerabilityAlerts('octocat', 'Hello-World');
console.log(alerts.enabled);  // true or false

await security.enableVulnerabilityAlerts('octocat', 'Hello-World');
await security.disableVulnerabilityAlerts('octocat', 'Hello-World');

// Rulesets
const rulesets = await security.listRulesets('octocat', 'Hello-World');

const ruleset = await security.createRuleset('octocat', 'Hello-World', {
  name: 'Require CI',
  target: 'branch',
  enforcement: 'active',
  conditions: {
    ref_name: { include: ['~DEFAULT_BRANCH'], exclude: [] },
  },
  rules: [
    { type: 'required_status_checks', parameters: { required_status_checks: [{ context: 'ci/build' }] } },
  ],
});

await security.updateRuleset('octocat', 'Hello-World', ruleset.id, {
  enforcement: 'evaluate',
});

await security.deleteRuleset('octocat', 'Hello-World', ruleset.id);
```

---

## Error Handling

The SDK provides a structured error hierarchy. Use `instanceof` checks to handle specific failure modes.

### Basic Pattern

```javascript
import {
  GitHubClient,
  ReposClient,
  NotFoundError,
  AuthError,
  RateLimitError,
  ValidationError,
  ForbiddenError,
  ConflictError,
  ServerError,
  GitHubError,
} from '@internal/github-api';

const client = new GitHubClient({ token: process.env.GITHUB_TOKEN });
const repos = new ReposClient(client);

try {
  const repo = await repos.get('octocat', 'Hello-World');
} catch (err) {
  if (err instanceof NotFoundError) {
    console.error('Repository does not exist');
  } else if (err instanceof AuthError) {
    console.error('Invalid or missing token');
  } else if (err instanceof RateLimitError) {
    console.error(`Rate limited. Resets at: ${err.resetAt?.toISOString()}`);
    console.error(`Retry after: ${err.retryAfter} seconds`);
  } else if (err instanceof ValidationError) {
    console.error(`Invalid input: ${err.message}`);
  } else if (err instanceof ForbiddenError) {
    console.error('Insufficient permissions');
  } else if (err instanceof ConflictError) {
    console.error('Conflict (e.g., merge conflict)');
  } else if (err instanceof ServerError) {
    console.error(`GitHub server error (${err.status})`);
  } else if (err instanceof GitHubError) {
    console.error(`GitHub API error ${err.status}: ${err.message}`);
  } else {
    throw err;  // Re-throw non-GitHub errors
  }
}
```

### Accessing Error Properties

Every `GitHubError` includes:

```javascript
try {
  await repos.get('octocat', 'nonexistent-repo');
} catch (err) {
  console.log(err.name);             // 'NotFoundError'
  console.log(err.message);          // 'Not Found'
  console.log(err.status);           // 404
  console.log(err.requestId);        // 'ABCD:1234:5678:...'
  console.log(err.documentationUrl); // 'https://docs.github.com/rest/...'
}
```

### Validation Errors from Input

Validation functions throw `ValidationError` before any network request:

```javascript
import { validateRepositoryName, ValidationError } from '@internal/github-api';

try {
  validateRepositoryName('settings');  // reserved name
} catch (err) {
  if (err instanceof ValidationError) {
    console.error(err.message);  // 'Repository name "settings" is reserved by GitHub'
    console.error(err.status);   // 422
  }
}
```

### mapResponseToError

For custom HTTP handling, you can use `mapResponseToError` directly:

```javascript
import { mapResponseToError } from '@internal/github-api';

const error = mapResponseToError(404, { message: 'Not Found' }, responseHeaders);
// error instanceof NotFoundError === true
```

---

## Pagination

### Streaming Pages with paginate()

The `paginate()` async generator yields one page at a time, making it memory-efficient for large result sets:

```javascript
import { GitHubClient, paginate } from '@internal/github-api';

const client = new GitHubClient({ token: process.env.GITHUB_TOKEN });

let total = 0;
for await (const page of paginate(client, '/users/octocat/repos', {
  perPage: 30,
  maxPages: 10,
})) {
  total += page.length;
  for (const repo of page) {
    console.log(repo.full_name);
  }
}
console.log(`Fetched ${total} repositories`);
```

### Collecting All Results with paginateAll()

When you need all results in a single array:

```javascript
import { GitHubClient, paginateAll } from '@internal/github-api';

const client = new GitHubClient({ token: process.env.GITHUB_TOKEN });

const allRepos = await paginateAll(client, '/users/octocat/repos', {
  perPage: 100,
  maxPages: 5,
});
console.log(`Total: ${allRepos.length} repositories`);
```

### Pagination with Additional Query Parameters

```javascript
for await (const page of paginate(client, '/repos/octocat/Hello-World/issues', {
  perPage: 50,
  params: {
    state: 'open',
    sort: 'updated',
    direction: 'desc',
  },
})) {
  for (const issue of page) {
    console.log(`#${issue.number}: ${issue.title}`);
  }
}
```

### Safety Limits

The `maxPages` option (default: 1000) prevents runaway pagination. When the limit is reached, the generator stops and logs a warning.

---

## Rate Limiting

### Automatic Rate Limit Handling

The `GitHubClient` handles rate limits automatically when `rateLimitAutoWait` is `true` (the default):

```javascript
const client = new GitHubClient({
  token: process.env.GITHUB_TOKEN,
  rateLimitAutoWait: true,   // pause and retry when rate limited
  rateLimitThreshold: 10,    // start waiting when 10 or fewer requests remain
});
```

When the rate limit is hit:

1. **Primary rate limit (429 or 403 with remaining=0):** The client sleeps until `x-ratelimit-reset` and retries.
2. **Secondary rate limit (abuse detection):** The client sleeps for `Retry-After` seconds (or 60s default) and retries once.
3. **Pre-emptive wait:** When `remaining <= rateLimitThreshold` on any successful response, the client waits before the _next_ request.

### Rate Limit Callback

Monitor rate limit consumption in real time:

```javascript
const client = new GitHubClient({
  token: process.env.GITHUB_TOKEN,
  onRateLimit: (info) => {
    console.log(`[rate-limit] ${info.remaining}/${info.limit} remaining (${info.resource})`);
    if (info.remaining < 100) {
      console.warn(`Low rate limit! Resets at ${new Date(info.reset * 1000).toISOString()}`);
    }
  },
});
```

### Checking Rate Limit Status

```javascript
// Check the most recent rate limit info (no network call)
console.log(client.lastRateLimit);

// Fetch live rate limit status from the API
const rateLimit = await client.getRateLimit();
console.log(rateLimit.resources.core.remaining);
console.log(rateLimit.resources.search.remaining);
```

### Manual Rate Limit Utilities

```javascript
import {
  parseRateLimitHeaders,
  shouldWaitForRateLimit,
  waitForRateLimit,
  isSecondaryRateLimit,
} from '@internal/github-api';

// Parse headers from a raw Response
const info = parseRateLimitHeaders(response.headers);
// { limit: 5000, remaining: 4750, reset: 1706745600, used: 250, resource: 'core' }

// Check if we should wait
if (shouldWaitForRateLimit(info, { autoWait: true, threshold: 10 })) {
  await waitForRateLimit(info, console);
}

// Detect secondary rate limits
if (isSecondaryRateLimit(403, { message: 'You have exceeded a secondary rate limit' })) {
  // Wait and retry
}
```

---

## Input Validation

All domain client methods automatically validate their inputs. You can also call validators directly for pre-flight checks.

### Repository Name Validation

```javascript
import { validateRepositoryName, RESERVED_REPO_NAMES } from '@internal/github-api';

validateRepositoryName('my-project');      // passes
validateRepositoryName('my_project.js');   // passes

// These throw ValidationError:
validateRepositoryName('');                // empty string
validateRepositoryName('.hidden');         // starts with dot
validateRepositoryName('my repo');         // contains space
validateRepositoryName('settings');        // reserved name
validateRepositoryName('a'.repeat(101));   // over 100 characters

// Check reserved names directly
console.log(RESERVED_REPO_NAMES.has('settings'));  // true
console.log(RESERVED_REPO_NAMES.has('my-repo'));   // false
console.log(RESERVED_REPO_NAMES.size);             // 56+
```

### Username Validation

```javascript
import { validateUsername } from '@internal/github-api';

validateUsername('octocat');     // passes
validateUsername('user-name');   // passes

// These throw ValidationError:
validateUsername('-user');       // starts with hyphen
validateUsername('user--name');  // consecutive hyphens
validateUsername('user.name');   // contains dot
```

### Branch Name Validation

```javascript
import { validateBranchName } from '@internal/github-api';

validateBranchName('main');               // passes
validateBranchName('feature/my-feature'); // passes
validateBranchName('release/v1.0.0');     // passes

// These throw ValidationError:
validateBranchName('');                   // empty
validateBranchName('feature//name');      // consecutive slashes
validateBranchName('@');                  // single @
validateBranchName('branch name');        // contains space
validateBranchName('main.lock');          // ends with .lock
validateBranchName('branch..name');       // consecutive dots
```
