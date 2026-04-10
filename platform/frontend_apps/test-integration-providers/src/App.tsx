import { useState, useCallback, useEffect } from 'react';
import {
  Activity,
  Server,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Clock,
  AlertCircle,
  ChevronDown,
  Settings,
  FileText,
  Database,
  Search } from
'lucide-react';

/** Mask secrets: first 10 chars + *** + last 10 chars */
function maskSecret(value: string): string {
  if (value.length <= 20) return value.slice(0, 4) + '***';
  return value.slice(0, 10) + '***' + value.slice(-10);
}

/** Deep-mask string values that look like secrets in an object */
function maskSecrets(obj: unknown): unknown {
  if (typeof obj === 'string') {
    if (obj.length > 20 || /^(Bearer |sk-|ghp_|gho_|xox[bpsa]-|AKIA)/.test(obj)) {
      return maskSecret(obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) return obj.map(maskSecrets);
  if (obj && typeof obj === 'object') {
    const masked: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (/token|secret|key|password|auth|apikey|api_key/i.test(k) && typeof v === 'string') {
        masked[k] = maskSecret(v);
      } else {
        masked[k] = maskSecrets(v);
      }
    }
    return masked;
  }
  return obj;
}

interface ApiEndpoint {
  key: string;
  name?: string;
  baseUrl: string;
  tags?: string[];
  description?: string;
}

const API_BASE = '/api/runtime-app-config';

const BASE_PATH = '/apps/test-integration/providers';

/** Parse URL: /providers/<connection>/<provider> */
function getStateFromPath(): { connection: string | null; provider: string | null } {
  const parts = window.location.pathname.replace(BASE_PATH, '').replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  return {
    connection: parts[0] || null,
    provider: parts[1] || null,
  };
}

function pushStateUrl(connection: string | null, provider: string | null) {
  let url = BASE_PATH;
  if (connection) {
    url += `/${connection}`;
    if (provider) url += `/${provider}`;
  }
  if (window.location.pathname !== url) {
    window.history.pushState(null, '', url);
  }
}

// Map provider config keys to integration route names and display info
const PROVIDER_METADATA: Record<string, {routeName: string;displayName: string;description: string;}> = {
  openai: { routeName: 'openai', displayName: 'OpenAI', description: 'OpenAI API' },
  openai_embeddings: { routeName: 'openai-embeddings', displayName: 'OpenAI Embeddings', description: 'OpenAI Embeddings API' },
  anthropic: { routeName: 'anthropic', displayName: 'Anthropic', description: 'Claude AI API' },
  figma: { routeName: 'figma', displayName: 'Figma', description: 'Figma Design API' },
  github: { routeName: 'github', displayName: 'GitHub', description: 'GitHub API' },
  jira: { routeName: 'jira', displayName: 'Jira', description: 'Atlassian Jira' },
  confluence: { routeName: 'confluence', displayName: 'Confluence', description: 'Atlassian Confluence' },
  saucelabs: { routeName: 'saucelabs', displayName: 'Sauce Labs', description: 'Sauce Labs Testing' },
  servicenow: { routeName: 'servicenow', displayName: 'ServiceNow', description: 'ServiceNow Platform' },
  rally: { routeName: 'rally', displayName: 'Rally', description: 'Rally Software' },
  statsig: { routeName: 'statsig', displayName: 'Statsig', description: 'Statsig Feature Flags' },
  sonar: { routeName: 'sonar', displayName: 'SonarQube', description: 'SonarQube Code Analysis' },
  gemini_openai: { routeName: 'gemini-openai', displayName: 'Gemini OpenAI', description: 'Google Gemini via OpenAI SDK' },
  'gemini-openai': { routeName: 'gemini-openai', displayName: 'Gemini OpenAI', description: 'Google Gemini via OpenAI SDK' }
};

// Providers to exclude from the list (no health check endpoint)
const EXCLUDED_PROVIDERS = new Set(['akamai', 'localhost', 'global']);

interface Integration {
  id: string;
  name: string;
  description: string;
  configKey: string;
  _type?: string;
}

interface ConnectionDetails {
  base_url?: string;
  health_endpoint?: string | null;
  model?: string | null;
  method?: string;
  auth?: Record<string, unknown>;
  resolved_auth_headers?: Record<string, string>;
  headers?: Record<string, string>;
  proxy?: Record<string, unknown>;
  ssl?: Record<string, unknown>;
  client?: Record<string, unknown>;
  overwrite_from_env?: Record<string, string> | null;
  overwrite_from_context?: Record<string, unknown> | null;
  env_vars_available?: Record<string, boolean>;
}

interface DiagnosticEvent {
  type: string;
  timestamp: string;
  status?: number | null;
  error?: string | null;
  duration_ms?: number | null;
  metadata?: Record<string, unknown> | null;
}

interface ConfigDebugInfo {
  app_env?: string | null;
  loaded_files?: string[];
  config_resolution_source?: string;
  per_file_provider_config?: Record<string, Record<string, unknown>>;
  merged_provider_config?: Record<string, unknown>;
  _error?: string;
}

interface HealthCheckResult {
  healthy: boolean;
  _type?: string;
  status_code?: number | null;
  latency_ms?: number;
  error?: string;
  timestamp?: string;
  provider?: string;
  endpoint?: string | null;
  model?: string | null;
  diagnostics?: DiagnosticEvent[];
  connection_details?: ConnectionDetails;
  config_debug?: ConfigDebugInfo;
}

interface IntegrationState {
  loading: boolean;
  result: HealthCheckResult | null;
  error: string | null;
  duration: number | null;
  requestInfo: Record<string, unknown> | null;
}

const initialState: IntegrationState = {
  loading: false,
  result: null,
  error: null,
  duration: null,
  requestInfo: null,
};

type IntegrationStates = Record<string, IntegrationState>;

interface OverrideSettings {
  proxy: {active: boolean;mode: 'custom' | 'disabled';url: string;};
  ssl: {active: boolean;verify: boolean;caBundle: string;};
  auth: {active: boolean;headerName: string;headerValue: string;};
}

const defaultOverrides: OverrideSettings = {
  proxy: { active: false, mode: 'custom', url: '' },
  ssl: { active: false, verify: true, caBundle: '' },
  auth: { active: false, headerName: 'Authorization', headerValue: '' }
};

function buildOverridesBody(overrides: OverrideSettings): Record<string, unknown> | null {
  const body: Record<string, unknown> = {};
  let hasAny = false;

  if (overrides.proxy.active) {
    hasAny = true;
    body.proxy_url = overrides.proxy.mode === 'disabled' ? false : overrides.proxy.url || false;
  }
  if (overrides.ssl.active) {
    hasAny = true;
    body.verify_ssl = overrides.ssl.verify;
    if (overrides.ssl.caBundle) body.ca_bundle = overrides.ssl.caBundle;
  }
  if (overrides.auth.active && overrides.auth.headerValue) {
    hasAny = true;
    body.auth_header_name = overrides.auth.headerName;
    body.auth_header_value = overrides.auth.headerValue;
  }
  return hasAny ? body : null;
}

function App() {
  const initialUrl = getStateFromPath();
  const [server, setServer] = useState<string>(initialUrl.connection || '');
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [states, setStates] = useState<IntegrationStates>({});
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(initialUrl.provider);
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [appEnv, setAppEnv] = useState<string | null>(null);
  const [loadedFiles, setLoadedFiles] = useState<string[]>([]);

  // Sync URL when server or selection changes
  useEffect(() => {
    pushStateUrl(server || null, selectedIntegration);
  }, [server, selectedIntegration]);

  // Handle browser back/forward
  useEffect(() => {
    const onPopState = () => {
      const s = getStateFromPath();
      if (s.connection && s.connection !== server) setServer(s.connection);
      setSelectedIntegration(s.provider);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [server]);

  // Load api-tagged endpoints
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/endpoints/by-tag/api`);
        if (!res.ok) throw new Error('Failed to fetch endpoints');
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch endpoints');
        const eps: ApiEndpoint[] = data.endpoints;
        setApiEndpoints(eps);
        // Prefer connection from URL; fall back to first endpoint
        if (!server && eps.length > 0) setServer(eps[0].key);
      } catch {

        // Keep empty
      }})();
  }, []);

  const getBaseUrl = useCallback((serverId: string) => {
    const ep = apiEndpoints.find((e) => e.key === serverId);
    return ep?.baseUrl || '';
  }, [apiEndpoints]);

  // Fetch providers from server config — only called on user action
  const fetchProviders = useCallback(async () => {
    if (!server) return;
    setConfigLoading(true);
    setConfigError(null);

    try {
      const baseUrl = getBaseUrl(server);
      const response = await fetch(`${baseUrl}/healthz/admin/app-yaml-static-config/status`);

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.initialized) {
        throw new Error(data.error || 'Config not initialized');
      }

      setAppEnv(data.app_env || null);
      setLoadedFiles(data.loaded_files || []);

      const providers: string[] = data.providers || [];
      const providerTypes: Record<string, string> = data.provider_types || {};

      // Build integrations list from providers
      const integrationsFromConfig: Integration[] = providers.
      filter((p: string) => !EXCLUDED_PROVIDERS.has(p)).
      map((providerKey: string) => {
        const meta = PROVIDER_METADATA[providerKey];
        const pType = providerTypes[providerKey];
        if (meta) {
          return {
            id: meta.routeName,
            name: meta.displayName,
            description: pType === 'compute' ? `${meta.description} (compute)` : meta.description,
            configKey: providerKey,
            _type: pType,
          };
        }
        // Fallback for unknown providers
        return {
          id: providerKey,
          name: providerKey.charAt(0).toUpperCase() + providerKey.slice(1).replace(/_/g, ' '),
          description: pType === 'compute' ? `Compute provider` : `${providerKey} integration`,
          configKey: providerKey,
          _type: pType,
        };
      });

      setIntegrations(integrationsFromConfig);

      // Initialize states for all integrations
      const initialStates: IntegrationStates = {};
      for (const integration of integrationsFromConfig) {
        initialStates[integration.id] = { ...initialState };
      }
      setStates(initialStates);
      // Restore selection from URL, or clear
      const fromUrl = getStateFromPath();
      const match = fromUrl.provider && integrationsFromConfig.find((i) => i.id === fromUrl.provider);
      setSelectedIntegration(match ? match.id : null);
    } catch (err) {
      setConfigError(err instanceof Error ? err.message : String(err));
    } finally {
      setConfigLoading(false);
    }
  }, [server, getBaseUrl]);

  // Auto-fetch providers when navigating to a URL with a connection segment
  useEffect(() => {
    if (server && apiEndpoints.length > 0 && integrations.length === 0 && !configLoading && !configError) {
      fetchProviders();
    }
  }, [server, apiEndpoints]);

  const checkHealth = useCallback(async (integrationId: string, overrides?: OverrideSettings) => {
    const baseUrl = getBaseUrl(server);
    const url = `${baseUrl}/healthz/admin/integration/${integrationId}`;
    const body = overrides ? buildOverridesBody(overrides) : null;
    const hasOverrides = overrides && (overrides.proxy.active || overrides.ssl.active || overrides.auth.active);

    // Build base request descriptor (shown while loading)
    const baseRequest: Record<string, unknown> = {
      method: body ? 'POST' : 'GET',
      url,
      headers: body ? { 'Content-Type': 'application/json' } : '(loading...)',
      proxy: overrides?.proxy.active ? {
        mode: overrides.proxy.mode,
        url: overrides.proxy.mode === 'custom' ? overrides.proxy.url : '(disabled)',
      } : '(loading...)',
      ssl: overrides?.ssl.active ? {
        verify: overrides.ssl.verify,
        ca_bundle: overrides.ssl.caBundle || '(none)',
      } : '(loading...)',
      auth: overrides?.auth.active ? maskSecrets({
        header_name: overrides.auth.headerName,
        header_value: overrides.auth.headerValue,
      }) : '(loading...)',
      cache: '(none)',
      body: body ? maskSecrets(body) : null,
    };

    /** Enrich request info with actual server-side config from health check response */
    function enrichRequestInfo(data: HealthCheckResult | null): Record<string, unknown> {
      const cd = data?.connection_details;
      if (!cd) {
        // No connection_details — replace loading placeholders with not-available
        return {
          ...baseRequest,
          headers: hasOverrides ? baseRequest.headers : '(not returned by server)',
          proxy: hasOverrides ? baseRequest.proxy : '(not returned by server)',
          ssl: hasOverrides ? baseRequest.ssl : '(not returned by server)',
          auth: hasOverrides ? baseRequest.auth : '(not returned by server)',
        };
      }

      const obj = (v: unknown) => v && typeof v === 'object' && Object.keys(v as object).length > 0;

      return {
        method: baseRequest.method,
        url: baseRequest.url,
        endpoint_config: {
          base_url: cd.base_url,
          health_endpoint: cd.health_endpoint,
          method: cd.method,
          model: cd.model,
        },
        headers: obj(cd.headers) ? maskSecrets(cd.headers) : (body ? baseRequest.headers : '(none)'),
        resolved_auth_headers: obj(cd.resolved_auth_headers) ? maskSecrets(cd.resolved_auth_headers) : undefined,
        proxy: overrides?.proxy.active ? baseRequest.proxy : (obj(cd.proxy) ? maskSecrets(cd.proxy) : '(none)'),
        ssl: overrides?.ssl.active ? baseRequest.ssl : (obj(cd.ssl) ? cd.ssl : '(none)'),
        auth: overrides?.auth.active ? baseRequest.auth : (obj(cd.auth) ? maskSecrets(cd.auth) : '(none)'),
        client: obj(cd.client) ? cd.client : undefined,
        env_vars_available: obj(cd.env_vars_available) ? cd.env_vars_available : undefined,
        overwrite_from_env: obj(cd.overwrite_from_env) ? maskSecrets(cd.overwrite_from_env) : undefined,
        cache: '(none)',
        body: baseRequest.body,
      };
    }

    setStates((prev) => ({
      ...prev,
      [integrationId]: { loading: true, result: null, error: null, duration: null, requestInfo: baseRequest }
    }));

    const start = performance.now();
    try {
      const fetchOpts: RequestInit = body ?
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } :
      {};
      const response = await fetch(url, fetchOpts);
      const duration = performance.now() - start;
      const data: HealthCheckResult = await response.json();

      setStates((prev) => ({
        ...prev,
        [integrationId]: { loading: false, result: data, error: null, duration, requestInfo: enrichRequestInfo(data) }
      }));
    } catch (err) {
      const duration = performance.now() - start;
      setStates((prev) => ({
        ...prev,
        [integrationId]: {
          loading: false,
          result: null,
          error: err instanceof Error ? err.message : String(err),
          duration,
          requestInfo: enrichRequestInfo(null),
        }
      }));
    }
  }, [server, getBaseUrl]);

  const checkAllHealth = useCallback(async () => {
    const checks = integrations.map((integration) => checkHealth(integration.id));
    await Promise.all(checks);
  }, [integrations, checkHealth]);

  const getStatusColor = (state: IntegrationState | undefined): string => {
    if (!state) return 'text-gray-400';
    if (state.loading) return 'text-blue-500';
    if (state.error) return 'text-red-500';
    if (state.result?.healthy) return 'text-green-500';
    if (state.result && !state.result.healthy) return 'text-yellow-500';
    return 'text-gray-400';
  };

  const getStatusIcon = (state: IntegrationState | undefined) => {
    if (!state) return <Activity className="w-5 h-5" />;
    if (state.loading) return <Loader2 className="w-5 h-5 animate-spin" />;
    if (state.error) return <XCircle className="w-5 h-5" />;
    if (state.result?.healthy) return <CheckCircle className="w-5 h-5" />;
    if (state.result && !state.result.healthy) return <AlertCircle className="w-5 h-5" />;
    return <Activity className="w-5 h-5" />;
  };

  const anyLoading = Object.values(states).some((s) => s.loading);

  const selectedIntegrationData = integrations.find((i) => i.id === selectedIntegration);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4" data-test-id="div-4a40791f">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Provider Integration Health Tester</h1>
              <p className="text-sm text-gray-500">Test /healthz/admin/integration endpoints</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-400" />
                <select
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="border rounded-md px-3 py-1.5 text-sm bg-white">

                  {apiEndpoints.length === 0 && <option value="">Select a server...</option>}
                  {apiEndpoints.map((ep) =>
                  <option key={ep.key} value={ep.key}>{ep.name || ep.key} — {ep.baseUrl}</option>
                  )}
                </select>
              </div>
              <button
                onClick={fetchProviders}
                disabled={configLoading || !server}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50">

                {configLoading ?
                <Loader2 className="w-4 h-4 animate-spin" /> :

                <RefreshCw className="w-4 h-4" />
                }
                Load Providers
              </button>
              <button
                onClick={checkAllHealth}
                disabled={anyLoading || integrations.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">

                <RefreshCw className={`w-4 h-4 ${anyLoading ? 'animate-spin' : ''}`} />
                Check All
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* APP_ENV badge */}
        {appEnv &&
        <div className="mb-4 flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
              APP_ENV: {appEnv}
            </span>
            <span className="text-gray-500">
              Source: <span className="font-medium text-gray-700">AppYamlConfig</span>
            </span>
            {loadedFiles.length > 0 &&
          <span className="text-gray-500" title={loadedFiles.join('\n')}>
                {loadedFiles.length} {loadedFiles.length === 1 ? 'file' : 'files'} loaded
              </span>
          }
          </div>
        }

        {/* Inline error banner */}
        {configError &&
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-semibold">Configuration Error: </span>
              <span className="text-sm">{configError}</span>
            </div>
            <button
            onClick={fetchProviders}
            disabled={configLoading}
            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">

              Retry
            </button>
          </div>
        }

        {integrations.length === 0 && !configLoading && !configError ?
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center text-gray-500">
            <Server className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-700 mb-2">No providers loaded</p>
            <p className="text-sm mb-4">Select a server from the dropdown above and click "Load Providers" to fetch available integrations.</p>
          </div> :

        <div className="flex gap-6">
          {/* Integration List */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-900">Integrations ({integrations.length})</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {getBaseUrl(server)}/healthz/admin/integration/...
                </p>
              </div>
              <div className="divide-y max-h-[calc(100vh-240px)] overflow-y-auto">
                {integrations.map((integration) => {
                  const state = states[integration.id];
                  const isSelected = selectedIntegration === integration.id;
                  return (
                    <div
                      key={integration.id}
                      onClick={() => setSelectedIntegration(integration.id)}
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`
                      }>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={getStatusColor(state)}>
                              {getStatusIcon(state)}
                            </span>
                            <span className="font-medium text-gray-900 truncate">
                              {integration.name}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {integration.description}
                          </p>
                        </div>
                        {state?.duration !== null && state?.duration !== undefined &&
                        <div className="flex items-center gap-1 text-xs text-gray-400 ml-2">
                            <Clock className="w-3 h-3" />
                            {state.duration.toFixed(0)}ms
                          </div>
                        }
                      </div>
                    </div>);

                })}
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="flex-1">
            {selectedIntegrationData ?
            <IntegrationDetail
              integration={selectedIntegrationData}
              state={states[selectedIntegrationData.id] || initialState}
              onCheck={(overrides) => checkHealth(selectedIntegrationData.id, overrides)}
              baseUrl={getBaseUrl(server)} /> :


            <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select an integration from the list to view details</p>
                <p className="text-sm mt-2">Or click "Check All" to test all integrations</p>
              </div>
            }
          </div>
        </div>
        }
      </div>
    </div>);

}

