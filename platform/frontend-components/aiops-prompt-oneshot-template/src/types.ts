import type { ReactNode } from 'react';

/** Names of icon slots the workspace component uses */
export type IconName =
  | 'code'
  | 'clock'
  | 'save'
  | 'play'
  | 'check'
  | 'alertCircle'
  | 'copy'
  | 'chevronDown'
  | 'zap'
  | 'hash'
  | 'refreshCw'
  | 'fileText'
  | 'gripVertical'
  | 'layers'
  | 'upload'
  | 'x'
  | 'download'
  | 'braces'
  | 'fileUp';

/** Design-token overrides for the workspace theme */
export interface ThemeTokens {
  bgPrimary: string;
  bgSecondary: string;
  surfaceCard: string;
  surfaceElevated: string;
  inputBg: string;
  borderSubtle: string;
  borderActive: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentPrimary: string;
  accentSecondary: string;
  accentGlow: string;
  previewBg: string;
}

/** Props for the main workspace component */
export interface AiopsPromptOneshotTemplateProps {
  /** CSS class escape hatch */
  className?: string;
  /** Default template string with mustache/edge-style tokens */
  defaultTemplate?: string;
  /** Default mock data keyed by variable name */
  defaultMockData?: Record<string, string>;
  /** Display name for the template file tab */
  defaultTemplateName?: string;
  /** Initial version label (e.g. "v3.1") */
  defaultVersion?: string;
  /** Called when the user clicks Save. Receives current template, data, and new version string. */
  onSave?: (template: string, data: Record<string, string>, version: string) => void;
  /** Called when the user copies resolved output */
  onCopy?: (output: string) => void;
  /** Partial icon overrides keyed by icon name. Each value is a ReactNode rendered in place of the default SVG. */
  icons?: Partial<Record<IconName, ReactNode>>;
  /** Partial theme-token overrides */
  theme?: Partial<ThemeTokens>;
}

/** Props for the import panel overlay */
export interface ImportPanelProps {
  /** Called with flattened key-value pairs after successful parse */
  onImport: (data: Record<string, string>) => void;
  /** Called when the user dismisses the panel */
  onClose: () => void;
  /** Icon overrides */
  icons?: Partial<Record<IconName, ReactNode>>;
}

/** Props for a single variable input row */
export interface VariableInputProps {
  /** Variable name label */
  name: string;
  /** Current value */
  value: string;
  /** Type badge label */
  type: string;
  /** Called with (name, newValue) on change */
  onChange: (name: string, value: string) => void;
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the status badge */
export interface StatusBadgeProps {
  /** Whether the current state is saved */
  saved: boolean;
  /** CSS class escape hatch */
  className?: string;
}

/** Props for the line-number gutter */
export interface LineNumbersProps {
  /** Total number of lines to render */
  count: number;
  /** CSS class escape hatch */
  className?: string;
}
