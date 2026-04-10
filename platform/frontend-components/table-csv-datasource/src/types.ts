import type { ReactNode } from 'react';

/** Column definition — can also be passed as a plain string shorthand. */
export interface DataTableColumn {
  /** Column key (used to look up values in record-style rows). */
  key: string;
  /** Display label. Defaults to key with underscores replaced by spaces. */
  label?: string;
}

/**
 * Rows can be passed as either:
 * - `Record<string, string>[]` — key-value objects (column key → cell value)
 * - `string[][]` — array-of-arrays (positional, matched to columns by index)
 */
export type DataTableRow = Record<string, string> | string[];

export type SortDirection = 'asc' | 'desc' | false;

export interface DataTableProps {
  /** Column definitions. Strings are used as both key and label. */
  columns: (string | DataTableColumn)[];
  /** Data rows. Supports both keyed objects and positional arrays. */
  rows: DataTableRow[];
  /** Called when a row body is clicked (receives the row data and absolute index). */
  onRowClick?: (row: DataTableRow, index: number) => void;
  /** Row number offset for display (default 0). */
  offset?: number;
  /** Whether rows are expandable with a detail panel. Default true. */
  expandable?: boolean;
  /** Columns to show in the expanded detail panel. Defaults to all columns. */
  detailColumns?: (string | DataTableColumn)[];
  /** Custom class name for the outer container. */
  className?: string;
  /** Footer text shown on the right side. Default "Loaded". */
  footerStatus?: string;
  /** Total row count (for footer display when paginated). If omitted, uses rows.length. */
  totalRows?: number;
  /** Sticky header. Default true. */
  stickyHeader?: boolean;
  /** Max height for scrollable table body (e.g. '600px'). */
  maxHeight?: string;
  /** Icon shown when sort direction is ascending. */
  sortAscIcon?: ReactNode;
  /** Icon shown when sort direction is descending. */
  sortDescIcon?: ReactNode;
  /** Icon shown when column is sortable but unsorted. */
  sortNeutralIcon?: ReactNode;
  /** Icon shown on the expand toggle (rotated 180° when expanded). */
  expandIcon?: ReactNode;
  /** Icon shown in link cells. */
  linkIcon?: ReactNode;
  /** Enable row selection checkboxes. Default true. */
  selectable?: boolean;
  /** Max width for data cells (e.g. '200px'). Content exceeding this is truncated with ellipsis. */
  maxCellWidth?: string;
  /** Set of column keys to hide. Columns in this set are excluded from both the table and detail modal. */
  hiddenColumns?: Set<string>;
  children?: ReactNode;
}

export interface PaginationProps {
  /** Current offset (0-based row index). */
  offset: number;
  /** Page size. */
  limit: number;
  /** Total number of rows. */
  total: number;
  /** Called when the offset changes. */
  onOffsetChange: (offset: number) => void;
  /** Custom class name. */
  className?: string;
  children?: ReactNode;
}
