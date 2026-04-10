import { useState, useCallback, useEffect } from 'react';
import type {
  HierarchicalNavigationProps,
  NavigationNode,
  ViewMode,
  PanelDescriptor,
} from './types';
import { SingleViewPanel } from './SingleViewPanel';
import { MultiViewPanel } from './MultiViewPanel';

const defaultBreadcrumbSeparator = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const defaultSingleViewIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>
);

const defaultMultiViewIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18" />
    <path d="M3 15h18" />
    <path d="M9 3v18" />
    <path d="M15 3v18" />
  </svg>
);

export function HierarchicalNavigation({
  data,
  title = 'Navigation',
  defaultViewMode = 'single',
  defaultPath,
  path: controlledPath,
  onPathChange,
  onSelect,
  onViewModeChange,
  singleViewIcon,
  multiViewIcon,
  backIcon,
  chevronIcon,
  breadcrumbSeparatorIcon,
  renderLeafContent,
  maxOpenPanels,
  className,
  children,
}: HierarchicalNavigationProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [currentPath, setCurrentPath] = useState<string[]>(
    defaultPath ?? [data.id],
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [jumpToOpen, setJumpToOpen] = useState(false);

  // Sync controlled path from parent
  useEffect(() => {
    if (controlledPath && controlledPath.length > 0) {
      setCurrentPath(controlledPath);
    }
  }, [controlledPath]);

  const separator = breadcrumbSeparatorIcon ?? defaultBreadcrumbSeparator;

  const resolveNode = useCallback(
    (path: string[]): NavigationNode => {
      let current: NavigationNode = data;
      for (let i = 1; i < path.length; i++) {
        const found = current.children?.find((c) => c.id === path[i]);
        if (!found) break;
        current = found;
      }
      return current;
    },
    [data],
  );

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      onViewModeChange?.(mode);
    },
    [onViewModeChange],
  );

  const navigateToChild = useCallback(
    (childId: string, fromPanelIndex?: number) => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPath((prev) => {
          const base =
            fromPanelIndex !== undefined
              ? prev.slice(0, fromPanelIndex + 1)
              : prev;
          const next = [...base, childId];
          onPathChange?.(next);

          const node = resolveNode(next);
          if (!node.children || node.children.length === 0) {
            onSelect?.(node, next);
          }

          return next;
        });
        setIsTransitioning(false);
      }, 150);
    },
    [onPathChange, onSelect, resolveNode],
  );

  const navigateBack = useCallback(() => {
    if (currentPath.length > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPath((prev) => {
          const next = prev.slice(0, -1);
          onPathChange?.(next);
          return next;
        });
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentPath.length, onPathChange]);

  const navigateToIndex = useCallback(
    (index: number) => {
      const next = currentPath.slice(0, index + 1);
      setCurrentPath(next);
      onPathChange?.(next);
    },
    [currentPath, onPathChange],
  );

  const getAllPanelsInPath = useCallback((): PanelDescriptor[] => {
    const panels: PanelDescriptor[] = [];
    let currentData: NavigationNode = data;
    panels.push({ data: currentData, path: [data.id] });

    for (let i = 1; i < currentPath.length; i++) {
      const found = currentData.children?.find((c) => c.id === currentPath[i]);
      if (found) {
        currentData = found;
        panels.push({ data: currentData, path: currentPath.slice(0, i + 1) });
      }
    }
    return panels;
  }, [data, currentPath]);

  return (
    <div
      className={[
        'bg-white shadow-xl border-r border-slate-200 flex flex-col',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-3">
          {title && <h2 className="text-lg font-semibold text-slate-800">{title}</h2>}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (viewMode !== 'multi') {
                  handleViewModeChange('multi');
                }
                setJumpToOpen((v) => !v);
              }}
              className={[
                'p-2 rounded-md transition-all duration-200',
                jumpToOpen
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm',
              ].join(' ')}
              title="Search panels"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => handleViewModeChange('single')}
                className={[
                  'p-2 rounded-md transition-all duration-200',
                  viewMode === 'single'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100',
                ].join(' ')}
                title="Single View"
              >
                {singleViewIcon ?? defaultSingleViewIcon}
              </button>
              <button
                onClick={() => handleViewModeChange('multi')}
                className={[
                  'p-2 rounded-md transition-all duration-200',
                  viewMode === 'multi'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100',
                ].join(' ')}
                title="Multi-Panel View"
              >
                {multiViewIcon ?? defaultMultiViewIcon}
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-slate-600">
          {currentPath.map((segment, index) => {
            const node = resolveNode(currentPath.slice(0, index + 1));
            return (
              <div key={segment} className="flex items-center space-x-2">
                {index > 0 && <span>{separator}</span>}
                <button
                  onClick={() => navigateToIndex(index)}
                  className="hover:text-blue-600 transition-colors whitespace-nowrap"
                >
                  {index === 0 ? (title || node.title) : node.title}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'single' ? (
          <SingleViewPanel
            currentPanel={resolveNode(currentPath)}
            onNavigateToChild={navigateToChild}
            onNavigateBack={navigateBack}
            canGoBack={currentPath.length > 1}
            isTransitioning={isTransitioning}
            backIcon={backIcon}
            chevronIcon={chevronIcon}
          />
        ) : (
          <MultiViewPanel
            panels={getAllPanelsInPath()}
            onNavigateToChild={navigateToChild}
            currentPath={currentPath}
            chevronIcon={chevronIcon}
            renderLeafContent={renderLeafContent}
            maxOpenPanels={maxOpenPanels}
            jumpToOpen={jumpToOpen}
            onJumpToOpenChange={setJumpToOpen}
            rootData={data}
            onNavigateToPath={(path) => {
              setCurrentPath(path);
              onPathChange?.(path);
              const node = resolveNode(path);
              if (!node.children || node.children.length === 0) {
                onSelect?.(node, path);
              }
            }}
          />
        )}
      </div>

      {children}
    </div>
  );
}
