import type { ReactNode } from 'react';

/** A single terminology entry. */
export interface Term {
  /** Unique identifier. */
  id: string;
  /** Human-readable display name for the term. */
  term: string;
  /** Alternative names or abbreviations. */
  aliases: string[];
  /** Full definition of the term. */
  definition: string;
  /** Links to documentation, wikis, or runbooks. */
  reference_urls: string[];
  /** Machine-readable slug (lowercase, hyphens, max 64 chars). */
  name: string;
  /** Extended description of scope and usage. */
  description: string;
  /** Compatibility notes (optional). */
  compatibility?: string;
  /** Arbitrary key-value metadata (e.g. owner, priority, quarter). */
  metadata: Record<string, string>;
  /** ISO date string (YYYY-MM-DD). */
  createdAt: string;
  /** ISO date string (YYYY-MM-DD). */
  updatedAt: string;
}

/** Color config for a single priority level. */
export interface PriorityColorConfig {
  bg: string;
  text: string;
  dot: string;
}

/** Props for the TerminologyManager component. */
export interface TerminologyManagerProps {
  /** Array of terms to display and manage. */
  terms: Term[];
  /** Called when a term is created or updated. */
  onSave: (term: Term) => void;
  /** Called when a term is deleted (receives the term id). */
  onDelete: (id: string) => void;
  /** Header title. Defaults to "Terminology Manager". */
  title?: string;
  /** Header subtitle. Defaults to "Internal Knowledge Base". */
  subtitle?: string;
  /** Icon rendered in the header badge. Accepts any ReactNode. */
  headerIcon?: ReactNode;
  /** Icon rendered in the empty state. Accepts any ReactNode. */
  emptyStateIcon?: ReactNode;
  /** Priority color map keyed by priority string (e.g. "P0", "P1"). */
  priorityColors?: Record<string, PriorityColorConfig>;
  /** CSS class escape hatch. */
  className?: string;
}
