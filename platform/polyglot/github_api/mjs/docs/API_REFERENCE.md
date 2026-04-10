# API Reference -- @internal/github-api

> Node.js 20+ | ESM | Fastify 4

Complete API reference for the `@internal/github-api` Node.js SDK. All imports use ESM syntax from the package entry point or subpath exports.

```javascript
// Main entry point
import { GitHubClient, resolveToken, ... } from '@internal/github-api';

// Subpath exports
import { GitHubClient } from '@internal/github-api/sdk';
import { registerRoutes } from '@internal/github-api/routes';
import { createErrorHandler } from '@internal/github-api/middleware';
```

---

## Table of Contents

- [GitHubClient](#githubclient)
- [Authentication](#authentication)
- [Error Classes](#error-classes)
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

Core HTTP client for the GitHub API. Handles authentication headers, rate limit tracking, automatic rate limit wait, error mapping, and structured logging.

**Module:** `src/sdk/client.mjs`

```javascript
import { GitHubClient, createLogger } from '@internal/github-api';
```

### Constructor

```javascript
class GitHubClient {
  constructor(options?: {
    token: string,
    baseUrl?: string,             // default: 'https://api.github.com'
    rateLimitAutoWait?: boolean,   // default: true
    rateLimitThreshold?: number,   // default: 0
    onRateLimit?: (info: RateLimitInfo) => void,
    logger?: Logger,
  })
}
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `token` | `string` | -- | GitHub API token (required) |
| `baseUrl` | `string` | `'https://api.github.com'` | API base URL; trailing slashes are stripped |
| `rateLimitAutoWait` | `boolean` | `true` | Automatically sleep until rate limit resets when remaining <= threshold |
| `rateLimitThreshold` | `number` | `0` | Remaining-request threshold that triggers auto-wait |
| `onRateLimit` | `function` | `undefined` | Callback invoked on every response with parsed rate limit info |
| `logger` | `Logger` | `createLogger('github-client')` | Structured logger instance |

### Instance Properties

| Property | Type | Description |
|----------|------|-------------|
| `token` | `string` | The configured API token |
| `baseUrl` | `string` | Normalized base URL (no trailing slash) |
| `rateLimitAutoWait` | `boolean` | Whether auto-wait is enabled |
| `rateLimitThreshold` | `number` | Remaining threshold for auto-wait |
| `onRateLimit` | `function \| undefined` | Rate limit callback |
| `logger` | `Logger` | Logger instance |
| `lastRateLimit` | `RateLimitInfo \| null` | Most recent rate limit info from any response |

### Instance Methods

```javascript
async get(path: string, options?: RequestOptions): Promise<Object>
```
Perform a GET request. Returns parsed JSON response body.

```javascript
async post(path: string, body?: Object, options?: RequestOptions): Promise<Object>
```
Perform a POST request with a JSON body.

```javascript
async put(path: string, body?: Object, options?: RequestOptions): Promise<Object>
```
Perform a PUT request with a JSON body.

```javascript
async patch(path: string, body?: Object, options?: RequestOptions): Promise<Object>
```
Perform a PATCH request with a JSON body.

```javascript
async delete(path: string, options?: RequestOptions): Promise<Object>
```
Perform a DELETE request. Returns `{}` for 204 responses.

```javascript
async getRaw(path: string): Promise<Response>
```
Perform a raw GET request. Returns the native `fetch` `Response` object. Used internally by pagination to access `Link` headers.

```javascript
async getRateLimit(): Promise<Object>
```
Shorthand for `GET /rate_limit`. Returns GitHub's rate limit status for all resources.

#### RequestOptions

```javascript
{
  headers?: Object,  // Additional headers merged with defaults
  params?: Object,   // Query parameters appended to the URL
}
```

### createLogger

```javascript
function createLogger(name: string): Logger
```

Creates a simple console-based structured logger. Returns an object with `info`, `debug`, `warn`, and `error` methods.

```javascript
const log = createLogger('my-module');
log.info('Operation complete', { owner: 'octocat', repo: 'Hello-World' });
```

### Logger Interface

```javascript
interface Logger {
  info(msg: string, ctx?: Object): void;
  debug(msg: string, ctx?: Object): void;
  warn(msg: string, ctx?: Object): void;
  error(msg: string, ctx?: Object): void;
}
```

---

## Authentication

Token resolution and type detection utilities.

**Module:** `src/sdk/auth.mjs`

```javascript
import { resolveToken, maskToken } from '@internal/github-api';
```

### resolveToken

```javascript
function resolveToken(explicitToken?: string): ResolvedToken
```

Resolve a GitHub API token. Checks sources in order:

1. `explicitToken` parameter (if provided)
2. `GITHUB_TOKEN` environment variable
3. `GH_TOKEN` environment variable
4. `GITHUB_ACCESS_TOKEN` environment variable
5. `GITHUB_PAT` environment variable

**Returns:**

```javascript
{
  token: string,      // The resolved token value
  source: string,     // 'explicit' | 'GITHUB_TOKEN' | 'GH_TOKEN' | ...
  type: TokenType,    // Detected token format
}
```

**Throws:** `AuthError` if no token is found in any source.

### maskToken

```javascript
function maskToken(token: string | null): string
```

Mask a token for safe logging. Shows the first 4 and last 4 characters. Returns `'****'` for tokens shorter than 8 characters or null/undefined input.

```javascript
maskToken('ghp_ABCDEFghijklmnop12345');
// 'ghp_*****************2345'
```

### TokenType

```javascript
type TokenType =
  | 'fine-grained'      // prefix: github_pat_
  | 'classic-pat'       // prefix: ghp_
  | 'oauth'             // prefix: gho_
  | 'user-to-server'    // prefix: ghu_
  | 'server-to-server'  // prefix: ghs_
  | 'legacy'            // 40-char hex string
  | 'unknown'           // unrecognized format
```

### Token Prefix Reference

| Prefix | TokenType | Description |
|--------|-----------|-------------|
| `github_pat_` | `fine-grained` | Fine-grained personal access token |
| `ghp_` | `classic-pat` | Classic personal access token |
| `gho_` | `oauth` | OAuth access token |
| `ghu_` | `user-to-server` | GitHub App user-to-server token |
| `ghs_` | `server-to-server` | GitHub App server-to-server token |
| `[a-f0-9]{40}` | `legacy` | Legacy 40-character hex token |

---

## Error Classes

Structured error hierarchy mapping GitHub API failure modes to specific error classes. All errors extend `GitHubError`, which extends the built-in `Error`.

**Module:** `src/sdk/errors.mjs`

```javascript
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
```

### Error Hierarchy

```
Error
  GitHubError (base, any status)
    AuthError           (401)
    ForbiddenError      (403)
    NotFoundError       (404)
    ConflictError       (409)
    ValidationError     (422)
    RateLimitError      (429 / 403 with rate limit headers)
    ServerError         (5xx)
```

### GitHubError

```javascript
class GitHubError extends Error {
  constructor(message: string, status?: number, requestId?: string, documentationUrl?: string)

  name: string;             // 'GitHubError'
  status: number;           // HTTP status code
  requestId: string;        // x-github-request-id header
  documentationUrl: string; // GitHub docs URL from response body
}
```

### AuthError

```javascript
class AuthError extends GitHubError {
  constructor(message: string, requestId?: string, documentationUrl?: string)
  // status is always 401
}
```

### NotFoundError

```javascript
class NotFoundError extends GitHubError {
  constructor(message: string, requestId?: string, documentationUrl?: string)
  // status is always 404
}
```

### ValidationError

```javascript
class ValidationError extends GitHubError {
  constructor(message: string, requestId?: string, documentationUrl?: string)
  // status is always 422
}
```

### RateLimitError

```javascript
class RateLimitError extends GitHubError {
  constructor(
    message: string,
    resetAt?: Date,           // When the rate limit window resets
    retryAfter?: number,      // Seconds to wait before retrying
    requestId?: string,
    documentationUrl?: string,
  )
  // status is always 429

  resetAt: Date | undefined;
  retryAfter: number | undefined;
}
```

### ConflictError

```javascript
class ConflictError extends GitHubError {
  constructor(message: string, requestId?: string, documentationUrl?: string)
  // status is always 409
}
```

### ForbiddenError

```javascript
class ForbiddenError extends GitHubError {
  constructor(message: string, requestId?: string, documentationUrl?: string)
  // status is always 403
}
```

### ServerError

```javascript
class ServerError extends GitHubError {
  constructor(message: string, status?: number, requestId?: string, documentationUrl?: string)
  // status defaults to 500
}
```

### mapResponseToError

```javascript
function mapResponseToError(
  status: number,
  body: Object,
  headers: Headers | Object,
): GitHubError
```

Map an HTTP response to the appropriate error class. Used internally by `GitHubClient._request()`. The function inspects the status code, response body message, and rate limit headers to determine the correct error subclass.

| Status | Error Class | Notes |
|--------|------------|-------|
| 401 | `AuthError` | |
| 403 | `RateLimitError` | When `x-ratelimit-remaining: 0` or `retry-after` header present |
| 403 | `ForbiddenError` | Non-rate-limit 403 |
| 404 | `NotFoundError` | |
| 409 | `ConflictError` | |
| 422 | `ValidationError` | |
| 429 | `RateLimitError` | |
| 5xx | `ServerError` | |
| other | `GitHubError` | Fallback |

---

## Validation

Input validation functions that enforce GitHub's naming conventions and reserved name restrictions. All validators throw `ValidationError` on invalid input and return `void` on valid input.

**Module:** `src/sdk/validation.mjs`

```javascript
import {
  validateRepositoryName,
  validateUsername,
  validateBranchName,
  RESERVED_REPO_NAMES,
} from '@internal/github-api';
```

### validateRepositoryName

```javascript
function validateRepositoryName(name: string): void
```

Validate a GitHub repository name. Throws `ValidationError` if:

- Not a non-empty string
- Exceeds 100 characters
- Starts or ends with a dot
- Contains characters outside `[a-zA-Z0-9._-]`
- Matches a reserved name (case-insensitive)

### validateUsername

```javascript
function validateUsername(owner: string): void
```

Validate a GitHub username or organization name. Throws `ValidationError` if:

- Not a non-empty string
- Exceeds 39 characters
- Starts or ends with a hyphen
- Contains consecutive hyphens (`--`)
- Contains characters outside `[a-zA-Z0-9-]`

### validateBranchName

```javascript
function validateBranchName(branch: string): void
```

Validate a Git branch name. Throws `ValidationError` if:

- Not a non-empty string
- Exceeds 255 characters
- Contains consecutive slashes (`//`)
- Is a single `@`
- Contains control characters (`\x00-\x1f`, `\x7f`)
- Contains space, `~`, `^`, `:`, `?`, `*`, `[`, or `\`
- Ends with `.lock`
- Starts or ends with a dot
- Contains consecutive dots (`..`)

### RESERVED_REPO_NAMES

```javascript
const RESERVED_REPO_NAMES: Set<string>
```

A `Set` containing 56+ reserved repository names that GitHub does not allow. Includes names like `settings`, `security`, `pulls`, `issues`, `actions`, `apps`, `codespaces`, `copilot`, `discussions`, `explore`, `features`, `marketplace`, `new`, `notifications`, `packages`, `projects`, `search`, `sponsors`, `stars`, `topics`, `trending`, `wiki`, `login`, `signup`, `api`, `docs`, `rest`, and more.

---

## Rate Limiting

Utilities for parsing, evaluating, and waiting on GitHub API rate limits.

**Module:** `src/sdk/rate-limit.mjs`

```javascript
import {
  parseRateLimitHeaders,
  shouldWaitForRateLimit,
  waitForRateLimit,
  isSecondaryRateLimit,
} from '@internal/github-api';
```

### RateLimitInfo

```javascript
interface RateLimitInfo {
  limit: number;      // Maximum requests per window
  remaining: number;  // Remaining requests in current window
  reset: number;      // Unix timestamp (seconds) when the limit resets
  used: number;       // Requests used in current window
  resource: string;   // Rate limit resource category (e.g. 'core')
}
```

### parseRateLimitHeaders

```javascript
function parseRateLimitHeaders(headers: Headers | Object): RateLimitInfo | null
```

Parse rate limit information from response headers. Reads `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`, `x-ratelimit-used`, and `x-ratelimit-resource`. Returns `null` if both `limit` and `remaining` headers are missing. Supports both the `Headers` interface (with `.get()`) and plain objects.

### shouldWaitForRateLimit

```javascript
function shouldWaitForRateLimit(
  info: RateLimitInfo,
  options?: {
    autoWait?: boolean,   // default: true
    threshold?: number,   // default: 0
  },
): boolean
```

Determine whether the client should wait for the rate limit to reset. Returns `true` when `autoWait` is enabled and `info.remaining <= threshold`.

### waitForRateLimit

```javascript
async function waitForRateLimit(
  info: RateLimitInfo,
  logger?: Logger,
): Promise<void>
```

Sleep until the rate limit resets. Calculates wait time as `info.reset - now + 1` seconds (minimum 1 second). Logs a warning with the wait duration and reset time if a logger is provided.

### isSecondaryRateLimit

```javascript
function isSecondaryRateLimit(status: number, body: Object): boolean
```

Detect whether a response represents a secondary (abuse) rate limit. Returns `true` when the status is 403 or 429 **and** the body message contains one of:

- `"secondary rate limit"`
- `"abuse detection"`
- `"you have exceeded a secondary rate limit"`

---

## Pagination

Utilities for iterating through paginated GitHub API list endpoints using the `Link` header.

**Module:** `src/sdk/pagination.mjs`

```javascript
import { paginate, paginateAll } from '@internal/github-api';
```

### paginate

```javascript
async function* paginate(
  client: GitHubClient,
  path: string,
  options?: {
    perPage?: number,    // default: 100
    maxPages?: number,   // default: 1000
    params?: Object,     // additional query parameters
  },
): AsyncGenerator<Array<Object>>
```

Async generator that yields one page of results at a time. Follows the `Link` header `rel="next"` URL for automatic pagination. Stops when there is no next link or `maxPages` is reached.

```javascript
for await (const page of paginate(client, '/users/octocat/repos', {
  perPage: 30,
  maxPages: 5,
})) {
  for (const repo of page) {
    console.log(repo.full_name);
  }
}
```

### paginateAll

```javascript
async function paginateAll(
  client: GitHubClient,
  path: string,
  options?: Object,  // same options as paginate()
): Promise<Array<Object>>
```

Convenience wrapper that collects all pages from `paginate()` into a single flat array.

```javascript
const allRepos = await paginateAll(client, '/users/octocat/repos', {
  perPage: 100,
  maxPages: 10,
});
```

---

## Domain Clients

Each domain client wraps a `GitHubClient` and provides typed, validated methods for a specific GitHub API domain. All domain clients accept a `GitHubClient` in their constructor.

```javascript
const repos = new ReposClient(client);
const branches = new BranchesClient(client);
const collaborators = new CollaboratorsClient(client);
const tags = new TagsClient(client);
const webhooks = new WebhooksClient(client);
const security = new SecurityClient(client);
```

---

### ReposClient

**Module:** `src/sdk/repos/client.mjs`

```javascript
import { ReposClient } from '@internal/github-api';
```

```javascript
class ReposClient {
  constructor(client: GitHubClient)
}
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `async get(owner, repo) -> Repository` | Get a single repository |
| `listForUser` | `async listForUser(username, options?) -> Repository[]` | List repos for a user |
| `listForAuthenticatedUser` | `async listForAuthenticatedUser(options?) -> Repository[]` | List repos for the authenticated user |
| `listForOrg` | `async listForOrg(org, options?) -> Repository[]` | List repos for an organization |
| `create` | `async create(data) -> Repository` | Create a repo for the authenticated user |
| `createInOrg` | `async createInOrg(org, data) -> Repository` | Create a repo in an organization |
| `update` | `async update(owner, repo, data) -> Repository` | Update a repository |
| `delete` | `async delete(owner, repo) -> Object` | Delete a repository |
| `getTopics` | `async getTopics(owner, repo) -> { names: string[] }` | Get repository topics |
| `replaceTopics` | `async replaceTopics(owner, repo, names) -> { names: string[] }` | Replace all topics |
| `getLanguages` | `async getLanguages(owner, repo) -> Object` | Get language breakdown (bytes) |
| `listContributors` | `async listContributors(owner, repo, options?) -> Object[]` | List contributors |
| `fork` | `async fork(owner, repo, options?) -> Repository` | Fork a repository |
| `listForks` | `async listForks(owner, repo, options?) -> Repository[]` | List forks |
| `transfer` | `async transfer(owner, repo, newOwner, options?) -> Repository` | Transfer to new owner |
| `star` | `async star(owner, repo) -> Object` | Star a repository |
| `unstar` | `async unstar(owner, repo) -> Object` | Unstar a repository |
| `isStarred` | `async isStarred(owner, repo) -> boolean` | Check if authenticated user starred the repo |
| `watch` | `async watch(owner, repo) -> Object` | Watch (subscribe to) a repository |
| `unwatch` | `async unwatch(owner, repo) -> Object` | Unwatch a repository |
| `getSubscription` | `async getSubscription(owner, repo) -> Object` | Get subscription (watch) status |

#### ReposClient.create / createInOrg Data

```javascript
{
  name: string,               // required
  description?: string,
  homepage?: string,
  private?: boolean,
  has_issues?: boolean,
  has_projects?: boolean,
  has_wiki?: boolean,
  auto_init?: boolean,
  gitignore_template?: string,
  license_template?: string,
}
```

#### ReposClient.fork Options

```javascript
{
  organization?: string,        // Fork into this org
  name?: string,                // Custom fork name
  default_branch_only?: boolean,
}
```

---

### BranchesClient

**Module:** `src/sdk/branches/client.mjs`

```javascript
import { BranchesClient } from '@internal/github-api';
```

```javascript
class BranchesClient {
  constructor(client: GitHubClient)
}
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `list` | `async list(owner, repo, options?) -> Branch[]` | List branches |
| `get` | `async get(owner, repo, branch) -> Branch` | Get a single branch |
| `getProtection` | `async getProtection(owner, repo, branch) -> BranchProtection` | Get protection rules |
| `updateProtection` | `async updateProtection(owner, repo, branch, data) -> BranchProtection` | Set protection rules |
| `removeProtection` | `async removeProtection(owner, repo, branch) -> Object` | Remove all protection |
| `getStatusChecks` | `async getStatusChecks(owner, repo, branch) -> RequiredStatusChecks` | Get required status checks |
| `updateStatusChecks` | `async updateStatusChecks(owner, repo, branch, data) -> RequiredStatusChecks` | Update status checks |
| `getReviewProtection` | `async getReviewProtection(owner, repo, branch) -> RequiredPullRequestReviews` | Get PR review protection |
| `updateReviewProtection` | `async updateReviewProtection(owner, repo, branch, data) -> RequiredPullRequestReviews` | Update PR review protection |
| `deleteReviewProtection` | `async deleteReviewProtection(owner, repo, branch) -> Object` | Remove PR review protection |
| `getAdminEnforcement` | `async getAdminEnforcement(owner, repo, branch) -> Object` | Get admin enforcement status |
| `setAdminEnforcement` | `async setAdminEnforcement(owner, repo, branch) -> Object` | Enable admin enforcement |
| `removeAdminEnforcement` | `async removeAdminEnforcement(owner, repo, branch) -> Object` | Disable admin enforcement |
| `getPushRestrictions` | `async getPushRestrictions(owner, repo, branch) -> PushRestrictions` | Get push restrictions |
| `updatePushRestrictions` | `async updatePushRestrictions(owner, repo, branch, data) -> PushRestrictions` | Update push restrictions |
| `deletePushRestrictions` | `async deletePushRestrictions(owner, repo, branch) -> Object` | Remove push restrictions |
| `rename` | `async rename(owner, repo, branch, newName) -> Branch` | Rename a branch |
| `merge` | `async merge(owner, repo, base, head, options?) -> Object` | Merge a branch into another |
| `compare` | `async compare(owner, repo, base, head) -> Object` | Compare two refs |
| `createProtectionTemplate` | `createProtectionTemplate(options?) -> ProtectionTemplate` | Build a protection config object |

#### BranchesClient.createProtectionTemplate Options

```javascript
{
  requireStatusChecks?: boolean,        // default: false
  statusCheckContexts?: string[],       // default: []
  strictStatusChecks?: boolean,         // default: false
  requireReviews?: boolean,             // default: false
  requiredReviewers?: number,           // default: 1
  dismissStaleReviews?: boolean,        // default: false
  requireCodeOwnerReviews?: boolean,    // default: false
  enforceAdmins?: boolean,             // default: false
  requiredLinearHistory?: boolean,      // default: false
  allowForcePushes?: boolean,          // default: false
  allowDeletions?: boolean,            // default: false
}
```

Returns a plain object suitable for passing to `updateProtection()`.

---

### CollaboratorsClient

**Module:** `src/sdk/collaborators/client.mjs`

```javascript
import { CollaboratorsClient } from '@internal/github-api';
```

```javascript
class CollaboratorsClient {
  constructor(client: GitHubClient)
}
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `list` | `async list(owner, repo, options?) -> Collaborator[]` | List collaborators |
| `add` | `async add(owner, repo, username, permission?) -> Object` | Add a collaborator (default permission: `'push'`) |
| `remove` | `async remove(owner, repo, username) -> Object` | Remove a collaborator |
| `checkPermission` | `async checkPermission(owner, repo, username) -> Object` | Check a user's permission level |
| `hasPermission` | `async hasPermission(owner, repo, username, requiredLevel) -> boolean` | Check if user meets minimum permission |
| `listInvitations` | `async listInvitations(owner, repo) -> Invitation[]` | List pending invitations |
| `updateInvitation` | `async updateInvitation(owner, repo, invitationId, permission) -> Invitation` | Update invitation permission |
| `deleteInvitation` | `async deleteInvitation(owner, repo, invitationId) -> Object` | Revoke an invitation |
| `bulkAdd` | `async bulkAdd(owner, repo, users) -> Result[]` | Add multiple collaborators with per-user error handling |
| `getStats` | `async getStats(owner, repo) -> Object` | Get collaborator count by permission level |

#### Permission Hierarchy

```
none < pull < triage < push < maintain < admin
```

`hasPermission()` compares the user's actual permission against a required minimum using this ordering.

#### bulkAdd Input/Output

```javascript
// Input
[{ username: 'alice', permission: 'push' }, { username: 'bob' }]

// Output
[
  { username: 'alice', success: true },
  { username: 'bob', success: false, error: 'Not Found' },
]
```

---

### TagsClient

**Module:** `src/sdk/tags/client.mjs`

```javascript
import { TagsClient } from '@internal/github-api';
```

```javascript
class TagsClient {
  constructor(client: GitHubClient)
}
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `listTags` | `async listTags(owner, repo, options?) -> Tag[]` | List tags |
| `getTag` | `async getTag(owner, repo, sha) -> Object` | Get a git tag by SHA |
| `createRelease` | `async createRelease(owner, repo, data) -> Release` | Create a release |
| `getRelease` | `async getRelease(owner, repo, releaseId) -> Release` | Get release by ID |
| `getLatestRelease` | `async getLatestRelease(owner, repo) -> Release` | Get the latest release |
| `getReleaseByTag` | `async getReleaseByTag(owner, repo, tag) -> Release` | Get release by tag name |
| `updateRelease` | `async updateRelease(owner, repo, releaseId, data) -> Release` | Update a release |
| `deleteRelease` | `async deleteRelease(owner, repo, releaseId) -> Object` | Delete a release |
| `listReleases` | `async listReleases(owner, repo, options?) -> Release[]` | List releases |
| `listTagProtections` | `async listTagProtections(owner, repo) -> TagProtection[]` | List tag protection rules |
| `createTagProtection` | `async createTagProtection(owner, repo, pattern) -> TagProtection` | Create a tag protection rule |
| `deleteTagProtection` | `async deleteTagProtection(owner, repo, protectionId) -> Object` | Delete a tag protection rule |
| `parseSemanticVersion` | `parseSemanticVersion(tag) -> SemanticVersion \| null` | Parse a semver string |
| `getNextVersion` | `getNextVersion(tag, bump) -> string` | Calculate next major/minor/patch version |
| `sortByVersion` | `sortByVersion(tags) -> Tag[]` | Sort tags by semver descending |

#### createRelease Data

```javascript
{
  tag_name: string,                // required
  target_commitish?: string,       // commit SHA or branch name
  name?: string,                   // release title
  body?: string,                   // release notes
  draft?: boolean,                 // default: false
  prerelease?: boolean,            // default: false
  generate_release_notes?: boolean, // default: false
}
```

#### SemanticVersion

```javascript
{
  major: number,
  minor: number,
  patch: number,
  prerelease: string | undefined,
  raw: string,
}
```

Accepts both `vX.Y.Z` and `X.Y.Z` formats. Optional prerelease suffix: `v1.2.3-beta.1`.

---

### WebhooksClient

**Module:** `src/sdk/webhooks/client.mjs`

```javascript
import { WebhooksClient } from '@internal/github-api';
```

```javascript
class WebhooksClient {
  constructor(client: GitHubClient)
}
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `list` | `async list(owner, repo, options?) -> Webhook[]` | List webhooks |
| `get` | `async get(owner, repo, hookId) -> Webhook` | Get a webhook by ID |
| `create` | `async create(owner, repo, config) -> Webhook` | Create a webhook |
| `update` | `async update(owner, repo, hookId, config) -> Webhook` | Update a webhook |
| `delete` | `async delete(owner, repo, hookId) -> Object` | Delete a webhook |
| `test` | `async test(owner, repo, hookId) -> Object` | Trigger a test push event |
| `ping` | `async ping(owner, repo, hookId) -> Object` | Send a ping event |
| `validateConfig` | `validateConfig(config) -> void` | Validate webhook config (throws `ValidationError`) |

#### Webhook Create Config

```javascript
{
  url: string,                   // Payload URL (must be HTTPS)
  content_type?: string,         // 'json' | 'form' (default: 'json')
  secret?: string,               // Webhook secret
  events?: string[],             // Events to subscribe to (default: ['push'])
  active?: boolean,              // default: true
}
```

`validateConfig()` enforces HTTPS URLs and valid `content_type` values.

---

### SecurityClient

**Module:** `src/sdk/security/client.mjs`

```javascript
import { SecurityClient } from '@internal/github-api';
```

```javascript
class SecurityClient {
  constructor(client: GitHubClient)
}
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `getSecurityAnalysis` | `async getSecurityAnalysis(owner, repo) -> SecurityAnalysis` | Get security and analysis settings |
| `updateSecurityAnalysis` | `async updateSecurityAnalysis(owner, repo, data) -> Object` | Update security settings |
| `getVulnerabilityAlerts` | `async getVulnerabilityAlerts(owner, repo) -> { enabled: boolean }` | Check if vulnerability alerts are enabled |
| `enableVulnerabilityAlerts` | `async enableVulnerabilityAlerts(owner, repo) -> Object` | Enable vulnerability alerts |
| `disableVulnerabilityAlerts` | `async disableVulnerabilityAlerts(owner, repo) -> Object` | Disable vulnerability alerts |
| `listRulesets` | `async listRulesets(owner, repo) -> Ruleset[]` | List repository rulesets |
| `getRuleset` | `async getRuleset(owner, repo, rulesetId) -> Ruleset` | Get a specific ruleset |
| `createRuleset` | `async createRuleset(owner, repo, data) -> Ruleset` | Create a ruleset |
| `updateRuleset` | `async updateRuleset(owner, repo, rulesetId, data) -> Ruleset` | Update a ruleset |
| `deleteRuleset` | `async deleteRuleset(owner, repo, rulesetId) -> Object` | Delete a ruleset |

#### SecurityAnalysis Response

```javascript
{
  advanced_security: { status: 'enabled' | 'disabled' },
  secret_scanning: { status: 'enabled' | 'disabled' },
  secret_scanning_push_protection: { status: 'enabled' | 'disabled' },
}
```

---

## Configuration

Environment-based configuration loader.

**Module:** `src/config.mjs`

```javascript
import { loadConfig } from '@internal/github-api';
```

### loadConfig

```javascript
function loadConfig(): AppConfig
```

Returns:

```javascript
{
  githubToken: string | undefined,       // from GITHUB_TOKEN / GH_TOKEN / GITHUB_ACCESS_TOKEN / GITHUB_PAT
  githubApiBaseUrl: string,              // GITHUB_API_BASE_URL or 'https://api.github.com'
  logLevel: string,                      // LOG_LEVEL or 'info'
  port: number,                          // PORT or 3100
  host: string,                          // HOST or '0.0.0.0'
}
```

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `GITHUB_TOKEN` / `GH_TOKEN` / `GITHUB_ACCESS_TOKEN` / `GITHUB_PAT` | `undefined` | GitHub API token (first found wins) |
| `GITHUB_API_BASE_URL` | `'https://api.github.com'` | Base URL for GitHub API |
| `LOG_LEVEL` | `'info'` | Fastify log level |
| `PORT` | `3100` | Server listen port |
| `HOST` | `'0.0.0.0'` | Server bind host |

---

## Server

Fastify server creation and startup utilities.

**Module:** `src/server.mjs`

```javascript
import { createServer, startServer } from '@internal/github-api';
```

### createServer

```javascript
async function createServer(options?: {
  token?: string,          // Explicit GitHub token (falls back to env vars)
  baseUrl?: string,        // default: 'https://api.github.com'
  logLevel?: string,       // default: 'info'
  corsOptions?: Object,    // Options for @fastify/cors (default: {})
}): Promise<{
  server: FastifyInstance,
  client: GitHubClient,
}>
```

Creates and configures a Fastify server with:

1. Token resolution via `resolveToken()`
2. `GitHubClient` creation
3. Plugin registration: `@fastify/cors`, `@fastify/sensible`
4. Custom error handler via `createErrorHandler()`
5. All routes via `registerRoutes()`

### startServer

```javascript
async function startServer(
  server: FastifyInstance,
  options?: {
    port?: number,   // default: 3100
    host?: string,   // default: '0.0.0.0'
  },
): Promise<string>   // Returns the address the server is listening on
```

---

## Middleware

Fastify-specific middleware: error handler and response processing hooks.

**Module:** `src/middleware/error-handler.mjs`, `src/middleware/github-hooks.mjs`

```javascript
import {
  createErrorHandler,
  response204Hook,
  jsonFallbackHook,
  requestIdHook,
  rateLimitHook,
} from '@internal/github-api';
```

### createErrorHandler

```javascript
function createErrorHandler(): (error: Error, request: FastifyRequest, reply: FastifyReply) => void
```

Returns a Fastify error handler function that maps SDK error types to HTTP responses:

| SDK Error | HTTP Status | Response `error` Field |
|-----------|-------------|----------------------|
| `ValidationError` | 400 | `'Validation Error'` |
| `AuthError` | 401 | `'Unauthorized'` |
| `RateLimitError` | 429 | `'Rate Limit Exceeded'` |
| `ForbiddenError` | 403 | `'Forbidden'` |
| `NotFoundError` | 404 | `'Not Found'` |
| `ConflictError` | 409 | `'Conflict'` |
| `ServerError` | 502 | `'Bad Gateway'` |
| `GitHubError` | `error.status \|\| 500` | `'GitHub API Error'` |
| Fastify validation | 400 | `'Validation Error'` |
| Unknown | 500 | `'Internal Server Error'` |

Rate limit errors include `Retry-After` and `X-RateLimit-Reset` response headers when available.

### Response Processing Hooks

```javascript
function response204Hook(response: Response): Object | null
```
Returns `{}` for 204 responses, `null` otherwise.

```javascript
async function jsonFallbackHook(response: Response): Promise<Object | null>
```
Returns `{ data: text }` for non-JSON content types, `null` for JSON responses.

```javascript
function requestIdHook(response: Response): string | undefined
```
Extracts the `x-github-request-id` header value.

```javascript
function rateLimitHook(response: Response): RateLimitInfo | null
```
Parses rate limit headers via `parseRateLimitHeaders()`.

### registerRoutes

```javascript
async function registerRoutes(server: FastifyInstance, client: GitHubClient): Promise<void>
```

Creates all domain SDK clients from the base `GitHubClient` and registers every route module. Health routes are registered at the root level; all other routes are registered under the `/api/github` prefix.

---

## REST Endpoints

All domain routes are registered under the `/api/github` prefix. Health routes are at the root level.

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Server status with cached rate limit info |
| `GET` | `/health/rate-limit` | Live rate limit status from `GET /rate_limit` |

### Repositories

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/github/repos/:owner/:repo` | Get a repository |
| `GET` | `/api/github/repos/user/:username` | List repos for a user |
| `GET` | `/api/github/repos/me` | List repos for authenticated user |
| `GET` | `/api/github/repos/org/:org` | List repos for an organization |
| `POST` | `/api/github/repos` | Create a repo for authenticated user |
| `POST` | `/api/github/repos/org/:org` | Create a repo in an organization |
| `PATCH` | `/api/github/repos/:owner/:repo` | Update a repository |
| `DELETE` | `/api/github/repos/:owner/:repo` | Delete a repository |
| `GET` | `/api/github/repos/:owner/:repo/topics` | Get repository topics |
| `PUT` | `/api/github/repos/:owner/:repo/topics` | Replace repository topics |
| `GET` | `/api/github/repos/:owner/:repo/languages` | Get language breakdown |
| `GET` | `/api/github/repos/:owner/:repo/contributors` | List contributors |
| `POST` | `/api/github/repos/:owner/:repo/forks` | Fork a repository |
| `GET` | `/api/github/repos/:owner/:repo/forks` | List forks |
| `PUT` | `/api/github/repos/:owner/:repo/subscription` | Watch a repository |
| `DELETE` | `/api/github/repos/:owner/:repo/subscription` | Unwatch a repository |

### Branches

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/github/repos/:owner/:repo/branches` | List branches |
| `GET` | `/api/github/repos/:owner/:repo/branches/:branch` | Get a branch |
| `GET` | `/api/github/repos/:owner/:repo/branches/:branch/protection` | Get branch protection |
| `PUT` | `/api/github/repos/:owner/:repo/branches/:branch/protection` | Update branch protection |
| `DELETE` | `/api/github/repos/:owner/:repo/branches/:branch/protection` | Remove branch protection |
| `POST` | `/api/github/repos/:owner/:repo/branches/:branch/rename` | Rename a branch |
| `POST` | `/api/github/repos/:owner/:repo/merges` | Merge branches |
| `GET` | `/api/github/repos/:owner/:repo/compare/:base...:head` | Compare two refs |

### Collaborators

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/github/repos/:owner/:repo/collaborators` | List collaborators |
| `PUT` | `/api/github/repos/:owner/:repo/collaborators/:username` | Add a collaborator |
| `DELETE` | `/api/github/repos/:owner/:repo/collaborators/:username` | Remove a collaborator |
| `GET` | `/api/github/repos/:owner/:repo/collaborators/:username/permission` | Check permission |
| `GET` | `/api/github/repos/:owner/:repo/invitations` | List invitations |

### Tags and Releases

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/github/repos/:owner/:repo/tags` | List tags |
| `GET` | `/api/github/repos/:owner/:repo/releases` | List releases |
| `POST` | `/api/github/repos/:owner/:repo/releases` | Create a release |
| `GET` | `/api/github/repos/:owner/:repo/releases/latest` | Get latest release |
| `GET` | `/api/github/repos/:owner/:repo/releases/tags/:tag` | Get release by tag |
| `GET` | `/api/github/repos/:owner/:repo/releases/:id` | Get release by ID |
| `PATCH` | `/api/github/repos/:owner/:repo/releases/:id` | Update a release |
| `DELETE` | `/api/github/repos/:owner/:repo/releases/:id` | Delete a release |

### Webhooks

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/github/repos/:owner/:repo/hooks` | List webhooks |
| `GET` | `/api/github/repos/:owner/:repo/hooks/:hookId` | Get a webhook |
| `POST` | `/api/github/repos/:owner/:repo/hooks` | Create a webhook |
| `PATCH` | `/api/github/repos/:owner/:repo/hooks/:hookId` | Update a webhook |
| `DELETE` | `/api/github/repos/:owner/:repo/hooks/:hookId` | Delete a webhook |
| `POST` | `/api/github/repos/:owner/:repo/hooks/:hookId/tests` | Test a webhook |
| `POST` | `/api/github/repos/:owner/:repo/hooks/:hookId/pings` | Ping a webhook |

### Security

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/github/repos/:owner/:repo/vulnerability-alerts` | Get vulnerability alert status |
| `PUT` | `/api/github/repos/:owner/:repo/vulnerability-alerts` | Enable vulnerability alerts |
| `DELETE` | `/api/github/repos/:owner/:repo/vulnerability-alerts` | Disable vulnerability alerts |
| `GET` | `/api/github/repos/:owner/:repo/rulesets` | List rulesets |
| `GET` | `/api/github/repos/:owner/:repo/rulesets/:id` | Get a ruleset |
| `POST` | `/api/github/repos/:owner/:repo/rulesets` | Create a ruleset |
| `PUT` | `/api/github/repos/:owner/:repo/rulesets/:id` | Update a ruleset |
| `DELETE` | `/api/github/repos/:owner/:repo/rulesets/:id` | Delete a ruleset |
