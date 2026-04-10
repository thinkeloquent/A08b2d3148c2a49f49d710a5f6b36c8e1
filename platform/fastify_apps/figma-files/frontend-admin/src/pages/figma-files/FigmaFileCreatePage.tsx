import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCreateFigmaFile, useTags } from '@/hooks';
import { useFigmaFileForm } from '@/hooks/useRepositoryForm';
import { FormField, Input, Select, TextArea, TagInput, Checkbox } from '@/components/forms';
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


export function FigmaFileCreatePage() {
  const navigate = useNavigate();
  const createFigmaFile = useCreateFigmaFile();
  const { data: tagsResponse } = useTags();

  const availableTags = tagsResponse?.tags?.map((t) => t.name) || [];

  const handleSubmit = async (data: FigmaFileFormData) => {
    try {
      const result = await createFigmaFile.mutateAsync({
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
      });
      navigate(`/figma-files/${result.figmaFile.id}`);
    } catch {

      // Error handling
    }};

  const { form, handleSubmit: onSubmit } = useFigmaFileForm({
    onSubmit: handleSubmit
  });

  const {
    register,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = form;

  const tagNames = watch('tag_names');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/figma-files"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">

          <ArrowLeft className="w-4 h-4" />
          Back to Figma Files
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Create Figma File</h1>
          <p className="text-gray-500 mt-1">Add a new Figma file to the registry</p>
        </div>

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
                  error={!!errors.name}
                  placeholder="e.g., Design System v2, Icon Library" />

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
                placeholder="A brief description of the Figma file..."
                rows={3} />

            </FormField>
          </div>

          {/* URLs */}
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
                  error={!!errors.figma_url}
                  placeholder="https://www.figma.com/file/..." />

              </FormField>

              <FormField
                label="Figma File Key"
                htmlFor="figma_file_key"
                error={errors.figma_file_key?.message}>

                <Input
                  id="figma_file_key"
                  {...register('figma_file_key')}
                  error={!!errors.figma_file_key}
                  placeholder="e.g., abc123XYZ" />

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
                  error={!!errors.thumbnail_url}
                  placeholder="https://..." />

              </FormField>

              <FormField
                label="Last Modified By"
                htmlFor="last_modified_by"
                error={errors.last_modified_by?.message}>

                <Input
                  id="last_modified_by"
                  {...register('last_modified_by')}
                  error={!!errors.last_modified_by}
                  placeholder="e.g., Jane Doe" />

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
                  error={!!errors.editor_type}
                  placeholder="e.g., figma, figjam" />

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
              <Checkbox
                {...register('trending')}
                label="Trending" />

              <Checkbox
                {...register('verified')}
                label="Verified" />

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
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <Link
              to="/figma-files"
              className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors">

              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || createFigmaFile.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

              <Save className="w-4 h-4" />
              {isSubmitting || createFigmaFile.isPending ? 'Creating...' : 'Create Figma File'}
            </button>
          </div>
        </form>
      </div>
    </div>);

}
