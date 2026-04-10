/**
 * GitHub API SDK -- Basic Usage Examples
 *
 * Demonstrates core features of the @internal/github-api package:
 * - Token resolution and authentication
 * - Repository operations (list, get, create)
 * - Input validation
 * - Error handling
 * - Pagination
 * - Rate limit awareness
 *
 * Prerequisites:
 *   export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
 *
 * Usage:
 *   node basic-usage.mjs
 */

import { resolveToken, maskToken } from '../src/sdk/auth.mjs';
import { GitHubClient, createLogger } from '../src/sdk/client.mjs';
import { ReposClient } from '../src/sdk/repos/client.mjs';
import { BranchesClient } from '../src/sdk/branches/client.mjs';
import { TagsClient } from '../src/sdk/tags/client.mjs';
import {
  validateRepositoryName,
  validateUsername,
  validateBranchName,
  RESERVED_REPO_NAMES,
} from '../src/sdk/validation.mjs';
import {
  GitHubError,
  AuthError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ForbiddenError,
  ServerError,
  mapResponseToError,
} from '../src/sdk/errors.mjs';
import { paginate, paginateAll } from '../src/sdk/pagination.mjs';
import {
  parseRateLimitHeaders,
  shouldWaitForRateLimit,
  isSecondaryRateLimit,
} from '../src/sdk/rate-limit.mjs';

// =============================================================================
// Example 1: Token Resolution
// =============================================================================
/**
 * Shows how resolveToken() discovers tokens from environment variables
 * or explicit parameters. Demonstrates maskToken() for safe logging
 * and token type detection for different GitHub token formats.
 */
function example1_token_resolution() {
  console.log('\n=== Example 1: Token Resolution ===\n');

  // --- Explicit token ---
  const explicitToken = 'ghp_ABCDEFghijklmnop1234567890abcdef12';
  const resolved = resolveToken(explicitToken);
  console.log('Explicit token resolved:');
  console.log('  source:', resolved.source);     // 'explicit'
  console.log('  type:  ', resolved.type);        // 'classic-pat'
  console.log('  masked:', maskToken(resolved.token));

  // --- maskToken examples ---
  console.log('\nmaskToken() examples:');
  console.log('  Classic PAT:   ', maskToken('ghp_ABCDEFghijklmnop12345'));
  console.log('  Fine-grained:  ', maskToken('github_pat_1234567890abcdef1234'));
  console.log('  Short token:   ', maskToken('short'));    // '****'
  console.log('  Null token:    ', maskToken(null));       // '****'

  // --- Token type detection ---
  console.log('\nToken type detection:');
  const tokenSamples = [
    { token: 'github_pat_ABCdef123456', expected: 'fine-grained' },
    { token: 'ghp_ABCDEFghijklmnop12345', expected: 'classic-pat' },
    { token: 'gho_ABCDEFghijklmnop12345', expected: 'oauth' },
    { token: 'ghu_ABCDEFghijklmnop12345', expected: 'user-to-server' },
    { token: 'ghs_ABCDEFghijklmnop12345', expected: 'server-to-server' },
    { token: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', expected: 'legacy' },
    { token: 'some-random-format', expected: 'unknown' },
  ];
  for (const { token, expected } of tokenSamples) {
    const result = resolveToken(token);
    console.log(`  ${maskToken(token)} -> ${result.type} (expected: ${expected})`);
  }

  // --- Environment variable priority ---
  console.log('\nEnvironment variable priority order:');
  console.log('  1. GITHUB_TOKEN');
  console.log('  2. GH_TOKEN');
  console.log('  3. GITHUB_ACCESS_TOKEN');
  console.log('  4. GITHUB_PAT');

  // --- Error when no token is available ---
  console.log('\nAttempting resolveToken() with no token available:');
  const savedEnv = {};
  const envVars = ['GITHUB_TOKEN', 'GH_TOKEN', 'GITHUB_ACCESS_TOKEN', 'GITHUB_PAT'];
  for (const key of envVars) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
  try {
    resolveToken();
    console.log('  ERROR: should have thrown');
  } catch (err) {
    console.log('  Caught expected AuthError:', err.message.slice(0, 60) + '...');
    console.log('  err instanceof AuthError:', err instanceof AuthError);
  } finally {
    for (const key of envVars) {
      if (savedEnv[key] !== undefined) {
        process.env[key] = savedEnv[key];
      }
    }
  }
}

// =============================================================================
// Example 2: Client Initialization
// =============================================================================
/**
 * Creates a GitHubClient with explicit token and shows configuration options
 * such as baseUrl, rateLimitAutoWait, and custom onRateLimit callbacks.
 * Demonstrates the getRateLimit() endpoint for checking rate limit status.
 */
async function example2_client_initialization() {
  console.log('\n=== Example 2: Client Initialization ===\n');

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('  GITHUB_TOKEN not set -- showing configuration only.\n');
  }

  // --- Basic client creation ---
  const client = new GitHubClient({
    token: token || 'ghp_placeholder_for_demo',
    baseUrl: 'https://api.github.com',
    rateLimitAutoWait: true,
    rateLimitThreshold: 10,
    onRateLimit: (info) => {
      console.log('  [onRateLimit callback] remaining:', info.remaining);
    },
    logger: createLogger('example'),
  });

  console.log('Client created with:');
  console.log('  baseUrl:            ', client.baseUrl);
  console.log('  rateLimitAutoWait:  ', client.rateLimitAutoWait);
  console.log('  rateLimitThreshold: ', client.rateLimitThreshold);
  console.log('  hasToken:           ', !!client.token);
  console.log('  lastRateLimit:      ', client.lastRateLimit);

  // --- Check rate limit status (requires network) ---
  if (token) {
    console.log('\nFetching rate limit status from GitHub API...');
    try {
      const rateLimit = await client.getRateLimit();
      const core = rateLimit.resources?.core;
      if (core) {
        console.log('  Core rate limit:');
        console.log('    limit:    ', core.limit);
        console.log('    remaining:', core.remaining);
        console.log('    used:     ', core.used);
        console.log('    reset:    ', new Date(core.reset * 1000).toISOString());
      }
    } catch (err) {
      console.log('  Failed to fetch rate limit:', err.message);
    }
  }
}

