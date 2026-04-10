/**
 * basic-usage.mjs — Figma API SDK Examples (Node.js)
 *
 * Self-contained demo script showcasing the core features of the SDK.
 * Each exampleX_name() function is independent and can be run in isolation.
 *
 * NOTE: This is a demonstration script. It sets a fake token so that client
 * construction succeeds, and wraps all network-bound calls in try/catch to
 * illustrate the API surface without making real HTTP requests.
 *
 * Usage:
 *   node examples/basic-usage.mjs
 */

import {
  // Core
  FigmaClient,
  createLogger,

  // Config
  loadConfig,
  DEFAULTS,

  // Auth
  resolveToken,
  maskToken,
  AuthError,

  // Errors
  FigmaError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ApiError,
  ServerError,
  NetworkError,
  TimeoutError,
  ConfigurationError,

  // Cache
  RequestCache,

  // Domain clients
  FilesClient,
  ProjectsClient,
  CommentsClient,
  ComponentsClient,
  VariablesClient,
  WebhooksClient,

  // Rate limiting
  parseRateLimitHeaders,

  // Retry
  calculateBackoff,
  isRetryable,
} from '../src/index.mjs';

// Fake token used throughout examples so FigmaClient construction succeeds.
const DEMO_TOKEN = 'figd_demo_token_for_examples_only';


// =============================================================================
// Example 1: Client Initialization
// =============================================================================
/**
 * Demonstrates creating a FigmaClient with an explicit token and custom
 * options (timeout, cache size, maxRetries). Prints the resolved
 * configuration and initial stats object.
 */
function example1_clientInitialization() {
  console.log('\n--- Example 1: Client Initialization ---\n');

  // Setup — set a fake token in the environment as a fallback.
  const prevToken = process.env.FIGMA_TOKEN;
  process.env.FIGMA_TOKEN = DEMO_TOKEN;

  try {
    // Create a client with explicit options.
    const client = new FigmaClient({
      token: DEMO_TOKEN,
      timeout: 15000,
      maxRetries: 5,
      cache: { maxSize: 200, ttl: 600 },
      rateLimitAutoWait: true,
      rateLimitThreshold: 0,
    });

    // Inspect the stats property — starts at zero for a fresh client.
    const stats = client.stats;
    console.log('Client created successfully.');
    console.log('Stats:', JSON.stringify(stats, null, 2));
    console.log('Last rate limit info:', client.lastRateLimit);
  } finally {
    // Cleanup — restore original env.
    if (prevToken === undefined) {
      delete process.env.FIGMA_TOKEN;
    } else {
      process.env.FIGMA_TOKEN = prevToken;
    }
  }
}


// =============================================================================
// Example 2: Configuration Loading
// =============================================================================
/**
 * Demonstrates loadConfig() which reads environment variables, and DEFAULTS
 * which holds the SDK's built-in fallback values. Shows how the two relate.
 */
function example2_configurationLoading() {
  console.log('\n--- Example 2: Configuration Loading ---\n');

  // Setup — seed some env vars so loadConfig picks them up.
  const prevToken = process.env.FIGMA_TOKEN;
  const prevLogLevel = process.env.LOG_LEVEL;
  process.env.FIGMA_TOKEN = DEMO_TOKEN;
  process.env.LOG_LEVEL = 'debug';

  try {
    // Load environment-driven config.
    const config = loadConfig();
    console.log('Loaded config:', JSON.stringify(config, null, 2));

    // Inspect SDK defaults (these are compile-time constants).
    console.log('\nSDK DEFAULTS:', JSON.stringify(DEFAULTS, null, 2));

    // Highlight the relationship:
    console.log('\nDefault base URL:', DEFAULTS.baseUrl);
    console.log('Config base URL: ', config.figmaApiBaseUrl);
    console.log('Default timeout: ', DEFAULTS.timeout, 'ms');
    console.log('Config timeout:  ', config.timeout, 'ms');
  } finally {
    // Cleanup
    if (prevToken === undefined) { delete process.env.FIGMA_TOKEN; } else { process.env.FIGMA_TOKEN = prevToken; }
    if (prevLogLevel === undefined) { delete process.env.LOG_LEVEL; } else { process.env.LOG_LEVEL = prevLogLevel; }
  }
}


// =============================================================================
// Example 3: Authentication
// =============================================================================
/**
 * Demonstrates the auth utilities: resolveToken (explicit + env), maskToken
 * for safe logging, and AuthError when no token is available.
 */
