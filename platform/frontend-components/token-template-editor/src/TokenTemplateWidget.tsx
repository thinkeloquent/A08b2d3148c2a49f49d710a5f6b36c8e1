import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { TokenTemplateWidgetProps, WidgetTab, TemplateVariable } from './types';
import { extractTokens, TOKEN_REGEX } from './utils';
import { DownloadIcon, CopyIcon } from './icons';

/** Resolve a user value: if it names a sampleData key, return the sample value. */
function resolveValue(raw: string, sampleData: Record<string, string>): string {
  const trimmed = raw.trim();
  if (trimmed && sampleData[trimmed] !== undefined && sampleData[trimmed] !== '') {
    return sampleData[trimmed];
  }
  return raw;
}

function resolveTemplate(
  template: string,
  values: Record<string, string>,
  sampleData: Record<string, string>,
): string {
  return template.replace(new RegExp(TOKEN_REGEX.source, TOKEN_REGEX.flags), (match, name) => {
    const userVal = values[name];
    if (userVal !== undefined && userVal !== '') return resolveValue(userVal, sampleData);
    if (sampleData[name] !== undefined && sampleData[name] !== '') return sampleData[name];
    return match;
  });
}

function highlightTokens(template: string): string {
  return template.replace(new RegExp(TOKEN_REGEX.source, TOKEN_REGEX.flags), (match) => {
    return `<mark class="bg-indigo-100 text-indigo-700 rounded px-0.5 font-mono">${match}</mark>`;
  });
}

function highlightResolved(
  template: string,
  values: Record<string, string>,
  sampleData: Record<string, string>,
): string {
  return template.replace(new RegExp(TOKEN_REGEX.source, TOKEN_REGEX.flags), (match, name) => {
    const userVal = values[name];
    if (userVal !== undefined && userVal !== '') {
      const resolved = resolveValue(userVal, sampleData);
      return `<mark class="bg-green-100 text-green-800 rounded px-0.5 font-mono">${resolved}</mark>`;
    }
    if (sampleData[name] !== undefined && sampleData[name] !== '') {
      return `<mark class="bg-green-100 text-green-800 rounded px-0.5 font-mono">${sampleData[name]}</mark>`;
    }
    return `<mark class="bg-amber-100 text-amber-700 rounded px-0.5 font-mono">${match}</mark>`;
  });
}

