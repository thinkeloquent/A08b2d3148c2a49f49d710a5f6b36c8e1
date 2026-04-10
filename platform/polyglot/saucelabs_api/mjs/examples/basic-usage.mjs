/**
 * basic-usage.mjs — Sauce Labs API SDK Examples (Node.js)
 *
 * Self-contained demo script showcasing the core features of the SDK.
 * Each exampleX_name() function is independent and can be run in isolation.
 *
 * NOTE: This is a demonstration script. It sets fake credentials so that
 * client construction succeeds, and wraps all network-bound calls in
 * try/catch to illustrate the API surface without making real HTTP requests.
 *
 * Usage:
 *   node examples/basic-usage.mjs
 */

import {
  // Core
  SaucelabsClient,
  createSaucelabsClient,

  // Config
  resolveConfig,
  resolveCoreBaseUrl,
  resolveMobileBaseUrl,

  // Errors
  SaucelabsError,
  SaucelabsAuthError,
  SaucelabsNotFoundError,
  SaucelabsRateLimitError,
  SaucelabsValidationError,
  SaucelabsServerError,
  SaucelabsConfigError,
  createErrorFromResponse,

  // Rate limiting
  parseRetryAfter,
  buildRateLimitInfo,
  calculateBackoff,

  // Logger
  createLogger,

  // Types & constants
  DEFAULT_BASE_URL,
  DEFAULT_MOBILE_BASE_URL,
  DEFAULT_TIMEOUT,
  CORE_REGIONS,
  MOBILE_REGIONS,
  AUTOMATION_API_VALUES,

  // Domain modules
  JobsModule,
  PlatformModule,
  UsersModule,
  UploadModule,
} from '../src/index.mjs';

// Fake credentials used throughout examples so SaucelabsClient construction succeeds.
const DEMO_USERNAME = 'demo_user';
const DEMO_API_KEY = 'demo_access_key_00000000';


// =============================================================================
// Example 1: Client Initialization
// =============================================================================
/**
 * Demonstrates creating a SaucelabsClient with explicit credentials and
 * custom options. Prints the resolved configuration.
 */
function example1_clientInitialization() {
  console.log('\n--- Example 1: Client Initialization ---\n');

  const prevUser = process.env.SAUCE_USERNAME;
  const prevKey = process.env.SAUCE_ACCESS_KEY;
  process.env.SAUCE_USERNAME = DEMO_USERNAME;
  process.env.SAUCE_ACCESS_KEY = DEMO_API_KEY;
  process.env.LOG_LEVEL = 'silent';

  try {
    // Create a client with explicit options.
    const client = new SaucelabsClient({
      username: DEMO_USERNAME,
      apiKey: DEMO_API_KEY,
      region: 'us-west-1',
      timeout: 15000,
      rateLimitAutoWait: true,
    });

    console.log('Client created successfully.');
    console.log('  username:', client.username);
    console.log('  lastRateLimit:', client.lastRateLimit);

    client.close();
  } finally {
    if (prevUser === undefined) { delete process.env.SAUCE_USERNAME; } else { process.env.SAUCE_USERNAME = prevUser; }
    if (prevKey === undefined) { delete process.env.SAUCE_ACCESS_KEY; } else { process.env.SAUCE_ACCESS_KEY = prevKey; }
  }
}


// =============================================================================
// Example 2: Configuration Resolution
// =============================================================================
/**
 * Demonstrates resolveConfig(), resolveCoreBaseUrl(), and resolveMobileBaseUrl().
 * Shows how the SDK loads configuration from environment variables and explicit
 * overrides, and how different regions map to different API base URLs.
 */
