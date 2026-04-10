import type { ReactNode } from 'react';

/** A single option for the filter dropdown */
export interface FilterOption {
  /** The value submitted when this option is selected */
  value: string;
  /** The display label shown in the dropdown */
  label: string;
}

/** Props for the PanelItemListing root component */
export interface PanelItemListingProps<T> {
  /** Panel header title */
  title: string;
  /** Array of items to display in the list */
  items: T[];
  /** Unique key extractor for each item */
  getItemKey: (item: T) => string;
  /** Render function for each list item */
  renderItem: (item: T, isSelected: boolean) => ReactNode;
  /** Currently selected item key */
  selectedKey?: string;
  /** Callback when an item is clicked */
  onItemSelect?: (item: T) => void;
  /** Search input placeholder text */
  searchPlaceholder?: string;
  /** Callback when search text changes — consumer controls filtering */
  onSearchChange?: (query: string) => void;
  /** Current search value (controlled) */
  searchValue?: string;
  /** Filter dropdown options. First option is treated as the "all" default. */
  filterOptions?: FilterOption[];
  /** Current filter value (controlled) */
  filterValue?: string;
  /** Callback when filter selection changes */
  onFilterChange?: (value: string) => void;
  /** Label for the primary action button */
  actionLabel?: string;
  /** Icon rendered before the action button label */
  actionIcon?: ReactNode;
  /** Callback when the primary action button is clicked */
  onActionClick?: () => void;
  /** Whether items are currently loading */
  isLoading?: boolean;
  /** Error to display in the list area */
  error?: { message: string } | null;
  /** Total item count (before filtering) for the footer summary */
  totalCount?: number;
  /** Noun label for the item type (e.g. "organizations"). Used in footer: "Showing 5 of 10 {itemLabel}" */
  itemLabel?: string;
  /** Loading spinner element — consumer provides their own spinner */
  loadingElement?: ReactNode;
  /** Icon shown in the search input */
  searchIcon?: ReactNode;
  /** Empty state content when no items match */
  emptyContent?: ReactNode;
  /** Content rendered in the main area (right of the list panel) */
  children?: ReactNode;
  /** CSS class for the root container */
  className?: string;
  /** Width of the list panel (left side) — Tailwind class e.g. 'w-96'. Defaults to 'w-96'. */
  panelWidth?: string;
  /** Min-width of the list panel — Tailwind class e.g. 'min-w-96'. Defaults to 'min-w-96'. */
  panelMinWidth?: string;
  /** Max-width of the list panel — Tailwind class e.g. 'max-w-96'. Defaults to 'max-w-96'. */
  panelMaxWidth?: string;
  /** CSS class for the list panel (left side) */
  panelClassName?: string;
  /** CSS class for the main content area (right side) */
  contentClassName?: string;
}

/** Props for PanelListItem — a pre-built list item with icon, title, subtitle, description, and badge */
export interface PanelListItemProps {
  /** Item title (primary text) */
  title: string;
  /** Subtitle shown below the title */
  subtitle?: string;
  /** Optional description (line-clamped to 2 lines) */
  description?: string;
  /** Whether this item is currently selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Icon rendered to the left of the text content */
  icon?: ReactNode;
  /** Badge/status element rendered below the text */
  badge?: ReactNode;
  /** CSS class escape hatch */
  className?: string;
}
