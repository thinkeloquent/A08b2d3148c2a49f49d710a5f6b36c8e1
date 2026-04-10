import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { useState } from 'react';
import { useFigmaFile, useUpdateFigmaFile, useTags } from '@/hooks';
import { useFigmaFileForm } from '@/hooks/useRepositoryForm';
import { FormField, Input, Select, TextArea, TagInput, Checkbox } from '@/components/forms';
import { DiffViewer } from '@/components/diff';
import { isApiError } from '@/types/errors';
import type { FigmaFileFormData } from '@/schemas/repository';

const typeOptions = [
{ value: 'design_system', label: 'Design System' },
{ value: 'component_library', label: 'Component Library' },
{ value: 'prototype', label: 'Prototype' },
{ value: 'illustration', label: 'Illustration' },
{ value: 'icon_set', label: 'Icon Set' }];


const statusOptions = [
{ value: 'stable', label: 'Stable' },
{ value: 'beta', label: 'Beta' },
{ value: 'deprecated', label: 'Deprecated' },
{ value: 'experimental', label: 'Experimental' }];


const sourceOptions = [
{ value: '', label: 'Select source...' },
{ value: 'figma', label: 'Figma' },
{ value: 'figma_community', label: 'Figma Community' },
{ value: 'manual', label: 'Manual' }];


const fieldLabels: Record<string, string> = {
  name: 'Name',
  type: 'Type',
  description: 'Description',
  figma_url: 'Figma URL',
  figma_file_key: 'Figma File Key',
  thumbnail_url: 'Thumbnail URL',
  page_count: 'Page Count',
  component_count: 'Component Count',
  style_count: 'Style Count',
  last_modified_by: 'Last Modified By',
  editor_type: 'Editor Type',
  status: 'Status',
  source: 'Source',
  trending: 'Trending',
  verified: 'Verified',
  tag_names: 'Tags'
};