// =============================================================================
// Example 3: Repository Operations
// =============================================================================
/**
 * Creates a ReposClient from a GitHubClient and performs repository
 * operations: listing repos for a user, getting a specific repo,
 * and fetching topics and languages.
 */
async function example3_repository_operations() {
  console.log('\n=== Example 3: Repository Operations ===\n');

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('  Skipped: GITHUB_TOKEN not set.');
    return;
  }

  const client = new GitHubClient({
    token,
    logger: createLogger('repos-example'),
  });
  const repos = new ReposClient(client);

  // --- List repos for a user ---
  console.log('Listing repos for user "octocat" (first 5, sorted by updated):');
  try {
    const userRepos = await repos.listForUser('octocat', {
      per_page: 5,
      sort: 'updated',
    });
    for (const repo of userRepos) {
      console.log(`  - ${repo.full_name} (${repo.stargazers_count} stars)`);
    }
  } catch (err) {
    console.log('  Error listing repos:', err.message);
  }

  // --- Get a specific repo ---
  console.log('\nGetting repo "octocat/Hello-World":');
  try {
    const repo = await repos.get('octocat', 'Hello-World');
    console.log('  full_name:   ', repo.full_name);
    console.log('  description: ', repo.description);
    console.log('  stars:       ', repo.stargazers_count);
    console.log('  language:    ', repo.language);
    console.log('  default_branch:', repo.default_branch);
  } catch (err) {
    console.log('  Error getting repo:', err.message);
  }

  // --- Get topics ---
  console.log('\nGetting topics for "octocat/Hello-World":');
  try {
    const topics = await repos.getTopics('octocat', 'Hello-World');
    console.log('  topics:', topics.names?.join(', ') || '(none)');
  } catch (err) {
    console.log('  Error getting topics:', err.message);
  }

  // --- Get languages ---
  console.log('\nGetting languages for "octocat/Hello-World":');
  try {
    const languages = await repos.getLanguages('octocat', 'Hello-World');
    for (const [lang, bytes] of Object.entries(languages)) {
      console.log(`  ${lang}: ${bytes} bytes`);
    }
  } catch (err) {
    console.log('  Error getting languages:', err.message);
  }
}

