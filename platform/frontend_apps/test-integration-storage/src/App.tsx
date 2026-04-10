import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Activity,
  Server,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Clock,
  AlertCircle,
  Database,
  ChevronRight,
  FileText,
  Hash,
  Key,
  List,
  Tag,
  Table2,
  Columns,
  HardDrive,
  FolderOpen,
  File,
  Send,
  Trash2,
  Search,
  Plus,
  Copy } from
'lucide-react';

interface ApiEndpoint {
  key: string;
  name?: string;
  baseUrl: string;
  tags?: string[];
  description?: string;
}

const API_BASE = '/api/runtime-app-config';

// Storage service metadata — keys match yamlAppConfig storage section
const STORAGE_METADATA: Record<string, {routeName: string;displayName: string;description: string;}> = {
  postgres: { routeName: 'postgres', displayName: 'PostgreSQL', description: 'PostgreSQL Database' },
  redis: { routeName: 'redis', displayName: 'Redis', description: 'Redis Cache' },
  elasticsearch: { routeName: 'elasticsearch', displayName: 'Elasticsearch', description: 'Elasticsearch Search Engine' },
  s3: { routeName: 's3', displayName: 'AWS S3', description: 'AWS S3 Object Storage' },
  's3-cached-key': { routeName: 's3-cached-key', displayName: 'S3 Cached Key', description: 'S3 JSON Cache (get_client_factory)' }
};

interface StorageService {
  id: string;
  name: string;
  description: string;
  configKey: string;
}

interface HealthCheckResult {
  status: string;
  service: string;
  host?: string;
  port?: number | string;
  database?: string;
  vendor?: string;
  info?: string;
  version?: string;
  mode?: string;
  bucket?: string;
  region?: string;
  error?: string | {name: string;message: string;code?: string | null;cause?: {name: string;message: string;code?: string | null;} | null;};
}

interface ServiceState {
  loading: boolean;
  result: HealthCheckResult | null;
  error: string | null;
  duration: number | null;
}

const initialState: ServiceState = {
  loading: false,
  result: null,
  error: null,
  duration: null
};

type ServiceStates = Record<string, ServiceState>;

const BASE_PATH = '/apps/test-integration/storage';

function getServiceIdFromUrl(): string | null {
  const path = window.location.pathname;
  const prefix = BASE_PATH + '/';
  if (path.startsWith(prefix)) {
    const id = path.slice(prefix.length).replace(/\/+$/, '');
    return id || null;
  }
  return null;
}

