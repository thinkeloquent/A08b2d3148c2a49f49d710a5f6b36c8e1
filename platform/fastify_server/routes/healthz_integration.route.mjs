/**
 * Consolidated health check routes for all integration endpoints.
 *
 * Registers /healthz/admin/integration/<name> and /healthz/admin/integration/<name>/config
 * for each configured provider using a data-driven registry.
 *
 * Uses healthz-diagnostics SDK for health checks, timing, and diagnostics.
 * Uses AppYamlConfig from lifecycle (server.config) per standards_state_context.md.
 *
 * Configuration source:
 * - server.dev.yaml (providers.*)
 */

import { AsyncClient, getEnvProxy, logger as fetchClientLogger } from "fetch-undici";
import {
  buildSdkAuthOptions,
  resolveApiKey,
  resolveContextValue,
  resolveEmail,
} from "@internal/auth-config";
import { sdk as authEncodingSdk } from "@internal/auth-encoding";
import { applyResolvedOverwrites } from "app_yaml_overwrites";
import { AppYamlConfig, getConfigFromServer } from "@internal/app-yaml-static-config";
import {
  HealthzDiagnosticsSDK,
  ConfigSanitizer,
  TimestampFormatter,
} from "healthz-diagnostics";

const timestampFormatter = new TimestampFormatter();
const configSanitizer = new ConfigSanitizer();
const fetchBaseClientLogger = fetchClientLogger;


// ── Integration registry ────────────────────────────────────────────────────
//
// Each entry describes a provider's health check configuration.
// See Python counterpart for full field documentation.

const INTEGRATIONS = [
  {
    providerName: "anthropic",
    integrationName: "anthropic",
    defaultAuthType: "x-api-key",
    envVars: ["ANTHROPIC_API_KEY", "HTTPS_PROXY", "HTTP_PROXY"],
  },
  {
    providerName: "openai",
    integrationName: "openai",
    defaultAuthType: "bearer",
    envVars: ["OPENAI_API_KEY", "HTTPS_PROXY", "HTTP_PROXY"],
  },
  {
    providerName: "openai_embeddings",
    integrationName: "openai-embeddings",
    defaultAuthType: "bearer",
    envVars: ["OPENAI_API_KEY", "HTTPS_PROXY", "HTTP_PROXY"],
  },
  {
    providerName: "github",
    integrationName: "github",
    defaultAuthType: "bearer",
    envVars: ["GITHUB_TOKEN", "GH_TOKEN", "GITHUB_ACCESS_TOKEN", "GITHUB_PAT", "HTTPS_PROXY", "HTTP_PROXY"],
  },
  {
    providerName: "figma",
    integrationName: "figma",
    defaultAuthType: "custom_header",
    defaultHeaderName: "X-Figma-Token",
    envVars: ["FIGMA_TOKEN", "HTTPS_PROXY", "HTTP_PROXY"],
  },
  {
    providerName: "rally",
    integrationName: "rally",
    defaultAuthType: "custom_header",
    defaultHeaderName: "ZSESSIONID",
    checkBaseUrl: true,
    envVars: ["RALLY_API_KEY", "HTTPS_PROXY", "HTTP_PROXY"],
  },
  {
    providerName: "statsig",
    integrationName: "statsig",
    defaultAuthType: "custom_header",
    defaultHeaderName: "statsig-api-key",
    checkBaseUrl: true,
    envVars: ["STATSIG_API_KEY", "STATSIG_SERVER_SECRET", "HTTPS_PROXY", "HTTP_PROXY"],
  },
  {
    providerName: "sonar",
    integrationName: "sonar",
    defaultAuthType: "bearer",
    defaultHeaderName: "Authorization",
    resolveBaseUrl: true,
    checkBaseUrl: true,
    baseUrlErrorHint: "check SONAR_BASE_URL env var",
    resolveConfigBaseUrl: true,
    envVars: ["SONAR_TOKEN", "SONARQUBE_TOKEN", "SONARCLOUD_TOKEN", "SONAR_API_TOKEN", "SONAR_BASE_URL", "HTTPS_PROXY", "HTTP_PROXY"],
  },
  {
    providerName: "jira",
    integrationName: "jira",
    defaultAuthType: "basic_email_token",
    resolveBaseUrl: true,
    checkBaseUrl: true,
    baseUrlErrorHint: "check jira.base_url in server config or JIRA_BASE_URL env var",
    resolveConfigBaseUrl: true,
    resolveEmail: true,
    envVars: ["JIRA_API_TOKEN", "JIRA_EMAIL", "JIRA_BASE_URL", "JIRA_PROJECT_KEY", "JIRA_BOARD_ID", "HTTPS_PROXY", "HTTP_PROXY"],
  },
  {
    providerName: "confluence",
    integrationName: "confluence",
    defaultAuthType: "basic_email_token",
    resolveBaseUrl: true,
    checkBaseUrl: true,
    baseUrlErrorHint: "check confluence.base_url in server config or CONFLUENCE_BASE_URL env var",
    resolveConfigBaseUrl: true,
    resolveEmail: true,
    envVars: ["CONFLUENCE_API_TOKEN", "CONFLUENCE_EMAIL", "CONFLUENCE_BASE_URL", "CONFLUENCE_SPACE_KEY", "CONFLUENCE_PARENT_PAGE_ID", "HTTPS_PROXY", "HTTP_PROXY"],
  },
  {
    providerName: "saucelabs",
    integrationName: "saucelabs",
    authMode: "username_basic",
    checkUsername: true,
    usernameErrorHint: "check SAUCE_USERNAME env var",
    healthEndpointUsernameSubstitution: true,
    envVars: ["SAUCE_USERNAME", "SAUCELABS_USERNAME", "SAUCE_ACCESS_KEY", "SAUCELABS_ACCESS_KEY", "HTTPS_PROXY", "HTTP_PROXY"],
  },
  {
    providerName: "servicenow",
    integrationName: "servicenow",
    authMode: "username_basic",
    checkBaseUrl: true,
    checkUsername: true,
    credentialsError: "Credentials not configured",
    envVars: ["SERVICENOW_USERNAME", "SERVICENOW_PASSWORD", "HTTPS_PROXY", "HTTP_PROXY"],
  },
  {
    providerName: "gemini_openai",
    integrationName: "gemini-openai",
    defaultAuthType: "bearer",
    customClient: "gemini_openai",
    configUsesSdkResolution: true,
    envVars: ["GEMINI_API_KEY", "HTTPS_PROXY", "HTTP_PROXY"],
  },
];