// =============================================================================
// Example 4: Input Validation
// =============================================================================
/**
 * Demonstrates the validation functions for repository names, usernames,
 * and branch names. Shows both valid inputs that pass and invalid inputs
 * that throw ValidationError with descriptive messages.
 */
function example4_input_validation() {
  console.log('\n=== Example 4: Input Validation ===\n');

  // --- validateRepositoryName ---
  console.log('Repository name validation:');

  const validRepoNames = ['my-repo', 'my_repo', 'MyRepo123', 'repo.js'];
  for (const name of validRepoNames) {
    try {
      validateRepositoryName(name);
      console.log(`  PASS: "${name}"`);
    } catch (err) {
      console.log(`  FAIL: "${name}" -- ${err.message}`);
    }
  }

  const invalidRepoNames = [
    { name: '', reason: 'empty string' },
    { name: '.hidden', reason: 'starts with dot' },
    { name: 'repo name', reason: 'contains space' },
    { name: 'repo@name', reason: 'contains special char' },
    { name: 'settings', reason: 'reserved name' },
    { name: 'issues', reason: 'reserved name' },
    { name: 'a'.repeat(101), reason: 'over 100 chars' },
  ];
  console.log('\n  Invalid names:');
  for (const { name, reason } of invalidRepoNames) {
    try {
      validateRepositoryName(name);
      console.log(`  UNEXPECTED PASS: "${name}" (${reason})`);
    } catch (err) {
      const display = name.length > 20 ? name.slice(0, 20) + '...' : name || '(empty)';
      console.log(`  CAUGHT: "${display}" -- ${err.message}`);
    }
  }

  console.log(`\n  Reserved repo names count: ${RESERVED_REPO_NAMES.size}`);

  // --- validateUsername ---
  console.log('\nUsername validation:');

  const validUsernames = ['octocat', 'user-name', 'User123', 'a'];
  for (const name of validUsernames) {
    try {
      validateUsername(name);
      console.log(`  PASS: "${name}"`);
    } catch (err) {
      console.log(`  FAIL: "${name}" -- ${err.message}`);
    }
  }

  const invalidUsernames = [
    { name: '', reason: 'empty string' },
    { name: '-user', reason: 'starts with hyphen' },
    { name: 'user-', reason: 'ends with hyphen' },
    { name: 'user--name', reason: 'consecutive hyphens' },
    { name: 'user.name', reason: 'contains dot' },
    { name: 'user_name', reason: 'contains underscore' },
    { name: 'a'.repeat(40), reason: 'over 39 chars' },
  ];
  console.log('\n  Invalid usernames:');
  for (const { name, reason } of invalidUsernames) {
    try {
      validateUsername(name);
      console.log(`  UNEXPECTED PASS: "${name}" (${reason})`);
    } catch (err) {
      const display = name.length > 20 ? name.slice(0, 20) + '...' : name || '(empty)';
      console.log(`  CAUGHT: "${display}" -- ${err.message}`);
    }
  }

  // --- validateBranchName ---
  console.log('\nBranch name validation:');

  const validBranchNames = ['main', 'feature/my-feature', 'release/v1.0.0', 'hotfix-123'];
  for (const name of validBranchNames) {
    try {
      validateBranchName(name);
      console.log(`  PASS: "${name}"`);
    } catch (err) {
      console.log(`  FAIL: "${name}" -- ${err.message}`);
    }
  }

  const invalidBranchNames = [
    { name: '', reason: 'empty string' },
    { name: 'feature//name', reason: 'consecutive slashes' },
    { name: '@', reason: 'single @' },
    { name: 'branch name', reason: 'contains space' },
    { name: 'branch~name', reason: 'contains tilde' },
    { name: 'branch.lock', reason: 'ends with .lock' },
    { name: '.hidden', reason: 'starts with dot' },
    { name: 'branch..name', reason: 'consecutive dots' },
  ];
  console.log('\n  Invalid branch names:');
  for (const { name, reason } of invalidBranchNames) {
    try {
      validateBranchName(name);
      console.log(`  UNEXPECTED PASS: "${name}" (${reason})`);
    } catch (err) {
      const display = name || '(empty)';
      console.log(`  CAUGHT: "${display}" -- ${err.message}`);
    }
  }

  // --- Demonstrate that validation errors are instances of ValidationError ---
  console.log('\nError type checking:');
  try {
    validateRepositoryName('');
  } catch (err) {
    console.log('  err instanceof ValidationError:', err instanceof ValidationError);
    console.log('  err instanceof GitHubError:    ', err instanceof GitHubError);
    console.log('  err.name:                      ', err.name);
    console.log('  err.status:                    ', err.status);
  }
}