function example2_configurationResolution() {
  console.log('\n--- Example 2: Configuration Resolution ---\n');

  const prevUser = process.env.SAUCE_USERNAME;
  const prevKey = process.env.SAUCE_ACCESS_KEY;
  process.env.SAUCE_USERNAME = DEMO_USERNAME;
  process.env.SAUCE_ACCESS_KEY = DEMO_API_KEY;
  process.env.LOG_LEVEL = 'silent';

  try {
    // 2a — Default configuration from environment.
    const defaultConfig = resolveConfig();
    console.log('Default config from env:');
    console.log('  username: ', defaultConfig.username);
    console.log('  baseUrl:  ', defaultConfig.baseUrl);
    console.log('  mobileUrl:', defaultConfig.mobileBaseUrl);
    console.log('  timeout:  ', defaultConfig.timeout, 'ms');
    console.log('  autoWait: ', defaultConfig.rateLimitAutoWait);
    console.log();

    // 2b — EU region override.
    const euConfig = resolveConfig({ region: 'eu-central-1' });
    console.log('EU region config:');
    console.log('  baseUrl:  ', euConfig.baseUrl);
    console.log('  mobileUrl:', euConfig.mobileBaseUrl);
    console.log();

    // 2c — Direct URL resolution.
    console.log('Core region URLs:');
    for (const [name, url] of Object.entries(CORE_REGIONS)) {
      console.log(`  ${name}: ${url}`);
    }
    console.log();

    console.log('Mobile region URLs:');
    for (const [name, url] of Object.entries(MOBILE_REGIONS)) {
      console.log(`  ${name}: ${url}`);
    }
    console.log();

    // 2d — Custom base URL override.
    const customUrl = resolveCoreBaseUrl('us-west-1', 'https://custom-proxy.example.com/');
    console.log('Custom base URL override:', customUrl);

    // 2e — SDK defaults.
    console.log('\nSDK defaults:');
    console.log('  DEFAULT_BASE_URL:       ', DEFAULT_BASE_URL);
    console.log('  DEFAULT_MOBILE_BASE_URL:', DEFAULT_MOBILE_BASE_URL);
    console.log('  DEFAULT_TIMEOUT:        ', DEFAULT_TIMEOUT, 'ms');
  } finally {
    if (prevUser === undefined) { delete process.env.SAUCE_USERNAME; } else { process.env.SAUCE_USERNAME = prevUser; }
    if (prevKey === undefined) { delete process.env.SAUCE_ACCESS_KEY; } else { process.env.SAUCE_ACCESS_KEY = prevKey; }
  }
}


// =============================================================================
// Example 3: Error Handling
// =============================================================================
/**
 * Demonstrates the typed error hierarchy. Each error class is instantiated
 * directly to show its properties and the toJSON() serialization format.
 * In production these are thrown by the SDK when the API returns errors.
 */
async function example3_errorHandling() {
  console.log('\n--- Example 3: Error Handling ---\n');

  // 3a — Demonstrate each error type.
  const errors = [
    new SaucelabsAuthError('Invalid credentials', { statusCode: 401 }),
    new SaucelabsNotFoundError('Job abc123 not found', { statusCode: 404 }),
    new SaucelabsRateLimitError('Rate limit exceeded', { retryAfter: 30 }),
    new SaucelabsValidationError('Invalid parameter: limit must be > 0', { statusCode: 400 }),
    new SaucelabsServerError('Internal server error', { statusCode: 500 }),
    new SaucelabsConfigError('Missing SAUCE_USERNAME environment variable'),
  ];

  for (const err of errors) {
    console.log(`${err.name}:`);
    console.log('  message:   ', err.message);
    console.log('  statusCode:', err.statusCode);
    console.log('  toJSON():  ', JSON.stringify(err.toJSON(), null, 4));
    console.log('  instanceof SaucelabsError:', err instanceof SaucelabsError);
    console.log();
  }

  // 3b — Demonstrate createErrorFromResponse factory.
  console.log('-- createErrorFromResponse factory --\n');

  const err401 = createErrorFromResponse(401, { message: 'Unauthorized' }, {});
  console.log('401 ->', err401.name, ':', err401.message);

  const err429 = createErrorFromResponse(429, { message: 'Too many requests' }, { 'retry-after': '60' });
  console.log('429 ->', err429.name, ': retryAfter =', err429.retryAfter, 's');

  const err500 = createErrorFromResponse(500, { message: 'Server error' }, {});
  console.log('500 ->', err500.name, ':', err500.message);
  console.log();

  // 3c — Try/catch pattern with a real client.
  process.env.SAUCE_USERNAME = DEMO_USERNAME;
  process.env.SAUCE_ACCESS_KEY = DEMO_API_KEY;
  process.env.LOG_LEVEL = 'silent';

  const client = new SaucelabsClient({
    username: DEMO_USERNAME,
    apiKey: DEMO_API_KEY,
    timeout: 3000,
  });

  try {
    console.log('-- Simulated client.get() error catch pattern --\n');
    await client.get('/rest/v1/demo_user/jobs');
  } catch (err) {
    if (err instanceof SaucelabsAuthError) {
      console.log('  Caught SaucelabsAuthError:', err.message);
    } else if (err instanceof SaucelabsNotFoundError) {
      console.log('  Caught SaucelabsNotFoundError:', err.message);
    } else if (err instanceof SaucelabsRateLimitError) {
      console.log('  Caught SaucelabsRateLimitError: retry after', err.retryAfter, 's');
    } else if (err instanceof SaucelabsError) {
      console.log('  Caught SaucelabsError:', err.name, '-', err.message);
    } else {
      console.log('  Caught unexpected error (network expected in demo):', err.message);
    }
  } finally {
    client.close();
  }
}