interface IntegrationDetailProps {
  integration: Integration;
  state: IntegrationState;
  onCheck: (overrides?: OverrideSettings) => void;
  baseUrl: string;
}

function ConnectionDetailsSection({ details }: {details: ConnectionDetails;}) {
  const sections: Array<{label: string;data: unknown;}> = [
  { label: 'Endpoint', data: { base_url: details.base_url, health_endpoint: details.health_endpoint, method: details.method, model: details.model } },
  { label: 'Auth', data: details.auth },
  { label: 'Resolved Auth Headers', data: details.resolved_auth_headers },
  { label: 'Request Headers', data: details.headers },
  { label: 'Proxy', data: details.proxy },
  { label: 'SSL / TLS', data: details.ssl },
  { label: 'Client Config', data: details.client },
  { label: 'Env Vars Available', data: details.env_vars_available },
  { label: 'Overwrite from Env', data: details.overwrite_from_env },
  { label: 'Overwrite from Context', data: details.overwrite_from_context }];


  return (
    <div className="space-y-3">
      {sections.map(({ label, data }) => {
        if (data === null || data === undefined) return null;
        if (typeof data === 'object' && Object.keys(data as object).length === 0) return null;
        return (
          <div key={label}>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</h5>
            <div className="bg-gray-50 border rounded-md p-3">
              {typeof data === 'object' ?
              <div className="grid gap-1.5">
                  {Object.entries(data as Record<string, unknown>).map(([k, v]) =>
                <div key={k} className="flex items-start gap-2 text-sm font-mono">
                      <span className="text-gray-500 flex-shrink-0 min-w-[160px]">{k}:</span>
                      <span className={`break-all ${
                  v === true ? 'text-green-600' :
                  v === false ? 'text-red-500' :
                  v === null || v === undefined ? 'text-gray-400 italic' :
                  typeof v === 'string' && v.includes('***') ? 'text-amber-600' :
                  'text-gray-900'}`
                  }>
                        {v === null || v === undefined ? 'null' :
                    typeof v === 'object' ? JSON.stringify(v) :
                    String(v)}
                      </span>
                    </div>
                )}
                </div> :

              <span className="text-sm text-gray-900 font-mono">{String(data)}</span>
              }
            </div>
          </div>);

      })}
    </div>);

}

