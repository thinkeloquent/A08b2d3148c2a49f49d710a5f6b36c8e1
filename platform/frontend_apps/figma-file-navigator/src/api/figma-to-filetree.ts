/**
 * Converts Figma API node structure to the app's FileNode tree format.
 */

import type { FigmaNode } from './figma';
import type { FileNode } from '@/types';

/** Map Figma node types to our simplified type system. */
function mapNodeType(figmaType: string): string {
  switch (figmaType) {
    case 'DOCUMENT':
    case 'CANVAS':
    case 'FRAME':
    case 'GROUP':
    case 'SECTION':
      return 'frame';
    case 'COMPONENT':
    case 'COMPONENT_SET':
      return 'component';
    case 'INSTANCE':
      return 'component';
    case 'ELLIPSE':
      return 'circle';
    case 'STAR':
    case 'REGULAR_POLYGON':
      return 'star';
    case 'TEXT':
    case 'RECTANGLE':
    case 'LINE':
    case 'VECTOR':
    case 'BOOLEAN_OPERATION':
    case 'SLICE':
    default:
      return 'file';
  }
}

/** Depth-based color palette for visual hierarchy. */
const DEPTH_COLORS = [
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#3b82f6', // blue-500
  '#0ea5e9', // sky-500
  '#14b8a6', // teal-500
  '#22c55e', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#ec4899', // pink-500
  '#64748b', // slate-500
];

function colorForDepth(depth: number): string {
  return DEPTH_COLORS[depth % DEPTH_COLORS.length];
}

/** Extract a hex color from Figma fill data. */
function extractColor(node: FigmaNode, depth: number): string {
  if (node.fills?.length) {
    const solidFill = node.fills.find((f) => f.type === 'SOLID' && f.color);
    if (solidFill?.color) {
      const { r, g, b } = solidFill.color;
      const toHex = (v: number) =>
        Math.round(v * 255)
          .toString(16)
          .padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
  }
  return colorForDepth(depth);
}

/** Convert a Figma node tree into FileNode tree. */
export function figmaNodeToFileNode(node: FigmaNode, depth = 0): FileNode {
  const fileNode: FileNode = {
    id: node.id,
    name: node.name,
    type: mapNodeType(node.type),
    figmaType: node.type,
    color: extractColor(node, depth),
  };

  if (node.children?.length) {
    fileNode.children = node.children
      .filter((child) => child.visible !== false)
      .map((child) => figmaNodeToFileNode(child, depth + 1));
  }

  return fileNode;
}

/** Convert a full Figma document into FileNode[] (one per page/canvas). */
export function figmaDocumentToFileNodes(document: FigmaNode): FileNode[] {
  if (!document.children?.length) return [];

  // Document children are pages (CANVAS nodes)
  return document.children
    .filter((child) => child.visible !== false)
    .map((child) => figmaNodeToFileNode(child, 0));
}
