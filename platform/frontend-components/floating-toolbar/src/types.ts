import type { ReactNode } from 'react';

/** A single tool item rendered in the toolbar. */
export interface FloatingToolbarItem {
  /** Unique identifier for this tool. */
  id: string;
  /** Human-readable label shown in the tooltip. */
  label: string;
  /** Keyboard shortcut string shown in the tooltip badge (e.g. "⌘E"). */
  shortcut?: string;
  /** Icon rendered inside the button — accepts any ReactNode (SVG, component, etc.). */
  icon: ReactNode;
}

export interface FloatingToolbarProps {
  /** Array of tool items to render. */
  items: FloatingToolbarItem[];
  /** Indices after which a vertical divider is placed (zero-based). */
  dividerAfterIndices?: number[];
  /** Currently active tool id (controlled). */
  activeId?: string | null;
  /** Called when a tool is clicked. Receives the tool id, or null if deactivated. */
  onActiveChange?: (id: string | null) => void;
  /** CSS class escape hatch applied to the outer wrapper. */
  className?: string;
}