// ── Redaction & connection details ──────────────────────────────────────────

function _partialRedact(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === "boolean" || typeof value === "number") return value;
  const str = String(value);
  if (str.length === 0) return str;
  if (str.length <= 20) return "***";
  return str.substring(0, 15) + "***" + str.slice(-5);
}

const SENSITIVE_PATTERNS = [
  "api_key", "token", "password", "secret", "access_key",
  "client_secret", "access_token", "authorization",
];

function _isSensitiveKey(key) {
  const lower = key.toLowerCase().replace(/-/g, "_");
  return SENSITIVE_PATTERNS.some((p) => lower.includes(p));
}

function _redactHeaders(headers) {
  if (!headers || typeof headers !== "object") return headers;
  const redacted = {};
  for (const [k, v] of Object.entries(headers)) {
    redacted[k] = _isSensitiveKey(k) ? _partialRedact(v) : v;
  }
  return redacted;
}

function _redactSensitiveKeys(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((v) => _redactSensitiveKeys(v));
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (_isSensitiveKey(k) && typeof v === "string") {
      result[k] = _partialRedact(v);
    } else if (v && typeof v === "object") {
      result[k] = _redactSensitiveKeys(v);
    } else {
      result[k] = v;
    }
  }
  return result;
}

function _buildConnectionDetails(providerConfig, integration, envVars) {
  const resolvedBaseUrl = integration.resolveBaseUrl
    ? _resolveBaseUrl(providerConfig)
    : (providerConfig.base_url || "");

  const clientConfig = providerConfig.client || {};
  const customHeaders = providerConfig.headers || {};
  const proxyUrlConfig = providerConfig.proxy_url;
  const verifySsl = providerConfig.verify_ssl !== false;

  // Build auth info and resolved headers — reflect overrides when present
  let authInfo;
  let resolvedAuthHeaders = {};
  const authOverride = providerConfig._auth_header_override;

  if (authOverride) {
    authInfo = {
      auth_mode: "override",
      source: "ui_override",
      header_name: authOverride.name,
      header_value: _partialRedact(authOverride.value),
    };
    resolvedAuthHeaders = { [authOverride.name]: _partialRedact(authOverride.value) };
  } else if (integration.authMode === "username_basic") {
    const username = _resolveUsername(providerConfig);
    authInfo = {
      auth_mode: "username_basic",
      source: "server_config",
      endpoint_auth_type: providerConfig.endpoint_auth_type || "basic",
      username: username || null,
      api_key: _partialRedact(resolveApiKey(providerConfig)),
    };
    try {
      const authOptions = _buildUsernameBasicAuthOptions(providerConfig, integration);
      const rawAuthHeaders = buildAuthHeaders(authOptions);
      resolvedAuthHeaders = Object.fromEntries(
        Object.entries(rawAuthHeaders).map(([k, v]) => [k, _partialRedact(v)])
      );
    } catch { /* ignore */ }
  } else {
    const authType = integration.defaultAuthType || "bearer";
    authInfo = {
      auth_mode: "standard",
      source: "server_config",
      endpoint_auth_type: providerConfig.endpoint_auth_type || authType,
      endpoint_auth_token_resolver: providerConfig.endpoint_auth_token_resolver || null,
      api_auth_header_name: providerConfig.api_auth_header_name || null,
      api_key: _partialRedact(resolveApiKey(providerConfig)),
    };
    if (providerConfig.email) {
      authInfo.email = providerConfig.email;
    }
    try {
      const headerName = integration.defaultHeaderName;
      const authOptions = headerName
        ? buildSdkAuthOptions(providerConfig, authType, headerName)
        : buildSdkAuthOptions(providerConfig, authType);
      const rawAuthHeaders = buildAuthHeaders(authOptions);
      resolvedAuthHeaders = Object.fromEntries(
        Object.entries(rawAuthHeaders).map(([k, v]) => [k, _partialRedact(v)])
      );
    } catch { /* ignore */ }
  }

  // Proxy resolution details
  let proxyDetails;
  if (proxyUrlConfig === false) {
    proxyDetails = { configured: false, mode: "disabled", url: null };
  } else if (typeof proxyUrlConfig === "string" && proxyUrlConfig) {
    proxyDetails = { configured: true, mode: "explicit", url: proxyUrlConfig };
  } else if (proxyUrlConfig === null || proxyUrlConfig === undefined) {
    proxyDetails = {
      configured: true,
      mode: "system_env",
      HTTPS_PROXY: process.env.HTTPS_PROXY || null,
      HTTP_PROXY: process.env.HTTP_PROXY || null,
      NO_PROXY: process.env.NO_PROXY || null,
    };
  } else {
    proxyDetails = { configured: false, mode: "unknown", raw_value: proxyUrlConfig };
  }

  // Env var availability
  const envVarsAvailable = {};
  for (const varName of (envVars || [])) {
    envVarsAvailable[varName] = process.env[varName] !== undefined;
  }

  // Overwrite config
  const overwriteFromEnv = providerConfig.overwrite_from_env || null;
  const overwriteFromContext = providerConfig.overwrite_from_context || null;

  return {
    base_url: resolvedBaseUrl,
    health_endpoint: providerConfig.health_endpoint || null,
    model: providerConfig.model || null,
    method: providerConfig.method || "GET",
    auth: authInfo,
    resolved_auth_headers: resolvedAuthHeaders,
    headers: _redactHeaders(customHeaders),
    proxy: proxyDetails,
    ssl: {
      verify_ssl: verifySsl,
      ca_bundle: providerConfig.ca_bundle || null,
      cert: providerConfig.cert || null,
    },
    client: {
      timeout_ms: clientConfig.timeout_ms || 30000,
      timeout_seconds: clientConfig.timeout_seconds || null,
      ...Object.fromEntries(
        Object.entries(clientConfig).filter(([k]) => k !== "timeout_ms" && k !== "timeout_seconds")
      ),
    },
    overwrite_from_env: overwriteFromEnv ? _redactSensitiveKeys(overwriteFromEnv) : null,
    overwrite_from_context: overwriteFromContext ? _redactSensitiveKeys(overwriteFromContext) : null,
    env_vars_available: envVarsAvailable,
  };
}


