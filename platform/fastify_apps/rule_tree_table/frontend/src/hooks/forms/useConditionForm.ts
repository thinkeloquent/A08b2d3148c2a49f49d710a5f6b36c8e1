/**
 * React Hook Form + Zod hook for condition editing
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { conditionSchema, type ConditionFormData } from '../../schemas/rule.schema';

interface UseConditionFormOptions {
  defaultValues?: Partial<ConditionFormData>;
  onSubmit?: (data: ConditionFormData) => void;
}

export function useConditionForm({ defaultValues, onSubmit }: UseConditionFormOptions = {}) {
  const form = useForm<ConditionFormData>({
    resolver: zodResolver(conditionSchema),
    defaultValues: {
      field: '',
      operator: 'equals',
      valueType: 'value',
      value: '',
      dataType: 'string',
      description: '',
      enabled: true,
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit?.(data);
  });

  return {
    ...form,
    handleSubmit,
  };
}