function ConfigDebugSection({ debug }: {debug: ConfigDebugInfo;}) {
  const [open, setOpen] = useState(false);
  const contributingFiles = Object.keys(debug.per_file_provider_config || {});

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">

        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900 text-sm">Config Debug (Verbose)</span>
          {debug.app_env &&
          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
              {debug.app_env}
            </span>
          }
          {debug.config_resolution_source &&
          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">
              {debug.config_resolution_source}
            </span>
          }
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open &&
      <div className="border-t px-4 py-4 space-y-4">
          {/* Loaded Files */}
          {debug.loaded_files && debug.loaded_files.length > 0 &&
        <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Loaded Files</h5>
              <div className="bg-gray-50 border rounded-md p-3">
                <div className="grid gap-1">
                  {debug.loaded_files.map((file) => {
                const contributes = contributingFiles.includes(file);
                return (
                  <div key={file} className="flex items-center gap-2 text-sm font-mono">
                        <span className={contributes ? 'text-green-600' : 'text-gray-400'}>
                          {contributes ? '\u2713' : '\u2013'}
                        </span>
                        <span className={contributes ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                          {file}
                        </span>
                        {contributes &&
                    <span className="text-xs text-green-600">(has provider config)</span>
                    }
                      </div>);

              })}
                </div>
              </div>
            </div>
        }

          {/* Per-File Provider Config */}
          {contributingFiles.length > 0 &&
        <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Per-File Provider Config</h5>
              <div className="space-y-2">
                {contributingFiles.map((fileName) => {
              const fileConfig = debug.per_file_provider_config![fileName];
              return (
                <div key={fileName}>
                      <div className="text-xs font-medium text-gray-600 mb-1 font-mono">{fileName}</div>
                      <div className="bg-gray-50 border rounded-md p-3">
                        <div className="grid gap-1.5">
                          {Object.entries(fileConfig).map(([k, v]) =>
                      <div key={k} className="flex items-start gap-2 text-sm font-mono">
                              <span className="text-gray-500 flex-shrink-0 min-w-[160px]">{k}:</span>
                              <span className={`break-all ${
                        v === true ? 'text-green-600' :
                        v === false ? 'text-red-500' :
                        v === null || v === undefined ? 'text-gray-400 italic' :
                        typeof v === 'string' && v.includes('***') ? 'text-amber-600' :
                        'text-gray-900'}`
                        }>
                                {v === null || v === undefined ? 'null' :
                          typeof v === 'object' ? JSON.stringify(v) :
                          String(v)}
                              </span>
                            </div>
                      )}
                        </div>
                      </div>
                    </div>);

            })}
              </div>
            </div>
        }

          {/* Merged Provider Config */}
          {debug.merged_provider_config && Object.keys(debug.merged_provider_config).length > 0 &&
        <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Merged Provider Config (Final)</h5>
              <div className="bg-gray-50 border rounded-md p-3">
                <div className="grid gap-1.5">
                  {Object.entries(debug.merged_provider_config).map(([k, v]) =>
              <div key={k} className="flex items-start gap-2 text-sm font-mono">
                      <span className="text-gray-500 flex-shrink-0 min-w-[160px]">{k}:</span>
                      <span className={`break-all ${
                v === true ? 'text-green-600' :
                v === false ? 'text-red-500' :
                v === null || v === undefined ? 'text-gray-400 italic' :
                typeof v === 'string' && v.includes('***') ? 'text-amber-600' :
                'text-gray-900'}`
                }>
                        {v === null || v === undefined ? 'null' :
                  typeof v === 'object' ? JSON.stringify(v) :
                  String(v)}
                      </span>
                    </div>
              )}
                </div>
              </div>
            </div>
        }

          {/* Error */}
          {debug._error &&
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-md text-sm">
              {debug._error}
            </div>
        }
        </div>
      }
    </div>);

}

