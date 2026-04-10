import { useState, useCallback, useEffect } from 'react';
import {
  Activity,
  FileText,
  Layers,
  Search,
  Server,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3 } from
'lucide-react';

import { services, loadRouterConfig, getEndpointsByTag, getEndpoint, type EndpointConfig } from './services';

/** Mask secrets: first 10 chars + *** + last 10 chars */
function maskSecret(value: string): string {
  if (value.length <= 20) return value.slice(0, 4) + '***';
  return value.slice(0, 10) + '***' + value.slice(-10);
}

/** Deep-mask string values that look like secrets in an object */
function maskSecrets(obj: unknown): unknown {
  if (typeof obj === 'string') {
    // Mask strings that look like tokens/keys (longer than 20 chars or contain common secret patterns)
    if (obj.length > 20 || /^(Bearer |sk-|ghp_|gho_|xox[bpsa]-|AKIA)/.test(obj)) {
      return maskSecret(obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) return obj.map(maskSecrets);
  if (obj && typeof obj === 'object') {
    const masked: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      // Always mask values for keys that sound like secrets
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

type TabType = 'health' | 'embed' | 'embed-query' | 'embed-batch' | 'visualize';

const BASE_PATH = '/apps/test-integration/embedding-endpoints';
const ALL_TABS: TabType[] = ['health', 'embed', 'embed-query', 'embed-batch', 'visualize'];

function getTabFromPath(): TabType {
  const suffix = window.location.pathname.replace(BASE_PATH, '').replace(/^\/+|\/+$/g, '');
  if (suffix && ALL_TABS.includes(suffix as TabType)) return suffix as TabType;
  return 'health';
}

function pushTabUrl(tab: TabType) {
  const url = `${BASE_PATH}/${tab}`;
  if (window.location.pathname !== url) {
    window.history.pushState(null, '', url);
  }
}

interface ErrorInfo {
  message: string;
  stack?: string;
}

interface RequestState {
  loading: boolean;
  error: ErrorInfo | null;
  request: unknown | null;
  response: unknown | null;
  duration: number | null;
}

const initialRequestState: RequestState = {
  loading: false,
  error: null,
  request: null,
  response: null,
  duration: null
};

type ResultTab = 'response' | 'request' | 'exception';

function DiagnosticPanel({ data: r }: {data: Record<string, unknown>;}) {
  const isOk = r.status === 'ok';
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${isOk ? 'border-green-200' : 'border-red-200'}`}>
      <div className="flex items-center gap-2 mb-4">
        {isOk ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
        <h3 className="font-semibold text-lg">{isOk ? 'SUCCESS' : 'FAILED'}</h3>
        {r.latency != null &&
        <span className="ml-auto text-sm text-gray-500">{String(r.latency)}</span>
        }
      </div>

      {isOk ?
      <div className="font-mono text-sm space-y-1">
          <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-1">
            <span className="text-gray-500">Model:</span>
            <span>{String(r.model)}</span>
            <span className="text-gray-500">Endpoint:</span>
            <span className="break-all">{String(r.endpoint)}</span>
            <span className="text-gray-500">Timeout:</span>
            <span>{String(r.timeout)}ms</span>
            <span className="text-gray-500">Proxy:</span>
            <span>{String(r.proxy_url)}</span>
          </div>
          <hr className="my-3 border-gray-200" />
          <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-1">
            <span className="text-gray-500">Sending:</span>
            <span className="text-blue-600">&quot;{String(r.test_text)}&quot;</span>
            <span className="text-gray-500">Dimension:</span>
            <span>{String(r.dimensions)}</span>
            <span className="text-gray-500">Latency:</span>
            <span>{String(r.latency)} ({String(r.latency_ms)}ms)</span>
            <span className="text-gray-500">Vec norm:</span>
            <span>{String(r.vector_norm)}</span>
            <span className="text-gray-500">Preview:</span>
            <span className="text-xs break-all">
              [{(r.vector_preview as number[] || []).map((v) => v.toFixed(6)).join(', ')}, ...]
            </span>
          </div>
        </div> :

      <div className="text-red-600 text-sm">{String(r.error)}</div>
      }
    </div>);

}

/** Provider route name for the embedding service (maps to providers.openai_embeddings in YAML) */
const EMBEDDING_PROVIDER_ROUTE = 'openai-embeddings';

function App() {
  const [configLoaded, setConfigLoaded] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [apiEndpoints, setApiEndpoints] = useState<Array<{key: string;} & EndpointConfig>>([]);
  const [server, setServer] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>(getTabFromPath);
  const [requestState, setRequestState] = useState<RequestState>(initialRequestState);
  const [resultTab, setResultTab] = useState<ResultTab>('response');
  const [connectionConfig, setConnectionConfig] = useState<Record<string, unknown> | null>(null);

  // Sync URL when tab changes
  useEffect(() => {
    pushTabUrl(activeTab);
  }, [activeTab]);

  // Handle browser back/forward
  useEffect(() => {
    const onPopState = () => setActiveTab(getTabFromPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Load config on mount
  useEffect(() => {
    loadRouterConfig().
    then(() => {
      const eps = getEndpointsByTag('api');
      setApiEndpoints(eps);
      if (eps.length > 0) setServer(eps[0].key);
      setConfigLoaded(true);
    }).
    catch((err) => {
      setConfigError(err.message);
    });
  }, []);

  // Fetch provider connection config (proxy, auth, ssl) from admin healthz
  useEffect(() => {
    if (!configLoaded || !server) return;
    const epConfig = getEndpoint(server);
    const adminUrl = `${epConfig.baseUrl}/healthz/admin/integration/${EMBEDDING_PROVIDER_ROUTE}`;
    (async () => {
      try {
        const res = await fetch(adminUrl);
        if (!res.ok) return;
        const data = await res.json();
        if (data.connection_details) {
          setConnectionConfig(data.connection_details);
        }
      } catch { /* non-critical */ }
    })();
  }, [configLoaded, server]);

  // Health diagnostic form
  const [healthText, setHealthText] = useState('Hello, this is a connection test.');
  const [healthModel, setHealthModel] = useState('text-embedding-3-small');

  // Form states
  const [embedInput, setEmbedInput] = useState('Hello, world!');
  const [embedModel, setEmbedModel] = useState('text-embedding-3-small');

  const [queryText, setQueryText] = useState('What is machine learning?');
  const [queryModel, setQueryModel] = useState('text-embedding-3-small');

  const [batchTexts, setBatchTexts] = useState(
    'The cat sat on the mat.\nMachine learning is fascinating.\nOpenAI makes embedding models.'
  );
  const [batchModel, setBatchModel] = useState('text-embedding-3-small');

  // Visualization state
  const [savedEmbeddings, setSavedEmbeddings] = useState<Array<{label: string;embedding: number[];dimensions: number;}>>([]);

  // Only access services after config is loaded
  const service = configLoaded ? services[server] : null;
  const baseUrl = service?.baseUrl ?? '';

  /** Build verbose request info including server-side connection config */
  const buildRequestInfo = useCallback((path: string, body: unknown) => {
    const epConfig = configLoaded ? getEndpoint(server) : null;
    const cd = connectionConfig;
    const obj = (v: unknown) => v && typeof v === 'object' && Object.keys(v as object).length > 0;
    return {
      method: 'POST',
      url: `${baseUrl}${path}`,
      headers: obj(cd?.headers) ? maskSecrets(cd!.headers) : (epConfig ? maskSecrets(epConfig.headers) : {}),
      auth: obj(cd?.auth) ? maskSecrets(cd!.auth) : '(not available)',
      resolved_auth_headers: obj(cd?.resolved_auth_headers) ? maskSecrets(cd!.resolved_auth_headers) : undefined,
      proxy: obj(cd?.proxy) ? maskSecrets(cd!.proxy) : (cd ? '(none)' : '(not available)'),
      ssl: obj(cd?.ssl) ? cd!.ssl : (cd ? '(none)' : '(not available)'),
      client: obj(cd?.client) ? cd!.client : undefined,
      endpoint_config: cd ? {
        base_url: cd.base_url,
        health_endpoint: cd.health_endpoint,
        method: cd.method,
        model: cd.model,
      } : {
        service_id: server,
        base_url: epConfig?.baseUrl,
        timeout: epConfig?.timeout,
      },
      env_vars_available: obj(cd?.env_vars_available) ? cd!.env_vars_available : undefined,
      body,
    };
  }, [configLoaded, server, baseUrl, connectionConfig]);

  const executeRequest = useCallback(
    async (request: unknown, fn: () => Promise<unknown>) => {
      setRequestState({ loading: true, error: null, request, response: null, duration: null });
      setResultTab('response');
      const start = performance.now();
      try {
        const response = await fn();
        const duration = performance.now() - start;
        setRequestState({ loading: false, error: null, request, response, duration });
      } catch (err) {
        const duration = performance.now() - start;
        const errorInfo: ErrorInfo = {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        };
        setRequestState({
          loading: false,
          error: errorInfo,
          request,
          response: null,
          duration
        });
        setResultTab('exception');
      }
    },
    []
  );

  const handleHealth = () => {
    const body = { text: healthText, model: healthModel };
    return executeRequest(
      buildRequestInfo('/health', body),
      () => service!.health(body)
    );
  };

  const handleEmbed = () => {
    const body = { input: embedInput, model: embedModel };
    return executeRequest(
      buildRequestInfo('/embed', body),
      async () => {
        const res = await service!.embed(body);
        if (res.data?.[0]?.embedding) {
          const label = embedInput.length > 40 ? embedInput.slice(0, 40) + '...' : embedInput;
          setSavedEmbeddings((prev) => [
          ...prev,
          { label, embedding: res.data[0].embedding, dimensions: res.data[0].embedding.length }]
          );
        }
        return res;
      }
    );
  };

  const handleEmbedQuery = () => {
    const body = { text: queryText, model: queryModel };
    return executeRequest(
      buildRequestInfo('/embed-query', body),
      async () => {
        const res = await service!.embedQuery(body);
        if (res.embedding) {
          const label = queryText.length > 40 ? queryText.slice(0, 40) + '...' : queryText;
          setSavedEmbeddings((prev) => [
          ...prev,
          { label, embedding: res.embedding, dimensions: res.dimensions }]
          );
        }
        return res;
      }
    );
  };

  const handleEmbedBatch = () => {
    const texts = batchTexts.split('\n').filter((t) => t.trim());
    const body = { input: texts, model: batchModel };
    return executeRequest(
      buildRequestInfo('/embed-batch', body),
      async () => {
        const res = await service!.embedBatch(body);
        if (res.data) {
          const newEntries = res.data.map((d, i) => ({
            label: texts[i].length > 40 ? texts[i].slice(0, 40) + '...' : texts[i],
            embedding: d.embedding,
            dimensions: d.embedding.length
          }));
          setSavedEmbeddings((prev) => [...prev, ...newEntries]);
        }
        return res;
      }
    );
  };

  /**
   * Compute cosine similarity between two vectors.
   */
  function cosineSimilarity(a: number[], b: number[]): number {
    const len = Math.min(a.length, b.length);
    let dot = 0,magA = 0,magB = 0;
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
  }

  const modelOptions = [
  'text-embedding-3-small',
  'text-embedding-3-large',
  'text-embedding-ada-002'];


  const tabs: {id: TabType;label: string;icon: React.ReactNode;}[] = [
  { id: 'health', label: 'Health', icon: <Activity className="w-4 h-4" /> },
  { id: 'embed', label: 'Embed', icon: <FileText className="w-4 h-4" /> },
  { id: 'embed-query', label: 'Embed Query', icon: <Search className="w-4 h-4" /> },
  { id: 'embed-batch', label: 'Embed Batch', icon: <Layers className="w-4 h-4" /> },
  { id: 'visualize', label: 'Similarity', icon: <BarChart3 className="w-4 h-4" /> }];


  // Show loading/error state for config
  if (configError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg max-w-md">
          <h2 className="font-semibold mb-2">Configuration Error</h2>
          <p className="text-sm">{configError}</p>
        </div>
      </div>);

  }

  if (!configLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading configuration...</span>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4" data-test-id="div-5dec2972">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Embedding Endpoints Tester</h1>
              <p className="text-sm text-gray-500">OpenAI-compatible embedding API</p>
            </div>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-gray-400" />
              <select
                value={server}
                onChange={(e) => setServer(e.target.value)}
                className="border rounded-md px-3 py-1.5 text-sm bg-white"
                disabled={!configLoaded}>

                {apiEndpoints.map((ep) =>
                <option key={ep.key} value={ep.key}>{ep.name || ep.key} — {ep.baseUrl}</option>
                )}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-4">
              <div data-test-id="div-e7862f32">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Endpoints
                </h3>
                <div className="space-y-1">
                  {tabs.map((tab) =>
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setRequestState(initialRequestState);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === tab.id ?
                    'bg-blue-50 text-blue-700 font-medium' :
                    'text-gray-600 hover:bg-gray-100'}`
                    }>

                      {tab.icon}
                      {tab.label}
                    </button>
                  )}
                </div>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-4">
            {/* Health Diagnostic Tab */}
            {activeTab === 'health' &&
            <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold mb-1">Embedding Connection Test</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    POST {baseUrl}/health &mdash; sends a test embedding and returns diagnostics
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Test Text</label>
                      <input
                      type="text"
                      value={healthText}
                      onChange={(e) => setHealthText(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 text-sm" />

                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <select
                      value={healthModel}
                      onChange={(e) => setHealthModel(e.target.value)}
                      className="border rounded-md px-3 py-2 text-sm">

                        {modelOptions.map((m) =>
                      <option key={m} value={m}>{m}</option>
                      )}
                      </select>
                    </div>
                    <button
                    onClick={handleHealth}
                    disabled={requestState.loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">

                      {requestState.loading ? 'Testing...' : 'Run Diagnostic'}
                    </button>
                  </div>
                </div>

                {/* Diagnostic Result Panel */}
                {requestState.response != null && !requestState.error && <DiagnosticPanel data={requestState.response as Record<string, unknown>} />}
              </div>
            }

            {/* Embed Tab */}
            {activeTab === 'embed' &&
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Embed</h2>
                <p className="text-sm text-gray-600 mb-4">
                  POST /api/llm/gemini-openai-embedding-v1/embed &mdash; OpenAI-compatible embedding endpoint
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Input Text</label>
                    <textarea
                    value={embedInput}
                    onChange={(e) => setEmbedInput(e.target.value)}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Enter text to embed..." />

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <select
                    value={embedModel}
                    onChange={(e) => setEmbedModel(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm">

                      {modelOptions.map((m) =>
                    <option key={m} value={m}>{m}</option>
                    )}
                    </select>
                  </div>
                  <button
                  onClick={handleEmbed}
                  disabled={requestState.loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">

                    {requestState.loading ? 'Embedding...' : 'Generate Embedding'}
                  </button>
                </div>
              </div>
            }

            {/* Embed Query Tab */}
            {activeTab === 'embed-query' &&
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Embed Query</h2>
                <p className="text-sm text-gray-600 mb-4">
                  POST /api/llm/gemini-openai-embedding-v1/embed-query &mdash; embed a single query, returns vector directly
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Query Text</label>
                    <textarea
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    rows={2}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Enter query to embed..." />

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <select
                    value={queryModel}
                    onChange={(e) => setQueryModel(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm">

                      {modelOptions.map((m) =>
                    <option key={m} value={m}>{m}</option>
                    )}
                    </select>
                  </div>
                  <button
                  onClick={handleEmbedQuery}
                  disabled={requestState.loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">

                    {requestState.loading ? 'Embedding...' : 'Embed Query'}
                  </button>
                </div>
              </div>
            }

            {/* Embed Batch Tab */}
            {activeTab === 'embed-batch' &&
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Embed Batch</h2>
                <p className="text-sm text-gray-600 mb-4">
                  POST /api/llm/gemini-openai-embedding-v1/embed-batch &mdash; embed multiple texts with auto sub-batching
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Texts (one per line)
                    </label>
                    <textarea
                    value={batchTexts}
                    onChange={(e) => setBatchTexts(e.target.value)}
                    rows={5}
                    className="w-full border rounded-md px-3 py-2 text-sm font-mono"
                    placeholder="Enter texts, one per line..." />

                    <p className="text-xs text-gray-400 mt-1">
                      {batchTexts.split('\n').filter((t) => t.trim()).length} text(s)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <select
                    value={batchModel}
                    onChange={(e) => setBatchModel(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm">

                      {modelOptions.map((m) =>
                    <option key={m} value={m}>{m}</option>
                    )}
                    </select>
                  </div>
                  <button
                  onClick={handleEmbedBatch}
                  disabled={requestState.loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">

                    {requestState.loading ? 'Embedding...' : 'Embed Batch'}
                  </button>
                </div>
              </div>
            }

            {/* Similarity Visualization Tab */}
            {activeTab === 'visualize' &&
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Cosine Similarity Matrix</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Embeddings generated from other tabs are automatically collected here.
                  The matrix shows pairwise cosine similarity.
                </p>
                {savedEmbeddings.length === 0 ?
              <div className="text-gray-400 text-sm py-8 text-center">
                    No embeddings yet. Use the Embed, Embed Query, or Embed Batch tabs to generate embeddings.
                  </div> :

              <>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {savedEmbeddings.length} embedding(s) collected
                      </span>
                      <button
                    onClick={() => setSavedEmbeddings([])}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">

                        Clear All
                      </button>
                    </div>

                    {/* Embeddings List */}
                    <div className="mb-4 space-y-1">
                      {savedEmbeddings.map((entry, i) =>
                  <div key={i} className="flex items-center gap-2 text-sm px-2 py-1 bg-gray-50 rounded">
                          <span className="font-mono text-gray-400 w-6 text-right">{i}</span>
                          <span className="flex-1 truncate">{entry.label}</span>
                          <span className="text-gray-400 text-xs">{entry.dimensions}d</span>
                          <button
                      onClick={() => setSavedEmbeddings((prev) => prev.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 text-xs">

                            remove
                          </button>
                        </div>
                  )}
                    </div>

                    {/* Similarity Matrix */}
                    {savedEmbeddings.length >= 2 &&
                <div className="overflow-x-auto">
                        <table className="text-xs font-mono">
                          <thead>
                            <tr>
                              <th className="p-1"></th>
                              {savedEmbeddings.map((_, j) =>
                        <th key={j} className="p-1 text-center text-gray-500 w-16">{j}</th>
                        )}
                            </tr>
                          </thead>
                          <tbody>
                            {savedEmbeddings.map((a, i) =>
                      <tr key={i}>
                                <td className="p-1 text-gray-500 text-right pr-2">{i}</td>
                                {savedEmbeddings.map((b, j) => {
                          const sim = cosineSimilarity(a.embedding, b.embedding);
                          const intensity = Math.max(0, Math.min(1, sim));
                          const bg = i === j ?
                          'bg-gray-100' :
                          `rgba(59, 130, 246, ${(intensity * 0.6).toFixed(2)})`;
                          return (
                            <td
                              key={j}
                              className="p-1 text-center w-16"
                              style={i !== j ? { backgroundColor: bg } : undefined}
                              title={`sim(${i}, ${j}) = ${sim.toFixed(6)}`}>

                                      <span className={i === j ? 'text-gray-400' : sim > 0.8 ? 'text-blue-900 font-semibold' : 'text-gray-700'}>
                                        {sim.toFixed(3)}
                                      </span>
                                    </td>);

                        })}
                              </tr>
                      )}
                          </tbody>
                        </table>
                      </div>
                }
                  </>
              }
              </div>
            }

            {/* Request/Response Panel */}
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Tabs */}
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
                {requestState.error &&
                <button
                  onClick={() => setResultTab('exception')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-1 ${
                  resultTab === 'exception' ?
                  'border-red-500 text-red-600' :
                  'border-transparent text-red-400 hover:text-red-600'}`
                  }>

                    <XCircle className="w-3 h-3" />
                    Exception
                  </button>
                }
                <div className="flex-1 flex items-center justify-end px-4 gap-2">
                  {requestState.duration !== null &&
                  <span className="text-xs text-gray-500">
                      {requestState.duration.toFixed(0)}ms
                    </span>
                  }
                  {requestState.loading &&
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  }
                  {requestState.response !== null && !requestState.loading &&
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  }
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {resultTab === 'response' &&
                <>
                    {requestState.error &&
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                        <span className="font-medium">Error:</span> {requestState.error.message}
                      </div>
                  }
                    {requestState.response !== null &&
                  <pre className="bg-gray-900 text-green-300 p-4 rounded-md text-sm overflow-x-auto max-h-80 whitespace-pre-wrap break-all">
                        {JSON.stringify(requestState.response, null, 2)}
                      </pre>
                  }
                    {!requestState.loading && requestState.response === null && !requestState.error &&
                  <p className="text-gray-400 text-sm">No response yet. Make a request above.</p>
                  }
                  </>
                }

                {resultTab === 'request' &&
                <>
                    {requestState.request !== null ?
                  <pre className="bg-gray-900 text-blue-300 p-4 rounded-md text-sm overflow-x-auto max-h-80 whitespace-pre-wrap break-all">
                        {JSON.stringify(requestState.request, null, 2)}
                      </pre> :

                  <p className="text-gray-400 text-sm">No request yet. Make a request above.</p>
                  }
                  </>
                }

                {resultTab === 'exception' && requestState.error &&
                <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
                      <span className="font-semibold">Error:</span> {requestState.error.message}
                    </div>
                    {requestState.error.stack &&
                  <div>
                        <p className="text-xs text-gray-500 mb-1 font-medium">Stack Trace:</p>
                        <pre className="bg-gray-900 text-red-300 p-4 rounded-md text-xs overflow-x-auto max-h-64 whitespace-pre-wrap">
                          {requestState.error.stack}
                        </pre>
                      </div>
                  }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}

export default App;