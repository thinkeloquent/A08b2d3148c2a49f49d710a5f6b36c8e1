import type { ReactNode } from 'react';

/** A toolbar action button displayed beneath the selector */
export interface ToolbarAction {
  /** Unique identifier for this action */
  id: string;
  /** Icon rendered inside the button — pass any ReactNode (e.g. an SVG or icon component) */
  icon: ReactNode;
  /** Tailwind color class applied to the icon (e.g. "text-blue-500") */
  color?: string;
  /** Tooltip text shown on hover */
  tooltip: string;
}

/** Position coordinates */
export interface Position {
  x: number;
  y: number;
}

/** Width and height dimensions */
export interface Size {
  width: number;
  height: number;
}

export interface ResizableElementSelectorProps {
  /** CSS class escape hatch */
  className?: string;

  /** Initial position of the selector box (default: { x: 100, y: 100 }) */
  defaultPosition?: Position;

  /** Initial size of the selector box (default: { width: 578, height: 180 }) */
  defaultSize?: Size;

  /** Minimum width the selector can be resized to (default: 200) */
  minWidth?: number;

  /** Minimum height the selector can be resized to (default: 100) */
  minHeight?: number;

  /** Toolbar action buttons displayed beneath the selector */
  actions?: ToolbarAction[];

  /** Whether the selector starts visible (default: true) */
  defaultVisible?: boolean;

  /** Accent color class for border, handles, and size badge (default: "blue") — maps to Tailwind color name */
  accentColor?: string;

  /** Whether to show the grid overlay inside the selection box (default: true) */
  showGrid?: boolean;

  /** Whether to show the size indicator badge (default: true) */
  showSizeIndicator?: boolean;

  /** Whether to show the debug info panel (default: false) */
  showDebugPanel?: boolean;

  /** Called when the selected tool changes (id or empty string for deselect) */
  onToolSelect?: (toolId: string) => void;

  /** Called when position changes during drag */
  onPositionChange?: (position: Position) => void;

  /** Called when size changes during resize */
  onSizeChange?: (size: Size) => void;

  /** Called when visibility toggles */
  onVisibilityChange?: (visible: boolean) => void;

  /** Called when the reset button is clicked */
  onReset?: () => void;

  /** Label for the "Show Selector" button when hidden (default: "Show Selector") */
  showButtonLabel?: string;

  /** ReactNode rendered inside the close button (default: X icon SVG) */
  closeIcon?: ReactNode;
}
