import type { ReactNode } from 'react';

/** A single score metric displayed in the checklist breakdown. */
export interface ScoreItem {
  /** Unique identifier for the score row. */
  id: string;
  /** Display label for the metric. */
  label: string;
  /** Subtitle / description of what the metric measures. */
  sub: string;
  /** Score value 0-100. */
  value: number;
  /** Primary color hex (e.g. "#7C6AF7"). */
  color: string;
  /** Glow color rgba string (e.g. "rgba(124,106,247,0.35)"). */
  glow: string;
}

/** Props for the main HealthChecklist panel component. */
export interface HealthChecklistProps {
  /** Array of score items to display in the breakdown. */
  scores: ScoreItem[];
  /** Overall total score 0-100. */
  totalScore: number;
  /** Status badge label (e.g. "PARTIAL", "PASS", "FAIL"). */
  statusLabel?: string;
  /** Description content rendered below the header. Accepts ReactNode for rich text. */
  description?: ReactNode;
  /** Version string displayed in the footer. */
  version?: string;
  /** Called when the dismiss button is clicked. If omitted, dismiss button is hidden. */
  onDismiss?: () => void;
  /** CSS class escape hatch applied to the outermost panel wrapper. */
  className?: string;
}

/** Props for the AnimatedBar sub-component. */
export interface AnimatedBarProps {
  /** Bar fill percentage 0-100. */
  value: number;
  /** Bar color hex. */
  color: string;
  /** Glow color rgba string. */
  glow: string;
  /** Animation delay in ms. */
  delay?: number;
  /** CSS class escape hatch. */
  className?: string;
}

/** Props for a single ScoreRow sub-component. */
export interface ScoreRowProps {
  /** The score item data. */
  item: ScoreItem;
  /** Row index for staggered animation. */
  index: number;
  /** Whether this row is currently hovered. */
  isHovered: boolean;
  /** Hover callback — pass item.id on enter, null on leave. */
  onHover: (id: string | null) => void;
  /** CSS class escape hatch. */
  className?: string;
}

/** Props for the RadialGauge sub-component. */
export interface RadialGaugeProps {
  /** Score value 0-100. */
  score: number;
  /** CSS class escape hatch. */
  className?: string;
}
