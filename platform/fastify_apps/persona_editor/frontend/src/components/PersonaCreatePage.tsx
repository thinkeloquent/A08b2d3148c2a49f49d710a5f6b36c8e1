/**
 * Persona Create Page
 * Full-page form for creating a new persona.
 * All select options are loaded from LLM defaults categories.
 */

import { useState } from 'react';
import Select from 'react-select';
import { ArrowLeft, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import type { CreatePersonaRequest } from '../types/persona';
import type { LLMDefault, LLMDefaultCategory } from '../types/llm-default';
import { useCreatePersona } from '../hooks/usePersonas';
import { useLLMDefaultsByCategory } from '../hooks/useLLMDefaults';

const BASE = '/apps/persona-editor';
const ADMIN_BASE = '/admin/apps/persona-editor/llm-defaults/category';

type Option = {value: string;label: string;};

function entryValue(entry: LLMDefault): string {
  return typeof entry.value === 'string' ? entry.value : entry.name;
}

function toOptions(entries: LLMDefault[]): Option[] {
  return entries.map((e) => ({ value: entryValue(e), label: e.name }));
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

export function PersonaCreatePage() {
  const { data: providerEntries = [], isLoading: providersLoading, isFetching: providersFetching, refetch: refetchProviders } = useLLMDefaultsByCategory('providers');
  const { data: roleEntries = [], isLoading: rolesLoading, isFetching: rolesFetching, refetch: refetchRoles } = useLLMDefaultsByCategory('roles');
  const { data: toneEntries = [], isLoading: tonesLoading, isFetching: tonesFetching, refetch: refetchTones } = useLLMDefaultsByCategory('tones');
  const { data: goalEntries = [], isLoading: goalsLoading, isFetching: goalsFetching, refetch: refetchGoals } = useLLMDefaultsByCategory('goals');
  const { data: toolEntries = [], isLoading: toolsLoading, isFetching: toolsFetching, refetch: refetchTools } = useLLMDefaultsByCategory('tools');
  const { data: permissionEntries = [], isLoading: permissionsLoading, isFetching: permissionsFetching, refetch: refetchPermissions } = useLLMDefaultsByCategory('permissions');

  const [formData, setFormData] = useState<CreatePersonaRequest>({
    name: '',
    description: '',
    llm_provider: '',
    role: '',
    tone: '',
    version: '1.0.0',
    llm_temperature: 0.7,
    goals: [],
    tools: [],
    permitted_to: []
  });

  const createPersona = useCreatePersona({
    onSuccess: () => {
      window.location.href = BASE;
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPersona.mutate(formData);
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-test-id="div-91155836">
          <div className="flex items-center gap-4 h-16">
            <a
              href={BASE}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">

              <ArrowLeft className="w-5 h-5" />
            </a>
            <h1 className="text-xl font-semibold text-gray-900">
              Create New Persona
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6" data-test-id="form-a4aaff93">
          {/* Name & Description */}
          <div data-test-id="div-04db8c28">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={255}
              value={formData.name}
              onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Persona" />

          </div>

          <div data-test-id="div-863171b0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              minLength={10}
              value={formData.description}
              onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what this persona does..." />

          </div>

          {/* Provider, Role, Tone */}
          <div className="grid gap-6 lg:grid-cols-3" data-test-id="div-b4668e23">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LLM Provider *
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tone
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
          <div className="grid gap-6 lg:grid-cols-2" data-test-id="div-6fd88db2">
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
          <div className="grid gap-6 lg:grid-cols-2" data-test-id="div-5554939a">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goals
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tools
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
          <div data-test-id="div-f8064500">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permissions
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
          <div className="flex items-center gap-3" data-test-id="div-9ccc5c48">
            <button
              type="submit"
              disabled={createPersona.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors">

              {createPersona.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Persona
            </button>
            <a
              href={BASE}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors">

              Cancel
            </a>
          </div>
        </form>
      </main>
    </div>);

}