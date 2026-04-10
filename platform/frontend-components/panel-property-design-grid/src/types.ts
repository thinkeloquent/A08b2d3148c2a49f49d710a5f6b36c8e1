import type { ReactNode } from 'react';

/** Supported guide layout types */
export type GuideType = 'rows' | 'columns' | 'grid';

/** Supported alignment options */
export type GuideAlign = 'left' | 'center' | 'right' | 'justify';

/** Guide settings state */
export interface GuideSettings {
  /** Layout type: rows, columns, or grid */
  type: GuideType;
  /** Number of guides (1-99) */
  count: number;
  /** Alignment of guides */
  align: GuideAlign;
  /** Width/height percentage (10-100) */
  width: number;
  /** Gap between guides in pixels (0-50) */
  gap: number;
  /** Margin around preview in pixels (0-50) */
  margin: number;
  /** Guide color as hex string */
  color: string;
}

/** Type option for the type selector */
export interface TypeOption {
  /** Unique identifier matching GuideType */
  id: GuideType;
  /** Icon rendered in the button — accepts ReactNode for zero icon-lib coupling */
  icon: ReactNode;
  /** Accessible label */
  label: string;
}

/** Alignment option for the align selector */
export interface AlignOption {
  /** Unique identifier matching GuideAlign */
  id: GuideAlign;
  /** Icon rendered in the button — accepts ReactNode for zero icon-lib coupling */
  icon: ReactNode;
  /** Accessible label */
  label: string;
}

export interface PanelPropertyDesignGuideProps {
  /** CSS class escape hatch */
  className?: string;
  /** Initial settings (uncontrolled). Merged with defaults. */
  defaultSettings?: Partial<GuideSettings>;
  /** Controlled settings. When provided, `onSettingsChange` is required. */
  settings?: GuideSettings;
  /** Called when any setting changes. Required in controlled mode. */
  onSettingsChange?: (settings: GuideSettings) => void;
  /** Whether the panel starts open. Default: true */
  defaultOpen?: boolean;
  /** Custom type options. Defaults to rows/columns/grid with text icons. */
  typeOptions?: TypeOption[];
  /** Custom align options. Defaults to left/center/right/justify. */
  alignOptions?: AlignOption[];
  /** Panel title. Default: "Guides" */
  title?: string;
  /** Icon shown on the collapsed toggle button */
  toggleIcon?: ReactNode;
  /** Icon shown on the close button */
  closeIcon?: ReactNode;
  /** Icon for the decrement button */
  decrementIcon?: ReactNode;
  /** Icon for the increment button */
  incrementIcon?: ReactNode;
}
