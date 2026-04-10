import type { ReactNode } from 'react';

/** A single node in the file tree. */
export interface FileNode {
  /** Unique identifier for this node. */
  id: string;
  /** Display name shown in the navigation panel and canvas cards. */
  name: string;
  /** Node type used for icon selection (e.g. "frame", "component", "file", "circle", "star"). */
  type?: string;
  /** Original Figma node type (e.g. "FRAME", "COMPONENT", "TEXT"). */
  figmaType?: string;
  /** Color applied to the node's type icon and minimap representation. */
  color?: string;
  /** Child nodes. Leaf nodes omit this or pass an empty array. */
  children?: FileNode[];
}

/** Internal flattened representation of a file node. */
export interface FlatNode {
  id: string;
  name: string;
  type?: string;
  figmaType?: string;
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
  cardWidth?: number;
  cardHeight?: number;
  horizontalGap?: number;
  verticalGap?: number;
}