// =============================================================================
// Example 5: Error Handling
// =============================================================================
/**
 * Demonstrates the error hierarchy and mapResponseToError function.
 * Shows how each HTTP status code maps to a specific error class,
 * and how error properties (status, requestId, documentationUrl) are populated.
 */
function example5_error_handling() {
  console.log('\n=== Example 5: Error Handling ===\n');

  // --- Error hierarchy ---
  console.log('Error class hierarchy:');
  console.log('  GitHubError (base)');
  console.log('    AuthError         (401)');
  console.log('    ForbiddenError    (403)');
  console.log('    NotFoundError     (404)');
  console.log('    ConflictError     (409)');
  console.log('    ValidationError   (422)');
  console.log('    RateLimitError    (429)');
  console.log('    ServerError       (5xx)');

  // --- Constructing errors directly ---
  console.log('\nDirect error construction:');
  const notFound = new NotFoundError('Repository not found', 'req-abc-123', 'https://docs.github.com/rest');
  console.log('  NotFoundError:');
  console.log('    message:         ', notFound.message);
  console.log('    status:          ', notFound.status);
  console.log('    requestId:       ', notFound.requestId);
  console.log('    documentationUrl:', notFound.documentationUrl);
  console.log('    name:            ', notFound.name);

  const rateLimit = new RateLimitError(
    'API rate limit exceeded',
    new Date('2025-01-01T12:00:00Z'),
    60,
    'req-xyz-789',
  );
  console.log('\n  RateLimitError:');
  console.log('    message:    ', rateLimit.message);
  console.log('    status:     ', rateLimit.status);
  console.log('    resetAt:    ', rateLimit.resetAt?.toISOString());
  console.log('    retryAfter: ', rateLimit.retryAfter);

  // --- mapResponseToError ---
  console.log('\nmapResponseToError() mappings:');

  const testCases = [
    {
      status: 401,
      body: { message: 'Bad credentials' },
      headers: { 'x-github-request-id': 'req-401' },
    },
    {
      status: 403,
      body: { message: 'Resource not accessible by integration' },
      headers: {},
    },
    {
      status: 403,
      body: { message: 'API rate limit exceeded' },
      headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1700000000' },
    },
    {
      status: 404,
      body: { message: 'Not Found' },
      headers: { 'x-github-request-id': 'req-404' },
    },
    {
      status: 409,
      body: { message: 'Merge conflict' },
      headers: {},
    },
    {
      status: 422,
      body: { message: 'Validation Failed', documentation_url: 'https://docs.github.com' },
      headers: {},
    },
    {
      status: 429,
      body: { message: 'Too many requests' },
      headers: { 'retry-after': '60' },
    },
    {
      status: 500,
      body: { message: 'Internal Server Error' },
      headers: {},
    },
    {
      status: 502,
      body: { message: 'Bad Gateway' },
      headers: {},
    },
  ];

  for (const { status, body, headers } of testCases) {
    const err = mapResponseToError(status, body, headers);
    console.log(`  ${status} -> ${err.constructor.name}: "${err.message}"`);
  }

  // --- instanceof checks ---
  console.log('\ninstanceof chain for NotFoundError:');
  const err404 = mapResponseToError(404, { message: 'Not Found' }, {});
  console.log('  instanceof NotFoundError:', err404 instanceof NotFoundError);
  console.log('  instanceof GitHubError:  ', err404 instanceof GitHubError);
  console.log('  instanceof Error:        ', err404 instanceof Error);

  // --- try/catch pattern ---
  console.log('\nRecommended try/catch pattern:');
  console.log('  try {');
  console.log('    await repos.get(owner, repo);');
  console.log('  } catch (err) {');
  console.log('    if (err instanceof NotFoundError) { ... }');
  console.log('    if (err instanceof AuthError) { ... }');
  console.log('    if (err instanceof RateLimitError) { ... }');
  console.log('    if (err instanceof ValidationError) { ... }');
  console.log('  }');
}

