/**
 * React Hook Form + Zod hook for group editing
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { groupSchema, type GroupFormData } from '../../schemas/rule.schema';

interface UseGroupFormOptions {
  defaultValues?: Partial<GroupFormData>;
  onSubmit?: (data: GroupFormData) => void;
}

export function useGroupForm({ defaultValues, onSubmit }: UseGroupFormOptions = {}) {
  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      logic: 'AND',
      description: '',
      enabled: true,
      color: '',
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
