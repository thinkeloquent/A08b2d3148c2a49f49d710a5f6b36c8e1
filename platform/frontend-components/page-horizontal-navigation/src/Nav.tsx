import { useState, useRef, useEffect, useCallback } from 'react';
import type { NavProps } from './types';
import { useHorizontalNavigation } from './HorizontalNavigationContext';
import { NavDropdown } from './NavDropdown';

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

const SCROLL_STYLES = `
.hn-scroll-fade-left {
  mask-image: linear-gradient(to right, transparent, black 32px);
  -webkit-mask-image: linear-gradient(to right, transparent, black 32px);
}
.hn-scroll-fade-right {
  mask-image: linear-gradient(to left, transparent, black 32px);
  -webkit-mask-image: linear-gradient(to left, transparent, black 32px);
}
.hn-scroll-fade-both {
  mask-image: linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent);
}
.hn-nav-scrollbar::-webkit-scrollbar { display: none; }
.hn-nav-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

export function Nav({
  groups: groupsProp,
  activeId: activeIdProp,
  onActiveChange: onActiveChangeProp,
  trailingTabs,
  className,
  maxWidth: _maxWidthProp,
}: NavProps) {
  const ctx = useHorizontalNavigation();

  const groups = groupsProp ?? ctx?.groups;
  const activeId = activeIdProp ?? ctx?.activeId;
  const onActiveChange = onActiveChangeProp ?? ctx?.onActiveChange;
  if (!groups || activeId == null || !onActiveChange) {
    throw new Error(
      'HorizontalNavigation.Nav requires groups, activeId, and onActiveChange — ' +
      'either pass them directly or use Nav inside <HorizontalNavigation>.'
    );
  }

  const [scrollable, setScrollable] = useState({ left: false, right: false });
  const scrollRef = useRef<HTMLDivElement>(null);

  const [subScrollable, setSubScrollable] = useState({ left: false, right: false });
  const subScrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollable({
      left: el.scrollLeft > 2,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 2,
    });
  }, []);

  const checkSubScroll = useCallback(() => {
    const el = subScrollRef.current;
    if (!el) return;
    setSubScrollable({
      left: el.scrollLeft > 2,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 2,
    });
  }, []);

  useEffect(() => {
    checkScroll();
    checkSubScroll();
    window.addEventListener('resize', checkScroll);
    window.addEventListener('resize', checkSubScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
      window.removeEventListener('resize', checkSubScroll);
    };
  }, [checkScroll, checkSubScroll]);

  const scroll = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  const scrollSub = (dir: number) => {
    const el = subScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: 'smooth' });
    setTimeout(checkSubScroll, 350);
  };

  // Re-check sub-scroll when active group changes
  useEffect(() => {
    // Defer to next frame so the sub-nav DOM has rendered
    requestAnimationFrame(checkSubScroll);
  }, [activeId, checkSubScroll]);

  const coreItems = groups[0]?.items ?? [];
  const groupedSections = groups.slice(1);

  // Find the grouped section that owns the active item (if any)
  const activeGroup = groupedSections.find((g) =>
    g.items.some((i) => i.id === activeId)
  );

  const scrollFadeClass =
    scrollable.left && scrollable.right ? 'hn-scroll-fade-both' :
    scrollable.left ? 'hn-scroll-fade-left' :
    scrollable.right ? 'hn-scroll-fade-right' : '';

  return (
    <>
      <style>{SCROLL_STYLES}</style>
      <nav
        className={['flex items-center px-4 h-11 gap-1 bg-white border-b border-slate-200', className].filter(Boolean).join(' ')}
      >
        {/* Scroll Left */}
        {scrollable.left && (
          <button
            onClick={() => scroll(-1)}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {ChevLeft}
          </button>
        )}

        {/* Scrollable Tab Area */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className={[
            'flex items-center gap-0.5 overflow-x-auto hn-nav-scrollbar flex-1',
            scrollFadeClass,
          ].filter(Boolean).join(' ')}
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
              {trailingTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onActiveChange(tab.id)}
                  className={[
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
                    'transition-all duration-200 whitespace-nowrap select-none flex-shrink-0',
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
        </div>

        {/* Scroll Right */}
        {scrollable.right && (
          <button
            onClick={() => scroll(1)}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {ChevRight}
          </button>
        )}
      </nav>

      {/* Sub-navigation for active dropdown group */}
      {activeGroup && (
        <div className="bg-slate-50 border-t border-slate-200">
          <div
            className="flex items-center gap-1 px-4 h-10"
          >
            <span className="text-xs font-medium text-slate-400 mr-2 flex-shrink-0">{activeGroup.label || activeGroup.id}</span>
            <div className="w-px h-4 bg-slate-200 mr-1 flex-shrink-0" />

            {/* Scroll Left */}
            {subScrollable.left && (
              <button
                onClick={() => scrollSub(-1)}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {ChevLeft}
              </button>
            )}

            {/* Scrollable sub-nav area */}
            <div
              ref={subScrollRef}
              onScroll={checkSubScroll}
              className={[
                'flex items-center gap-0.5 overflow-x-auto hn-nav-scrollbar flex-1',
                subScrollable.left && subScrollable.right ? 'hn-scroll-fade-both' :
                subScrollable.left ? 'hn-scroll-fade-left' :
                subScrollable.right ? 'hn-scroll-fade-right' : '',
              ].filter(Boolean).join(' ')}
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

            {/* Scroll Right */}
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
    </>
  );
}
