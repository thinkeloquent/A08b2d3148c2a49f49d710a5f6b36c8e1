/**
 * Persona Form Page
 * Handles both create (/personas/new) and edit (/personas/:id/edit) modes
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Save, Sparkles, Undo2 } from 'lucide-react';
import { usePersona, useCreatePersona, useUpdatePersona } from '../../hooks/usePersonas';
import { useLLMDefaults } from '../../hooks/useLLMDefaults';
import { personasApi } from '../../services/api/personas';
import type { PersonaRole, PersonaTone, CreatePersonaRequest } from '../../types/persona';
import type { LLMDefault } from '../../types/llm-default';
import { FormField, Input, Select, TextArea, ArrayInput, ArrayTextArea } from '../../components/forms';
import { SuggestionModal } from '../../components/SuggestionModal';

const personaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  role: z.string().optional(),
  tone: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be valid semver (e.g. 1.0.0)').optional().or(z.literal('')),
  llm_provider: z.string().min(1, 'LLM provider is required'),
  llm_temperature: z.coerce.number().min(0).max(2).optional().or(z.literal('')),
  goals: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  permitted_to: z.array(z.string()).optional(),
  prompt_system_template: z.array(z.string()).optional(),
  prompt_user_template: z.array(z.string()).optional(),
  prompt_context_template: z.array(z.string()).optional(),
  prompt_instruction: z.array(z.string()).optional(),
  agent_delegate: z.array(z.string()).optional(),
  agent_call: z.array(z.string()).optional(),
  context_files: z.array(z.string()).optional(),
  persona_prompt_data: z.record(z.unknown()).optional(),
  persona_prompt_template: z.string().optional()
});

type PersonaFormData = z.infer<typeof personaSchema>;

/** Extract usable value from an LLMDefault entry */
function entryValue(entry: LLMDefault): string {
  return typeof entry.value === 'string' ? entry.value : entry.name;
}

/** Convert LLMDefault entries to Select options */
function toSelectOptions(entries: LLMDefault[]): {value: string;label: string;}[] {
  return entries.map((e) => ({ value: entryValue(e), label: e.name }));
}

