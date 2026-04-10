/**
 * basic-usage.mjs — Confluence API SDK Examples (Node.js)
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
  ConfluenceFetchClient,

  // Config
  getConfig,
  loadConfigFromEnv,
  getServerConfig,

  // Errors
  ConfluenceApiError,
  ConfluenceAuthenticationError,
  ConfluencePermissionError,
  ConfluenceNotFoundError,
  ConfluenceValidationError,
  ConfluenceConflictError,
  ConfluenceRateLimitError,
  ConfluenceServerError,
  ConfluenceNetworkError,
  ConfluenceTimeoutError,
  ConfluenceConfigurationError,
  SDKError,
  ErrorCode,
  createErrorFromResponse,

  // Models / Schemas
  ContentSchema,
  SpaceSchema,
  ContentCreateSchema,
  ContentUpdateSchema,
  LabelSchema,

  // Services
  ContentService,
  AttachmentService,
  SearchService,
  SpaceService,
  SpacePermissionService,
  UserService,
  GroupService,
  AdminService,
  WebhookService,
  SystemService,
  LabelService,
  ColorSchemeService,

  // SDK
  ConfluenceSdkClient,

  // Utils
  CQLBuilder,
  cql,

  // Logger
  createLogger,
  nullLogger,

  // Pagination
  paginateOffset,
  paginateCursor,
  buildExpand,
} from "../src/index.mjs";

// Fake credentials — NOT real. HTTP calls will fail gracefully.
const DEMO_BASE_URL = "https://confluence-demo.example.com";
const DEMO_USERNAME = "demo_admin";
const DEMO_TOKEN = "demo_api_token_for_examples_only";

// =============================================================================
// Example 1: Configuration Loading
// =============================================================================
/**
 * Demonstrate how the SDK loads configuration from environment variables,
 * server config, and the getConfig() priority chain.
 */
function example1_configurationLoading() {
  console.log("\n--- Example 1: Configuration Loading ---\n");

  const prevBaseUrl = process.env.CONFLUENCE_BASE_URL;
  const prevUsername = process.env.CONFLUENCE_USERNAME;
  const prevToken = process.env.CONFLUENCE_API_TOKEN;

  try {
    // --- Load from environment ---
    process.env.CONFLUENCE_BASE_URL = DEMO_BASE_URL;
    process.env.CONFLUENCE_USERNAME = DEMO_USERNAME;
    process.env.CONFLUENCE_API_TOKEN = DEMO_TOKEN;

    const envConfig = loadConfigFromEnv();
    console.log("loadConfigFromEnv():", JSON.stringify(envConfig, null, 2));
    console.log();

    // --- getConfig priority: server config > env ---
    const resolved = getConfig();
    console.log("getConfig() resolved:", resolved ? "from env" : "null");
    console.log("  baseUrl: ", resolved?.baseUrl);
    console.log("  username:", resolved?.username);
    console.log();

    // --- Server config (simulated — no server available) ---
    const serverCfg = getServerConfig({});
    console.log("getServerConfig({}):", JSON.stringify(serverCfg, null, 2));
  } finally {
    // Cleanup
    if (prevBaseUrl === undefined) {
      delete process.env.CONFLUENCE_BASE_URL;
    } else {
      process.env.CONFLUENCE_BASE_URL = prevBaseUrl;
    }
    if (prevUsername === undefined) {
      delete process.env.CONFLUENCE_USERNAME;
    } else {
      process.env.CONFLUENCE_USERNAME = prevUsername;
    }
    if (prevToken === undefined) {
      delete process.env.CONFLUENCE_API_TOKEN;
    } else {
      process.env.CONFLUENCE_API_TOKEN = prevToken;
    }
  }
}

// =============================================================================
// Example 2: Client Initialization
// =============================================================================
/**
 * Create a ConfluenceFetchClient with explicit credentials.
 * Shows the constructor validation and auth header generation.
 */