const SCROLLBAR_CSS = `
  .ttw-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
  .ttw-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
  .ttw-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  .ttw-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

// ─── Autocomplete input ───

function AutocompleteInput({
  value,
  onChange,
  placeholder,
  suggestions,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  suggestions: TemplateVariable[];
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!filter) return suggestions;
    const q = filter.toLowerCase();
    return suggestions.filter(
      (v) => v.name.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q),
    );
  }, [suggestions, filter]);

  useEffect(() => {
    setActiveIdx(0);
  }, [filtered.length]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = useCallback(
    (name: string) => {
      onChange(name);
      setOpen(false);
      setFilter('');
    },
    [onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[activeIdx]) {
      e.preventDefault();
      select(filtered[activeIdx].name);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (suggestions.length > 0) {
              setFilter(e.target.value);
              setOpen(true);
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setFilter(value);
              setOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
        />
        {suggestions.length > 0 && (
          <button
            type="button"
            onClick={() => { setOpen(!open); inputRef.current?.focus(); }}
            className="shrink-0 p-1 text-slate-400 hover:text-indigo-500 transition-colors"
            title="Show suggestions"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-40 overflow-auto bg-white border border-slate-200 rounded-lg shadow-lg">
          {filtered.map((v, i) => (
            <button
              key={v.name}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(v.name); }}
              onMouseEnter={() => setActiveIdx(i)}
              className={[
                'w-full text-left px-3 py-1.5 flex items-center gap-2 text-xs transition-colors',
                i === activeIdx ? 'bg-indigo-50' : 'hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="font-mono text-indigo-600 shrink-0">{v.name}</span>
              <span className="text-slate-400 truncate">{v.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab bar ───

const TAB_DEFS: { id: WidgetTab; label: string }[] = [
  { id: 'template', label: 'Template' },
  { id: 'tokens', label: 'Token Replacement' },
  { id: 'preview', label: 'Preview' },
];

function WidgetTabBar({
  active,
  onChange,
  tokenCount,
  filledCount,
}: {
  active: WidgetTab;
  onChange: (t: WidgetTab) => void;
  tokenCount: number;
  filledCount: number;
}) {
  return (
    <div className="flex items-center gap-1 px-4 bg-slate-50 border-b border-slate-200">
      {TAB_DEFS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={[
            'relative px-3 py-2.5 text-xs font-medium transition-colors',
            active === t.id
              ? 'text-indigo-600'
              : 'text-slate-500 hover:text-slate-700',
          ].join(' ')}
        >
          <span className="flex items-center gap-1.5">
            {t.label}
            {t.id === 'tokens' && tokenCount > 0 && (
              <span
                className={[
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full',
                  filledCount === tokenCount
                    ? 'bg-green-100 text-green-700'
                    : 'bg-indigo-100 text-indigo-600',
                ].join(' ')}
              >
                {filledCount}/{tokenCount}
              </span>
            )}
          </span>
          {active === t.id && (
            <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-indigo-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Sample row picker ───

function SampleRowPicker({
  rows,
  activeIndex,
  onChange,
}: {
  rows: Record<string, string>[];
  activeIndex: number;
  onChange: (i: number) => void;
}) {
  // Build a short label from the first 2–3 non-empty values
  const label = (row: Record<string, string>) => {
    const vals = Object.values(row).filter(Boolean);
    return vals.slice(0, 3).join(' / ') || `Row`;
  };

  return (
    <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border-b border-slate-100">
      <span className="text-[11px] font-medium text-slate-500 shrink-0">Sample row:</span>
      <div className="flex items-center gap-1 overflow-x-auto">
        {rows.map((row, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={[
              'shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors truncate max-w-[200px]',
              i === activeIndex
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600',
            ].join(' ')}
            title={label(row)}
          >
            <span className="tabular-nums">{i + 1}.</span>{' '}
            {label(row)}
          </button>
        ))}
      </div>
      <span className="shrink-0 text-[10px] text-slate-400">
        {rows.length} row{rows.length !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

// ─── Sample data panel ───

function SampleDataPanel({
  data,
  tokens,
}: {
  data: Record<string, string>;
  tokens: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(data).filter(([, v]) => v !== '');
  const matchedCount = tokens.filter((t) => data[t]?.trim()).length;

  return (
    <div className="border-b border-slate-100">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-2 bg-indigo-50/50 hover:bg-indigo-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-[11px] font-medium text-indigo-600">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M3.5 4.5h5M3.5 6.5h5M3.5 8.5h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          Sample Data
          <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-100 text-indigo-700">
            {entries.length} fields
          </span>
          {matchedCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-green-100 text-green-700">
              {matchedCount} matched
            </span>
          )}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={['text-indigo-400 transition-transform', expanded ? 'rotate-180' : ''].join(' ')}
        >
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {expanded && (
        <div className="px-5 py-3 bg-indigo-50/30 max-h-48 overflow-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="text-left py-1 pr-3 font-medium">Field</th>
                <th className="text-left py-1 font-medium">Value</th>
                <th className="text-center py-1 pl-2 font-medium w-16">Match</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([key, val]) => {
                const isMatch = tokens.includes(key);
                return (
                  <tr key={key} className="border-b border-slate-100/60">
                    <td className="py-1.5 pr-3 font-mono text-indigo-600 whitespace-nowrap">{key}</td>
                    <td className="py-1.5 text-slate-600 truncate max-w-[240px]" title={val}>{val}</td>
                    <td className="py-1.5 pl-2 text-center">
                      {isMatch ? (
                        <span className="text-green-600">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="inline">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-slate-300">&mdash;</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main widget ───

export function TokenTemplateWidget({
  template,
  title,
  version,
  onLoad,
  loadLabel = 'Load into Editor',
  loadHint = 'This will replace current template content',
  maxHeight = 320,
  headerExtra,
  footerExtra,
  hideFooter = false,
  defaultValues = {},
  onTokenValuesChange,
  variables = [],
  sampleRows = [],
  initialTab = 'template',
  className,
}: TokenTemplateWidgetProps) {
  const tokens = useMemo(() => extractTokens(template), [template]);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const t of extractTokens(template)) {
      init[t] = defaultValues[t] ?? '';
    }
    return init;
  });

  const [activeTab, setActiveTab] = useState<WidgetTab>(initialTab);
  const [copied, setCopied] = useState(false);
  const [sampleIdx, setSampleIdx] = useState(0);

  const handleValueChange = useCallback(
    (token: string, val: string) => {
      setValues((prev) => {
        const next = { ...prev, [token]: val };
        onTokenValuesChange?.(next);
        return next;
      });
    },
    [onTokenValuesChange],
  );

  const filledCount = useMemo(
    () => Object.values(values).filter((v) => v.trim() !== '').length,
    [values],
  );

  // Active sample row data (empty object if no rows)
  const activeSample = sampleRows[sampleIdx] ?? {};

  const highlightedTemplate = useMemo(() => highlightTokens(template), [template]);
  const highlightedPreview = useMemo(
    () => highlightResolved(template, values, activeSample),
    [template, values, activeSample],
  );
  const resolved = useMemo(
    () => resolveTemplate(template, values, activeSample),
    [template, values, activeSample],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(resolved).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [resolved]);

  const scrollStyle = { maxHeight, overflowX: 'auto' as const, overflowY: 'scroll' as const, scrollbarWidth: 'thin' as const, scrollbarGutter: 'stable' as const };

  return (
    <div
      className={[
        'rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <style dangerouslySetInnerHTML={{ __html: SCROLLBAR_CSS }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-semibold text-slate-700 truncate">
            {title}
          </h3>
          {headerExtra}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {version && (
            <span className="text-xs font-mono text-indigo-500">{version}</span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <WidgetTabBar
        active={activeTab}
        onChange={setActiveTab}
        tokenCount={tokens.length}
        filledCount={filledCount}
      />

      {/* ── Tab: Template ── */}
      {activeTab === 'template' && (
        <div
          className="ttw-scroll px-5 py-4 font-mono text-sm leading-relaxed text-slate-700 whitespace-pre-wrap bg-slate-50/40"
          style={scrollStyle}
        >
          <div
            dangerouslySetInnerHTML={{ __html: highlightedTemplate }}
            style={{ wordBreak: 'break-word' }}
          />
        </div>
      )}

      {/* ── Tab: Token Replacement ── */}
      {activeTab === 'tokens' && (
        <div className="ttw-scroll" style={scrollStyle}>
          {tokens.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs text-slate-400">
              No tokens detected in this template.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tokens.map((token) => (
                <div key={token} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                  <div className="shrink-0 pt-1">
                    <span className="inline-flex items-center px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-md text-xs font-mono text-indigo-700 whitespace-nowrap">
                      {'{{' + token + '}}'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <AutocompleteInput
                      value={values[token] ?? ''}
                      onChange={(v) => handleValueChange(token, v)}
                      placeholder={`Replace {{${token}}}...`}
                      suggestions={variables}
                    />
                  </div>
                  <div className="shrink-0 pt-1.5">
                    {(values[token] ?? '').trim() !== '' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
                          <path d="M6 4v2.5M6 8v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          {tokens.length > 0 && (
            <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                {filledCount} of {tokens.length} tokens replaced
              </span>
              {filledCount > 0 && (
                <button
                  onClick={() => {
                    const cleared: Record<string, string> = {};
                    for (const t of tokens) cleared[t] = '';
                    setValues(cleared);
                    onTokenValuesChange?.(cleared);
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Preview ── */}
      {activeTab === 'preview' && (
        <div>
          {/* Sample row picker */}
          {sampleRows.length > 0 && (
            <SampleRowPicker
              rows={sampleRows}
              activeIndex={sampleIdx}
              onChange={setSampleIdx}
            />
          )}

          {/* Sample data detail panel */}
          {sampleRows.length > 0 && Object.keys(activeSample).length > 0 && (
            <SampleDataPanel data={activeSample} tokens={tokens} />
          )}

          {/* Resolved preview with highlighting */}
          <div
            className="ttw-scroll px-5 py-4 font-mono text-sm leading-relaxed text-slate-700 whitespace-pre-wrap bg-slate-50/40"
            style={scrollStyle}
          >
            <div
              dangerouslySetInnerHTML={{ __html: highlightedPreview }}
              style={{ wordBreak: 'break-word' }}
            />
          </div>

          {/* Copy bar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              {(() => {
                const unresolvedCount = tokens.filter(
                  (t) => !(values[t]?.trim()) && !(activeSample[t]?.trim()),
                ).length;
                if (unresolvedCount === 0) return 'All tokens resolved';
                return `${unresolvedCount} unresolved token${unresolvedCount !== 1 ? 's' : ''} shown in amber`;
              })()}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
            >
              <CopyIcon />
              {copied ? 'Copied!' : 'Copy resolved'}
            </button>
          </div>
        </div>
      )}

      {/* Footer action */}
      {!hideFooter && (
        <div className="flex items-center gap-3 px-5 py-3 border-t border-slate-100">
          {onLoad && (
            <button
              onClick={() => onLoad(resolved)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <DownloadIcon />
              {loadLabel}
            </button>
          )}
          {loadHint && (
            <span className="text-xs text-slate-400">{loadHint}</span>
          )}
          {footerExtra}
        </div>
      )}
    </div>
  );
}