export function FigmaFileEditPage() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  const {
    data: figmaFileResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useFigmaFile(id!, {
    include_tags: true,
    include_metadata: true,
    enabled: !!id
  });

  const updateFigmaFile = useUpdateFigmaFile();
  const { data: tagsResponse } = useTags();

  const availableTags = tagsResponse?.tags?.map((t) => t.name) || [];

  const handleSubmit = async (data: FigmaFileFormData) => {
    if (!id) return;
    try {
      await updateFigmaFile.mutateAsync({
        id,
        data: {
          name: data.name,
          type: data.type,
          description: data.description || undefined,
          figma_url: data.figma_url || undefined,
          figma_file_key: data.figma_file_key || undefined,
          thumbnail_url: data.thumbnail_url || undefined,
          page_count: data.page_count,
          component_count: data.component_count,
          style_count: data.style_count,
          last_modified_by: data.last_modified_by || undefined,
          editor_type: data.editor_type || undefined,
          status: data.status,
          source: data.source || undefined,
          trending: data.trending,
          verified: data.verified,
          tag_names: data.tag_names
        }
      });
      navigate(`/figma-files/${id}`);
    } catch {

      // Error handling
    }};

  const {
    form,
    handleSubmit: onSubmit,
    hasUnsavedChanges,
    originalValues,
    reset
  } = useFigmaFileForm({
    initialData: figmaFileResponse?.figmaFile,
    onSubmit: handleSubmit
  });

  const {
    register,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = form;

  const tagNames = watch('tag_names');
  const currentValues = watch();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-4">
            {[...Array(8)].map((_, i) =>
            <div key={i} className="h-10 bg-gray-100 rounded" />
            )}
          </div>
        </div>
      </div>);

  }

  if (isError || !figmaFileResponse) {
    const errorMessage = isApiError(error) ?
    error.getUserMessage() :
    'Failed to load figma file';

    return (
      <div className="max-w-4xl mx-auto">
        <Link
          to="/figma-files"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">

          <ArrowLeft className="w-4 h-4" />
          Back to Figma Files
        </Link>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">

              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/figma-files/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">

          <ArrowLeft className="w-4 h-4" />
          Back to Figma File
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Figma File</h1>
              <p className="text-gray-500 mt-1">
                Editing: {figmaFileResponse.figmaFile.name}
              </p>
            </div>
            {hasUnsavedChanges &&
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showPreview ?
              'bg-blue-100 text-blue-700' :
              'text-gray-600 hover:bg-gray-100'}`
              }>

                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide Changes' : 'Preview Changes'}
              </button>
            }
          </div>
        </div>

        {/* Changes Preview */}
        {showPreview && hasUnsavedChanges &&
        <div className="p-6 bg-gray-50 border-b border-gray-200">
            <DiffViewer
            original={originalValues}
            modified={currentValues}
            fields={Object.keys(fieldLabels) as (keyof FigmaFileFormData)[]}
            labels={fieldLabels} />

          </div>
        }

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Name"
                htmlFor="name"
                required
                error={errors.name?.message}>

                <Input
                  id="name"
                  {...register('name')}
                  error={!!errors.name} />

              </FormField>

              <FormField
                label="Type"
                htmlFor="type"
                required
                error={errors.type?.message}>

                <Select
                  id="type"
                  {...register('type')}
                  options={typeOptions}
                  error={!!errors.type} />

              </FormField>
            </div>

            <FormField
              label="Description"
              htmlFor="description"
              error={errors.description?.message}>

              <TextArea
                id="description"
                {...register('description')}
                error={!!errors.description}
                rows={3} />

            </FormField>
          </div>

          {/* Figma Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Figma Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Figma URL"
                htmlFor="figma_url"
                error={errors.figma_url?.message}>

                <Input
                  id="figma_url"
                  type="url"
                  {...register('figma_url')}
                  error={!!errors.figma_url} />

              </FormField>

              <FormField
                label="Figma File Key"
                htmlFor="figma_file_key"
                error={errors.figma_file_key?.message}>

                <Input
                  id="figma_file_key"
                  {...register('figma_file_key')}
                  error={!!errors.figma_file_key} />

              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Thumbnail URL"
                htmlFor="thumbnail_url"
                error={errors.thumbnail_url?.message}>

                <Input
                  id="thumbnail_url"
                  type="url"
                  {...register('thumbnail_url')}
                  error={!!errors.thumbnail_url} />

              </FormField>

              <FormField
                label="Last Modified By"
                htmlFor="last_modified_by"
                error={errors.last_modified_by?.message}>

                <Input
                  id="last_modified_by"
                  {...register('last_modified_by')}
                  error={!!errors.last_modified_by} />

              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Editor Type"
                htmlFor="editor_type"
                error={errors.editor_type?.message}>

                <Input
                  id="editor_type"
                  {...register('editor_type')}
                  error={!!errors.editor_type} />

              </FormField>

              <FormField
                label="Source"
                htmlFor="source"
                error={errors.source?.message}>

                <Select
                  id="source"
                  {...register('source')}
                  options={sourceOptions}
                  error={!!errors.source} />

              </FormField>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">File Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Page Count"
                htmlFor="page_count"
                error={errors.page_count?.message}>

                <Input
                  id="page_count"
                  type="number"
                  min={0}
                  {...register('page_count', { valueAsNumber: true })}
                  error={!!errors.page_count} />

              </FormField>

              <FormField
                label="Component Count"
                htmlFor="component_count"
                error={errors.component_count?.message}>

                <Input
                  id="component_count"
                  type="number"
                  min={0}
                  {...register('component_count', { valueAsNumber: true })}
                  error={!!errors.component_count} />

              </FormField>

              <FormField
                label="Style Count"
                htmlFor="style_count"
                error={errors.style_count?.message}>

                <Input
                  id="style_count"
                  type="number"
                  min={0}
                  {...register('style_count', { valueAsNumber: true })}
                  error={!!errors.style_count} />

              </FormField>
            </div>
          </div>

          {/* Status & Flags */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Status & Flags</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Status"
                htmlFor="status"
                error={errors.status?.message}>

                <Select
                  id="status"
                  {...register('status')}
                  options={statusOptions}
                  error={!!errors.status} />

              </FormField>
            </div>

            <div className="flex gap-6">
              <Checkbox {...register('trending')} label="Trending" />
              <Checkbox {...register('verified')} label="Verified" />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
            <FormField
              label="Tags"
              htmlFor="tag_names"
              hint="Press Enter or comma to add tags">

              <TagInput
                value={tagNames}
                onChange={(tags) => setValue('tag_names', tags)}
                suggestions={availableTags}
                placeholder="Add tags..." />

            </FormField>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={reset}
              disabled={!hasUnsavedChanges}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

              <RotateCcw className="w-4 h-4" />
              Reset Changes
            </button>

            <div className="flex items-center gap-4">
              <Link
                to={`/figma-files/${id}`}
                className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors">

                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || updateFigmaFile.isPending || !hasUnsavedChanges}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

                <Save className="w-4 h-4" />
                {isSubmitting || updateFigmaFile.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>);

}