function example3_authentication() {
  console.log('\n--- Example 3: Authentication ---\n');

  // Setup
  const prevToken = process.env.FIGMA_TOKEN;
  const prevAccessToken = process.env.FIGMA_ACCESS_TOKEN;

  try {
    // 3a — Resolve from an explicit parameter.
    const explicit = resolveToken('figd_explicit_abc123');
    console.log('Explicit resolve:', explicit);

    // 3b — Resolve from FIGMA_TOKEN env.
    process.env.FIGMA_TOKEN = 'figd_env_token_xyz789';
    delete process.env.FIGMA_ACCESS_TOKEN;
    const fromEnv = resolveToken();
    console.log('Env resolve:     ', fromEnv);

    // 3c — Resolve from FIGMA_ACCESS_TOKEN env (fallback).
    delete process.env.FIGMA_TOKEN;
    process.env.FIGMA_ACCESS_TOKEN = 'figd_access_token_fallback';
    const fromAccess = resolveToken();
    console.log('Access resolve:  ', fromAccess);

    // 3d — maskToken for safe logging output.
    console.log('\nMasked explicit:', maskToken('figd_explicit_abc123'));
    console.log('Masked short:   ', maskToken('short'));
    console.log('Masked empty:   ', maskToken(''));

    // 3e — AuthError when no token is available anywhere.
    delete process.env.FIGMA_TOKEN;
    delete process.env.FIGMA_ACCESS_TOKEN;
    try {
      resolveToken();
    } catch (err) {
      if (err instanceof AuthError) {
        console.log('\nAuthError caught (expected):');
        console.log('  name:   ', err.name);
        console.log('  message:', err.message);
        console.log('  status: ', err.status);
      }
    }
  } finally {
    // Cleanup
    if (prevToken === undefined) { delete process.env.FIGMA_TOKEN; } else { process.env.FIGMA_TOKEN = prevToken; }
    if (prevAccessToken === undefined) { delete process.env.FIGMA_ACCESS_TOKEN; } else { process.env.FIGMA_ACCESS_TOKEN = prevAccessToken; }
  }
}


// =============================================================================
// Example 4: Error Handling
// =============================================================================
/**
 * Demonstrates the typed error hierarchy. Each error class is instantiated
 * directly to show its properties and the toJSON() serialization format.
 * In production these are thrown by the SDK when the Figma API returns errors.
 */
async function example4_errorHandling() {
  console.log('\n--- Example 4: Error Handling ---\n');

  // Setup — no environment changes needed.

  const errors = [
    new NotFoundError('File abc123 not found', { fileKey: 'abc123' }),
    new AuthenticationError('Invalid API token'),
    new AuthorizationError('Access denied to team resource'),
    new ValidationError('Parameter "ids" is required', { param: 'ids' }),
    new RateLimitError('Rate limit exceeded', {
      rateLimitInfo: { retryAfter: 30, planTier: 'starter', rateLimitType: 'api', upgradeLink: null },
    }),
    new ServerError('Figma API internal error', { status: 500 }),
    new NetworkError('DNS resolution failed', { url: 'https://api.figma.com' }),
    new TimeoutError('Request timed out after 30000ms', { url: '/v1/files/abc', method: 'GET' }),
    new ConfigurationError('Missing required option: token'),
    new ApiError('Bad request', { status: 400 }),
  ];

  for (const err of errors) {
    console.log(`\n${err.name}:`);
    console.log('  message:', err.message);
    console.log('  status: ', err.status);
    console.log('  code:   ', err.code);

    // All FigmaError subclasses support toJSON().
    console.log('  toJSON():', JSON.stringify(err.toJSON(), null, 4));

    // instanceof checks work through the hierarchy.
    console.log('  instanceof FigmaError:', err instanceof FigmaError);
  }

  // Demonstrate try/catch pattern used with client.get().
  console.log('\n-- Simulated client.get() error catch pattern --');
  const prevToken = process.env.FIGMA_TOKEN;
  process.env.FIGMA_TOKEN = DEMO_TOKEN;

  try {
    const client = new FigmaClient({ token: DEMO_TOKEN });

    try {
      // This will fail because there is no real Figma API server.
      await client.get('/v1/files/nonexistent');
    } catch (err) {
      if (err instanceof NotFoundError) {
        console.log('  Caught NotFoundError:', err.message);
      } else if (err instanceof AuthenticationError) {
        console.log('  Caught AuthenticationError:', err.message);
      } else if (err instanceof RateLimitError) {
        console.log('  Caught RateLimitError — retry after', err.rateLimitInfo?.retryAfter, 's');
      } else if (err instanceof FigmaError) {
        console.log('  Caught FigmaError:', err.name, '-', err.message);
      } else {
        console.log('  Caught unexpected error (network/DNS expected in demo):', err.message);
      }
    }
  } finally {
    if (prevToken === undefined) { delete process.env.FIGMA_TOKEN; } else { process.env.FIGMA_TOKEN = prevToken; }
  }
}


