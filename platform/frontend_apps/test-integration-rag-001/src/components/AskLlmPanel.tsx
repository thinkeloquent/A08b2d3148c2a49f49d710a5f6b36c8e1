import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Select from 'react-select';
import type { MultiValue } from 'react-select';
import type { SearchResult, LlmProvider, LlmFormat, SchemaLanguage, ComponentFunction, ChatSession, PromptTemplateRef, StructuredTemplate } from '../types';
import PromptPicker from './PromptPicker';

type PanelTab = 'compose' | 'payload';

interface Variant {
  name: string;
  description: string;
  sourcecode: string;
}

interface VariantOption {
  value: string;
  label: string;
  variant: Variant;
}

interface Props {
  results: SearchResult[];
  provider: LlmProvider;
  apiBase: string;
  components?: string[];
  sessionId?: string;
  restoredSession?: ChatSession | null;
}

function isVariantArray(data: unknown): data is Variant[] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0] === 'object' &&
    data[0] !== null &&
    'name' in data[0] &&
    'sourcecode' in data[0]
  );
}

export default function AskLlmPanel({ results, provider, apiBase, components = [], sessionId, restoredSession }: Props) {
  const [question, setQuestion] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [promptTemplates, setPromptTemplates] = useState<string[]>([]);
  const [promptTemplateRefs, setPromptTemplateRefs] = useState<PromptTemplateRef[]>([]);
  const [format, setFormat] = useState<LlmFormat>('markdown');
  const [structuredTemplates, setStructuredTemplates] = useState<StructuredTemplate[]>([]);
  const [schemaLanguage, setSchemaLanguage] = useState<SchemaLanguage | ''>('');
  const [schemaText, setSchemaText] = useState('');
  const [schemaTemplateId, setSchemaTemplateId] = useState('');
  const [schemaExpanded, setSchemaExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>('compose');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  // Reference documents
  const [refDocs, setRefDocs] = useState<Record<string, string>>({});
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  // Functions
  const [compFunctions, setCompFunctions] = useState<Record<string, ComponentFunction[]>>({});
  const [fnResults, setFnResults] = useState<Record<string, unknown>>({});
  const [fnLoading, setFnLoading] = useState<Record<string, boolean>>({});

  // Variant multi-select state (keyed by fn key e.g. "ant-design--breadcrumb/get_variants")
  const [variantSelections, setVariantSelections] = useState<Record<string, VariantOption[]>>({});

  // Track whether we've already restored to avoid re-triggering
  const restoredRef = useRef(false);

  // Restore state from session
  useEffect(() => {
    if (!restoredSession || restoredRef.current) return;
    restoredRef.current = true;

    if (restoredSession.question) setQuestion(restoredSession.question);
    if (restoredSession.system_prompt) setSystemPrompt(restoredSession.system_prompt);
    if (restoredSession.format) setFormat(restoredSession.format as LlmFormat);
    if (restoredSession.schema_config) {
      setSchemaLanguage(restoredSession.schema_config.language);
      setSchemaText(restoredSession.schema_config.text);
      if (restoredSession.schema_config.template_id) setSchemaTemplateId(restoredSession.schema_config.template_id);
    }
    if (restoredSession.selected_docs) setSelectedDocs(new Set(restoredSession.selected_docs));
    if (restoredSession.variant_selections) {
      const restored: Record<string, VariantOption[]> = {};
      for (const [key, arr] of Object.entries(restoredSession.variant_selections)) {
        restored[key] = arr.map((v) => ({ value: v.value, label: v.label, variant: { name: v.label, description: '', sourcecode: '' } }));
      }
      setVariantSelections(restored);
    }
    // Restore last LLM answer
    if (restoredSession.llm_responses && restoredSession.llm_responses.length > 0) {
      const last = restoredSession.llm_responses[restoredSession.llm_responses.length - 1];
      setAnswer(last.answer);
    }
  }, [restoredSession]);

  // Fetch structured templates on mount
  useEffect(() => {
    fetch(`${apiBase}/structured-templates`)
      .then((r) => r.json())
      .then((data) => setStructuredTemplates(Array.isArray(data) ? data : []))
      .catch(() => setStructuredTemplates([]));
  }, [apiBase]);

  // Debounced save to session
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  // Skip the first 2 effect invocations (handles React 18 StrictMode double-fire)
  const saveSkipCountRef = useRef(2);

  useEffect(() => {
    if (!sessionId) return;
    if (saveSkipCountRef.current > 0) {
      saveSkipCountRef.current -= 1;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const body: Record<string, unknown> = {};
      body.question = question;
      body.system_prompt = systemPrompt;
      body.format = format;
      body.schema_config = schemaLanguage
        ? { language: schemaLanguage, text: schemaText, template_id: schemaTemplateId || undefined }
        : null;
      body.selected_docs = [...selectedDocs];
      body.prompt_templates = promptTemplateRefs.length > 0 ? promptTemplateRefs : null;
      // Save variant selections as {fnKey: [{value, label}]}
      const vs: Record<string, { value: string; label: string }[]> = {};
      for (const [key, opts] of Object.entries(variantSelections)) {
        vs[key] = opts.map((o) => ({ value: o.value, label: o.label }));
      }
      body.variant_selections = vs;

      fetch(`${apiBase}/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).catch(() => { /* ignore */ });
    }, 1000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [question, systemPrompt, format, schemaLanguage, schemaText, schemaTemplateId, selectedDocs, variantSelections, promptTemplateRefs, sessionId, apiBase]);

  const handlePromptTemplateRefsChange = useCallback((refs: PromptTemplateRef[]) => {
    setPromptTemplateRefs(refs);
  }, []);

  // Fetch documents and functions when components change
  useEffect(() => {
    if (components.length === 0) {
      setRefDocs({});
      setCompFunctions({});
      return;
    }
    const param = components.join(',');

    fetch(`${apiBase}/component-registry/documents?components=${encodeURIComponent(param)}`)
      .then((r) => r.json())
      .then((data) => {
        setRefDocs(data.documents ?? {});
        // Only auto-select all docs on fresh sessions; restored sessions keep their selection
        if (!restoredSession?.selected_docs) {
          setSelectedDocs(new Set(Object.keys(data.documents ?? {})));
        }
      })
      .catch(() => setRefDocs({}));

    fetch(`${apiBase}/component-registry/functions?components=${encodeURIComponent(param)}`)
      .then((r) => r.json())
      .then((data) => setCompFunctions(data.functions ?? {}))
      .catch(() => setCompFunctions({}));
  }, [components, apiBase]);

  // Auto-fetch get_variants when compFunctions change
  useEffect(() => {
    for (const [comp, fns] of Object.entries(compFunctions)) {
      const fileId = `ant-design--${comp}`;
      for (const fn of fns) {
        if (fn.fn !== 'get_variants') continue;
        const key = `${fileId}/${fn.fn}`;
        if (fnResults[key] !== undefined) continue;
        runFunction(fileId, fn.fn);
      }
    }
  }, [compFunctions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enrich restored variant selections with full data once get_variants results arrive
  useEffect(() => {
    setVariantSelections((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const [key, selected] of Object.entries(next)) {
        const result = fnResults[key];
        if (!isVariantArray(result)) continue;
        const variantMap = new Map((result as Variant[]).map((v) => [v.name, v]));
        const enriched = selected.map((opt) => {
          const full = variantMap.get(opt.value);
          if (full && !opt.variant.sourcecode) {
            changed = true;
            return { ...opt, variant: full };
          }
          return opt;
        });
        next[key] = enriched;
      }
      return changed ? next : prev;
    });
  }, [fnResults]);

  function toggleDoc(name: string) {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function runFunction(fileId: string, fnName: string, params?: Record<string, unknown>) {
    const key = `${fileId}/${fnName}`;
    setFnLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(`${apiBase}/component-registry/functions/${fileId}/run/${fnName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params ? { params } : {}),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFnResults((prev) => ({ ...prev, [key]: data.result }));
    } catch (e) {
      setFnResults((prev) => ({ ...prev, [key]: `Error: ${(e as Error).message}` }));
    } finally {
      setFnLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  function handleVariantChange(key: string, selected: MultiValue<VariantOption>) {
    setVariantSelections((prev) => ({ ...prev, [key]: [...selected] }));
  }

  /** Structured breakdown of everything that goes into the context string. */
  interface ContextBreakdown {
    searchResults: string;
    referenceDocs: { name: string; content: string }[];
    functionResults: { key: string; content: string }[];
    variantCode: { key: string; name: string; sourcecode: string }[];
    combined: string;
  }

  function buildContext(): ContextBreakdown {
    const searchResults = results.map((r) => r.content).join('\n\n---\n\n');

    const referenceDocs: ContextBreakdown['referenceDocs'] = [];
    for (const name of selectedDocs) {
      if (refDocs[name]) {
        referenceDocs.push({ name, content: refDocs[name] });
      }
    }

    const functionResults: ContextBreakdown['functionResults'] = [];
    const variantCode: ContextBreakdown['variantCode'] = [];
    for (const [comp, fns] of Object.entries(compFunctions)) {
      const fileId = `ant-design--${comp}`;
      for (const fn of fns) {
        const key = `${fileId}/${fn.fn}`;
        const result = fnResults[key];
        if (result === undefined) continue;

        // Variant selections — include selected variant sourcecodes
        if (fn.fn === 'get_variants' && isVariantArray(result)) {
          const selected = variantSelections[key] ?? [];
          for (const opt of selected) {
            if (opt.variant.sourcecode) {
              variantCode.push({ key, name: opt.variant.name, sourcecode: opt.variant.sourcecode });
            }
          }
          continue;
        }

        // Other function results
        const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        functionResults.push({ key, content: text });
      }
    }

    // Assemble final context string
    let combined = searchResults;
    for (const doc of referenceDocs) {
      combined += `\n\n--- Reference: ${doc.name} ---\n\n${doc.content}`;
    }
    for (const fn of functionResults) {
      combined += `\n\n--- Function: ${fn.key} ---\n\n${fn.content}`;
    }
    for (const v of variantCode) {
      combined += `\n\n--- Variant: ${v.name} ---\n\n${v.sourcecode}`;
    }

    return { searchResults, referenceDocs, functionResults, variantCode, combined };
  }

  /** Build the exact payload that will be POSTed to /llm. */
  function buildPayload(): { body: Record<string, unknown>; ctx: ContextBreakdown } | null {
    const q = question.trim();
    const hasPromptContent = q || systemPrompt.trim() || promptTemplates.length > 0;
    if (!hasPromptContent || results.length === 0) return null;

    const ctx = buildContext();

    const body: Record<string, unknown> = { context: ctx.combined, question: q, output_format: format };

    if (schemaLanguage && schemaText && (format === 'json' || format === 'yaml')) {
      body.schema_config = {
        language: schemaLanguage,
        text: schemaText,
        template_id: schemaTemplateId || undefined,
      };
    }

    if (provider) body.provider = provider;
    const combinedSystem = [...promptTemplates, systemPrompt.trim()]
      .filter(Boolean)
      .join('\n\n---\n\n');
    if (combinedSystem) body.system_prompt = combinedSystem;

    return { body, ctx };
  }

  // Memoised payload for the preview tab (recomputes on any input change)
  const previewResult = useMemo(() => buildPayload(), [
    question, systemPrompt, promptTemplates, results, selectedDocs, refDocs,
    format, schemaLanguage, schemaText, schemaTemplateId, provider,
    fnResults, variantSelections, compFunctions,
  ]); // eslint-disable-line react-hooks/exhaustive-deps
  const previewPayload = previewResult?.body ?? null;
  const previewCtx = previewResult?.ctx ?? null;

  async function askLlm() {
    const result = buildPayload();
    if (!result) return;
    const { body } = result;

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const res = await fetch(`${apiBase}/llm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Pretty-print JSON responses
      let displayAnswer = data.answer;
      if (format === 'json') {
        try {
          displayAnswer = JSON.stringify(JSON.parse(data.answer), null, 2);
        } catch {
          // If not valid JSON, show raw
        }
      }
      setAnswer(displayAnswer);

      // Persist LLM response (fire-and-forget)
      if (sessionId) {
        fetch(`${apiBase}/sessions/${sessionId}/llm-responses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: body.question, answer: data.answer }),
        }).catch(() => { /* ignore */ });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const showSchema = format === 'json' || format === 'yaml';
  const hasRefDocs = Object.keys(refDocs).length > 0;
  const hasFunctions = Object.keys(compFunctions).length > 0;

  // Compute char counts for the preview summary
  const contextCharCount = previewCtx
    ? previewCtx.combined.length
    : 0;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mb-5">
      <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2.5">
        Ask LLM about these results
      </h3>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-3">
        {([['compose', 'Compose'], ['payload', 'Payload Preview']] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs cursor-pointer border-b-2 transition-colors bg-transparent ${
              activeTab === tab
                ? 'text-blue-500 border-blue-500 font-medium'
                : 'text-gray-400 border-transparent hover:text-blue-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ===== Payload Preview tab ===== */}
      {activeTab === 'payload' && (
        <div className="flex flex-col gap-3">
          {previewPayload && previewCtx ? (
            <>
              <div className="text-xs text-gray-400">
                POST {apiBase}/llm &mdash; {contextCharCount.toLocaleString()} chars context
                &middot; {results.length} result{results.length !== 1 ? 's' : ''}
                &middot; {previewCtx.referenceDocs.length} doc{previewCtx.referenceDocs.length !== 1 ? 's' : ''}
                &middot; {previewCtx.functionResults.length} fn result{previewCtx.functionResults.length !== 1 ? 's' : ''}
                &middot; {previewCtx.variantCode.length} variant{previewCtx.variantCode.length !== 1 ? 's' : ''}
              </div>

              {/* system_prompt */}
              {previewPayload.system_prompt ? (
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-400 block mb-1">system_prompt</label>
                  <pre className="text-xs font-mono bg-amber-50 border border-amber-200 rounded p-2.5 whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto">
                    {String(previewPayload.system_prompt)}
                  </pre>
                </div>
              ) : null}

              {/* Context breakdown */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-400 block mb-1">
                  context &mdash; search results <span className="font-normal normal-case text-gray-300">({previewCtx.searchResults.length.toLocaleString()} chars)</span>
                </label>
                <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded p-2.5 whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto">
                  {previewCtx.searchResults}
                </pre>
              </div>

              {/* Reference Documents breakdown */}
              {previewCtx.referenceDocs.length > 0 && (
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-400 block mb-1">
                    context &mdash; reference documents ({previewCtx.referenceDocs.length})
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {previewCtx.referenceDocs.map((doc) => (
                      <div key={doc.name}>
                        <div className="text-xs text-gray-500 mb-0.5">{doc.name} <span className="text-gray-300">({doc.content.length.toLocaleString()} chars)</span></div>
                        <pre className="text-xs font-mono bg-emerald-50 border border-emerald-200 rounded p-2 whitespace-pre-wrap break-words max-h-[150px] overflow-y-auto">
                          {doc.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Function Results breakdown */}
              {previewCtx.functionResults.length > 0 && (
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-400 block mb-1">
                    context &mdash; function results ({previewCtx.functionResults.length})
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {previewCtx.functionResults.map((fn) => (
                      <div key={fn.key}>
                        <div className="text-xs text-gray-500 mb-0.5 font-mono">{fn.key} <span className="text-gray-300">({fn.content.length.toLocaleString()} chars)</span></div>
                        <pre className="text-xs font-mono bg-violet-50 border border-violet-200 rounded p-2 whitespace-pre-wrap break-words max-h-[150px] overflow-y-auto">
                          {fn.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Variant Sourcecodes breakdown */}
              {previewCtx.variantCode.length > 0 && (
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-400 block mb-1">
                    context &mdash; selected variants ({previewCtx.variantCode.length})
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {previewCtx.variantCode.map((v, i) => (
                      <div key={`${v.key}-${i}`}>
                        <div className="text-xs text-gray-500 mb-0.5">{v.name} <span className="text-gray-300">({v.sourcecode.length.toLocaleString()} chars)</span></div>
                        <pre className="text-xs font-mono bg-orange-50 border border-orange-200 rounded p-2 whitespace-pre-wrap break-words max-h-[150px] overflow-y-auto">
                          {v.sourcecode}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* question */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-400 block mb-1">question</label>
                <pre className="text-xs font-mono bg-blue-50 border border-blue-200 rounded p-2.5 whitespace-pre-wrap break-words">
                  {String(previewPayload.question) || '(empty)'}
                </pre>
              </div>

              {/* metadata row */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span><strong>output_format:</strong> {String(previewPayload.output_format)}</span>
                {previewPayload.provider ? <span><strong>provider:</strong> {String(previewPayload.provider)}</span> : null}
                {previewPayload.schema_config ? (() => {
                  const sc = previewPayload.schema_config as Record<string, string>;
                  return (
                    <span><strong>schema_config:</strong> {sc.language}
                      {sc.template_id ? ` (${sc.template_id})` : ''}
                    </span>
                  );
                })() : null}
              </div>

              {/* Full JSON payload */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-400 block mb-1">Full JSON Payload</label>
                <pre className="text-xs font-mono bg-gray-900 text-green-300 rounded p-3 whitespace-pre-wrap break-words max-h-[400px] overflow-y-auto">
                  {JSON.stringify(previewPayload, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-400 italic py-4 text-center">
              Enter a question or system instruction to preview the payload.
            </div>
          )}

          {/* Keep the Ask LLM button visible on this tab too */}
          <div className="flex gap-2 items-center mt-1">
            <button
              onClick={askLlm}
              disabled={loading || !previewPayload}
              className="px-5 py-2 text-sm font-medium border-none rounded-md cursor-pointer bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ask LLM
            </button>
            {loading && (
              <span className="text-sm text-gray-400">
                <span className="inline-block w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin align-middle mr-1.5" />
                Asking LLM...
              </span>
            )}
            {error && <span className="text-sm text-red-500">Error: {error}</span>}
          </div>

          {answer && (
            <div className="mt-2 whitespace-pre-wrap leading-relaxed p-3.5 bg-blue-50 border border-blue-200 rounded-md text-sm text-gray-800">
              {format === 'json' || format === 'yaml' ? (
                <pre className="text-xs font-mono overflow-x-auto m-0">{answer}</pre>
              ) : (
                answer
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== Compose tab ===== */}
      {activeTab === 'compose' && <>

      {/* Reference Documents */}
      {hasRefDocs && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
            Reference Documents
          </h4>
          <div className="flex flex-col gap-1.5">
            {Object.keys(refDocs).map((name) => (
              <label key={name} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDocs.has(name)}
                  onChange={() => toggleDoc(name)}
                />
                {name}
                <span className="text-xs text-gray-400">
                  ({refDocs[name].length} chars)
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Selected docs are appended to LLM context
          </p>
        </div>
      )}

      {/* Function Cards */}
      {hasFunctions && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
            Component Functions
          </h4>
          <div className="flex flex-col gap-2">
            {Object.entries(compFunctions).map(([comp, fns]) => {
              const fileId = `ant-design--${comp}`;
              return fns.map((fn) => {
                const key = `${fileId}/${fn.fn}`;
                const result = fnResults[key];
                const isVariant = fn.fn === 'get_variants' && isVariantArray(result);

                // get_variants with react-select multi-select
                if (isVariant) {
                  const options: VariantOption[] = (result as Variant[]).map((v) => ({
                    value: v.name,
                    label: v.name,
                    variant: v,
                  }));
                  const selected = variantSelections[key] ?? [];

                  return (
                    <div key={key} className="p-2 bg-white border border-gray-200 rounded">
                      <div className="text-sm font-medium text-gray-700 mb-1.5">
                        {fn.fn}
                        <span className="ml-1.5 text-xs text-gray-400 font-normal">{comp}</span>
                      </div>
                      {fn.description && (
                        <div className="text-xs text-gray-500 mb-2">{fn.description}</div>
                      )}
                      <Select<VariantOption, true>
                        isMulti
                        classNamePrefix="rs"
                        options={options}
                        value={selected}
                        onChange={(val) => handleVariantChange(key, val)}
                        placeholder="Select variants..."
                        formatOptionLabel={(opt) => (
                          <div>
                            <div className="text-sm font-medium">{opt.variant.name}</div>
                            <div className="text-xs text-gray-500">{opt.variant.description}</div>
                          </div>
                        )}
                      />
                      {/* Show selected variants */}
                      {selected.length > 0 && (
                        <div className="mt-2 flex flex-col gap-2">
                          {selected.map((opt) => (
                            <div key={opt.value} className="border border-gray-200 rounded p-2.5 bg-gray-50">
                              <div className="text-sm font-medium text-gray-700">{opt.variant.name}</div>
                              <div className="text-xs text-gray-500 mb-1.5">{opt.variant.description}</div>
                              <pre className="text-xs bg-white border border-gray-200 rounded p-2 overflow-x-auto max-h-[300px] overflow-y-auto">
                                {opt.variant.sourcecode}
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Default function card with Run button
                return (
                  <div key={key} className="flex items-start gap-2 p-2 bg-white border border-gray-200 rounded">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700">
                        {fn.fn}
                        <span className="ml-1.5 text-xs text-gray-400 font-normal">{comp}</span>
                      </div>
                      {fn.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{fn.description}</div>
                      )}
                      {result !== undefined && (
                        <pre className="mt-1.5 text-xs bg-gray-50 border border-gray-200 rounded p-2 overflow-x-auto max-h-[200px] overflow-y-auto">
                          {typeof result === 'string'
                            ? result
                            : JSON.stringify(result, null, 2)}
                        </pre>
                      )}
                    </div>
                    <button
                      onClick={() => runFunction(fileId, fn.fn)}
                      disabled={fnLoading[key]}
                      className="px-3 py-1 text-xs font-medium border-none rounded cursor-pointer bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {fnLoading[key] ? '...' : 'Run'}
                    </button>
                  </div>
                );
              });
            })}
          </div>
        </div>
      )}

      <PromptPicker
        onChange={setPromptTemplates}
        onItemsChange={handlePromptTemplateRefsChange}
        initialPrompts={restoredSession?.prompt_templates ?? undefined}
      />

      <label className="text-xs text-gray-400 mb-1 block">System Instruction</label>
      <textarea
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        placeholder="Optional system instruction for the LLM..."
        className="w-full min-h-[40px] px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-md font-[inherit] resize-y outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 mb-2.5"
      />

      <label className="text-xs text-gray-400 mb-1 block">Question</label>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question..."
        className="w-full min-h-[60px] px-3 py-2.5 text-base border border-gray-300 rounded-md font-[inherit] resize-y outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
      />

      {/* Schema section (visible for json/yaml) */}
      {showSchema && (
        <div className="mt-2 mb-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Schema (optional)</h4>
          <div className="flex gap-2 items-center mb-2">
            <label className="text-sm text-gray-500 flex items-center gap-1">
              Language
              <select
                value={schemaLanguage}
                onChange={(e) => {
                  setSchemaLanguage(e.target.value as SchemaLanguage | '');
                  if (!e.target.value) {
                    setSchemaText('');
                    setSchemaTemplateId('');
                  }
                }}
                className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
              >
                <option value="">(None)</option>
                <option value="json_schema">JSON Schema</option>
                <option value="zod">Zod</option>
                <option value="typescript">TypeScript</option>
                <option value="graphql">GraphQL</option>
                <option value="pydantic">Pydantic</option>
                <option value="dataclass">Python dataclass</option>
                <option value="typeddict">Python TypedDict</option>
              </select>
            </label>

            {schemaLanguage === 'json_schema' && structuredTemplates.length > 0 && (
              <label className="text-sm text-gray-500 flex items-center gap-1">
                Preset
                <select
                  value={schemaTemplateId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSchemaTemplateId(id);
                    if (id) {
                      const tmpl = structuredTemplates.find((t) => t.id === id);
                      if (tmpl) {
                        setSchemaText(JSON.stringify(tmpl.schema, null, 2));
                        setSchemaExpanded(true);
                      }
                    }
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                >
                  <option value="">(Custom)</option>
                  {structuredTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {schemaLanguage && (
            <>
              <button
                type="button"
                onClick={() => setSchemaExpanded((v) => !v)}
                className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer bg-transparent border-none p-0 mb-1"
              >
                {schemaExpanded ? 'Hide' : 'Show'} schema definition
              </button>
              {schemaExpanded && (
                <textarea
                  value={schemaText}
                  onChange={(e) => {
                    setSchemaText(e.target.value);
                    // Clear template ID if user edits text
                    if (schemaTemplateId) {
                      const tmpl = structuredTemplates.find((t) => t.id === schemaTemplateId);
                      if (tmpl && e.target.value !== JSON.stringify(tmpl.schema, null, 2)) {
                        setSchemaTemplateId('');
                      }
                    }
                  }}
                  placeholder={`Paste your ${schemaLanguage === 'json_schema' ? 'JSON Schema' : schemaLanguage} definition here...`}
                  className="w-full min-h-[100px] px-3 py-2 text-xs font-mono text-gray-700 border border-gray-300 rounded-md resize-y outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                />
              )}
            </>
          )}
        </div>
      )}

      <div className="flex gap-2 items-center mt-2.5">
        <label className="text-sm text-gray-500 flex items-center gap-1">
          Format
          <select
            value={format}
            onChange={(e) => {
              setFormat(e.target.value as LlmFormat);
              // Reset schema when switching to markdown
              if (e.target.value === 'markdown') {
                setSchemaLanguage('');
                setSchemaText('');
                setSchemaTemplateId('');
                setSchemaExpanded(false);
              }
            }}
            className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
          >
            <option value="markdown">Markdown</option>
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
          </select>
        </label>

        <button
          onClick={askLlm}
          disabled={loading}
          className="px-5 py-2 text-sm font-medium border-none rounded-md cursor-pointer bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ask LLM
        </button>

        {loading && (
          <span className="text-sm text-gray-400">
            <span className="inline-block w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin align-middle mr-1.5" />
            Asking LLM...
          </span>
        )}
        {error && <span className="text-sm text-red-500">Error: {error}</span>}
      </div>

      {answer && (
        <div className="mt-3.5 whitespace-pre-wrap leading-relaxed p-3.5 bg-blue-50 border border-blue-200 rounded-md text-sm text-gray-800">
          {format === 'json' || format === 'yaml' ? (
            <pre className="text-xs font-mono overflow-x-auto m-0">{answer}</pre>
          ) : (
            answer
          )}
        </div>
      )}

      </>}
    </div>
  );
}
