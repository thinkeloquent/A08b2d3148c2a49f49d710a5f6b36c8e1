import type { ReactNode } from 'react';

/** A single field item within a group */
export interface PropertyField {
  /** Display label for the field (e.g. "vulnerability_id") */
  label: string;
  /** Machine key for the field (e.g. "vulnerabilityId") */
  fieldKey: string;
  /** Icon rendered before the label. Defaults to a hash icon if not provided. */
  icon?: ReactNode;
}

/** A collapsible group of fields */
export interface PropertyFieldGroup {
  /** Group display name (e.g. "Identity", "Package") */
  name: string;
  /** Fields belonging to this group */
  fields: PropertyField[];
}

/** Props for PanelRightPropertyFields */
export interface PanelRightPropertyFieldsProps {
  /** Panel header title */
  title: string;
  /** Icon rendered next to the panel title */
  titleIcon?: ReactNode;
  /** Total field count shown in the header badge. Derived from groups if omitted. */
  totalCount?: number;
  /** Grouped fields to display */
  groups: PropertyFieldGroup[];
  /** Controlled search input value */
  searchValue?: string;
  /** Callback when the search input changes */
  onSearchChange?: (value: string) => void;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Icon rendered inside the search input. Defaults to a magnifying glass if not provided. */
  searchIcon?: ReactNode;
  /** Callback when a field item is clicked */
  onFieldClick?: (field: PropertyField, group: PropertyFieldGroup) => void;
  /** Keys of groups that are initially collapsed. All groups are expanded by default. */
  defaultCollapsedGroups?: string[];
  /** Chevron icon for collapsible group headers. Receives `isExpanded` for rotation. */
  chevronIcon?: ReactNode;
  /** CSS class escape hatch for the root container */
  className?: string;
  /** Additional content rendered below the field list */
  children?: ReactNode;
}
