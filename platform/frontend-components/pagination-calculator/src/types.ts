import type { ReactNode } from 'react';

export interface PaginationCalculatorProps {
  /** Total number of records in the dataset */
  total: number;
  /** Current offset (starting index) */
  offset?: number;
  /** Number of records per page */
  pageSize?: number;
  /** Optional icon displayed next to the title */
  icon?: ReactNode;
  /** Optional title override (default: "Pagination") */
  title?: string;
  /** Called when the user changes offset via page navigation */
  onOffsetChange?: (offset: number) => void;
  /** Called when the user edits the page size */
  onPageSizeChange?: (pageSize: number) => void;
  /** CSS class escape hatch */
  className?: string;
}

export interface PaginationInfo {
  totalPages: number;
  currentPage: number;
  effectiveRecords: number;
  currentOffset: number;
  currentEnd: number;
  currentCount: number;
  lastPageSize: number;
}
