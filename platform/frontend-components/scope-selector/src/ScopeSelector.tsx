import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  ScopeSelectorProps,
  ScopeSelectorScope,
  ScopeSelectorItem,
  ScopeSelectorValue,
} from './types';

/* ─── internal badge ─── */
const Badge = ({
  letter,
  color,
  size = 'md',
}: {
  letter: string;
  color: string;
  size?: 'sm' | 'md';
}) => {
  const dim = size === 'sm' ? 24 : 32;
  const fontSize = size === 'sm' ? 10 : 12;
  return (
    <span
      className="rounded-lg flex items-center justify-center font-bold text-white shrink-0 shadow-sm"
      style={{
        backgroundColor: color,
        width: dim,
        height: dim,
        fontSize,
        letterSpacing: '0.02em',
      }}
    >
      {letter}
    </span>
  );
};

/* ─── chevron icons ─── */
const ChevronDown = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const ChevronRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#b0b5c4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const BackArrow = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const SearchIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 17a6 6 0 100-12 6 6 0 000 12zM21 21l-4.35-4.35" />
  </svg>
);

const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const PlusIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const RefreshIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

const SettingsIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2zM12 15a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
);

/* ─── singularize helper ─── */
const singularize = (label: string) =>
  label.endsWith('s') ? label.slice(0, -1) : label;

