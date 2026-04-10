import type { ReactNode } from 'react';

/** A single node in the hierarchical tree. */
export interface TreeNode {
  /** Unique identifier for this node. */
  id: string;
  /** Display name shown in the layers panel and canvas cards. */
  name: string;
  /** Node type used for icon selection (e.g. "frame", "component", "file", "circle", "star"). */
  type?: string;
  /** Color applied to the node's type icon and minimap representation. */
  color?: string;
  /** Child nodes. Leaf nodes omit this or pass an empty array. */
  children?: TreeNode[];
}

/** Internal flattened representation of a tree node. */
export interface FlatNode {
  id: string;
  name: string;
  type?: string;
  color?: string;
  parent: string | null;
  depth: number;
  childCount: number;
}

/** Position and dimensions of a node card on the canvas. */
export interface NodePosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Canvas layout configuration. */
export interface LayoutConfig {
  /** Width of each node card in pixels. Defaults to 180. */
  cardWidth?: number;
  /** Height of each node card in pixels. Defaults to 48. */
  cardHeight?: number;
  /** Horizontal gap between parent and child columns. Defaults to 48. */
  horizontalGap?: number;
  /** Vertical gap between sibling nodes. Defaults to 16. */
  verticalGap?: number;
}

/** Props for the FigmaHierarchicalNodeNavigator component. */
export interface FigmaHierarchicalNodeNavigatorProps {
  /** The tree data to render. Accepts one or more root nodes. */
  nodes: TreeNode[];
  /** Currently selected node ID (controlled mode). */
  selectedId?: string | null;
  /** Called when a node is selected via the layers panel or canvas. */
  onSelectNode?: (id: string) => void;
  /** Called when a node's visibility is toggled. Receives the node ID and the new hidden state. */
  onVisibilityChange?: (id: string, hidden: boolean) => void;
  /** Custom renderer for node type icons. Receives the node type string and pixel size. Falls back to built-in SVG icons. */
  renderNodeIcon?: (type: string, size: number) => ReactNode;
  /** Title shown in the layers panel header. Defaults to "Layers". */
  panelTitle?: string;
  /** Icon rendered beside the panel title. Accepts any ReactNode. */
  panelIcon?: ReactNode;
  /** Placeholder text for the layers search input. Defaults to "Search layers...". */
  searchPlaceholder?: string;
  /** Initial zoom level for the canvas. Defaults to 0.82. */
  initialZoom?: number;
  /** Whether all parent nodes are expanded by default. Defaults to true. */
  defaultExpandAll?: boolean;
  /** Canvas layout configuration for card sizing and spacing. */
  layoutConfig?: LayoutConfig;
  /** CSS class escape hatch for the outermost wrapper. */
  className?: string;
  /** Additional content rendered inside the component. */
  children?: ReactNode;
}
