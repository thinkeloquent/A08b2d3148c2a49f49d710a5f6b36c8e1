import type { ReactNode } from 'react';

/** A single token mapping entry */
export interface TokenMapping {
  /** Replacement value for the token */
  value: string;
  /** Data type hint for the token */
  type: string;
  /** Whether the token is locked from editing */
  locked: boolean;
}

/** Record of token name to its mapping */
export type TokenMappings = Record<string, TokenMapping>;

/** Data emitted on change events */
export interface TokenTemplateEditorData {
  template: string;
  mappings: TokenMappings;
}

/** Tab identifiers for the editor */
export type EditorTab = 'editor' | 'preview' | 'export';

/** Feature flags to toggle optional editor columns and tabs */
export interface TokenEditorFeatures {
  /** Show the Export tab (default: true) */
  showExport?: boolean;
  /** Show the lock/unlock action per row (default: true) */
  showLock?: boolean;
  /** Show the required checkbox column (default: true) */
  showRequired?: boolean;
  /** Show the type selector column (default: true) */
  showType?: boolean;
  /** Show the description column (default: true) */
  showDescription?: boolean;
}

/** Props for the main TokenTemplateEditor component */
export interface TokenTemplateEditorProps {
  /** Initial template string with {{token}} placeholders */
  initialTemplate?: string;
  /** Default replacement values keyed by token name */
  defaultValues?: Record<string, string>;
  /** Available token type options (defaults to text, number, date, email, url) */
  tokenTypes?: string[];
  /** Called when template or mappings change */
  onChange?: (data: TokenTemplateEditorData) => void;
  /** Called when user copies resolved output or JSON export */
  onCopy?: (text: string) => void;
  /** Called when user clicks the download button in export tab */
  onDownload?: (json: string) => void;
  /** Initial active tab */
  initialTab?: EditorTab;
  /** Title displayed in the header */
  title?: string;
  /** Description displayed below the title */
  description?: string;
  /** Icon rendered before the title */
  titleIcon?: ReactNode;
  /** CSS class escape hatch */
  className?: string;
  /** Content rendered in the header area after the title block */
  headerExtra?: ReactNode;
  /** Feature flags to toggle optional columns and tabs */
  features?: TokenEditorFeatures;
}

/** Props for the TabSwitcher sub-component */
export interface TabSwitcherProps {
  active: EditorTab;
  onChange: (tab: EditorTab) => void;
  className?: string;
}

/** Props for a single token row */
export interface TokenRowProps {
  index: number;
  token: string;
  value: string;
  type: string;
  locked: boolean;
  tokenTypes: string[];
  onValueChange: (value: string) => void;
  onTypeChange: (type: string) => void;
  onLockToggle: () => void;
  onRemove: () => void;
  canRemove: boolean;
  features: Required<TokenEditorFeatures>;
  className?: string;
}

/** Props for the template textarea with syntax highlighting */
export interface TemplateTextareaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Props for the live preview panel */
export interface PreviewPanelProps {
  template: string;
  mappings: TokenMappings;
  onCopy?: (text: string) => void;
  className?: string;
}

/** Props for the JSON export panel */
export interface ExportPanelProps {
  template: string;
  mappings: TokenMappings;
  onCopy?: (text: string) => void;
  onDownload?: (json: string) => void;
  className?: string;
}

/** Props for the stats progress bar */
export interface StatsBarProps {
  mappings: TokenMappings;
  className?: string;
}

// ─── Widget (compact / embeddable) ───

/** Tab identifiers for the widget */
export type WidgetTab = 'template' | 'tokens' | 'preview';

/** A variable available for token autocomplete */
export interface TemplateVariable {
  /** Variable name (matches token name) */
  name: string;
  /** Human-readable description */
  desc: string;
}

/** Props for the compact TokenTemplateWidget */
export interface TokenTemplateWidgetProps {
  /** Template string with {{token}} or {{ token }} placeholders */
  template: string;
  /** Display title shown in the header */
  title: string;
  /** Optional version badge shown in the header */
  version?: string;
  /** Called when the user clicks the primary action button; receives the resolved template */
  onLoad?: (template: string) => void;
  /** Label for the primary action button (default: "Load into Editor") */
  loadLabel?: string;
  /** Hint text shown beside the action button */
  loadHint?: string;
  /** Max height (px) for the template preview and token panel areas (default: 320) */
  maxHeight?: number;
  /** Extra content rendered in the header after the title */
  headerExtra?: ReactNode;
  /** Extra content rendered in the footer after the action button area */
  footerExtra?: ReactNode;
  /** Hide the footer action bar entirely */
  hideFooter?: boolean;
  /** Default token replacement values keyed by token name */
  defaultValues?: Record<string, string>;
  /** Called when token replacement values change */
  onTokenValuesChange?: (values: Record<string, string>) => void;
  /** Available variables for token autocomplete suggestions */
  variables?: TemplateVariable[];
  /** Sample data rows — each row is a Record<string, string> of variable→value.
   *  The Preview tab lets the user pick a row to preview with. */
  sampleRows?: Record<string, string>[];
  /** Initial active tab */
  initialTab?: WidgetTab;
  /** CSS class escape hatch */
  className?: string;
}