// =============================================================================
// Example 6: Pagination
// =============================================================================
/**
 * Demonstrates pagination utilities: the paginate() async generator
 * for streaming pages one at a time, and paginateAll() for collecting
 * all results into a single array. Shows the maxPages safety limit.
 */
async function example6_pagination() {
  console.log('\n=== Example 6: Pagination ===\n');

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('  Skipped: GITHUB_TOKEN not set.');
    console.log('  Showing API overview instead:\n');
    console.log('  // paginate() is an async generator -- yields one page at a time');
    console.log('  for await (const page of paginate(client, "/users/octocat/repos", {');
    console.log('    perPage: 10,');
    console.log('    maxPages: 3,');
    console.log('  })) {');
    console.log('    console.log(`Page with ${page.length} items`);');
    console.log('  }\n');
    console.log('  // paginateAll() collects all pages into one array');
    console.log('  const allRepos = await paginateAll(client, "/users/octocat/repos", {');
    console.log('    perPage: 30,');
    console.log('    maxPages: 5,');
    console.log('  });');
    return;
  }

  const client = new GitHubClient({
    token,
    logger: createLogger('pagination-example'),
  });

  // --- paginate() async generator ---
  console.log('Using paginate() async generator (maxPages: 2, perPage: 5):');
  let pageNum = 0;
  let totalItems = 0;
  for await (const page of paginate(client, '/users/octocat/repos', {
    perPage: 5,
    maxPages: 2,
  })) {
    pageNum++;
    totalItems += page.length;
    console.log(`  Page ${pageNum}: ${page.length} repos`);
    for (const repo of page.slice(0, 2)) {
      console.log(`    - ${repo.name}`);
    }
    if (page.length > 2) {
      console.log(`    ... and ${page.length - 2} more`);
    }
  }
  console.log(`  Total fetched: ${totalItems} repos across ${pageNum} pages`);

  // --- paginateAll() convenience ---
  console.log('\nUsing paginateAll() to collect all (maxPages: 1, perPage: 3):');
  const allRepos = await paginateAll(client, '/users/octocat/repos', {
    perPage: 3,
    maxPages: 1,
  });
  console.log(`  Collected ${allRepos.length} repos in one call`);
  for (const repo of allRepos.slice(0, 3)) {
    console.log(`    - ${repo.name}`);
  }
}

// =============================================================================
// Example 7: Rate Limit Awareness
// =============================================================================
/**
 * Demonstrates rate limit utilities: parseRateLimitHeaders() to extract
 * rate limit info from response headers, shouldWaitForRateLimit() to
 * decide whether to pause, and isSecondaryRateLimit() to detect
 * abuse/secondary rate limit responses.
 */
