/**
 * basic-usage.mjs — Jira API SDK Examples (Node.js)
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
  // Core client
  JiraFetchClient,

  // Config
  getConfig,
  loadConfigFromEnv,
  loadConfigFromFile,
  getServerConfig,

  // Errors
  JiraApiError,
  JiraAuthenticationError,
  JiraPermissionError,
  JiraNotFoundError,
  JiraValidationError,
  JiraRateLimitError,
  JiraServerError,
  JiraNetworkError,
  JiraTimeoutError,
  JiraConfigurationError,
  SDKError,
  ErrorCode,
  createErrorFromResponse,

  // Models / Schemas
  UserSchema,
  ProjectSchema,
  IssueCreateSchema,
  issueCreateToJiraFormat,
  issueUpdateToJiraFormat,
  issueTransitionToJiraFormat,
  issueAssignmentToJiraFormat,

  // Services
  UserService,
  IssueService,
  ProjectService,

  // SDK
  JiraSDKClient,

  // Utils
  textToAdf,
  commentToAdf,

  // Logger
  createLogger,
} from '../src/index.mjs';

// Fake credentials — NOT real. HTTP calls will fail gracefully.
const DEMO_BASE_URL = 'https://demo-instance.atlassian.net';
const DEMO_EMAIL = 'demo@example.com';
const DEMO_TOKEN = 'demo_api_token_for_examples_only';


// =============================================================================
// Example 1: Configuration Loading
// =============================================================================
/**
 * Demonstrate how the SDK loads configuration from environment variables,
 * config files, and the server config helper.
 */
function example1_configurationLoading() {
  console.log('\n--- Example 1: Configuration Loading ---\n');

  const prevBaseUrl = process.env.JIRA_BASE_URL;
  const prevEmail = process.env.JIRA_EMAIL;
  const prevToken = process.env.JIRA_API_TOKEN;

  try {
    // --- Load from environment ---
    process.env.JIRA_BASE_URL = DEMO_BASE_URL;
    process.env.JIRA_EMAIL = DEMO_EMAIL;
    process.env.JIRA_API_TOKEN = DEMO_TOKEN;

    const envConfig = loadConfigFromEnv();
    console.log('loadConfigFromEnv():', JSON.stringify(envConfig, null, 2));
    console.log();

    // --- get_config priority: env > file ---
    const resolved = getConfig();
    console.log('getConfig() resolved:', resolved ? 'from env/file' : 'null');
    console.log();

    // --- Load from file (likely null in demo) ---
    const fileConfig = loadConfigFromFile();
    console.log('loadConfigFromFile():', fileConfig);
    console.log();

    // --- Server config ---
    const serverCfg = getServerConfig();
    console.log('getServerConfig():', JSON.stringify(serverCfg, null, 2));
  } finally {
    // Cleanup
    if (prevBaseUrl === undefined) { delete process.env.JIRA_BASE_URL; } else { process.env.JIRA_BASE_URL = prevBaseUrl; }
    if (prevEmail === undefined) { delete process.env.JIRA_EMAIL; } else { process.env.JIRA_EMAIL = prevEmail; }
    if (prevToken === undefined) { delete process.env.JIRA_API_TOKEN; } else { process.env.JIRA_API_TOKEN = prevToken; }
  }
}


// =============================================================================
// Example 2: Client Initialization
// =============================================================================
/**
 * Create a JiraFetchClient with explicit credentials.
 * Shows the constructor validation and auth header generation.
 */
async function example2_clientInitialization() {
  console.log('\n--- Example 2: Client Initialization ---\n');

  const client = new JiraFetchClient({
    baseUrl: DEMO_BASE_URL,
    email: DEMO_EMAIL,
    apiToken: DEMO_TOKEN,
    timeoutMs: 60_000,
  });

  console.log('JiraFetchClient created successfully:');
  console.log('  baseUrl:', client._baseUrl);
  console.log('  auth:   ', client._authHeader.slice(0, 20) + '...');
  console.log();

  // --- Attempt a real API call (will fail with demo credentials) ---
  console.log('Attempting client.get(\'/rest/api/3/myself\'):');
  try {
    const result = await client.get('/rest/api/3/myself');
    console.log('  Result:', result);
  } catch (err) {
    if (err instanceof JiraAuthenticationError) {
      console.log('  Expected error (demo token):', err.message);
    } else if (err instanceof JiraApiError) {
      console.log('  Expected error:', err.name, '-', err.message);
    } else {
      console.log('  Connection error (expected in demo):', err.message);
    }
  }

  // --- Constructor validation ---
  console.log('\nConstructor validation:');
  try {
    new JiraFetchClient({ email: 'a', apiToken: 'b' });
  } catch (err) {
    console.log('  Missing baseUrl:', err.message);
  }
  try {
    new JiraFetchClient({ baseUrl: 'http://x', apiToken: 'b' });
  } catch (err) {
    console.log('  Missing email:  ', err.message);
  }
}


