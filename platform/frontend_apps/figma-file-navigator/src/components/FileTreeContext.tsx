/**
 * Shared context for the file tree data and selection state.
 * Consumed by both the LeftNav (HierarchicalNavigation) and the Canvas.
 */

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { FileNode, FlatNode, NodePosition } from '@/types';

/* ─── tree helpers ─── */

export function flattenTree(
  nodes: FileNode[],
  parent: string | null = null,
  depth = 0,
): FlatNode[] {
  let out: FlatNode[] = [];
  for (const n of nodes) {
    out.push({
      id: n.id,
      name: n.name,
      type: n.type,
      figmaType: n.figmaType,
      color: n.color,
      parent,
      depth,
      childCount: n.children?.length || 0,
    });
    if (n.children)
      out = out.concat(flattenTree(n.children, n.id, depth + 1));
  }
  return out;
}

export function getAncestors(flat: FlatNode[], id: string): string[] {
  const anc: string[] = [];
  let cur = flat.find((n) => n.id === id);
  while (cur?.parent) {
    anc.push(cur.parent);
    cur = flat.find((n) => n.id === cur!.parent);
  }
  return anc;
}

/** Build path from root to a given node (inclusive). Returns [root, ..., id]. */
export function getPathToNode(flat: FlatNode[], id: string): string[] {
  const path: string[] = [id];
  let cur = flat.find((n) => n.id === id);
  while (cur?.parent) {
    path.unshift(cur.parent);
    cur = flat.find((n) => n.id === cur!.parent);
  }
  return path;
}

export function getDescendants(flat: FlatNode[], id: string): string[] {
  const desc: string[] = [];
  const queue = flat.filter((n) => n.parent === id).map((n) => n.id);
  while (queue.length) {
    const cur = queue.shift()!;
    desc.push(cur);
    flat.filter((n) => n.parent === cur).forEach((n) => queue.push(n.id));
  }
  return desc;
}

export function computeLayout(
  nodes: FileNode[],
  flat: FlatNode[],
  cardW: number,
  cardH: number,
  hGap: number,
  vGap: number,
): Record<string, NodePosition> {
  const positions: Record<string, NodePosition> = {};

  const computeSubtree = (
    nodeId: string,
    x: number,
    y: number,
  ): { w: number; h: number } => {
    const children = flat.filter((n) => n.parent === nodeId);
    positions[nodeId] = { x, y, w: cardW, h: cardH };

    if (!children.length) return { w: cardW, h: cardH };

    const childX = x + cardW + hGap;
    let childY = y;
    let totalH = 0;
    const childDims: { w: number; h: number }[] = [];

    for (const child of children) {
      const dim = computeSubtree(child.id, childX, childY);
      childDims.push(dim);
      childY += dim.h + vGap;
      totalH += dim.h + vGap;
    }
    totalH -= vGap;

    if (totalH > cardH) {
      positions[nodeId].y = y + (totalH - cardH) / 2;
    }

    return {
      w: cardW + hGap + Math.max(...childDims.map((d) => d.w)),
      h: Math.max(cardH, totalH),
    };
  };

  let startY = 60;
  for (const root of nodes) {
    computeSubtree(root.id, 60, startY);
    startY += 500;
  }

  return positions;
}

/* ─── Context ─── */

interface FileTreeContextValue {
  fileKey: string;
  nodes: FileNode[];
  flat: FlatNode[];
  positions: Record<string, NodePosition>;
  selected: string | null;
  selectedNavPath: string[];
  traversalPath: string[];
  focusOnNode: (id: string) => void;
  selectNode: (id: string) => void;
  zoom: number;
  setZoom: (z: number | ((prev: number) => number)) => void;
  pan: { x: number; y: number };
  setPan: (p: { x: number; y: number }) => void;
  hovered: string | null;
  setHovered: (id: string | null) => void;
  resetView: () => void;
  clearSelection: () => void;
}

const FileTreeContext = createContext<FileTreeContextValue | null>(null);

export function useFileTree() {
  const ctx = useContext(FileTreeContext);
  if (!ctx) throw new Error('useFileTree must be used within FileTreeProvider');
  return ctx;
}

const BASE_PATH = '/apps/figma-file-navigator';

interface FileTreeProviderProps {
  fileKey: string;
  nodes: FileNode[];
  initialNodeId?: string;
  initialZoom?: number;
  layoutConfig?: { cardWidth?: number; cardHeight?: number; horizontalGap?: number; verticalGap?: number };
  children: ReactNode;
}

export function FileTreeProvider({
  fileKey,
  nodes,
  initialNodeId,
  initialZoom = 0.82,
  layoutConfig,
  children,
}: FileTreeProviderProps) {
  const cardW = layoutConfig?.cardWidth ?? 180;
  const cardH = layoutConfig?.cardHeight ?? 48;
  const hGap = layoutConfig?.horizontalGap ?? 48;
  const vGap = layoutConfig?.verticalGap ?? 16;

  const flat = useMemo(() => flattenTree(nodes), [nodes]);
  const positions = useMemo(
    () => computeLayout(nodes, flat, cardW, cardH, hGap, vGap),
    [nodes, flat, cardW, cardH, hGap, vGap],
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [traversalPath, setTraversalPath] = useState<string[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const selectedNavPath = useMemo(
    () => (selected ? getPathToNode(flat, selected) : []),
    [flat, selected],
  );

  const selectNode = useCallback(
    (id: string) => {
      setSelected(id);
      setTraversalPath(getDescendants(flat, id));
      // Update URL with node id
      const url = `${BASE_PATH}/${encodeURIComponent(fileKey)}/${encodeURIComponent(id)}`;
      window.history.replaceState(null, '', url);
    },
    [flat, fileKey],
  );

  const focusOnNode = useCallback(
    (id: string) => {
      const pos = positions[id];
      if (!pos) return;
      setPan({ x: -(pos.x * zoom) + 400, y: -(pos.y * zoom) + 300 });
      selectNode(id);
    },
    [positions, zoom, selectNode],
  );

  // Restore initial node from URL on mount
  const didRestoreRef = useRef(false);
  useEffect(() => {
    if (didRestoreRef.current || !initialNodeId) return;
    const pos = positions[initialNodeId];
    if (pos) {
      didRestoreRef.current = true;
      focusOnNode(initialNodeId);
    }
  }, [initialNodeId, positions, focusOnNode]);

  const resetView = useCallback(() => {
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
  }, [initialZoom]);

  const clearSelection = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(initialZoom);
    setSelected(null);
    setTraversalPath([]);
    // Reset URL to file-only
    window.history.replaceState(null, '', `${BASE_PATH}/${encodeURIComponent(fileKey)}`);
  }, [initialZoom, fileKey]);

  const value = useMemo<FileTreeContextValue>(
    () => ({
      fileKey,
      nodes,
      flat,
      positions,
      selected,
      selectedNavPath,
      traversalPath,
      focusOnNode,
      selectNode,
      zoom,
      setZoom,
      pan,
      setPan,
      hovered,
      setHovered,
      resetView,
      clearSelection,
    }),
    [fileKey, nodes, flat, positions, selected, selectedNavPath, traversalPath, focusOnNode, selectNode, zoom, pan, hovered, resetView, clearSelection],
  );

  return (
    <FileTreeContext.Provider value={value}>
      {children}
    </FileTreeContext.Provider>
  );
}
