/**
 * Zoomable / pannable canvas that renders the file tree as node cards
 * with connection lines, a minimap, toolbar, and info badges.
 */

import { useRef, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useFileTree, getAncestors } from './FileTreeContext';

/* ─── icons ─── */

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

const Icons = {
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
};

function typeIcon(type: string, size: number): ReactNode {
  switch (type) {
    case 'frame': return Icons.frame(size);
    case 'component': return Icons.component(size);
    case 'circle': return Icons.circle(size);
    case 'star': return Icons.star(size);
    default: return Icons.file(size);
  }
}

/* ─── Canvas ─── */

export function FigmaCanvas() {
  const {
    flat,
    positions,
    selected,
    traversalPath,
    focusOnNode,
    zoom,
    setZoom,
    pan,
    setPan,
    hovered,
    setHovered,
    resetView,
    clearSelection,
  } = useFileTree();

  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOrigRef = useRef({ x: 0, y: 0 });

  /* wheel zoom */
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.06 : 0.06;
      setZoom((z: number) => Math.max(0.2, Math.min(2.5, z + delta)));
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [setZoom]);

  /* pan handlers */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.target === canvasRef.current ||
      (e.target as HTMLElement).classList.contains('canvas-bg')
    ) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY };
      panOrigRef.current = { ...pan };
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    setPan({
      x: panOrigRef.current.x + (e.clientX - panStartRef.current.x),
      y: panOrigRef.current.y + (e.clientY - panStartRef.current.y),
    });
  };
  const handleMouseUp = () => { isPanningRef.current = false; };

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

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* toolbar */}
      <div className="h-11 bg-white border-b border-slate-200 flex items-center px-4 gap-2 shadow-sm z-10">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setZoom((z: number) => Math.min(2.5, z + 0.15))}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-600 transition-colors"
          >
            {Icons.zoomIn(14)}
          </button>
          <span className="text-xs text-slate-600 font-medium w-12 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z: number) => Math.max(0.2, z - 0.15))}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-600 transition-colors"
          >
            {Icons.zoomOut(14)}
          </button>
        </div>
        <div className="w-px h-5 bg-slate-200" />
        <button
          onClick={resetView}
          className="h-7 px-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1.5"
        >
          {Icons.crosshair(13)} Reset
        </button>
        <button
          onClick={clearSelection}
          className="h-7 px-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
        >
          Clear Selection
        </button>
        <div className="flex-1" />
        {selected &&
          (() => {
            const selNode = flat.find((n) => n.id === selected);
            if (!selNode) return null;
            return (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{selNode.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-semibold uppercase">
                  {selNode.figmaType || selNode.type}
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
          cursor: isPanningRef.current ? 'grabbing' : 'grab',
          background: 'radial-gradient(circle at 50% 50%, #f8fafc 0%, #f1f5f9 100%)',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
          <rect width="100%" height="100%" fill="url(#dotGrid)" className="canvas-bg" />
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
              .filter((n) => n.parent && positions[n.parent] && positions[n.id])
              .map((node) => {
                const parentPos = positions[node.parent!];
                const childPos = positions[node.id];
                const x1 = parentPos.x + parentPos.w;
                const y1 = parentPos.y + parentPos.h / 2;
                const x2 = childPos.x;
                const y2 = childPos.y + childPos.h / 2;
                const midX = (x1 + x2) / 2;
                const isHighlight = highlightSet.has(node.id) && highlightSet.has(node.parent!);
                return (
                  <path
                    key={`edge-${node.id}`}
                    d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={isHighlight ? '#6366f1' : '#e2e8f0'}
                    strokeWidth={isHighlight ? 2 : 1.2}
                    style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
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

            let borderColor = '#e2e8f0';
            let bgColor = '#ffffff';
            let shadowStyle = '0 1px 3px rgba(0,0,0,0.06)';
            if (isNodeSelected) {
              borderColor = '#6366f1';
              bgColor = '#eef2ff';
              shadowStyle = '0 0 0 2px rgba(99,102,241,0.25), 0 4px 12px rgba(99,102,241,0.15)';
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
                  transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                  zIndex: isNodeSelected ? 20 : isNodeHovered ? 10 : 1,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  focusOnNode(node.id);
                }}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="flex-shrink-0" style={{ color: node.color }}>
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
                    <span className="text-indigo-300">{node.childCount} children</span>
                  )}
                </div>
                <div className="w-2 h-2 bg-slate-800 rotate-45 mx-auto -mt-1" />
              </div>
            );
          })()}
      </div>
    </div>
  );
}