function App() {
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [server, setServer] = useState<string>('');
  const [services, setServices] = useState<StorageService[]>([]);
  const [states, setStates] = useState<ServiceStates>({});
  const [selectedService, setSelectedService] = useState<string | null>(getServiceIdFromUrl);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  const navigateToService = useCallback((serviceId: string | null) => {
    setSelectedService(serviceId);
    const url = serviceId ? `${BASE_PATH}/${serviceId}` : BASE_PATH;
    window.history.pushState(null, '', url);
  }, []);

  // Sync selection on browser back/forward
  useEffect(() => {
    const onPopState = () => setSelectedService(getServiceIdFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Load api-tagged endpoints from endpoint config API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/endpoints/by-tag/api`);
        if (!res.ok) throw new Error('Failed to fetch endpoints');
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Invalid endpoint config');
        const eps: ApiEndpoint[] = data.endpoints;
        setApiEndpoints(eps);
        if (eps.length > 0) setServer(eps[0].key);
      } catch {

        // No endpoints available
      }})();
  }, []);

  const getBaseUrl = useCallback((serverId: string) => {
    const ep = apiEndpoints.find((e) => e.key === serverId);
    return ep?.baseUrl || '';
  }, [apiEndpoints]);

  const buildServicesFromKeys = (keys: string[]): StorageService[] =>
  keys.map((key) => {
    const meta = STORAGE_METADATA[key];
    if (meta) {
      return { id: meta.routeName, name: meta.displayName, description: meta.description, configKey: key };
    }
    return {
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      description: `${key} storage service`,
      configKey: key
    };
  });

  const initStates = (svcs: StorageService[]) => {
    const init: ServiceStates = {};
    for (const svc of svcs) {
      init[svc.id] = { ...initialState };
    }
    return init;
  };

  // Load storage services — try yamlAppConfig, fall back to STORAGE_METADATA keys
  useEffect(() => {
    const fetchStorageConfig = async () => {
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

        // Use storage keys from yamlAppConfig if present, otherwise default
        const storageKeys: string[] = data.storage ?
        Object.keys(data.storage) :
        Object.keys(STORAGE_METADATA);

        const svcs = buildServicesFromKeys(storageKeys);
        setServices(svcs);
        setStates(initStates(svcs));
        setConfigLoading(false);
      } catch {
        // Fallback to hardcoded storage keys from STORAGE_METADATA
        const svcs = buildServicesFromKeys(Object.keys(STORAGE_METADATA));
        setServices(svcs);
        setStates(initStates(svcs));
        setConfigError(null);
        setConfigLoading(false);
      }
    };

    fetchStorageConfig();
  }, [server, getBaseUrl]);

  const checkHealth = useCallback(async (serviceId: string) => {
    const baseUrl = getBaseUrl(server);
    const url = `${baseUrl}/healthz/${serviceId}`;

    setStates((prev) => ({
      ...prev,
      [serviceId]: { loading: true, result: null, error: null, duration: null }
    }));

    const start = performance.now();
    try {
      const response = await fetch(url);
      const duration = performance.now() - start;
      const data: HealthCheckResult = await response.json();

      setStates((prev) => ({
        ...prev,
        [serviceId]: { loading: false, result: data, error: null, duration }
      }));
    } catch (err) {
      const duration = performance.now() - start;
      setStates((prev) => ({
        ...prev,
        [serviceId]: {
          loading: false,
          result: null,
          error: err instanceof Error ? err.message : String(err),
          duration
        }
      }));
    }
  }, [server, getBaseUrl]);

  const checkAllHealth = useCallback(async () => {
    const checks = services.map((svc) => checkHealth(svc.id));
    await Promise.all(checks);
  }, [services, checkHealth]);

  const getStatusColor = (state: ServiceState | undefined): string => {
    if (!state) return 'text-gray-400';
    if (state.loading) return 'text-blue-500';
    if (state.error) return 'text-red-500';
    if (state.result?.status === 'ok') return 'text-green-500';
    if (state.result?.status === 'error') return 'text-yellow-500';
    return 'text-gray-400';
  };

  const getStatusIcon = (state: ServiceState | undefined) => {
    if (!state) return <Database className="w-5 h-5" />;
    if (state.loading) return <Loader2 className="w-5 h-5 animate-spin" />;
    if (state.error) return <XCircle className="w-5 h-5" />;
    if (state.result?.status === 'ok') return <CheckCircle className="w-5 h-5" />;
    if (state.result?.status === 'error') return <AlertCircle className="w-5 h-5" />;
    return <Database className="w-5 h-5" />;
  };

  const anyLoading = Object.values(states).some((s) => s.loading);

  // Loading state
  if (configLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading storage config from {getBaseUrl(server)}...</span>
        </div>
      </div>);

  }

  // Error state
  if (configError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg max-w-md">
          <h2 className="font-semibold mb-2">Configuration Error</h2>
          <p className="text-sm mb-4">{configError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">

            Retry
          </button>
        </div>
      </div>);

  }

  const selectedServiceData = services.find((s) => s.id === selectedService);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4" data-test-id="div-06e2e7d7">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Storage Integration Health Tester</h1>
              <p className="text-sm text-gray-500">Test /healthz/&#123;postgres,redis,elasticsearch,s3&#125; endpoints</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-400" />
                <select
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="border rounded-md px-3 py-1.5 text-sm bg-white">

                  {apiEndpoints.map((ep) =>
                  <option key={ep.key} value={ep.key}>{ep.name || ep.key} — {ep.baseUrl}</option>
                  )}
                </select>
              </div>
              <button
                onClick={checkAllHealth}
                disabled={anyLoading || services.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">

                <RefreshCw className={`w-4 h-4 ${anyLoading ? 'animate-spin' : ''}`} />
                Check All
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Storage Service List */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-900">Storage Services ({services.length})</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {getBaseUrl(server)}/healthz/...
                </p>
              </div>
              <div className="divide-y max-h-[calc(100vh-240px)] overflow-y-auto">
                {services.map((svc) => {
                  const state = states[svc.id];
                  const isSelected = selectedService === svc.id;
                  return (
                    <div
                      key={svc.id}
                      onClick={() => navigateToService(svc.id)}
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
                              {svc.name}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {svc.description}
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
            {selectedServiceData ?
            <ServiceDetail
              service={selectedServiceData}
              state={states[selectedServiceData.id] || initialState}
              onCheck={() => checkHealth(selectedServiceData.id)}
              baseUrl={getBaseUrl(server)} /> :


            <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a storage service from the list to view details</p>
                <p className="text-sm mt-2">Or click "Check All" to test all services</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

}

interface ServiceDetailProps {
  service: StorageService;
  state: ServiceState;
  onCheck: () => void;
  baseUrl: string;
}

function getServiceTabs(serviceId: string): string[] {
  if (serviceId === 's3-cached-key') return ['Workbench'];
  if (serviceId === 'elasticsearch' || serviceId === 'redis' || serviceId === 'postgres' || serviceId === 's3') return ['Health Check', 'Data'];
  return ['Health Check'];
}

function ServiceDetail({ service, state, onCheck, baseUrl }: ServiceDetailProps) {
  const [activeTab, setActiveTab] = useState(0);
  const prevServiceId = useRef(service.id);
  useEffect(() => {
    if (prevServiceId.current !== service.id) {
      setActiveTab(0);
      prevServiceId.current = service.id;
    }
  }, [service.id]);
  const url = `${baseUrl}/healthz/${service.id}`;
  const tabs = getServiceTabs(service.id);

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{service.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{service.description}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex -mb-px">
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
        </div>

        <div className="p-4">
          {activeTab === 0 && service.id === 's3-cached-key' &&
          <S3CachedKeyTab baseUrl={baseUrl} />
          }
          {activeTab === 0 && service.id !== 's3-cached-key' &&
          <HealthCheckTab service={service} state={state} onCheck={onCheck} url={url} configKey={service.configKey} />
          }
          {activeTab === 1 && service.id === 'elasticsearch' &&
          <DataTab baseUrl={baseUrl} />
          }
          {activeTab === 1 && service.id === 'redis' &&
          <RedisDataTab baseUrl={baseUrl} />
          }
          {activeTab === 1 && service.id === 'postgres' &&
          <PostgresDataTab baseUrl={baseUrl} />
          }
          {activeTab === 1 && service.id === 's3' &&
          <S3DataTab baseUrl={baseUrl} />
          }
        </div>
      </div>
    </div>);

}

function HealthCheckTab({ service, state, onCheck, url, configKey





}: {service: StorageService;state: ServiceState;onCheck: () => void;url: string;configKey: string;}) {
  return (
    <div className="space-y-4">
      {/* Endpoint info + action */}
      <div className="flex items-start justify-between">
        <div>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
            GET {url}
          </code>
          {configKey !== service.id &&
          <p className="text-xs text-gray-400 mt-2">
              Config key: <code className="bg-gray-100 px-1 rounded">{configKey}</code>
            </p>
          }
        </div>
        <button
          onClick={onCheck}
          disabled={state.loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">

          {state.loading ?
          <Loader2 className="w-4 h-4 animate-spin" /> :

          <RefreshCw className="w-4 h-4" />
          }
          Check Health
        </button>
      </div>

      {/* Result */}
      {(state.result || state.error) &&
      <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Response</h3>
            {state.duration !== null &&
          <span className="text-xs text-gray-500">{state.duration.toFixed(0)}ms</span>
          }
          </div>
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
              <div className={`p-4 rounded-md ${state.result.status === 'ok' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center gap-2">
                  {state.result.status === 'ok' ?
              <CheckCircle className="w-5 h-5 text-green-600" /> :

              <AlertCircle className="w-5 h-5 text-yellow-600" />
              }
                  <span className={`font-semibold ${state.result.status === 'ok' ? 'text-green-700' : 'text-yellow-700'}`}>
                    {state.result.status === 'ok' ? 'Healthy' : 'Unhealthy'}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    Service: {state.result.service}
                  </span>
                </div>
                {state.result.error &&
            <p className="mt-2 text-sm text-yellow-800">
                    {typeof state.result.error === 'string' ?
              state.result.error :
              state.result.error.message}
                  </p>
            }
              </div>

              {/* Connection Details */}
              {(state.result.host || state.result.port || state.result.database || state.result.vendor || state.result.version || state.result.mode || state.result.info || state.result.bucket || state.result.region) &&
          <div className="grid grid-cols-2 gap-4 text-sm">
                  {state.result.host &&
            <div>
                      <span className="text-gray-500">Host:</span>
                      <span className="ml-2 text-gray-900">{state.result.host}</span>
                    </div>
            }
                  {state.result.port !== undefined && state.result.port !== null &&
            <div>
                      <span className="text-gray-500">Port:</span>
                      <span className="ml-2 text-gray-900">{state.result.port}</span>
                    </div>
            }
                  {state.result.database &&
            <div>
                      <span className="text-gray-500">Database:</span>
                      <span className="ml-2 text-gray-900">{state.result.database}</span>
                    </div>
            }
                  {state.result.vendor &&
            <div>
                      <span className="text-gray-500">Vendor:</span>
                      <span className="ml-2 text-gray-900">{state.result.vendor}</span>
                    </div>
            }
                  {state.result.version &&
            <div>
                      <span className="text-gray-500">Version:</span>
                      <span className="ml-2 text-gray-900">{state.result.version}</span>
                    </div>
            }
                  {state.result.mode &&
            <div>
                      <span className="text-gray-500">Mode:</span>
                      <span className="ml-2 text-gray-900">{state.result.mode}</span>
                    </div>
            }
                  {state.result.bucket &&
            <div>
                      <span className="text-gray-500">Bucket:</span>
                      <span className="ml-2 text-gray-900">{state.result.bucket}</span>
                    </div>
            }
                  {state.result.region &&
            <div>
                      <span className="text-gray-500">Region:</span>
                      <span className="ml-2 text-gray-900">{state.result.region}</span>
                    </div>
            }
                  {state.result.info &&
            <div className="col-span-2">
                      <span className="text-gray-500">Info:</span>
                      <span className="ml-2 text-gray-900">
                        {typeof state.result.info === 'object' ? JSON.stringify(state.result.info) : state.result.info}
                      </span>
                    </div>
            }
                </div>
          }

              {/* Raw JSON */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Raw Response</h4>
                <pre className="bg-gray-900 text-green-300 p-4 rounded-md text-sm overflow-x-auto max-h-80 whitespace-pre-wrap break-all">
                  {JSON.stringify(state.result, null, 2)}
                </pre>
              </div>
            </div> :
        null}
        </div>
      }

      {/* Empty state */}
      {!state.result && !state.error && !state.loading &&
      <div className="py-8 text-center text-gray-500">
          <Database className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          <p>Click "Check Health" to test this storage service</p>
        </div>
      }
    </div>);

}

// ─── Elasticsearch Data Tab ───────────────────────────────────────────────────

interface EsIndex {
  index: string;
  health: string;
  status: string;
  docsCount: string;
  storeSize: string;
}

interface EsDocument {
  _id: string;
  _source: Record<string, unknown>;
}

type DataView =
{level: 'indices';} |
{level: 'index';name: string;subTab: 'documents' | 'fields';} |
{level: 'document';indexName: string;docId: string;source: Record<string, unknown>;};

function DataTab({ baseUrl }: {baseUrl: string;}) {
  const [view, setView] = useState<DataView>({ level: 'indices' });
  const [indices, setIndices] = useState<EsIndex[]>([]);
  const [configuredIndex, setConfiguredIndex] = useState<string | null>(null);
  const [documents, setDocuments] = useState<EsDocument[]>([]);
  const [docTotal, setDocTotal] = useState(0);
  const [docFrom, setDocFrom] = useState(0);
  const [mappings, setMappings] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const DOC_PAGE_SIZE = 20;

  // Fetch indices
  const fetchIndices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/healthz/elasticsearch/indices`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setIndices(data.indices || []);
      setConfiguredIndex(data.configuredIndex || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Fetch documents for an index
  const fetchDocuments = useCallback(async (indexName: string, from: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/healthz/elasticsearch/indices/${encodeURIComponent(indexName)}/documents?from=${from}&size=${DOC_PAGE_SIZE}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDocuments(data.documents || []);
      setDocTotal(data.total || 0);
      setDocFrom(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Fetch mappings for an index
  const fetchMappings = useCallback(async (indexName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/healthz/elasticsearch/indices/${encodeURIComponent(indexName)}/mappings`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMappings(data.mappings || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Load data when view changes
  useEffect(() => {
    if (view.level === 'indices') {
      fetchIndices();
    } else if (view.level === 'index') {
      if (view.subTab === 'documents') {
        fetchDocuments(view.name, 0);
      } else {
        fetchMappings(view.name);
      }
    }
  }, [view, fetchIndices, fetchDocuments, fetchMappings]);

  const navigateToIndices = () => setView({ level: 'indices' });

  const navigateToIndex = (name: string, subTab: 'documents' | 'fields' = 'documents') =>
  setView({ level: 'index', name, subTab });

  const navigateToDocument = (indexName: string, doc: EsDocument) =>
  setView({ level: 'document', indexName, docId: doc._id, source: doc._source });

  // Breadcrumb
  const breadcrumb =
  <div className="flex items-center gap-1 text-sm mb-4">
      <button
      onClick={navigateToIndices}
      className={`hover:text-blue-600 ${view.level === 'indices' ? 'font-semibold text-gray-900' : 'text-blue-600'}`}>

        Indices
      </button>
      {(view.level === 'index' || view.level === 'document') &&
    <>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <button
        onClick={() => navigateToIndex(view.level === 'index' ? view.name : view.indexName)}
        className={`hover:text-blue-600 ${view.level === 'index' ? 'font-semibold text-gray-900' : 'text-blue-600'}`}>

            {view.level === 'index' ? view.name : view.indexName}
          </button>
        </>
    }
      {view.level === 'document' &&
    <>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-900 truncate max-w-[200px]">{view.docId}</span>
        </>
    }
    </div>;


  if (loading) {
    return (
      <div>
        {breadcrumb}
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading...
        </div>
      </div>);

  }

  if (error) {
    return (
      <div>
        {breadcrumb}
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="font-semibold text-sm">Error</span>
          </div>
          <p className="text-sm">{error}</p>
        </div>
      </div>);

  }

  // ── Level 1: Index list ──
  if (view.level === 'indices') {
    return (
      <div>
        {breadcrumb}
        {configuredIndex &&
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
            <Tag className="w-3 h-3" />
            <span>ELASTIC_DB_INDEX = <code className="bg-gray-100 px-1 rounded font-mono">{configuredIndex}</code></span>
          </div>
        }
        {indices.length === 0 ?
        <div className="py-8 text-center text-gray-500">
            <Database className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p>No indices found</p>
          </div> :

        <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-3 py-2 font-medium">Index</th>
                  <th className="px-3 py-2 font-medium w-20">Health</th>
                  <th className="px-3 py-2 font-medium w-20">Status</th>
                  <th className="px-3 py-2 font-medium w-24 text-right">Docs</th>
                  <th className="px-3 py-2 font-medium w-24 text-right">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {indices.map((idx) => {
                const isConfigured = idx.index === configuredIndex;
                return (
                  <tr
                    key={idx.index}
                    onClick={() => navigateToIndex(idx.index)}
                    className={`cursor-pointer transition-colors hover:bg-blue-50 ${isConfigured ? 'bg-blue-50/50' : ''}`}>

                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-mono text-gray-900">{idx.index}</span>
                          {isConfigured &&
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">ENV</span>
                        }
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                      idx.health === 'green' ? 'bg-green-500' :
                      idx.health === 'yellow' ? 'bg-yellow-500' :
                      idx.health === 'red' ? 'bg-red-500' : 'bg-gray-400'}`
                      } />
                        <span className="text-gray-600">{idx.health}</span>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{idx.status}</td>
                      <td className="px-3 py-2 text-right text-gray-600 font-mono">{idx.docsCount}</td>
                      <td className="px-3 py-2 text-right text-gray-600 font-mono">{idx.storeSize}</td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </div>);

  }

  // ── Level 2: Index detail (documents / fields sub-tabs) ──
  if (view.level === 'index') {
    const subTabs = ['documents', 'fields'] as const;
    return (
      <div>
        {breadcrumb}
        {/* Sub-tab bar */}
        <div className="flex gap-1 mb-4">
          {subTabs.map((st) =>
          <button
            key={st}
            onClick={() => setView({ ...view, subTab: st })}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
            view.subTab === st ?
            'bg-blue-100 text-blue-700 font-medium' :
            'text-gray-600 hover:bg-gray-100'}`
            }>

              {st === 'documents' ? <FileText className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
              {st === 'documents' ? 'Documents' : 'Fields'}
            </button>
          )}
        </div>

        {view.subTab === 'documents' &&
        <DocumentsPanel
          documents={documents}
          total={docTotal}
          from={docFrom}
          pageSize={DOC_PAGE_SIZE}
          onPageChange={(newFrom) => fetchDocuments(view.name, newFrom)}
          onSelectDoc={(doc) => navigateToDocument(view.name, doc)} />

        }

        {view.subTab === 'fields' &&
        <FieldsPanel mappings={mappings} />
        }
      </div>);

  }

  // ── Level 3: Document detail ──
  if (view.level === 'document') {
    return (
      <div>
        {breadcrumb}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>_id:</span>
            <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{view.docId}</code>
          </div>
          <pre className="bg-gray-900 text-green-300 p-4 rounded-md text-sm overflow-x-auto max-h-[60vh] whitespace-pre-wrap break-all">
            {JSON.stringify(view.source, null, 2)}
          </pre>
        </div>
      </div>);

  }

  return null;
}

// ── Documents panel ──

function DocumentsPanel({ documents, total, from, pageSize, onPageChange, onSelectDoc






}: {documents: EsDocument[];total: number;from: number;pageSize: number;onPageChange: (from: number) => void;onSelectDoc: (doc: EsDocument) => void;}) {
  if (documents.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <FileText className="w-8 h-8 mx-auto mb-3 text-gray-300" />
        <p>No documents in this index</p>
      </div>);

  }

  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(from / pageSize) + 1;

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500">{total} document{total !== 1 ? 's' : ''} total</div>
      <div className="border rounded-md divide-y">
        {documents.map((doc) => {
          const preview = Object.entries(doc._source).slice(0, 3);
          return (
            <div
              key={doc._id}
              onClick={() => onSelectDoc(doc)}
              className="px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors">

              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="font-mono text-sm text-gray-900 truncate">{doc._id}</span>
              </div>
              <div className="flex gap-3 text-xs text-gray-500 pl-5.5">
                {preview.map(([k, v]) =>
                <span key={k} className="truncate max-w-[180px]">
                    <span className="text-gray-400">{k}:</span>{' '}
                    {typeof v === 'object' ? '{...}' : String(v)}
                  </span>
                )}
                {Object.keys(doc._source).length > 3 &&
                <span className="text-gray-400">+{Object.keys(doc._source).length - 3} more</span>
                }
              </div>
            </div>);

        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 &&
      <div className="flex items-center justify-between text-sm">
          <button
          onClick={() => onPageChange(Math.max(0, from - pageSize))}
          disabled={from === 0}
          className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-default">

            Previous
          </button>
          <span className="text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
          onClick={() => onPageChange(from + pageSize)}
          disabled={from + pageSize >= total}
          className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-default">

            Next
          </button>
        </div>
      }
    </div>);

}

// ── Fields panel ──

interface FieldMapping {
  name: string;
  type: string;
  fields?: Record<string, unknown>;
}

function flattenMappingProperties(
properties: Record<string, any>,
prefix = '')
: FieldMapping[] {
  const result: FieldMapping[] = [];
  for (const [name, def] of Object.entries(properties)) {
    const fullName = prefix ? `${prefix}.${name}` : name;
    result.push({
      name: fullName,
      type: def.type || (def.properties ? 'object' : 'unknown'),
      fields: def.fields
    });
    if (def.properties) {
      result.push(...flattenMappingProperties(def.properties, fullName));
    }
  }
  return result;
}

function FieldsPanel({ mappings }: {mappings: Record<string, unknown> | null;}) {
  if (!mappings) return null;

  const properties = (mappings as any)?.properties as Record<string, any> | undefined;
  if (!properties || Object.keys(properties).length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <List className="w-8 h-8 mx-auto mb-3 text-gray-300" />
        <p>No field mappings found for this index</p>
      </div>);

  }

  const fields = flattenMappingProperties(properties);

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-gray-500">
            <th className="px-3 py-2 font-medium">Field</th>
            <th className="px-3 py-2 font-medium w-32">Type</th>
            <th className="px-3 py-2 font-medium w-40">Sub-fields</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {fields.map((f) => {
            const depth = f.name.split('.').length - 1;
            return (
              <tr key={f.name} className={depth > 0 ? 'bg-gray-50/50' : ''}>
                <td className="px-3 py-2">
                  <span className="font-mono text-gray-900" style={{ paddingLeft: depth * 12 }}>
                    {f.name}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  f.type === 'text' ? 'bg-green-100 text-green-700' :
                  f.type === 'keyword' ? 'bg-blue-100 text-blue-700' :
                  f.type === 'long' || f.type === 'integer' || f.type === 'float' || f.type === 'double' ? 'bg-purple-100 text-purple-700' :
                  f.type === 'date' ? 'bg-orange-100 text-orange-700' :
                  f.type === 'boolean' ? 'bg-yellow-100 text-yellow-700' :
                  f.type === 'object' ? 'bg-gray-100 text-gray-700' :
                  'bg-gray-100 text-gray-600'}`
                  }>
                    {f.type}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-gray-500 font-mono">
                  {f.fields ? Object.keys(f.fields).join(', ') : ''}
                </td>
              </tr>);

          })}
        </tbody>
      </table>
    </div>);

}

// ─── Redis Data Tab ───────────────────────────────────────────────────────────

interface RedisKeyEntry {
  key: string;
  type: string;
}

interface RedisNamespace {
  name: string;
  count: number;
}

interface RedisKeyDetail {
  key: string;
  type: string;
  ttl: number;
  value: unknown;
}

type RedisView =
{level: 'namespaces';} |
{level: 'keys';namespace: string | null;pattern: string;} |
{level: 'key';detail: RedisKeyDetail;};

function RedisDataTab({ baseUrl }: {baseUrl: string;}) {
  const [view, setView] = useState<RedisView>({ level: 'namespaces' });
  const [namespaces, setNamespaces] = useState<RedisNamespace[]>([]);
  const [dbSize, setDbSize] = useState(0);
  const [dbNum, setDbNum] = useState(0);
  const [keys, setKeys] = useState<RedisKeyEntry[]>([]);
  const [scanCursor, setScanCursor] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch namespaces
  const fetchNamespaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/healthz/redis/namespaces`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNamespaces(data.namespaces || []);
      setDbSize(data.dbSize || 0);
      setDbNum(data.db ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Fetch keys with pattern
  const fetchKeys = useCallback(async (pattern: string, cursor = '0') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/healthz/redis/keys?pattern=${encodeURIComponent(pattern)}&cursor=${cursor}&count=50`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (cursor === '0') {
        setKeys(data.keys || []);
      } else {
        setKeys((prev) => [...prev, ...(data.keys || [])]);
      }
      setScanCursor(data.cursor || '0');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Fetch key detail
  const fetchKeyDetail = useCallback(async (keyName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/healthz/redis/key?name=${encodeURIComponent(keyName)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setView({ level: 'key', detail: data });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Load data when view changes
  useEffect(() => {
    if (view.level === 'namespaces') {
      fetchNamespaces();
    } else if (view.level === 'keys') {
      fetchKeys(view.pattern, '0');
    }
  }, [view.level, view.level === 'keys' ? (view as any).pattern : null, fetchNamespaces, fetchKeys]);

  const navigateToNamespaces = () => setView({ level: 'namespaces' });
  const navigateToKeys = (ns: string | null) => {
    const pattern = ns && ns !== '(root)' ? `${ns}:*` : '*';
    setView({ level: 'keys', namespace: ns, pattern });
  };

  // Breadcrumb
  const breadcrumbNs = view.level === 'keys' ? (view as any).namespace : view.level === 'key' ? null : null;
  const breadcrumb =
  <div className="flex items-center gap-1 text-sm mb-4">
      <button
      onClick={navigateToNamespaces}
      className={`hover:text-blue-600 ${view.level === 'namespaces' ? 'font-semibold text-gray-900' : 'text-blue-600'}`}>

        Namespaces
      </button>
      {view.level === 'keys' &&
    <>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-900">{view.namespace || 'All Keys'}</span>
        </>
    }
      {view.level === 'key' &&
    <>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <button onClick={() => navigateToKeys(breadcrumbNs)} className="text-blue-600 hover:text-blue-700">
            Keys
          </button>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-900 truncate max-w-[200px] font-mono">{view.detail.key}</span>
        </>
    }
    </div>;


  if (loading && view.level !== 'keys') {
    return (
      <div>
        {breadcrumb}
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading...
        </div>
      </div>);

  }

  if (error) {
    return (
      <div>
        {breadcrumb}
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="font-semibold text-sm">Error</span>
          </div>
          <p className="text-sm">{error}</p>
        </div>
      </div>);

  }

  // ── Level 1: Namespaces ──
  if (view.level === 'namespaces') {
    return (
      <div>
        {breadcrumb}
        <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
          <span>DB {dbNum}</span>
          <span>{dbSize} key{dbSize !== 1 ? 's' : ''} total</span>
        </div>
        {namespaces.length === 0 ?
        <div className="py-8 text-center text-gray-500">
            <Database className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p>No keys found</p>
          </div> :

        <div className="space-y-2">
            {/* Show all keys link */}
            <div
            onClick={() => navigateToKeys(null)}
            className="border rounded-md px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between">

              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">All Keys</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">{dbSize}</span>
            </div>
            {/* Namespace list */}
            <div className="border rounded-md divide-y">
              {namespaces.map((ns) =>
            <div
              key={ns.name}
              onClick={() => navigateToKeys(ns.name)}
              className="px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between">

                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-gray-900">{ns.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{ns.count}</span>
                </div>
            )}
            </div>
          </div>
        }
      </div>);

  }

  // ── Level 2: Keys list ──
  if (view.level === 'keys') {
    return (
      <div>
        {breadcrumb}
        <div className="mb-3 text-xs text-gray-500">
          Pattern: <code className="bg-gray-100 px-1 rounded font-mono">{view.pattern}</code>
        </div>
        {keys.length === 0 && !loading ?
        <div className="py-8 text-center text-gray-500">
            <Key className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p>No keys match this pattern</p>
          </div> :

        <div className="space-y-3">
            <div className="border rounded-md divide-y">
              {keys.map((k) =>
            <div
              key={k.key}
              onClick={() => fetchKeyDetail(k.key)}
              className="px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between">

                  <div className="flex items-center gap-2 min-w-0">
                    <RedisTypeIcon type={k.type} />
                    <span className="font-mono text-sm text-gray-900 truncate">{k.key}</span>
                  </div>
                  <RedisTypeBadge type={k.type} />
                </div>
            )}
            </div>
            {/* Load more */}
            {scanCursor !== '0' &&
          <div className="text-center">
                <button
              onClick={() => fetchKeys(view.pattern, scanCursor)}
              disabled={loading}
              className="px-4 py-1.5 border rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">

                  {loading ?
              <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Scanning...</span> :

              'Load more'
              }
                </button>
              </div>
          }
          </div>
        }
      </div>);

  }

  // ── Level 3: Key detail ──
  if (view.level === 'key') {
    const { detail } = view;
    return (
      <div>
        {breadcrumb}
        <div className="space-y-4">
          {/* Key metadata */}
          <div className="flex items-center gap-3 text-sm">
            <RedisTypeBadge type={detail.type} />
            <span className="text-gray-500">
              TTL: <span className="font-mono">{detail.ttl === -1 ? 'none' : detail.ttl === -2 ? 'expired' : `${detail.ttl}s`}</span>
            </span>
          </div>

          {/* Value display */}
          <RedisValueDisplay type={detail.type} value={detail.value} />
        </div>
      </div>);

  }

  return null;
}

// ── Redis type helpers ──

function RedisTypeBadge({ type }: {type: string;}) {
  const colors: Record<string, string> = {
    string: 'bg-green-100 text-green-700',
    hash: 'bg-blue-100 text-blue-700',
    list: 'bg-purple-100 text-purple-700',
    set: 'bg-orange-100 text-orange-700',
    zset: 'bg-yellow-100 text-yellow-700'
  };
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors[type] || 'bg-gray-100 text-gray-600'}`}>
      {type}
    </span>);

}

function RedisTypeIcon({ type }: {type: string;}) {
  switch (type) {
    case 'hash':return <Hash className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />;
    case 'list':return <List className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />;
    case 'set':return <Database className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />;
    case 'zset':return <List className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />;
    default:return <Key className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />;
  }
}

function RedisValueDisplay({ type, value }: {type: string;value: unknown;}) {
  if (value === null || value === undefined) {
    return (
      <div className="py-4 text-center text-gray-500 text-sm">No value</div>);

  }

  // String
  if (type === 'string') {
    return (
      <pre className="bg-gray-900 text-green-300 p-4 rounded-md text-sm overflow-x-auto max-h-[60vh] whitespace-pre-wrap break-all">
        {String(value)}
      </pre>);

  }

  // Hash
  if (type === 'hash' && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, string>);
    return (
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-3 py-2 font-medium">Field</th>
              <th className="px-3 py-2 font-medium">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {entries.map(([field, val]) =>
            <tr key={field}>
                <td className="px-3 py-2 font-mono text-gray-900">{field}</td>
                <td className="px-3 py-2 text-gray-600 break-all">{val}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>);

  }

  // List
  if (type === 'list' && typeof value === 'object') {
    const v = value as {items: string[];length: number;};
    return (
      <div className="space-y-2">
        <div className="text-xs text-gray-500">{v.length} item{v.length !== 1 ? 's' : ''}{v.length > 100 ? ' (showing first 100)' : ''}</div>
        <div className="border rounded-md divide-y">
          {v.items.map((item, i) =>
          <div key={i} className="px-3 py-2 flex items-start gap-3 text-sm">
              <span className="text-gray-400 font-mono text-xs w-8 text-right flex-shrink-0">{i}</span>
              <span className="text-gray-900 break-all">{item}</span>
            </div>
          )}
        </div>
      </div>);

  }

  // Set
  if (type === 'set' && typeof value === 'object') {
    const v = value as {members: string[];size: number;};
    return (
      <div className="space-y-2">
        <div className="text-xs text-gray-500">{v.size} member{v.size !== 1 ? 's' : ''}</div>
        <div className="border rounded-md divide-y">
          {v.members.map((member) =>
          <div key={member} className="px-3 py-2 text-sm text-gray-900 break-all font-mono">
              {member}
            </div>
          )}
        </div>
      </div>);

  }

  // Sorted set
  if (type === 'zset' && typeof value === 'object') {
    const v = value as {items: {member: string;score: string | number;}[];size: number;};
    return (
      <div className="space-y-2">
        <div className="text-xs text-gray-500">{v.size} member{v.size !== 1 ? 's' : ''}{v.size > 100 ? ' (showing first 100)' : ''}</div>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-3 py-2 font-medium">Member</th>
                <th className="px-3 py-2 font-medium w-24 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {v.items.map((item) =>
              <tr key={item.member}>
                  <td className="px-3 py-2 font-mono text-gray-900 break-all">{item.member}</td>
                  <td className="px-3 py-2 text-right font-mono text-gray-600">{item.score}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>);

  }

  // Fallback: raw JSON
  return (
    <pre className="bg-gray-900 text-green-300 p-4 rounded-md text-sm overflow-x-auto max-h-[60vh] whitespace-pre-wrap break-all">
      {JSON.stringify(value, null, 2)}
    </pre>);

}

// ─── PostgreSQL Data Tab ──────────────────────────────────────────────────────

interface PgTable {
  name: string;
  type: string;
  estimatedRows: number;
}

interface PgColumn {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  maxLength: number | null;
  precision: number | null;
}

type PgView =
{level: 'schemas';} |
{level: 'tables';schema: string;} |
{level: 'table';schema: string;table: string;subTab: 'rows' | 'columns';} |
{level: 'row';schema: string;table: string;row: Record<string, unknown>;};

function PostgresDataTab({ baseUrl }: {baseUrl: string;}) {
  const [view, setView] = useState<PgView>({ level: 'schemas' });
  const [schemas, setSchemas] = useState<string[]>([]);
  const [configuredSchema, setConfiguredSchema] = useState<string>('public');
  const [tables, setTables] = useState<PgTable[]>([]);
  const [columns, setColumns] = useState<PgColumn[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [rowTotal, setRowTotal] = useState(0);
  const [rowOffset, setRowOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ROW_PAGE_SIZE = 20;

  // Fetch schemas
  const fetchSchemas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/healthz/postgres/schemas`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSchemas(data.schemas || []);
      setConfiguredSchema(data.configuredSchema || 'public');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Fetch tables for a schema
  const fetchTables = useCallback(async (schema: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/healthz/postgres/schemas/${encodeURIComponent(schema)}/tables`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTables(data.tables || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Fetch columns for a table
  const fetchColumns = useCallback(async (schema: string, table: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/healthz/postgres/schemas/${encodeURIComponent(schema)}/tables/${encodeURIComponent(table)}/columns`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setColumns(data.columns || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Fetch rows for a table
  const fetchRows = useCallback(async (schema: string, table: string, offset: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/healthz/postgres/schemas/${encodeURIComponent(schema)}/tables/${encodeURIComponent(table)}/rows?offset=${offset}&limit=${ROW_PAGE_SIZE}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRows(data.rows || []);
      setRowTotal(data.total || 0);
      setRowOffset(offset);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Load data when view changes
  useEffect(() => {
    if (view.level === 'schemas') {
      fetchSchemas();
    } else if (view.level === 'tables') {
      fetchTables(view.schema);
    } else if (view.level === 'table') {
      if (view.subTab === 'rows') {
        fetchRows(view.schema, view.table, 0);
      } else {
        fetchColumns(view.schema, view.table);
      }
    }
  }, [view, fetchSchemas, fetchTables, fetchRows, fetchColumns]);

  const navigateToSchemas = () => setView({ level: 'schemas' });
  const navigateToTables = (schema: string) => setView({ level: 'tables', schema });
  const navigateToTable = (schema: string, table: string, subTab: 'rows' | 'columns' = 'rows') =>
  setView({ level: 'table', schema, table, subTab });
  const navigateToRow = (schema: string, table: string, row: Record<string, unknown>) =>
  setView({ level: 'row', schema, table, row });

  // Breadcrumb
  const breadcrumb =
  <div className="flex items-center gap-1 text-sm mb-4">
      <button
      onClick={navigateToSchemas}
      className={`hover:text-blue-600 ${view.level === 'schemas' ? 'font-semibold text-gray-900' : 'text-blue-600'}`}>

        Schemas
      </button>
      {(view.level === 'tables' || view.level === 'table' || view.level === 'row') &&
    <>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <button
        onClick={() => navigateToTables(view.schema)}
        className={`hover:text-blue-600 ${view.level === 'tables' ? 'font-semibold text-gray-900' : 'text-blue-600'}`}>

            {view.schema}
          </button>
        </>
    }
      {(view.level === 'table' || view.level === 'row') &&
    <>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <button
        onClick={() => navigateToTable(view.schema, view.table)}
        className={`hover:text-blue-600 ${view.level === 'table' ? 'font-semibold text-gray-900' : 'text-blue-600'}`}>

            {view.table}
          </button>
        </>
    }
      {view.level === 'row' &&
    <>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-900">Row</span>
        </>
    }
    </div>;


  if (loading) {
    return (
      <div>
        {breadcrumb}
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading...
        </div>
      </div>);

  }

  if (error) {
    return (
      <div>
        {breadcrumb}
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="font-semibold text-sm">Error</span>
          </div>
          <p className="text-sm">{error}</p>
        </div>
      </div>);

  }

  // ── Level 1: Schema list ──
  if (view.level === 'schemas') {
    return (
      <div>
        {breadcrumb}
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
          <Tag className="w-3 h-3" />
          <span>POSTGRES_SCHEMA = <code className="bg-gray-100 px-1 rounded font-mono">{configuredSchema}</code></span>
        </div>
        {schemas.length === 0 ?
        <div className="py-8 text-center text-gray-500">
            <Database className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p>No schemas found</p>
          </div> :

        <div className="border rounded-md divide-y">
            {schemas.map((s) => {
            const isConfigured = s === configuredSchema;
            return (
              <div
                key={s}
                onClick={() => navigateToTables(s)}
                className={`px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between ${isConfigured ? 'bg-blue-50/50' : ''}`}>

                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-gray-900">{s}</span>
                    {isConfigured &&
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">ENV</span>
                  }
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>);

          })}
          </div>
        }
      </div>);

  }

  // ── Level 2: Tables list ──
  if (view.level === 'tables') {
    return (
      <div>
        {breadcrumb}
        {tables.length === 0 ?
        <div className="py-8 text-center text-gray-500">
            <Table2 className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p>No tables found in schema "{view.schema}"</p>
          </div> :

        <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-3 py-2 font-medium">Table</th>
                  <th className="px-3 py-2 font-medium w-28">Type</th>
                  <th className="px-3 py-2 font-medium w-32 text-right">Est. Rows</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tables.map((t) =>
              <tr
                key={t.name}
                onClick={() => navigateToTable(view.schema, t.name)}
                className="cursor-pointer transition-colors hover:bg-blue-50">

                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Table2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-mono text-gray-900">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  t.type === 'BASE TABLE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`
                  }>
                        {t.type === 'BASE TABLE' ? 'table' : 'view'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-600 font-mono">{t.estimatedRows.toLocaleString()}</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </div>);

  }

  // ── Level 3: Table detail (rows / columns sub-tabs) ──
  if (view.level === 'table') {
    const subTabs = ['rows', 'columns'] as const;
    return (
      <div>
        {breadcrumb}
        {/* Sub-tab bar */}
        <div className="flex gap-1 mb-4">
          {subTabs.map((st) =>
          <button
            key={st}
            onClick={() => setView({ ...view, subTab: st })}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
            view.subTab === st ?
            'bg-blue-100 text-blue-700 font-medium' :
            'text-gray-600 hover:bg-gray-100'}`
            }>

              {st === 'rows' ? <FileText className="w-3.5 h-3.5" /> : <Columns className="w-3.5 h-3.5" />}
              {st === 'rows' ? 'Rows' : 'Columns'}
            </button>
          )}
        </div>

        {view.subTab === 'rows' &&
        <PgRowsPanel
          rows={rows}
          total={rowTotal}
          offset={rowOffset}
          pageSize={ROW_PAGE_SIZE}
          onPageChange={(newOffset) => fetchRows(view.schema, view.table, newOffset)}
          onSelectRow={(row) => navigateToRow(view.schema, view.table, row)} />

        }

        {view.subTab === 'columns' &&
        <PgColumnsPanel columns={columns} />
        }
      </div>);

  }

  // ── Level 4: Row detail ──
  if (view.level === 'row') {
    return (
      <div>
        {breadcrumb}
        <pre className="bg-gray-900 text-green-300 p-4 rounded-md text-sm overflow-x-auto max-h-[60vh] whitespace-pre-wrap break-all">
          {JSON.stringify(view.row, null, 2)}
        </pre>
      </div>);

  }

  return null;
}

// ── Postgres Rows panel ──

function PgRowsPanel({ rows, total, offset, pageSize, onPageChange, onSelectRow






}: {rows: Record<string, unknown>[];total: number;offset: number;pageSize: number;onPageChange: (offset: number) => void;onSelectRow: (row: Record<string, unknown>) => void;}) {
  if (rows.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <FileText className="w-8 h-8 mx-auto mb-3 text-gray-300" />
        <p>No rows in this table</p>
      </div>);

  }

  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500">{total} row{total !== 1 ? 's' : ''} total</div>
      <div className="border rounded-md divide-y">
        {rows.map((row, idx) => {
          const entries = Object.entries(row).slice(0, 4);
          return (
            <div
              key={idx}
              onClick={() => onSelectRow(row)}
              className="px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors">

              <div className="flex gap-3 text-xs text-gray-600 flex-wrap">
                {entries.map(([k, v]) =>
                <span key={k} className="truncate max-w-[200px]">
                    <span className="text-gray-400">{k}:</span>{' '}
                    <span className="font-mono">
                      {v === null ? <span className="text-gray-400 italic">null</span> : typeof v === 'object' ? '{...}' : String(v)}
                    </span>
                  </span>
                )}
                {Object.keys(row).length > 4 &&
                <span className="text-gray-400">+{Object.keys(row).length - 4} more</span>
                }
              </div>
            </div>);

        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 &&
      <div className="flex items-center justify-between text-sm">
          <button
          onClick={() => onPageChange(Math.max(0, offset - pageSize))}
          disabled={offset === 0}
          className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-default">

            Previous
          </button>
          <span className="text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
          onClick={() => onPageChange(offset + pageSize)}
          disabled={offset + pageSize >= total}
          className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-default">

            Next
          </button>
        </div>
      }
    </div>);

}

// ── Postgres Columns panel ──

function PgColumnsPanel({ columns }: {columns: PgColumn[];}) {
  if (columns.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <Columns className="w-8 h-8 mx-auto mb-3 text-gray-300" />
        <p>No columns found</p>
      </div>);

  }

  const typeColor = (type: string): string => {
    if (['integer', 'bigint', 'smallint', 'numeric', 'real', 'double precision'].includes(type)) return 'bg-purple-100 text-purple-700';
    if (['character varying', 'text', 'char', 'character'].includes(type)) return 'bg-green-100 text-green-700';
    if (['boolean'].includes(type)) return 'bg-yellow-100 text-yellow-700';
    if (['timestamp without time zone', 'timestamp with time zone', 'date', 'time'].includes(type)) return 'bg-orange-100 text-orange-700';
    if (['uuid'].includes(type)) return 'bg-blue-100 text-blue-700';
    if (['json', 'jsonb'].includes(type)) return 'bg-pink-100 text-pink-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-gray-500">
            <th className="px-3 py-2 font-medium">Column</th>
            <th className="px-3 py-2 font-medium w-40">Type</th>
            <th className="px-3 py-2 font-medium w-20">Nullable</th>
            <th className="px-3 py-2 font-medium">Default</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {columns.map((c) =>
          <tr key={c.name}>
              <td className="px-3 py-2 font-mono text-gray-900">{c.name}</td>
              <td className="px-3 py-2">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${typeColor(c.type)}`}>
                  {c.type}
                </span>
                {c.maxLength && <span className="text-xs text-gray-400 ml-1">({c.maxLength})</span>}
              </td>
              <td className="px-3 py-2 text-gray-600">{c.nullable ? 'yes' : 'no'}</td>
              <td className="px-3 py-2 text-xs text-gray-500 font-mono truncate max-w-[200px]">{c.default || ''}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}

// ─── AWS S3 Data Tab ──────────────────────────────────────────────────────────

interface S3Bucket {
  name: string;
  creationDate: string | null;
}

interface S3Object {
  key: string;
  size: number;
  lastModified: string | null;
  storageClass: string | null;
}

interface S3ObjectMetadata {
  bucket: string;
  key: string;
  contentType: string | null;
  contentLength: number;
  lastModified: string | null;
  eTag: string | null;
  storageClass: string | null;
  metadata: Record<string, string>;
  serverSideEncryption: string | null;
}

type S3View =
{level: 'buckets';} |
{level: 'objects';bucket: string;prefix: string;cursor: string | null;} |
{level: 'metadata';bucket: string;objectKey: string;metadata: S3ObjectMetadata;};

function S3DataTab({ baseUrl }: {baseUrl: string;}) {
  const [view, setView] = useState<S3View>({ level: 'buckets' });
  const [buckets, setBuckets] = useState<S3Bucket[]>([]);
  const [configuredBucket, setConfiguredBucket] = useState<string | null>(null);
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const OBJ_PAGE_SIZE = 50;

  // Fetch buckets
  const fetchBuckets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/healthz/s3/buckets`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBuckets(data.buckets || []);
      setConfiguredBucket(data.configuredBucket || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Fetch objects for a bucket
  const fetchObjects = useCallback(async (bucket: string, prefix: string, cursor: string | null, append = false) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${baseUrl}/healthz/s3/buckets/${encodeURIComponent(bucket)}/objects?maxKeys=${OBJ_PAGE_SIZE}`;
      if (prefix) url += `&prefix=${encodeURIComponent(prefix)}`;
      if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (append) {
        setObjects((prev) => [...prev, ...(data.objects || [])]);
      } else {
        setObjects(data.objects || []);
      }
      setNextCursor(data.nextCursor || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Fetch object metadata
  const fetchMetadata = useCallback(async (bucket: string, objectKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/healthz/s3/buckets/${encodeURIComponent(bucket)}/objects/metadata?key=${encodeURIComponent(objectKey)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setView({ level: 'metadata', bucket, objectKey, metadata: data });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Load data when view changes
  useEffect(() => {
    if (view.level === 'buckets') {
      fetchBuckets();
    } else if (view.level === 'objects') {
      fetchObjects(view.bucket, view.prefix, null);
    }
  }, [view.level, view.level === 'objects' ? (view as any).bucket : null, view.level === 'objects' ? (view as any).prefix : null, fetchBuckets, fetchObjects]);

  const navigateToBuckets = () => setView({ level: 'buckets' });
  const navigateToObjects = (bucket: string, prefix = '') =>
  setView({ level: 'objects', bucket, prefix, cursor: null });

  // Breadcrumb
  const breadcrumb =
  <div className="flex items-center gap-1 text-sm mb-4">
      <button
      onClick={navigateToBuckets}
      className={`hover:text-blue-600 ${view.level === 'buckets' ? 'font-semibold text-gray-900' : 'text-blue-600'}`}>

        Buckets
      </button>
      {(view.level === 'objects' || view.level === 'metadata') &&
    <>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <button
        onClick={() => navigateToObjects(view.bucket)}
        className={`hover:text-blue-600 ${view.level === 'objects' ? 'font-semibold text-gray-900' : 'text-blue-600'}`}>

            {view.bucket}
          </button>
        </>
    }
      {view.level === 'metadata' &&
    <>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-900 truncate max-w-[300px] font-mono">{view.objectKey}</span>
        </>
    }
    </div>;


  if (loading && view.level !== 'objects') {
    return (
      <div>
        {breadcrumb}
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading...
        </div>
      </div>);

  }

  if (error) {
    return (
      <div>
        {breadcrumb}
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="font-semibold text-sm">Error</span>
          </div>
          <p className="text-sm">{error}</p>
        </div>
      </div>);

  }

  // ── Level 1: Buckets list ──
  if (view.level === 'buckets') {
    return (
      <div>
        {breadcrumb}
        {configuredBucket &&
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
            <Tag className="w-3 h-3" />
            <span>AWS_S3_BUCKET = <code className="bg-gray-100 px-1 rounded font-mono">{configuredBucket}</code></span>
          </div>
        }
        {buckets.length === 0 ?
        <div className="py-8 text-center text-gray-500">
            <HardDrive className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p>No buckets found</p>
          </div> :

        <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-3 py-2 font-medium">Bucket</th>
                  <th className="px-3 py-2 font-medium w-48">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {buckets.map((b) => {
                const isConfigured = b.name === configuredBucket;
                return (
                  <tr
                    key={b.name}
                    onClick={() => navigateToObjects(b.name!)}
                    className={`cursor-pointer transition-colors hover:bg-blue-50 ${isConfigured ? 'bg-blue-50/50' : ''}`}>

                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-mono text-gray-900">{b.name}</span>
                          {isConfigured &&
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">ENV</span>
                        }
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-600 text-xs font-mono">
                        {b.creationDate ? new Date(b.creationDate).toLocaleString() : ''}
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </div>);

  }

  // ── Level 2: Objects list ──
  if (view.level === 'objects') {
    return (
      <div>
        {breadcrumb}
        {view.prefix &&
        <div className="mb-3 text-xs text-gray-500">
            Prefix: <code className="bg-gray-100 px-1 rounded font-mono">{view.prefix}</code>
          </div>
        }
        {objects.length === 0 && !loading ?
        <div className="py-8 text-center text-gray-500">
            <File className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p>No objects found{view.prefix ? ` with prefix "${view.prefix}"` : ''}</p>
          </div> :

        <div className="space-y-3">
            <div className="border rounded-md divide-y">
              {objects.map((obj) =>
            <div
              key={obj.key}
              onClick={() => fetchMetadata(view.bucket, obj.key)}
              className="px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors">

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <File className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="font-mono text-sm text-gray-900 truncate">{obj.key}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-3 flex-shrink-0 text-xs text-gray-500">
                      {obj.storageClass &&
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium">{obj.storageClass}</span>
                  }
                      <span className="font-mono">{formatBytes(obj.size)}</span>
                      {obj.lastModified &&
                  <span className="font-mono">{new Date(obj.lastModified).toLocaleDateString()}</span>
                  }
                    </div>
                  </div>
                </div>
            )}
            </div>
            {/* Load more */}
            {nextCursor &&
          <div className="text-center">
                <button
              onClick={() => fetchObjects(view.bucket, view.prefix, nextCursor, true)}
              disabled={loading}
              className="px-4 py-1.5 border rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">

                  {loading ?
              <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</span> :

              'Load more'
              }
                </button>
              </div>
          }
          </div>
        }
      </div>);

  }

  // ── Level 3: Object metadata ──
  if (view.level === 'metadata') {
    const { metadata } = view;
    const customMeta = metadata.metadata || {};
    const hasCustomMeta = Object.keys(customMeta).length > 0;

    return (
      <div>
        {breadcrumb}
        <div className="space-y-4">
          {/* Object info grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Content-Type:</span>
              <span className="ml-2 text-gray-900 font-mono">{metadata.contentType || 'unknown'}</span>
            </div>
            <div>
              <span className="text-gray-500">Size:</span>
              <span className="ml-2 text-gray-900 font-mono">{formatBytes(metadata.contentLength)}</span>
            </div>
            <div>
              <span className="text-gray-500">Last Modified:</span>
              <span className="ml-2 text-gray-900 font-mono">
                {metadata.lastModified ? new Date(metadata.lastModified).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">ETag:</span>
              <span className="ml-2 text-gray-900 font-mono">{metadata.eTag || 'N/A'}</span>
            </div>
            {metadata.storageClass &&
            <div>
                <span className="text-gray-500">Storage Class:</span>
                <span className="ml-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{metadata.storageClass}</span>
                </span>
              </div>
            }
            {metadata.serverSideEncryption &&
            <div>
                <span className="text-gray-500">Encryption:</span>
                <span className="ml-2">
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">{metadata.serverSideEncryption}</span>
                </span>
              </div>
            }
          </div>

          {/* Custom metadata */}
          {hasCustomMeta &&
          <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Metadata</h4>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-500">
                      <th className="px-3 py-2 font-medium">Key</th>
                      <th className="px-3 py-2 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Object.entries(customMeta).map(([k, v]) =>
                  <tr key={k}>
                        <td className="px-3 py-2 font-mono text-gray-900">{k}</td>
                        <td className="px-3 py-2 text-gray-600 break-all">{v}</td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          }

          {/* Raw JSON */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Raw Response</h4>
            <pre className="bg-gray-900 text-green-300 p-4 rounded-md text-sm overflow-x-auto max-h-[40vh] whitespace-pre-wrap break-all">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        </div>
      </div>);

  }

  return null;
}

// ─── S3 Cached Key Workbench (Postman-style) ─────────────────────────────────

type CachedKeyOperation = 'save' | 'load' | 'delete' | 'exists' | 'list' | 'clear';

interface CachedKeyConfig {
  bucket_name: string;
  endpoint_url: string;
  region_name: string;
  aws_access_key_id: string;
  aws_secret_access_key: string;
  proxy_url: string;
  addressing_style: string;
  connection_timeout: number;
  read_timeout: number;
  key_prefix: string;
  ttl: number | '';
  verify: boolean;
}

const DEFAULT_CONFIG: CachedKeyConfig = {
  bucket_name: '',
  endpoint_url: '',
  region_name: 'us-east-1',
  aws_access_key_id: '',
  aws_secret_access_key: '',
  proxy_url: '',
  addressing_style: 'path',
  connection_timeout: 20,
  read_timeout: 60,
  key_prefix: 'jss3:',
  ttl: 600,
  verify: true
};

interface CachedKeyParams {
  key: string;
  data: string;
  ttl: number | '';
}

const DEFAULT_PARAMS: CachedKeyParams = {
  key: '',
  data: '{}',
  ttl: ''
};

const OPERATIONS: {value: CachedKeyOperation;label: string;color: string;icon: 'send' | 'search' | 'trash' | 'list' | 'plus';}[] = [
{ value: 'save', label: 'SAVE', color: 'bg-green-600', icon: 'plus' },
{ value: 'load', label: 'LOAD', color: 'bg-blue-600', icon: 'search' },
{ value: 'delete', label: 'DELETE', color: 'bg-red-600', icon: 'trash' },
{ value: 'exists', label: 'EXISTS', color: 'bg-purple-600', icon: 'search' },
{ value: 'list', label: 'LIST', color: 'bg-amber-600', icon: 'list' },
{ value: 'clear', label: 'CLEAR', color: 'bg-red-700', icon: 'trash' }];


function OperationIcon({ icon, className }: {icon: string;className?: string;}) {
  switch (icon) {
    case 'search':return <Search className={className} />;
    case 'trash':return <Trash2 className={className} />;
    case 'list':return <List className={className} />;
    case 'plus':return <Plus className={className} />;
    default:return <Send className={className} />;
  }
}

interface ServerDefaults {
  bucket_name: string;
  region_name: string;
  endpoint_url: string;
  has_credentials: boolean;
  proxy_url: string;
  addressing_style: string;
  key_prefix: string;
}

function S3CachedKeyTab({ baseUrl }: {baseUrl: string;}) {
  const [config, setConfig] = useState<CachedKeyConfig>(() => {
    try {
      const saved = localStorage.getItem('s3-cached-key-config');
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch {/* ignore */}
    return { ...DEFAULT_CONFIG };
  });
  const [operation, setOperation] = useState<CachedKeyOperation>('save');
  const [params, setParams] = useState<CachedKeyParams>({ ...DEFAULT_PARAMS });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [lastRequest, setLastRequest] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [showConfig, setShowConfig] = useState(true);
  const [copied, setCopied] = useState(false);
  const [resultTab, setResultTab] = useState<'response' | 'request'>('response');
  const [serverDefaults, setServerDefaults] = useState<ServerDefaults | null>(null);

  // Fetch server defaults (from S3 health config) on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/healthz/s3-cached-key/defaults`);
        if (res.ok) {
          const data: ServerDefaults = await res.json();
          setServerDefaults(data);
        }
      } catch {/* ignore — fields just won't show placeholders */}
    })();
  }, [baseUrl]);

  // Persist config to localStorage
  useEffect(() => {
    try {
      const toSave = { ...config };
      // Don't persist secrets
      delete (toSave as any).aws_secret_access_key;
      localStorage.setItem('s3-cached-key-config', JSON.stringify(toSave));
    } catch {/* ignore */}
  }, [config]);

  const updateConfig = (key: keyof CachedKeyConfig, value: string | number | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const updateParams = (key: keyof CachedKeyParams, value: string | number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const execute = useCallback(async () => {
    setLoading(true);
    setResponse(null);
    setLastRequest(null);
    setError(null);
    setDuration(null);
    setResultTab('response');

    const start = performance.now();
    try {
      // Build body
      const body: any = {
        config: {
          bucket_name: config.bucket_name,
          endpoint_url: config.endpoint_url || undefined,
          region_name: config.region_name || undefined,
          aws_access_key_id: config.aws_access_key_id || undefined,
          aws_secret_access_key: config.aws_secret_access_key || undefined,
          proxy_url: config.proxy_url || undefined,
          addressing_style: config.addressing_style,
          connection_timeout: config.connection_timeout,
          read_timeout: config.read_timeout,
          key_prefix: config.key_prefix,
          ttl: config.ttl !== '' ? Number(config.ttl) : undefined,
          verify: config.verify
        },
        operation,
        params: {}
      };

      // Add operation-specific params
      if (operation === 'save') {
        body.params.key = params.key;
        try {
          body.params.data = JSON.parse(params.data);
        } catch {
          body.params.data = params.data;
        }
        if (params.ttl !== '') body.params.ttl = Number(params.ttl);
      } else if (operation === 'load' || operation === 'delete' || operation === 'exists') {
        body.params.key = params.key;
      }

      setLastRequest({
        method: 'POST',
        url: `${baseUrl}/healthz/s3-cached-key`,
        headers: { 'Content-Type': 'application/json' },
        body
      });

      const res = await fetch(`${baseUrl}/healthz/s3-cached-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const elapsed = performance.now() - start;
      setDuration(elapsed);

      const data = await res.json();
      setResponse(data);

      if (data.status === 'error' && data.error) {
        const errMsg = typeof data.error === 'string' ? data.error : data.error.message || JSON.stringify(data.error);
        setError(errMsg);
      }
    } catch (err) {
      const elapsed = performance.now() - start;
      setDuration(elapsed);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [baseUrl, config, operation, params]);

  const copyPanel = useCallback(() => {
    const data = resultTab === 'response' ? response : lastRequest;
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [response, lastRequest, resultTab]);

  const needsKey = operation === 'save' || operation === 'load' || operation === 'delete' || operation === 'exists';
  const needsData = operation === 'save';
  const needsTtl = operation === 'save';
  const opMeta = OPERATIONS.find((o) => o.value === operation)!;

  return (
    <div className="space-y-4">
      {/* Operation Bar (Postman-style) */}
      <div className="flex items-center gap-2">
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value as CachedKeyOperation)}
          className={`${opMeta.color} text-white font-bold text-sm px-3 py-2 rounded-l-md border-0 cursor-pointer appearance-none`}
          style={{ minWidth: 100 }}>

          {OPERATIONS.map((op) =>
          <option key={op.value} value={op.value}>{op.label}</option>
          )}
        </select>
        {needsKey ?
        <input
          type="text"
          value={params.key}
          onChange={(e) => updateParams('key', e.target.value)}
          placeholder="Enter storage key..."
          className="flex-1 border border-l-0 rounded-r-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300" /> :


        <div className="flex-1 border border-l-0 rounded-r-md px-3 py-2 text-sm text-gray-400 italic">
            {operation === 'list' ? `Lists all keys with prefix "${config.key_prefix}"` : `Deletes all keys with prefix "${config.key_prefix}"`}
          </div>
        }
        <button
          onClick={execute}
          disabled={loading || needsKey && !params.key}
          className={`flex items-center gap-2 px-5 py-2 ${opMeta.color} text-white rounded-md hover:opacity-90 disabled:opacity-40 font-medium text-sm`}>

          {loading ?
          <Loader2 className="w-4 h-4 animate-spin" /> :

          <OperationIcon icon={opMeta.icon} className="w-4 h-4" />
          }
          Send
        </button>
      </div>

      {/* Config + Params Panel */}
      <div className="bg-white border rounded-md">
        {/* Sub-tabs */}
        <div className="border-b flex">
          <button
            onClick={() => setShowConfig(true)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            showConfig ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`
            }>

            Connection
          </button>
          <button
            onClick={() => setShowConfig(false)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            !showConfig ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`
            }>

            Body
          </button>
        </div>

        <div className="p-4">
          {showConfig ? (
          /* ── Connection Config ── */
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {serverDefaults &&
            <div className="col-span-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded border border-dashed border-gray-200">
                  Server defaults from <code className="bg-gray-100 px-1 rounded">/healthz/s3</code> config
                  {serverDefaults.has_credentials && ' (credentials configured)'}
                </div>
            }
              <ConfigField label="Bucket Name" value={config.bucket_name} onChange={(v) => updateConfig('bucket_name', v)} placeholder={serverDefaults?.bucket_name || 'my-cache-bucket'} hint={serverDefaults?.bucket_name ? `server: ${serverDefaults.bucket_name}` : undefined} />
              <ConfigField label="Region" value={config.region_name} onChange={(v) => updateConfig('region_name', v)} placeholder={serverDefaults?.region_name || 'us-east-1'} hint={serverDefaults?.region_name ? `server: ${serverDefaults.region_name}` : undefined} />
              <ConfigField label="Endpoint URL" value={config.endpoint_url} onChange={(v) => updateConfig('endpoint_url', v)} placeholder={serverDefaults?.endpoint_url || 'uses server default'} hint={serverDefaults?.endpoint_url ? `server: ${serverDefaults.endpoint_url}` : 'optional — uses server config'} />
              <ConfigField label="Key Prefix" value={config.key_prefix} onChange={(v) => updateConfig('key_prefix', v)} placeholder={serverDefaults?.key_prefix || 'jss3:'} />
              <ConfigField label="Access Key ID" value={config.aws_access_key_id} onChange={(v) => updateConfig('aws_access_key_id', v)} placeholder="uses server credentials" hint={serverDefaults?.has_credentials ? 'optional — server has credentials' : 'optional — uses env/profile'} />
              <ConfigField label="Secret Access Key" value={config.aws_secret_access_key} onChange={(v) => updateConfig('aws_secret_access_key', v)} placeholder="uses server credentials" type="password" hint={serverDefaults?.has_credentials ? 'optional — server has credentials' : 'optional — uses env/profile'} />
              <ConfigField label="Proxy URL" value={config.proxy_url} onChange={(v) => updateConfig('proxy_url', v)} placeholder={serverDefaults?.proxy_url || 'optional'} hint={serverDefaults?.proxy_url ? `server: ${serverDefaults.proxy_url}` : undefined} />
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Addressing</label>
                  <select
                  value={config.addressing_style}
                  onChange={(e) => updateConfig('addressing_style', e.target.value)}
                  className="w-full border rounded-md px-2.5 py-1.5 text-sm">

                    <option value="path">path</option>
                    <option value="virtual">virtual</option>
                  </select>
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                    type="checkbox"
                    checked={config.verify}
                    onChange={(e) => updateConfig('verify', e.target.checked)}
                    className="rounded" />

                    SSL Verify
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Conn Timeout (s)</label>
                  <input
                  type="number"
                  value={config.connection_timeout}
                  onChange={(e) => updateConfig('connection_timeout', Number(e.target.value))}
                  className="w-full border rounded-md px-2.5 py-1.5 text-sm font-mono" />

                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Read Timeout (s)</label>
                  <input
                  type="number"
                  value={config.read_timeout}
                  onChange={(e) => updateConfig('read_timeout', Number(e.target.value))}
                  className="w-full border rounded-md px-2.5 py-1.5 text-sm font-mono" />

                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Default TTL (s)</label>
                  <input
                  type="number"
                  value={config.ttl}
                  onChange={(e) => updateConfig('ttl', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="600"
                  className="w-full border rounded-md px-2.5 py-1.5 text-sm font-mono" />

                </div>
              </div>
            </div>) : (

          /* ── Body / Params ── */
          <div className="space-y-3">
              {needsData &&
            <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">JSON Data</label>
                  <textarea
                value={params.data}
                onChange={(e) => updateParams('data', e.target.value)}
                rows={6}
                placeholder='{"user_id": 123, "name": "Alice"}'
                className="w-full border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y"
                spellCheck={false} />

                </div>
            }
              {needsTtl &&
            <div className="w-48">
                  <label className="block text-xs font-medium text-gray-500 mb-1">TTL Override (s)</label>
                  <input
                type="number"
                value={params.ttl}
                onChange={(e) => updateParams('ttl', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Uses default"
                className="w-full border rounded-md px-2.5 py-1.5 text-sm font-mono" />

                </div>
            }
              {!needsData && !needsTtl &&
            <div className="py-6 text-center text-sm text-gray-400">
                  {operation === 'list' ? 'No body params needed — lists all keys with the configured prefix.' :
              operation === 'clear' ? 'No body params needed — deletes all keys with the configured prefix.' :
              operation === 'exists' ? 'Only a key is needed (set in the URL bar above).' :
              'Only a key is needed (set in the URL bar above).'}
                </div>
            }
            </div>)
          }
        </div>
      </div>

      {/* Request / Response Panel */}
      {(response || error || loading || lastRequest) &&
      <div className="bg-white border rounded-md">
          {/* Tab header */}
          <div className="border-b flex items-center justify-between">
            <div className="flex">
              <button
              onClick={() => setResultTab('response')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              resultTab === 'response' ?
              'border-blue-600 text-blue-600' :
              'border-transparent text-gray-500 hover:text-gray-700'}`
              }>

                Response
                {response?.status &&
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${
              response.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`
              }>
                    {response.status === 'ok' ? '200' : 'ERR'}
                  </span>
              }
              </button>
              <button
              onClick={() => setResultTab('request')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              resultTab === 'request' ?
              'border-blue-600 text-blue-600' :
              'border-transparent text-gray-500 hover:text-gray-700'}`
              }>

                Request
              </button>
            </div>
            <div className="flex items-center gap-3 pr-4">
              {duration !== null &&
            <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {duration.toFixed(0)}ms
                </span>
            }
              {response?.operation &&
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                  {response.operation}
                </span>
            }
              {(response || lastRequest) &&
            <button
              onClick={copyPanel}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">

                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
            }
            </div>
          </div>

          <div className="p-4">
            {/* ── Request tab ── */}
            {resultTab === 'request' && (
          lastRequest ?
          <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">POST</span>
                    <code className="text-gray-700 text-xs">{lastRequest.url}</code>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Headers</h4>
                    <pre className="bg-gray-900 text-gray-300 p-3 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(lastRequest.headers, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Body</h4>
                    <pre className="bg-gray-900 text-blue-300 p-4 rounded-md text-sm overflow-x-auto max-h-[50vh] whitespace-pre-wrap break-all">
                      {JSON.stringify(lastRequest.body, null, 2)}
                    </pre>
                  </div>
                </div> :

          <div className="py-8 text-center text-gray-400 text-sm">No request sent yet</div>)

          }

            {/* ── Response tab ── */}
            {resultTab === 'response' && (
          loading ?
          <div className="flex items-center justify-center py-8 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Executing {operation}...
                </div> :
          error && !response ?
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4" />
                    <span className="font-semibold text-sm">Error</span>
                  </div>
                  <p className="text-sm">{error}</p>
                </div> :
          response ?
          <div className="space-y-3">
                  {/* Quick result summary */}
                  {response.result &&
            <CachedKeyResultSummary operation={operation} result={response.result} />
            }

                  {/* Error detail */}
                  {response.status === 'error' && response.error &&
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                      {typeof response.error === 'string' ? response.error :
              <div>
                          <span className="font-semibold">{response.error.name}:</span> {response.error.message}
                          {response.error.code && <span className="text-xs ml-2 text-red-500">({response.error.code})</span>}
                        </div>
              }
                    </div>
            }

                  {/* Raw JSON */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Raw Response</h4>
                    <pre className="bg-gray-900 text-green-300 p-4 rounded-md text-sm overflow-x-auto max-h-[40vh] whitespace-pre-wrap break-all">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                </div> :
          null)
          }
          </div>
        </div>
      }

      {/* Empty state */}
      {!response && !error && !loading &&
      <div className="py-8 text-center text-gray-500 bg-white border rounded-md">
          <Send className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          <p>Configure connection, choose an operation, and click Send</p>
          <p className="text-xs text-gray-400 mt-1">
            POST {baseUrl}/healthz/s3-cached-key
          </p>
        </div>
      }
    </div>);

}

function ConfigField({ label, value, onChange, placeholder, type = 'text', hint






}: {label: string;value: string;onChange: (v: string) => void;placeholder?: string;type?: string;hint?: string;}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-md px-2.5 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300" />

      {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
    </div>);

}

function CachedKeyResultSummary({ operation, result }: {operation: string;result: any;}) {
  if (operation === 'save') {
    return (
      <div className="bg-green-50 border border-green-200 p-3 rounded-md text-sm">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-green-700">Saved</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-gray-700 mt-2">
          <div><span className="text-gray-500">Key:</span> <code className="bg-white px-1 rounded font-mono text-xs">{result.key}</code></div>
          <div><span className="text-gray-500">S3 Key:</span> <code className="bg-white px-1 rounded font-mono text-xs">{result.s3_key}</code></div>
          <div><span className="text-gray-500">Size:</span> <span className="font-mono text-xs">{result.size_bytes} bytes</span></div>
          <div><span className="text-gray-500">TTL:</span> <span className="font-mono text-xs">{result.ttl ?? 'none'}</span></div>
        </div>
      </div>);

  }

  if (operation === 'load') {
    if (!result.found) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="font-semibold text-yellow-700">Not Found</span>
            <code className="ml-2 bg-white px-1 rounded font-mono text-xs text-gray-600">{result.key}</code>
          </div>
        </div>);

    }
    return (
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-blue-700">Found</span>
          {result.expired && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">EXPIRED</span>}
        </div>
        {result.entry?.data &&
        <pre className="bg-white border p-2 rounded text-xs font-mono overflow-x-auto max-h-32 whitespace-pre-wrap">
            {JSON.stringify(result.entry.data, null, 2)}
          </pre>
        }
      </div>);

  }

  if (operation === 'delete') {
    return (
      <div className="bg-red-50 border border-red-200 p-3 rounded-md text-sm">
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-600" />
          <span className="font-semibold text-red-700">Deleted</span>
          <code className="ml-2 bg-white px-1 rounded font-mono text-xs text-gray-600">{result.key}</code>
        </div>
      </div>);

  }

  if (operation === 'exists') {
    return (
      <div className={`p-3 rounded-md text-sm ${result.exists ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center gap-2">
          {result.exists ?
          <CheckCircle className="w-4 h-4 text-green-600" /> :

          <XCircle className="w-4 h-4 text-yellow-600" />
          }
          <span className={`font-semibold ${result.exists ? 'text-green-700' : 'text-yellow-700'}`}>
            {result.exists ? 'Exists' : 'Not Found'}
          </span>
          <code className="ml-2 bg-white px-1 rounded font-mono text-xs text-gray-600">{result.key}</code>
        </div>
      </div>);

  }

  if (operation === 'list') {
    return (
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm">
        <div className="flex items-center gap-2 mb-2">
          <List className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-blue-700">{result.count} key{result.count !== 1 ? 's' : ''}</span>
          <code className="ml-2 bg-white px-1 rounded font-mono text-xs text-gray-500">{result.key_prefix}*</code>
        </div>
        {result.keys?.length > 0 &&
        <div className="border border-blue-200 rounded bg-white divide-y max-h-48 overflow-y-auto">
            {result.keys.map((k: any) =>
          <div key={k.s3_key} className="px-3 py-1.5 flex items-center justify-between text-xs">
                <span className="font-mono text-gray-900 truncate">{k.key}</span>
                <div className="flex items-center gap-3 text-gray-500 flex-shrink-0 ml-2">
                  {k.size != null && <span>{formatBytes(k.size)}</span>}
                  {k.last_modified && <span>{new Date(k.last_modified).toLocaleString()}</span>}
                </div>
              </div>
          )}
          </div>
        }
      </div>);

  }

  if (operation === 'clear') {
    return (
      <div className="bg-red-50 border border-red-200 p-3 rounded-md text-sm">
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-600" />
          <span className="font-semibold text-red-700">Cleared {result.deleted_count} object{result.deleted_count !== 1 ? 's' : ''}</span>
          <code className="ml-2 bg-white px-1 rounded font-mono text-xs text-gray-500">{result.key_prefix}*</code>
        </div>
      </div>);

  }

  return null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default App;