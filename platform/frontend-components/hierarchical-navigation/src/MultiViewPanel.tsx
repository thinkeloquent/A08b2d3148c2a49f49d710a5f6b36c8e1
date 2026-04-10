import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { MultiViewPanelProps, NavigationNode } from './types';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const defaultChevron = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ArrowLeft = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ArrowRight = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const SearchIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const MapPinIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

interface SearchEntry {
  node: NavigationNode;
  path: string[];
  depth: number;
}

/** Recursively flatten the entire navigation tree into searchable entries. */
function flattenTree(node: NavigationNode, parentPath: string[] = [], depth = 0): SearchEntry[] {
  const currentPath = [...parentPath, node.id];
  const entries: SearchEntry[] = [{ node, path: currentPath, depth }];
  if (node.children) {
    for (const child of node.children) {
      entries.push(...flattenTree(child, currentPath, depth + 1));
    }
  }
  return entries;
}

/** Simple fuzzy match — checks if all characters of the query appear in order within the target. */
function fuzzyMatch(query: string, target: string): { matches: boolean; score: number } {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact substring match gets highest score
  if (t.includes(q)) return { matches: true, score: 2 };

  // Fuzzy: all chars of query appear in order
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  if (qi === q.length) return { matches: true, score: 1 };

  return { matches: false, score: 0 };
}

