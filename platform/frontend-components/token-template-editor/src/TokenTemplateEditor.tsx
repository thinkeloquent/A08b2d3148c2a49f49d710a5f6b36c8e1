import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type {
  TokenTemplateEditorProps,
  TokenEditorFeatures,
  TokenMappings,
  EditorTab,
  TabSwitcherProps,
  TokenRowProps,
  TemplateTextareaProps,
  PreviewPanelProps,
  ExportPanelProps,
  StatsBarProps,
} from './types';
import { extractTokens, highlightTokens, guessType } from './utils';
import {
  CheckIcon,
  WarningIcon,
  LockIcon,
  UnlockIcon,
  TrashIcon,
  CopyIcon,
  ArrowIcon,
  PlusIcon,
  DownloadIcon,
} from './icons';

const DEFAULT_TOKEN_TYPES = ['text', 'number', 'date', 'email', 'url'];

const DEFAULT_FEATURES: Required<TokenEditorFeatures> = {
  showExport: true,
  showLock: true,
  showRequired: true,
  showType: true,
  showDescription: true,
};

function buildGridColumns(f: Required<TokenEditorFeatures>): string {
  const cols = ['40px', '1fr', '36px', '1fr'];
  if (f.showDescription) cols.push('1fr');
  if (f.showType) cols.push('90px');
  if (f.showRequired) cols.push('40px');
  cols.push('40px'); // status
  if (f.showLock) cols.push('36px');
  cols.push('36px'); // remove
  return cols.join(' ');
}

// ─── Sub-components ───

