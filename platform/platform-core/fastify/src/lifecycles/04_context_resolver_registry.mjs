import { randomUUID } from "crypto";

/**
 * Get header from request, handling both object and dict formats.
 */
function getHeader(request, headerName, defaultValue = undefined) {
  if (!request) return defaultValue;
  if (request.headers) {
    const value = request.headers[headerName];
    if (value !== undefined) return value;
  }
  return defaultValue;
}

/**
 * Get query param from request, handling both object and dict formats.
 */
function getQueryParam(request, paramName, defaultValue = undefined) {
  if (!request) return defaultValue;
  if (request.query) {
    const value = request.query[paramName];
    if (value !== undefined) return value;
  }
  return defaultValue;
}

/**
 * Register built-in compute functions on the given registry.
 * @param {object} registry - Compute function registry (from app_yaml_overwrites)
 * @param {object} ComputeScope - Scope enum (STARTUP | REQUEST)
 */
export function registerComputeFunctions(registry, ComputeScope) {
  // ==========================================================================
  // STARTUP Scope - Run once at startup, cached
  // ==========================================================================

  // Echo for testing
  registry.register("echo", () => "echo", ComputeScope.STARTUP);

  // Build info from environment
  registry.register(
    "get_build_id",
    (ctx) => ctx?.env?.BUILD_ID || "dev-local",
    ComputeScope.STARTUP
  );
  registry.register(
    "get_build_version",
    (ctx) => ctx?.env?.BUILD_VERSION || "0.0.0",
    ComputeScope.STARTUP
  );
  registry.register(
    "get_git_commit",
    (ctx) => ctx?.env?.GIT_COMMIT || "unknown",
    ComputeScope.STARTUP
  );

  // Service info
  registry.register(
    "get_service_name",
    (ctx) => ctx?.config?.app?.name || "mta-server",
    ComputeScope.STARTUP
  );
  registry.register(
    "get_service_version",
    (ctx) => ctx?.config?.app?.version || "0.0.0",
    ComputeScope.STARTUP
  );

  // ==========================================================================
  // REQUEST Scope - Run per request with request context
  // ==========================================================================

  // Request ID - from header or generate
  registry.register(
    "compute_request_id",
    (ctx) => {
      const requestId = getHeader(ctx?.request, "x-request-id");
      if (requestId) return requestId;
      return randomUUID();
    },
    ComputeScope.REQUEST
  );

  // Gemini token - from header or env
  registry.register(
    "compute_localhost_test_case_001_token",
    (ctx) => {
      const token = getHeader(ctx?.request, "x-gemini-token");
      if (token) return token;
      return ctx?.env?.GEMINI_API_KEY || "";
    },
    ComputeScope.REQUEST
  );

  // Test case 002 - Authorization from jira provider
  registry.register(
    "test_case_002",
    (ctx) => {
      const token = getHeader(ctx?.request, "x-jira-token");
      if (token) return `Bearer ${token}`;
      const apiToken = ctx?.env?.JIRA_API_TOKEN;
      if (apiToken) return `Bearer ${apiToken}`;
      return "";
    },
    ComputeScope.REQUEST
  );

  // Test case 002_1 - X-Auth header
  registry.register(
    "test_case_002_1",
    (ctx) => {
      const token = getHeader(ctx?.request, "x-auth");
      if (token) return token;
      return ctx?.env?.JIRA_API_TOKEN || "";
    },
    ComputeScope.REQUEST
  );

  // Tenant ID - from header or query param
  registry.register(
    "compute_tenant_id",
    (ctx) => {
      const tenantIdHeader = getHeader(ctx?.request, "x-tenant-id");
      if (tenantIdHeader) return tenantIdHeader;
      const tenantIdQuery = getQueryParam(ctx?.request, "tenant_id");
      if (tenantIdQuery) return tenantIdQuery;
      return "default";
    },
    ComputeScope.REQUEST
  );

  // User agent with app info
  registry.register(
    "compute_user_agent",
    (ctx) => {
      const appName = ctx?.config?.app?.name || "MTA-Server";
      const appVersion = ctx?.config?.app?.version || "0.0.0";
      const baseUA = `${appName}/${appVersion}`;
      const clientUA = getHeader(ctx?.request, "user-agent");
      if (clientUA) return `${baseUA} (via ${clientUA})`;
      return baseUA;
    },
    ComputeScope.REQUEST
  );
}