function _buildConfigDebugInfo(providerName, configResolutionSource, resolvedProviderConfig) {
  try {
    const instance = AppYamlConfig.getInstance();
    const originalMap = instance.getOriginalAll();

    const loadedFiles = [...originalMap.keys()].map((fp) => {
      const parts = fp.split("/");
      return parts[parts.length - 1];
    });

    const perFileProviderConfig = {};
    for (const [filePath, fileConfig] of originalMap) {
      const providerSubtree = fileConfig?.providers?.[providerName];
      if (providerSubtree && typeof providerSubtree === "object" && Object.keys(providerSubtree).length > 0) {
        const fileName = filePath.split("/").pop();
        perFileProviderConfig[fileName] = _redactSensitiveKeys(providerSubtree);
      }
    }

    // Use the resolved provider config (with overwrites applied) if available,
    // otherwise fall back to the raw merged config from AppYamlConfig
    const allConfig = instance.getAll();
    const mergedProviderConfig = resolvedProviderConfig || allConfig?.providers?.[providerName] || {};

    return {
      app_env: allConfig?.app_env || null,
      loaded_files: loadedFiles,
      config_resolution_source: configResolutionSource,
      per_file_provider_config: perFileProviderConfig,
      merged_provider_config: _redactSensitiveKeys(mergedProviderConfig),
    };
  } catch {
    return {
      app_env: null,
      loaded_files: [],
      config_resolution_source: configResolutionSource,
      per_file_provider_config: {},
      merged_provider_config: {},
      _error: "AppYamlConfig not available",
    };
  }
}


// ── Shared helpers ──────────────────────────────────────────────────────────

function buildAuthHeaders(authOptions) {
  if (!authOptions) return {};

  const authType = authOptions.type || "";
  if (!authType) return {};

  let credentials;
  if (authType === "bearer") {
    credentials = { token: authOptions.token };
  } else if (authType === "basic") {
    credentials = { username: authOptions.username, password: authOptions.password };
  } else if (authType === "x-api-key") {
    credentials = { apiKey: authOptions.token };
  } else if (authType === "custom") {
    credentials = { headerKey: authOptions.headerName || "Authorization", headerValue: authOptions.token };
  } else if (authType === "basic_email_token") {
    credentials = { email: authOptions.email, token: authOptions.token };
  } else {
    return {};
  }

  const result = authEncodingSdk.encodeAuthSDK({ authType, credentials });
  return result.headers;
}


function _resolveBaseUrl(providerConfig) {
  const baseUrl = resolveContextValue(providerConfig.overwrite_from_context, "base_url");
  if (baseUrl) return baseUrl;
  return providerConfig.base_url || "";
}


function _resolveUsername(providerConfig) {
  const username = resolveContextValue(providerConfig.overwrite_from_context, "username");
  if (username) return username;
  return providerConfig.username;
}


function _buildUsernameBasicAuthOptions(providerConfig, integration) {
  const apiKey = resolveApiKey(providerConfig);
  const username = _resolveUsername(providerConfig);
  if (!apiKey || !username) return null;

  const defaultAuthType = integration.defaultAuthType || "basic";
  const authType = (providerConfig.endpoint_auth_type || defaultAuthType).toLowerCase();

  switch (authType) {
    case "basic":
      return { type: "basic", username, password: apiKey };
    case "bearer":
      return { type: "bearer", token: apiKey };
    case "x-api-key":
      return { type: "x-api-key", token: apiKey };
    case "custom":
    case "custom_header":
      return {
        type: "custom",
        token: apiKey,
        headerName: providerConfig.api_auth_header_name || "Authorization",
      };
    default:
      return { type: "basic", username, password: apiKey };
  }
}


function _makeErrorResult(providerName, errorMsg, model = null) {
  return {
    provider: providerName,
    healthy: false,
    status_code: null,
    latency_ms: 0,
    error: errorMsg,
    endpoint: null,
    model,
    timestamp: timestampFormatter.format(),
    diagnostics: [{ type: "request:error", timestamp: timestampFormatter.format(), error: errorMsg }],
  };
}