function TabSwitcher({ active, onChange, className, showExport = true }: TabSwitcherProps & { showExport?: boolean }) {
  const tabs: { id: EditorTab; label: string }[] = [
    { id: 'editor', label: 'Token Editor' },
    { id: 'preview', label: 'Live Preview' },
    ...(showExport ? [{ id: 'export' as EditorTab, label: 'Export' }] : []),
  ];
  return (
    <div className={['flex items-center gap-1 bg-slate-100 rounded-lg p-1', className].filter(Boolean).join(' ')}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={[
            'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
            active === t.id
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Legend({ className }: { className?: string }) {
  return (
    <div className={['flex items-center gap-6 text-xs', className].filter(Boolean).join(' ')}>
      <span className="flex items-center gap-1.5">
        <CheckIcon /> <span className="text-slate-500">Mapped — Token has a replacement value</span>
      </span>
      <span className="flex items-center gap-1.5">
        <WarningIcon /> <span className="text-slate-500">Empty — No replacement value set</span>
      </span>
    </div>
  );
}

function TokenRow({
  index,
  token,
  value,
  type,
  locked,
  tokenTypes,
  onValueChange,
  onTypeChange,
  onLockToggle,
  onRemove,
  canRemove,
  features,
  className,
}: TokenRowProps) {
  const status = value.trim() !== '';
  const gridColumns = buildGridColumns(features);
  return (
    <div
      className={[
        'group grid items-center gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50/60 transition-colors duration-150',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ gridTemplateColumns: gridColumns }}
    >
      <span className="text-xs font-mono text-slate-400 text-right tabular-nums">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="flex items-center">
        <span className="inline-flex items-center px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-md text-sm font-mono text-indigo-700 truncate max-w-full">
          {'{{' + token + '}}'}
        </span>
      </div>

      <div className="flex justify-center">
        <ArrowIcon />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={locked}
        placeholder="Enter replacement value…"
        className={[
          'w-full px-3 py-1.5 text-sm border rounded-md outline-none transition-all duration-150',
          locked
            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-white text-slate-700 border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
        ].join(' ')}
      />

      {features.showDescription && (
        <input
          type="text"
          disabled={locked}
          placeholder="Description (optional)"
          className={[
            'w-full px-3 py-1.5 text-sm border rounded-md outline-none transition-all duration-150',
            locked
              ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-white text-slate-500 border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
          ].join(' ')}
        />
      )}

      {features.showType && (
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          disabled={locked}
          className={[
            'w-full px-2 py-1.5 text-xs border rounded-md outline-none transition-all duration-150 appearance-none',
            locked
              ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-white text-slate-600 border-slate-200 focus:border-indigo-400',
          ].join(' ')}
        >
          {tokenTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}

      {features.showRequired && (
        <div className="flex justify-center">
          <div
            className={[
              'w-5 h-5 rounded flex items-center justify-center border transition-all',
              value.trim() !== '' ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300',
            ].join(' ')}
          >
            {value.trim() !== '' && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center">{status ? <CheckIcon /> : <WarningIcon />}</div>

      {features.showLock && (
        <button
          onClick={onLockToggle}
          className="flex justify-center opacity-60 hover:opacity-100 transition-opacity"
          title={locked ? 'Unlock' : 'Lock'}
        >
          {locked ? <LockIcon /> : <UnlockIcon />}
        </button>
      )}

      <button
        onClick={onRemove}
        disabled={!canRemove}
        className={[
          'flex justify-center transition-opacity',
          canRemove ? 'opacity-0 group-hover:opacity-60 hover:!opacity-100' : 'opacity-20 cursor-not-allowed',
        ].join(' ')}
        title="Remove mapping"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

function TemplateTextarea({ value, onChange, className }: TemplateTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const highlighted = useMemo(() => highlightTokens(value), [value]);

  return (
    <div
      className={['relative w-full rounded-lg border border-slate-200 overflow-hidden bg-white', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 z-10">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Template Source</span>
        <span className="text-xs text-slate-400 font-mono">{extractTokens(value).length} tokens detected</span>
      </div>
      <div className="relative mt-10" style={{ height: 220 }}>
        <div
          ref={highlightRef}
          className="absolute inset-0 p-4 text-sm leading-relaxed whitespace-pre-wrap break-words overflow-auto pointer-events-none font-mono text-slate-700"
          dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
          style={{ wordBreak: 'break-word' }}
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          className="absolute inset-0 w-full h-full p-4 text-sm leading-relaxed font-mono text-transparent bg-transparent resize-none outline-none caret-indigo-500"
          style={{ wordBreak: 'break-word' }}
        />
      </div>
    </div>
  );
}

function PreviewPanel({ template, mappings, onCopy, className }: PreviewPanelProps) {
  const resolved = useMemo(() => {
    let result = template;
    Object.entries(mappings).forEach(([token, { value }]) => {
      const regex = new RegExp(`\\{\\{${token}\\}\\}`, 'g');
      if (value.trim()) {
        result = result.replace(regex, value);
      } else {
        result = result.replace(regex, `⟨${token}⟩`);
      }
    });
    return result;
  }, [template, mappings]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(resolved).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(resolved);
    });
  }, [resolved, onCopy]);

  return (
    <div
      className={['rounded-lg border border-slate-200 bg-white overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resolved Output</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
        >
          <CopyIcon />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div
        className="p-5 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-mono max-h-96 overflow-auto"
        style={{ minHeight: 180 }}
      >
        {resolved}
      </div>
    </div>
  );
}

function ExportPanel({ template, mappings, onCopy, onDownload, className }: ExportPanelProps) {
  const jsonExport = useMemo(() => {
    const tokens: Record<string, { value: string; type: string }> = {};
    Object.entries(mappings).forEach(([k, v]) => {
      tokens[k] = { value: v.value, type: v.type };
    });
    return JSON.stringify({ template, tokens }, null, 2);
  }, [template, mappings]);

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(jsonExport).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(jsonExport);
    });
  };

  return (
    <div
      className={['rounded-lg border border-slate-200 bg-white overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">JSON Export</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
          >
            <CopyIcon /> {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <button
            onClick={() => onDownload?.(jsonExport)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
          >
            <DownloadIcon /> Download
          </button>
        </div>
      </div>
      <pre className="p-5 text-xs leading-relaxed text-slate-600 font-mono overflow-auto max-h-96 bg-slate-50/50">
        {jsonExport}
      </pre>
    </div>
  );
}

function StatsBar({ mappings, className }: StatsBarProps) {
  const total = Object.keys(mappings).length;
  const filled = Object.values(mappings).filter((m) => m.value.trim() !== '').length;
  const empty = total - filled;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;

  return (
    <div className={['flex items-center gap-6', className].filter(Boolean).join(' ')}>
      <div className="flex items-center gap-2">
        <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-medium text-slate-600 tabular-nums">{pct}%</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>
          <span className="font-semibold text-slate-700">{total}</span> tokens
        </span>
        <span>
          <span className="font-semibold text-green-600">{filled}</span> mapped
        </span>
        <span>
          <span className="font-semibold text-amber-600">{empty}</span> empty
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───

export function TokenTemplateEditor({
  initialTemplate = '',
  defaultValues = {},
  tokenTypes = DEFAULT_TOKEN_TYPES,
  onChange,
  onCopy,
  onDownload,
  initialTab = 'editor',
  title = 'Template Token Mapper',
  description = 'Define your text template, then map each token to a replacement value.',
  titleIcon,
  className,
  headerExtra,
  features: featuresProp,
}: TokenTemplateEditorProps) {
  const f = useMemo<Required<TokenEditorFeatures>>(
    () => ({ ...DEFAULT_FEATURES, ...featuresProp }),
    [featuresProp],
  );
  const gridColumns = useMemo(() => buildGridColumns(f), [f]);

  const [template, setTemplate] = useState(initialTemplate);
  const [activeTab, setActiveTab] = useState<EditorTab>(initialTab);
  const [mappings, setMappings] = useState<TokenMappings>({});
  const [customTokens, setCustomTokens] = useState<string[]>([]);
  const [newTokenName, setNewTokenName] = useState('');
  const [showAddRow, setShowAddRow] = useState(false);

  const detectedTokens = useMemo(() => extractTokens(template), [template]);

  useEffect(() => {
    setMappings((prev) => {
      const next: TokenMappings = {};
      const allTokens = [...detectedTokens, ...customTokens];
      allTokens.forEach((token) => {
        if (prev[token]) {
          next[token] = prev[token];
        } else {
          next[token] = {
            value: defaultValues[token] || '',
            type: guessType(token),
            locked: false,
          };
        }
      });
      return next;
    });
  }, [detectedTokens, customTokens, defaultValues]);

  useEffect(() => {
    onChange?.({ template, mappings });
  }, [template, mappings, onChange]);

  const updateMapping = useCallback((token: string, field: string, val: string | boolean) => {
    setMappings((prev) => ({
      ...prev,
      [token]: { ...prev[token], [field]: val },
    }));
  }, []);

  const removeCustomToken = useCallback((token: string) => {
    setCustomTokens((prev) => prev.filter((t) => t !== token));
    setMappings((prev) => {
      const next = { ...prev };
      delete next[token];
      return next;
    });
  }, []);

  const addCustomToken = useCallback(() => {
    const name = newTokenName.trim().replace(/\s+/g, '_').toLowerCase();
    if (!name || mappings[name]) return;
    setCustomTokens((prev) => [...prev, name]);
    setNewTokenName('');
    setShowAddRow(false);
  }, [newTokenName, mappings]);

  const allTokens = useMemo(
    () => [...detectedTokens, ...customTokens.filter((t) => !detectedTokens.includes(t))],
    [detectedTokens, customTokens],
  );

  return (
    <div
      className={['min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="flex items-center gap-2">
                {titleIcon}
                <h1 className="text-xl font-semibold text-slate-800 tracking-tight">{title}</h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">{description}</p>
            </div>
            <div className="flex items-center gap-3">
              {headerExtra}
              <TabSwitcher active={activeTab} onChange={setActiveTab} showExport={f.showExport} />
            </div>
          </div>
        </div>

        {/* Template Source */}
        <div className="mb-6">
          <TemplateTextarea value={template} onChange={setTemplate} />
        </div>

        {/* Content by Tab */}
        {activeTab === 'editor' && (
          <div>
            {/* Legend + Stats */}
            <div className="flex items-center justify-between mb-4">
              <Legend />
              <StatsBar mappings={mappings} />
            </div>

            {/* Mapping Table */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Table Header */}
              <div
                className="grid items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider"
                style={{ gridTemplateColumns: gridColumns }}
              >
                <span className="text-right">#</span>
                <span>Token</span>
                <span></span>
                <span>Replacement Value</span>
                {f.showDescription && <span>Description</span>}
                {f.showType && <span>Type</span>}
                {f.showRequired && <span className="text-center">Req</span>}
                <span className="text-center">Status</span>
                {f.showLock && <span></span>}
                <span></span>
              </div>

              {/* Rows */}
              {allTokens.map((token, i) => (
                <TokenRow
                  key={token}
                  index={i}
                  token={token}
                  value={mappings[token]?.value || ''}
                  type={mappings[token]?.type || 'text'}
                  locked={mappings[token]?.locked || false}
                  tokenTypes={tokenTypes}
                  onValueChange={(v) => updateMapping(token, 'value', v)}
                  onTypeChange={(v) => updateMapping(token, 'type', v)}
                  onLockToggle={() => updateMapping(token, 'locked', !mappings[token]?.locked)}
                  onRemove={() => removeCustomToken(token)}
                  canRemove={customTokens.includes(token)}
                  features={f}
                />
              ))}

              {/* Add Token Row */}
              {showAddRow ? (
                <div
                  className="grid items-center gap-3 px-4 py-3 bg-indigo-50/40 border-t border-indigo-100"
                  style={{ gridTemplateColumns: '40px 1fr 36px 1fr auto' }}
                >
                  <span className="text-xs text-indigo-400 text-right">+</span>
                  <input
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomToken()}
                    placeholder="new_token_name"
                    autoFocus
                    className="px-3 py-1.5 text-sm font-mono border border-indigo-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-200 bg-white text-indigo-700"
                  />
                  <span></span>
                  <span className="text-xs text-slate-400">Press Enter to add</span>
                  <div className="flex gap-2">
                    <button
                      onClick={addCustomToken}
                      className="px-3 py-1 text-xs font-medium text-white bg-indigo-500 rounded-md hover:bg-indigo-600 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddRow(false);
                        setNewTokenName('');
                      }}
                      className="px-3 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddRow(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-indigo-500 hover:bg-indigo-50/60 transition-colors border-t border-slate-100"
                >
                  <PlusIcon /> Add Custom Token
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'preview' && <PreviewPanel template={template} mappings={mappings} onCopy={onCopy} />}

        {f.showExport && activeTab === 'export' && (
          <ExportPanel template={template} mappings={mappings} onCopy={onCopy} onDownload={onDownload} />
        )}
      </div>
    </div>
  );
}
