import type { ReactNode } from 'react';

/** A single checkbox option within a filter section. */
export interface FilterOption {
  /** Unique identifier for this option. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional count badge shown after the label. */
  count?: number;
}

/** A collapsible filter section containing checkbox options. */
export interface FilterSectionConfig {
  /** Unique key for this section. */
  key: string;
  /** Section heading label. */
  title: string;
  /** Available checkbox options. */
  options: FilterOption[];
  /** Whether the section starts expanded. Defaults to `true`. */
  defaultExpanded?: boolean;
}

/** A single item displayed in the sidebar list. */
export interface SidebarItem {
  /** Unique identifier. */
  id: string | number;
  /** Primary display name (searchable). */
  name: string;
  /** Category string — used for category filter matching. */
  category: string;
  /** Tags for secondary search matching and display as chips. */
  tags?: string[];
  /** Relative time or date string shown on the card. */
  updated?: string;
  /** Numeric usage/popularity value — drives the progress bar. */
  usageCount?: number;
  /** Whether this item is starred/favorited. */
  starred?: boolean;
}

/** Callback the consumer provides to filter items based on active selections. */
export type ItemFilterFn = (
  item: SidebarItem,
  selections: Record<string, string[]>,
) => boolean;

export interface PanelLeftSidebarMenu002Props {
  /** Sidebar title displayed in the header. */
  title?: string;
  /** Filter section definitions. Each section renders as a collapsible checkbox group. */
  filterSections: FilterSectionConfig[];
  /** Items to display in the list. */
  items: SidebarItem[];
  /**
   * Custom filter function applied to items based on current filter selections.
   * Receives each item and a map of `{ sectionKey: selectedOptionIds[] }`.
   * If omitted, the component performs no filter-section-based filtering
   * (only fuzzy search applies).
   */
  itemFilter?: ItemFilterFn;
  /**
   * Called when filter selections change. Receives the full selection map.
   * Use this for controlled filter state or to compute dynamic counts.
   */
  onFilterChange?: (selections: Record<string, string[]>) => void;
  /** Maximum usage count for normalizing the progress bar (auto-detects if omitted). */
  maxUsageCount?: number;
  /** Search input placeholder text. */
  searchPlaceholder?: string;
  /** Callback fired when an item is selected (clicked or Enter). */
  onItemSelect?: (item: SidebarItem) => void;
  /** Callback fired when an item's star is toggled. Receives the item id and new starred state. */
  onStarToggle?: (id: string | number, starred: boolean) => void;
  /** Icon rendered in the header action button (top-right). Pass `null` to hide. */
  headerActionIcon?: ReactNode;
  /** Callback fired when the header action button is clicked. */
  onHeaderAction?: () => void;
  /** Footer content — replaces the default "Browse All" button. */
  footer?: ReactNode;
  /** Label for the default footer button (if `footer` is not provided). */
  footerLabel?: string;
  /** Callback for the default footer button click. */
  onFooterAction?: () => void;
  /**
   * App bar rendered at the very top of the sidebar, above the header and search.
   * Use for navigation icons (home/dashboard), action buttons, or branding.
   */
  appBar?: ReactNode;
  /**
   * Custom header content replacing the default title/subtitle/action row.
   * Pass an empty fragment (`<></>`) to hide the header entirely.
   * Omit (or `undefined`) to render the default header.
   */
  header?: ReactNode;
  /** Hide the "Results" / title label row above the item list. Defaults to `false`. */
  hideListHeader?: boolean;
  /** ID of the currently active/selected item. The item is pinned to the top of the list and highlighted. */
  activeId?: string | number;
  /** Additional CSS class applied to the outermost container. */
  className?: string;
}