// =============================================================================
// Example 5: Caching
// =============================================================================
/**
 * Demonstrates the RequestCache: set/get/has, stats tracking, LRU eviction
 * when maxSize is reached, and TTL-based expiration.
 */
function example5_caching() {
  console.log('\n--- Example 5: Caching ---\n');

  // Setup — create a small cache for easy eviction demo.
  const cache = new RequestCache({ maxSize: 3, ttl: 2 });

  // 5a — Basic set / get / has.
  cache.set('/v1/files/aaa', { name: 'Design System' });
  cache.set('/v1/files/bbb', { name: 'Marketing Page' });

  console.log('has /v1/files/aaa:', cache.has('/v1/files/aaa'));
  console.log('get /v1/files/aaa:', cache.get('/v1/files/aaa'));
  console.log('has /v1/files/ccc:', cache.has('/v1/files/ccc'));
  console.log('get /v1/files/ccc:', cache.get('/v1/files/ccc'));

  // 5b — Stats after some hits and misses.
  console.log('\nStats after hits/misses:', cache.stats);

  // 5c — LRU eviction: cache holds 3, adding a 4th evicts the oldest.
  cache.set('/v1/files/ccc', { name: 'App Screens' });
  console.log('\nAfter adding 3rd entry (at capacity):', cache.stats);

  cache.set('/v1/files/ddd', { name: 'Wireframes' });
  console.log('After adding 4th entry (evicted oldest):');
  console.log('  has /v1/files/aaa (evicted):', cache.has('/v1/files/aaa'));
  console.log('  has /v1/files/bbb (still):  ', cache.has('/v1/files/bbb'));
  console.log('  has /v1/files/ddd (new):    ', cache.has('/v1/files/ddd'));
  console.log('  stats:', cache.stats);

  // 5d — Clear resets the cache.
  cache.clear();
  console.log('\nAfter clear:', cache.stats);

  // 5e — TTL expiration note (ttl=2s, would need async wait to demonstrate).
  console.log('\nNote: cache TTL is set to 2 seconds. Entries older than that');
  console.log('are automatically pruned on the next get() or has() call.');

  // Cleanup — cache is local, garbage collected.
}


// =============================================================================
// Example 6: Domain Clients
// =============================================================================
/**
 * Demonstrates creating domain clients (FilesClient, ProjectsClient,
 * CommentsClient, ComponentsClient, VariablesClient, WebhooksClient) and
 * invoking their methods. Since there is no real API, each call is wrapped
 * in try/catch to show the intended usage pattern.
 */
