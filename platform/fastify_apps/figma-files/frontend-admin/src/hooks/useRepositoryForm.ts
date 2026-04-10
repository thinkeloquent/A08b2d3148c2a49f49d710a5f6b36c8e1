import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useCallback } from 'react';
import {
  figmaFileSchema,
  figmaFileDefaults,
  type FigmaFileFormData,
} from '@/schemas/repository';
import { hasChanges, getFieldChanges, type FieldChange } from '@/lib/diff';
import type { ApiFigmaFile } from '@/types/api';

interface UseFigmaFileFormOptions {
  initialData?: ApiFigmaFile;
  onSubmit: (data: FigmaFileFormData) => void | Promise<void>;
}

interface UseFigmaFileFormReturn {
  form: UseFormReturn<FigmaFileFormData>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isEditing: boolean;
  isDirty: boolean;
  changes: FieldChange[];
  hasUnsavedChanges: boolean;
  originalValues: FigmaFileFormData;
  reset: () => void;
}

const TRACKED_FIELDS: (keyof FigmaFileFormData)[] = [
  'name',
  'type',
  'description',
  'figma_url',
  'figma_file_key',
  'thumbnail_url',
  'page_count',
  'component_count',
  'style_count',
  'last_modified_by',
  'editor_type',
  'status',
  'source',
  'trending',
  'verified',
  'tag_names',
];

function apiToFormData(figmaFile: ApiFigmaFile): FigmaFileFormData {
  const typeMap: Record<number, FigmaFileFormData['type']> = {
    1: 'design_system',
    2: 'component_library',
    3: 'prototype',
    4: 'illustration',
    5: 'icon_set',
  };

  const statusMap: Record<number, FigmaFileFormData['status']> = {
    1: 'stable',
    2: 'beta',
    3: 'deprecated',
    4: 'experimental',
  };

  const sourceMap: Record<number, FigmaFileFormData['source']> = {
    1: 'figma',
    2: 'figma_community',
    3: 'manual',
  };

  return {
    name: figmaFile.name,
    type: typeMap[figmaFile.type as number] || 'design_system',
    description: figmaFile.description || '',
    figma_url: figmaFile.figmaUrl || '',
    figma_file_key: figmaFile.figmaFileKey || '',
    thumbnail_url: figmaFile.thumbnailUrl || '',
    page_count: figmaFile.pageCount,
    component_count: figmaFile.componentCount,
    style_count: figmaFile.styleCount,
    last_modified_by: figmaFile.lastModifiedBy || '',
    editor_type: figmaFile.editorType || '',
    status: statusMap[figmaFile.status as number] || 'stable',
    source: figmaFile.source ? sourceMap[figmaFile.source as number] : undefined,
    trending: figmaFile.trending || false,
    verified: figmaFile.verified || false,
    tag_names: figmaFile.tags?.map((t) => t.name) || [],
  };
}

export function useFigmaFileForm({
  initialData,
  onSubmit,
}: UseFigmaFileFormOptions): UseFigmaFileFormReturn {
  const isEditing = !!initialData;

  const originalValues = useMemo(
    () => (initialData ? apiToFormData(initialData) : figmaFileDefaults),
    [initialData]
  );

  const form = useForm<FigmaFileFormData>({
    resolver: zodResolver(figmaFileSchema),
    defaultValues: originalValues,
    mode: 'onChange',
  });

  const currentValues = form.watch();

  const changes = useMemo(
    () => getFieldChanges(originalValues, currentValues, TRACKED_FIELDS),
    [originalValues, currentValues]
  );

  const hasUnsavedChanges = useMemo(
    () => hasChanges(originalValues, currentValues, TRACKED_FIELDS),
    [originalValues, currentValues]
  );

  const handleSubmit = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      await form.handleSubmit(onSubmit)(e);
    },
    [form, onSubmit]
  );

  const reset = useCallback(() => {
    form.reset(originalValues);
  }, [form, originalValues]);

  return {
    form,
    handleSubmit,
    isEditing,
    isDirty: form.formState.isDirty,
    changes,
    hasUnsavedChanges,
    originalValues,
    reset,
  };
}

// Legacy alias
export const useRepositoryForm = useFigmaFileForm;
