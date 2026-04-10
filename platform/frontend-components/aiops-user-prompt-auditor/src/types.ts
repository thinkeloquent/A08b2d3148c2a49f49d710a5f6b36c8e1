import type { ReactNode } from 'react';

/** A single audit log entry representing one AI prompt interaction */
export interface AuditLogEntry {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  user_role: string;
  prompt: string;
  response: string | null;
  model: string;
  status: 'success' | 'warning' | 'error' | 'timeout';
  tokens_used: number;
  latency_ms: number;
  raw_input_context: Record<string, unknown>;
  created_at: string;
  /** Epoch timestamp for sorting — derived from created_at */
  _ts?: number;
}

/** A metric card displayed in the top summary strip */
export interface MetricItem {
  /** Short uppercase label */
  label: string;
  /** Primary display value */
  value: string;
  /** Subtitle / description */
  sub: string;
  /** Icon rendered to the right of the label — accepts ReactNode */
  icon: ReactNode;
  /** Percentage trend. Positive = green up arrow, negative = red down arrow */
  trend?: number;
}

/** Option item for dropdown filters */
export interface FilterOption {
  value: string;
  label: string;
}

export interface AiopsUserPromptAuditorProps {
  /** Array of audit log entries to display */
  logs: AuditLogEntry[];
  /** Header title text */
  title?: string;
  /** Header badge label */
  badge?: string;
  /** Icon rendered in the header — accepts ReactNode */
  headerIcon?: ReactNode;
  /** Sync status text shown in the header */
  syncStatus?: ReactNode;
  /** Metric cards displayed above the data grid */
  metrics?: MetricItem[];
  /** Available user filter options. If omitted, derived from logs */
  users?: FilterOption[];
  /** Available model filter options. If omitted, derived from logs */
  models?: FilterOption[];
  /** Available status filter options. Defaults to all/success/warning/error/timeout */
  statuses?: string[];
  /** Number of rows per page */
  pageSize?: number;
  /** Callback when a log is selected or deselected */
  onLogSelect?: (log: AuditLogEntry | null) => void;
  /** CSS class escape hatch */
  className?: string;
  children?: ReactNode;
}

export interface StatusDotProps {
  status: string;
  className?: string;
}

export interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md';
  className?: string;
}

export interface PillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface MetricCardProps extends MetricItem {
  className?: string;
}

export interface JsonNodeProps {
  data: unknown;
  depth?: number;
  defaultOpen?: boolean;
  className?: string;
}
