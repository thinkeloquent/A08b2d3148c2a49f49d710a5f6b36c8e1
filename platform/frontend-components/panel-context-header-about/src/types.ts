import type { ReactNode, ElementType } from 'react';

// ── Data item types ──

/** A benefit/feature card shown in the expanded section */
export interface BenefitItem {
  /** Icon rendered in the card's leading position */
  icon?: ReactNode;
  /** Short title for the benefit */
  title: string;
  /** Supporting description text */
  description: string;
}

/** A tag/use-case pill shown in the expanded section */
export interface TagItem {
  /** Display label */
  label: string;
  /** Optional Tailwind color classes (bg, text, border) */
  colorClass?: string;
  /** Icon rendered before the label */
  icon?: ReactNode;
}

/** A stat counter shown in the expanded section */
export interface StatItem {
  /** Numeric value to animate to */
  value: number;
  /** Label below the number */
  label: string;
  /** Suffix appended after the number (e.g. "+", "%") */
  suffix?: string;
}

/** Breadcrumb segment */
export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Click handler — if omitted the segment is not interactive */
  onClick?: () => void;
}

/** Call-to-action configuration for the bottom banner */
export interface CtaConfig {
  /** Icon rendered in the CTA leading position */
  icon?: ReactNode;
  /** Primary heading text */
  title: string;
  /** Supporting description */
  description: string;
  /** Button label */
  buttonLabel: string;
  /** Button click handler */
  onButtonClick?: () => void;
  /** Polymorphic element type for the button (e.g. a router Link) */
  buttonAs?: ElementType;
  /** Additional props forwarded to the button element */
  buttonProps?: Record<string, unknown>;
}

// ── Dropdown option for the optional selector ──

export interface SelectorOption {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Optional trailing badge text */
  badge?: string;
}

// ── Section labels ──

export interface SectionLabels {
  /** Label for the benefits section (default: "Key Benefits") */
  benefits?: string;
  /** Label for the tags section (default: "Common Use Cases") */
  tags?: string;
  /** Icon rendered before the benefits label */
  benefitsIcon?: ReactNode;
  /** Icon rendered before the tags label */
  tagsIcon?: ReactNode;
}

// ── Main component props ──

export interface PanelContextHeaderAboutProps {
  /** CSS class escape hatch applied to the root wrapper */
  className?: string;

  // ── Header (always visible) ──

  /** Icon rendered in the gradient badge to the left of the title */
  icon?: ReactNode;
  /** Primary title — can include ReactNode for styled fragments */
  title: ReactNode;
  /** Optional status badge (e.g. "Production Ready") shown next to the title */
  statusBadge?: ReactNode;
  /** Description paragraph below the title */
  description?: ReactNode;

  // ── Breadcrumb ──

  /** Breadcrumb segments rendered above the card */
  breadcrumbs?: BreadcrumbItem[];

  // ── Expanded section: selector ──

  /** Options for the dropdown selector in the expanded area */
  selectorOptions?: SelectorOption[];
  /** Currently selected option id */
  selectorValue?: string;
  /** Called when the user picks a selector option */
  onSelectorChange?: (id: string) => void;

  // ── Expanded section: stats ──

  /** Stat counters shown next to the selector */
  stats?: StatItem[];

  // ── Expanded section: benefits ──

  /** Benefit/feature cards */
  benefits?: BenefitItem[];

  // ── Expanded section: tags ──

  /** Tag/use-case pills */
  tags?: TagItem[];

  // ── Expanded section: CTA ──

  /** Call-to-action banner at the bottom of the expanded area */
  cta?: CtaConfig;

  // ── Section labels ──

  /** Override default section heading labels and icons */
  sectionLabels?: SectionLabels;

  // ── Accent bar ──

  /** Tailwind gradient classes for the top accent bar (default: "from-blue-500 via-violet-500 to-blue-400") */
  accentGradient?: string;

  // ── Controlled expand ──

  /** If provided, the component becomes controlled */
  expanded?: boolean;
  /** Called when the expand/collapse toggle is clicked */
  onExpandedChange?: (expanded: boolean) => void;

  // ── Slots ──

  /** Additional content rendered at the end of the expanded area, before the CTA */
  children?: ReactNode;
}
