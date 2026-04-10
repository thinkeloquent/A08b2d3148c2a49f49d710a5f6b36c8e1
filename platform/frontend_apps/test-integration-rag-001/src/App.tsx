import { useEffect, useMemo, useRef, useState } from 'react';
import Select from 'react-select';
import type { MultiValue } from 'react-select';
import type {
  AppInfo,
  FrameworkInfo,
  SearchResult,
  SearchResponse,
  SearchMode,
  CodeMode,
  ComponentMode,
  LlmProvider,
  Backend,
  ChatSession } from
'./types';
import ResultCard from './components/ResultCard';
import AskLlmPanel from './components/AskLlmPanel';

interface FrameworkOption {
  value: string;
  label: string;
  info: FrameworkInfo;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api/py/apps/chromadb_rag_ingest';

function parseFloatOr(val: string | null, fallback: number): number {
  if (val === null) return fallback;
  const n = parseFloat(val);
  return Number.isNaN(n) ? fallback : n;
}

function parseIntOr(val: string | null, fallback: number): number {
  if (val === null) return fallback;
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? fallback : n;
}

function getInitialParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    search: p.get('search') ?? '',
    session: p.get('session') ?? '',
    mode: p.get('mode') as SearchMode || 'query',
    topK: parseIntOr(p.get('topK'), 6),
    provider: (p.get('provider') || '') as LlmProvider,
    alpha: parseFloatOr(p.get('alpha'), 0.5),
    threshold: parseFloatOr(p.get('threshold'), 0),
    reranker: p.get('reranker') === '1',
    backend: (p.get('backend') || '') as Backend,
    codeMode: p.get('codeMode') as CodeMode || 'regex',
    componentMode: p.get('componentMode') as ComponentMode || 'metadata',
    frameworks: p.get('framework')?.split(',').filter(Boolean) ?? []
  };
}