// ── Client creation ─────────────────────────────────────────────────────────

function _createStandardClient(providerConfig, request, integration) {
  const { providerName } = integration;
  const baseLogger = integration._baseLogger;

  const baseUrl = integration.resolveBaseUrl
    ? _resolveBaseUrl(providerConfig)
    : (providerConfig.base_url || "");

  const clientConfig = providerConfig.client || {};
  const timeoutMs = clientConfig.timeout_ms || 30000;
  const customHeaders = providerConfig.headers || {};

  let authHeaders;
  if (providerConfig._auth_header_override) {
    const { name, value } = providerConfig._auth_header_override;
    authHeaders = { [name]: value };
  } else {
    let authOptions;
    if (integration.authMode === "username_basic") {
      authOptions = _buildUsernameBasicAuthOptions(providerConfig, integration);
    } else {
      const authType = integration.defaultAuthType || "bearer";
      const headerName = integration.defaultHeaderName;
      authOptions = headerName
        ? buildSdkAuthOptions(providerConfig, authType, headerName)
        : buildSdkAuthOptions(providerConfig, authType);
    }
    authHeaders = buildAuthHeaders(authOptions);
  }

  baseLogger.info(`Creating SDK client for ${baseUrl} (proxy-aware)`);
  console.log('[fetch_config]', {
    provider: providerName,
    base_url: baseUrl,
    endpoint_auth_type: providerConfig.endpoint_auth_type || null,
    has_auth_headers: Object.keys(authHeaders).length > 0,
    custom_headers: Object.keys(customHeaders),
    timeout_ms: timeoutMs,
    proxy_url: providerConfig.proxy_url ?? null,
    headers_auth: Object.fromEntries(
      Object.entries(authHeaders).map(([k, v]) => [k, String(v).substring(0, 15) + '...'])
    ),
  });

  const proxyUrlConfig = providerConfig.proxy_url;
  const envProxy = getEnvProxy();
  const resolvedProxy = proxyUrlConfig === false
    ? null
    : (typeof proxyUrlConfig === "string" && proxyUrlConfig
      ? proxyUrlConfig
      : (envProxy.https || envProxy.http || null));

  const client = new AsyncClient({
    baseUrl,
    headers: { ...customHeaders, ...authHeaders },
    timeout: timeoutMs,
    verify: providerConfig.verify_ssl !== false,
    proxy: resolvedProxy,
    trust_env: proxyUrlConfig == null,
  });
  return {
    request: async ({ method, path, json }) => {
      const response = await client.request(method, path, { json });
      let data = null;
      try {
        data = await response.json();
      } catch {
        try {
          data = await response.text();
        } catch {
          data = null;
        }
      }
      return {
        status: response.statusCode,
        statusCode: response.statusCode,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      };
    },
    close: () => client.close(),
  };
}


function _createGeminiOpenaiClient(providerConfig, request, integration) {
  const { providerName } = integration;
  const baseLogger = integration._baseLogger;
  const authType = integration.defaultAuthType || "bearer";

  const baseUrl = providerConfig.base_url || "";
  const clientConfig = providerConfig.client || {};
  const timeoutMs = clientConfig.timeout_ms || 30000;
  const customHeaders = providerConfig.headers || {};

  let authHeaders;
  if (providerConfig._auth_header_override) {
    const { name, value } = providerConfig._auth_header_override;
    authHeaders = { [name]: value };
  } else {
    const authOptions = buildSdkAuthOptions(providerConfig, authType);
    authHeaders = buildAuthHeaders(authOptions);
  }

  baseLogger.info(`Creating SDK client for ${baseUrl} (proxy-aware)`);
  console.log('[fetch_config]', {
    provider: providerName,
    base_url: baseUrl,
    endpoint_auth_type: providerConfig.endpoint_auth_type || null,
    has_auth_headers: Object.keys(authHeaders).length > 0,
    custom_headers: Object.keys(customHeaders),
    timeout_ms: timeoutMs,
    proxy_url: providerConfig.proxy_url ?? null,
    headers_auth: Object.fromEntries(
      Object.entries(authHeaders).map(([k, v]) => [k, String(v).substring(0, 15) + '...'])
    ),
  });

  const proxyUrlConfig = providerConfig.proxy_url;
  const envProxy = getEnvProxy();
  const resolvedProxy = proxyUrlConfig === false
    ? null
    : (typeof proxyUrlConfig === "string" && proxyUrlConfig
      ? proxyUrlConfig
      : (envProxy.https || envProxy.http || null));
  const client = new AsyncClient({
    baseUrl,
    headers: { ...customHeaders, ...authHeaders },
    timeout: timeoutMs,
    verify: providerConfig.verify_ssl !== false,
    proxy: resolvedProxy,
    trust_env: proxyUrlConfig == null,
  });
  return {
    request: async ({ method, path, json }) => {
      const response = await client.request(method, path, { json });
      let data = null;
      try {
        data = await response.json();
      } catch {
        try {
          data = await response.text();
        } catch {
          data = null;
        }
      }
      return {
        status: response.statusCode,
        statusCode: response.statusCode,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      };
    },
    close: () => client.close(),
  };
}


// ── Health check logic ──────────────────────────────────────────────────────

