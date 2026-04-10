import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
  PanelLeftSidebarMenu001Props,
  SidebarItem,
  SidebarCategory,
  CategoryColorScheme,
} from './types';

// --- Fuzzy search engine ---

function fuzzyMatch(query: string, text: string) {
  if (!query) return { score: 1, indices: [] as number[] };
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  const indices: number[] = [];
  let score = 0;
  let consecutive = 0;
  let lastIdx = -2;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      indices.push(ti);
      consecutive = ti === lastIdx + 1 ? consecutive + 1 : 1;
      score += consecutive * 2 + (ti === 0 ? 5 : 0);
      lastIdx = ti;
      qi++;
    }
  }
  if (qi < q.length) return { score: 0, indices: [] as number[] };
  return { score: score / (t.length * 0.5 + 1), indices };
}

function highlightMatch(text: string, indices: number[]): ReactNode {
  if (!indices.length) return text;
  return text.split('').map((ch, i) => {
    if (indices.includes(i))
      return (
        <span key={i} className="text-indigo-600 font-semibold">
          {ch}
        </span>
      );
    return ch;
  });
}

// --- Sub-components ---

function SearchInput({
  value,
  onChange,
  onClear,
  inputRef,
  focusedIdx,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  focusedIdx: number;
  placeholder: string;
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition-all duration-200 placeholder:text-slate-400"
        aria-label={placeholder}
        role="combobox"
        aria-expanded={!!value}
        aria-activedescendant={focusedIdx >= 0 ? `sidebar-item-${focusedIdx}` : undefined}
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Clear search"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
      <div className="absolute -bottom-1 left-4 right-4 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

function CategoryPill({
  cat,
  active,
  onClick,
  animDelay,
}: {
  cat: SidebarCategory;
  active: boolean;
  onClick: (id: string) => void;
  animDelay: number;
}) {
  return (
    <button
      onClick={() => onClick(cat.id)}
      className={[
        'group flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
        active
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800',
      ].join(' ')}
      style={{ animationDelay: `${animDelay}ms` }}
    >
      {cat.icon != null && (
        <span
          className={[
            'text-base transition-transform duration-200 group-hover:scale-110',
            active ? 'text-indigo-200' : 'text-slate-400',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {cat.icon}
        </span>
      )}
      <span className="flex-1 text-left">{cat.label}</span>
      {cat.count != null && (
        <span
          className={[
            'text-xs font-mono px-1.5 py-0.5 rounded-md transition-colors duration-200',
            active
              ? 'bg-indigo-500/50 text-indigo-100'
              : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500',
          ].join(' ')}
        >
          {cat.count}
        </span>
      )}
    </button>
  );
}

function ItemCard({
  item,
  matchIndices,
  focused,
  onClick,
  onToggleStar,
  idx,
  colorScheme,
  maxUsage,
}: {
  item: SidebarItem;
  matchIndices: number[];
  focused: boolean;
  onClick: (item: SidebarItem) => void;
  onToggleStar?: (id: string | number) => void;
  idx: number;
  colorScheme?: CategoryColorScheme;
  maxUsage: number;
}) {
  const c = colorScheme || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };

  return (
    <div
      id={`sidebar-item-${idx}`}
      role="option"
      aria-selected={focused}
      onClick={() => onClick(item)}
      className={[
        'group relative p-3 rounded-xl border cursor-pointer transition-all duration-200',
        focused
          ? 'border-indigo-300 bg-indigo-50/60 ring-1 ring-indigo-200'
          : 'border-slate-150 bg-white hover:border-slate-300 hover:shadow-sm',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
            {highlightMatch(item.name, matchIndices)}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={[
                'inline-flex text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md border',
                c.bg,
                c.text,
                c.border,
              ].join(' ')}
            >
              {item.category.slice(0, 3)}
            </span>
            {item.updated && <span className="text-[11px] text-slate-400">{item.updated}</span>}
          </div>
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
            <span
              key={tag}
              className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5"
            >
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

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-slate-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          <path d="M8 11h6M11 8v6" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-500">No matches for &ldquo;{query}&rdquo;</p>
      <p className="text-xs text-slate-400 mt-1">Try a different keyword or category</p>
    </div>
  );
}

// --- Default footer icons ---

function BrowseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="text-indigo-500"
    >
      <path d="M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2" />
      <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" />
      <path d="M21 12H3" />
    </svg>
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

// --- Main Component ---

export function PanelLeftSidebarMenu001({
  title = 'Templates',
  categories,
  items,
  categoryColors,
  maxUsageCount,
  searchPlaceholder = 'Search...',
  onItemSelect,
  onStarToggle,
  headerActionIcon,
  onHeaderAction,
  footer,
  footerLabel = 'Browse All',
  onFooterAction,
  className,
}: PanelLeftSidebarMenu001Props) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? 'all');
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null!);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const computedMaxUsage = useMemo(() => {
    if (maxUsageCount != null) return maxUsageCount;
    return items.reduce((max, t) => Math.max(max, t.usageCount ?? 0), 0) || 1;
  }, [items, maxUsageCount]);

  const filtered = useMemo(() => {
    let pool = items;
    if (activeCategory !== categories[0]?.id) {
      pool = pool.filter((t) => t.category === activeCategory);
    }
    if (!query.trim())
      return pool.map((t) => ({ ...t, matchScore: 1, matchIndices: [] as number[] }));

    const q = query.trim();
    return pool
      .map((t) => {
        const nameMatch = fuzzyMatch(q, t.name);
        const tagMatch = (t.tags ?? []).reduce(
          (best, tag) => {
            const m = fuzzyMatch(q, tag);
            return m.score > best.score ? m : best;
          },
          { score: 0, indices: [] as number[] },
        );
        const catMatch = fuzzyMatch(q, t.category);
        const bestScore = Math.max(nameMatch.score, tagMatch.score * 0.8, catMatch.score * 0.6);
        return { ...t, matchScore: bestScore, matchIndices: nameMatch.indices };
      })
      .filter((t) => t.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [query, activeCategory, items, categories]);

  const handleToggleStar = useCallback(
    (id: string | number) => {
      const item = items.find((t) => t.id === id);
      if (item && onStarToggle) {
        onStarToggle(id, !item.starred);
      }
    },
    [items, onStarToggle],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIdx((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIdx((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && focusedIdx >= 0 && filtered[focusedIdx]) {
        onItemSelect?.(filtered[focusedIdx]);
      } else if (e.key === 'Escape') {
        setQuery('');
        setFocusedIdx(-1);
        inputRef.current?.blur();
      }
    },
    [filtered, focusedIdx, onItemSelect],
  );

  useEffect(() => {
    setFocusedIdx(-1);
  }, [query, activeCategory]);

  useEffect(() => {
    if (focusedIdx >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`#sidebar-item-${focusedIdx}`);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusedIdx]);

  const starredCount = filtered.filter((t) => t.starred).length;

  return (
    <div
      className={[
        'w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden transition-all duration-500',
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onKeyDown={handleKeyDown}
      style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {filtered.length} available · {starredCount} starred
            </p>
          </div>
          {headerActionIcon !== null && onHeaderAction && (
            <button
              onClick={onHeaderAction}
              className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center transition-colors duration-200 group"
            >
              {headerActionIcon ?? <PlusIcon />}
            </button>
          )}
        </div>

        <SearchInput
          value={query}
          onChange={setQuery}
          onClear={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          inputRef={inputRef}
          focusedIdx={focusedIdx}
          placeholder={searchPlaceholder}
        />

        {query && (
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
            <kbd className="px-1 py-0.5 rounded border border-slate-200 bg-slate-50 font-mono text-slate-500">
              ↑↓
            </kbd>
            <span>navigate</span>
            <kbd className="px-1 py-0.5 rounded border border-slate-200 bg-slate-50 font-mono text-slate-500 ml-1">
              ⏎
            </kbd>
            <span>select</span>
            <kbd className="px-1 py-0.5 rounded border border-slate-200 bg-slate-50 font-mono text-slate-500 ml-1">
              esc
            </kbd>
            <span>clear</span>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="px-5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Categories
        </p>
        <div className="space-y-0.5">
          {categories.map((cat, i) => (
            <CategoryPill
              key={cat.id}
              cat={cat}
              active={activeCategory === cat.id}
              onClick={setActiveCategory}
              animDelay={i * 40}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-5" />

      {/* Item List */}
      <div ref={listRef} className="px-5 py-3 max-h-72 overflow-y-auto" role="listbox" aria-label={title}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {query ? 'Results' : title}
          </p>
          {query && (
            <span className="text-[10px] font-mono text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md">
              {filtered.length} found
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <div className="space-y-1.5">
            {filtered.map((tpl, idx) => (
              <ItemCard
                key={tpl.id}
                item={tpl}
                matchIndices={tpl.matchIndices || []}
                focused={focusedIdx === idx}
                onClick={(item) => onItemSelect?.(item)}
                onToggleStar={onStarToggle ? handleToggleStar : undefined}
                idx={idx}
                colorScheme={categoryColors?.[tpl.category]}
                maxUsage={computedMaxUsage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100">
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
