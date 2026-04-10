/**
 * Persona Edit Page
 * Full-page form for editing an existing persona with AI suggest buttons.
 * All select options are loaded from LLM defaults categories.
 */

import { useState, useEffect } from 'react';
import Select from 'react-select';
import { ArrowLeft, Loader2, ExternalLink, RefreshCw, Sparkles, Info, ChevronDown, Copy, Check, Download } from 'lucide-react';
import type { UpdatePersonaRequest } from '../types/persona';
import type { LLMDefault, LLMDefaultCategory } from '../types/llm-default';
import { usePersona, useUpdatePersona } from '../hooks/usePersonas';
import { useLLMDefaultsByCategory } from '../hooks/useLLMDefaults';
import { useResolveReferences, EDGE_TEMPLATE, buildTemplateContext } from '../hooks/useResolveReferences';
import { personasApi, llmDefaultsApi, API_BASE_URL } from '../services/api';
import { post } from '../services/api/client';


const BASE = '/apps/persona-editor';
const ADMIN_BASE = '/admin/apps/persona-editor/llm-defaults/category';

type Option = {value: string;label: string;};

function entryValue(entry: LLMDefault): string {
  if (typeof entry.value === 'string' && entry.value !== '') return entry.value;
  return entry.name;
}

function toOptions(entries: LLMDefault[]): Option[] {
  return entries.map((e) => ({ value: entryValue(e), label: e.name }));
}

function fmtValue(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return JSON.stringify(v, null, 2);
}

type ExportFormat = 'markdown' | 'json' | 'yaml' | 'xml' | 'toml';

