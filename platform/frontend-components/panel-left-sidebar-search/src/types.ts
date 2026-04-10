import type { ReactNode } from 'react';

/* ── Fuzzy match result ─────────────────────────────────────── */

export interface FuzzyResult {
  hit: boolean;
  score: number;
  idx: number[];
}

/* ── Facet / filter definitions ─────────────────────────────── */

/** A single filterable facet (e.g. "Status", "Owner") */
export interface FacetDefinition {
  /** Human-readable label shown in the filter palette */
  label: string;
  /** Small icon/symbol for the facet chip */
  icon: string;
  /** Accent colour (hex) used for chips and palette highlights */
  accent: string;
  /** Known values for this facet */
  values: string[];
}

/** Map of facet keys to their definitions */
export type FacetMap = Record<string, FacetDefinition>;

/** A structured filter produced by the palette or parsed from input */
export interface StructuredFilter {
  key: string;
  op: string;
  value: string;
  source: 'chip' | 'inline';
}

/** A chip-filter added via the filter palette */
export interface ChipFilter {
  key: string;
  operator: string;
  value: string;
}

/** An inline token parsed from the search input */
export interface InlineToken {
  key: string;
  value: string;
  raw: string;
  resolved: boolean;
}

/* ── Operator list ──────────────────────────────────────────── */

export type Operator = 'is' | 'is not' | 'contains';

/* ── Item rendering ─────────────────────────────────────────── */

/** Generic item — consumers provide their own item shape via generics */
export interface PanelLeftSidebarSearchProps<T = any> {
  /** The full list of items to search/filter */
  items: T[];

  /** Facet definitions keyed by field name (e.g. `{ status: { label: "Status", ... } }`) */
  facets: FacetMap;

  /**
   * Extract the searchable text fields from an item.
   * Return an object with `name`, `description`, and optionally `tags` (string[]).
   */
  getSearchableFields: (item: T) => {
    name: string;
    description: string;
    tags?: string[];
  };

  /**
   * Extract the value of a facet field from an item.
   * For array fields like tags, join them with spaces.
   */
  getFacetValue: (item: T, facetKey: string) => string;

  /** Render a single result item */
  renderItem: (item: T, queryText: string, index: number) => ReactNode;

  /** Optional: render a group header when grouping is active */
  renderGroupHeader?: (groupKey: string, count: number) => ReactNode;

  /**
   * Optional: extract the group key from an item (for "group by" toggle).
   * If omitted, grouping toggle is hidden.
   */
  getGroupKey?: (item: T) => string;

  /** Label for the group-by toggle button (default: "Group") */
  groupByLabel?: string;

  /** Whether grouping is enabled by default (default: true) */
  defaultGroupByEnabled?: boolean;

  /** Available filter operators (default: ["is", "is not", "contains"]) */
  operators?: Operator[];

  /** Search input placeholder when no filters are active */
  placeholder?: string;

  /** Search input placeholder when filters are active */
  narrowPlaceholder?: string;

  /** Title displayed in the header area */
  title?: string;

  /** Subtitle / description displayed below the title */
  subtitle?: string;

  /** Icon rendered in the header (ReactNode) */
  headerIcon?: ReactNode;

  /** Optional hint entries shown when the input is focused and empty */
  hints?: SearchHint[];

  /** Empty-state message title (default: "No results match") */
  emptyTitle?: string;

  /** Empty-state message body (default: "Try adjusting your search or removing filters") */
  emptyMessage?: string;

  /** Optional footer content */
  footer?: ReactNode;

  /** CSS class applied to the root container */
  className?: string;

  /** Children rendered after the results */
  children?: ReactNode;
}

/** A quick-syntax hint shown in the dropdown */
export interface SearchHint {
  /** The syntax string, e.g. "type:document" */
  syntax: string;
  /** Human-readable description */
  desc: string;
}

/* ── Sub-component props ────────────────────────────────────── */

export interface TokenChipProps {
  token: { key: string; value: string };
  facet: FacetDefinition;
  onRemove: () => void;
  className?: string;
}

export interface FilterPaletteProps {
  facets: FacetMap;
  operators: Operator[];
  activeFilters: StructuredFilter[];
  onAdd: (filter: ChipFilter) => void;
  onClose: () => void;
  className?: string;
}

export interface FuzzyHighlightProps {
  text: string;
  idx: number[];
  highlightClassName?: string;
  className?: string;
}
