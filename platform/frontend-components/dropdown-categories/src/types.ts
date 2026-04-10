import type { StylesConfig, GroupBase } from 'react-select';

/* ── Base option ─────────────────────────────────────────────── */

export interface CategoryOption {
  value: string;
  label: string;
  /** Marks whether this option came from the API, a resource preset, or was user-created */
  source?: 'api' | 'resource' | 'custom';
}

/* ── Original select props (unchanged for backward compat) ──── */

export interface CategorySelectProps {
  /** Available category options */
  options: CategoryOption[];
  /** Currently selected value */
  value: string;
  /** Called when selection changes */
  onChange: (value: string) => void;
  /** Prepend an "all" option for filter mode (e.g. { value: '', label: 'All categories' }) */
  allOption?: CategoryOption;
  /** Allow typing to search. Default false. */
  isSearchable?: boolean;
  /** Minimum width CSS class. Default 'min-w-[160px]' */
  className?: string;
  /** Custom react-select styles override */
  styles?: StylesConfig<CategoryOption, false, GroupBase<CategoryOption>>;
  /** Placeholder text */
  placeholder?: string;
}

/* ── Categories API shapes ──────────────────────────────────── */

export interface ApiCategory {
  id: string;
  name: string;
  description: string | null;
  category_type_id: string;
  target_app_id: string;
  categoryType?: { id: string; name: string };
  targetApp?: { id: string; name: string };
}

export interface ApiCategoryType {
  id: string;
  name: string;
}

export interface ApiTargetApp {
  id: string;
  name: string;
}

export interface CategoriesExportResponse {
  exported_at: string;
  categories: ApiCategory[];
  category_types: ApiCategoryType[];
  target_apps: ApiTargetApp[];
}

/* ── Hook config ────────────────────────────────────────────── */

export interface UseCategoryOptionsConfig {
  /** Base URL for the categories API. Default: '/~/api/categories' */
  apiBase?: string;
  /** Optional filter: only include categories belonging to this target app name */
  targetApp?: string;
  /** Optional filter: only include categories belonging to this category type name */
  categoryType?: string;
  /** Static resource-level category presets to merge with API results */
  resourceCategories?: CategoryOption[];
  /** Whether to fetch on mount. Default true. */
  enabled?: boolean;
}

/* ── Validation mode ────────────────────────────────────────── */

/** 'strict' = only API values allowed, 'flexible' = API + custom values allowed */
export type ValidationMode = 'strict' | 'flexible';

/* ── ApiCategorySelect props ────────────────────────────────── */

export interface ApiCategorySelectProps {
  /** Currently selected value */
  value: string;
  /** Called when selection changes */
  onChange: (value: string) => void;
  /** Prepend an "all" option for filter mode */
  allOption?: CategoryOption;
  /** Validation mode. Default 'flexible'. */
  validationMode?: ValidationMode;
  /** Base URL for the categories API. Default '/~/api/categories' */
  apiBase?: string;
  /** Filter by target app name (e.g. 'csv-datasource-hub') */
  targetApp?: string;
  /** Filter by category type name */
  categoryType?: string;
  /** Static resource-level presets to merge with API data */
  resourceCategories?: CategoryOption[];
  /** Minimum width CSS class. Default 'min-w-[160px] text-sm' */
  className?: string;
  /** Custom react-select styles override */
  styles?: StylesConfig<CategoryOption, false, GroupBase<CategoryOption>>;
  /** Placeholder text. Default 'Select or type a category…' */
  placeholder?: string;
  /** Called when validation rejects a custom value in strict mode */
  onValidationError?: (value: string) => void;
}
