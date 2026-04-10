/**
 * Auto-layout utility using dagre for graph node positioning.
 * Computes proper left-to-right positions based on graph topology.
 */
import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';

const NODE_WIDTH = 192;
const NODE_HEIGHT = 80;
const SPECIAL_WIDTH = 96;
const SPECIAL_HEIGHT = 48;

const SPECIAL_TYPES = new Set(['START', 'END']);

function getNodeDimensions(node: Node): { width: number; height: number } {
  const nodeType = (node.data as Record<string, unknown>)?.nodeType as string | undefined;
  const isSpecial = nodeType ? SPECIAL_TYPES.has(nodeType) : false;
  return {
    width: isSpecial ? SPECIAL_WIDTH : NODE_WIDTH,
    height: isSpecial ? SPECIAL_HEIGHT : NODE_HEIGHT,
  };
}

/**
 * Apply dagre auto-layout to position nodes in a left-to-right flow.
 * Returns new nodes array with updated positions.
 */
export function applyAutoLayout(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes;

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'LR',
    nodesep: 60,
    ranksep: 120,
    marginx: 40,
    marginy: 40,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes
  for (const node of nodes) {
    const dims = getNodeDimensions(node);
    g.setNode(node.id, { width: dims.width, height: dims.height });
  }

  // Add edges
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  // Run layout
  dagre.layout(g);

  // Apply computed positions (dagre returns center coordinates, ReactFlow uses top-left)
  return nodes.map((node) => {
    const dagreNode = g.node(node.id);
    if (!dagreNode) return node;
    const dims = getNodeDimensions(node);
    return {
      ...node,
      position: {
        x: dagreNode.x - dims.width / 2,
        y: dagreNode.y - dims.height / 2,
      },
    };
  });
}

/**
 * Detect if nodes have significant overlap.
 * Returns true if any two nodes overlap by more than 50% of their area.
 */
export function hasNodeOverlap(nodes: Node[]): boolean {
  if (nodes.length < 2) return false;

  const THRESHOLD = 0.5; // 50% overlap
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    const aDims = getNodeDimensions(a);
    const ax1 = a.position.x;
    const ay1 = a.position.y;
    const ax2 = ax1 + aDims.width;
    const ay2 = ay1 + aDims.height;

    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j];
      const bDims = getNodeDimensions(b);
      const bx1 = b.position.x;
      const by1 = b.position.y;
      const bx2 = bx1 + bDims.width;
      const by2 = by1 + bDims.height;

      // Calculate overlap rectangle
      const overlapX = Math.max(0, Math.min(ax2, bx2) - Math.max(ax1, bx1));
      const overlapY = Math.max(0, Math.min(ay2, by2) - Math.max(ay1, by1));
      const overlapArea = overlapX * overlapY;

      if (overlapArea > 0) {
        const smallerArea = Math.min(aDims.width * aDims.height, bDims.width * bDims.height);
        if (overlapArea / smallerArea > THRESHOLD) return true;
      }
    }
  }
  return false;
}

/**
 * Find an open position for a new node that doesn't overlap existing nodes.
 */
export function findOpenPosition(
  existingNodes: Node[],
  preferredX: number,
  preferredY: number,
): { x: number; y: number } {
  if (existingNodes.length === 0) return { x: preferredX, y: preferredY };

  const PADDING = 30;
  let x = preferredX;
  let y = preferredY;

  // Try up to 20 positions in a spiral pattern
  for (let attempt = 0; attempt < 20; attempt++) {
    let overlaps = false;
    for (const node of existingNodes) {
      const dims = getNodeDimensions(node);
      const dx = Math.abs(x - node.position.x);
      const dy = Math.abs(y - node.position.y);
      if (dx < dims.width + PADDING && dy < dims.height + PADDING) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) return { x, y };

    // Spiral outward: right, then down
    if (attempt % 2 === 0) {
      x += NODE_WIDTH + PADDING;
    } else {
      x = preferredX;
      y += NODE_HEIGHT + PADDING;
    }
  }
  return { x, y };
}
