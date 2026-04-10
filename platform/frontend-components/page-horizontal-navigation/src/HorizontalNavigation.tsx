import { useMemo, useState, useEffect, useRef, useCallback, Children, isValidElement } from 'react';
import type { HorizontalNavigationProps, CommandPaletteItem } from './types';
import { HorizontalNavigationContext } from './HorizontalNavigationContext';
import { Nav } from './Nav';
import { NavDropdown } from './NavDropdown';
import { CommandPalette } from './CommandPalette';
import { ScopeDropdown } from './scope/ScopeDropdown';
import { ScopeSelector } from '@internal/scope-selector';
import type { ScopeSelectorScope, ScopeSelectorValue } from '@internal/scope-selector';

const SearchIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="7" cy="7" r="5" />
    <line x1="11" y1="11" x2="14.5" y2="14.5" />
  </svg>
);

const ChevLeft = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="10,3 5,8 10,13" />
  </svg>
);

const ChevRight = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,3 11,8 6,13" />
  </svg>
);

const KEYFRAMES = `
@keyframes hn-dropIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes hn-paletteIn {
  from { opacity: 0; transform: translateY(-12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.hn-nav-scrollbar::-webkit-scrollbar { display: none; }
.hn-nav-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;


function HorizontalNavigationRoot({
  groups,
  activeId,
  onActiveChange,
  org,
  scope,
  fqdpScopeSelector,
  brand,
  search,
  actions,
  user,
  children,
  className,
  headerClassName,
  maxWidth = '1440px',
}: HorizontalNavigationProps) {
  const ctx = useMemo(
    () => ({ groups, activeId, onActiveChange, maxWidth, org, scope }),
    [groups, activeId, onActiveChange, maxWidth, org, scope],
  );

  const [paletteOpen, setPaletteOpen] = useState(false);

  // Build ScopeSelector data from OrgSlot
  const orgScope: ScopeSelectorScope | null = useMemo(() => {
    if (!org) return null;
    const orgList = org.orgs && org.orgs.length > 0
      ? org.orgs
      : [{ id: '__current', name: org.name, initial: org.initial, color: org.color }];
    return {
      key: 'organizations',
      label: 'Organizations',
      color: '#6C5CE7',
      items: orgList.map((entry) => ({
        id: entry.id,
        name: entry.name,
        badge: entry.initial || entry.name.charAt(0).toUpperCase(),
      })),
    };
  }, [org]);

  const orgScopeValue: ScopeSelectorValue | undefined = useMemo(() => {
    if (!orgScope || !org) return undefined;
    const currentItem = orgScope.items.find((i) => i.name === org.name) ?? orgScope.items[0];
    if (!currentItem) return undefined;
    return { scope: orgScope, item: currentItem };
  }, [orgScope, org]);

  const handleOrgScopeSelect = useCallback(
    (value: ScopeSelectorValue) => {
      org?.onOrgChange?.(value.item.id);
    },
    [org],
  );

  const handleOrgCreate = useCallback(() => {
    if (org?.createHref) window.location.href = org.createHref;
  }, [org]);

  const handleOrgManage = useCallback(() => {
    if (org?.manageHref) window.location.href = org.manageHref;
  }, [org]);

  const searchEnabled = search !== false;
  const searchConfig = typeof search === 'object' ? search : {};

  // Cmd+K shortcut
  useEffect(() => {
    if (!searchEnabled) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((p) => !p);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [searchEnabled]);

  // Inline nav scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState({ left: false, right: false });

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollable({
      left: el.scrollLeft > 2,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 2,
    });
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const scroll = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  // Extract trailing tabs from explicit Nav children
  const contentChildren: React.ReactNode[] = [];
  let trailingTabs: any[] | undefined;

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Nav) {
      trailingTabs = (child.props as any).trailingTabs;
    } else {
      contentChildren.push(child);
    }
  });

  // Build flattened items for command palette
  const paletteItems: CommandPaletteItem[] = groups.flatMap((g) =>
    g.items.map((i) => ({ id: i.id, label: i.label, icon: i.icon, group: g.label || 'Core' }))
  );

  const coreItems = groups[0]?.items ?? [];
  const groupedSections = groups.slice(1);

  // Find the grouped section that owns the active item
  const activeGroup = groupedSections.find((g) =>
    g.items.some((i) => i.id === activeId)
  );

  // Sub-nav scroll state
  const subScrollRef = useRef<HTMLDivElement>(null);
  const [subScrollable, setSubScrollable] = useState({ left: false, right: false });

  const checkSubScroll = useCallback(() => {
    const el = subScrollRef.current;
    if (!el) return;
    setSubScrollable({
      left: el.scrollLeft > 2,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 2,
    });
  }, []);

  useEffect(() => {
    checkSubScroll();
    window.addEventListener('resize', checkSubScroll);
    return () => window.removeEventListener('resize', checkSubScroll);
  }, [checkSubScroll]);

  useEffect(() => {
    requestAnimationFrame(checkSubScroll);
  }, [activeId, checkSubScroll]);

  const scrollSub = (dir: number) => {
    const el = subScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: 'smooth' });
    setTimeout(checkSubScroll, 350);
  };

  return (
    <HorizontalNavigationContext.Provider value={ctx}>
      <style>{KEYFRAMES}</style>

      <div className={[contentChildren.length > 0 ? 'min-h-screen bg-slate-50/60' : '', className].filter(Boolean).join(' ') || undefined}>
        {/* Combined Header */}
        <header className={['bg-white border-b border-slate-200', headerClassName].filter(Boolean).join(' ')}>
            <div className="flex items-center px-4 h-12 gap-2">
              {/* FQDP Scope Selector (replaces org + scope when provided) */}
              {fqdpScopeSelector ? (
                <>
                  <div className="flex-shrink-0">
                    <ScopeSelector {...fqdpScopeSelector} compact />
                  </div>
                  <div className="w-px h-5 bg-slate-200 mx-0.5 flex-shrink-0" />
                </>
              ) : (
                <>
                  {/* Org selector (ScopeSelector) */}
                  {org && orgScope && (
                    <div className="flex-shrink-0">
                      <ScopeSelector
                        scopes={[orgScope]}
                        value={orgScopeValue}
                        onSelect={handleOrgScopeSelect}
                        onCreateClick={org.createHref ? handleOrgCreate : undefined}
                        onManageClick={org.manageHref ? handleOrgManage : undefined}
                        onRefresh={org.onRefresh}
                        width={240}
                        placeholder="Select organization"
                        compact
                      />
                    </div>
                  )}

                  {/* Separator after org */}
                  {org && <div className="w-px h-5 bg-slate-200 mx-0.5 flex-shrink-0" />}

                  {/* Scope selector */}
                  {scope && (
                    <ScopeDropdown
                      items={scope.items}
                      activeId={scope.activeId}
                      onScopeChange={scope.onScopeChange}
                    />
                  )}

                  {/* Separator after scope */}
                  {scope && <div className="w-px h-5 bg-slate-200 mx-0.5 flex-shrink-0" />}
                </>
              )}

              {/* Brand */}
              {brand && (
                <div className="flex items-center gap-2.5 mr-1 flex-shrink-0">
                  {brand.icon && <span className="flex items-center text-slate-500">{brand.icon}</span>}
                  <span className="text-sm font-semibold text-slate-800">{brand.name}</span>
                  {brand.badge && (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">{brand.badge}</span>
                  )}
                </div>
              )}

              {/* Separator after brand */}
              {brand && <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />}

              {/* Scroll Left */}
              {scrollable.left && (
                <button
                  onClick={() => scroll(-1)}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {ChevLeft}
                </button>
              )}

              {/* Inline Navigation Tabs */}
              <nav
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex items-center gap-0.5 overflow-x-auto hn-nav-scrollbar flex-1 min-w-0"
              >
                {/* Core tabs */}
                {coreItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onActiveChange(item.id)}
                    className={[
                      'relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium',
                      'transition-all duration-150 whitespace-nowrap select-none flex-shrink-0',
                      item.id === activeId
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    {item.icon && (
                      <span className={['transition-colors', item.id === activeId ? 'text-blue-600' : 'text-slate-400'].join(' ')}>
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                    {item.badge != null && typeof item.badge === 'number' && (
                      <span className={[
                        'min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full',
                        item.id === activeId
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-500',
                      ].join(' ')}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}

                {/* Divider before groups */}
                {groupedSections.length > 0 && (
                  <div className="w-px h-4 bg-slate-200 mx-1 flex-shrink-0" />
                )}

                {/* Grouped Dropdowns */}
                {groupedSections.map((group) => (
                  <NavDropdown
                    key={group.id}
                    label={group.label || group.id}
                    items={group.items}
                    activeId={activeId}
                    onSelect={onActiveChange}
                  />
                ))}

                {/* Trailing tabs */}
                {trailingTabs && trailingTabs.length > 0 && (
                  <>
                    <div className="w-px h-4 bg-slate-200 mx-1 flex-shrink-0" />
                    {trailingTabs.map((tab: any) => (
                      <button
                        key={tab.id}
                        onClick={() => onActiveChange(tab.id)}
                        className={[
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium',
                          'transition-all duration-150 whitespace-nowrap select-none flex-shrink-0',
                          activeId === tab.id
                            ? 'bg-slate-100 text-slate-900'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                        ].join(' ')}
                      >
                        {tab.icon && (
                          <span className={['transition-colors', activeId === tab.id ? 'text-blue-600' : 'text-slate-400'].join(' ')}>
                            {tab.icon}
                          </span>
                        )}
                        {tab.label}
                      </button>
                    ))}
                  </>
                )}
              </nav>

              {/* Scroll Right */}
              {scrollable.right && (
                <button
                  onClick={() => scroll(1)}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {ChevRight}
                </button>
              )}

              {/* Search trigger */}
              {searchEnabled && (
                <button
                  onClick={() => setPaletteOpen(true)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 ml-2 flex-shrink-0 transition-colors group"
                >
                  <span className="text-slate-400 group-hover:text-slate-500 transition-colors">{SearchIcon}</span>
                  <span className="text-sm text-slate-400 hidden sm:inline">{searchConfig.placeholder || 'Type'}</span>
                  <kbd className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
                    <span className="text-xs">{searchConfig.shortcutModifier || '⌘'}</span>{searchConfig.shortcutLabel || 'K'}
                  </kbd>
                </button>
              )}

              {/* Actions */}
              {actions && actions.length > 0 && (
                <div className="flex items-center gap-0.5 ml-1 flex-shrink-0">
                  {actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.onClick}
                      aria-label={action.ariaLabel}
                      className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {action.icon}
                      {action.showDot && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* User avatar */}
              {user && (
                <div className="ml-1 pl-2 border-l border-slate-200 flex-shrink-0">
                  <div className={[
                    'w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer ring-2 ring-transparent hover:ring-slate-200 transition-all',
                    user.gradientFrom || 'from-amber-400',
                    user.gradientTo || 'to-orange-500',
                  ].join(' ')}>
                    {user.icon || user.initials}
                  </div>
                </div>
              )}
            </div>

          {/* Sub-navigation for active dropdown group */}
          {activeGroup && (
            <div className="bg-slate-50 border-t border-slate-200">
                <div className="flex items-center gap-1 px-4 h-10">
                  <span className="text-xs font-medium text-slate-400 mr-2 flex-shrink-0">{activeGroup.label || activeGroup.id}</span>
                  <div className="w-px h-4 bg-slate-200 mr-1 flex-shrink-0" />

                  {subScrollable.left && (
                    <button
                      onClick={() => scrollSub(-1)}
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {ChevLeft}
                    </button>
                  )}

                  <div
                    ref={subScrollRef}
                    onScroll={checkSubScroll}
                    className="flex items-center gap-0.5 overflow-x-auto hn-nav-scrollbar flex-1"
                  >
                    {activeGroup.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onActiveChange(item.id)}
                        className={[
                          'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium',
                          'transition-all duration-150 whitespace-nowrap select-none flex-shrink-0',
                          item.id === activeId
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/60',
                        ].join(' ')}
                      >
                        {item.icon && (
                          <span className={['transition-colors', item.id === activeId ? 'text-blue-600' : 'text-slate-400'].join(' ')}>
                            {item.icon}
                          </span>
                        )}
                        {item.label}
                        {item.badge != null && (
                          <span className={[
                            'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                            typeof item.badge === 'string'
                              ? 'bg-emerald-50 text-emerald-600'
                              : item.id === activeId
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-500',
                          ].join(' ')}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {subScrollable.right && (
                    <button
                      onClick={() => scrollSub(1)}
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {ChevRight}
                    </button>
                  )}
                </div>
            </div>
          )}
        </header>

        {/* Page content */}
        {contentChildren.length > 0 && (
          <main style={{ maxWidth }} className="mx-auto">
            {<>{contentChildren}</>}
          </main>
        )}
      </div>

      {/* Command Palette */}
      {searchEnabled && (
        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onSelect={(id) => { onActiveChange(id); setPaletteOpen(false); }}
          items={paletteItems}
          placeholder={searchConfig.placeholder}
        />
      )}
    </HorizontalNavigationContext.Provider>
  );
}

export const HorizontalNavigation = Object.assign(HorizontalNavigationRoot, {
  Nav,
});
