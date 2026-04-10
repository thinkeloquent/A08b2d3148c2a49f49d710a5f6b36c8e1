import { useState, useCallback, useRef, useEffect, useMemo, Fragment } from 'react';
import type { ReactNode } from 'react';
import type {
  FigmaHierarchicalNodeNavigatorProps,
  TreeNode,
  FlatNode,
  NodePosition,
} from './types';

/* ─── built-in icon primitives (zero deps) ─── */

const SvgIcon = ({
  d,
  size = 16,
  stroke = 'currentColor',
  fill = 'none',
  sw = 1.8,
}: {
  d: ReactNode;
  size?: number;
  stroke?: string;
  fill?: string;
  sw?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

const BuiltInIcons = {
  chevronRight: (size: number) => <SvgIcon size={size} d="M9 18l6-6-6-6" />,
  chevronDown: (size: number) => <SvgIcon size={size} d="M6 9l6 6 6-6" />,
  file: (size: number) => (
    <SvgIcon
      size={size}
      d={
        <>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </>
      }
    />
  ),
  component: (size: number) => (
    <SvgIcon
      size={size}
      d={
        <>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </>
      }
    />
  ),
  frame: (size: number) => (
    <SvgIcon
      size={size}
      d={
        <>
          <line x1="6" y1="3" x2="6" y2="21" />
          <line x1="18" y1="3" x2="18" y2="21" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </>
      }
    />
  ),
  circle: (size: number) => (
    <SvgIcon size={size} d={<circle cx="12" cy="12" r="10" />} />
  ),
  star: (size: number) => (
    <SvgIcon
      size={size}
      d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
    />
  ),
  search: (size: number) => (
    <SvgIcon
      size={size}
      d={
        <>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </>
      }
    />
  ),
  eye: (size: number) => (
    <SvgIcon
      size={size}
      d={
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      }
    />
  ),
  eyeOff: (size: number) => (
    <SvgIcon
      size={size}
      d={
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      }
    />
  ),
  zoomIn: (size: number) => (
    <SvgIcon
      size={size}
      d={
        <>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </>
      }
    />
  ),
  zoomOut: (size: number) => (
    <SvgIcon
      size={size}
      d={
        <>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </>
      }
    />
  ),
  crosshair: (size: number) => (
    <SvgIcon
      size={size}
      d={
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="22" y1="12" x2="18" y2="12" />
          <line x1="6" y1="12" x2="2" y2="12" />
          <line x1="12" y1="6" x2="12" y2="2" />
          <line x1="12" y1="22" x2="12" y2="18" />
        </>
      }
    />
  ),
  layers: (size: number, stroke?: string) => (
    <SvgIcon
      size={size}
      stroke={stroke}
      d={
        <>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </>
      }
    />
  ),
};

const defaultRenderNodeIcon = (type: string, size: number): ReactNode => {
  switch (type) {
    case 'frame':
      return BuiltInIcons.frame(size);
    case 'component':
      return BuiltInIcons.component(size);
    case 'circle':
      return BuiltInIcons.circle(size);
    case 'star':
      return BuiltInIcons.star(size);
    default:
      return BuiltInIcons.file(size);
  }
};

/* ─── tree helpers ─── */

const flattenTree = (
  nodes: TreeNode[],
  parent: string | null = null,
  depth = 0,
): FlatNode[] => {
  let out: FlatNode[] = [];
  for (const n of nodes) {
    out.push({
      id: n.id,
      name: n.name,
      type: n.type,
      color: n.color,
      parent,
      depth,
      childCount: n.children?.length || 0,
    });
    if (n.children)
      out = out.concat(flattenTree(n.children, n.id, depth + 1));
  }
  return out;
};

const getAncestors = (flat: FlatNode[], id: string): string[] => {
  const anc: string[] = [];
  let cur = flat.find((n) => n.id === id);
  while (cur?.parent) {
    anc.push(cur.parent);
    cur = flat.find((n) => n.id === cur!.parent);
  }
  return anc;
};

const getDescendants = (flat: FlatNode[], id: string): string[] => {
  const desc: string[] = [];
  const queue = flat.filter((n) => n.parent === id).map((n) => n.id);
  while (queue.length) {
    const cur = queue.shift()!;
    desc.push(cur);
    flat.filter((n) => n.parent === cur).forEach((n) => queue.push(n.id));
  }
  return desc;
};

/* ─── layout computation ─── */

const computeLayout = (
  nodes: TreeNode[],
  flat: FlatNode[],
  cardW: number,
  cardH: number,
  hGap: number,
  vGap: number,
): Record<string, NodePosition> => {
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
};

/* ─── main component ─── */

export function FigmaHierarchicalNodeNavigator({
  nodes,
  selectedId: controlledSelectedId,
  onSelectNode,
  onVisibilityChange,
  renderNodeIcon,
  panelTitle = 'Layers',
  panelIcon,
  searchPlaceholder = 'Search layers\u2026',
  initialZoom = 0.82,
  defaultExpandAll = true,
  layoutConfig,
  className,
}: FigmaHierarchicalNodeNavigatorProps) {
  const cardW = layoutConfig?.cardWidth ?? 180;
  const cardH = layoutConfig?.cardHeight ?? 48;
  const hGap = layoutConfig?.horizontalGap ?? 48;
  const vGap = layoutConfig?.verticalGap ?? 16;

  const typeIcon = renderNodeIcon ?? defaultRenderNodeIcon;

  const flat = useMemo(() => flattenTree(nodes), [nodes]);
  const positions = useMemo(
    () => computeLayout(nodes, flat, cardW, cardH, hGap, vGap),
    [nodes, flat, cardW, cardH, hGap, vGap],
  );

  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selected = controlledSelectedId !== undefined ? controlledSelectedId : internalSelected;

  const [hovered, setHovered] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    if (!defaultExpandAll) return new Set<string>();
    const set = new Set<string>();
    flat.filter((n) => n.childCount > 0).forEach((n) => set.add(n.id));
    return set;
  });
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrig = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [traversalPath, setTraversalPath] = useState<string[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleVisibility = useCallback(
    (id: string) => {
      setHidden((prev) => {
        const next = new Set(prev);
        const wasHidden = next.has(id);
        wasHidden ? next.delete(id) : next.add(id);
        onVisibilityChange?.(id, !wasHidden);
        return next;
      });
    },
    [onVisibilityChange],
  );

  const selectNode = useCallback(
    (id: string) => {
      setInternalSelected(id);
      onSelectNode?.(id);
      const ancestors = getAncestors(flat, id);
      setBreadcrumbs([...ancestors.reverse(), id]);
      setTraversalPath(getDescendants(flat, id));
      ancestors.forEach((a) => setExpanded((p) => new Set([...p, a])));
    },
    [flat, onSelectNode],
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

  /* canvas pan */
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (
      e.target === canvasRef.current ||
      (e.target as HTMLElement).classList.contains('canvas-bg')
    ) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      panOrig.current = { ...pan };
    }
  };
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: panOrig.current.x + (e.clientX - panStart.current.x),
      y: panOrig.current.y + (e.clientY - panStart.current.y),
    });
  };
  const handleCanvasMouseUp = () => setIsPanning(false);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.06 : 0.06;
      setZoom((z) => Math.max(0.2, Math.min(2.5, z + delta)));
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const filteredFlat = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return flat.filter((n) => n.name.toLowerCase().includes(q));
  }, [flat, searchQuery]);

  const isVisible = (node: FlatNode) => {
    if (!expanded.has(node.parent!) && node.parent) return false;
    let cur = flat.find((n) => n.id === node.parent);
    while (cur) {
      if (!expanded.has(cur.id)) return false;
      cur = flat.find((n) => n.id === cur!.parent);
    }
    return true;
  };

  const allPositionValues = useMemo(() => Object.values(positions), [positions]);
  const canvasBounds = useMemo(() => {
    if (!allPositionValues.length)
      return { minX: 0, minY: 0, maxX: 1000, maxY: 600 };
    return {
      minX: Math.min(...allPositionValues.map((p) => p.x)) - 40,
      minY: Math.min(...allPositionValues.map((p) => p.y)) - 40,
      maxX: Math.max(...allPositionValues.map((p) => p.x + p.w)) + 40,
      maxY: Math.max(...allPositionValues.map((p) => p.y + p.h)) + 40,
    };
  }, [allPositionValues]);

  const ancestors = selected ? getAncestors(flat, selected) : [];
  const highlightSet = new Set([
    ...(selected ? [selected] : []),
    ...ancestors,
    ...traversalPath,
  ]);

  const rootClass = ['w-full h-screen flex bg-slate-50 overflow-hidden', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClass}
      style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}
    >
      {/* ─── left: layers panel ─── */}
      <div
        className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-sm"
        style={{ minWidth: 280 }}
      >
        {/* panel header */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              {panelIcon ?? BuiltInIcons.layers(14, '#fff')}
            </div>
            <span className="text-sm font-semibold text-slate-800 tracking-tight">
              {panelTitle}
            </span>
            <span className="ml-auto text-xs text-slate-400 font-medium">
              {flat.length} nodes
            </span>
          </div>
          <div className="relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              {BuiltInIcons.search(13)}
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        </div>

        {/* layer tree */}
        <div className="flex-1 overflow-y-auto py-1 figma-nav-scroll">
          {(filteredFlat || flat).map((node) => {
            if (!filteredFlat && !isVisible(node)) return null;
            const isSelected = selected === node.id;
            const isHover = hovered === node.id;
            const isInPath = highlightSet.has(node.id);
            const isHiddenNode = hidden.has(node.id);
            const hasChildren = node.childCount > 0;
            const isExpanded = expanded.has(node.id);
            const depth = filteredFlat ? 0 : node.depth;

            return (
              <div
                key={node.id}
                className="group relative"
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  onClick={() => selectNode(node.id)}
                  className="flex items-center h-8 cursor-pointer transition-all duration-100"
                  style={{
                    paddingLeft: 12 + depth * 18,
                    background: isSelected
                      ? 'linear-gradient(90deg, #eef2ff 0%, #e0e7ff 100%)'
                      : isHover
                        ? '#f8fafc'
                        : isInPath && !isSelected
                          ? '#fefce8'
                          : 'transparent',
                    borderRight: isSelected
                      ? '2px solid #6366f1'
                      : '2px solid transparent',
                  }}
                >
                  {/* expand toggle */}
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mr-1">
                    {hasChildren ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(node.id);
                        }}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {isExpanded
                          ? BuiltInIcons.chevronDown(12)
                          : BuiltInIcons.chevronRight(12)}
                      </button>
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                    )}
                  </div>

                  {/* type icon */}
                  <span
                    className="flex-shrink-0 mr-2"
                    style={{ color: node.color }}
                  >
                    {typeIcon(node.type || 'file', 13)}
                  </span>

                  {/* name */}
                  <span
                    className={[
                      'text-xs truncate flex-1',
                      isSelected
                        ? 'font-semibold text-indigo-900'
                        : isHiddenNode
                          ? 'text-slate-400 line-through'
                          : 'text-slate-700',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {node.name}
                  </span>

                  {/* actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(node.id);
                      }}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {isHiddenNode
                        ? BuiltInIcons.eyeOff(12)
                        : BuiltInIcons.eye(12)}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        focusOnNode(node.id);
                      }}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {BuiltInIcons.crosshair(12)}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* panel footer: breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="px-3 py-2.5 border-t border-slate-100 bg-slate-50">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Traversal Path
            </div>
            <div className="flex items-center flex-wrap gap-1">
              {breadcrumbs.map((id, i) => {
                const n = flat.find((f) => f.id === id);
                return (
                  <Fragment key={id}>
                    {i > 0 && (
                      <span className="text-slate-300 text-[10px]">
                        &#x203A;
                      </span>
                    )}
                    <button
                      onClick={() => focusOnNode(id)}
                      className="text-[11px] px-1.5 py-0.5 rounded-md transition-colors"
                      style={{
                        background: id === selected ? '#6366f1' : '#f1f5f9',
                        color: id === selected ? '#fff' : '#475569',
                      }}
                    >
                      {n?.name}
                    </button>
                  </Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── right: canvas ─── */}
      <div className="flex-1 flex flex-col relative">
        {/* toolbar */}
        <div className="h-11 bg-white border-b border-slate-200 flex items-center px-4 gap-2 shadow-sm z-10">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-600 transition-colors"
            >
              {BuiltInIcons.zoomIn(14)}
            </button>
            <span className="text-xs text-slate-600 font-medium w-12 text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(0.2, z - 0.15))}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-600 transition-colors"
            >
              {BuiltInIcons.zoomOut(14)}
            </button>
          </div>
          <div className="w-px h-5 bg-slate-200" />
          <button
            onClick={() => {
              setZoom(initialZoom);
              setPan({ x: 0, y: 0 });
            }}
            className="h-7 px-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1.5"
          >
            {BuiltInIcons.crosshair(13)} Reset
          </button>
          <button
            onClick={() => {
              setPan({ x: 0, y: 0 });
              setZoom(initialZoom);
              setInternalSelected(null);
              setTraversalPath([]);
              setBreadcrumbs([]);
            }}
            className="h-7 px-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            Clear Selection
          </button>
          <div className="flex-1" />
          {selected && (() => {
            const selNode = flat.find((n) => n.id === selected);
            if (!selNode) return null;
            return (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">
                  {selNode.name}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-semibold uppercase">
                  {selNode.type}
                </span>
              </div>
            );
          })()}
        </div>

        {/* canvas area */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden"
          style={{
            cursor: isPanning ? 'grabbing' : 'grab',
            background:
              'radial-gradient(circle at 50% 50%, #f8fafc 0%, #f1f5f9 100%)',
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          {/* dot grid */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none canvas-bg"
            style={{ opacity: 0.5 }}
          >
            <defs>
              <pattern
                id="dotGrid"
                width={20 * zoom}
                height={20 * zoom}
                patternUnits="userSpaceOnUse"
                x={pan.x % (20 * zoom)}
                y={pan.y % (20 * zoom)}
              >
                <circle cx="1" cy="1" r="0.8" fill="#cbd5e1" />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#dotGrid)"
              className="canvas-bg"
            />
          </svg>

          {/* transformed layer */}
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              willChange: 'transform',
            }}
          >
            {/* connection lines */}
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              style={{
                width: canvasBounds.maxX + 200,
                height: canvasBounds.maxY + 200,
                overflow: 'visible',
              }}
            >
              {flat
                .filter(
                  (n) => n.parent && positions[n.parent] && positions[n.id],
                )
                .map((node) => {
                  const parentPos = positions[node.parent!];
                  const childPos = positions[node.id];
                  const x1 = parentPos.x + parentPos.w;
                  const y1 = parentPos.y + parentPos.h / 2;
                  const x2 = childPos.x;
                  const y2 = childPos.y + childPos.h / 2;
                  const midX = (x1 + x2) / 2;
                  const isHighlight =
                    highlightSet.has(node.id) &&
                    highlightSet.has(node.parent!);
                  return (
                    <path
                      key={`edge-${node.id}`}
                      d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke={isHighlight ? '#6366f1' : '#e2e8f0'}
                      strokeWidth={isHighlight ? 2 : 1.2}
                      opacity={hidden.has(node.id) ? 0.2 : 1}
                      style={{
                        transition: 'stroke 0.2s, stroke-width 0.2s',
                      }}
                    />
                  );
                })}
            </svg>

            {/* node cards */}
            {flat.map((node) => {
              const pos = positions[node.id];
              if (!pos) return null;
              const isNodeSelected = selected === node.id;
              const isNodeHovered = hovered === node.id;
              const isInTraversal = traversalPath.includes(node.id);
              const isAncestor = ancestors.includes(node.id);
              const isHiddenNode = hidden.has(node.id);

              let borderColor = '#e2e8f0';
              let bgColor = '#ffffff';
              let shadowStyle = '0 1px 3px rgba(0,0,0,0.06)';
              if (isNodeSelected) {
                borderColor = '#6366f1';
                bgColor = '#eef2ff';
                shadowStyle =
                  '0 0 0 2px rgba(99,102,241,0.25), 0 4px 12px rgba(99,102,241,0.15)';
              } else if (isInTraversal) {
                borderColor = '#a5b4fc';
                bgColor = '#f5f3ff';
                shadowStyle = '0 0 0 1px rgba(165,180,252,0.4)';
              } else if (isAncestor) {
                borderColor = '#fbbf24';
                bgColor = '#fffbeb';
                shadowStyle = '0 0 0 1px rgba(251,191,36,0.3)';
              } else if (isNodeHovered) {
                borderColor = '#94a3b8';
                shadowStyle = '0 2px 8px rgba(0,0,0,0.08)';
              }

              return (
                <div
                  key={node.id}
                  className="absolute flex items-center gap-2.5 px-3 rounded-xl cursor-pointer select-none"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    width: pos.w,
                    height: pos.h,
                    background: bgColor,
                    border: `1.5px solid ${borderColor}`,
                    boxShadow: shadowStyle,
                    opacity: isHiddenNode ? 0.35 : 1,
                    transition:
                      'border-color 0.15s, background 0.15s, box-shadow 0.15s, opacity 0.15s',
                    zIndex: isNodeSelected ? 20 : isNodeHovered ? 10 : 1,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectNode(node.id);
                  }}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span
                    className="flex-shrink-0"
                    style={{ color: node.color }}
                  >
                    {typeIcon(node.type || 'file', 15)}
                  </span>
                  <span className="text-[11px] font-medium text-slate-700 truncate">
                    {node.name}
                  </span>
                  {node.childCount > 0 && (
                    <span className="ml-auto text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-semibold">
                      {node.childCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* minimap */}
          <div
            className="absolute bottom-4 right-4 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm shadow-lg overflow-hidden"
            style={{ width: 180, height: 120 }}
          >
            <div className="absolute top-0 left-0 right-0 h-5 bg-slate-50 border-b border-slate-100 flex items-center px-2">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                Mini Map
              </span>
            </div>
            <svg
              viewBox={`${canvasBounds.minX - 20} ${canvasBounds.minY - 20} ${canvasBounds.maxX - canvasBounds.minX + 40} ${canvasBounds.maxY - canvasBounds.minY + 40}`}
              className="w-full h-full"
              style={{ paddingTop: 20 }}
            >
              {flat
                .filter(
                  (n) => n.parent && positions[n.parent] && positions[n.id],
                )
                .map((node) => {
                  const parentPos = positions[node.parent!];
                  const childPos = positions[node.id];
                  return (
                    <line
                      key={`mm-${node.id}`}
                      x1={parentPos.x + parentPos.w / 2}
                      y1={parentPos.y + parentPos.h / 2}
                      x2={childPos.x + childPos.w / 2}
                      y2={childPos.y + childPos.h / 2}
                      stroke="#e2e8f0"
                      strokeWidth={4}
                    />
                  );
                })}
              {flat.map((node) => {
                const pos = positions[node.id];
                if (!pos) return null;
                const isNodeSelected = selected === node.id;
                return (
                  <rect
                    key={`mm-n-${node.id}`}
                    x={pos.x}
                    y={pos.y}
                    width={pos.w}
                    height={pos.h}
                    rx={6}
                    fill={
                      isNodeSelected
                        ? '#6366f1'
                        : node.color || '#94a3b8'
                    }
                    opacity={isNodeSelected ? 1 : 0.4}
                  />
                );
              })}
            </svg>
          </div>

          {/* info badge */}
          {selected &&
            (() => {
              const node = flat.find((n) => n.id === selected);
              const pos = positions[selected];
              if (!node || !pos) return null;
              return (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: pan.x + (pos.x + pos.w / 2) * zoom,
                    top: pan.y + (pos.y - 8) * zoom,
                    transform: 'translate(-50%, -100%)',
                    zIndex: 50,
                  }}
                >
                  <div className="bg-slate-800 text-white text-[10px] font-medium px-2.5 py-1 rounded-lg shadow-xl flex items-center gap-2 whitespace-nowrap">
                    <span style={{ color: node.color }}>
                      {typeIcon(node.type || 'file', 11)}
                    </span>
                    {node.name}
                    {node.childCount > 0 && (
                      <span className="text-indigo-300">
                        {node.childCount} children
                      </span>
                    )}
                  </div>
                  <div className="w-2 h-2 bg-slate-800 rotate-45 mx-auto -mt-1" />
                </div>
              );
            })()}
        </div>
      </div>

      <style>{`
        .figma-nav-scroll::-webkit-scrollbar { width: 5px; }
        .figma-nav-scroll::-webkit-scrollbar-track { background: transparent; }
        .figma-nav-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        .figma-nav-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
