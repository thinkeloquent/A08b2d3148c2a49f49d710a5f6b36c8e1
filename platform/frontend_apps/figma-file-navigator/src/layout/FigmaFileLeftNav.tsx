/**
 * Left nav panel block for the Figma File Navigator app.
 * Renders HierarchicalNavigation from @internal/hierarchical-navigation,
 * converting the app's FileNode tree data into NavigationNode format.
 */

import { useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { HierarchicalNavigation } from '@internal/hierarchical-navigation';
import type { NavigationNode } from '@internal/hierarchical-navigation';
import type { BaseBlockProps } from '@internal/page-menu-offcanvas-template-layout';
import { useFileTree } from '@/components/FileTreeContext';

/* ─── Built-in type icons (match the canvas icons) ─── */

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

/* ─── FileNode → NavigationNode adapter ─── */

import type { FileNode } from '@/types';

function convertToNavNode(node: FileNode): NavigationNode {
  return {
    id: node.id,
    title: node.name,
    icon: <span style={{ color: node.color }}>{typeIcon(node.type || 'file', 16)}</span>,
    children: node.children?.map(convertToNavNode),
  };
}

function fileNodesToNavigation(nodes: FileNode[]): NavigationNode {
  if (nodes.length === 1) return convertToNavNode(nodes[0]);
  return {
    id: '__root__',
    title: 'Root',
    children: nodes.map(convertToNavNode),
  };
}

export function FigmaFileLeftNav(_props: BaseBlockProps) {
  const { nodes, focusOnNode, selectedNavPath } = useFileTree();

  const navData = useMemo(() => fileNodesToNavigation(nodes), [nodes]);

  const controlledNavPath = useMemo(() => {
    if (!selectedNavPath.length) return undefined;
    if (nodes.length === 1) return selectedNavPath;
    return ['__root__', ...selectedNavPath];
  }, [selectedNavPath, nodes.length]);

  const handleSelect = useCallback(
    (node: NavigationNode) => {
      focusOnNode(node.id);
    },
    [focusOnNode],
  );

  const handlePathChange = useCallback(
    (path: string[]) => {
      const lastId = path[path.length - 1];
      if (lastId && lastId !== '__root__') {
        focusOnNode(lastId);
      }
    },
    [focusOnNode],
  );

  return (
    <HierarchicalNavigation
      data={navData}
      title=""
      defaultViewMode="single"
      path={controlledNavPath}
      onPathChange={handlePathChange}
      onSelect={handleSelect}
      maxOpenPanels={3}
      className="h-full"
    />
  );
}
