import { useState, useRef, useMemo, useEffect } from 'react';
import type {
  PanelLeftSidebarSearchProps,
  FacetMap,
  Operator,
  ChipFilter,
  InlineToken,
  StructuredFilter,
  SearchHint,
  TokenChipProps,
  FilterPaletteProps,
  FuzzyHighlightProps,
} from './types';
import { fuzzy } from './fuzzy';

/* ═══════════════════════════════════════════════════════════════════
   FUZZY HIGHLIGHT
   ═══════════════════════════════════════════════════════════════════ */

export function FuzzyHighlight({ text, idx, highlightClassName, className }: FuzzyHighlightProps) {
  if (!idx.length) return <span className={className}>{text}</span>;
  const s = new Set(idx);
  const hlClass = highlightClassName || 'bg-transparent text-teal-600 font-semibold';
  return (
    <span className={className}>
      {text.split('').map((c, i) =>
        s.has(i) ? (
          <mark key={i} className={hlClass}>{c}</mark>
        ) : (
          <span key={i}>{c}</span>
        ),
      )}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TOKEN PARSER
   ═══════════════════════════════════════════════════════════════════ */

function parseTokens(raw: string, facets: FacetMap): { tokens: InlineToken[]; freeText: string } {
  const tokens: InlineToken[] = [];
  let freeText = raw;
  const keys = Object.keys(facets).join('|');
  if (!keys) return { tokens: [], freeText: raw.trim() };

  const regex = new RegExp(`(${keys}):("([^"]+)"|(\\S+))`, 'gi');
  let m: RegExpExecArray | null;
  while ((m = regex.exec(raw)) !== null) {
    const key = m[1]!.toLowerCase();
    const val = m[3] || m[4] || '';
    const facet = facets[key];
    if (facet) {
      const best = facet.values
        .map((v) => ({ v, ...fuzzy(v, val) }))
        .filter((x) => x.hit)
        .sort((a, b) => b.score - a.score)[0];
      tokens.push({ key, value: best ? best.v : val, raw: m[0]!, resolved: !!best });
    }
    freeText = freeText.replace(m[0], '');
  }
  return { tokens, freeText: freeText.trim() };
}

/* ═══════════════════════════════════════════════════════════════════
   TOKEN CHIP
   ═══════════════════════════════════════════════════════════════════ */

function TokenChip({ token, facet, onRemove, className }: TokenChipProps) {
  const base = 'inline-flex items-center gap-1 pl-1.5 pr-1 py-0.5 rounded-md text-xs font-medium border transition-all duration-150 flex-shrink-0';
  return (
    <span
      className={[base, className].filter(Boolean).join(' ')}
      style={{
        borderColor: facet.accent + '44',
        background: facet.accent + '0c',
        color: facet.accent,
      }}
    >
      <span className="opacity-60 text-[10px]">{facet.icon}</span>
      <span className="opacity-60 font-normal">{facet.label}</span>
      <span className="font-semibold" style={{ color: facet.accent }}>
        {token.value}
      </span>
      <button
        onClick={onRemove}
        className="ml-0.5 w-3.5 h-3.5 rounded flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
        style={{ color: facet.accent }}
      >
        ×
      </button>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FILTER MODAL
   ═══════════════════════════════════════════════════════════════════ */

const OPERATOR_SYMBOLS: Record<string, string> = { is: '=', 'is not': '≠', contains: '∋' };

function FilterModal({ facets, operators, activeFilters, onAdd, onClose }: FilterPaletteProps) {
  const [step, setStep] = useState(0);
  const [facetKey, setFacetKey] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [pending, setPending] = useState<ChipFilter[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const facet = facetKey ? facets[facetKey] : null;

  const togglePending = (val: string) => {
    if (!facetKey || !operator) return;
    setPending((prev) => {
      const idx = prev.findIndex((p) => p.key === facetKey && p.operator === operator && p.value === val);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, { key: facetKey, operator, value: val }];
    });
  };

  const isPending = (val: string) =>
    facetKey != null && operator != null && pending.some((p) => p.key === facetKey && p.operator === operator && p.value === val);

  const handleApply = () => {
    for (const p of pending) onAdd(p);
    onClose();
  };

  return (
    <div ref={ref} className="absolute inset-x-0 top-full z-50 mt-2">
      <div className="bg-white rounded-2xl shadow-2xl shadow-gray-300/30 border border-gray-200 w-full max-h-[60vh] flex flex-col">
        {/* Header with breadcrumb */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            <button onClick={() => { setStep(0); setFacetKey(null); setOperator(null); }} className={step >= 0 ? 'text-gray-600' : ''}>
              Filter
            </button>
            {step >= 1 && facet && (
              <>
                <span className="text-gray-300">›</span>
                <button onClick={() => { setStep(1); setOperator(null); }} className="text-gray-600" style={{ color: facet.accent }}>
                  {facet.label}
                </button>
              </>
            )}
            {step >= 2 && (
              <>
                <span className="text-gray-300">›</span>
                <span className="text-gray-600">{operator}</span>
              </>
            )}
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 text-sm transition-colors">×</button>
        </div>

        {/* Pending chips preview */}
        {pending.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-5 pt-3 pb-2 border-b border-gray-100">
            {pending.map((p, i) => (
              <TokenChip
                key={`p-${i}`}
                token={{ key: p.key, value: p.value }}
                facet={facets[p.key]!}
                onRemove={() => setPending((prev) => prev.filter((_, j) => j !== i))}
              />
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {/* Step 0: Choose facet */}
          {step === 0 && (
            <div className="py-1">
              {Object.entries(facets).map(([key, f]) => (
                <button
                  key={key}
                  onClick={() => { setFacetKey(key); setStep(1); }}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: f.accent + '14', color: f.accent }}>
                    {f.icon}
                  </span>
                  <span className="font-medium">{f.label}</span>
                  <span className="ml-auto text-xs text-gray-400">{f.values.length}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Choose operator */}
          {step === 1 && (
            <div className="py-1">
              {operators.map((op) => (
                <button
                  key={op}
                  onClick={() => { setOperator(op); setStep(2); }}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-mono font-bold">
                    {OPERATOR_SYMBOLS[op] || op}
                  </span>
                  <span className="font-medium">{op}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Choose values (multi-select) */}
          {step === 2 && facet && facetKey && (
            <div className="py-1 max-h-52 overflow-y-auto">
              {facet.values.map((val) => {
                const isExisting = activeFilters.some((f) => f.key === facetKey && f.value === val);
                const isChecked = isPending(val);
                return (
                  <button
                    key={val}
                    disabled={isExisting}
                    onClick={() => togglePending(val)}
                    className={[
                      'w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors',
                      isExisting ? 'opacity-40 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors',
                        isChecked ? 'border-teal-500 bg-teal-500 text-white' : 'border-gray-300',
                        isExisting ? 'border-gray-200 bg-gray-100' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      {(isChecked || isExisting) && '✓'}
                    </span>
                    <span className="w-2 h-2 rounded-full" style={{ background: facet.accent }} />
                    <span className="font-medium">{val}</span>
                  </button>
                );
              })}
              {/* Add more from another facet */}
              <button
                onClick={() => { setStep(0); setFacetKey(null); setOperator(null); }}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-xs text-teal-600 font-semibold hover:bg-gray-50 transition-colors border-t border-gray-100 mt-1"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Add another filter
              </button>
            </div>
          )}
        </div>

        {/* Footer with Apply */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <button
            onClick={onClose}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={pending.length === 0}
            onClick={handleApply}
            className={[
              'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
              pending.length > 0
                ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed',
            ].join(' ')}
          >
            Apply{pending.length > 0 ? ` (${pending.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

const DEFAULT_OPERATORS: Operator[] = ['is', 'is not', 'contains'];

export function PanelLeftSidebarSearch<T>({
  items,
  facets,
  getSearchableFields,
  getFacetValue,
  renderItem,
  renderGroupHeader,
  getGroupKey,
  groupByLabel = 'Group',
  defaultGroupByEnabled = true,
  operators = DEFAULT_OPERATORS,
  placeholder = 'Search or type key:value...',
  narrowPlaceholder = 'Narrow further...',
  title,
  subtitle,
  headerIcon,
  hints,
  emptyTitle = 'No results match',
  emptyMessage = 'Try adjusting your search or removing filters',
  footer,
  className,
  children,
}: PanelLeftSidebarSearchProps<T>) {
  const [rawInput, setRawInput] = useState('');
  const [chips, setChips] = useState<ChipFilter[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [groupByType, setGroupByType] = useState(defaultGroupByEnabled);
  const inputRef = useRef<HTMLInputElement>(null);
  const chipsContainerRef = useRef<HTMLDivElement>(null);
  const [chipsOverflowing, setChipsOverflowing] = useState(false);

  // Parse inline tokens
  const { tokens: inlineTokens, freeText } = useMemo(() => parseTokens(rawInput, facets), [rawInput, facets]);

  // Detect chips overflow
  const totalChipCount = chips.length + inlineTokens.length;
  useEffect(() => {
    const el = chipsContainerRef.current;
    if (!el) { setChipsOverflowing(false); return; }
    setChipsOverflowing(el.scrollHeight > el.clientHeight);
  }, [totalChipCount]);

  // All active filters
  const allFilters = useMemo<StructuredFilter[]>(() => {
    return [
      ...chips.map((c) => ({ key: c.key, op: c.operator, value: c.value, source: 'chip' as const })),
      ...inlineTokens.map((t) => ({ key: t.key, op: 'is', value: t.value, source: 'inline' as const })),
    ];
  }, [chips, inlineTokens]);

  // Filter + fuzzy-match
  const results = useMemo(() => {
    let pool = [...items];

    // Structured filters
    for (const f of allFilters) {
      pool = pool.filter((item) => {
        const fieldVal = getFacetValue(item, f.key);
        const lower = fieldVal.toLowerCase();
        const qLower = f.value.toLowerCase();
        if (f.op === 'is') return lower.includes(qLower);
        if (f.op === 'is not') return !lower.includes(qLower);
        if (f.op === 'contains') return lower.includes(qLower);
        return true;
      });
    }

    // Fuzzy search on freetext
    if (freeText) {
      pool = pool
        .map((item) => {
          const fields = getSearchableFields(item);
          const nf = fuzzy(fields.name, freeText);
          const df = fuzzy(fields.description, freeText);
          const tf = (fields.tags || []).reduce(
            (best, t) => {
              const m = fuzzy(t, freeText);
              return m.score > best.score ? m : best;
            },
            { hit: false, score: -999, idx: [] as number[] },
          );
          const score = Math.max(
            nf.hit ? nf.score + 30 : -999,
            df.hit ? df.score : -999,
            tf.hit ? tf.score + 10 : -999,
          );
          return { item, _score: score, _hit: score > -999 };
        })
        .filter((r) => r._hit)
        .sort((a, b) => b._score - a._score)
        .map((r) => r.item);
    }

    return pool;
  }, [items, allFilters, freeText, getFacetValue, getSearchableFields]);

  // Group results
  const grouped = useMemo(() => {
    if (!groupByType || !getGroupKey) return { All: results };
    const g: Record<string, T[]> = {};
    for (const r of results) {
      const key = getGroupKey(r);
      (g[key] = g[key] || []).push(r);
    }
    return g;
  }, [results, groupByType, getGroupKey]);

  const addChip = (filter: ChipFilter) =>
    setChips((prev) => {
      const exists = prev.some((c) => c.key === filter.key && c.operator === filter.operator && c.value === filter.value)
        || inlineTokens.some((t) => t.key === filter.key && t.value === filter.value);
      return exists ? prev : [...prev, filter];
    });
  const removeChip = (idx: number) => setChips((prev) => prev.filter((_, i) => i !== idx));
  const removeInlineToken = (tokenRaw: string) =>
    setRawInput((prev) => prev.replace(tokenRaw, '').replace(/\s+/g, ' ').trim());

  const rootClass = ['flex flex-col h-full', className].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      {/* Header */}
      {(title || headerIcon) && (
        <div className="mb-4 px-1 shrink-0">
          <div className="flex items-center gap-3 mb-1">
            {headerIcon}
            <div>
              {title && <h2 className="text-base font-bold text-gray-900 tracking-tight leading-none">{title}</h2>}
              {subtitle && <p className="text-xs text-gray-400 mt-0.5 font-medium">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-3 shrink-0">
        <div className="flex flex-nowrap items-center gap-2 bg-white rounded-2xl border border-gray-200 shadow-sm px-3 py-2 focus-within:border-teal-400 focus-within:shadow-md focus-within:shadow-teal-100/40 transition-all duration-200">
          {/* Search icon */}
          <svg className="text-gray-400 flex-shrink-0" width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13.5 13.5L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            onFocus={() => setShowHints(true)}
            onBlur={() => setTimeout(() => setShowHints(false), 200)}
            placeholder={allFilters.length > 0 ? narrowPlaceholder : placeholder}
            className="flex-1 min-w-0 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none py-1"
          />

          {/* Clear */}
          {(rawInput || chips.length > 0) && (
            <button
              onClick={() => { setRawInput(''); setChips([]); }}
              className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xs transition-colors flex-shrink-0"
            >
              ×
            </button>
          )}

          {/* Add filter button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className={[
              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex-shrink-0',
              showFilterModal ? 'bg-teal-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-teal-50 hover:text-teal-600',
            ].join(' ')}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Filter
          </button>
        </div>

        {/* Filter chips below search bar */}
        {(inlineTokens.length > 0 || chips.length > 0) && (
          <div className="flex items-start gap-1 mt-2">
            <div
              ref={chipsContainerRef}
              className="flex items-center gap-1.5 flex-wrap px-1 overflow-hidden"
              style={{ maxHeight: '3.25rem' }}
            >
              {inlineTokens.map((t, i) => (
                <TokenChip key={`it-${i}`} token={t} facet={facets[t.key]!} onRemove={() => removeInlineToken(t.raw)} />
              ))}
              {chips.map((c, i) => (
                <TokenChip key={`c-${i}`} token={{ key: c.key, value: c.value }} facet={facets[c.key]!} onRemove={() => removeChip(i)} />
              ))}
            </div>
            {chipsOverflowing && (
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xs transition-colors mt-0.5"
                title="View all filters"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <circle cx="3" cy="8" r="1.5" fill="currentColor" />
                  <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                  <circle cx="13" cy="8" r="1.5" fill="currentColor" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Hint dropdown */}
        {showHints && !rawInput && chips.length === 0 && hints && hints.length > 0 && (
          <div className="absolute z-40 top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/40 overflow-hidden">
            <div className="px-4 pt-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quick syntax</div>
            {hints.map((h: SearchHint, i: number) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                onMouseDown={(e) => { e.preventDefault(); setRawInput(h.syntax + ' '); inputRef.current?.focus(); setShowHints(false); }}
              >
                <code className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded font-medium font-mono">{h.syntax}</code>
                <span className="text-gray-500 text-xs">{h.desc}</span>
              </button>
            ))}
            <div className="border-t border-gray-100 px-4 py-2.5">
              <button
                className="text-xs text-teal-600 font-semibold hover:underline"
                onMouseDown={(e) => { e.preventDefault(); setShowFilterModal(true); setShowHints(false); }}
              >
                Or open the filter palette
              </button>
            </div>
          </div>
        )}

        {/* Filter modal */}
        {showFilterModal && (
          <FilterModal
            facets={facets}
            operators={operators}
            activeFilters={allFilters}
            onAdd={addChip}
            onClose={() => setShowFilterModal(false)}
          />
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 px-1 shrink-0">
        <span className="text-xs text-gray-400 font-medium">
          <span className="text-gray-700 font-semibold">{results.length}</span> result{results.length !== 1 ? 's' : ''}
          {allFilters.length > 0 && (
            <span> · {allFilters.length} filter{allFilters.length !== 1 ? 's' : ''} active</span>
          )}
        </span>
        {getGroupKey && (
          <button
            onClick={() => setGroupByType(!groupByType)}
            className={[
              'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors',
              groupByType ? 'bg-teal-50 text-teal-700' : 'text-gray-400 hover:text-gray-600',
            ].join(' ')}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            {groupByLabel}
          </button>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm font-semibold text-gray-500 mb-1">{emptyTitle}</p>
            <p className="text-xs text-gray-400">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([groupKey, groupItems]) => (
              <div key={groupKey}>
                {groupByType && getGroupKey && Object.keys(grouped).length > 1 && (
                  renderGroupHeader
                    ? renderGroupHeader(groupKey, (groupItems as T[]).length)
                    : (
                      <div className="flex items-center gap-2 mb-2 px-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{groupKey}</span>
                        <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {(groupItems as T[]).length}
                        </span>
                        <div className="flex-1 h-px bg-gray-200/60 ml-2" />
                      </div>
                    )
                )}
                <div className="space-y-0.5">
                  {(groupItems as T[]).map((item, i) => renderItem(item, freeText, i))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {footer && <div className="shrink-0 mt-3">{footer}</div>}

      {children}
    </div>
  );
}