async function _checkProviderHealth(providerName, providerConfig, request, integration) {
  const clientLogger = integration._clientLogger;
  const model = providerConfig.model || null;

  // Skip HTTP fetch for compute-type providers
  if (providerConfig._type === "compute") {
    clientLogger.info(`Skipping HTTP health check for compute provider ${providerName}`);
    return {
      provider: providerName,
      healthy: true,
      _type: "compute",
      status_code: null,
      latency_ms: 0,
      error: null,
      endpoint: null,
      model,
      timestamp: timestampFormatter.format(),
      diagnostics: [{ type: "compute:skip", timestamp: timestampFormatter.format(), metadata: { reason: "compute provider — no HTTP health check" } }],
    };
  }

  // Pre-validate base_url if required
  if (integration.checkBaseUrl) {
    const baseUrl = integration.resolveBaseUrl
      ? _resolveBaseUrl(providerConfig)
      : (providerConfig.base_url || "");
    if (!baseUrl) {
      const hint = integration.baseUrlErrorHint || "";
      const errorMsg = hint ? `base_url not configured (${hint})` : "base_url not configured";
      clientLogger.error(`No base_url configured for ${providerName}`);
      return _makeErrorResult(providerName, errorMsg, model);
    }
  }

  // Pre-validate credentials (skip if auth header is overridden)
  if (!providerConfig._auth_header_override) {
    if (integration.checkUsername) {
      const username = _resolveUsername(providerConfig);
      const apiKey = resolveApiKey(providerConfig);
      if (integration.credentialsError) {
        // ServiceNow: combined check
        if (!username || !apiKey) {
          clientLogger.error(`${integration.credentialsError} for ${providerName}`);
          return _makeErrorResult(providerName, integration.credentialsError, model);
        }
      } else {
        // SauceLabs: separate checks
        if (!username) {
          const hint = integration.usernameErrorHint || "";
          const errorMsg = hint ? `username not configured (${hint})` : "username not configured";
          clientLogger.error(`No username configured for ${providerName}`);
          return _makeErrorResult(providerName, errorMsg, model);
        }
        if (!apiKey) {
          clientLogger.error(`No API key available for ${providerName}`);
          return _makeErrorResult(providerName, "API key not configured", model);
        }
      }
    } else {
      // Standard API key check
      const apiKey = resolveApiKey(providerConfig);
      if (!apiKey) {
        clientLogger.error(`No API key available for ${providerName}`);
        return _makeErrorResult(providerName, "API key not configured", model);
      }
    }
  }

  // Build resolved config for SDK (provider-specific transforms)
  let resolvedConfig = providerConfig;
  const needsResolution = integration.resolveConfigBaseUrl || integration.resolveEmail || integration.healthEndpointUsernameSubstitution;
  if (needsResolution) {
    resolvedConfig = { ...providerConfig };
    if (integration.resolveConfigBaseUrl) {
      resolvedConfig.base_url = _resolveBaseUrl(providerConfig);
    }
    if (integration.resolveEmail) {
      resolvedConfig.email = resolveEmail(providerConfig);
    }
    if (integration.healthEndpointUsernameSubstitution) {
      const username = _resolveUsername(providerConfig);
      const healthEndpoint = resolvedConfig.health_endpoint || "/rest/v1/users/:username";
      resolvedConfig.health_endpoint = healthEndpoint.replace(":username", username);
    }
  }

  // Create SDK and run health check
  const createClientFn = integration._createClientFn;
  const sdk = HealthzDiagnosticsSDK.create((config) =>
    createClientFn(config, request, integration)
  );
  clientLogger.info(`Executing health check for ${providerName} via SDK`);
  const result = await sdk.checkHealth(providerName, resolvedConfig);
  clientLogger.info(`Health check completed: ${result.status_code} in ${result.latency_ms}ms`);
  const { data: responseData, ...resultWithoutData } = result;
  if (responseData !== undefined) {
    clientLogger.info(`Response data: ${JSON.stringify(responseData)}`);
  }
  return resultWithoutData;
}


// ── Override application ─────────────────────────────────────────────────────

function _applyOverrides(providerConfig, overrides) {
  if (!overrides || typeof overrides !== "object") return providerConfig;
  const hasOverride =
    overrides.proxy_url !== undefined ||
    overrides.verify_ssl !== undefined ||
    overrides.ca_bundle !== undefined ||
    (overrides.auth_header_name && overrides.auth_header_value);
  if (!hasOverride) return providerConfig;

  const config = { ...providerConfig };
  if (overrides.proxy_url !== undefined) {
    config.proxy_url = overrides.proxy_url;
  }
  if (overrides.verify_ssl !== undefined) {
    config.verify_ssl = overrides.verify_ssl;
  }
  if (overrides.ca_bundle !== undefined) {
    config.ca_bundle = overrides.ca_bundle;
  }
  if (overrides.auth_header_name && overrides.auth_header_value) {
    config._auth_header_override = {
      name: overrides.auth_header_name,
      value: overrides.auth_header_value,
    };
  }
  return config;
}


// ── Route registration ──────────────────────────────────────────────────────

