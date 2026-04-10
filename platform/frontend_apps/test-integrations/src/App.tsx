import { useState, useEffect } from 'react';
import { ExternalLink, Server, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface EndpointEntry {
  key: string;
  name?: string;
  baseUrl: string;
  tags?: string[];
  description?: string;
}

interface IntegrationApp {
  name: string;
  description: string | null;
  path: string;
  folder: string;
}

type HealthStatus = 'idle' | 'loading' | 'ok' | 'error';

const API_BASE = '/api/runtime-app-config';
const LLM_API_PATH = '/api/llm/gemini-openai-v1';

async function fetchApiEndpoints(): Promise<EndpointEntry[]> {
  const res = await fetch(`${API_BASE}/endpoints/by-tag/api`);
  if (!res.ok) throw new Error(`Failed to fetch endpoints: ${res.statusText}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch endpoints');
  return data.endpoints;
}

function App() {
  const [endpoints, setEndpoints] = useState<EndpointEntry[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationApp[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [integrationsError, setIntegrationsError] = useState<string | null>(null);
  const [healthMap, setHealthMap] = useState<Record<string, HealthStatus>>({});

  useEffect(() => {
    fetchApiEndpoints().
    then(setEndpoints).
    catch((err) => setLoadError(err.message));

    fetch('/api/test-integrations/apps').
    then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch integrations: ${res.statusText}`);
      return res.json();
    }).
    then((data) => setIntegrations(data.apps)).
    catch((err) => setIntegrationsError(err.message));
  }, []);

  const checkHealth = async (ep: EndpointEntry) => {
    setHealthMap((prev) => ({ ...prev, [ep.key]: 'loading' }));
    try {
      const res = await fetch(`${ep.baseUrl}${LLM_API_PATH}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'hi' })
      });
      setHealthMap((prev) => ({ ...prev, [ep.key]: res.ok ? 'ok' : 'error' }));
    } catch {
      setHealthMap((prev) => ({ ...prev, [ep.key]: 'error' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Integrations</h1>
        <p className="text-gray-500 mb-8">Hub for all test integration apps</p>

        {/* API Servers */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4" data-test-id="div-a1231fad">
            <Server className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">API Servers</h2>
          </div>

          {loadError &&
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm mb-4">
              {loadError}
            </div>
          }

          {endpoints.length === 0 && !loadError &&
          <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading endpoints...</span>
            </div>
          }

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-test-id="div-f1580ca3">
            {endpoints.map((ep) => {
              const status = healthMap[ep.key] || 'idle';
              return (
                <div
                  key={ep.key}
                  className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-2">

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{ep.name || ep.key}</span>
                    <button
                      onClick={() => checkHealth(ep)}
                      disabled={status === 'loading'}
                      className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1">

                      {status === 'loading' && <Loader2 className="w-3 h-3 animate-spin" />}
                      {status === 'ok' && <CheckCircle className="w-3 h-3 text-green-500" />}
                      {status === 'error' && <XCircle className="w-3 h-3 text-red-500" />}
                      {status === 'idle' ? 'Check' : status === 'loading' ? '' : status}
                    </button>
                  </div>
                  <code className="text-xs text-gray-400 break-all">{ep.baseUrl}</code>
                </div>);

            })}
          </div>
        </section>

        {/* Integration Apps */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4" data-test-id="h2-2501856c">Integration Apps</h2>

          {integrationsError &&
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm mb-4">
              {integrationsError}
            </div>
          }

          {integrations.length === 0 && !integrationsError &&
          <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading integrations...</span>
            </div>
          }

          <div className="space-y-4" data-test-id="div-869a235f">
            {integrations.map((item) =>
            <a
              key={item.path}
              href={item.path}
              className="block bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all group">

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      {item.name}
                    </h2>
                    {item.description &&
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  }
                    <code className="text-xs text-gray-400 mt-2 block">{item.path}</code>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-blue-500 flex-shrink-0 ml-4" />
                </div>
              </a>
            )}
          </div>
        </section>
      </div>
    </div>);

}

export default App;