async function example2_clientInitialization() {
  console.log("\n--- Example 2: Client Initialization ---\n");

  const client = new ConfluenceFetchClient({
    baseUrl: DEMO_BASE_URL,
    username: DEMO_USERNAME,
    apiToken: DEMO_TOKEN,
    timeoutMs: 60_000,
  });

  console.log("ConfluenceFetchClient created successfully:");
  console.log("  baseUrl:", client._baseUrl);
  console.log("  auth:   ", client._authHeader.slice(0, 20) + "...");
  console.log();

  // --- Attempt a real API call (will fail with demo credentials) ---
  console.log("Attempting client.get('/rest/api/content'):");
  try {
    const result = await client.get("/rest/api/content");
    console.log("  Result:", result);
  } catch (err) {
    if (err instanceof ConfluenceAuthenticationError) {
      console.log("  Expected error (demo token):", err.message);
    } else if (err instanceof ConfluenceApiError) {
      console.log("  Expected error:", err.name, "-", err.message);
    } else {
      console.log("  Connection error (expected in demo):", err.message);
    }
  }

  // --- Constructor validation ---
  console.log("\nConstructor validation:");
  try {
    new ConfluenceFetchClient({ username: "a", apiToken: "b" });
  } catch (err) {
    console.log("  Missing baseUrl:", err.message);
  }
  try {
    new ConfluenceFetchClient({ baseUrl: "http://x", apiToken: "b" });
  } catch (err) {
    console.log("  Missing username:", err.message);
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
  console.log("\n--- Example 3: Error Handling ---\n");

  const errors = [
    new ConfluenceValidationError("Invalid page ID format"),
    new ConfluenceAuthenticationError("Invalid API token"),
    new ConfluencePermissionError("No access to space ADMIN"),
    new ConfluenceNotFoundError("Page 12345 not found"),
    new ConfluenceConflictError("Version conflict on page update"),
    new ConfluenceRateLimitError("Too many requests", { retryAfter: 30 }),
    new ConfluenceServerError("Confluence instance unavailable", {
      status: 503,
    }),
    new ConfluenceNetworkError("Could not reach Confluence instance"),
    new ConfluenceTimeoutError("Request timed out after 30s"),
    new ConfluenceConfigurationError("Missing CONFLUENCE_BASE_URL"),
    new SDKError("SDK proxy server not running"),
  ];

  for (const err of errors) {
    console.log(`  ${err.name} (status=${err.status}):`);
    console.log(`    message: ${err.message}`);
    console.log(`    toJSON:  ${JSON.stringify(err.toJSON())}`);
    console.log();
  }

  // --- Hierarchy check ---
  console.log("All errors inherit from ConfluenceApiError:");
  for (const err of errors) {
    console.log(
      `  ${err.name}: instanceof ConfluenceApiError = ${err instanceof ConfluenceApiError}`,
    );
  }
  console.log();

  // --- ErrorCode enum ---
  console.log("ErrorCode values:");
  for (const [key, value] of Object.entries(ErrorCode)) {
    console.log(`  ErrorCode.${key} = '${value}'`);
  }
  console.log();

  // --- createErrorFromResponse ---
  console.log("createErrorFromResponse examples:");
  for (const [status, body] of [
    [400, { message: "Invalid field" }],
    [401, { message: "Bad credentials" }],
    [404, { message: "Not found" }],
    [409, { message: "Version conflict" }],
    [429, { message: "Rate limited" }],
    [500, { message: "Internal error" }],
    [418, { message: "I'm a teapot" }],
    [400, null],
  ]) {
    const err = createErrorFromResponse(status, body, "/api/test", "GET");
    console.log(`  HTTP ${status}: ${err.name} — ${err.message}`);
  }

  // --- Rate limit error with retryAfter ---
  console.log("\nRate limit error with retryAfter:");
  const rateErr = new ConfluenceRateLimitError("Too many requests", {
    retryAfter: 60,
  });
  console.log(`  retryAfter: ${rateErr.retryAfter}s`);
  console.log(`  status: ${rateErr.status}`);

  // --- Error with responseData context ---
  console.log("\nError with responseData:");
  const errWithData = new ConfluenceNotFoundError("Page not found", {
    url: "/rest/api/content/99999",
    method: "GET",
    responseData: { message: "Page not found", statusCode: 404 },
  });
  console.log(`  url: ${errWithData.url}`);
  console.log(`  method: ${errWithData.method}`);
  console.log(`  responseData: ${JSON.stringify(errWithData.responseData)}`);
  console.log(`  toJSON: ${JSON.stringify(errWithData.toJSON(), null, 2)}`);
}

// =============================================================================
// Example 4: CQL Builder
// =============================================================================
/**
 * Demonstrate the CQL (Confluence Query Language) builder for constructing
 * search queries, including advanced operators and escaping.
 */
function example4_cqlBuilder() {
  console.log("\n--- Example 4: CQL Builder ---\n");

  // --- Simple query ---
  const query1 = cql("type").equals("page").build();
  console.log(`  Simple:      ${query1}`);

  // --- Multi-condition query ---
  const query2 = cql("type")
    .equals("page")
    .and()
    .field("space")
    .equals("DEV")
    .build();
  console.log(`  Two fields:  ${query2}`);

  // --- Full-text search with ordering ---
  const query3 = cql("type")
    .equals("page")
    .and()
    .field("space")
    .equals("DEV")
    .and()
    .field("title")
    .contains("architecture")
    .orderBy("lastModified", "DESC")
    .build();
  console.log(`  Full-text:   ${query3}`);

  // --- IN list ---
  const query4 = cql("space")
    .inList(["DEV", "OPS", "QA"])
    .and()
    .field("type")
    .equals("page")
    .build();
  console.log(`  IN list:     ${query4}`);

  // --- NOT contains ---
  const query5 = cql("type")
    .equals("page")
    .and()
    .field("title")
    .notContains("draft")
    .build();
  console.log(`  NOT ~:       ${query5}`);

  // --- IS NOT NULL ---
  const query6 = cql("type")
    .equals("page")
    .and()
    .field("label")
    .isNotNull()
    .build();
  console.log(`  IS NOT NULL: ${query6}`);

  // --- OR operator ---
  const query7 = cql("type")
    .equals("page")
    .or()
    .field("type")
    .equals("blogpost")
    .build();
  console.log(`  OR:          ${query7}`);

  // --- NOT IN list ---
  const query8 = cql("space")
    .notInList(["ARCHIVE", "TRASH"])
    .and()
    .field("type")
    .equals("page")
    .build();
  console.log(`  NOT IN:      ${query8}`);

  // --- IS NULL ---
  const query9 = cql("type")
    .equals("page")
    .and()
    .field("label")
    .isNull()
    .build();
  console.log(`  IS NULL:     ${query9}`);

  // --- NOT equals ---
  const query10 = cql("type")
    .equals("page")
    .and()
    .field("space")
    .notEquals("ARCHIVE")
    .build();
  console.log(`  NOT =:       ${query10}`);

  // --- Using CQLBuilder class directly ---
  const builder = new CQLBuilder();
  const query11 = builder
    .field("space")
    .equals("DEV")
    .and()
    .field("ancestor")
    .equals("12345")
    .orderBy("created", "ASC")
    .build();
  console.log(`  Builder:     ${query11}`);

  // --- Special character escaping ---
  const query12 = cql("title").contains('He said "hello"').build();
  console.log(`  Escaping:    ${query12}`);
}

// =============================================================================
// Example 5: Structured Logger
// =============================================================================
/**
 * Demonstrate the structured logger factory with context dicts,
 * log levels, and automatic redaction of sensitive keys.
 */
function example5_structuredLogger() {
  console.log("\n--- Example 5: Structured Logger ---\n");

  // --- Create a scoped logger ---
  const log = createLogger("my-app", import.meta.url);
  console.log("Logger created with createLogger('my-app', import.meta.url)");
  console.log("Output goes to stderr/console as JSON.");
  console.log();

  // --- Log at different levels ---
  console.log("Logging at different levels:");
  log.trace("trace message", { operation: "test" });
  log.debug("debug message", { operation: "test" });
  log.info("info message", { pageId: "12345", space: "DEV" });
  log.warn("warning message", { threshold: 0.9 });
  log.error("error message", { statusCode: 500, url: "/rest/api/content" });
  console.log("  (Check stderr for JSON output)");
  console.log();

  // --- Automatic redaction of sensitive keys ---
  console.log("Sensitive key redaction demo:");
  console.log(
    "  Keys matching token|secret|password|auth|credential|api_key are redacted.",
  );
  log.info("auth check", {
    username: "admin",
    apiToken: "super-secret-token",
    password: "my-password",
    authHeader: "Basic ***REDACTED***",
    credentials: { api_key: "key-12345" },
    safeField: "visible",
  });
  console.log(
    "  (In stderr output: apiToken, password, authHeader, credentials.api_key = ***REDACTED***)",
  );
  console.log();

  // --- nullLogger for silent operation ---
  console.log("nullLogger suppresses all output:");
  nullLogger.debug("this will not appear");
  nullLogger.info("this will not appear");
  nullLogger.error("this will not appear");
  console.log("  (No output produced)");
  console.log();

  // --- LOG_LEVEL environment variable ---
  console.log("LOG_LEVEL env var controls verbosity:");
  console.log("  trace  — all messages");
  console.log("  debug  — debug and above");
  console.log("  info   — info, warn, error (default)");
  console.log("  warn   — warn and error only");
  console.log("  error  — error only");
  console.log("  silent — nothing");
}

// =============================================================================
// Example 6: Zod Model Schemas
// =============================================================================
/**
 * Demonstrate Zod schema parsing for Confluence data models.
 * Shows how SDK models validate and transform incoming data.
 */
function example6_modelSchemas() {
  console.log("\n--- Example 6: Zod Model Schemas ---\n");

  // --- ContentSchema parsing ---
  console.log("ContentSchema.parse (minimal):");
  const content = ContentSchema.parse({});
  console.log("  Parsed:", JSON.stringify(content, null, 2));
  console.log();

  // --- ContentSchema with data ---
  console.log("ContentSchema.parse (full):");
  const fullContent = ContentSchema.parse({
    id: "12345",
    type: "page",
    title: "Architecture Overview",
    status: "current",
  });
  console.log("  id:", fullContent.id);
  console.log("  type:", fullContent.type);
  console.log("  title:", fullContent.title);
  console.log();

  // --- SpaceSchema ---
  console.log("SpaceSchema.parse:");
  const space = SpaceSchema.parse({
    key: "DEV",
    name: "Development",
    type: "global",
  });
  console.log("  Parsed:", JSON.stringify(space, null, 2));
  console.log();

  // --- ContentCreateSchema ---
  console.log("ContentCreateSchema.parse:");
  const createPayload = ContentCreateSchema.parse({
    type: "page",
    title: "New Architecture Page",
    space: { key: "DEV" },
    body: {
      storage: {
        value: "<p>Architecture content here.</p>",
        representation: "storage",
      },
    },
  });
  console.log("  type:", createPayload.type);
  console.log("  title:", createPayload.title);
  console.log("  space.key:", createPayload.space.key);
  console.log();

  // --- ContentUpdateSchema (with version) ---
  console.log("ContentUpdateSchema.parse:");
  const updatePayload = ContentUpdateSchema.parse({
    type: "page",
    title: "Architecture Overview (v2)",
    version: { number: 2 },
    body: {
      storage: {
        value: "<p>Updated architecture content.</p>",
        representation: "storage",
      },
    },
  });
  console.log("  version.number:", updatePayload.version?.number);
  console.log("  title:", updatePayload.title);
  console.log();

  // --- LabelSchema ---
  console.log("LabelSchema.parse:");
  const label = LabelSchema.parse({
    prefix: "global",
    name: "important",
    id: "1001",
  });
  console.log("  prefix:", label.prefix);
  console.log("  name:", label.name);
}

// =============================================================================
// Example 7: Service Layer — Content (with advanced methods)
// =============================================================================
/**
 * Demonstrate the service layer including advanced operations:
 * labels, properties, restrictions, children, and history.
 */
async function example7_serviceLayer() {
  console.log("\n--- Example 7: Service Layer — Content ---\n");

  const client = new ConfluenceFetchClient({
    baseUrl: DEMO_BASE_URL,
    username: DEMO_USERNAME,
    apiToken: DEMO_TOKEN,
    timeoutMs: 5_000,
  });

  const contentSvc = new ContentService(client);

  // --- Basic CRUD ---
  const basicOps = [
    ["getContents", () => contentSvc.getContents({ type: "page", limit: 5 })],
    [
      "getContent",
      () => contentSvc.getContent("12345", { expand: "body.storage" }),
    ],
    [
      "createContent",
      () =>
        contentSvc.createContent({
          type: "page",
          title: "New Page",
          space: { key: "DEV" },
          body: {
            storage: { value: "<p>Content</p>", representation: "storage" },
          },
        }),
    ],
    ["deleteContent", () => contentSvc.deleteContent("12345")],
  ];

  console.log("Basic CRUD operations:");
  for (const [name, fn] of basicOps) {
    try {
      const result = await fn();
      console.log(`  ${name}: ${JSON.stringify(result).slice(0, 80)}`);
    } catch (err) {
      console.log(
        `  ${name}: ${err.constructor?.name || "Error"} - ${err.message}`,
      );
    }
  }
  console.log();

  // --- Advanced operations ---
  const advancedOps = [
    ["getLabels", () => contentSvc.getLabels("12345")],
    [
      "addLabels",
      () =>
        contentSvc.addLabels("12345", [
          { prefix: "global", name: "important" },
        ]),
    ],
    ["getProperties", () => contentSvc.getProperties("12345")],
    [
      "createProperty",
      () =>
        contentSvc.createProperty("12345", {
          key: "myprop",
          value: { data: 1 },
        }),
    ],
    ["getContentHistory", () => contentSvc.getContentHistory("12345")],
    [
      "getRestrictionsByOperation",
      () => contentSvc.getRestrictionsByOperation("12345"),
    ],
    [
      "getChildContent",
      () => contentSvc.getChildContent("12345", { type: "page" }),
    ],
    ["getDescendants", () => contentSvc.getDescendants("12345")],
  ];

  console.log("Advanced operations:");
  for (const [name, fn] of advancedOps) {
    try {
      const result = await fn();
      console.log(`  ${name}: ${JSON.stringify(result).slice(0, 80)}`);
    } catch (err) {
      console.log(
        `  ${name}: ${err.constructor?.name || "Error"} - ${err.message}`,
      );
    }
  }
}

// =============================================================================
// Example 8: Service Layer — Spaces, Search, System
// =============================================================================
/**
 * Demonstrate SpaceService, SearchService, and SystemService operations
 * including advanced methods like archive and space watchers.
 */
async function example8_spaceSearchSystem() {
  console.log("\n--- Example 8: Spaces, Search, System ---\n");

  const client = new ConfluenceFetchClient({
    baseUrl: DEMO_BASE_URL,
    username: DEMO_USERNAME,
    apiToken: DEMO_TOKEN,
    timeoutMs: 5_000,
  });

  // --- SpaceService ---
  console.log("SpaceService:");
  const spaceSvc = new SpaceService(client);
  const spaceOps = [
    ["getSpaces", () => spaceSvc.getSpaces()],
    ["getSpace", () => spaceSvc.getSpace("DEV")],
    [
      "createSpace",
      () => spaceSvc.createSpace({ key: "NEW", name: "New Space" }),
    ],
    ["archiveSpace", () => spaceSvc.archiveSpace("OLD")],
    ["getSpaceProperties", () => spaceSvc.getSpaceProperties("DEV")],
    ["getSpaceWatchers", () => spaceSvc.getSpaceWatchers("DEV")],
    ["deleteSpace", () => spaceSvc.deleteSpace("OLD")],
  ];
  for (const [name, fn] of spaceOps) {
    try {
      const result = await fn();
      console.log(`  ${name}: ${JSON.stringify(result).slice(0, 80)}`);
    } catch (err) {
      console.log(
        `  ${name}: ${err.constructor?.name || "Error"} - ${err.message}`,
      );
    }
  }
  console.log();

  // --- SearchService ---
  console.log("SearchService:");
  const searchSvc = new SearchService(client);
  const searchCql = cql("type")
    .equals("page")
    .and()
    .field("space")
    .equals("DEV")
    .build();
  const searchOps = [
    ["searchContent", () => searchSvc.searchContent(searchCql, { limit: 10 })],
    ["search", () => searchSvc.search(searchCql, { limit: 25 })],
  ];
  for (const [name, fn] of searchOps) {
    try {
      const result = await fn();
      console.log(`  ${name}: ${JSON.stringify(result).slice(0, 80)}`);
    } catch (err) {
      console.log(
        `  ${name}: ${err.constructor?.name || "Error"} - ${err.message}`,
      );
    }
  }
  console.log();

  // --- SystemService ---
  console.log("SystemService:");
  const systemSvc = new SystemService(client);
  const sysOps = [
    ["getServerInfo", () => systemSvc.getServerInfo()],
    ["getInstanceMetrics", () => systemSvc.getInstanceMetrics()],
    ["getAccessMode", () => systemSvc.getAccessMode()],
  ];
  for (const [name, fn] of sysOps) {
    try {
      const result = await fn();
      console.log(`  ${name}: ${JSON.stringify(result).slice(0, 80)}`);
    } catch (err) {
      console.log(
        `  ${name}: ${err.constructor?.name || "Error"} - ${err.message}`,
      );
    }
  }
}

// =============================================================================
// Example 9: Attachment Service
// =============================================================================
/**
 * Demonstrate AttachmentService operations: list, upload, update,
 * move, and delete file attachments on content.
 */
async function example9_attachmentService() {
  console.log("\n--- Example 9: Attachment Service ---\n");

  const client = new ConfluenceFetchClient({
    baseUrl: DEMO_BASE_URL,
    username: DEMO_USERNAME,
    apiToken: DEMO_TOKEN,
    timeoutMs: 5_000,
  });

  const svc = new AttachmentService(client);

  // --- List attachments ---
  console.log('AttachmentService.getAttachments("12345"):');
  try {
    const result = await svc.getAttachments("12345", { limit: 10 });
    console.log("  Found:", result.results?.length ?? 0, "attachments");
  } catch (err) {
    console.log(
      "  Expected error:",
      err.constructor?.name || "Error",
      "-",
      err.message,
    );
  }
  console.log();

  // --- Upload attachment ---
  console.log(
    'AttachmentService.createAttachment("12345", buffer, "doc.pdf"):',
  );
  try {
    const fileBuffer = Buffer.from(
      "Example file content for attachment upload",
    );
    const result = await svc.createAttachment(
      "12345",
      fileBuffer,
      "document.pdf",
      {
        comment: "Uploaded via SDK example",
        minorEdit: false,
      },
    );
    console.log("  Uploaded:", result);
  } catch (err) {
    console.log(
      "  Expected error:",
      err.constructor?.name || "Error",
      "-",
      err.message,
    );
  }
  console.log();

  // --- Update metadata ---
  console.log(
    'AttachmentService.updateAttachmentMetadata("12345", "att-001", {...}):',
  );
  try {
    const result = await svc.updateAttachmentMetadata("12345", "att-001", {
      title: "renamed.pdf",
    });
    console.log("  Updated:", result);
  } catch (err) {
    console.log(
      "  Expected error:",
      err.constructor?.name || "Error",
      "-",
      err.message,
    );
  }
  console.log();

  // --- Move attachment ---
  console.log('AttachmentService.moveAttachment("12345", "att-001", "67890"):');
  try {
    const result = await svc.moveAttachment("12345", "att-001", "67890");
    console.log("  Moved:", result);
  } catch (err) {
    console.log(
      "  Expected error:",
      err.constructor?.name || "Error",
      "-",
      err.message,
    );
  }
  console.log();

  // --- Delete attachment ---
  console.log('AttachmentService.deleteAttachment("12345", "att-001"):');
  try {
    await svc.deleteAttachment("12345", "att-001");
    console.log("  Deleted successfully");
  } catch (err) {
    console.log(
      "  Expected error:",
      err.constructor?.name || "Error",
      "-",
      err.message,
    );
  }
}

// =============================================================================
// Example 10: Additional Services — Users, Groups, Admin, Webhooks
// =============================================================================
/**
 * Demonstrate additional service layer capabilities: user management,
 * groups, admin operations, webhooks, labels, and permissions.
 */
async function example10_additionalServices() {
  console.log("\n--- Example 10: Additional Services ---\n");

  const client = new ConfluenceFetchClient({
    baseUrl: DEMO_BASE_URL,
    username: DEMO_USERNAME,
    apiToken: DEMO_TOKEN,
    timeoutMs: 5_000,
  });

  // --- UserService ---
  console.log("UserService:");
  const userSvc = new UserService(client);
  for (const [name, fn] of [
    ["getCurrentUser", () => userSvc.getCurrentUser()],
    ['getUser("admin")', () => userSvc.getUser("admin")],
    ['isWatchingContent("12345")', () => userSvc.isWatchingContent("12345")],
    ['getContentWatchers("12345")', () => userSvc.getContentWatchers("12345")],
  ]) {
    try {
      const result = await fn();
      console.log(`  ${name}: ${JSON.stringify(result).slice(0, 80)}`);
    } catch (err) {
      console.log(
        `  ${name}: ${err.constructor?.name || "Error"} - ${err.message}`,
      );
    }
  }
  console.log();

  // --- GroupService ---
  console.log("GroupService:");
  const groupSvc = new GroupService(client);
  for (const [name, fn] of [
    ["getGroups", () => groupSvc.getGroups()],
    ['getGroup("developers")', () => groupSvc.getGroup("developers")],
    [
      'getGroupMembers("developers")',
      () => groupSvc.getGroupMembers("developers"),
    ],
  ]) {
    try {
      const result = await fn();
      console.log(`  ${name}: ${JSON.stringify(result).slice(0, 80)}`);
    } catch (err) {
      console.log(
        `  ${name}: ${err.constructor?.name || "Error"} - ${err.message}`,
      );
    }
  }
  console.log();

  // --- AdminService ---
  console.log("AdminService:");
  const adminSvc = new AdminService(client);
  for (const [name, fn] of [
    [
      "createUser",
      () =>
        adminSvc.createUser({
          name: "newuser",
          email: "new@test.com",
          password: "pass123",
        }),
    ],
    ['disableUser("olduser")', () => adminSvc.disableUser("olduser")],
  ]) {
    try {
      const result = await fn();
      console.log(`  ${name}: ${JSON.stringify(result).slice(0, 80)}`);
    } catch (err) {
      console.log(
        `  ${name}: ${err.constructor?.name || "Error"} - ${err.message}`,
      );
    }
  }
  console.log();

  // --- WebhookService ---
  console.log("WebhookService:");
  const webhookSvc = new WebhookService(client);
  for (const [name, fn] of [
    ["getWebhooks", () => webhookSvc.getWebhooks()],
    [
      "createWebhook",
      () =>
        webhookSvc.createWebhook({
          url: "https://example.com/hook",
          events: ["page_created"],
        }),
    ],
  ]) {
    try {
      const result = await fn();
      console.log(`  ${name}: ${JSON.stringify(result).slice(0, 80)}`);
    } catch (err) {
      console.log(
        `  ${name}: ${err.constructor?.name || "Error"} - ${err.message}`,
      );
    }
  }
  console.log();

  // --- LabelService ---
  console.log("LabelService:");
  const labelSvc = new LabelService(client);
  for (const [name, fn] of [
    [
      'getRelatedLabels("important")',
      () => labelSvc.getRelatedLabels("important"),
    ],
    ["getRecentLabels", () => labelSvc.getRecentLabels()],
  ]) {
    try {
      const result = await fn();
      console.log(`  ${name}: ${JSON.stringify(result).slice(0, 80)}`);
    } catch (err) {
      console.log(
        `  ${name}: ${err.constructor?.name || "Error"} - ${err.message}`,
      );
    }
  }
  console.log();

  // --- SpacePermissionService ---
  console.log("SpacePermissionService:");
  const permSvc = new SpacePermissionService(client);
  for (const [name, fn] of [
    ['getPermissions("DEV")', () => permSvc.getPermissions("DEV")],
    [
      'getUserPermissions("DEV", "admin")',
      () => permSvc.getUserPermissions("DEV", "admin"),
    ],
    [
      'getGroupPermissions("DEV", "devs")',
      () => permSvc.getGroupPermissions("DEV", "devs"),
    ],
  ]) {
    try {
      const result = await fn();
      console.log(`  ${name}: ${JSON.stringify(result).slice(0, 80)}`);
    } catch (err) {
      console.log(
        `  ${name}: ${err.constructor?.name || "Error"} - ${err.message}`,
      );
    }
  }
  console.log();

  // --- ColorSchemeService ---
  console.log("ColorSchemeService:");
  const colorSvc = new ColorSchemeService(client);
  for (const [name, fn] of [
    ["getGlobalColorScheme", () => colorSvc.getGlobalColorScheme()],
    ['getSpaceColorScheme("DEV")', () => colorSvc.getSpaceColorScheme("DEV")],
  ]) {
    try {
      const result = await fn();
      console.log(`  ${name}: ${JSON.stringify(result).slice(0, 80)}`);
    } catch (err) {
      console.log(
        `  ${name}: ${err.constructor?.name || "Error"} - ${err.message}`,
      );
    }
  }
}

// =============================================================================
// Example 11: Pagination — Async Generators
// =============================================================================
/**
 * Demonstrate paginateOffset() and paginateCursor() async generators,
 * plus the buildExpand() utility.
 */
async function example11_pagination() {
  console.log("\n--- Example 11: Pagination (Async Generators) ---\n");

  // --- buildExpand utility ---
  console.log("buildExpand utility:");
  console.log(
    `  buildExpand(['body.storage', 'version', 'ancestors']) = '${buildExpand(["body.storage", "version", "ancestors"])}'`,
  );
  console.log(
    `  buildExpand('body.storage') = '${buildExpand("body.storage")}'`,
  );
  console.log(`  buildExpand(null) = ${buildExpand(null)}`);
  console.log();

  // --- paginateOffset ---
  console.log(
    "paginateOffset — iterates all pages of an offset-based endpoint:",
  );
  console.log();
  console.log("  Usage pattern:");
  console.log(
    "    for await (const item of paginateOffset(client, '/rest/api/content', { spaceKey: 'DEV' }, { limit: 50 })) {",
  );
  console.log("      console.log(item.title);");
  console.log("    }");
  console.log();

  const client = new ConfluenceFetchClient({
    baseUrl: DEMO_BASE_URL,
    username: DEMO_USERNAME,
    apiToken: DEMO_TOKEN,
    timeoutMs: 5_000,
  });

  console.log("  Running paginateOffset demo:");
  try {
    const items = [];
    for await (const item of paginateOffset(
      client,
      "/rest/api/content",
      { spaceKey: "DEV", type: "page" },
      { start: 0, limit: 25 },
    )) {
      items.push(item);
      if (items.length >= 100) break; // Safety limit
    }
    console.log(`    Collected ${items.length} items`);
  } catch (err) {
    console.log(
      `    Expected error: ${err.constructor?.name || "Error"} - ${err.message}`,
    );
  }
  console.log();

  // --- paginateCursor ---
  console.log("paginateCursor — iterates using opaque cursor tokens:");
  console.log();
  console.log("  Usage pattern:");
  console.log(
    "    for await (const item of paginateCursor(client, '/rest/api/content/scan', {}, { limit: 100 })) {",
  );
  console.log("      console.log(item.id);");
  console.log("    }");
  console.log();

  console.log("  Running paginateCursor demo:");
  try {
    const items = [];
    for await (const item of paginateCursor(
      client,
      "/rest/api/content/scan",
      { expand: "version" },
      { limit: 50 },
    )) {
      items.push(item);
      if (items.length >= 200) break;
    }
    console.log(`    Collected ${items.length} items via cursor pagination`);
  } catch (err) {
    console.log(
      `    Expected error: ${err.constructor?.name || "Error"} - ${err.message}`,
    );
  }
}

// =============================================================================
// Example 12: SDK Client (REST proxy)
// =============================================================================
/**
 * Demonstrate the ConfluenceSdkClient, which talks to the REST proxy server
 * (FastAPI or Fastify) rather than directly to Confluence Data Center.
 */
async function example12_sdkClient() {
  console.log("\n--- Example 12: SDK Client (REST Proxy) ---\n");

  console.log("ConfluenceSdkClient connects to the local REST proxy server.");
  console.log("It requires the server to be running (e.g., `make dev`).");
  console.log();

  const sdk = new ConfluenceSdkClient({
    baseUrl: "http://localhost:8000",
    apiKey: "my_api_key",
    timeoutMs: 5_000,
  });

  // --- Direct methods ---
  const directOps = [
    ["healthCheck", () => sdk.healthCheck()],
    ['getContent("12345")', () => sdk.getContent("12345")],
    ["getSpaces({ limit: 5 })", () => sdk.getSpaces({ limit: 5 })],
    [
      "searchContent('type = \"page\"')",
      () => sdk.searchContent('type = "page"'),
    ],
    ["serverInfo", () => sdk.serverInfo()],
  ];

  console.log("Direct methods:");
  for (const [name, fn] of directOps) {
    try {
      const result = await fn();
      console.log(`  sdk.${name}: ${JSON.stringify(result).slice(0, 80)}`);
    } catch (err) {
      console.log(
        `  sdk.${name}: ${err.constructor?.name || "Error"} - ${err.message}`,
      );
    }
  }
  console.log();

  // --- Property-style access ---
  console.log("Property-style access:");
  const proxyOps = [
    ['content.get("12345")', () => sdk.content.get("12345")],
    ["content.list()", () => sdk.content.list()],
    ["space.list()", () => sdk.space.list()],
    [
      "search.query('type = \"page\"')",
      () => sdk.search.query('type = "page"'),
    ],
    ["user.getCurrent()", () => sdk.user.getCurrent()],
  ];
  for (const [name, fn] of proxyOps) {
    try {
      const result = await fn();
      console.log(`  sdk.${name}: ${JSON.stringify(result).slice(0, 80)}`);
    } catch (err) {
      console.log(
        `  sdk.${name}: ${err.constructor?.name || "Error"} - ${err.message}`,
      );
    }
  }
}

// =============================================================================
// Main — Run all examples sequentially
// =============================================================================
async function main() {
  console.log("=".repeat(72));
  console.log(" Confluence API SDK — Basic Usage Examples (Node.js / MJS)");
  console.log("=".repeat(72));

  try {
    example1_configurationLoading();
  } catch (err) {
    console.error("Example 1 failed:", err.message);
  }

  try {
    await example2_clientInitialization();
  } catch (err) {
    console.error("Example 2 failed:", err.message);
  }

  try {
    example3_errorHandling();
  } catch (err) {
    console.error("Example 3 failed:", err.message);
  }

  try {
    example4_cqlBuilder();
  } catch (err) {
    console.error("Example 4 failed:", err.message);
  }

  try {
    example5_structuredLogger();
  } catch (err) {
    console.error("Example 5 failed:", err.message);
  }

  try {
    example6_modelSchemas();
  } catch (err) {
    console.error("Example 6 failed:", err.message);
  }

  try {
    await example7_serviceLayer();
  } catch (err) {
    console.error("Example 7 failed:", err.message);
  }

  try {
    await example8_spaceSearchSystem();
  } catch (err) {
    console.error("Example 8 failed:", err.message);
  }

  try {
    await example9_attachmentService();
  } catch (err) {
    console.error("Example 9 failed:", err.message);
  }

  try {
    await example10_additionalServices();
  } catch (err) {
    console.error("Example 10 failed:", err.message);
  }

  try {
    await example11_pagination();
  } catch (err) {
    console.error("Example 11 failed:", err.message);
  }

  try {
    await example12_sdkClient();
  } catch (err) {
    console.error("Example 12 failed:", err.message);
  }

  console.log("\n" + "=".repeat(72));
  console.log(" All examples complete.");
  console.log("=".repeat(72));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
