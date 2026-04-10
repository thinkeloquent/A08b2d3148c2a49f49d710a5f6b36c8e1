import type { ReactNode } from 'react';

/** A single category for filtering sidebar items. */
export interface SidebarCategory {
  /** Unique identifier for this category. Use `"all"` for the catch-all filter. */
  id: string;
  /** Display label shown in the category pill. */
  label: string;
  /** Icon rendered before the label — accepts any ReactNode (string emoji, SVG, etc.). */
  icon?: ReactNode;
  /** Count badge shown after the label. */
  count?: number;
}

/** A single item displayed in the sidebar list. */
export interface SidebarItem {
  /** Unique identifier. */
  id: string | number;
  /** Primary display name (searchable). */
  name: string;
  /** Category id this item belongs to. */
  category: string;
  /** Tags for secondary search matching and display as chips. */
  tags?: string[];
  /** Relative time or date string shown on the card. */
  updated?: string;
  /** Numeric usage/popularity value — drives the progress bar (0–max). */
  usageCount?: number;
  /** Whether this item is starred/favorited. */
  starred?: boolean;
}

/** Category color scheme for item cards. */
export interface CategoryColorScheme {
  /** Tailwind background class (e.g. `"bg-amber-50"`). */
  bg: string;
  /** Tailwind text class (e.g. `"text-amber-600"`). */
  text: string;
  /** Tailwind border class (e.g. `"border-amber-200"`). */
  border: string;
}

export interface PanelLeftSidebarMenu001Props {
  /** Sidebar title displayed in the header. */
  title?: string;
  /** Category filters. First category is treated as the default selection. */
  categories: SidebarCategory[];
  /** Items to display in the list. */
  items: SidebarItem[];
  /** Map of category id to color scheme for item badge styling. */
  categoryColors?: Record<string, CategoryColorScheme>;
  /** Maximum usage count for normalizing the progress bar (defaults to auto-detect max). */
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
  /** Additional CSS class applied to the outermost container. */
  className?: string;
}