// =============================================================================
// Example 3: Error Handling
// =============================================================================
/**
 * Demonstrate the typed error hierarchy. Each error class is instantiated
 * directly to show its properties and the toJSON() format.
 */
function example3_errorHandling() {
  console.log('\n--- Example 3: Error Handling ---\n');

  const errors = [
    new JiraValidationError('Invalid project ID format'),
    new JiraAuthenticationError('Invalid API token'),
    new JiraPermissionError('No access to project ADMIN'),
    new JiraNotFoundError('Issue PROJ-999 not found'),
    new JiraRateLimitError('Too many requests', { retryAfter: 30 }),
    new JiraServerError('Jira instance unavailable', { status: 503 }),
    new JiraNetworkError('Could not reach Jira instance'),
    new JiraTimeoutError('Request timed out after 30s'),
    new JiraConfigurationError('Missing JIRA_BASE_URL'),
    new SDKError('SDK proxy server not running'),
  ];

  for (const err of errors) {
    console.log(`  ${err.name} (status=${err.status}, code=${err.code}):`);
    console.log(`    message: ${err.message}`);
    console.log(`    toJSON:  ${JSON.stringify(err.toJSON())}`);
    console.log();
  }

  // --- Hierarchy check ---
  console.log('All errors inherit from JiraApiError:');
  for (const err of errors) {
    console.log(`  ${err.name}: instanceof JiraApiError = ${err instanceof JiraApiError}`);
  }
  console.log();

  // --- createErrorFromResponse ---
  console.log('createErrorFromResponse examples:');
  for (const [status, body] of [
    [400, { message: 'Invalid field' }],
    [401, { message: 'Bad credentials' }],
    [404, { message: 'Not found' }],
    [429, { message: 'Rate limited' }],
    [500, { message: 'Internal error' }],
    [418, { errorMessages: ["I'm a teapot"] }],
    [400, null],
  ]) {
    const err = createErrorFromResponse(status, body);
    console.log(`  HTTP ${status}: ${err.name} — ${err.message}`);
  }
}


// =============================================================================
// Example 4: ADF Formatting
// =============================================================================
/**
 * Demonstrate Atlassian Document Format (ADF) conversion utilities.
 * Jira Cloud REST API v3 requires ADF for description and comment fields.
 */
function example4_adfFormatting() {
  console.log('\n--- Example 4: ADF Formatting ---\n');

  // --- textToAdf ---
  console.log('textToAdf examples:');
  for (const text of ['Hello world', 'Multi\nline text', '', null, undefined, 42]) {
    const result = textToAdf(text);
    if (result) {
      console.log(`  textToAdf(${JSON.stringify(text)}):`);
      console.log(`    ${JSON.stringify(result)}`);
    } else {
      console.log(`  textToAdf(${JSON.stringify(text)}): null`);
    }
  }
  console.log();

  // --- commentToAdf ---
  console.log('commentToAdf examples:');
  const comment = commentToAdf('This is a comment on the issue.');
  console.log('  commentToAdf("This is a comment..."):', JSON.stringify(comment, null, 4));
  console.log();
  console.log('  commentToAdf(""):', commentToAdf(''));
}


// =============================================================================
// Example 5: Models & Format Converters
// =============================================================================
/**
 * Demonstrate Zod schema parsing and Jira format conversion helpers.
 * Shows how SDK models validate data and convert to Jira REST API payloads.
 */