// =============================================================================
// Example 4: Convenience Factory
// =============================================================================
/**
 * Demonstrates createSaucelabsClient() which creates a SaucelabsClient with
 * all domain modules (jobs, platform, users, upload) pre-attached.
 */
function example4_convenienceFactory() {
  console.log('\n--- Example 4: Convenience Factory ---\n');

  process.env.SAUCE_USERNAME = DEMO_USERNAME;
  process.env.SAUCE_ACCESS_KEY = DEMO_API_KEY;
  process.env.LOG_LEVEL = 'silent';

  const client = createSaucelabsClient({
    username: DEMO_USERNAME,
    apiKey: DEMO_API_KEY,
    region: 'us-west-1',
  });

  console.log('Client created via createSaucelabsClient():');
  console.log('  username:    ', client.username);
  console.log('  client.jobs: ', client.jobs instanceof JobsModule);
  console.log('  client.platform:', client.platform instanceof PlatformModule);
  console.log('  client.users:', client.users instanceof UsersModule);
  console.log('  client.upload:', client.upload instanceof UploadModule);

  client.close();
}


// =============================================================================
// Example 5: Domain Modules
// =============================================================================
/**
 * Demonstrates creating domain modules (JobsModule, PlatformModule,
 * UsersModule) and invoking their methods. Since there is no real API,
 * each call is wrapped in try/catch.
 */
async function example5_domainModules() {
  console.log('\n--- Example 5: Domain Modules ---\n');

  process.env.SAUCE_USERNAME = DEMO_USERNAME;
  process.env.SAUCE_ACCESS_KEY = DEMO_API_KEY;
  process.env.LOG_LEVEL = 'silent';

  const client = createSaucelabsClient({
    username: DEMO_USERNAME,
    apiKey: DEMO_API_KEY,
    timeout: 3000,
  });

  // 5a — JobsModule: list jobs
  try {
    console.log('Calling client.jobs.list({ limit: 5 }) ...');
    await client.jobs.list({ limit: 5 });
  } catch (err) {
    console.log('  Expected error (no real API):', err.constructor.name, '-', err.message, '\n');
  }

  // 5b — JobsModule: get a specific job
  try {
    console.log('Calling client.jobs.get("abc123def456") ...');
    await client.jobs.get('abc123def456');
  } catch (err) {
    console.log('  Expected error:', err.constructor.name, '-', err.message, '\n');
  }

  // 5c — PlatformModule: get service status (public, no auth needed)
  try {
    console.log('Calling client.platform.getStatus() ...');
    await client.platform.getStatus();
  } catch (err) {
    console.log('  Expected error:', err.constructor.name, '-', err.message, '\n');
  }

  // 5d — PlatformModule: get supported platforms
  try {
    console.log('Calling client.platform.getPlatforms("appium") ...');
    await client.platform.getPlatforms('appium');
  } catch (err) {
    console.log('  Expected error:', err.constructor.name, '-', err.message, '\n');
  }

  // 5e — UsersModule: get user info
  try {
    console.log('Calling client.users.getUser() ...');
    await client.users.getUser();
  } catch (err) {
    console.log('  Expected error:', err.constructor.name, '-', err.message, '\n');
  }

  // 5f — UsersModule: get concurrency
  try {
    console.log('Calling client.users.getConcurrency() ...');
    await client.users.getConcurrency();
  } catch (err) {
    console.log('  Expected error:', err.constructor.name, '-', err.message, '\n');
  }

  // 5g — Validation: invalid automation API
  try {
    console.log('Calling client.platform.getPlatforms("invalid") ...');
    await client.platform.getPlatforms('invalid');
  } catch (err) {
    console.log('  Validation error (expected):', err.constructor.name, '-', err.message, '\n');
  }

  console.log('Valid automation API values:', AUTOMATION_API_VALUES.join(', '));

  client.close();
}


// =============================================================================
// Example 6: Rate Limit Handling
// =============================================================================
/**
 * Demonstrates rate limit utilities: parseRetryAfter for extracting wait
 * times from headers, buildRateLimitInfo for constructing rate limit state,
 * and calculateBackoff for exponential backoff with jitter.
 */
