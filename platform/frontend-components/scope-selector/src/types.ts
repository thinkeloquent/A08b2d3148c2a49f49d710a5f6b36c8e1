import type { ReactNode } from 'react';

/** A single selectable item within a scope */
export interface ScopeSelectorItem {
  /** Unique identifier for the item */
  id: string;
  /** Display name */
  name: string;
  /** Single character displayed in the badge */
  badge?: string;
}

/** A scope category containing selectable items */
export interface ScopeSelectorScope {
  /** Unique key identifying this scope */
  key: string;
  /** Display label for the scope (e.g., "Organizations") */
  label: string;
  /** Icon rendered next to the scope label — accepts any ReactNode */
  icon?: ReactNode;
  /** Accent color for this scope (hex string, e.g., "#6C5CE7") */
  color: string;
  /** Items available within this scope */
  items: ScopeSelectorItem[];
}

/** Current selection state */
export interface ScopeSelectorValue {
  scope: ScopeSelectorScope;
  item: ScopeSelectorItem;
}

export interface ScopeSelectorProps {
  /** Array of scope categories to display */
  scopes: ScopeSelectorScope[];

  /** Controlled value — the currently selected scope + item */
  value?: ScopeSelectorValue;

  /** Default value for uncontrolled mode */
  defaultValue?: ScopeSelectorValue;

  /** Called when an item is selected */
  onSelect?: (value: ScopeSelectorValue) => void;

  /** Called when the "Create" footer action is clicked */
  onCreateClick?: (scope: ScopeSelectorScope) => void;

  /** Called when the "Manage" footer action is clicked */
  onManageClick?: (scope: ScopeSelectorScope) => void;

  /** Whether to show footer actions (Create / Manage). Defaults to true */
  showFooterActions?: boolean;

  /** Placeholder text when nothing is selected */
  placeholder?: string;

  /** Width of the dropdown trigger. Defaults to 340 */
  width?: number | string;

  /** Global accent color override (used for focus ring, selected states). Defaults to "#6C5CE7" */
  accentColor?: string;

  /** CSS class applied to the outermost wrapper */
  className?: string;

  /** Compact mode for inline usage (e.g., inside a nav bar). Reduces padding, border-radius, and shadow. */
  compact?: boolean;

  /** Called when the user clicks the refresh button in the scope header. Typically re-fetches the item list. */
  onRefresh?: () => void;
}