function example5_modelsAndConverters() {
  console.log('\n--- Example 5: Models & Format Converters ---\n');

  // --- User schema parsing ---
  console.log('UserSchema.parse:');
  const user = UserSchema.parse({
    accountId: 'abc123',
    displayName: 'John Doe',
    emailAddress: 'john@example.com',
    active: true,
  });
  console.log('  Parsed user:', JSON.stringify(user, null, 2));
  console.log();

  // --- IssueCreate to Jira format ---
  console.log('issueCreateToJiraFormat:');
  const createPayload = issueCreateToJiraFormat({
    projectId: '10001',
    summary: 'Fix login timeout',
    issueTypeId: '10002',
    description: 'Users experience timeout after 30s on the login page.',
    priorityId: '2',
    assigneeAccountId: 'abc123',
    labels: ['bug', 'frontend'],
  });
  console.log('  Jira payload:', JSON.stringify(createPayload, null, 2));
  console.log();

  // --- IssueUpdate to Jira format ---
  console.log('issueUpdateToJiraFormat:');
  const updatePayload = issueUpdateToJiraFormat({
    summary: 'Updated title',
    description: 'New description text',
    labelsAdd: ['urgent'],
    labelsRemove: ['backlog'],
  });
  console.log('  Update payload:', JSON.stringify(updatePayload, null, 2));
  console.log();

  // --- Transition to Jira format ---
  console.log('issueTransitionToJiraFormat:');
  const transitionPayload = issueTransitionToJiraFormat({
    transitionId: '31',
    comment: 'Closing this issue — verified fix.',
    resolutionName: 'Fixed',
  });
  console.log('  Transition payload:', JSON.stringify(transitionPayload, null, 2));
  console.log();

  // --- Assignment to Jira format ---
  console.log('issueAssignmentToJiraFormat:');
  console.log('  Assign:', JSON.stringify(issueAssignmentToJiraFormat({ accountId: 'abc123' })));
  console.log('  Unassign:', JSON.stringify(issueAssignmentToJiraFormat({ accountId: null })));
}


// =============================================================================
// Example 6: Service Layer
// =============================================================================
/**
 * Demonstrate the service layer (UserService, IssueService, ProjectService).
 * Services provide high-level operations on top of the raw client.
 */
async function example6_serviceLayer() {
  console.log('\n--- Example 6: Service Layer ---\n');

  const client = new JiraFetchClient({
    baseUrl: DEMO_BASE_URL,
    email: DEMO_EMAIL,
    apiToken: DEMO_TOKEN,
    timeoutMs: 5_000,
  });

  const userSvc = new UserService(client);
  const issueSvc = new IssueService(client);
  const projectSvc = new ProjectService(client);

  console.log('Services created: UserService, IssueService, ProjectService');
  console.log();

  // --- UserService ---
  console.log('UserService.searchUsers("john"):');
  try {
    const users = await userSvc.searchUsers('john', 5);
    console.log('  Found:', users.length, 'users');
  } catch (err) {
    console.log('  Expected error:', err.constructor?.name || 'Error', '-', err.message);
  }
  console.log();

  // --- IssueService ---
  console.log('IssueService.getIssue("PROJ-1"):');
  try {
    const issue = await issueSvc.getIssue('PROJ-1');
    console.log('  Issue:', issue);
  } catch (err) {
    console.log('  Expected error:', err.constructor?.name || 'Error', '-', err.message);
  }
  console.log();

  // --- ProjectService ---
  console.log('ProjectService.getProject("PROJ"):');
  try {
    const project = await projectSvc.getProject('PROJ');
    console.log('  Project:', project);
  } catch (err) {
    console.log('  Expected error:', err.constructor?.name || 'Error', '-', err.message);
  }
  console.log();

  // --- Available service methods ---
  console.log('Available service methods:');
  console.log('  UserService:');
  console.log('    - getUserById(accountId)');
  console.log('    - getUserByEmail(email)');
  console.log('    - searchUsers(query, maxResults)');
  console.log('    - findAssignableUsers(projectKeys, query)');
  console.log('    - getUserByIdentifier(identifier)');
  console.log('  IssueService:');
  console.log('    - createIssue({ projectId, summary, issueTypeId, ... })');
  console.log('    - createIssueByTypeName({ projectKey, summary, issueTypeName, ... })');
  console.log('    - getIssue(issueKey)');
  console.log('    - updateIssueSummary(issueKey, summary)');
  console.log('    - updateIssueDescription(issueKey, description)');
  console.log('    - addLabels(issueKey, labels)');
  console.log('    - removeLabels(issueKey, labels)');
  console.log('    - assignIssueByEmail(issueKey, email)');
  console.log('    - unassignIssue(issueKey)');
  console.log('    - getAvailableTransitions(issueKey)');
  console.log('    - transitionIssueByName(issueKey, name, comment, resolution)');
  console.log('    - transitionIssueById(issueKey, id, comment, resolution)');
  console.log('  ProjectService:');
  console.log('    - getProject(projectKey)');
  console.log('    - getProjectVersions(projectKey, releasedOnly)');
  console.log('    - getReleasedVersions(projectKey)');
  console.log('    - getUnreleasedVersions(projectKey)');
  console.log('    - getVersionByName(projectKey, versionName)');
  console.log('    - createVersion({ projectKey, versionName, ... })');
  console.log('    - getIssueTypes()');
}