function DiagnosticsSection({ diagnostics }: {diagnostics: DiagnosticEvent[];}) {
  const getEventColor = (type: string) => {
    if (type.includes('error')) return 'bg-red-100 text-red-800 border-red-200';
    if (type.includes('end')) return 'bg-green-100 text-green-800 border-green-200';
    if (type.includes('start')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-2">
      {diagnostics.map((diag, index) =>
      <div key={index} className="bg-gray-50 border rounded-md p-3 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-mono text-xs px-1.5 py-0.5 rounded border ${getEventColor(diag.type)}`}>
              {diag.type}
            </span>
            <span className="text-gray-500 text-xs">{diag.timestamp}</span>
            {diag.status !== undefined && diag.status !== null &&
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
          diag.status >= 200 && diag.status < 300 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`
          }>
                HTTP {diag.status}
              </span>
          }
            {diag.duration_ms !== undefined && diag.duration_ms !== null &&
          <span className="text-xs text-gray-500">
                {diag.duration_ms.toFixed(1)}ms
              </span>
          }
          </div>
          {diag.metadata &&
        <div className="mt-1.5 text-xs text-gray-600 font-mono">
              {Object.entries(diag.metadata).map(([k, v]) =>
          <span key={k} className="mr-3">{k}={String(v)}</span>
          )}
            </div>
        }
          {diag.error &&
        <p className="mt-1.5 text-red-600 text-sm">{diag.error}</p>
        }
        </div>
      )}
    </div>);

}

function OverrideToggle({ label, active, onToggle }: {label: string;active: boolean;onToggle: (v: boolean) => void;}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!active)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${active ? 'bg-blue-600' : 'bg-gray-300'}`}>

      <span className="sr-only">{label}</span>
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${active ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
    </button>);

}

function OverridePanel({ overrides, onChange }: {overrides: OverrideSettings;onChange: (o: OverrideSettings) => void;}) {
  const [open, setOpen] = useState(false);
  const activeCount = [overrides.proxy.active, overrides.ssl.active, overrides.auth.active].filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">

        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900 text-sm">Connection Overrides</span>
          {activeCount > 0 &&
          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
              {activeCount} active
            </span>
          }
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open &&
      <div className="border-t px-4 py-4 space-y-4">
          <p className="text-xs text-gray-500">Override server defaults for this request. Uses POST when any override is active.</p>

          {/* Proxy */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <OverrideToggle label="Proxy" active={overrides.proxy.active} onToggle={(v) => onChange({ ...overrides, proxy: { ...overrides.proxy, active: v } })} />
              <span className="text-sm font-medium text-gray-700">Proxy</span>
              {overrides.proxy.active &&
            <select
              value={overrides.proxy.mode}
              onChange={(e) => onChange({ ...overrides, proxy: { ...overrides.proxy, mode: e.target.value as 'custom' | 'disabled' } })}
              className="text-xs border rounded px-2 py-1 bg-white">

                  <option value="custom">Custom URL</option>
                  <option value="disabled">Disabled</option>
                </select>
            }
            </div>
            {overrides.proxy.active && overrides.proxy.mode === 'custom' &&
          <input
            type="text"
            placeholder="http://proxy.example.com:8080"
            value={overrides.proxy.url}
            onChange={(e) => onChange({ ...overrides, proxy: { ...overrides.proxy, url: e.target.value } })}
            className="w-full text-sm border rounded-md px-3 py-1.5 font-mono bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />

          }
          </div>

          {/* SSL / TLS */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <OverrideToggle label="SSL" active={overrides.ssl.active} onToggle={(v) => onChange({ ...overrides, ssl: { ...overrides.ssl, active: v } })} />
              <span className="text-sm font-medium text-gray-700">SSL / TLS</span>
            </div>
            {overrides.ssl.active &&
          <div className="space-y-2 pl-12">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                type="checkbox"
                checked={overrides.ssl.verify}
                onChange={(e) => onChange({ ...overrides, ssl: { ...overrides.ssl, verify: e.target.checked } })}
                className="rounded border-gray-300" />

                  Verify SSL certificates
                </label>
                <input
              type="text"
              placeholder="CA bundle path (optional)"
              value={overrides.ssl.caBundle}
              onChange={(e) => onChange({ ...overrides, ssl: { ...overrides.ssl, caBundle: e.target.value } })}
              className="w-full text-sm border rounded-md px-3 py-1.5 font-mono bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />

              </div>
          }
          </div>

          {/* Authorization */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <OverrideToggle label="Auth" active={overrides.auth.active} onToggle={(v) => onChange({ ...overrides, auth: { ...overrides.auth, active: v } })} />
              <span className="text-sm font-medium text-gray-700">Authorization</span>
            </div>
            {overrides.auth.active &&
          <div className="space-y-2 pl-12">
                <input
              type="text"
              placeholder="Header name (e.g. Authorization, x-api-key)"
              value={overrides.auth.headerName}
              onChange={(e) => onChange({ ...overrides, auth: { ...overrides.auth, headerName: e.target.value } })}
              className="w-full text-sm border rounded-md px-3 py-1.5 font-mono bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />

                <input
              type="text"
              placeholder="Header value (e.g. Bearer sk-xxx...)"
              value={overrides.auth.headerValue}
              onChange={(e) => onChange({ ...overrides, auth: { ...overrides.auth, headerValue: e.target.value } })}
              className="w-full text-sm border rounded-md px-3 py-1.5 font-mono bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />

              </div>
          }
          </div>
        </div>
      }
    </div>);

}

// Providers that have a "Data" tab in addition to "Health Check"
const PROVIDERS_WITH_DATA_TAB = new Set(['figma']);

interface FigmaDataResult {
  success?: boolean;
  operation?: string;
  file_id?: string;
  status_code?: number;
  latency_ms?: number;
  error?: string;
  file?: {
    name?: string;
    lastModified?: string;
    version?: string;
    schemaVersion?: number;
    thumbnailUrl?: string;
    role?: string;
    editorType?: string;
    document?: {
      id: string;
      name: string;
      type: string;
      childCount: number;
      children: Array<{id: string;name: string;type: string;childCount: number;}>;
    };
  };
}

function FigmaDataTab({ baseUrl }: {baseUrl: string;}) {
  const [fileId, setFileId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FigmaDataResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const fetchFile = useCallback(async () => {
    if (!fileId.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const start = performance.now();
    try {
      const res = await fetch(`${baseUrl}/healthz/admin/integration/figma/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'get_file', file_id: fileId.trim() })
      });
      const elapsed = performance.now() - start;
      setLatency(elapsed);

      const data: FigmaDataResult = await res.json();
      setResult(data);
    } catch (err) {
      setLatency(performance.now() - start);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl, fileId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && fileId.trim() && !loading) {
      fetchFile();
    }
  }, [fetchFile, fileId, loading]);

  return (
    <div className="space-y-4">
      {/* File ID Input */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" data-test-id="search-465347ab" />
          Get Figma File
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Test the Figma API connection by fetching a file. Uses the same provider config, proxy, and auth as the health check.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Figma file ID (e.g. arryGYFx8sSQ8VMiBmdN5e)"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm border rounded-md px-3 py-2 font-mono bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />

          <button
            onClick={fetchFile}
            disabled={loading || !fileId.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap">

            {loading ?
            <Loader2 className="w-4 h-4 animate-spin" /> :

            <Database className="w-4 h-4" />
            }
            Get File
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          POST {baseUrl}/healthz/admin/integration/figma/data
        </p>
      </div>

      {/* Error */}
      {error &&
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">Connection Error</span>
            {latency !== null &&
          <span className="text-xs text-red-400 ml-auto">{latency.toFixed(0)}ms</span>
          }
          </div>
          <p className="text-sm">{error}</p>
        </div>
      }

      {/* Result */}
      {result &&
      <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Response</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {result.latency_ms !== undefined &&
            <span>API: {result.latency_ms}ms</span>
            }
              {latency !== null &&
            <span>Round-trip: {latency.toFixed(0)}ms</span>
            }
            </div>
          </div>
          <div className="p-4 space-y-4">
            {/* Status Banner */}
            {result.success === false &&
          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-700">Failed</span>
                  {result.status_code &&
              <span className="text-sm text-red-600">Status: {result.status_code}</span>
              }
                </div>
                {result.error &&
            <p className="mt-2 text-sm text-red-700">{result.error}</p>
            }
              </div>
          }

            {result.success && result.file &&
          <>
                {/* File Metadata */}
                <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-700">File Retrieved</span>
                    {result.status_code &&
                <span className="text-sm text-green-600">Status: {result.status_code}</span>
                }
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {result.file.name &&
                <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 font-medium text-gray-900">{result.file.name}</span>
                      </div>
                }
                    {result.file.lastModified &&
                <div>
                        <span className="text-gray-500">Last Modified:</span>
                        <span className="ml-2 text-gray-900">{result.file.lastModified}</span>
                      </div>
                }
                    {result.file.version &&
                <div>
                        <span className="text-gray-500">Version:</span>
                        <span className="ml-2 font-mono text-gray-900">{result.file.version}</span>
                      </div>
                }
                    {result.file.schemaVersion !== undefined &&
                <div>
                        <span className="text-gray-500">Schema:</span>
                        <span className="ml-2 text-gray-900">v{result.file.schemaVersion}</span>
                      </div>
                }
                    {result.file.editorType &&
                <div>
                        <span className="text-gray-500">Editor:</span>
                        <span className="ml-2 text-gray-900">{result.file.editorType}</span>
                      </div>
                }
                    {result.file.role &&
                <div>
                        <span className="text-gray-500">Role:</span>
                        <span className="ml-2 text-gray-900">{result.file.role}</span>
                      </div>
                }
                  </div>
                </div>

                {/* Thumbnail */}
                {result.file.thumbnailUrl &&
            <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Thumbnail</h4>
                    <img
                src={result.file.thumbnailUrl}
                alt={result.file.name || 'File thumbnail'}
                className="max-w-xs rounded-md border shadow-sm" />

                  </div>
            }

                {/* Document Tree */}
                {result.file.document &&
            <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Document Structure ({result.file.document.childCount} top-level pages)
                    </h4>
                    <div className="bg-gray-50 border rounded-md p-3 space-y-1.5">
                      {(result.file.document.children || []).map((page) =>
                <div key={page.id} className="flex items-center gap-2 text-sm font-mono">
                          <span className="text-blue-500 text-xs px-1.5 py-0.5 bg-blue-50 rounded border border-blue-200">
                            {page.type}
                          </span>
                          <span className="text-gray-900 font-medium">{page.name}</span>
                          <span className="text-gray-400 text-xs">
                            ({page.childCount} children)
                          </span>
                          <span className="text-gray-300 text-xs ml-auto">{page.id}</span>
                        </div>
                )}
                    </div>
                  </div>
            }
              </>
          }

            {/* Raw JSON */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Raw Response</h4>
              <pre className="bg-gray-900 text-green-300 p-4 rounded-md text-sm overflow-x-auto max-h-[400px] whitespace-pre-wrap break-all">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      }

      {/* Empty state */}
      {!result && !error && !loading &&
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
          <Database className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          <p>Enter a Figma file ID and click "Get File" to test the API connection</p>
        </div>
      }
    </div>);

}

function IntegrationDetail({ integration, state, onCheck, baseUrl }: IntegrationDetailProps) {
  const [overrides, setOverrides] = useState<OverrideSettings>(defaultOverrides);
  const [activeTab, setActiveTab] = useState(0);
  const [resultTab, setResultTab] = useState<'response' | 'request'>('response');
  const url = `${baseUrl}/healthz/admin/integration/${integration.id}`;
  const hasActiveOverrides = overrides.proxy.active || overrides.ssl.active || overrides.auth.active;
  const hasDataTab = PROVIDERS_WITH_DATA_TAB.has(integration.id);
  const tabs = hasDataTab ? ['Health Check', 'Data'] : ['Health Check'];

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{integration.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{integration.description}</p>
            {activeTab === 0 &&
            <code className="block mt-3 text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                {hasActiveOverrides ? 'POST' : 'GET'} {url}
              </code>
            }
            {integration.configKey !== integration.id &&
            <p className="text-xs text-gray-400 mt-2">
                Config key: <code className="bg-gray-100 px-1 rounded">{integration.configKey}</code>
              </p>
            }
          </div>
          {activeTab === 0 &&
          <button
            onClick={() => onCheck(hasActiveOverrides ? overrides : undefined)}
            disabled={state.loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">

              {state.loading ?
            <Loader2 className="w-4 h-4 animate-spin" /> :

            <RefreshCw className="w-4 h-4" />
            }
              Check Health
            </button>
          }
        </div>
      </div>

      {/* Tabs (only if provider has data tab) */}
      {hasDataTab &&
      <nav className="flex border-b bg-white rounded-t-lg shadow-sm border border-b-0">
          {tabs.map((tab, i) =>
        <button
          key={tab}
          onClick={() => setActiveTab(i)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
          activeTab === i ?
          'border-blue-600 text-blue-600' :
          'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
          }>

              {tab}
            </button>
        )}
        </nav>
      }

      {/* Health Check Tab */}
      {activeTab === 0 &&
      <>
          {/* Override Panel */}
          <OverridePanel overrides={overrides} onChange={setOverrides} />

          {/* Result Card */}
          {(state.result || state.error || state.requestInfo) &&
        <div className="bg-white rounded-lg shadow-sm border">
              {/* Tab Bar */}
              <div className="flex border-b">
                <button
                  onClick={() => setResultTab('response')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  resultTab === 'response' ?
                  'border-blue-500 text-blue-600' :
                  'border-transparent text-gray-500 hover:text-gray-700'}`
                  }>
                  Response
                </button>
                <button
                  onClick={() => setResultTab('request')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  resultTab === 'request' ?
                  'border-blue-500 text-blue-600' :
                  'border-transparent text-gray-500 hover:text-gray-700'}`
                  }>
                  Request
                </button>
                <div className="flex-1 flex items-center justify-end px-4 gap-2">
                  {state.duration !== null &&
                  <span className="text-xs text-gray-500">{state.duration.toFixed(0)}ms</span>
                  }
                  {state.loading &&
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  }
                  {state.result?.healthy && !state.loading &&
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  }
                </div>
              </div>

              <div className="p-4">
                {/* Response Tab */}
                {resultTab === 'response' && <>
                {state.error ?
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">Connection Error</span>
                    </div>
                    <p className="text-sm">{state.error}</p>
                  </div> :
            state.result ?
            <div className="space-y-4">
                    {/* Status Summary */}
                    <div className={`p-4 rounded-md ${state.result.healthy ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <div className="flex items-center gap-2">
                        {state.result.healthy ?
                  <CheckCircle className="w-5 h-5 text-green-600" /> :
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  }
                        <span className={`font-semibold ${state.result.healthy ? 'text-green-700' : 'text-yellow-700'}`}>
                          {state.result.healthy ? 'Healthy' : 'Unhealthy'}
                        </span>
                        {state.result.status_code !== undefined && state.result.status_code !== null &&
                  <span className="ml-2 text-sm text-gray-600">
                            Status: {state.result.status_code}
                          </span>
                  }
                        {state.result.latency_ms !== undefined &&
                  <span className="ml-2 text-sm text-gray-600">
                            Latency: {state.result.latency_ms}ms
                          </span>
                  }
                      </div>
                      {state.result.error &&
                <p className="mt-2 text-sm text-yellow-800">{state.result.error}</p>
                }
                    </div>

                    {/* Details */}
                    {(state.result.endpoint || state.result.model || state.result.timestamp) &&
              <div className="grid grid-cols-2 gap-4 text-sm">
                        {state.result.endpoint &&
                <div>
                            <span className="text-gray-500">Endpoint:</span>
                            <span className="ml-2 text-gray-900">{state.result.endpoint}</span>
                          </div>
                }
                        {state.result.model &&
                <div>
                            <span className="text-gray-500">Model:</span>
                            <span className="ml-2 text-gray-900">{state.result.model}</span>
                          </div>
                }
                        {state.result.timestamp &&
                <div>
                            <span className="text-gray-500">Timestamp:</span>
                            <span className="ml-2 text-gray-900">{state.result.timestamp}</span>
                          </div>
                }
                        {state.result.provider &&
                <div>
                            <span className="text-gray-500">Provider:</span>
                            <span className="ml-2 text-gray-900">{state.result.provider}</span>
                          </div>
                }
                      </div>
              }

                    {/* Connection Details */}
                    {state.result.connection_details &&
              <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Connection Details</h4>
                        <ConnectionDetailsSection details={state.result.connection_details} />
                      </div>
              }

                    {/* Config Debug */}
                    {state.result.config_debug &&
              <div>
                        <ConfigDebugSection debug={state.result.config_debug} />
                      </div>
              }

                    {/* Diagnostics */}
                    {state.result.diagnostics && state.result.diagnostics.length > 0 &&
              <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Diagnostics ({state.result.diagnostics.length})</h4>
                        <DiagnosticsSection diagnostics={state.result.diagnostics} />
                      </div>
              }

                    {/* Raw JSON */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Raw Response</h4>
                      <pre className="bg-gray-900 text-green-300 p-4 rounded-md text-sm overflow-x-auto max-h-[600px] whitespace-pre-wrap break-all">
                        {JSON.stringify(state.result, null, 2)}
                      </pre>
                    </div>
                  </div> :
            null}
                </>}

                {/* Request Tab */}
                {resultTab === 'request' && <>
                  {state.requestInfo ?
                  <pre className="bg-gray-900 text-blue-300 p-4 rounded-md text-sm overflow-x-auto max-h-[600px] whitespace-pre-wrap break-all">
                    {JSON.stringify(state.requestInfo, null, 2)}
                  </pre> :
                  <p className="text-gray-400 text-sm">No request info available. Run a health check first.</p>
                  }
                </>}
              </div>
            </div>
        }

          {/* Empty state */}
          {!state.result && !state.error && !state.loading &&
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-3 text-gray-300" />
              <p>Click "Check Health" to test this integration</p>
            </div>
        }
        </>
      }

      {/* Data Tab — Figma */}
      {activeTab === 1 && integration.id === 'figma' &&
      <FigmaDataTab baseUrl={baseUrl} />
      }
    </div>);

}

export default App;