function _registerIntegration(server, integration) {
  const { providerName, integrationName, envVars } = integration;

  // Create per-integration loggers
  const clientLogger = fetchClientLogger.create("fetch_client", `healthz_integration_${providerName}`);
  const baseLogger = fetchBaseClientLogger.create("fetch_base_client", `healthz_integration_${providerName}`);
  integration._clientLogger = clientLogger;
  integration._baseLogger = baseLogger;

  // Select client creation function
  integration._createClientFn = integration.customClient === "gemini_openai"
    ? _createGeminiOpenaiClient
    : _createStandardClient;

  // ── Health check route ──────────────────────────────────────────────

  server.get(
    `/healthz/admin/integration/${integrationName}`,
    async (request, reply) => {
      baseLogger.info(`Health check: ${providerName}`);

      try {
        let providerConfig = null;
        let configResolutionSource = "fallback_startup";

        // Try to get fully resolved config from SDK (includes REQUEST scope compute functions)
        if (server.configSdk?.getResolved) {
          try {
            const { ComputeScope } = await import("app_yaml_overwrites");
            const resolvedConfig = await server.configSdk.getResolved(
              ComputeScope.REQUEST,
              request
            );
            providerConfig = resolvedConfig?.providers?.[providerName] || null;
            providerConfig = applyResolvedOverwrites(providerConfig);
            configResolutionSource = "sdk_resolved";
            baseLogger.info("Using SDK-resolved config with REQUEST scope");
          } catch (err) {
            baseLogger.warn(`SDK resolution failed, falling back: ${err.message}`);
          }
        }

        // Fallback to pre-resolved startup config or raw config
        if (!providerConfig) {
          const config = await getConfigFromServer(server);
          const providersConfig =
            (config.get ? config.get("providers") : config.providers) || {};
          providerConfig = providersConfig[providerName] || {};
          providerConfig = applyResolvedOverwrites(providerConfig);
          baseLogger.info("Using fallback config (startup-resolved or raw)");
        }

        if (Object.keys(providerConfig).length === 0) {
          return {
            healthy: false,
            timestamp: timestampFormatter.format(),
            error: `${providerName} provider not configured`,
          };
        }

        const healthResult = await _checkProviderHealth(providerName, providerConfig, request, integration);
        const connectionDetails = _buildConnectionDetails(providerConfig, integration, envVars);
        const configDebug = _buildConfigDebugInfo(providerName, configResolutionSource, providerConfig);
        return { ...healthResult, connection_details: connectionDetails, config_debug: configDebug };
      } catch (err) {
        baseLogger.error(`Health check failed: ${err.message}`);
        return {
          healthy: false,
          timestamp: timestampFormatter.format(),
          error: err.message,
        };
      }
    }
  );

  // ── Health check route (POST with overrides) ─────────────────────

  server.post(
    `/healthz/admin/integration/${integrationName}`,
    async (request, reply) => {
      baseLogger.info(`Health check (POST with overrides): ${providerName}`);
      const overrides = request.body || {};

      try {
        let providerConfig = null;
        let configResolutionSource = "fallback_startup";

        if (server.configSdk?.getResolved) {
          try {
            const { ComputeScope } = await import("app_yaml_overwrites");
            const resolvedConfig = await server.configSdk.getResolved(
              ComputeScope.REQUEST,
              request
            );
            providerConfig = resolvedConfig?.providers?.[providerName] || null;
            providerConfig = applyResolvedOverwrites(providerConfig);
            configResolutionSource = "sdk_resolved";
          } catch (err) {
            baseLogger.warn(`SDK resolution failed, falling back: ${err.message}`);
          }
        }

        if (!providerConfig) {
          const config = await getConfigFromServer(server);
          const providersConfig =
            (config.get ? config.get("providers") : config.providers) || {};
          providerConfig = providersConfig[providerName] || {};
          providerConfig = applyResolvedOverwrites(providerConfig);
        }

        if (Object.keys(providerConfig).length === 0) {
          return {
            healthy: false,
            timestamp: timestampFormatter.format(),
            error: `${providerName} provider not configured`,
          };
        }

        // Apply UI overrides
        providerConfig = _applyOverrides(providerConfig, overrides);

        const healthResult = await _checkProviderHealth(providerName, providerConfig, request, integration);
        const connectionDetails = _buildConnectionDetails(providerConfig, integration, envVars);
        connectionDetails._overrides_applied = {
          proxy: overrides.proxy_url !== undefined,
          ssl: overrides.verify_ssl !== undefined || overrides.ca_bundle !== undefined,
          auth: !!(overrides.auth_header_name && overrides.auth_header_value),
        };
        const configDebug = _buildConfigDebugInfo(providerName, configResolutionSource, providerConfig);
        return { ...healthResult, connection_details: connectionDetails, config_debug: configDebug };
      } catch (err) {
        baseLogger.error(`Health check failed: ${err.message}`);
        return {
          healthy: false,
          timestamp: timestampFormatter.format(),
          error: err.message,
        };
      }
    }
  );

  // ── Config route ────────────────────────────────────────────────────

  if (integration.configUsesSdkResolution) {
    server.get(
      `/healthz/admin/integration/${integrationName}/config`,
      async (request, reply) => {
        baseLogger.info("Config check");

        try {
          let providerConfig = null;

          if (server.configSdk?.getResolved) {
            try {
              const { ComputeScope } = await import("app_yaml_overwrites");
              const resolvedConfig = await server.configSdk.getResolved(
                ComputeScope.REQUEST,
                request
              );
              providerConfig = resolvedConfig?.providers?.[providerName] || null;
              providerConfig = applyResolvedOverwrites(providerConfig);
              baseLogger.info("Using SDK-resolved config with REQUEST scope");
            } catch (err) {
              baseLogger.warn(`SDK resolution failed, falling back: ${err.message}`);
            }
          }

          if (!providerConfig) {
            const config = await getConfigFromServer(server);
            const providersConfig =
              (config.get ? config.get("providers") : config.providers) || {};
            providerConfig = providersConfig[providerName] || {};
            providerConfig = applyResolvedOverwrites(providerConfig);
            baseLogger.info("Using fallback config (raw)");
          }

          return {
            initialized: true,
            lifecycle_state: {
              config: server.hasDecorator("config"),
              sharedContext: server.hasDecorator("sharedContext"),
              sdk: server.hasDecorator("sdk"),
              configSdk: server.hasDecorator("configSdk"),
            },
            packages_loaded: {
              fetch_undici: true,
              auth_config: true,
              auth_encoding: true,
              healthz_diagnostics: true,
            },
            sdk_version: "1.0.0",
            [providerName]: configSanitizer.sanitize(providerConfig),
            env_vars_available: configSanitizer.checkEnvVars(envVars),
          };
        } catch (err) {
          return { initialized: false, error: err.message };
        }
      }
    );
  } else {
    server.get(
      `/healthz/admin/integration/${integrationName}/config`,
      async (request, reply) => {
        baseLogger.info("Config check");

        try {
          const config = await getConfigFromServer(server);
          const providersConfig =
            (config.get ? config.get("providers") : config.providers) || {};
          const providerConfig = providersConfig[providerName] || {};

          return {
            initialized: true,
            lifecycle_state: {
              config: server.hasDecorator("config"),
              sharedContext: server.hasDecorator("sharedContext"),
              sdk: server.hasDecorator("sdk"),
              configSdk: server.hasDecorator("configSdk"),
            },
            packages_loaded: {
              fetch_undici: true,
              auth_config: true,
              auth_encoding: true,
              healthz_diagnostics: true,
            },
            sdk_version: "1.0.0",
            [providerName]: configSanitizer.sanitize(providerConfig),
            env_vars_available: configSanitizer.checkEnvVars(envVars),
          };
        } catch (err) {
          return { initialized: false, error: err.message };
        }
      }
    );
  }
}