function example7_rate_limit_awareness() {
  console.log('\n=== Example 7: Rate Limit Awareness ===\n');

  // --- parseRateLimitHeaders ---
  console.log('parseRateLimitHeaders() with simulated headers:');

  // Simulate headers as a plain object (the function supports both Headers and plain objects)
  const mockHeaders = {
    'x-ratelimit-limit': '5000',
    'x-ratelimit-remaining': '4750',
    'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
    'x-ratelimit-used': '250',
    'x-ratelimit-resource': 'core',
  };
  const info = parseRateLimitHeaders(mockHeaders);
  console.log('  Parsed info:');
  console.log('    limit:    ', info.limit);
  console.log('    remaining:', info.remaining);
  console.log('    used:     ', info.used);
  console.log('    resource: ', info.resource);
  console.log('    reset:    ', new Date(info.reset * 1000).toISOString());

  // Missing headers
  const nullInfo = parseRateLimitHeaders({});
  console.log('\n  Missing headers -> null:', nullInfo === null);

  // --- shouldWaitForRateLimit ---
  console.log('\nshouldWaitForRateLimit() scenarios:');

  const scenarios = [
    { info: { remaining: 100, limit: 5000, reset: 0, used: 0, resource: 'core' }, opts: { autoWait: true, threshold: 0 }, expected: false },
    { info: { remaining: 0, limit: 5000, reset: 0, used: 0, resource: 'core' }, opts: { autoWait: true, threshold: 0 }, expected: true },
    { info: { remaining: 5, limit: 5000, reset: 0, used: 0, resource: 'core' }, opts: { autoWait: true, threshold: 10 }, expected: true },
    { info: { remaining: 0, limit: 5000, reset: 0, used: 0, resource: 'core' }, opts: { autoWait: false, threshold: 0 }, expected: false },
  ];

  for (const { info: rInfo, opts, expected } of scenarios) {
    const result = shouldWaitForRateLimit(rInfo, opts);
    const label = result === expected ? 'OK' : 'MISMATCH';
    console.log(`  remaining=${rInfo.remaining}, autoWait=${opts.autoWait}, threshold=${opts.threshold} -> ${result} [${label}]`);
  }

  // --- isSecondaryRateLimit ---
  console.log('\nisSecondaryRateLimit() detection:');

  const secondaryScenarios = [
    { status: 403, body: { message: 'You have exceeded a secondary rate limit' }, expected: true },
    { status: 429, body: { message: 'secondary rate limit hit' }, expected: true },
    { status: 403, body: { message: 'abuse detection mechanism triggered' }, expected: true },
    { status: 403, body: { message: 'Resource not accessible' }, expected: false },
    { status: 404, body: { message: 'secondary rate limit' }, expected: false },
    { status: 200, body: { message: 'secondary rate limit' }, expected: false },
  ];

  for (const { status, body, expected } of secondaryScenarios) {
    const result = isSecondaryRateLimit(status, body);
    const label = result === expected ? 'OK' : 'MISMATCH';
    console.log(`  status=${status}, msg="${body.message.slice(0, 40)}" -> ${result} [${label}]`);
  }

  // --- Rate limit in GitHubClient ---
  console.log('\nGitHubClient rate limit integration:');
  console.log('  The client automatically:');
  console.log('  - Parses rate limit headers from every response');
  console.log('  - Stores latest info in client.lastRateLimit');
  console.log('  - Calls onRateLimit(info) callback if provided');
  console.log('  - Auto-waits when remaining hits threshold (if rateLimitAutoWait=true)');
  console.log('  - Detects and waits for secondary rate limits with retry');
}

// =============================================================================
// Main Runner
// =============================================================================
async function main() {
  console.log('='.repeat(70));
  console.log(' GitHub API SDK -- Basic Usage Examples');
  console.log('='.repeat(70));

  const hasToken = !!process.env.GITHUB_TOKEN;
  if (!hasToken) {
    console.log('\nNote: GITHUB_TOKEN is not set. Network-dependent examples will be skipped.');
    console.log('Set it to run all examples: export GITHUB_TOKEN=ghp_...\n');
  }

  // --- Examples that work without network ---

  try {
    example1_token_resolution();
  } catch (err) {
    console.error('Example 1 failed:', err.message);
  }

  try {
    example4_input_validation();
  } catch (err) {
    console.error('Example 4 failed:', err.message);
  }

  try {
    example5_error_handling();
  } catch (err) {
    console.error('Example 5 failed:', err.message);
  }

  try {
    example7_rate_limit_awareness();
  } catch (err) {
    console.error('Example 7 failed:', err.message);
  }

  // --- Examples that require GITHUB_TOKEN ---

  try {
    await example2_client_initialization();
  } catch (err) {
    console.error('Example 2 failed:', err.message);
  }

  if (hasToken) {
    try {
      await example3_repository_operations();
    } catch (err) {
      console.error('Example 3 failed:', err.message);
    }

    try {
      await example6_pagination();
    } catch (err) {
      console.error('Example 6 failed:', err.message);
    }
  } else {
    // Show pagination API overview even without token
    try {
      await example6_pagination();
    } catch (err) {
      console.error('Example 6 failed:', err.message);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(' Done.');
  console.log('='.repeat(70));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