async function example6_domainClients() {
  console.log('\n--- Example 6: Domain Clients ---\n');

  // Setup
  const prevToken = process.env.FIGMA_TOKEN;
  process.env.FIGMA_TOKEN = DEMO_TOKEN;

  try {
    const client = new FigmaClient({ token: DEMO_TOKEN, timeout: 5000, maxRetries: 0 });

    // Instantiate domain clients.
    const files = new FilesClient(client);
    const projects = new ProjectsClient(client);
    const comments = new CommentsClient(client);
    const components = new ComponentsClient(client);
    const variables = new VariablesClient(client);
    const webhooks = new WebhooksClient(client);

    console.log('Domain clients created: FilesClient, ProjectsClient, CommentsClient,');
    console.log('  ComponentsClient, VariablesClient, WebhooksClient\n');

    // 6a — FilesClient.getFile
    try {
      console.log('Calling files.getFile("abc123", { depth: 2 }) ...');
      await files.getFile('abc123', { depth: 2 });
    } catch (err) {
      console.log('  Expected error (no real API):', err.constructor.name, '-', err.message, '\n');
    }

    // 6b — FilesClient.getFileNodes
    try {
      console.log('Calling files.getFileNodes("abc123", "1:2,3:4") ...');
      await files.getFileNodes('abc123', '1:2,3:4');
    } catch (err) {
      console.log('  Expected error:', err.constructor.name, '-', err.message, '\n');
    }

    // 6c — FilesClient.getImages
    try {
      console.log('Calling files.getImages("abc123", "1:2", { format: "png", scale: 2 }) ...');
      await files.getImages('abc123', '1:2', { format: 'png', scale: 2 });
    } catch (err) {
      console.log('  Expected error:', err.constructor.name, '-', err.message, '\n');
    }

    // 6d — ProjectsClient.getTeamProjects
    try {
      console.log('Calling projects.getTeamProjects("team_123") ...');
      await projects.getTeamProjects('team_123');
    } catch (err) {
      console.log('  Expected error:', err.constructor.name, '-', err.message, '\n');
    }

    // 6e — ProjectsClient.getProjectFiles
    try {
      console.log('Calling projects.getProjectFiles("proj_456", { branchData: true }) ...');
      await projects.getProjectFiles('proj_456', { branchData: true });
    } catch (err) {
      console.log('  Expected error:', err.constructor.name, '-', err.message, '\n');
    }

    // 6f — CommentsClient.listComments
    try {
      console.log('Calling comments.listComments("abc123", { as_md: true }) ...');
      await comments.listComments('abc123', { as_md: true });
    } catch (err) {
      console.log('  Expected error:', err.constructor.name, '-', err.message, '\n');
    }

    // 6g — CommentsClient.addComment
    try {
      console.log('Calling comments.addComment("abc123", { message: "Great work!" }) ...');
      await comments.addComment('abc123', { message: 'Great work!' });
    } catch (err) {
      console.log('  Expected error:', err.constructor.name, '-', err.message, '\n');
    }

    // 6h — ComponentsClient.getFileComponents
    try {
      console.log('Calling components.getFileComponents("abc123") ...');
      await components.getFileComponents('abc123');
    } catch (err) {
      console.log('  Expected error:', err.constructor.name, '-', err.message, '\n');
    }

    // 6i — VariablesClient.getLocalVariables
    try {
      console.log('Calling variables.getLocalVariables("abc123") ...');
      await variables.getLocalVariables('abc123');
    } catch (err) {
      console.log('  Expected error:', err.constructor.name, '-', err.message, '\n');
    }

    // 6j — WebhooksClient.listTeamWebhooks
    try {
      console.log('Calling webhooks.listTeamWebhooks("team_123") ...');
      await webhooks.listTeamWebhooks('team_123');
    } catch (err) {
      console.log('  Expected error:', err.constructor.name, '-', err.message, '\n');
    }

    console.log('Client stats after domain calls:', JSON.stringify(client.stats, null, 2));
  } finally {
    // Cleanup
    if (prevToken === undefined) { delete process.env.FIGMA_TOKEN; } else { process.env.FIGMA_TOKEN = prevToken; }
  }
}


// =============================================================================
// Example 7: Rate Limit Handling
// =============================================================================
/**
 * Demonstrates rate limit utilities: the onRateLimit callback, auto-wait
 * configuration, and parseRateLimitHeaders for extracting info from mock
 * 429 response headers.
 */