export default function App() {
  const initial = useRef(getInitialParams()).current;

  // App info
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);

  // Frameworks
  const [frameworks, setFrameworks] = useState<FrameworkInfo[]>([]);
  const [frameworksSelected, setFrameworksSelected] = useState<string[]>(initial.frameworks);
  const [frameworksLoaded, setFrameworksLoaded] = useState(false);
  const [ingesting, setIngesting] = useState(false);

  // Session
  const [sessionId, setSessionId] = useState(initial.session);

  // Search form (initialized from URL params)
  const [query, setQuery] = useState(initial.search);
  const [mode, setMode] = useState<SearchMode>(initial.mode);
  const [topK, setTopK] = useState(initial.topK);
  const [provider, setProvider] = useState<LlmProvider>(initial.provider);
  const [alpha, setAlpha] = useState(initial.alpha);
  const [threshold, setThreshold] = useState(initial.threshold);
  const [reranker, setReranker] = useState(initial.reranker);
  const [backend, setBackend] = useState<Backend>(initial.backend);
  const [codeMode, setCodeMode] = useState<CodeMode>(initial.codeMode);
  const [componentMode, setComponentMode] = useState<ComponentMode>(initial.componentMode);

  // Results
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [components, setComponents] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [cached, setCached] = useState(false);
  const [error, setError] = useState('');
  const [excludedResults, setExcludedResults] = useState<Set<number>>(new Set());

  // Session restoration
  const [restoredSession, setRestoredSession] = useState<ChatSession | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // react-select options derived from frameworks list
  const frameworkOptions = useMemo<FrameworkOption[]>(
    () => frameworks.map((fw) => ({ value: fw.slug, label: fw.name, info: fw })),
    [frameworks]
  );
  const selectedOptions = useMemo(
    () => frameworkOptions.filter((o) => frameworksSelected.includes(o.value)),
    [frameworkOptions, frameworksSelected]
  );
  const selectedFw = frameworks.find((fw) => fw.slug === frameworksSelected[0]);

  function handleFrameworkChange(newValue: MultiValue<FrameworkOption>) {
    setFrameworksSelected(newValue.map((o) => o.value));
  }

  // Load frameworks + app info on mount (retries if backend not ready)
  useEffect(() => {
    let cancelled = false;

    function fetchFrameworks() {
      fetch(`${API_BASE}/frameworks`).
      then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }).
      then((data: unknown) => {
        if (cancelled) return;
        if (!Array.isArray(data)) {
          setFrameworks([]);
          setFrameworksLoaded(true);
          return;
        }
        setFrameworks(data as FrameworkInfo[]);
        setFrameworksLoaded(true);
        if (data.length > 0 && initial.frameworks.length === 0) {
          setFrameworksSelected([(data as FrameworkInfo[])[0].slug]);
        }
      }).
      catch(() => {
        if (!cancelled) setTimeout(fetchFrameworks, 3000);
      });
    }
    fetchFrameworks();

    fetch(`${API_BASE}/`).
    then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }).
    then((data: AppInfo) => {
      setAppInfo(data);
      // Only apply pipeline defaults when not restoring from URL
      if (!initial.search && data.pipeline) {
        setAlpha(data.pipeline.alpha);
        setThreshold(data.pipeline.threshold);
        setReranker(data.pipeline.reranker_enabled);
      }
    }).
    catch(() => {

      /* backend not reachable */});

    return () => {cancelled = true;};
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore session or auto-run search when loaded from URL params
  useEffect(() => {
    if (initial.session) {
      fetch(`${API_BASE}/sessions/${initial.session}`).
      then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }).
      then((session: ChatSession) => {
        setRestoredSession(session);
        setResults(session.search_results ?? []);
        setComponents(session.components ?? []);
        setAnswer(session.search_answer ?? '');
      }).
      catch(() => {
        // Session not found — fall back to re-running search
        if (initial.search) run(initial.search, true);
      });
    } else if (initial.search) {
      run(initial.search, true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function pushSearchUrl(searchQuery: string, sid: string) {
    const url = new URL(window.location.href);
    url.searchParams.set('search', searchQuery);
    url.searchParams.set('session', sid);
    url.searchParams.set('mode', mode);
    url.searchParams.set('topK', String(topK));
    url.searchParams.set('alpha', String(alpha));
    url.searchParams.set('threshold', String(threshold));
    url.searchParams.set('reranker', reranker ? '1' : '0');
    url.searchParams.set('codeMode', codeMode);
    url.searchParams.set('componentMode', componentMode);
    if (provider) url.searchParams.set('provider', provider);else
    url.searchParams.delete('provider');
    if (backend) url.searchParams.set('backend', backend);else
    url.searchParams.delete('backend');
    if (frameworksSelected.length > 0) url.searchParams.set('framework', frameworksSelected.join(','));else
    url.searchParams.delete('framework');
    window.history.pushState({}, '', url);
  }

  async function run(queryOverride?: string, skipUrlPush = false) {
    const q = (queryOverride ?? query).trim();
    if (!q) return;
    if (queryOverride !== undefined) setQuery(q);

    let currentSid = sessionId;
    if (!skipUrlPush) {
      const sid = crypto.randomUUID();
      currentSid = sid;
      setSessionId(sid);
      pushSearchUrl(q, sid);
    }

    setLoading(true);
    setResults([]);
    setComponents([]);
    setAnswer('');
    setCached(false);
    setError('');
    setExcludedResults(new Set());

    try {
      const baseBody: Record<string, unknown> = {
        query: q,
        top_k: topK,
        alpha,
        threshold,
        reranker,
        code_mode: codeMode,
        component_mode: componentMode
      };
      if (mode === 'query' && provider) baseBody.provider = provider;
      if (backend) baseBody.backend = backend;

      // Fan out one request per selected framework, merge results
      const slugs = frameworksSelected.length > 0 ? frameworksSelected : [''];
      const responses = await Promise.all(
        slugs.map(async (slug) => {
          const body = { ...baseBody };
          if (slug) body.framework = slug;
          const res = await fetch(`${API_BASE}/${mode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json() as Promise<SearchResponse>;
        })
      );

      // Merge results from all framework responses
      const mergedResults = responses.flatMap((d) => d.results ?? []);
      const mergedComponents = [...new Set(responses.flatMap((d) => d.components ?? []))];
      const mergedAnswer = responses.find((d) => d.answer)?.answer ?? '';
      const anyCached = responses.some((d) => d._cached);

      const data = {
        results: mergedResults,
        components: mergedComponents,
        answer: mergedAnswer,
        _cached: anyCached
      };

      setComponents(data.components);
      setResults(data.results);
      setAnswer(data.answer);
      setCached(data._cached);

      // Persist session (fire-and-forget)
      if (currentSid) {
        fetch(`${API_BASE}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: currentSid,
            query: q,
            mode,
            top_k: topK,
            provider: provider || null,
            alpha,
            threshold,
            reranker,
            backend: backend || null,
            code_mode: codeMode,
            component_mode: componentMode,
            search_results: data.results ?? [],
            components: data.components ?? [],
            search_answer: data.answer ?? null
          })
        }).catch(() => {/* ignore */});
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handleComponentClick(name: string) {
    setQuery(name);
    run(name);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') run();
  }

  function refreshFrameworks() {
    fetch(`${API_BASE}/frameworks`).
    then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }).
    then((data: unknown) => {
      if (Array.isArray(data)) setFrameworks(data as FrameworkInfo[]);
    }).
    catch(() => {});
  }

  // Find the first un-ingested framework among selected ones
  const uningestedFw = frameworks.find(
    (fw) => frameworksSelected.includes(fw.slug) && !fw.ingested
  );

  async function runIngest() {
    if (!uningestedFw) return;
    const slug = uningestedFw.slug;
    setIngesting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ framework: slug })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Poll ingest status until done
      const poll = setInterval(async () => {
        try {
          const status = await fetch(`${API_BASE}/ingest/status?framework=${slug}`).then((r) => r.json());
          if (!status.running) {
            clearInterval(poll);
            setIngesting(false);
            if (status.error) {
              setError(`Ingest failed: ${status.error}`);
            }
            refreshFrameworks();
          }
        } catch {
          clearInterval(poll);
          setIngesting(false);
          refreshFrameworks();
        }
      }, 3000);
    } catch (e) {
      setError(`Ingest failed: ${(e as Error).message}`);
      setIngesting(false);
    }
  }

  const pipelineText = appInfo?.pipeline ?
  `Pipeline: alpha=${appInfo.pipeline.alpha} threshold=${appInfo.pipeline.threshold} reranker=${appInfo.pipeline.reranker_enabled ? 'on' : 'off'} retrieve_n=${appInfo.pipeline.retrieve_n} reranker_model=${appInfo.pipeline.reranker_model}` :
  '';

  return (
    <div className="max-w-[860px] mx-auto px-4 py-6">
      {/* 1. Header */}
      <header className="flex items-baseline gap-3 mb-6">
        <h1 className="text-2xl font-semibold" data-test-id="h1-82b41fbc">
          {frameworksSelected.length > 1 ?
          `${frameworksSelected.length} Frameworks` :
          selectedFw?.name ?? appInfo?.library ?? 'RAG'}{' '}
          RAG
        </h1>
        {appInfo?.embeddings_model &&
        <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">
            {appInfo.embeddings_model}
          </span>
        }
        {sessionId &&
        <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded font-mono">
            {sessionId.slice(0, 8)}
          </span>
        }
      </header>

      {/* 1b. Framework Selector */}
      {!frameworksLoaded ?
      <div className="mb-4 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500 flex items-center gap-2">
          <span className="inline-block w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          Connecting to backend...
        </div> :
      frameworks.length === 0 ?
      <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
          No framework to ingest
        </div> :

      <div className="flex items-center gap-2 mb-4">
          <label className="text-sm text-gray-500 flex-shrink-0">Framework</label>
          <div className="min-w-[260px] flex-1 max-w-[480px]">
            <Select<FrameworkOption, true>
            isMulti
            classNamePrefix="rs"
            options={frameworkOptions}
            value={selectedOptions}
            onChange={handleFrameworkChange}
            isDisabled={ingesting}
            placeholder="Select frameworks..."
            formatOptionLabel={(opt) =>
            <div className="flex items-center gap-1.5">
                  <span>{opt.info.name}</span>
                  <span className="text-xs text-gray-400">
                    {opt.info.ingested ? `(${opt.info.chunk_count})` : '(not ingested)'}
                  </span>
                </div>
            } />

          </div>
          {uningestedFw &&
        <button
          onClick={runIngest}
          disabled={ingesting}
          className="px-3 py-1.5 text-sm font-medium rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">

              {ingesting ? 'Ingesting...' : `Ingest ${uningestedFw.name}`}
            </button>
        }
        </div>
      }

      {/* 2. Search Box */}
      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search components..."
          autoFocus
          disabled={frameworks.length === 0}
          className="flex-1 px-3.5 py-2.5 text-base border border-gray-300 rounded-md outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed" />

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as SearchMode)}
          className="px-2.5 py-2.5 text-sm border border-gray-300 rounded-md bg-white">

          <option value="query">Search + LLM</option>
          <option value="search">Search Only</option>
        </select>
        <button
          onClick={() => run()}
          disabled={loading || frameworks.length === 0}
          className="px-5 py-2.5 text-sm font-medium border-none rounded-md cursor-pointer bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">

          Go
        </button>
      </div>

      {/* 3. Options Row */}
      <div className="flex flex-wrap gap-3 items-center mb-3 text-sm text-gray-500">
        <label className="flex items-center gap-1">
          Top-K
          <input
            type="number"
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value) || 6)}
            min={1}
            max={20}
            className="w-[50px] px-1.5 py-1 border border-gray-300 rounded text-sm" />

        </label>

        <label className="flex items-center gap-1">
          Provider
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as LlmProvider)}
            className="px-2 py-1 text-sm border border-gray-300 rounded bg-white">

            <option value="">default</option>
            <option value="openai">openai</option>
            <option value="anthropic">anthropic</option>
            <option value="gemini">gemini</option>
          </select>
        </label>

        <label className="flex items-center gap-1">
          Alpha
          <input
            type="range"
            value={alpha}
            onChange={(e) => setAlpha(parseFloat(e.target.value))}
            min={0}
            max={1}
            step={0.1}
            className="w-[100px]" />

          <span className="text-xs">{alpha}</span>
        </label>

        <label className="flex items-center gap-1">
          Threshold
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)}
            min={0}
            max={1}
            step={0.05}
            className="w-[60px] px-1.5 py-1 border border-gray-300 rounded text-sm" />

        </label>

        <label className="flex items-center gap-1">
          Reranker
          <input
            type="checkbox"
            checked={reranker}
            onChange={(e) => setReranker(e.target.checked)} />

        </label>

        <label className="flex items-center gap-1">
          Backend
          <select
            value={backend}
            onChange={(e) => setBackend(e.target.value as Backend)}
            className="px-2 py-1 text-sm border border-gray-300 rounded bg-white">

            <option value="">default</option>
            <option value="chroma">ChromaDB</option>
            <option value="elasticsearch">Elasticsearch</option>
          </select>
        </label>
      </div>

      {/* 4. Pipeline Controls */}
      <div className="flex flex-wrap gap-4 items-center mb-3 text-sm text-gray-500">
        <label className="flex items-center gap-1">
          Code Separation
          <select
            value={codeMode}
            onChange={(e) => setCodeMode(e.target.value as CodeMode)}
            className="px-2 py-1 text-sm border border-gray-300 rounded bg-white">

            <option value="regex">Regex (fast)</option>
            <option value="llm">LLM</option>
          </select>
        </label>

        <label className="flex items-center gap-1">
          Component Detection
          <select
            value={componentMode}
            onChange={(e) => setComponentMode(e.target.value as ComponentMode)}
            className="px-2 py-1 text-sm border border-gray-300 rounded bg-white">

            <option value="metadata">Metadata only</option>
            <option value="parse">Metadata + Code Parse</option>
            <option value="llm">Metadata + LLM</option>
          </select>
        </label>
      </div>

      {/* 5. Pipeline Info Bar */}
      {pipelineText &&
      <div className="text-xs text-gray-400 mb-4 px-2.5 py-1.5 bg-gray-100 rounded">
          {pipelineText}
        </div>
      }

      {/* 6. Status */}
      <div className="text-sm text-gray-400 mb-4 min-h-[1.2em]">
        {loading &&
        <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin align-middle mr-1.5" />
            {mode === 'query' ? 'Searching + asking LLM...' : 'Searching...'}
          </>
        }
        {!loading && error && <span className="text-red-500">Error: {error}</span>}
        {!loading && !error && results.length > 0 &&
        <>
            {results.length} result{results.length !== 1 ? 's' : ''}
            {cached ? ' (cached)' : ''}
          </>
        }
      </div>

      {/* 7. Components Bar */}
      {components.length > 0 &&
      <div className="mb-4">
          <h4 className="text-xs text-gray-500 mb-1.5">Components</h4>
          <div className="flex flex-wrap gap-1.5">
            {components.map((c) =>
          <button
            key={c}
            onClick={() => handleComponentClick(c)}
            className="inline-block px-2.5 py-0.5 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full cursor-pointer hover:bg-blue-100 transition-colors">

                {c}
              </button>
          )}
          </div>
        </div>
      }

      {/* 8. Answer Box */}
      {answer &&
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
          <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2.5">
            Answer
          </h3>
          <div className="whitespace-pre-wrap leading-relaxed">{answer}</div>
        </div>
      }

      {/* 9. Result Cards */}
      {results.length > 0 &&
      <div className="flex items-center gap-2 mb-2">
          <label className="text-xs text-gray-400 flex items-center gap-1 cursor-pointer select-none">
            <input
            type="checkbox"
            checked={excludedResults.size === 0}
            onChange={() => {
              if (excludedResults.size === 0) {
                setExcludedResults(new Set(results.map((_, i) => i)));
              } else {
                setExcludedResults(new Set());
              }
            }} />

            All ({results.length - excludedResults.size}/{results.length} in context)
          </label>
        </div>
      }
      <div className="flex flex-col gap-2.5">
        {results.map((r, i) =>
        <div key={i} className="flex gap-2 items-start">
            <input
            type="checkbox"
            checked={!excludedResults.has(i)}
            onChange={() => {
              setExcludedResults((prev) => {
                const next = new Set(prev);
                if (next.has(i)) next.delete(i);else
                next.add(i);
                return next;
              });
            }}
            className="mt-4 flex-shrink-0 cursor-pointer" />

            <div className="flex-1 min-w-0">
              <ResultCard result={r} />
            </div>
          </div>
        )}
      </div>

      {/* 10. Ask LLM Panel */}
      {results.length > 0 &&
      <div className="mt-5">
          <AskLlmPanel
          results={results.filter((_, i) => !excludedResults.has(i))}
          provider={provider}
          apiBase={API_BASE}
          components={components}
          sessionId={sessionId}
          restoredSession={restoredSession} />

        </div>
      }
    </div>);

}