// ── Figma data routes ────────────────────────────────────────────────────────
//
// Exposes /healthz/admin/integration/figma/data for testing Figma API calls
// (get file, get file meta) using the same provider config + proxy pipeline.

function _registerFigmaDataRoutes(server) {
  const figmaIntegration = INTEGRATIONS.find((i) => i.providerName === "figma");
  if (!figmaIntegration) return;

  const baseLogger = fetchBaseClientLogger.create("fetch_base_client", "healthz_integration_figma_data");

  server.post(
    "/healthz/admin/integration/figma/data",
    async (request, reply) => {
      const { operation, file_id, overrides: bodyOverrides } = request.body || {};
      baseLogger.info(`Figma data: operation=${operation} file_id=${file_id}`);

      if (!operation) {
        return reply.code(400).send({ error: "operation is required" });
      }
      if (operation === "get_file" && !file_id) {
        return reply.code(400).send({ error: "file_id is required for get_file" });
      }

      try {
        // Resolve provider config (same pipeline as health check)
        let providerConfig = null;

        if (server.configSdk?.getResolved) {
          try {
            const { ComputeScope } = await import("app_yaml_overwrites");
            const resolvedConfig = await server.configSdk.getResolved(
              ComputeScope.REQUEST,
              request,
            );
            providerConfig = resolvedConfig?.providers?.figma || null;
            providerConfig = applyResolvedOverwrites(providerConfig);
          } catch (err) {
            baseLogger.warn(`SDK resolution failed: ${err.message}`);
          }
        }

        if (!providerConfig) {
          const config = await getConfigFromServer(server);
          const providersConfig =
            (config.get ? config.get("providers") : config.providers) || {};
          providerConfig = providersConfig.figma || {};
          providerConfig = applyResolvedOverwrites(providerConfig);
        }

        if (Object.keys(providerConfig).length === 0) {
          return { error: "figma provider not configured" };
        }

        // Apply UI overrides if provided
        if (bodyOverrides) {
          providerConfig = _applyOverrides(providerConfig, bodyOverrides);
        }

        // Build auth headers
        const apiKey = resolveApiKey(providerConfig);
        if (!apiKey) {
          return { error: "Figma API key not configured" };
        }

        let authHeaders;
        if (providerConfig._auth_header_override) {
          const { name, value } = providerConfig._auth_header_override;
          authHeaders = { [name]: value };
        } else {
          const authOptions = buildSdkAuthOptions(
            providerConfig,
            figmaIntegration.defaultAuthType || "custom_header",
            figmaIntegration.defaultHeaderName || "X-Figma-Token",
          );
          authHeaders = buildAuthHeaders(authOptions);
        }

        // Create AsyncClient (same proxy/auth config as health check pipeline)
        const baseUrl = providerConfig.base_url || "https://api.figma.com/v1";
        const clientConfig = providerConfig.client || {};
        const timeoutMs = clientConfig.timeout_ms || 30000;
        const customHeaders = providerConfig.headers || {};
        const proxyUrlConfig = providerConfig.proxy_url;
        const envProxy = getEnvProxy();
        const resolvedProxy = proxyUrlConfig === false
          ? null
          : (typeof proxyUrlConfig === "string" && proxyUrlConfig
            ? proxyUrlConfig
            : (envProxy.https || envProxy.http || null));

        const client = new AsyncClient({
          baseUrl: baseUrl.replace(/\/+$/, ""),
          headers: { ...customHeaders, ...authHeaders },
          timeout: timeoutMs,
          verify: providerConfig.verify_ssl !== false,
          proxy: resolvedProxy,
          trust_env: proxyUrlConfig == null,
        });

        // Execute the requested operation
        const start = performance.now();

        if (operation === "get_file") {
          const encodedId = encodeURIComponent(file_id.trim());
          const response = await client.get(`/files/${encodedId}`);
          const latencyMs = Math.round(performance.now() - start);
          let body = null;
          try {
            body = await response.json();
          } catch {
            body = await response.text();
          }

          if (!response.ok) {
            return {
              success: false,
              operation,
              file_id,
              status_code: response.statusCode,
              latency_ms: latencyMs,
              error: typeof body === "string" ? body : JSON.stringify(body),
            };
          }

          // Return summary (full file can be huge — extract key metadata)
          const fileData = body;
          return {
            success: true,
            operation,
            file_id,
            status_code: response.statusCode,
            latency_ms: latencyMs,
            file: {
              name: fileData.name || null,
              lastModified: fileData.lastModified || null,
              version: fileData.version || null,
              schemaVersion: fileData.schemaVersion || null,
              thumbnailUrl: fileData.thumbnailUrl || null,
              role: fileData.role || null,
              editorType: fileData.editorType || null,
              document: fileData.document
                ? {
                    id: fileData.document.id,
                    name: fileData.document.name,
                    type: fileData.document.type,
                    childCount: Array.isArray(fileData.document.children)
                      ? fileData.document.children.length
                      : 0,
                    children: (fileData.document.children || []).map((c) => ({
                      id: c.id,
                      name: c.name,
                      type: c.type,
                      childCount: Array.isArray(c.children) ? c.children.length : 0,
                    })),
                  }
                : null,
            },
          };
        }

        return { error: `Unknown operation: ${operation}` };
      } catch (err) {
        baseLogger.error(`Figma data error: ${err.message}`);
        return {
          success: false,
          operation,
          error: err.message,
          latency_ms: 0,
        };
      }
    },
  );
}


