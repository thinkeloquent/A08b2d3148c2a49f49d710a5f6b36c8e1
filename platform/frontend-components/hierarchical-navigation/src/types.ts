import type { ReactNode } from 'react';

/** A single node in the navigation tree. */
export interface NavigationNode {
  /** Unique identifier for this node. */
  id: string;
  /** Display title. */
  title: string;
  /** Icon rendered beside the title — pass any ReactNode (e.g. an SVG or icon component). */
  icon?: ReactNode;
  /** Child nodes. Leaf nodes omit this or pass an empty array. */
  children?: NavigationNode[];
}

/** View mode for the navigation panel. */
export type ViewMode = 'single' | 'multi';

/** Props for the root HierarchicalNavigation component. */
export interface HierarchicalNavigationProps {
  /** The root navigation tree data. */
  data: NavigationNode;
  /** Panel header title. Defaults to "Navigation". */
  title?: string;
  /** Initial view mode. Defaults to 'single'. */
  defaultViewMode?: ViewMode;
  /** Initial path of node IDs from root. Defaults to [data.id]. */
  defaultPath?: string[];
  /** Controlled path — when provided, the component navigates to this path on every change. */
  path?: string[];
  /** Called when the user navigates to a node. Receives the full path of node IDs. */
  onPathChange?: (path: string[]) => void;
  /** Called when a leaf node (no children) is selected. */
  onSelect?: (node: NavigationNode, path: string[]) => void;
  /** Called when the view mode changes. */
  onViewModeChange?: (mode: ViewMode) => void;
  /** Icon for the single-view toggle button. */
  singleViewIcon?: ReactNode;
  /** Icon for the multi-view toggle button. */
  multiViewIcon?: ReactNode;
  /** Icon for the back button in single view. */
  backIcon?: ReactNode;
  /** Icon for the chevron indicating a drillable item. */
  chevronIcon?: ReactNode;
  /** Icon for breadcrumb separators. */
  breadcrumbSeparatorIcon?: ReactNode;
  /** Render custom content for leaf nodes (no children). Receives the node and its path. */
  renderLeafContent?: (node: NavigationNode, path: string[]) => ReactNode;
  /** Max visible panels in multi-panel mode. Enables carousel navigation when panels exceed this limit. */
  maxOpenPanels?: number;
  /** CSS class escape hatch for the outermost wrapper. */
  className?: string;
  /** Additional content rendered below the navigation panel. */
  children?: ReactNode;
}

/** Props for the SingleViewPanel sub-component. */
export interface SingleViewPanelProps {
  /** The current panel node to display. */
  currentPanel: NavigationNode;
  /** Called when a child item is clicked. */
  onNavigateToChild: (childId: string) => void;
  /** Called when the back button is clicked. */
  onNavigateBack: () => void;
  /** Whether a back button should be shown. */
  canGoBack: boolean;
  /** Whether a transition animation is in progress. */
  isTransitioning: boolean;
  /** Icon for the back button. */
  backIcon?: ReactNode;
  /** Icon for the drillable-item chevron. */
  chevronIcon?: ReactNode;
  /** CSS class escape hatch. */
  className?: string;
}

/** Internal panel descriptor used by MultiViewPanel. */
export interface PanelDescriptor {
  data: NavigationNode;
  path: string[];
}

/** Props for the MultiViewPanel sub-component. */
export interface MultiViewPanelProps {
  /** Ordered list of panels from root to the active node. */
  panels: PanelDescriptor[];
  /** Called when a child item is clicked. Receives the panel index the click originated from. */
  onNavigateToChild: (childId: string, fromPanelIndex: number) => void;
  /** The current full path — used to highlight active items. */
  currentPath: string[];
  /** Render custom content for leaf nodes (no children). Receives the node and its path. */
  renderLeafContent?: (node: NavigationNode, path: string[]) => ReactNode;
  /** Icon for the drillable-item chevron. */
  chevronIcon?: ReactNode;
  /** Max visible panels. Enables carousel when panels exceed this. */
  maxOpenPanels?: number;
  /** The full navigation tree root — used for searching all nodes. */
  rootData: NavigationNode;
  /** Called to navigate to a specific path (from jump-to search). */
  onNavigateToPath?: (path: string[]) => void;
  /** Controlled: whether the jump-to search panel is open. */
  jumpToOpen?: boolean;
  /** Called when jump-to open state changes (for controlled mode). */
  onJumpToOpenChange?: (open: boolean) => void;
  /** CSS class escape hatch. */
  className?: string;
}