function example6_rateLimitHandling() {
  console.log('\n--- Example 6: Rate Limit Handling ---\n');

  // 6a — parseRetryAfter with various inputs.
  console.log('-- parseRetryAfter --\n');
  console.log('  parseRetryAfter("30"):    ', parseRetryAfter('30'));
  console.log('  parseRetryAfter("1.5"):   ', parseRetryAfter('1.5'));
  console.log('  parseRetryAfter(null):    ', parseRetryAfter(null));
  console.log('  parseRetryAfter(""):      ', parseRetryAfter(''));
  console.log();

  // 6b — buildRateLimitInfo with mock 429 response headers.
  console.log('-- buildRateLimitInfo --\n');
  const mockHeaders = {
    'retry-after': '30',
    'x-ratelimit-remaining': '0',
    'x-ratelimit-limit': '100',
    'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 60),
  };
  const info = buildRateLimitInfo(mockHeaders);
  console.log('  Mock headers:', JSON.stringify(mockHeaders, null, 2));
  console.log('  Rate limit info:');
  console.log('    retryAfter:', info.retryAfter);
  console.log('    remaining: ', info.remaining);
  console.log('    limit:     ', info.limit);
  console.log('    resetAt:   ', info.resetAt);
  console.log('    timestamp: ', info.timestamp);
  console.log();

  // 6c — calculateBackoff for exponential backoff.
  console.log('-- calculateBackoff (base=1s, max=60s) --\n');
  for (let attempt = 0; attempt < 6; attempt++) {
    const delay = calculateBackoff(attempt, 1, 60);
    console.log(`  Attempt ${attempt}: ~${delay.toFixed(1)}s`);
  }
  console.log();

  // 6d — Client with onRateLimit callback.
  process.env.SAUCE_USERNAME = DEMO_USERNAME;
  process.env.SAUCE_ACCESS_KEY = DEMO_API_KEY;
  process.env.LOG_LEVEL = 'silent';

  const client = new SaucelabsClient({
    username: DEMO_USERNAME,
    apiKey: DEMO_API_KEY,
    rateLimitAutoWait: true,
    onRateLimit: (info) => {
      console.log('  [onRateLimit callback] retryAfter:', info.retryAfter);
      return true; // allow auto-wait
    },
  });
  console.log('Client created with onRateLimit callback and rateLimitAutoWait=true.');
  client.close();
}


// =============================================================================
// Example 7: Logging
// =============================================================================
/**
 * Demonstrates the SDK logger with different levels and custom loggers.
 * Shows how sensitive data is automatically redacted.
 */
function example7_logging() {
  console.log('\n--- Example 7: Logging ---\n');

  // 7a — Create a logger with debug level.
  process.env.LOG_LEVEL = 'debug';
  const logger = createLogger('saucelabs-example', 'basic-usage');
  logger.info('this is an info message');
  logger.debug('this is a debug message');
  logger.warn('this is a warning');
  logger.error('this is an error message');
  console.log();

  // 7b — Custom logger.
  const logs = [];
  const customLogger = {
    debug: (msg) => logs.push(`[DEBUG] ${msg}`),
    info: (msg) => logs.push(`[INFO] ${msg}`),
    warn: (msg) => logs.push(`[WARN] ${msg}`),
    error: (msg) => logs.push(`[ERROR] ${msg}`),
  };

  process.env.LOG_LEVEL = 'silent';
  const client = new SaucelabsClient({
    username: DEMO_USERNAME,
    apiKey: DEMO_API_KEY,
    logger: customLogger,
  });

  console.log('Custom logger captured', logs.length, 'messages:');
  for (const line of logs) {
    console.log(' ', line);
  }

  client.close();
}


// =============================================================================
// Main — Run all examples sequentially
// =============================================================================
async function main() {
  console.log('='.repeat(72));
  console.log(' Sauce Labs API SDK — Basic Usage Examples (Node.js / MJS)');
  console.log('='.repeat(72));

  try { example1_clientInitialization(); } catch (err) { console.error('Example 1 failed:', err.message); }
  try { example2_configurationResolution(); } catch (err) { console.error('Example 2 failed:', err.message); }
  try { await example3_errorHandling(); } catch (err) { console.error('Example 3 failed:', err.message); }
  try { example4_convenienceFactory(); } catch (err) { console.error('Example 4 failed:', err.message); }
  try { await example5_domainModules(); } catch (err) { console.error('Example 5 failed:', err.message); }
  try { example6_rateLimitHandling(); } catch (err) { console.error('Example 6 failed:', err.message); }
  try { example7_logging(); } catch (err) { console.error('Example 7 failed:', err.message); }

  console.log('\n' + '='.repeat(72));
  console.log(' All examples complete.');
  console.log('='.repeat(72));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