// ── Catch-all for YAML-only providers (e.g. _type=compute) ──────────────────
// Fastify matches static routes before parametric, so this only fires for
// providers that are NOT in the INTEGRATIONS registry.

function _registerCatchAllRoute(server) {
  const registeredNames = new Set(INTEGRATIONS.map((i) => i.integrationName));
  const baseLogger = fetchBaseClientLogger.create("fetch_base_client", "healthz_integration_catchall");

  server.get(
    "/healthz/admin/integration/:integrationName",
    async (request, reply) => {
      const { integrationName } = request.params;
      // Normalize: route segment uses hyphens, YAML keys use underscores
      const providerName = integrationName.replace(/-/g, "_");
      baseLogger.info(`Catch-all health check: ${providerName}`);

      try {
        let providerConfig = null;
        let configResolutionSource = "fallback_startup";

        if (server.configSdk?.getResolved) {
          try {
            const { ComputeScope } = await import("app_yaml_overwrites");
            const resolvedConfig = await server.configSdk.getResolved(
              ComputeScope.REQUEST,
              request
            );
            providerConfig = resolvedConfig?.providers?.[providerName] || null;
            if (providerConfig) {
              providerConfig = applyResolvedOverwrites(providerConfig);
              configResolutionSource = "sdk_resolved";
            }
          } catch (err) {
            baseLogger.warn(`SDK resolution failed, falling back: ${err.message}`);
          }
        }

        if (!providerConfig) {
          const config = await getConfigFromServer(server);
          const providersConfig =
            (config.get ? config.get("providers") : config.providers) || {};
          providerConfig = providersConfig[providerName] || {};
          providerConfig = applyResolvedOverwrites(providerConfig);
        }

        if (Object.keys(providerConfig).length === 0) {
          return {
            healthy: false,
            timestamp: timestampFormatter.format(),
            error: `${providerName} provider not configured`,
          };
        }

        // Compute providers: return config without HTTP fetch
        if (providerConfig._type === "compute") {
          const configDebug = _buildConfigDebugInfo(providerName, configResolutionSource, providerConfig);
          return {
            provider: providerName,
            healthy: true,
            _type: "compute",
            status_code: null,
            latency_ms: 0,
            error: null,
            endpoint: null,
            model: providerConfig.model || null,
            timestamp: timestampFormatter.format(),
            diagnostics: [{ type: "compute:skip", timestamp: timestampFormatter.format(), metadata: { reason: "compute provider — no HTTP health check" } }],
            connection_details: _buildConnectionDetails(providerConfig, { providerName, envVars: [] }, []),
            config_debug: configDebug,
          };
        }

        // Non-compute, unknown provider — no registered health check
        return {
          healthy: false,
          timestamp: timestampFormatter.format(),
          error: `No health check registered for ${providerName}`,
        };
      } catch (err) {
        baseLogger.error(`Catch-all health check failed: ${err.message}`);
        return {
          healthy: false,
          timestamp: timestampFormatter.format(),
          error: err.message,
        };
      }
    }
  );

  // Config route for catch-all providers
  server.get(
    "/healthz/admin/integration/:integrationName/config",
    async (request, reply) => {
      const { integrationName } = request.params;
      const providerName = integrationName.replace(/-/g, "_");

      try {
        const config = await getConfigFromServer(server);
        const providersConfig =
          (config.get ? config.get("providers") : config.providers) || {};
        const providerConfig = providersConfig[providerName] || {};

        return {
          initialized: true,
          _type: providerConfig._type || null,
          [providerName]: configSanitizer.sanitize(providerConfig),
        };
      } catch (err) {
        return { initialized: false, error: err.message };
      }
    }
  );
}


export async function mount(server) {
  for (const integration of INTEGRATIONS) {
    _registerIntegration(server, integration);
  }

  // Register figma-specific data routes
  _registerFigmaDataRoutes(server);

  // Register catch-all for YAML-only providers (must be last — parametric)
  _registerCatchAllRoute(server);
}
