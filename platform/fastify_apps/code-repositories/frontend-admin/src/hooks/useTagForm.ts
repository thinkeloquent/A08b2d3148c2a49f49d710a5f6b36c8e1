import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useCallback } from 'react';
import { tagSchema, tagDefaults, type TagFormData } from '@/schemas/tag';
import { hasChanges, getFieldChanges, type FieldChange } from '@/lib/diff';
import type { Tag } from '@/types/api';

interface UseTagFormOptions {
  initialData?: Tag;
  onSubmit: (data: TagFormData) => void | Promise<void>;
}

interface UseTagFormReturn {
  form: UseFormReturn<TagFormData>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isEditing: boolean;
  isDirty: boolean;
  changes: FieldChange[];
  hasUnsavedChanges: boolean;
  originalValues: TagFormData;
  reset: () => void;
}

const TRACKED_FIELDS: (keyof TagFormData)[] = ['name'];

function tagToFormData(tag: Tag): TagFormData {
  return {
    name: tag.name,
  };
}

export function useTagForm({
  initialData,
  onSubmit,
}: UseTagFormOptions): UseTagFormReturn {
  const isEditing = !!initialData;

  const originalValues = useMemo(
    () => (initialData ? tagToFormData(initialData) : tagDefaults),
    [initialData]
  );

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
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
