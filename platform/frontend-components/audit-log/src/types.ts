import type { ReactNode } from 'react';

/** Configuration for how an action type is visually styled */
export interface AuditLogActionConfig {
  /** Tailwind background color class (e.g., 'bg-green-100') */
  bgColor: string;
  /** Tailwind text color class (e.g., 'text-green-800') */
  textColor: string;
  /** Tailwind border color class (e.g., 'border-green-200') */
  borderColor: string;
}

/** A single audit log entry */
export interface AuditLogEntry {
  /** Unique identifier */
  id: string | number;
  /** Action type (e.g., 'create', 'update', 'delete', 'restore') */
  action: string;
  /** Who performed the action */
  performer: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Optional tags/metadata associated with the entry */
  tags?: Record<string, unknown> | null;
}

/** Props for the AuditLogEntryCard sub-component */
export interface AuditLogEntryCardProps {
  /** The audit log entry to render */
  log: AuditLogEntry;
  /** Map of action types to their visual styles */
  actionConfig?: Record<string, AuditLogActionConfig>;
  /** Custom renderer for the tags section. Receives the tags object. */
  renderTags?: (tags: Record<string, unknown>, config: AuditLogActionConfig) => ReactNode;
  /** Custom date formatter. Receives the ISO timestamp, returns display string. */
  formatDate?: (timestamp: string) => string;
  /** Additional CSS classes */
  className?: string;
}

/** Props for the main AuditLog component */
export interface AuditLogProps {
  /** Array of audit log entries to display */
  logs: AuditLogEntry[];
  /** Available action types for filtering. Defaults to unique actions from logs. */
  actionTypes?: string[];
  /** Map of action types to their visual styles */
  actionConfig?: Record<string, AuditLogActionConfig>;
  /** Custom renderer for the tags section within each entry */
  renderTags?: (tags: Record<string, unknown>, config: AuditLogActionConfig) => ReactNode;
  /** Custom date formatter for timestamps */
  formatDate?: (timestamp: string) => string;
  /** Title displayed at the top. Defaults to 'Audit Log'. */
  title?: string;
  /** Icon rendered before the title */
  titleIcon?: ReactNode;
  /** Content to display when no logs match the filter */
  emptyContent?: ReactNode;
  /** Callback when the action filter changes */
  onFilterChange?: (action: string) => void;
  /** Controlled filter value. If provided, filter state is managed externally. */
  filterValue?: string;
  /** Additional CSS classes on the root container */
  className?: string;
  /** Content rendered below the header */
  children?: ReactNode;
}