export function MultiViewPanel({
  panels,
  onNavigateToChild,
  currentPath,
  chevronIcon,
  renderLeafContent,
  maxOpenPanels,
  rootData,
  onNavigateToPath,
  jumpToOpen: controlledJumpToOpen,
  onJumpToOpenChange,
  className,
}: MultiViewPanelProps) {
  const chevron = chevronIcon ?? defaultChevron;
  const hasCarousel = maxOpenPanels !== undefined && panels.length > maxOpenPanels;

  // Carousel viewport state
  const [viewStart, setViewStart] = useState(0);
  const [internalJumpToMode, setInternalJumpToMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Controlled or uncontrolled jump-to mode
  const isControlled = controlledJumpToOpen !== undefined;
  const jumpToMode = isControlled ? controlledJumpToOpen : internalJumpToMode;
  const setJumpToMode = useCallback(
    (open: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof open === 'function' ? open(jumpToMode) : open;
      if (isControlled) {
        onJumpToOpenChange?.(next);
      } else {
        setInternalJumpToMode(next);
      }
    },
    [isControlled, jumpToMode, onJumpToOpenChange],
  );

  // Auto-scroll viewport to keep the latest panel visible
  useEffect(() => {
    if (!hasCarousel) {
      setViewStart(0);
      return;
    }
    const maxStart = Math.max(0, panels.length - maxOpenPanels);
    setViewStart(maxStart);
  }, [panels.length, maxOpenPanels, hasCarousel]);

  // Close jump-to when panel count changes (user navigated deeper/shallower)
  const prevPanelCount = usePrevious(panels.length);
  useEffect(() => {
    if (prevPanelCount === undefined) return; // skip on mount
    if (prevPanelCount === panels.length) return; // no change
    if (isControlled) {
      onJumpToOpenChange?.(false);
    } else {
      setInternalJumpToMode(false);
    }
    setSearchQuery('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panels.length]);

  const visiblePanels = useMemo(() => {
    if (!hasCarousel) return panels;
    // When in jump-to mode, reserve the first slot for the search panel
    const effectiveMax = jumpToMode ? maxOpenPanels - 1 : maxOpenPanels;
    return panels.slice(viewStart, viewStart + effectiveMax);
  }, [panels, viewStart, maxOpenPanels, hasCarousel, jumpToMode]);

  const canGoLeft = hasCarousel && viewStart > 0;
  const canGoRight = hasCarousel && viewStart + maxOpenPanels < panels.length;

  const slideLeft = useCallback(() => {
    setViewStart((v) => Math.max(0, v - 1));
  }, []);

  const slideRight = useCallback(() => {
    if (maxOpenPanels === undefined) return;
    setViewStart((v) => Math.min(panels.length - maxOpenPanels, v + 1));
  }, [panels.length, maxOpenPanels]);

  const handleJumpTo = useCallback(
    (entry: SearchEntry) => {
      // Navigate to the selected node's full path
      onNavigateToPath?.(entry.path);
      setJumpToMode(false);
      setSearchQuery('');
    },
    [onNavigateToPath, setJumpToMode],
  );

  // Flatten the entire tree for search (not just current panels)
  const allEntries = useMemo(() => flattenTree(rootData), [rootData]);
  const filteredEntries = useMemo(() => {
    if (!searchQuery) return [];
    return allEntries
      .map((entry) => {
        const titleMatch = fuzzyMatch(searchQuery, entry.node.title);
        const idMatch = fuzzyMatch(searchQuery, entry.node.id);
        const pathStr = entry.path.slice(1).join(' ');
        const pathMatch = fuzzyMatch(searchQuery, pathStr);
        const score = Math.max(titleMatch.score, idMatch.score, pathMatch.score);
        return { ...entry, score, matches: score > 0 };
      })
      .filter((e) => e.matches)
      .sort((a, b) => b.score - a.score);
  }, [allEntries, searchQuery]);

  const renderPanel = (
    panel: { data: NavigationNode; path: string[] },
    index: number,
    actualIndex: number,
  ) => {
    const isActive = actualIndex === panels.length - 1;

    return (
      <div
        key={panel.data.id + '-' + actualIndex}
        className={[
          'border-r border-slate-100 bg-white flex flex-col',
          panels.length === 1 ? 'flex-1' : 'w-64 flex-shrink-0',
        ].join(' ')}
        style={{
          zIndex: panels.length - actualIndex,
          boxShadow: index > 0 || jumpToMode ? '-2px 0 8px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <div
          className={[
            'p-4 border-b border-slate-100',
            isActive ? 'bg-blue-50' : 'bg-slate-50',
          ].join(' ')}
        >
          <div className="flex items-center space-x-2">
            {panel.data.icon && (
              <div
                className={[
                  'p-1.5 rounded-md',
                  isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-200 text-slate-600',
                ].join(' ')}
              >
                {panel.data.icon}
              </div>
            )}
            <h4
              className={[
                'font-medium text-sm',
                isActive ? 'text-blue-900' : 'text-slate-700',
              ].join(' ')}
            >
              {panel.data.title}
            </h4>
          </div>
        </div>

        <nav className="p-2 flex-1 overflow-y-auto">
          {panel.data.children && panel.data.children.length > 0 ? (
            panel.data.children.map((child) => {
              const isInPath = currentPath.includes(child.id);

              return (
                <button
                  key={child.id}
                  onClick={() => onNavigateToChild(child.id, actualIndex)}
                  className={[
                    'w-full flex items-center justify-between p-2.5 rounded-md transition-colors group',
                    isInPath
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-slate-50 text-slate-700',
                  ].join(' ')}
                >
                  <div className="flex items-center space-x-2">
                    {child.icon && (
                      <div
                        className={[
                          'transition-colors',
                          isInPath
                            ? 'text-blue-600'
                            : 'text-slate-500 group-hover:text-slate-700',
                        ].join(' ')}
                      >
                        {child.icon}
                      </div>
                    )}
                    <span className="text-sm font-medium">{child.title}</span>
                  </div>
                  {child.children && child.children.length > 0 && (
                    <span
                      className={[
                        'transition-colors',
                        isInPath
                          ? 'text-blue-600'
                          : 'text-slate-400 group-hover:text-slate-600',
                      ].join(' ')}
                    >
                      {chevron}
                    </span>
                  )}
                </button>
              );
            })
          ) : renderLeafContent ? (
            renderLeafContent(panel.data, panel.path)
          ) : (
            <div className="p-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                {panel.data.icon && (
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {panel.data.icon}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-slate-800">{panel.data.title}</div>
                  <div className="text-xs text-slate-500">No sub-items</div>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    );
  };

  const renderJumpToPanel = () => (
    <div
      key="__jump-to__"
      className="w-64 border-r border-slate-100 flex-shrink-0 bg-white flex flex-col"
      style={{ zIndex: panels.length + 1 }}
    >
      <div className="p-4 border-b border-slate-100 bg-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-600">
              {MapPinIcon}
            </div>
            <h4 className="font-medium text-sm text-indigo-900">Go to Panel</h4>
          </div>
          <button
            onClick={() => {
              setJumpToMode(false);
              setSearchQuery('');
            }}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-white transition-colors"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-3 relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            {SearchIcon}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search panels..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-slate-400"
            autoFocus
          />
        </div>
      </div>

      <nav className="p-2 flex-1 overflow-y-auto">
        {filteredEntries.map((entry, i) => {
          const isInCurrentPath = currentPath.join('/') === entry.path.join('/');

          return (
            <button
              key={entry.node.id + '-jump-' + i}
              onClick={() => handleJumpTo(entry)}
              className={[
                'w-full flex items-center p-2.5 rounded-md transition-colors group',
                isInCurrentPath
                  ? 'bg-indigo-50 text-indigo-900'
                  : 'hover:bg-slate-50 text-slate-700',
              ].join(' ')}
            >
              <div className="flex items-center space-x-2 min-w-0">
                {entry.node.icon && (
                  <div
                    className={[
                      'flex-shrink-0 transition-colors',
                      isInCurrentPath
                        ? 'text-indigo-600'
                        : 'text-slate-500 group-hover:text-slate-700',
                    ].join(' ')}
                  >
                    {entry.node.icon}
                  </div>
                )}
                <div className="min-w-0 text-left">
                  <span className="text-sm font-medium block truncate">
                    {entry.node.title}
                  </span>
                  <span className="text-xs text-slate-400 block truncate">
                    {entry.path.slice(1).join(' / ') || 'Root'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
        {filteredEntries.length === 0 && (
          <div className="p-4 text-center text-slate-400 text-xs">
            {searchQuery ? 'No matching panels' : 'Type to search panels'}
          </div>
        )}
      </nav>
    </div>
  );

  return (
    <div className={['h-full overflow-hidden flex flex-col', className].filter(Boolean).join(' ')}>
      {/* Carousel controls */}
      {hasCarousel && (
        <div className="flex items-center justify-end px-3 py-2 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>
              {viewStart + 1}–{Math.min(viewStart + maxOpenPanels, panels.length)} of {panels.length}
            </span>
            <div className="flex space-x-1">
              <button
                onClick={slideLeft}
                disabled={!canGoLeft}
                className={[
                  'p-1 rounded-md transition-colors',
                  canGoLeft
                    ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    : 'text-slate-300 cursor-not-allowed',
                ].join(' ')}
                title="Previous panels"
              >
                {ArrowLeft}
              </button>
              <button
                onClick={slideRight}
                disabled={!canGoRight}
                className={[
                  'p-1 rounded-md transition-colors',
                  canGoRight
                    ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    : 'text-slate-300 cursor-not-allowed',
                ].join(' ')}
                title="Next panels"
              >
                {ArrowRight}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel strip */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {jumpToMode && renderJumpToPanel()}
          {visiblePanels.map((panel, i) => {
            const actualIndex = hasCarousel ? viewStart + i : i;
            return renderPanel(panel, jumpToMode ? i + 1 : i, actualIndex);
          })}
        </div>
      </div>
    </div>
  );
}