function formatPrompt(prompt: string, name: string, format: ExportFormat): string {
  switch (format) {
    case 'markdown':
      return prompt;
    case 'json':
      return JSON.stringify({ name, generated_prompt: prompt }, null, 2);
    case 'yaml':{
        const indent = prompt.split('\n').map((l) => `  ${l}`).join('\n');
        return `name: ${JSON.stringify(name)}\ngenerated_prompt: |\n${indent}\n`;
      }
    case 'xml':
      return `<persona>\n  <name>${name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</name>\n  <generated_prompt>${prompt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</generated_prompt>\n</persona>`;
    case 'toml':{
        const escaped = prompt.replace(/\\/g, '\\\\').replace(/"""/g, '\\"""');
        return `name = ${JSON.stringify(name)}\ngenerated_prompt = """\n${escaped}\n"""`;
      }
  }
}

function fileExtension(format: ExportFormat): string {
  const map: Record<ExportFormat, string> = { markdown: '.md', json: '.json', yaml: '.yaml', xml: '.xml', toml: '.toml' };
  return map[format];
}

function mimeType(format: ExportFormat): string {
  const map: Record<ExportFormat, string> = {
    markdown: 'text/markdown', json: 'application/json', yaml: 'text/yaml', xml: 'application/xml', toml: 'text/plain'
  };
  return map[format];
}

function EmptyCategory({ category, label, onRefresh, isRefreshing




}: {category: LLMDefaultCategory;label: string;onRefresh: () => void;isRefreshing?: boolean;}) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
      <span>No {label.toLowerCase()} defined.</span>
      <a
        href={`${ADMIN_BASE}/${category}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline inline-flex items-center gap-0.5">

        Create {label.toLowerCase()}
        <ExternalLink className="w-3 h-3" />
      </a>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors disabled:opacity-50"
        title="Refresh">

        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>);

}

interface FetchStatus {
  id: string;
  status: 'success' | 'error';
  request: {method: string;url: string;};
  response: {status: number;data?: unknown;error?: string;};
}

const SUGGEST_TABS = ['Resolved', 'Raw Prompt', 'Metadata', 'Fetch Log'] as const;

function SuggestionContent({
  suggestion,
  properties,
  onApply




}: {suggestion: string;properties: Record<string, unknown>;onApply: (text: string, template?: string, data?: Record<string, unknown>) => void;}) {
  const [activeTab, setActiveTab] = useState(0);
  const [resolvedText, setResolvedText] = useState('');
  const [resolvedEntries, setResolvedEntries] = useState<Record<string, LLMDefault>>({});
  const [fetchStatuses, setFetchStatuses] = useState<FetchStatus[]>([]);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (!suggestion) {
      setResolvedText('');
      setResolvedEntries({});
      setFetchStatuses([]);
      return;
    }

    const idPattern = /\[\[([^\]]+)\]\]/g;
    const suggestionIds = [...suggestion.matchAll(idPattern)].map((m) => m[1]);

    const propsIds: string[] = [];
    for (const val of Object.values(properties)) {
      const items = Array.isArray(val) ? val : val ? [val] : [];
      for (const item of items) {
        if (typeof item === 'string') {
          for (const m of item.matchAll(idPattern)) propsIds.push(m[1]);
        }
      }
    }

    const uniqueIds = [...new Set([...suggestionIds, ...propsIds])];

    if (uniqueIds.length === 0) {
      setResolvedText(suggestion);
      setResolvedEntries({});
      setFetchStatuses([]);
      return;
    }

    setIsResolving(true);
    const statuses: FetchStatus[] = [];
    const resolvedMap: Record<string, string> = {};
    const entriesMap: Record<string, LLMDefault> = {};

    Promise.allSettled(
      uniqueIds.map(async (id) => {
        const requestUrl = `${API_BASE_URL}/llm-defaults/${id}`;
        try {
          const entry = await llmDefaultsApi.getById(id);
          const content = typeof entry.value === 'string' ?
          entry.value :
          JSON.stringify(entry.value, null, 2);
          resolvedMap[id] = content;
          entriesMap[id] = entry;
          statuses.push({
            id,
            status: 'success',
            request: { method: 'GET', url: requestUrl },
            response: { status: 200, data: entry }
          });
        } catch (err: unknown) {
          resolvedMap[id] = `[[${id}]]`;
          const errObj = err as {status?: number;message?: string;};
          statuses.push({
            id,
            status: 'error',
            request: { method: 'GET', url: requestUrl },
            response: {
              status: errObj?.status || 500,
              error: errObj?.message || String(err)
            }
          });
        }
      })
    ).then(() => {
      let resolved = suggestion;
      for (const [id, value] of Object.entries(resolvedMap)) {
        resolved = resolved.split(`[[${id}]]`).join(value);
      }
      setResolvedText(resolved);
      setResolvedEntries({ ...entriesMap });
      setFetchStatuses(statuses);
      setIsResolving(false);
    });
  }, [suggestion, properties]);

  const fmt = (v: unknown): string => {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    return JSON.stringify(v, null, 2);
  };
  const getEntry = (v: string): LLMDefault | null => {
    const m = v.match(/^\[\[([^\]]+)\]\]$/);
    if (m && resolvedEntries[m[1]]) return resolvedEntries[m[1]];
    return null;
  };
  const isRef = (v: string) => /^\[\[([^\]]+)\]\]$/.test(v);

  return (
    <>
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 mb-4">
        {SUGGEST_TABS.map((tab, idx) =>
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(idx)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
          activeTab === idx ?
          'border-blue-600 text-blue-600' :
          'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
          }>

            {tab}
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="overflow-y-auto">
        {activeTab === 0 &&
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resolved Prompt (IDs expanded to content)
            </label>
            {isResolving ?
          <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Resolving [[id]] references...
              </div> :

          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-800 whitespace-pre-wrap">
                {resolvedText}
              </div>
          }
          </div>
        }

        {activeTab === 1 &&
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raw Prompt (with [[id]] references)
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-800 whitespace-pre-wrap">
              {suggestion}
            </div>
          </div>
        }

        {activeTab === 2 &&
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Properties Breakdown
            </label>
            {isResolving &&
          <div className="flex items-center gap-2 py-2 text-sm text-gray-500 mb-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Resolving references...
              </div>
          }
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded-md">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-2 py-2 border-b border-gray-200 font-medium text-gray-700">Property</th>
                    <th className="w-8 px-1 py-2 border-b border-gray-200 text-center"><Info className="w-3.5 h-3.5 text-gray-400 inline-block" /></th>
                    <th className="text-left px-2 py-2 border-b border-gray-200 font-medium text-gray-700">Value</th>
                    <th className="text-left px-2 py-2 border-b border-gray-200 font-medium text-gray-700">Context</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(properties).map(([key, value]) => {
                  const items: string[] = Array.isArray(value) ?
                  value as string[] :
                  value ? [String(value)] : [];

                  if (items.length === 0) {
                    return (
                      <tr key={key} className="border-b border-gray-100">
                          <td className="px-2 py-2 font-mono text-gray-600 align-top">{key}</td>
                          <td className="px-2 py-2 text-gray-400 italic" colSpan={3}>empty</td>
                        </tr>);

                  }

                  return items.map((item, idx) => {
                    const hasRef = isRef(item);
                    const entry = hasRef ? getEntry(item) : null;
                    return (
                      <tr key={`${key}-${idx}`} className="border-b border-gray-100">
                          {idx === 0 ?
                        <td className="px-2 py-2 font-mono text-gray-600 align-top" rowSpan={items.length}>{key}</td> :
                        null}
                          <td className="px-1 py-2 text-center">
                            {hasRef && entry ?
                          <span className="relative group">
                                <Info className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500 cursor-help inline-block" />
                                <span className="absolute left-0 top-full mt-1 z-50 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-md px-3 py-2 shadow-lg whitespace-normal">
                                  <span className="block mb-0.5"><span className="text-gray-400">Reference:</span> <span className="font-mono text-blue-300">{item}</span></span>
                                  <span className="block mb-0.5"><span className="text-gray-400">Name:</span> <span className="text-white">{entry.name}</span></span>
                                  <span className="block mb-0.5"><span className="text-gray-400">ID:</span> <span className="font-mono text-white">{entry.id}</span></span>
                                  {entry.description && <span className="block"><span className="text-gray-400">Description:</span> <span className="text-gray-300">{entry.description}</span></span>}
                                </span>
                              </span> :
                          null}
                          </td>
                          {hasRef && entry ?
                        <>
                              <td className="px-2 py-2 text-gray-800">
                                <pre className="whitespace-pre-wrap max-h-24 overflow-y-auto">{fmt(entry.value)}</pre>
                              </td>
                              <td className="px-2 py-2 text-gray-700">
                                <pre className="whitespace-pre-wrap max-h-24 overflow-y-auto">{fmt(entry.context)}</pre>
                              </td>
                            </> :
                        hasRef ?
                        <td className="px-2 py-2 text-gray-400 italic" colSpan={2}>pending...</td> :

                        <>
                              <td className="px-2 py-2 text-gray-800 whitespace-pre-wrap">{item}</td>
                              <td className="px-2 py-2 text-gray-400">—</td>
                            </>
                        }
                        </tr>);

                  });
                })}
                </tbody>
              </table>
            </div>
          </div>
        }

        {activeTab === 3 &&
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fetch Log
            </label>
            {fetchStatuses.length === 0 ?
          <p className="text-sm text-gray-500 italic">No [[id]] references found — no fetches needed.</p> :

          <div className="space-y-3">
                {fetchStatuses.map((fs) =>
            <div
              key={fs.id}
              className={`border rounded-md p-3 text-sm ${
              fs.status === 'success' ?
              'border-green-200 bg-green-50' :
              'border-red-200 bg-red-50'}`
              }>

                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                fs.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`
                } />
                      <span className="font-mono font-medium">{fs.id}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                fs.status === 'success' ?
                'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'}`
                }>
                        {fs.status === 'success' ? 'OK' : 'ERROR'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 font-mono text-xs">
                      <div>
                        <span className="text-gray-500">Request: </span>
                        <span className="text-gray-700">{fs.request.method} {fs.request.url}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Response: </span>
                        <pre className="inline whitespace-pre-wrap text-gray-700">
                          {JSON.stringify(fs.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
            )}
              </div>
          }
          </div>
        }
      </div>

      {/* Apply Action */}
      <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          disabled={!suggestion}
          onClick={() => onApply(suggestion)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors">

          <Sparkles className="w-4 h-4" />
          Generate Persona Prompt
        </button>
      </div>
    </>);

}

export function PersonaEditPage({ personaId }: {personaId: string;}) {
  const { data: persona, isLoading: personaLoading } = usePersona(personaId);

  const { data: providerEntries = [], isLoading: providersLoading, isFetching: providersFetching, refetch: refetchProviders } = useLLMDefaultsByCategory('providers');
  const { data: roleEntries = [], isLoading: rolesLoading, isFetching: rolesFetching, refetch: refetchRoles } = useLLMDefaultsByCategory('roles');
  const { data: toneEntries = [], isLoading: tonesLoading, isFetching: tonesFetching, refetch: refetchTones } = useLLMDefaultsByCategory('tones');
  const { data: goalEntries = [], isLoading: goalsLoading, isFetching: goalsFetching, refetch: refetchGoals } = useLLMDefaultsByCategory('goals');
  const { data: toolEntries = [], isLoading: toolsLoading, isFetching: toolsFetching, refetch: refetchTools } = useLLMDefaultsByCategory('tools');
  const { data: permissionEntries = [], isLoading: permissionsLoading, isFetching: permissionsFetching, refetch: refetchPermissions } = useLLMDefaultsByCategory('permissions');

  const [formData, setFormData] = useState<UpdatePersonaRequest>({
    name: '',
    description: '',
    llm_provider: '',
    role: '',
    tone: '',
    version: '1.0.0',
    llm_temperature: 0.7,
    goals: [],
    tools: [],
    permitted_to: [],
    persona_prompt_data: undefined,
    persona_prompt_template: ''
  });

  const [pageTab, setPageTab] = useState(0);
  const [promptSubTab, setPromptSubTab] = useState(0);
  const [resolvedPrompt, setResolvedPrompt] = useState('');
  const [isRenderingPrompt, setIsRenderingPrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoApply, setAutoApply] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [exportFormat, setExportFormat] = useState<ExportFormat>('markdown');
  const [copied, setCopied] = useState(false);

  // Suggestion modal state
  const [suggestionModal, setSuggestionModal] = useState<{
    isOpen: boolean;
    type: 'name' | 'description' | 'persona_prompt';
    isLoading: boolean;
    suggestion: string;
    properties: Record<string, unknown>;
  }>({ isOpen: false, type: 'name', isLoading: false, suggestion: '', properties: {} });

  const { resolvedEntries, fetchStatuses, isResolving } =
  useResolveReferences(suggestionModal.suggestion, suggestionModal.properties);

  useEffect(() => {
    if (persona) {
      setFormData({
        name: persona.name,
        description: persona.description,
        llm_provider: persona.llm_provider,
        role: persona.role ?? '',
        tone: persona.tone ?? '',
        version: persona.version || '1.0.0',
        llm_temperature: persona.llm_temperature ?? 0.7,
        goals: persona.goals || [],
        tools: persona.tools || [],
        permitted_to: persona.permitted_to || [],
        persona_prompt_data: persona.persona_prompt_data ?? undefined,
        persona_prompt_template: persona.persona_prompt_template ?? ''
      });
    }
  }, [persona]);

  // Render resolved prompt from saved template + data
  useEffect(() => {
    const template = formData.persona_prompt_template;
    const data = formData.persona_prompt_data;
    if (!template || !data) {
      setResolvedPrompt('');
      return;
    }
    setIsRenderingPrompt(true);
    post<{rendered: string;}>('/render-template', { template, data }).
    then((res) => setResolvedPrompt(res.rendered)).
    catch(() => setResolvedPrompt('[render error]')).
    finally(() => setIsRenderingPrompt(false));
  }, [formData.persona_prompt_template, formData.persona_prompt_data]);

  // Auto-apply after generate completes (tab 0 generate button)
  useEffect(() => {
    if (autoApply && !isResolving && Object.keys(resolvedEntries).length > 0) {
      const data = buildTemplateContext(suggestionModal.properties, resolvedEntries);
      setFormData((prev) => ({
        ...prev,
        persona_prompt_template: EDGE_TEMPLATE,
        persona_prompt_data: data
      }));
      setAutoApply(false);
      setIsGenerating(false);
    }
  }, [autoApply, isResolving, resolvedEntries, suggestionModal.properties]);

  const updatePersona = useUpdatePersona({
    onSuccess: () => {
      window.location.href = BASE;
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePersona.mutate({ id: personaId, data: formData });
  };

  const handleSuggest = async (type: 'name' | 'description' | 'persona_prompt') => {
    // Map a stored value back to its LLM-default entry and wrap the ID in [[id]]
    const toRef = (entries: LLMDefault[], value: string): string => {
      const entry = entries.find((e) => entryValue(e) === value);
      return entry ? `[[${entry.id}]]` : value;
    };

    const properties: Record<string, unknown> = {
      name: formData.name,
      description: formData.description,
      role: formData.role ? [toRef(roleEntries, formData.role)] : [],
      tone: formData.tone ? [toRef(toneEntries, formData.tone)] : [],
      llm_provider: formData.llm_provider ? [toRef(providerEntries, formData.llm_provider)] : [],
      goals: (formData.goals || []).map((g) => toRef(goalEntries, g)),
      tools: (formData.tools || []).map((t) => toRef(toolEntries, t)),
      permitted_to: (formData.permitted_to || []).map((p) => toRef(permissionEntries, p))
    };

    setSuggestionModal({ isOpen: true, type, isLoading: true, suggestion: '', properties });

    try {
      const result = await personasApi.suggest(type, properties);
      setSuggestionModal((prev) => ({ ...prev, isLoading: false, suggestion: result.suggestion }));
    } catch {
      setSuggestionModal((prev) => ({ ...prev, isLoading: false, suggestion: 'Failed to generate suggestion. Please try again.' }));
    }
  };

  const handleApplySuggestion = (text: string, template?: string, data?: Record<string, unknown>) => {
    if (suggestionModal.type === 'persona_prompt') {
      setFormData({
        ...formData,
        persona_prompt_template: template ?? '',
        persona_prompt_data: data ?? undefined
      });
    } else {
      setFormData({ ...formData, [suggestionModal.type]: text });
    }
    setSuggestionModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setAutoApply(true);
    handleSuggest('persona_prompt');
  };

  const handleResetTemplate = () => {
    setFormData((prev) => ({ ...prev, persona_prompt_template: EDGE_TEMPLATE }));
  };

  const providerOptions = toOptions(providerEntries);
  const roleOptions = toOptions(roleEntries);
  const toneOptions = toOptions(toneEntries);
  const goalOptions = toOptions(goalEntries);
  const toolOptions = toOptions(toolEntries);
  const permissionOptions = toOptions(permissionEntries);

  const selectedGoals = goalOptions.filter((o) => (formData.goals || []).includes(o.value));
  const selectedTools = toolOptions.filter((o) => (formData.tools || []).includes(o.value));
  const selectedPermissions = permissionOptions.filter((o) => (formData.permitted_to || []).includes(o.value));

  if (personaLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>);

  }

  if (!persona) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Persona not found</p>
          <a href={BASE} className="text-blue-600 hover:underline">Back to list</a>
        </div>
      </div>);

  }

  const suggestLabel = (type: string) =>
  type === 'persona_prompt' ? 'Persona Prompt' : type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-test-id="div-b1e4c46e">
          <div className="flex items-center gap-4 h-16">
            <a
              href={BASE}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">

              <ArrowLeft className="w-5 h-5" />
            </a>
            <h1 className="text-xl font-semibold text-gray-900">
              Edit Persona
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Tabs */}
        <div className="flex border-b border-gray-200 mb-6" data-test-id="div-dbfa3f68">
          {['Persona Prompt', 'Data', 'Fetched Data', 'Fetch Debug Logs'].map((tab, idx) =>
          <button
            key={tab}
            type="button"
            onClick={() => setPageTab(idx)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            pageTab === idx ?
            'border-blue-600 text-blue-600' :
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
            }>

              {tab}
            </button>
          )}
        </div>

        {pageTab === 1 &&
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Description */}
          <div data-test-id="div-c5021a9e">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              Name *
              <button
                type="button"
                onClick={() => handleSuggest('name')}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors">

                <Sparkles className="w-3 h-3" />
                Suggest
              </button>
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={255}
              value={formData.name || ''}
              onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Persona" />

          </div>

          <div data-test-id="div-d6315253">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              Description *
              <button
                type="button"
                onClick={() => handleSuggest('description')}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors">

                <Sparkles className="w-3 h-3" />
                Suggest
              </button>
            </label>
            <textarea
              required
              minLength={10}
              value={formData.description || ''}
              onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what this persona does..." />

          </div>

          {/* Provider, Role, Tone */}
          <div className="grid gap-6 lg:grid-cols-3" data-test-id="div-ea911cc2">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                LLM Provider *
                <button type="button" onClick={() => refetchProviders()} disabled={providersFetching} className="p-0.5 text-gray-400 hover:text-blue-600 rounded transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${providersFetching ? 'animate-spin' : ''}`} />
                </button>
              </label>
              {providersLoading ?
              <div className="flex items-center gap-1 text-sm text-gray-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div> :
              providerEntries.length === 0 ?
              <EmptyCategory category="providers" label="Providers" onRefresh={refetchProviders} isRefreshing={providersFetching} /> :

              <Select
                options={providerOptions}
                value={providerOptions.find((o) => o.value === formData.llm_provider) || null}
                onChange={(opt) =>
                setFormData({ ...formData, llm_provider: opt?.value || '' })
                }
                placeholder="Select provider..."
                isClearable />

              }
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                Role
                <button type="button" onClick={() => refetchRoles()} disabled={rolesFetching} className="p-0.5 text-gray-400 hover:text-blue-600 rounded transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${rolesFetching ? 'animate-spin' : ''}`} />
                </button>
              </label>
              {rolesLoading ?
              <div className="flex items-center gap-1 text-sm text-gray-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div> :
              roleEntries.length === 0 ?
              <EmptyCategory category="roles" label="Roles" onRefresh={refetchRoles} isRefreshing={rolesFetching} /> :

              <Select
                options={roleOptions}
                value={roleOptions.find((o) => o.value === (formData.role || '')) || null}
                onChange={(opt) =>
                setFormData({ ...formData, role: opt?.value || undefined })
                }
                placeholder="Select role..."
                isClearable />

              }
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                Tone
                <button type="button" onClick={() => refetchTones()} disabled={tonesFetching} className="p-0.5 text-gray-400 hover:text-blue-600 rounded transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${tonesFetching ? 'animate-spin' : ''}`} />
                </button>
              </label>
              {tonesLoading ?
              <div className="flex items-center gap-1 text-sm text-gray-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div> :
              toneEntries.length === 0 ?
              <EmptyCategory category="tones" label="Tones" onRefresh={refetchTones} isRefreshing={tonesFetching} /> :

              <Select
                options={toneOptions}
                value={toneOptions.find((o) => o.value === (formData.tone || '')) || null}
                onChange={(opt) =>
                setFormData({ ...formData, tone: opt?.value || undefined })
                }
                placeholder="Select tone..."
                isClearable />

              }
            </div>
          </div>

          {/* Version & Temperature */}
          <div className="grid gap-6 lg:grid-cols-2" data-test-id="div-7c14f2ef">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Version
              </label>
              <input
                type="text"
                value={formData.version || ''}
                onChange={(e) =>
                setFormData({ ...formData, version: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1.0.0" />

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (0.0 - 1.0)
              </label>
              <input
                type="number"
                min={0}
                max={1}
                step={0.1}
                value={formData.llm_temperature ?? 0.7}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  llm_temperature: parseFloat(e.target.value)
                })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />

            </div>
          </div>

          {/* Goals & Tools */}
          <div className="grid gap-6 lg:grid-cols-2" data-test-id="div-50d98c8c">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                Goals
                <button type="button" onClick={() => refetchGoals()} disabled={goalsFetching} className="p-0.5 text-gray-400 hover:text-blue-600 rounded transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${goalsFetching ? 'animate-spin' : ''}`} />
                </button>
              </label>
              {goalsLoading ?
              <div className="flex items-center gap-1 text-sm text-gray-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div> :
              goalEntries.length === 0 ?
              <EmptyCategory category="goals" label="Goals" onRefresh={refetchGoals} isRefreshing={goalsFetching} /> :

              <Select
                isMulti
                options={goalOptions}
                value={selectedGoals}
                onChange={(opts) =>
                setFormData({
                  ...formData,
                  goals: (opts || []).map((o) => o.value)
                })
                }
                placeholder="Select goals..." />

              }
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                Tools
                <button type="button" onClick={() => refetchTools()} disabled={toolsFetching} className="p-0.5 text-gray-400 hover:text-blue-600 rounded transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${toolsFetching ? 'animate-spin' : ''}`} />
                </button>
              </label>
              {toolsLoading ?
              <div className="flex items-center gap-1 text-sm text-gray-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div> :
              toolEntries.length === 0 ?
              <EmptyCategory category="tools" label="Tools" onRefresh={refetchTools} isRefreshing={toolsFetching} /> :

              <Select
                isMulti
                options={toolOptions}
                value={selectedTools}
                onChange={(opts) =>
                setFormData({
                  ...formData,
                  tools: (opts || []).map((o) => o.value)
                })
                }
                placeholder="Select tools..." />

              }
            </div>
          </div>

          {/* Permissions */}
          <div data-test-id="div-36f781fb">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              Permissions
              <button type="button" onClick={() => refetchPermissions()} disabled={permissionsFetching} className="p-0.5 text-gray-400 hover:text-blue-600 rounded transition-colors">
                <RefreshCw className={`w-3.5 h-3.5 ${permissionsFetching ? 'animate-spin' : ''}`} />
              </button>
            </label>
            {permissionsLoading ?
            <div className="flex items-center gap-1 text-sm text-gray-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div> :
            permissionEntries.length === 0 ?
            <EmptyCategory category="permissions" label="Permissions" onRefresh={refetchPermissions} isRefreshing={permissionsFetching} /> :

            <Select
              isMulti
              options={permissionOptions}
              value={selectedPermissions}
              onChange={(opts) =>
              setFormData({
                ...formData,
                permitted_to: (opts || []).map((o) => o.value)
              })
              }
              placeholder="Select permissions..." />

            }
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3" data-test-id="div-5c6264d2">
            <button
              type="submit"
              disabled={updatePersona.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors">

              {updatePersona.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
            <a
              href={BASE}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors">

              Cancel
            </a>
          </div>
        </form>
        }

        {pageTab === 0 &&
        <div className="space-y-6">
          {/* Sub-tabs + Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
              {(['Data', 'Template', 'Generated Prompt', 'Diff'] as const).map((label, idx) =>
              <button
                key={label}
                type="button"
                onClick={() => setPromptSubTab(idx)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                promptSubTab === idx ?
                'bg-white text-gray-900 shadow-sm' :
                'text-gray-500 hover:text-gray-700'}`
                }>

                  {label}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updatePersona.mutate({ id: personaId, data: formData })}
                disabled={updatePersona.isPending || !formData.persona_prompt_template}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded-md transition-colors">

                {updatePersona.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
              <button
                type="button"
                onClick={handleResetTemplate}
                disabled={!formData.persona_prompt_template || formData.persona_prompt_template === EDGE_TEMPLATE}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 rounded-md transition-colors">

                Reset
              </button>
            </div>
          </div>

          {/* Data sub-tab */}
          {promptSubTab === 0 &&
          <div>
              <p className="text-xs text-gray-500 mb-2">
                Template data context (properties + resolved references).
              </p>
              {formData.persona_prompt_data ?
            <pre className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-96 font-mono">
                  {JSON.stringify(formData.persona_prompt_data, null, 2)}
                </pre> :

            <p className="text-sm text-gray-400 italic py-4">
                  No data saved yet. Use the &quot;Suggest Persona Prompt&quot; tab to generate one.
                </p>
            }
            </div>
          }

          {/* Template sub-tab — editable */}
          {promptSubTab === 1 &&
          <div>
              <p className="text-xs text-gray-500 mb-2">
                Edge.js template source.
              </p>
              <textarea
              value={formData.persona_prompt_template || EDGE_TEMPLATE}
              onChange={(e) => setFormData({ ...formData, persona_prompt_template: e.target.value })}
              spellCheck={false}
              className="w-full font-mono px-3 py-2 border border-gray-200 rounded-md bg-amber-50 text-sm text-gray-800 overflow-y-auto resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minHeight: '12rem', maxHeight: '24rem' }} />

            </div>
          }

          {/* Generated Prompt sub-tab */}
          {promptSubTab === 2 &&
          <div>
              <p className="text-xs text-gray-500 mb-2">
                Rendered prompt produced by combining template + data.
              </p>

              {/* Export toolbar */}
              {resolvedPrompt && !isRenderingPrompt &&
            <div className="flex items-center gap-3 mb-3">
                  {/* Format selector pills */}
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                    {(['markdown', 'json', 'yaml', 'xml', 'toml'] as const).map((fmt) =>
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setExportFormat(fmt)}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  exportFormat === fmt ?
                  'bg-white text-gray-900 shadow-sm' :
                  'text-gray-500 hover:text-gray-700'}`
                  }>

                        {fmt.toUpperCase()}
                      </button>
                )}
                  </div>

                  {/* Copy button */}
                  <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(formatPrompt(resolvedPrompt, formData.name || '', exportFormat));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors">

                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>

                  {/* Download button */}
                  <button
                type="button"
                onClick={() => {
                  const content = formatPrompt(resolvedPrompt, formData.name || '', exportFormat);
                  const blob = new Blob([content], { type: mimeType(exportFormat) });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${(formData.name || 'persona').replace(/\s+/g, '_').toLowerCase()}${fileExtension(exportFormat)}`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors">

                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
            }

              {isRenderingPrompt ?
            <div className="flex items-center gap-2 py-6 justify-center text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rendering...
                </div> :
            resolvedPrompt ?
            <pre className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-96">
                  {exportFormat === 'markdown' ? resolvedPrompt : formatPrompt(resolvedPrompt, formData.name || '', exportFormat)}
                </pre> :

            <p className="text-sm text-gray-400 italic py-4">
                  No prompt generated yet. Click &quot;Generate&quot; below to generate one.
                </p>
            }
              <div className="mt-3">
                <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors">

                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate
                </button>
              </div>
            </div>
          }

          {/* Diff sub-tab — side-by-side template vs resolved */}
          {promptSubTab === 3 &&
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-medium text-amber-700 mb-1">Template</div>
                  <pre className="bg-amber-50 border-2 border-amber-300 rounded-md p-3 text-sm font-mono text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-72">
                    {formData.persona_prompt_template || EDGE_TEMPLATE}
                  </pre>
                </div>
                <div>
                  <div className="text-xs font-medium text-green-700 mb-1">Generated Prompt</div>
                  {isRenderingPrompt ?
                <div className="flex items-center gap-2 py-6 justify-center text-sm text-gray-500 bg-green-50 border-2 border-green-300 rounded-md">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rendering...
                    </div> :

                <pre className="bg-green-50 border-2 border-green-300 rounded-md p-3 text-sm text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-72">
                      {resolvedPrompt || '(no resolved output yet)'}
                    </pre>
                }
                </div>
              </div>
            </div>
          }
        </div>
        }

        {pageTab === 2 &&
        <div>
          {Object.keys(suggestionModal.properties).length === 0 ?
          <p className="text-sm text-gray-400 italic py-4">
              No data yet. Use &quot;Suggest Persona Prompt&quot; or &quot;Generate&quot; first.
            </p> :

          <>
              {isResolving &&
            <div className="flex items-center gap-2 py-2 text-sm text-gray-500 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resolving references...
                </div>
            }
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-gray-200 rounded-md">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-2 py-2 border-b border-gray-200 font-medium text-gray-700">Property</th>
                      <th className="w-8 px-1 py-2 border-b border-gray-200 text-center">
                        <Info className="w-3.5 h-3.5 text-gray-400 inline-block" />
                      </th>
                      <th className="text-left px-2 py-2 border-b border-gray-200 font-medium text-gray-700">Value</th>
                      <th className="text-left px-2 py-2 border-b border-gray-200 font-medium text-gray-700">Context</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(suggestionModal.properties).map(([key, value]) => {
                    const items: string[] = Array.isArray(value) ?
                    value as string[] :
                    value ? [String(value)] : [];

                    if (items.length === 0) {
                      return (
                        <tr key={key} className="border-b border-gray-100">
                            <td className="px-2 py-2 font-mono text-gray-600 align-top">{key}</td>
                            <td className="px-2 py-2 text-gray-400 italic" colSpan={3}>empty</td>
                          </tr>);

                    }

                    return items.map((item, idx) => {
                      const refMatch = item.match(/^\[\[([^\]]+)\]\]$/);
                      const entry = refMatch ? resolvedEntries[refMatch[1]] : null;
                      const hasRef = !!refMatch;
                      return (
                        <tr key={`${key}-${idx}`} className="border-b border-gray-100">
                            {idx === 0 ?
                          <td className="px-2 py-2 font-mono text-gray-600 align-top" rowSpan={items.length}>{key}</td> :
                          null}
                            <td className="px-1 py-2 text-center">
                              {hasRef && entry ?
                            <span className="relative group">
                                  <Info className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500 cursor-help inline-block" />
                                  <span className="absolute left-0 top-full mt-1 z-50 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-md px-3 py-2 shadow-lg whitespace-normal">
                                    <span className="block mb-0.5"><span className="text-gray-400">Reference:</span> <span className="font-mono text-blue-300">{item}</span></span>
                                    <span className="block mb-0.5"><span className="text-gray-400">Name:</span> <span className="text-white">{entry.name}</span></span>
                                    <span className="block mb-0.5"><span className="text-gray-400">ID:</span> <span className="font-mono text-white">{entry.id}</span></span>
                                    {entry.description && <span className="block"><span className="text-gray-400">Description:</span> <span className="text-gray-300">{entry.description}</span></span>}
                                  </span>
                                </span> :
                            null}
                            </td>
                            {hasRef && entry ?
                          <>
                                <td className="px-2 py-2 text-gray-800">
                                  <pre className="whitespace-pre-wrap max-h-24 overflow-y-auto">
                                    {fmtValue(entry.value)}
                                  </pre>
                                </td>
                                <td className="px-2 py-2 text-gray-700">
                                  <pre className="whitespace-pre-wrap max-h-24 overflow-y-auto">
                                    {fmtValue(entry.context)}
                                  </pre>
                                </td>
                              </> :
                          hasRef ?
                          <td className="px-2 py-2 text-gray-400 italic" colSpan={2}>pending...</td> :

                          <>
                                <td className="px-2 py-2 text-gray-800 whitespace-pre-wrap">{item}</td>
                                <td className="px-2 py-2 text-gray-400">&mdash;</td>
                              </>
                          }
                          </tr>);

                    });
                  })}
                  </tbody>
                </table>
              </div>
            </>
          }
        </div>
        }

        {pageTab === 3 &&
        <div>
          {fetchStatuses.length === 0 ?
          <p className="text-sm text-gray-500 italic py-4">
              No [[id]] references found &mdash; no fetches needed.
            </p> :

          <div className="space-y-2">
              {fetchStatuses.map((fs) => {
              const isExpanded = expandedLogs.has(fs.id);
              const entry = resolvedEntries[fs.id];
              const category = entry?.category ?? null;
              return (
                <div
                  key={fs.id}
                  className="border border-gray-200 rounded-lg bg-white text-sm">

                    <button
                    type="button"
                    onClick={() => {
                      setExpandedLogs((prev) => {
                        const next = new Set(prev);
                        if (next.has(fs.id)) next.delete(fs.id);else
                        next.add(fs.id);
                        return next;
                      });
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left">

                      <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-0' : '-rotate-90'}`
                      } />

                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                    fs.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`
                    } />
                      <span className="font-mono font-semibold text-gray-900">
                        {fs.id}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    fs.status === 'success' ?
                    'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'}`
                    }>
                        {fs.status === 'success' ? 'OK' : 'ERR'}
                      </span>
                      {category &&
                    <span className="ml-auto text-sm text-gray-400">{category}</span>
                    }
                    </button>
                    {isExpanded &&
                  <div className="px-4 pb-4 space-y-4">
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Request</div>
                          <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3 font-mono text-sm text-gray-700">
                            {fs.request.method} {fs.request.url}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Response</div>
                          <pre className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3 font-mono text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(fs.response, null, 2)}
                          </pre>
                        </div>
                      </div>
                  }
                  </div>);

            })}
            </div>
          }
        </div>
        }
      </main>

      {/* Modal for name/description suggestions (Form tab) */}
      {suggestionModal.isOpen && suggestionModal.type !== 'persona_prompt' &&
      <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSuggestionModal((prev) => ({ ...prev, isOpen: false }))} />
          <div
          className="relative bg-white rounded-lg shadow-xl flex flex-col p-6"
          style={{ width: '80vw', height: '80vh' }}>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Suggest {suggestLabel(suggestionModal.type)}
            </h3>
            {suggestionModal.isLoading ?
          <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Generating {suggestLabel(suggestionModal.type).toLowerCase()}...</span>
              </div> :

          <div className="flex-1 overflow-y-auto min-h-0">
                <SuggestionContent
              suggestion={suggestionModal.suggestion}
              properties={suggestionModal.properties}
              onApply={(text) => {
                handleApplySuggestion(text);
              }} />

              </div>
          }
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
              <button
              type="button"
              onClick={() => setSuggestionModal((prev) => ({ ...prev, isOpen: false }))}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors">

                Cancel
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

}