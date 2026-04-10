/**
 * LLM Default Form Page
 * Handles both create (/llm-defaults/new) and edit (/llm-defaults/:id/edit) modes
 */

import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useLLMDefault, useCreateLLMDefault, useUpdateLLMDefault, usePresets } from '../../hooks/useLLMDefaults';
import { CATEGORY_OPTIONS } from '../../types/llm-default';
import type { LLMDefaultCategory } from '../../types/llm-default';
import { llmDefaultSchema, updateLLMDefaultSchema, type LLMDefaultFormData, type UpdateLLMDefaultFormData } from '../../schemas/llm-default';
import { FormField, Input, Select, TextArea } from '../../components/forms';

export function LLMDefaultFormPage() {
  const { id, category } = useParams<{id: string;category: string;}>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const listUrl = `/llm-defaults/category/${category}`;

  const { data: llmDefault, isLoading: isLoadingDefault } = useLLMDefault(id!);
  const createMutation = useCreateLLMDefault();
  const updateMutation = useUpdateLLMDefault();

  const { data: presets } = usePresets(category as LLMDefaultCategory);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LLMDefaultFormData>({
    resolver: zodResolver(isEdit ? updateLLMDefaultSchema : llmDefaultSchema),
    mode: 'onChange',
    defaultValues: {
      category: category as LLMDefaultFormData['category'] || 'tools',
      name: '',
      description: '',
      value: '',
      context: '',
      is_default: false
    }
  });

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetName = e.target.value;
    if (!presetName || !presets) return;
    const preset = presets.find((p) => p.name === presetName);
    if (!preset) return;
    setValue('name', preset.name, { shouldValidate: true });
    setValue('description', preset.description, { shouldValidate: true });
    setValue('value',
    typeof preset.value === 'string' ?
    preset.value :
    JSON.stringify(preset.value, null, 2),
    { shouldValidate: true }
    );
    if (preset.context) {
      setValue('context', preset.context, { shouldValidate: true });
    }
    setValue('is_default', preset.is_default ?? false);
  };

  useEffect(() => {
    if (isEdit && llmDefault) {
      reset({
        name: llmDefault.name,
        description: llmDefault.description,
        value: typeof llmDefault.value === 'string' ?
        llmDefault.value :
        JSON.stringify(llmDefault.value, null, 2),
        context: llmDefault.context == null ?
        '' :
        typeof llmDefault.context === 'string' ?
        llmDefault.context :
        JSON.stringify(llmDefault.context, null, 2),
        is_default: llmDefault.is_default ?? false
      });
    }
  }, [isEdit, llmDefault, reset]);

  const onSubmit = async (data: LLMDefaultFormData | UpdateLLMDefaultFormData) => {
    // Parse a flexible field: try JSON first, fall back to array of lines or string
    const parseFlexible = (raw: unknown): unknown => {
      if (typeof raw !== 'string') return raw;
      const trimmed = raw.trim();
      if (!trimmed) return null;
      try {
        return JSON.parse(trimmed);
      } catch {
        if (trimmed.includes('\n')) {
          return trimmed.split('\n').filter((line: string) => line.trim() !== '');
        }
        return trimmed;
      }
    };

    const parsedValue = parseFlexible(data.value);
    const parsedContext = parseFlexible(data.context);

    if (isEdit) {
      await updateMutation.mutateAsync({
        id,
        data: {
          name: data.name,
          description: data.description,
          value: parsedValue,
          context: parsedContext,
          is_default: data.is_default
        }
      });
      navigate(listUrl);
    } else {
      const createData = data as LLMDefaultFormData;
      await createMutation.mutateAsync({
        category: createData.category,
        name: createData.name!,
        description: createData.description!,
        value: parsedValue,
        context: parsedContext,
        is_default: createData.is_default
      });
      navigate(listUrl);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingDefault) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>);

  }

  const categoryOptions = CATEGORY_OPTIONS.map((cat) => ({
    value: cat.value,
    label: cat.label
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to={listUrl}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">

          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit LLM Default' : 'Create LLM Default'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6" data-test-id="div-a3fc16bf">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Configuration</h2>
          {!isEdit && presets && presets.length > 0 &&
          <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <label htmlFor="preset-select" className="block text-sm font-medium text-gray-700 mb-1">
                Use preset values
              </label>
              <select
              id="preset-select"
              onChange={handlePresetChange}
              defaultValue=""
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">

                <option value="">Select a preset to populate fields...</option>
                {presets.map((preset) =>
              <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
              )}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Selecting a preset will fill in name, description, context, and value. You can still edit them before saving.
              </p>
            </div>
          }
          <div className="grid gap-4 lg:grid-cols-2">
            <FormField label="Category" htmlFor="category" required={!isEdit} error={errors.category?.message}>
              <Select
                id="category"
                options={categoryOptions}
                placeholder="Select category..."
                {...register('category')}
                hasError={!!errors.category}
                disabled={isEdit || !!category} />

            </FormField>
            <FormField label="Name" htmlFor="name" required error={errors.name?.message}>
              <Input id="name" {...register('name')} hasError={!!errors.name} />
            </FormField>
            <div className="lg:col-span-2">
              <FormField label="Description" htmlFor="description" required error={errors.description?.message}>
                <TextArea id="description" rows={3} {...register('description')} hasError={!!errors.description} />
              </FormField>
            </div>
            <div className="lg:col-span-2">
              <FormField label="Value" htmlFor="value" error={typeof errors.value?.message === 'string' ? errors.value.message : undefined}>
                <TextArea
                  id="value"
                  rows={6}
                  placeholder="Enter JSON, or one item per line..."
                  {...register('value')}
                  hasError={!!errors.value} />

                <p className="mt-1 text-xs text-gray-400">
                  Enter valid JSON, or plain text (one item per line will be stored as an array).
                </p>
              </FormField>
            </div>
            <div className="lg:col-span-2">
              <FormField label="Context" htmlFor="context" error={typeof errors.context?.message === 'string' ? errors.context.message : undefined}>
                <TextArea
                  id="context"
                  rows={4}
                  placeholder="You are a... (system prompt context describing the domain and expectations)"
                  {...register('context')}
                  hasError={!!errors.context} />

                <p className="mt-1 text-xs text-gray-400">
                  Optional. System prompt context that describes the agent's role, domain, and behavioral expectations.
                </p>
              </FormField>
            </div>
            <div className="lg:col-span-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="is_default"
                  {...register('is_default')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />

                <span className="text-sm font-medium text-gray-700">Set as default for this category</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3" data-test-id="div-5bc8ebff">
          <button
            type="submit"
            disabled={isSubmitting || isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors">

            {isSaving ?
            <Loader2 className="w-4 h-4 animate-spin" /> :

            <Save className="w-4 h-4" />
            }
            {isEdit ? 'Save Changes' : 'Create Default'}
          </button>
          <Link
            to={listUrl}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors">

            Cancel
          </Link>
        </div>
      </form>
    </div>);

}