export function PersonaFormPage() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: persona, isLoading: isLoadingPersona } = usePersona(id!);
  const createMutation = useCreatePersona();
  const updateMutation = useUpdatePersona();

  // Dynamic options from llm-defaults
  const { data: roleDefaults = [] } = useLLMDefaults('roles');
  const { data: toneDefaults = [] } = useLLMDefaults('tones');
  const { data: providerDefaults = [] } = useLLMDefaults('providers');
  const { data: permissionDefaults = [] } = useLLMDefaults('permissions');

  const roleOptions = toSelectOptions(roleDefaults);
  const toneOptions = toSelectOptions(toneDefaults);
  const providerOptions = toSelectOptions(providerDefaults);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PersonaFormData>({
    resolver: zodResolver(personaSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      role: '',
      tone: '',
      version: '0.0.1',
      llm_provider: '',
      llm_temperature: '' as unknown as number,
      goals: [],
      tools: [],
      permitted_to: [],
      prompt_system_template: [],
      prompt_user_template: [],
      prompt_context_template: [],
      prompt_instruction: [],
      agent_delegate: [],
      agent_call: [],
      context_files: [],
      persona_prompt_data: undefined,
      persona_prompt_template: ''
    }
  });

  useEffect(() => {
    if (isEdit && persona) {
      reset({
        name: persona.name,
        description: persona.description,
        role: persona.role ?? '',
        tone: persona.tone ?? '',
        version: persona.version ?? '',
        llm_provider: persona.llm_provider,
        llm_temperature: persona.llm_temperature ?? '' as unknown as number,
        goals: persona.goals ?? [],
        tools: persona.tools ?? [],
        permitted_to: persona.permitted_to ?? [],
        prompt_system_template: persona.prompt_system_template ?? [],
        prompt_user_template: persona.prompt_user_template ?? [],
        prompt_context_template: persona.prompt_context_template ?? [],
        prompt_instruction: persona.prompt_instruction ?? [],
        agent_delegate: persona.agent_delegate ?? [],
        agent_call: persona.agent_call ?? [],
        context_files: persona.context_files ?? [],
        persona_prompt_data: persona.persona_prompt_data ?? undefined,
        persona_prompt_template: persona.persona_prompt_template ?? ''
      });
    }
  }, [isEdit, persona, reset]);

  const onSubmit = async (data: PersonaFormData) => {
    // Clean up empty optional fields
    const payload: CreatePersonaRequest = {
      ...data,
      role: (data.role || undefined) as PersonaRole | undefined,
      tone: (data.tone || undefined) as PersonaTone | undefined,
      version: data.version || undefined,
      llm_temperature: data.llm_temperature === '' ? undefined : Number(data.llm_temperature),
      persona_prompt_data: data.persona_prompt_data || undefined,
      persona_prompt_template: data.persona_prompt_template || undefined
    };

    if (isEdit) {
      await updateMutation.mutateAsync({ id, data: payload });
      navigate(`/personas/${id}`);
    } else {
      const created = await createMutation.mutateAsync(payload);
      navigate(`/personas/${created.id}/edit`);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const savedVersion = persona?.version ?? '';
  const currentVersion = watch('version');
  const versionChanged = isEdit && currentVersion !== savedVersion;

  // AI Suggestion modal state
  const [suggestionModal, setSuggestionModal] = useState<{
    isOpen: boolean;
    type: 'name' | 'description' | 'persona_prompt';
    isLoading: boolean;
    suggestion: string;
  }>({ isOpen: false, type: 'name', isLoading: false, suggestion: '' });

  const handleSuggest = async (type: 'name' | 'description' | 'persona_prompt') => {
    const values = watch();
    // Map a stored value back to its LLM-default entry and wrap the ID in [[id]]
    const toRef = (entries: LLMDefault[], value: string): string => {
      const entry = entries.find((e) => entryValue(e) === value);
      return entry ? `[[${entry.id}]]` : value;
    };

    const properties: Record<string, unknown> = {
      name: values.name,
      description: values.description,
      role: values.role ? toRef(roleDefaults, values.role) : values.role,
      tone: values.tone ? toRef(toneDefaults, values.tone) : values.tone,
      llm_provider: values.llm_provider ? toRef(providerDefaults, values.llm_provider) : values.llm_provider,
      goals: values.goals,
      tools: values.tools,
      permitted_to: (values.permitted_to || []).map((p: string) => toRef(permissionDefaults, p))
    };

    setSuggestionModal({ isOpen: true, type, isLoading: true, suggestion: '' });

    try {
      const result = await personasApi.suggest(type, properties);
      setSuggestionModal((prev) => ({ ...prev, isLoading: false, suggestion: result.suggestion }));
    } catch {
      setSuggestionModal((prev) => ({ ...prev, isLoading: false, suggestion: 'Failed to generate suggestion. Please try again.' }));
    }
  };

  const handleApplySuggestion = (text: string) => {
    if (suggestionModal.type === 'persona_prompt') {
      setValue('persona_prompt_template', text, { shouldValidate: true });
    } else {
      setValue(suggestionModal.type, text, { shouldValidate: true });
    }
    setSuggestionModal((prev) => ({ ...prev, isOpen: false }));
  };

  if (isEdit && isLoadingPersona) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to={isEdit ? `/personas/${id}` : '/personas'}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">

          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Persona' : 'Create Persona'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6" data-test-id="div-85493c81">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Info</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <FormField
              label={
              <span className="flex items-center gap-2">
                  Name
                  <button
                  type="button"
                  onClick={() => handleSuggest('name')}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors">

                    <Sparkles className="w-3 h-3" />
                    Suggest
                  </button>
                </span>
              }
              htmlFor="name"
              required
              error={errors.name?.message}>

              <Input id="name" {...register('name')} hasError={!!errors.name} />
            </FormField>
            <FormField label="Version" htmlFor="version" error={errors.version?.message}>
              <div className="flex gap-1">
                <Input id="version" placeholder="0.0.1" readOnly {...register('version')} hasError={!!errors.version} className="!w-24 shrink-0 bg-gray-50 cursor-default" />
                {isEdit &&
                <div className="flex gap-1 shrink-0">
                    {(['major', 'minor', 'patch'] as const).map((part) =>
                  <button
                    key={part}
                    type="button"
                    onClick={() => {
                      const current = watch('version') || '0.0.0';
                      const match = current.match(/^(\d+)\.(\d+)\.(\d+)$/);
                      let [maj, min, pat] = match ? [+match[1], +match[2], +match[3]] : [0, 0, 0];
                      if (part === 'major') {maj++;min = 0;pat = 0;} else
                      if (part === 'minor') {min++;pat = 0;} else
                      {pat++;}
                      setValue('version', `${maj}.${min}.${pat}`, { shouldValidate: true });
                    }}
                    className="px-2 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors whitespace-nowrap">

                        {part}
                      </button>
                  )}
                    {versionChanged &&
                  <button
                    type="button"
                    title={`Revert to ${savedVersion || '(empty)'}`}
                    onClick={() => setValue('version', savedVersion, { shouldValidate: true })}
                    className="px-2 py-2 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors">

                        <Undo2 className="w-3.5 h-3.5" />
                      </button>
                  }
                  </div>
                }
              </div>
            </FormField>
            <div className="lg:col-span-2">
              <FormField
                label={
                <span className="flex items-center gap-2">
                    Description
                    <button
                    type="button"
                    onClick={() => handleSuggest('description')}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors">

                      <Sparkles className="w-3 h-3" />
                      Suggest
                    </button>
                  </span>
                }
                htmlFor="description"
                required
                error={errors.description?.message}>

                <TextArea id="description" rows={3} {...register('description')} hasError={!!errors.description} />
              </FormField>
            </div>
            <FormField label="Role" htmlFor="role" error={errors.role?.message}>
              {roleOptions.length > 0 ?
              <Select
                id="role"
                options={roleOptions}
                placeholder="Select role..."
                {...register('role')}
                hasError={!!errors.role} /> :


              <p className="text-xs text-gray-500 py-2">
                  No roles defined.{' '}
                  <Link to="/llm-defaults/category/roles" className="text-blue-600 hover:underline">Create roles</Link>
                </p>
              }
            </FormField>
            <FormField label="Tone" htmlFor="tone" error={errors.tone?.message}>
              {toneOptions.length > 0 ?
              <Select
                id="tone"
                options={toneOptions}
                placeholder="Select tone..."
                {...register('tone')}
                hasError={!!errors.tone} /> :


              <p className="text-xs text-gray-500 py-2">
                  No tones defined.{' '}
                  <Link to="/llm-defaults/category/tones" className="text-blue-600 hover:underline">Create tones</Link>
                </p>
              }
            </FormField>
          </div>
        </div>

        {/* LLM Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6" data-test-id="div-d6caa597">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">LLM Configuration</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <FormField label="Provider" htmlFor="llm_provider" required error={errors.llm_provider?.message}>
              {providerOptions.length > 0 ?
              <Select
                id="llm_provider"
                options={providerOptions}
                placeholder="Select provider..."
                {...register('llm_provider')}
                hasError={!!errors.llm_provider} /> :


              <div>
                  <Input id="llm_provider" {...register('llm_provider')} hasError={!!errors.llm_provider} />
                  <p className="text-xs text-gray-500 mt-1">
                    <Link to="/llm-defaults/category/providers" className="text-blue-600 hover:underline">Create providers</Link> to use a dropdown instead.
                  </p>
                </div>
              }
            </FormField>
            <div className="lg:col-span-2">
              <FormField label="Temperature" htmlFor="llm_temperature" error={errors.llm_temperature?.message}>
                <div className="flex gap-2 items-start">
                  <Input
                    id="llm_temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    {...register('llm_temperature')}
                    hasError={!!errors.llm_temperature}
                    className="!w-20 shrink-0" />

                  <div className="flex flex-wrap gap-1.5">
                    {([
                    { label: 'Deterministic', value: 0.0, desc: 'Same input = same output' },
                    { label: 'Precise', value: 0.2, desc: 'Data extraction, coding, factual Q&A' },
                    { label: 'Balanced', value: 0.5, desc: 'Standard chatbots, natural conversation' },
                    { label: 'Creative', value: 1.0, desc: 'Brainstorming, roleplay, creative writing' },
                    { label: 'Stochastic', value: 1.5, desc: 'High randomness and variance' }] as
                    const).map((preset) =>
                    <button
                      key={preset.label}
                      type="button"
                      title={`${preset.value} — ${preset.desc}`}
                      onClick={() => setValue('llm_temperature', preset.value, { shouldValidate: true })}
                      className="group relative px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors">

                        <span>{preset.label}</span>
                        <span className="ml-1 text-gray-400 group-hover:text-blue-500">{preset.value}</span>
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  0.0 deterministic · 0.1–0.3 precise · 0.4–0.7 balanced · 0.8–1.2 creative · 1.5+ stochastic
                </p>
              </FormField>
            </div>
          </div>
        </div>

        {isEdit &&
        <>
            {/* Goals & Tools */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Goals & Tools</h2>
              <div className="space-y-4">
                <FormField label="Goals">
                  <Controller
                  name="goals"
                  control={control}
                  render={({ field }) =>
                  <ArrayInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Add a goal..."
                    maxItems={10} />

                  } />

                </FormField>
                <FormField label="Tools">
                  <Controller
                  name="tools"
                  control={control}
                  render={({ field }) =>
                  <ArrayInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Add a tool..." />

                  } />

                </FormField>
                <FormField label="Permissions">
                  <Controller
                  name="permitted_to"
                  control={control}
                  render={({ field }) =>
                  <>
                        {permissionDefaults.length > 0 &&
                    <div className="flex flex-wrap gap-1.5 mb-2">
                            {permissionDefaults.map((entry) => {
                        const val = entryValue(entry);
                        const current = field.value ?? [];
                        const isSelected = current.includes(val);
                        return (
                          <button
                            key={entry.id}
                            type="button"
                            title={entry.description}
                            onClick={() => {
                              field.onChange(
                                isSelected ?
                                current.filter((v: string) => v !== val) :
                                [...current, val]
                              );
                            }}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                            isSelected ?
                            'bg-blue-100 text-blue-800 ring-1 ring-blue-300' :
                            'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                            }>

                                  {entry.name}
                                </button>);

                      })}
                          </div>
                    }
                        <ArrayInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Add permission..." />

                      </>
                  } />

                </FormField>
              </div>
            </div>

            {/* Prompt Templates */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Prompt Templates</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Template</label>
                  <Controller
                  name="prompt_system_template"
                  control={control}
                  render={({ field }) =>
                  <ArrayTextArea
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Enter system template..."
                    rows={3} />

                  } />

                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Template</label>
                  <Controller
                  name="prompt_user_template"
                  control={control}
                  render={({ field }) =>
                  <ArrayTextArea
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Enter user template..."
                    rows={3} />

                  } />

                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Context Template</label>
                  <Controller
                  name="prompt_context_template"
                  control={control}
                  render={({ field }) =>
                  <ArrayTextArea
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Enter context template..."
                    rows={3} />

                  } />

                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <Controller
                  name="prompt_instruction"
                  control={control}
                  render={({ field }) =>
                  <ArrayTextArea
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Enter instruction..."
                    rows={3} />

                  } />

                </div>
              </div>
            </div>

            {/* Agent Config */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Configuration</h2>
              <div className="space-y-4">
                <FormField label="Delegate">
                  <Controller
                  name="agent_delegate"
                  control={control}
                  render={({ field }) =>
                  <ArrayInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Add delegate..." />

                  } />

                </FormField>
                <FormField label="Call">
                  <Controller
                  name="agent_call"
                  control={control}
                  render={({ field }) =>
                  <ArrayInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Add call..." />

                  } />

                </FormField>
              </div>
            </div>

            {/* Context Files */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Context Files</h2>
              <Controller
              name="context_files"
              control={control}
              render={({ field }) =>
              <ArrayInput
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Add file path..." />

              } />

            </div>

            {/* Persona Prompt */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Persona Prompt</h2>
                <button
                type="button"
                onClick={() => handleSuggest('persona_prompt')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">

                  <Sparkles className="w-4 h-4" />
                  Generate Persona Prompt
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                AI-generated system prompt that combines all persona properties for downstream use.
              </p>
              <Controller
              name="persona_prompt_template"
              control={control}
              render={({ field }) =>
              <textarea
                {...field}
                value={field.value ?? ''}
                readOnly
                rows={6}
                className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 cursor-default"
                placeholder="Click &quot;Generate Persona Prompt&quot; to create a combined prompt from all properties..." />

              } />

            </div>
          </>
        }

        {/* Actions */}
        <div className="flex items-center gap-3" data-test-id="div-50db9b0b">
          <button
            type="submit"
            disabled={isSubmitting || isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors">

            {isSaving ?
            <Loader2 className="w-4 h-4 animate-spin" /> :

            <Save className="w-4 h-4" />
            }
            {isEdit ? 'Save Changes' : 'Create Persona'}
          </button>
          <Link
            to={isEdit ? `/personas/${id}` : '/personas'}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors">

            Cancel
          </Link>
        </div>
      </form>

      <SuggestionModal
        isOpen={suggestionModal.isOpen}
        onClose={() => setSuggestionModal((prev) => ({ ...prev, isOpen: false }))}
        onApply={handleApplySuggestion}
        suggestion={suggestionModal.suggestion}
        isLoading={suggestionModal.isLoading}
        title={`Suggest ${suggestionModal.type === 'persona_prompt' ? 'Persona Prompt' : suggestionModal.type.charAt(0).toUpperCase() + suggestionModal.type.slice(1)}`}
        fieldLabel={suggestionModal.type === 'persona_prompt' ? 'Persona Prompt' : suggestionModal.type.charAt(0).toUpperCase() + suggestionModal.type.slice(1)} />

    </div>);

}