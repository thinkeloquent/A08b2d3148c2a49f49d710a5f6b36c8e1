/**
 * Left navigation panel using react-arborist tree view.
 * Bidirectional sync: clicking a tree node focuses the canvas,
 * clicking a canvas node selects + scrolls the tree.
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Tree, type NodeRendererProps, type TreeApi } from 'react-arborist';
import { useFileTree } from './FileTreeContext';
import type { FileNode } from '@/types';

/* ─── Icons ─── */

const SvgIcon = ({
  d,
  size = 14,
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

function typeIcon(type: string, size: number): ReactNode {
  switch (type) {
    case 'frame':
      return (
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
      );
    case 'component':
      return (
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
      );
    case 'circle':
      return <SvgIcon size={size} d={<circle cx="12" cy="12" r="10" />} />;
    case 'star':
      return (
        <SvgIcon
          size={size}
          d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
        />
      );
    default:
      return (
        <SvgIcon
          size={size}
          d={
            <>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </>
          }
        />
      );
  }
}

/* ─── Chevron ─── */

function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* ─── Node renderer ─── */

function NodeRow({ node, style, dragHandle }: NodeRendererProps<FileNode>) {
  const isSelected = node.isSelected;
  const hasChildren = (node.data.children?.length ?? 0) > 0;

  return (
    <div
      ref={dragHandle}
      style={style}
      className={[
        'flex items-center gap-1.5 px-2 py-0.5 cursor-pointer rounded-md mx-1 group',
        'hover:bg-slate-100 transition-colors duration-100',
        isSelected ? 'bg-indigo-50 ring-1 ring-indigo-200' : '',
      ].join(' ')}
      onClick={(e) => {
        e.stopPropagation();
        node.select();
        if (hasChildren) node.toggle();
      }}
    >
      {/* indent spacer */}
      <span style={{ width: node.level * 12 }} className="flex-shrink-0" />

      {/* expand/collapse chevron */}
      <span className="w-3 flex-shrink-0 flex items-center justify-center">
        {hasChildren ? <Chevron isOpen={node.isOpen} /> : null}
      </span>

      {/* type icon */}
      <span className="flex-shrink-0" style={{ color: node.data.color }}>
        {typeIcon(node.data.type || 'file', 14)}
      </span>

      {/* name */}
      <span
        className={[
          'text-[12px] truncate',
          isSelected ? 'font-semibold text-indigo-700' : 'text-slate-700',
        ].join(' ')}
      >
        {node.data.name}
      </span>

      {/* child count badge */}
      {hasChildren && (
        <span className="ml-auto text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full font-medium group-hover:bg-slate-200">
          {node.data.children!.length}
        </span>
      )}
    </div>
  );
}

/* ─── Tree panel ─── */

export function FileTreeNavigation() {
  const { nodes, selected, focusOnNode } = useFileTree();
  const treeRef = useRef<TreeApi<FileNode> | null>(null);
  const isSyncingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas → Tree sync: when canvas selection changes, scroll tree to that node
  useEffect(() => {
    if (!selected || !treeRef.current) return;
    const tree = treeRef.current;
    const treeNode = tree.get(selected);
    if (!treeNode) return;

    // Open all ancestors so the node is visible
    let parent = treeNode.parent;
    while (parent) {
      if (!parent.isOpen) parent.open();
      parent = parent.parent;
    }

    // Select and scroll
    isSyncingRef.current = true;
    tree.select(selected);
    tree.scrollTo(selected);
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, [selected]);

  // Tree → Canvas sync
  const handleSelect = useCallback(
    (selectedNodes: any[]) => {
      if (isSyncingRef.current) return;
      if (selectedNodes.length > 0) {
        focusOnNode(selectedNodes[0].id);
      }
    },
    [focusOnNode],
  );

  // Measure container height for react-arborist (needs explicit dimensions)
  const [height, setHeight] = useState(600);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-72 flex-shrink-0 border-r border-slate-200 bg-white overflow-hidden flex flex-col"
    >
      <Tree<FileNode>
        ref={treeRef}
        data={nodes}
        width={287}
        height={height}
        rowHeight={28}
        indent={12}
        openByDefault={false}
        disableDrag
        disableDrop
        disableEdit
        selection={selected ?? undefined}
        onSelect={handleSelect}
      >
        {NodeRow}
      </Tree>
    </div>
  );
}
