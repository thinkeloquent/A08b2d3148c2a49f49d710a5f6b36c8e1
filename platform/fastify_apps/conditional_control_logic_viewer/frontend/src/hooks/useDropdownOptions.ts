import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listDropdownOptions } from '@/services/api/dropdown-options';

export interface FieldOption {
  value: string;
  label: string;
}

export function useDropdownOptionsQuery() {
  return useQuery({
    queryKey: ['dropdown-options'],
    queryFn: listDropdownOptions,
    staleTime: 60_000,
  });
}

export const FieldOptionsContext = createContext<FieldOption[]>([]);

export function useFieldOptions(): FieldOption[] {
  return useContext(FieldOptionsContext);
}