function example7_rateLimitHandling() {
  console.log('\n--- Example 7: Rate Limit Handling ---\n');

  // Setup
  const prevToken = process.env.FIGMA_TOKEN;
  process.env.FIGMA_TOKEN = DEMO_TOKEN;

  try {
    // 7a — Create a client with an onRateLimit callback.
    const rateLimitEvents = [];
    const client = new FigmaClient({
      token: DEMO_TOKEN,
      rateLimitAutoWait: true,
      rateLimitThreshold: 0,
      onRateLimit: (info) => {
        rateLimitEvents.push(info);
        console.log('  onRateLimit callback fired:', JSON.stringify(info, null, 4));
        // Return false to prevent auto-wait, or true / undefined to allow it.
        return false;
      },
    });

    console.log('Client created with onRateLimit callback.');
    console.log('rateLimitAutoWait: true');
    console.log('rateLimitThreshold: 0\n');

    // 7b — Parse mock 429 headers.
    console.log('-- Parsing mock rate limit headers --\n');

    const mockHeaders1 = {
      'retry-after': '30',
      'x-figma-plan-tier': 'starter',
      'x-figma-rate-limit-type': 'api',
      'x-figma-upgrade-link': 'https://www.figma.com/pricing',
    };

    const info1 = parseRateLimitHeaders(mockHeaders1);
    console.log('Mock headers (full):', JSON.stringify(mockHeaders1, null, 2));
    console.log('Parsed info:        ', JSON.stringify(info1, null, 2));

    const mockHeaders2 = {
      'retry-after': '5',
    };

    const info2 = parseRateLimitHeaders(mockHeaders2);
    console.log('\nMock headers (minimal):', JSON.stringify(mockHeaders2, null, 2));
    console.log('Parsed info:           ', JSON.stringify(info2, null, 2));

    // 7c — Headers with no retry-after (defaults to 60).
    const info3 = parseRateLimitHeaders({});
    console.log('\nEmpty headers parsed:', JSON.stringify(info3, null, 2));
    console.log('(retry-after defaults to 60 seconds)\n');

    console.log('Rate limit events captured:', rateLimitEvents.length);
    console.log('(No actual 429 occurred in this demo, so the array is empty.)');
  } finally {
    // Cleanup
    if (prevToken === undefined) { delete process.env.FIGMA_TOKEN; } else { process.env.FIGMA_TOKEN = prevToken; }
  }
}


// =============================================================================
// Example 8: Retry Logic
// =============================================================================
/**
 * Demonstrates the retry utilities: calculateBackoff for exponential backoff
 * with jitter across different attempt numbers, and isRetryable for
 * determining which HTTP status codes trigger a retry.
 */
function example8_retryLogic() {
  console.log('\n--- Example 8: Retry Logic ---\n');

  // Setup — no environment changes needed.

  // 8a — calculateBackoff for sequential attempts.
  console.log('-- Backoff delay by attempt (default initialWait=1000ms, maxWait=30000ms) --\n');
  for (let attempt = 0; attempt < 6; attempt++) {
    const delay = calculateBackoff(attempt);
    console.log(`  Attempt ${attempt}: ~${Math.round(delay)}ms`);
  }

  // 8b — calculateBackoff with custom initial/max wait.
  console.log('\n-- Backoff with custom params (initialWait=500ms, maxWait=10000ms) --\n');
  for (let attempt = 0; attempt < 6; attempt++) {
    const delay = calculateBackoff(attempt, 500, 10000);
    console.log(`  Attempt ${attempt}: ~${Math.round(delay)}ms`);
  }

  // 8c — isRetryable for common HTTP status codes.
  console.log('\n-- isRetryable for various HTTP status codes --\n');
  const statusCodes = [200, 400, 401, 403, 404, 422, 429, 500, 502, 503, 504];
  for (const status of statusCodes) {
    console.log(`  HTTP ${status}: retryable=${isRetryable(status)}`);
  }

  console.log('\nNote: 429 (rate limit) is handled separately by the rate-limit module,');
  console.log('not by the generic retry logic. isRetryable returns false for 429.');
  console.log('Only 5xx server errors trigger exponential backoff retries.');

  // Cleanup — nothing to clean up.
}


// =============================================================================
// Main — Run all examples sequentially
// =============================================================================
async function main() {
  console.log('='.repeat(78));
  console.log(' Figma API SDK — Basic Usage Examples (Node.js / MJS)');
  console.log('='.repeat(78));

  try {
    example1_clientInitialization();
  } catch (err) {
    console.error('Example 1 failed:', err.message);
  }

  try {
    example2_configurationLoading();
  } catch (err) {
    console.error('Example 2 failed:', err.message);
  }

  try {
    example3_authentication();
  } catch (err) {
    console.error('Example 3 failed:', err.message);
  }

  try {
    await example4_errorHandling();
  } catch (err) {
    console.error('Example 4 failed:', err.message);
  }

  try {
    example5_caching();
  } catch (err) {
    console.error('Example 5 failed:', err.message);
  }

  try {
    await example6_domainClients();
  } catch (err) {
    console.error('Example 6 failed:', err.message);
  }

  try {
    example7_rateLimitHandling();
  } catch (err) {
    console.error('Example 7 failed:', err.message);
  }

  try {
    example8_retryLogic();
  } catch (err) {
    console.error('Example 8 failed:', err.message);
  }

  console.log('\n' + '='.repeat(78));
  console.log(' All examples complete.');
  console.log('='.repeat(78));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