/* ─── main component ─── */
export function ScopeSelector({
  scopes,
  value,
  defaultValue,
  onSelect,
  onCreateClick,
  onManageClick,
  showFooterActions = true,
  placeholder = 'Choose an item',
  width = 340,
  accentColor = '#6C5CE7',
  className,
  compact = false,
  onRefresh,
}: ScopeSelectorProps) {
  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState<ScopeSelectorValue | undefined>(
    defaultValue,
  );
  const current = isControlled ? value : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [activeScope, setActiveScope] = useState<ScopeSelectorScope | null>(null);
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveScope(null);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* auto-focus search on scope drill-in */
  useEffect(() => {
    if (activeScope && searchRef.current) {
      searchRef.current.focus();
    }
  }, [activeScope]);

  const toggle = useCallback(() => {
    setIsOpen((o) => {
      if (o) {
        setActiveScope(null);
        setSearch('');
      }
      return !o;
    });
  }, []);

  const drillIn = useCallback((scope: ScopeSelectorScope) => {
    setActiveScope(scope);
    setSearch('');
  }, []);

  const goBack = useCallback(() => {
    setActiveScope(null);
    setSearch('');
  }, []);

  const selectItem = useCallback(
    (item: ScopeSelectorItem) => {
      if (!activeScope) return;
      const next: ScopeSelectorValue = { scope: activeScope, item };
      if (!isControlled) {
        setInternalValue(next);
      }
      onSelect?.(next);
      setIsOpen(false);
      setActiveScope(null);
      setSearch('');
    },
    [activeScope, isControlled, onSelect],
  );

  const filteredItems = activeScope
    ? activeScope.items.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  const isSelected = (item: ScopeSelectorItem) =>
    current?.item.id === item.id && current?.scope.key === activeScope?.key;

  return (
    <div ref={dropdownRef} className={['relative', className].filter(Boolean).join(' ')} style={{ width }}>
      {/* ─── trigger button ─── */}
      <button
        onClick={toggle}
        className={
          compact
            ? 'w-full flex items-center gap-2.5 px-2 py-1 bg-transparent rounded-md transition-all duration-150 cursor-pointer hover:bg-slate-50'
            : 'w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl border transition-all duration-200 cursor-pointer hover:border-slate-300'
        }
        style={
          compact
            ? { border: 'none', boxShadow: 'none' }
            : {
                borderColor: isOpen ? accentColor : '#e2e5ed',
                boxShadow: isOpen
                  ? `0 0 0 3px ${accentColor}1A, 0 4px 20px rgba(0,0,0,.06)`
                  : '0 1px 3px rgba(0,0,0,.04)',
              }
        }
      >
        {current ? (
          <Badge letter={current.item.badge || '?'} color={current.scope.color} size={compact ? 'sm' : 'md'} />
        ) : (
          <span
            className={compact ? 'w-6 h-6 rounded-lg shrink-0' : 'w-8 h-8 rounded-lg shrink-0'}
            style={{ backgroundColor: '#f1f3f7' }}
          />
        )}
        <div className="flex-1 text-left min-w-0">
          <div
            className="font-semibold uppercase tracking-wider leading-none"
            style={{ color: '#9096a8', fontSize: compact ? 9 : 10, letterSpacing: '0.06em', marginBottom: compact ? 2 : 3 }}
          >
            {current?.scope.label || 'Select Scope'}
          </div>
          <div
            className={compact ? 'text-xs font-semibold truncate leading-tight' : 'text-sm font-semibold truncate leading-tight'}
            style={{ color: '#1e2235' }}
          >
            {current?.item.name || placeholder}
          </div>
        </div>
        <span
          className="transition-transform duration-200 shrink-0"
          style={{
            color: '#9096a8',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ChevronDown size={compact ? 12 : 16} />
        </span>
      </button>

      {/* ─── dropdown panel ─── */}
      {isOpen && (
        <div
          className={['absolute bg-white overflow-hidden', compact ? 'left-0 mt-0.5 rounded-none border-t-0' : 'left-0 right-0 mt-1.5 rounded-xl'].join(' ')}
          style={{
            boxShadow: compact
              ? '0 8px 24px rgba(0,0,0,.10), 0 2px 6px rgba(0,0,0,.05)'
              : '0 12px 48px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06)',
            border: compact ? '1px solid #e2e5ed' : '1px solid #e4e7ed',
            borderTop: compact ? 'none' : undefined,
            zIndex: 50,
            animation: 'scopeSelectorDropIn .18s ease-out',
            minWidth: compact ? '280px' : undefined,
          }}
        >
          {/* ─── LEVEL 1: scope list ─── */}
          {!activeScope && (
            <div>
              <div className="px-4 pt-3.5 pb-1.5">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#9096a8', fontSize: 10, letterSpacing: '0.06em' }}
                >
                  Select Scope
                </span>
              </div>
              <div className={compact ? 'py-1' : 'px-1.5 py-1.5'}>
                {scopes.map((scope) => (
                  <button
                    key={scope.key}
                    onClick={() => drillIn(scope)}
                    onMouseEnter={() => setHovered(scope.key)}
                    onMouseLeave={() => setHovered(null)}
                    className={['w-full flex items-center gap-3 py-2.5 transition-colors duration-100 cursor-pointer', compact ? 'px-4' : 'px-3 rounded-lg'].join(' ')}
                    style={{
                      backgroundColor:
                        hovered === scope.key
                          ? '#f4f5f9'
                          : current?.scope.key === scope.key
                            ? `${accentColor}08`
                            : 'transparent',
                    }}
                  >
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: scope.color + '12', color: scope.color }}
                    >
                      {scope.icon || (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      )}
                    </span>
                    <span className="text-[13px] font-medium flex-1 text-left" style={{ color: '#1e2235' }}>
                      {scope.label}
                    </span>
                    <span
                      className="text-[11px] tabular-nums px-2 py-0.5 rounded-md font-semibold"
                      style={{ backgroundColor: '#f0f1f5', color: '#7c839a' }}
                    >
                      {scope.items.length}
                    </span>
                    <ChevronRight />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── LEVEL 2: item search + list ─── */}
          {activeScope && (
            <div>
              {/* back + header */}
              <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
                <button
                  onClick={goBack}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-100 cursor-pointer"
                  style={{ color: accentColor, backgroundColor: `${accentColor}0D` }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${accentColor}1A`)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${accentColor}0D`)}
                >
                  <BackArrow />
                </button>
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: activeScope.color, fontSize: 10, letterSpacing: '0.06em' }}
                >
                  {activeScope.label}
                </span>
                <span
                  className="text-[10px] tabular-nums font-semibold px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: `${activeScope.color}12`, color: activeScope.color }}
                >
                  {activeScope.items.length}
                </span>
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-100 cursor-pointer ml-auto"
                    style={{ color: '#7c839a', backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f4f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    aria-label="Refresh"
                    title="Refresh"
                  >
                    <RefreshIcon />
                  </button>
                )}
              </div>

              {/* search */}
              <div className="px-3 pb-2">
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-150"
                  style={{ borderColor: '#e2e5ed', backgroundColor: '#f8f9fb' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = accentColor;
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}12`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e5ed';
                    e.currentTarget.style.backgroundColor = '#f8f9fb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span className="shrink-0" style={{ color: '#9096a8' }}>
                    <SearchIcon />
                  </span>
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${activeScope.label.toLowerCase()}...`}
                    className="flex-1 text-[13px] bg-transparent outline-none placeholder-slate-400"
                    style={{ color: '#1e2235' }}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="text-[11px] font-medium px-1.5 py-0.5 rounded-md cursor-pointer transition-colors hover:bg-slate-200"
                      style={{ color: '#7c839a', backgroundColor: '#eef0f4' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* item list */}
              <div className={['overflow-y-auto py-1', compact ? '' : 'px-1.5'].join(' ')} style={{ maxHeight: 240 }}>
                {filteredItems.length === 0 ? (
                  <div className="px-4 py-8 text-center" style={{ color: '#9096a8' }}>
                    <div className="text-sm font-medium">No results found</div>
                    <div className="text-xs mt-1" style={{ color: '#b0b5c4' }}>Try a different search term</div>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectItem(item)}
                      onMouseEnter={() => setHovered(item.id)}
                      onMouseLeave={() => setHovered(null)}
                      className={['w-full flex items-center gap-3 py-2 transition-colors duration-100 cursor-pointer', compact ? 'px-4' : 'px-3 rounded-lg'].join(' ')}
                      style={{
                        backgroundColor: isSelected(item)
                          ? `${accentColor}0A`
                          : hovered === item.id
                            ? '#f4f5f9'
                            : 'transparent',
                      }}
                    >
                      <Badge letter={item.badge || '?'} color={activeScope.color} size="sm" />
                      <span
                        className="text-[13px] font-medium flex-1 text-left truncate"
                        style={{ color: isSelected(item) ? accentColor : '#1e2235' }}
                      >
                        {item.name}
                      </span>
                      {isSelected(item) && (
                        <span className="shrink-0" style={{ color: accentColor }}>
                          <CheckIcon />
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* footer actions */}
              {showFooterActions && (
                <div className={['border-t py-1.5 flex flex-col gap-0.5', compact ? 'px-0' : 'px-2'].join(' ')} style={{ borderColor: '#eef0f4' }}>
                  {onCreateClick && (
                    <button
                      onClick={() => onCreateClick(activeScope)}
                      className={['flex items-center gap-2.5 py-2 text-[13px] font-medium transition-colors duration-100 cursor-pointer w-full', compact ? 'px-4' : 'px-3 rounded-lg'].join(' ')}
                      style={{ color: accentColor }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${accentColor}08`)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <PlusIcon />
                      <span>Create {singularize(activeScope.label)}</span>
                    </button>
                  )}
                  {onManageClick && (
                    <button
                      onClick={() => onManageClick(activeScope)}
                      className={['flex items-center gap-2.5 py-2 text-[13px] font-medium transition-colors duration-100 cursor-pointer w-full', compact ? 'px-4' : 'px-3 rounded-lg'].join(' ')}
                      style={{ color: '#5a6177' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f4f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <SettingsIcon />
                      <span>Manage {activeScope.label.toLowerCase()}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── keyframes ─── */}
      <style>{`
        @keyframes scopeSelectorDropIn {
          from { opacity: 0; transform: translateY(-6px) scale(.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