// =============================================================================
// Example 7: SDK Client (REST proxy)
// =============================================================================
/**
 * Demonstrate the JiraSDKClient, which talks to the REST proxy server
 * (FastAPI or Fastify) rather than directly to Jira Cloud.
 */
async function example7_sdkClient() {
  console.log('\n--- Example 7: SDK Client (REST Proxy) ---\n');

  console.log('JiraSDKClient connects to the local REST proxy server.');
  console.log('It requires the server to be running (e.g., `make dev`).');
  console.log();

  const sdk = new JiraSDKClient({
    baseUrl: 'http://localhost:8000',
    apiKey: 'my_api_key',
    timeoutMs: 5_000,
  });

  // --- Health check ---
  console.log('sdk.healthCheck():');
  try {
    const health = await sdk.healthCheck();
    console.log('  Result:', health);
  } catch (err) {
    console.log('  Expected error (server not running):', err.message);
  }
  console.log();

  // --- Search users ---
  console.log('sdk.searchUsers("john"):');
  try {
    const users = await sdk.searchUsers('john');
    console.log('  Found:', users);
  } catch (err) {
    console.log('  Expected error:', err.message);
  }
  console.log();

  // --- Get issue ---
  console.log('sdk.getIssue("PROJ-1"):');
  try {
    const issue = await sdk.getIssue('PROJ-1');
    console.log('  Issue:', issue);
  } catch (err) {
    console.log('  Expected error:', err.message);
  }
  console.log();

  // --- Available SDK methods ---
  console.log('Available JiraSDKClient methods:');
  const methods = [
    'healthCheck()',
    'searchUsers(query, maxResults)',
    'getUser(identifier)',
    'createIssue(issueData)',
    'getIssue(issueKey)',
    'updateIssue(issueKey, updateData)',
    'assignIssue(issueKey, email)',
    'getIssueTransitions(issueKey)',
    'transitionIssue(issueKey, name, comment, resolution)',
    'getProject(projectKey)',
    'getProjectVersions(projectKey, released)',
    'createProjectVersion(projectKey, name, description)',
  ];
  for (const m of methods) {
    console.log(`  - sdk.${m}`);
  }
}


// =============================================================================
// Main — Run all examples sequentially
// =============================================================================
async function main() {
  console.log('='.repeat(72));
  console.log(' Jira API SDK — Basic Usage Examples (Node.js / MJS)');
  console.log('='.repeat(72));

  try { example1_configurationLoading(); }
  catch (err) { console.error('Example 1 failed:', err.message); }

  try { await example2_clientInitialization(); }
  catch (err) { console.error('Example 2 failed:', err.message); }

  try { example3_errorHandling(); }
  catch (err) { console.error('Example 3 failed:', err.message); }

  try { example4_adfFormatting(); }
  catch (err) { console.error('Example 4 failed:', err.message); }

  try { example5_modelsAndConverters(); }
  catch (err) { console.error('Example 5 failed:', err.message); }

  try { await example6_serviceLayer(); }
  catch (err) { console.error('Example 6 failed:', err.message); }

  try { await example7_sdkClient(); }
  catch (err) { console.error('Example 7 failed:', err.message); }

  console.log('\n' + '='.repeat(72));
  console.log(' All examples complete.');
  console.log('='.repeat(72));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
