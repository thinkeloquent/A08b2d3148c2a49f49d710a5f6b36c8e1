import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useCallback } from 'react';
import { metadataSchema, metadataDefaults, type MetadataFormData } from '@/schemas/metadata';
import { hasChanges, getFieldChanges, type FieldChange } from '@/lib/diff';
import type { Metadata } from '@/types/api';

interface UseMetadataFormOptions {
  initialData?: Metadata;
  onSubmit: (data: MetadataFormData) => void | Promise<void>;
}

interface UseMetadataFormReturn {
  form: UseFormReturn<MetadataFormData>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isEditing: boolean;
  isDirty: boolean;
  changes: FieldChange[];
  hasUnsavedChanges: boolean;
  originalValues: MetadataFormData;
  reset: () => void;
}

const TRACKED_FIELDS: (keyof MetadataFormData)[] = [
  'name',
  'content_type',
  'source_url',
  'source_hash_id',
  'labels',
];

function metadataToFormData(metadata: Metadata): MetadataFormData {
  return {
    name: metadata.name,
    content_type: metadata.contentType || '',
    source_url: metadata.sourceUrl || '',
    source_hash_id: metadata.sourceHashId || '',
    labels: metadata.labels || [],
  };
}

export function useMetadataForm({
  initialData,
  onSubmit,
}: UseMetadataFormOptions): UseMetadataFormReturn {
  const isEditing = !!initialData;

  const originalValues = useMemo(
    () => (initialData ? metadataToFormData(initialData) : metadataDefaults),
    [initialData]
  );

  const form = useForm<MetadataFormData>({
    resolver: zodResolver(metadataSchema),
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
