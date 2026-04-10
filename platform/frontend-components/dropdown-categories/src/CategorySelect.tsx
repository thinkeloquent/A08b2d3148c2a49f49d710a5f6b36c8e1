import Select from 'react-select';
import type { CategoryOption, CategorySelectProps } from './types';

const DEFAULT_STYLES = {
  control: (base: Record<string, unknown>) => ({ ...base, borderRadius: '0.5rem', minHeight: '38px' }),
  valueContainer: (base: Record<string, unknown>) => ({ ...base, padding: '0 8px' }),
  indicatorSeparator: () => ({ display: 'none' as const }),
};

export function CategorySelect({
  options,
  value,
  onChange,
  allOption,
  isSearchable = false,
  className = 'min-w-[160px] text-sm',
  styles,
  placeholder,
}: CategorySelectProps) {
  const resolvedOptions: CategoryOption[] = allOption
    ? [allOption, ...options]
    : options;

  const selected = resolvedOptions.find((o) => o.value === value) ?? resolvedOptions[0];

  return (
    <Select<CategoryOption, false>
      options={resolvedOptions}
      value={selected}
      onChange={(opt) => onChange(opt?.value ?? (allOption?.value ?? options[0]?.value ?? ''))}
      isSearchable={isSearchable}
      className={className}
      styles={styles ?? DEFAULT_STYLES}
      placeholder={placeholder}
    />
  );
}
