import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { PanelLeftSidebarSearch, FuzzyHighlight, fuzzy } from '@internal/panel-left-sidebar-search';
import type { FacetMap } from '@internal/panel-left-sidebar-search';
import type {
  PanelLeftSidebarMenu002Props,
  SidebarItem,
  FilterSectionConfig,
} from './types';

// --- Sub-components ---

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={['text-slate-400 transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function FilterSectionPanel({
  title,
  expanded,
  onToggle,
  activeCount,
  onClear,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  activeCount: number;
  onClear: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-slate-50/60 transition-colors duration-150"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{title}</span>
          {activeCount > 0 && (
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {activeCount > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-[10px] text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors duration-150"
            >
              Clear
            </span>
          )}
          <ChevronIcon open={expanded} />
        </div>
      </button>
      <div
        className="overflow-hidden transition-all ease-in-out"
        style={{
          maxHeight: expanded ? '300px' : '0px',
          opacity: expanded ? 1 : 0,
          transitionDuration: '250ms',
        }}
      >
        <div className="px-5 pb-3 pt-0.5">{children}</div>
      </div>
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
  count,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group" onClick={onChange}>
      <div
        className={[
          'w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all duration-150',
          checked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-slate-400',
        ].join(' ')}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </div>
      <span
        className={[
          'text-sm flex-1 transition-colors duration-150',
          checked ? 'text-slate-800 font-medium' : 'text-slate-600 group-hover:text-slate-800',
        ].join(' ')}
      >
        {label}
      </span>
      {count !== undefined && <span className="text-[11px] font-mono text-slate-400">{count}</span>}
    </label>
  );
}

function ActiveFilterPills({
  sections,
  selections,
  onRemove,
  onClearAll,
}: {
  sections: FilterSectionConfig[];
  selections: Record<string, string[]>;
  onRemove: (sectionKey: string, optionId: string) => void;
  onClearAll: () => void;
}) {
  const pills: { key: string; label: string; sectionKey: string; optionId: string }[] = [];
  for (const section of sections) {
    const selected = selections[section.key] ?? [];
    for (const id of selected) {
      const opt = section.options.find((o) => o.id === id);
      pills.push({
        key: `${section.key}-${id}`,
        label: opt?.label ?? id,
        sectionKey: section.key,
        optionId: id,
      });
    }
  }
  if (pills.length === 0) return null;
  return (
    <div className="px-5 pb-2 flex flex-wrap items-center gap-1.5">
      {pills.map((p) => (
        <span
          key={p.key}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1 transition-colors duration-150"
        >
          {p.label}
          <button
            onClick={() => onRemove(p.sectionKey, p.optionId)}
            className="text-indigo-400 hover:text-indigo-600 transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      <button onClick={onClearAll} className="text-[10px] text-slate-400 hover:text-indigo-500 ml-1 transition-colors duration-150">
        Clear all
      </button>
    </div>
  );
}

function ItemCard({
  item,
  queryText,
  onClick,
  onToggleStar,
  maxUsage,
  isActive,
}: {
  item: SidebarItem;
  queryText: string;
  onClick: (item: SidebarItem) => void;
  onToggleStar?: (id: string | number) => void;
  maxUsage: number;
  isActive?: boolean;
}) {
  const nameMatch = useMemo(() => (queryText ? fuzzy(item.name, queryText) : { hit: false, score: 0, idx: [] }), [item.name, queryText]);

  return (
    <div
      onClick={() => onClick(item)}
      className={[
        'group relative px-5 py-3 border-b cursor-pointer transition-all duration-200 w-full',
        isActive
          ? 'bg-indigo-50 border-b-indigo-100 ring-1 ring-inset ring-indigo-200'
          : 'bg-white border-b-slate-100 hover:bg-slate-50',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-tight">
            {nameMatch.hit ? (
              <FuzzyHighlight text={item.name} idx={nameMatch.idx} highlightClassName="bg-transparent text-indigo-600 font-semibold" />
            ) : (
              item.name
            )}
          </p>
          {item.updated && (
            <span className="text-[11px] text-slate-400 mt-1 block">Updated {item.updated}</span>
          )}
        </div>
        {onToggleStar && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(item.id);
            }}
            className="mt-0.5 flex-shrink-0 transition-all duration-200"
            aria-label={item.starred ? 'Unstar' : 'Star'}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill={item.starred ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              className={[
                'transition-colors duration-200',
                item.starred ? 'text-amber-400' : 'text-slate-300 group-hover:text-slate-400',
              ].join(' ')}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        )}
      </div>
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.map((tag) => (
            <span key={tag} className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}
      {item.usageCount != null && maxUsage > 0 && (
        <div className="flex items-center gap-1 mt-2">
          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (item.usageCount / maxUsage) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono w-8 text-right">{item.usageCount}</span>
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="text-indigo-500 group-hover:scale-110 transition-transform duration-200"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function BrowseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-indigo-500">
      <path d="M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2" />
      <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" />
      <path d="M21 12H3" />
    </svg>
  );
}

// --- Main Component ---

export function PanelLeftSidebarMenu002({
  title = 'Templates',
  filterSections,
  items,
  itemFilter,
  onFilterChange,
  maxUsageCount,
  searchPlaceholder = 'Search...',
  onItemSelect,
  onStarToggle,
  headerActionIcon,
  onHeaderAction,
  footer,
  footerLabel = 'Browse All',
  onFooterAction,
  appBar,
  header,
  className,
  activeId,
}: PanelLeftSidebarMenu002Props) {
  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    for (const s of filterSections) init[s.key] = [];
    return init;
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const s of filterSections) init[s.key] = s.defaultExpanded !== false;
    return init;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasActiveFilters = useMemo(
    () => Object.values(selections).some((arr) => arr.length > 0),
    [selections],
  );

  const updateSelections = useCallback(
    (next: Record<string, string[]>) => {
      setSelections(next);
      onFilterChange?.(next);
    },
    [onFilterChange],
  );

  const toggleOption = useCallback(
    (sectionKey: string, optionId: string) => {
      setSelections((prev) => {
        const arr = prev[sectionKey] ?? [];
        const next = {
          ...prev,
          [sectionKey]: arr.includes(optionId) ? arr.filter((x) => x !== optionId) : [...arr, optionId],
        };
        onFilterChange?.(next);
        return next;
      });
    },
    [onFilterChange],
  );

  const clearSection = useCallback(
    (sectionKey: string) => {
      setSelections((prev) => {
        const next = { ...prev, [sectionKey]: [] };
        onFilterChange?.(next);
        return next;
      });
    },
    [onFilterChange],
  );

  const clearAllFilters = useCallback(() => {
    const next: Record<string, string[]> = {};
    for (const s of filterSections) next[s.key] = [];
    updateSelections(next);
  }, [filterSections, updateSelections]);

  const removeFilterPill = useCallback(
    (sectionKey: string, optionId: string) => {
      toggleOption(sectionKey, optionId);
    },
    [toggleOption],
  );

  const computedMaxUsage = useMemo(() => {
    if (maxUsageCount != null) return maxUsageCount;
    return items.reduce((max, t) => Math.max(max, t.usageCount ?? 0), 0) || 1;
  }, [items, maxUsageCount]);

  // Pre-filter items by checkbox filter sections, pin active item to top
  const preFiltered = useMemo(() => {
    let result = (!itemFilter || !hasActiveFilters) ? items : items.filter((item) => itemFilter(item, selections));
    if (activeId != null) {
      const activeItem = result.find((item) => item.id === activeId);
      if (activeItem) {
        result = [activeItem, ...result.filter((item) => item.id !== activeId)];
      }
    }
    return result;
  }, [items, itemFilter, selections, hasActiveFilters, activeId]);

  // Build facets from filter sections OR auto-derive from item data
  const facets = useMemo<FacetMap>(() => {
    // If filter sections are provided, use them
    if (filterSections.length > 0) {
      const map: FacetMap = {};
      for (const section of filterSections) {
        if (section.options.length === 0) continue;
        map[section.key] = {
          label: section.title,
          icon: '🏷',
          accent: '#6366f1',
          values: section.options.map((o) => o.label),
        };
      }
      return map;
    }

    // Auto-derive facets from item categories and tags
    const map: FacetMap = {};
    const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];
    if (categories.length > 1) {
      map.category = { label: 'Status', icon: '●', accent: '#f59e0b', values: categories };
    }
    const allTags = [...new Set(items.flatMap((i) => i.tags ?? []).filter(Boolean))];
    if (allTags.length > 0) {
      map.tags = { label: 'Type', icon: '◆', accent: '#6366f1', values: allTags };
    }
    return map;
  }, [filterSections, items]);

  const handleToggleStar = useCallback(
    (id: string | number) => {
      const item = items.find((t) => t.id === id);
      if (item && onStarToggle) {
        onStarToggle(id, !item.starred);
      }
    },
    [items, onStarToggle],
  );

  const getSearchableFields = useCallback((item: SidebarItem) => ({
    name: item.name,
    description: item.category,
    tags: item.tags,
  }), []);

  const getFacetValue = useCallback((item: SidebarItem, facetKey: string) => {
    if (facetKey === 'category') return item.category;
    if (facetKey === 'tags') return (item.tags ?? []).join(' ');
    return (item as any)[facetKey] ?? '';
  }, []);

  const renderItem = useCallback(
    (item: SidebarItem, queryText: string, _index: number) => (
      <ItemCard
        key={item.id}
        item={item}
        queryText={queryText}
        onClick={(it) => onItemSelect?.(it)}
        onToggleStar={onStarToggle ? handleToggleStar : undefined}
        maxUsage={computedMaxUsage}
        isActive={activeId != null && item.id === activeId}
      />
    ),
    [onItemSelect, onStarToggle, handleToggleStar, computedMaxUsage, activeId],
  );

  return (
    <div
      className={[
        'w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden transition-all duration-500 flex flex-col',
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}
    >
      {/* App Bar */}
      {appBar && (
        <div className="px-3 py-1.5 flex items-center shrink-0" style={{ backgroundColor: '#005AB5' }}>
          {appBar}
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-5 pb-3 shrink-0">
        {header !== undefined ? (
          header
        ) : (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
            </div>
            <div className="flex items-center gap-1.5">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="h-8 px-2.5 rounded-lg text-[11px] font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-150 flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  Reset
                </button>
              )}
              {headerActionIcon !== null && onHeaderAction && (
                <button
                  onClick={onHeaderAction}
                  className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center transition-colors duration-200 group"
                >
                  {headerActionIcon ?? <PlusIcon />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active filter pills */}
      <ActiveFilterPills
        sections={filterSections}
        selections={selections}
        onRemove={removeFilterPill}
        onClearAll={clearAllFilters}
      />

      {/* Filter sections */}
      <div className="shrink-0">
        {filterSections.map((section) => (
          <FilterSectionPanel
            key={section.key}
            title={section.title}
            expanded={expandedSections[section.key] ?? true}
            onToggle={() =>
              setExpandedSections((prev) => ({ ...prev, [section.key]: !prev[section.key] }))
            }
            activeCount={(selections[section.key] ?? []).length}
            onClear={() => clearSection(section.key)}
          >
            <div className="space-y-0">
              {section.options.map((opt) => (
                <CheckboxRow
                  key={opt.id}
                  label={opt.label}
                  checked={(selections[section.key] ?? []).includes(opt.id)}
                  onChange={() => toggleOption(section.key, opt.id)}
                  count={opt.count}
                />
              ))}
            </div>
          </FilterSectionPanel>
        ))}
      </div>

      {/* Search + Results (powered by PanelLeftSidebarSearch) */}
      <div className="flex-1 min-h-0 flex flex-col px-5 pb-1">
        <PanelLeftSidebarSearch<SidebarItem>
          items={preFiltered}
          facets={facets}
          getSearchableFields={getSearchableFields}
          getFacetValue={getFacetValue}
          renderItem={renderItem}
          placeholder={searchPlaceholder}
          emptyTitle={hasActiveFilters ? 'No items match filters' : undefined}
          emptyMessage={hasActiveFilters ? 'Try adjusting your filters or search' : undefined}
          className="flex-1 min-h-0"
        />
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 shrink-0">
        {footer ?? (
          <button
            onClick={onFooterAction}
            className="w-full py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200 flex items-center justify-center gap-1.5"
          >
            <BrowseIcon />
            {footerLabel}
          </button>
        )}
      </div>
    </div>
  );
}
