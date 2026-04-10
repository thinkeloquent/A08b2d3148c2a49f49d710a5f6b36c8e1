import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  CategoryOption,
  CategoriesExportResponse,
  ApiCategory,
  UseCategoryOptionsConfig,
} from './types';

const DEFAULT_API_BASE = '/~/api/categories';

/** Deduplicate options by value (case-insensitive), keeping the first occurrence */
function dedupeOptions(options: CategoryOption[]): CategoryOption[] {
  const seen = new Set<string>();
  return options.filter((o) => {
    const key = o.value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function categoryToOption(cat: ApiCategory): CategoryOption {
  return { value: cat.name, label: cat.name, source: 'api' as const };
}

/**
 * Fetches categories from the Categories API `/export` endpoint,
 * optionally filters by targetApp / categoryType, and merges with
 * resource-level presets. Also exposes a fuzzy search helper that
 * hits the `/search` endpoint.
 */
export function useCategoryOptions(config: UseCategoryOptionsConfig = {}) {
  const {
    apiBase = DEFAULT_API_BASE,
    targetApp,
    categoryType,
    resourceCategories = [],
    enabled = true,
  } = config;

  const [apiOptions, setApiOptions] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* ── Fetch /export on mount ────────────────────────────────── */

  useEffect(() => {
    if (!enabled) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetch(`${apiBase}/export`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Categories API ${res.status}`);
        return res.json() as Promise<CategoriesExportResponse>;
      })
      .then((data) => {
        let filtered = data.categories;

        if (targetApp) {
          const appId = data.target_apps.find(
            (a) => a.name.toLowerCase() === targetApp.toLowerCase(),
          )?.id;
          if (appId) filtered = filtered.filter((c) => c.target_app_id === appId);
        }

        if (categoryType) {
          const typeId = data.category_types.find(
            (t) => t.name.toLowerCase() === categoryType.toLowerCase(),
          )?.id;
          if (typeId) filtered = filtered.filter((c) => c.category_type_id === typeId);
        }

        setApiOptions(filtered.map(categoryToOption));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [apiBase, targetApp, categoryType, enabled]);

  /* ── Fuzzy search via /search endpoint ─────────────────────── */

  const search = useCallback(
    async (query: string): Promise<CategoryOption[]> => {
      if (!query.trim()) return [];
      const res = await fetch(`${apiBase}/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      const data = (await res.json()) as { categories: ApiCategory[] };
      return data.categories.map(categoryToOption);
    },
    [apiBase],
  );

  /* ── Merged options: API first, then resource presets ──────── */

  const resourceOpts = resourceCategories.map((o) => ({ ...o, source: 'resource' as const }));
  const options = dedupeOptions([...apiOptions, ...resourceOpts]);

  /** Set of valid API values for strict validation */
  const apiValues = new Set(apiOptions.map((o) => o.value));

  /** Check if a value is a known API category */
  const isApiValue = (value: string) => apiValues.has(value);

  return { options, loading, error, search, isApiValue, apiValues };
}
