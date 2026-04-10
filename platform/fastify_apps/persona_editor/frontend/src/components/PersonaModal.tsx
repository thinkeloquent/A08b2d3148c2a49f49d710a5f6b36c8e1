/**
 * PersonaModal Component
 * Modal form for creating and editing personas
 * Selectors load dynamically from llm-defaults categories
 */

import { useState, useEffect } from 'react';
import { X, Loader2, ExternalLink } from 'lucide-react';
import type {
  Persona,
  CreatePersonaRequest,
  UpdatePersonaRequest } from
'../types/persona';
import type { LLMDefault, LLMDefaultCategory } from '../types/llm-default';
import { useLLMDefaultsByCategory } from '../hooks/useLLMDefaults';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePersonaRequest | UpdatePersonaRequest) => void;
  persona?: Persona | null;
  isLoading?: boolean;
}

const ADMIN_BASE = '/admin/apps/persona-editor/llm-defaults/category';

/**
 * Extract the usable value from an LLMDefault entry.
 * For roles/tones/providers the value is a string.
 */
function entryValue(entry: LLMDefault): string {
  return typeof entry.value === 'string' ? entry.value : entry.name;
}

/**
 * Empty-state message with link to create entries in the admin.
 */
function EmptyCategory({ category, label }: {category: LLMDefaultCategory;label: string;}) {
  return (
    <div className="text-xs text-gray-500 mt-1">
      No {label.toLowerCase()} defined.{' '}
      <a
        href={`${ADMIN_BASE}/${category}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline inline-flex items-center gap-0.5">

        Create {label.toLowerCase()}
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>);

}

export function PersonaModal({
  isOpen,
  onClose,
  onSubmit,
  persona,
  isLoading = false
}: PersonaModalProps) {
  const isEditing = !!persona;

  // Load dynamic options from llm-defaults
  const { data: roleEntries = [], isLoading: rolesLoading } = useLLMDefaultsByCategory('roles', { enabled: isOpen });
  const { data: toneEntries = [], isLoading: tonesLoading } = useLLMDefaultsByCategory('tones', { enabled: isOpen });
  const { data: providerEntries = [], isLoading: providersLoading } = useLLMDefaultsByCategory('providers', { enabled: isOpen });
  const { data: permissionEntries = [], isLoading: permissionsLoading } = useLLMDefaultsByCategory('permissions', { enabled: isOpen });

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

  const [goalsInput, setGoalsInput] = useState('');
  const [toolsInput, setToolsInput] = useState('');

  useEffect(() => {
    if (persona) {
      setFormData({
        name: persona.name,
        description: persona.description,
        llm_provider: persona.llm_provider,
        role: persona.role,
        tone: persona.tone,
        version: persona.version || '1.0.0',
        llm_temperature: persona.llm_temperature ?? 0.7,
        goals: persona.goals || [],
        tools: persona.tools || [],
        permitted_to: persona.permitted_to || []
      });
      setGoalsInput(persona.goals?.join(', ') || '');
      setToolsInput(persona.tools?.join(', ') || '');
    } else {
      setFormData({
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
      setGoalsInput('');
      setToolsInput('');
    }
  }, [persona, isOpen]);

  const handlePermissionToggle = (value: string) => {
    const current = formData.permitted_to || [];
    const next = current.includes(value) ?
    current.filter((v) => v !== value) :
    [...current, value];
    setFormData({ ...formData, permitted_to: next });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      goals: goalsInput.split(',').map((s) => s.trim()).filter(Boolean),
      tools: toolsInput.split(',').map((s) => s.trim()).filter(Boolean)
    };

    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose} />


        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Persona' : 'Create New Persona'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors">

              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name */}
            <div data-test-id="div-567fd9c9">
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

            {/* Description */}
            <div data-test-id="div-4577eb16">
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

            {/* Row: Provider, Role, Tone */}
            <div className="grid grid-cols-3 gap-4" data-test-id="div-6712b31c">
              {/* Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LLM Provider *
                </label>
                {providersLoading ?
                <div className="flex items-center gap-1 text-sm text-gray-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                  </div> :
                providerEntries.length === 0 ?
                <EmptyCategory category="providers" label="Providers" /> :

                <select
                  required
                  value={formData.llm_provider}
                  onChange={(e) =>
                  setFormData({ ...formData, llm_provider: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">

                    <option value="">Select...</option>
                    {providerEntries.map((entry) =>
                  <option key={entry.id} value={entryValue(entry)}>
                        {entry.name}
                      </option>
                  )}
                  </select>
                }
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                {rolesLoading ?
                <div className="flex items-center gap-1 text-sm text-gray-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                  </div> :
                roleEntries.length === 0 ?
                <EmptyCategory category="roles" label="Roles" /> :

                <select
                  value={formData.role || ''}
                  onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">

                    <option value="">Select...</option>
                    {roleEntries.map((entry) =>
                  <option key={entry.id} value={entryValue(entry)}>
                        {entry.name}
                      </option>
                  )}
                  </select>
                }
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tone
                </label>
                {tonesLoading ?
                <div className="flex items-center gap-1 text-sm text-gray-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                  </div> :
                toneEntries.length === 0 ?
                <EmptyCategory category="tones" label="Tones" /> :

                <select
                  value={formData.tone || ''}
                  onChange={(e) =>
                  setFormData({ ...formData, tone: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">

                    <option value="">Select...</option>
                    {toneEntries.map((entry) =>
                  <option key={entry.id} value={entryValue(entry)}>
                        {entry.name}
                      </option>
                  )}
                  </select>
                }
              </div>
            </div>

            {/* Row: Version, Temperature */}
            <div className="grid grid-cols-2 gap-4" data-test-id="div-5384c959">
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

            {/* Goals */}
            <div data-test-id="div-4048dc90">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goals (comma-separated)
              </label>
              <input
                type="text"
                value={goalsInput}
                onChange={(e) => setGoalsInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write clean code, Follow best practices" />

            </div>

            {/* Tools */}
            <div data-test-id="div-77d338b2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tools (comma-separated)
              </label>
              <input
                type="text"
                value={toolsInput}
                onChange={(e) => setToolsInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="read_file, write_file, search" />

            </div>

            {/* Permissions */}
            <div data-test-id="div-224946a3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permissions
              </label>
              {permissionsLoading ?
              <div className="flex items-center gap-1 text-sm text-gray-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div> :
              permissionEntries.length === 0 ?
              <EmptyCategory category="permissions" label="Permissions" /> :

              <div className="border border-gray-300 rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {permissionEntries.map((entry) => {
                  const val = entryValue(entry);
                  const checked = (formData.permitted_to || []).includes(val);
                  return (
                    <label key={entry.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handlePermissionToggle(val)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />

                        <span className="text-sm text-gray-700">{entry.name}</span>
                        {entry.description &&
                      <span className="text-xs text-gray-400 truncate">{entry.description}</span>
                      }
                      </label>);

                })}
                </div>
              }
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200" data-test-id="div-e08a6ae0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">

                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors">

                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Create Persona'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>);

}