import { useState, useMemo } from 'react';
import CreatableSelect from 'react-select/creatable';
import type { CategoryOption, ApiCategorySelectProps } from './types';
import { useCategoryOptions } from './useCategoryOptions';

const DEFAULT_STYLES = {
  control: (base: Record<string, unknown>) => ({ ...base, borderRadius: '0.5rem', minHeight: '38px' }),
  valueContainer: (base: Record<string, unknown>) => ({ ...base, padding: '0 8px' }),
  indicatorSeparator: () => ({ display: 'none' as const }),
};

/**
 * API-backed category select with fuzzy search, resource preset merging,
 * custom value creation, and validation modes.
 *
 * - Fetches from `/~/api/categories/export` on mount
 * - Filters by `targetApp` / `categoryType` when provided
 * - Merges static `resourceCategories` with API results
 * - `validationMode='strict'` → only API values allowed
 * - `validationMode='flexible'` (default) → API + custom values allowed
 */
export function ApiCategorySelect({
  value,
  onChange,
  allOption,
  validationMode = 'flexible',
  apiBase,
  targetApp,
  categoryType,
  resourceCategories,
  className = 'min-w-[160px] text-sm',
  styles,
  placeholder = 'Select or type a category…',
  onValidationError,
}: ApiCategorySelectProps) {
  const { options: fetchedOptions, loading, search, isApiValue } = useCategoryOptions({
    apiBase,
    targetApp,
    categoryType,
    resourceCategories,
  });

  const [searchResults, setSearchResults] = useState<CategoryOption[]>([]);
  const [inputValue, setInputValue] = useState('');

  /* Merge fetched + search results + allOption (case-insensitive dedup) */
  const mergedOptions = useMemo(() => {
    const seen = new Set<string>();
    const result: CategoryOption[] = [];

    if (allOption) {
      result.push(allOption);
      seen.add(allOption.value.toLowerCase());
    }

    for (const opt of fetchedOptions) {
      const key = opt.value.toLowerCase();
      if (!seen.has(key)) {
        result.push(opt);
        seen.add(key);
      }
    }

    for (const opt of searchResults) {
      const key = opt.value.toLowerCase();
      if (!seen.has(key)) {
        result.push(opt);
        seen.add(key);
      }
    }

    return result;
  }, [fetchedOptions, searchResults, allOption]);

  const selected = mergedOptions.find((o) => o.value === value)
    ?? (value ? { value, label: value, source: 'custom' as const } : null);

  /* Fuzzy search as user types */
  const handleInputChange = async (newInput: string) => {
    setInputValue(newInput);
    if (newInput.length >= 2) {
      const results = await search(newInput);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  /* Validate + emit on selection */
  const handleChange = (opt: CategoryOption | null) => {
    if (!opt) {
      onChange(allOption?.value ?? '');
      return;
    }

    if (validationMode === 'strict' && opt.source === 'custom' && !isApiValue(opt.value)) {
      onValidationError?.(opt.value);
      return;
    }

    onChange(opt.value);
  };

  /* Control whether "Create" option appears */
  const isValidNewOption = (input: string) => {
    if (!input.trim()) return false;
    if (validationMode === 'strict') return false;
    return !mergedOptions.some((o) => o.value.toLowerCase() === input.toLowerCase());
  };

  const getNewOptionData = (inputVal: string): CategoryOption => ({
    value: inputVal.trim(),
    label: inputVal.trim(),
    source: 'custom',
  });

  return (
    <CreatableSelect<CategoryOption, false>
      options={mergedOptions}
      value={selected}
      onChange={handleChange}
      onInputChange={handleInputChange}
      inputValue={inputValue}
      isLoading={loading}
      isSearchable
      isClearable={!!allOption}
      isValidNewOption={isValidNewOption}
      getNewOptionData={getNewOptionData}
      formatCreateLabel={(input: string) => `Use "${input}"`}
      className={className}
      styles={styles ?? DEFAULT_STYLES}
      placeholder={placeholder}
      getOptionValue={(o: CategoryOption) => o.value}
      getOptionLabel={(o: CategoryOption) => o.label}
    />
  );
}
