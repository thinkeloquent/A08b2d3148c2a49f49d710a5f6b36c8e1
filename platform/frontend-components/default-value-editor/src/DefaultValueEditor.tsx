import { useState, useEffect, useRef, useCallback } from 'react';
import { z } from 'zod';
import type { DefaultValueEditorProps, KeyValueEntry, ToastDescriptor } from './types';
import { DefaultIcons } from './DefaultIcons';
import { EntryRow } from './EntryRow';
import { Toast } from './Toast';

let _id = 0;
const uid = () => `kv_${++_id}_${Date.now()}`;

/** Zod schema for JSON object bulk defaults — all values must be non-empty strings */
const JsonDefaultsSchema = z.record(z.string().min(1), z.string().min(1, 'Value must not be empty'));

/** Parse JSON object or YAML key:value map into [key, value][] pairs.
 *  Returns { pairs, error } — error is set when format is invalid. */
function parseBulkDefaults(input: string): { pairs: [string, string][]; error: string | null } {
  const trimmed = input.trim();
  if (!trimmed) return { pairs: [], error: null };

  // Try JSON
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return { pairs: [], error: 'Expected a JSON object with key:value pairs, not an array' };
    if (parsed === null || typeof parsed !== 'object') return { pairs: [], error: 'Expected a JSON object with key:value pairs' };
    const result = JsonDefaultsSchema.safeParse(parsed);
    if (!result.success) {
      const issue = result.error.issues[0];
      return { pairs: [], error: `Invalid JSON: ${issue.path.length ? `"${issue.path[0]}": ` : ''}${issue.message}` };
    }
    const pairs: [string, string][] = Object.entries(result.data).map(([k, v]) => [k.trim(), v.trim()]);
    return { pairs, error: null };
  } catch { /* not JSON — try YAML */ }

  // Try YAML key: value (one per line)
  const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
  const yamlPairs: [string, string][] = [];
  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (!match) return { pairs: [], error: `Invalid line (expected "key: value"): "${line}"` };
    const key = match[1].trim();
    const val = match[2].trim();
    if (!key) return { pairs: [], error: `Empty key in line: "${line}"` };
    if (!val) return { pairs: [], error: `Empty value for key "${key}"` };
    yamlPairs.push([key, val]);
  }
  if (yamlPairs.length === 0) return { pairs: [], error: 'No key:value pairs found' };
  return { pairs: yamlPairs, error: null };
}

export function DefaultValueEditor({
  className,
  entries,
  onEntriesChange,
  onEntryDeleted,
  onEntriesCleared,
  onEntriesImported,
  onExport,
  onCopy,
  title = 'Default Values',
  subtitle = 'Fallback values for fields not present in the CSV.',
  exportFilename = 'default-values.json',
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  searchPlaceholder = 'Filter by key or value\u2026',
  emptyTitle = 'No default values yet',
  emptyDescription = 'Add key-value pairs below to set CSV fallback defaults.',
  icons,
  toastDuration = 4000,
  showSearch: showSearchBtn = true,
  showCopy: showCopyBtn = true,
  showExport: showExportBtn = true,
  showImport: showImportBtn = true,
  showClearAll: showClearBtn = true,
  draggable = true,
  showBulkInsert: showBulkInsertBtn = false,
}: DefaultValueEditorProps) {
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [toast, setToast] = useState<ToastDescriptor | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const newKeyRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  /* duplicate detection */
  const keyCounts: Record<string, number> = {};
  entries.forEach((e) => {
    const k = e.key.toLowerCase();
    keyCounts[k] = (keyCounts[k] || 0) + 1;
  });

  /* filtered entries */
  const filtered = search
    ? entries.filter(
        (e) =>
          e.key.toLowerCase().includes(search.toLowerCase()) ||
          e.value.toLowerCase().includes(search.toLowerCase()),
      )
    : entries;

  /* add */
  const addEntry = () => {
    if (!newKey.trim()) return;
    const newEntry: KeyValueEntry = { id: uid(), key: newKey.trim(), value: newVal.trim() };
    onEntriesChange([...entries, newEntry]);
    setNewKey('');
    setNewVal('');
    newKeyRef.current?.focus();
  };

  /* bulk insert */
  const bulkParsed = bulkText.trim() ? parseBulkDefaults(bulkText) : { pairs: [], error: null };
  const bulkInsert = () => {
    if (bulkParsed.error || bulkParsed.pairs.length === 0) return;
    const newEntries: KeyValueEntry[] = bulkParsed.pairs.map(([k, v]) => ({ id: uid(), key: k, value: v }));
    onEntriesChange([...entries, ...newEntries]);
    setBulkText('');
    setBulkOpen(false);
    setToast({ message: `Inserted ${newEntries.length} defaults` });
  };

  /* update */
  const updateEntry = (id: string, key: string, value: string) => {
    onEntriesChange(entries.map((e) => (e.id === id ? { ...e, key, value } : e)));
  };

  /* delete */
  const deleteEntry = (id: string) => {
    const deleted = entries.find((e) => e.id === id);
    if (!deleted) return;
    const next = entries.filter((e) => e.id !== id);
    onEntriesChange(next);
    onEntryDeleted?.(deleted);
    setToast({
      message: `Removed "${deleted.key}"`,
      action: 'Undo',
      onAction: () => {
        const idx = entries.findIndex((e) => e.id === deleted.id);
        const copy = [...next];
        copy.splice(idx >= 0 ? idx : copy.length, 0, deleted);
        onEntriesChange(copy);
        setToast(null);
      },
    });
  };

  /* clear all */
  const clearAll = () => {
    const snapshot = [...entries];
    onEntriesChange([]);
    onEntriesCleared?.(snapshot);
    setToast({
      message: `Cleared ${snapshot.length} entries`,
      action: 'Undo',
      onAction: () => {
        onEntriesChange(snapshot);
        setToast(null);
      },
    });
  };

  /* export */
  const exportJSON = () => {
    const obj: Record<string, string> = {};
    entries.forEach((e) => { obj[e.key] = e.value; });
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
    onExport?.();
    setToast({ message: 'Exported as JSON' });
  };

  /* import */
  const importJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const obj = JSON.parse(ev.target!.result as string);
          const newEntries: KeyValueEntry[] = Object.entries(obj).map(([k, v]) => ({
            id: uid(),
            key: k,
            value: String(v),
          }));
          onEntriesChange([...entries, ...newEntries]);
          onEntriesImported?.(newEntries.length);
          setToast({ message: `Imported ${newEntries.length} entries` });
        } catch {
          setToast({ message: 'Invalid JSON file' });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  /* copy to clipboard */
  const copyAll = () => {
    const obj: Record<string, string> = {};
    entries.forEach((e) => { obj[e.key] = e.value; });
    navigator.clipboard?.writeText(JSON.stringify(obj, null, 2));
    onCopy?.();
    setToast({ message: 'Copied to clipboard' });
  };

  /* drag & drop */
  const onDragStart = (e: React.DragEvent, idx: number) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  };
  const onDrop = useCallback(
    (e: React.DragEvent, dropIdx: number) => {
      e.preventDefault();
      if (dragIdx === null || dragIdx === dropIdx) {
        setDragIdx(null);
        setOverIdx(null);
        return;
      }
      const copy = [...entries];
      const [moved] = copy.splice(dragIdx, 1);
      copy.splice(dropIdx, 0, moved);
      onEntriesChange(copy);
      setDragIdx(null);
      setOverIdx(null);
    },
    [dragIdx, entries, onEntriesChange],
  );

  const handleNewKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addEntry();
  };

  const baseClass = ['w-full', className].filter(Boolean).join(' ');

  return (
    <div className={baseClass}>
      {/* header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full tabular-nums">
              {entries.length}
            </span>
          </div>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          {showSearchBtn && (
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={[
                'p-2 rounded-lg transition-colors',
                showSearch
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
              ].join(' ')}
              title="Search"
            >
              {icons?.searchIcon ?? DefaultIcons.search(16)}
            </button>
          )}
          {showCopyBtn && (
            <button
              onClick={copyAll}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Copy JSON"
            >
              {icons?.copyIcon ?? DefaultIcons.copy(16)}
            </button>
          )}
          {showExportBtn && (
            <button
              onClick={exportJSON}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Export JSON"
            >
              {icons?.downloadIcon ?? DefaultIcons.download(16)}
            </button>
          )}
          {showImportBtn && (
            <button
              onClick={importJSON}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Import JSON"
            >
              {icons?.uploadIcon ?? DefaultIcons.upload(16)}
            </button>
          )}
          {showBulkInsertBtn && (
            <button
              onClick={() => setBulkOpen(!bulkOpen)}
              className={[
                'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                bulkOpen
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent',
              ].join(' ')}
              title="Bulk insert key:value defaults from clipboard"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
              Bulk Insert
            </button>
          )}
        </div>
      </div>

      {/* search bar */}
      {showSearch && (
        <div className="mb-3 animate-[fade-in_0.2s_ease-out]">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300">
              {icons?.searchIcon ?? DefaultIcons.search(15)}
            </span>
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 text-slate-600 placeholder:text-slate-300"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-500 rounded transition-colors"
              >
                {icons?.closeIcon ?? DefaultIcons.close(13)}
              </button>
            )}
          </div>
          {search && (
            <p className="text-xs text-slate-400 mt-1.5 px-1">
              Showing {filtered.length} of {entries.length} entries
            </p>
          )}
        </div>
      )}

      {/* bulk insert panel */}
      {showBulkInsertBtn && bulkOpen && (
        <div className="mb-3 bg-slate-50 border border-slate-200 rounded-xl p-4 animate-[fade-in_0.2s_ease-out]">
          <p className="text-xs text-slate-500 mb-2">
            Paste default values as a <span className="font-semibold">JSON object</span> or <span className="font-semibold">YAML key: value</span> map:
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={'{"severity": "high", "org": "acme"}\n\nor\n\nseverity: high\norg: acme'}
            rows={4}
            className={[
              'w-full px-3 py-2 text-sm font-mono bg-white border rounded-lg outline-none text-slate-700 placeholder:text-slate-300 resize-y',
              bulkParsed.error
                ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-50'
                : 'border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-50',
            ].join(' ')}
          />
          {bulkText.trim() && bulkParsed.error && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              {bulkParsed.error}
            </p>
          )}
          {bulkText.trim() && !bulkParsed.error && bulkParsed.pairs.length > 0 && (
            <p className="text-xs text-emerald-600 mt-1.5">
              {bulkParsed.pairs.length} default(s) ready to insert
            </p>
          )}
          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={bulkInsert}
              disabled={!bulkText.trim() || !!bulkParsed.error || bulkParsed.pairs.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {DefaultIcons.plus(14)} Insert Defaults
            </button>
            <button
              onClick={() => { setBulkOpen(false); setBulkText(''); }}
              className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm shadow-slate-100/50 overflow-hidden">
        {/* entries list */}
        <div className="p-3 space-y-1.5">
          {filtered.length === 0 && entries.length === 0 && (
            <div className="py-12 flex flex-col items-center gap-3 text-slate-300">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                {icons?.infoIcon ?? DefaultIcons.info(22, 'text-slate-300')}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-400">{emptyTitle}</p>
                <p className="text-xs text-slate-300 mt-0.5">{emptyDescription}</p>
              </div>
            </div>
          )}

          {filtered.length === 0 && entries.length > 0 && search && (
            <div className="py-8 flex flex-col items-center gap-2 text-slate-300">
              {icons?.searchIcon ?? DefaultIcons.search(20)}
              <p className="text-sm text-slate-400">No results for &ldquo;{search}&rdquo;</p>
            </div>
          )}

          {filtered.map((entry) => {
            const realIndex = entries.indexOf(entry);
            return (
              <EntryRow
                key={entry.id}
                entry={entry}
                index={realIndex}
                onUpdate={updateEntry}
                onDelete={deleteEntry}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                isDragging={dragIdx === realIndex}
                isOver={overIdx === realIndex}
                duplicateKey={keyCounts[entry.key.toLowerCase()] > 1}
                draggable={draggable}
                icons={icons}
              />
            );
          })}
        </div>

        {/* divider */}
        <div className="h-px bg-slate-100 mx-3" />

        {/* add new row */}
        <div className="p-3">
          <div className="flex items-center gap-2">
            <input
              ref={newKeyRef}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={handleNewKeyDown}
              placeholder={keyPlaceholder}
              className="w-28 sm:w-36 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-50 text-slate-700 placeholder:text-slate-300 transition-colors"
            />
            <input
              value={newVal}
              onChange={(e) => setNewVal(e.target.value)}
              onKeyDown={handleNewKeyDown}
              placeholder={valuePlaceholder}
              className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-50 text-slate-600 placeholder:text-slate-300 transition-colors"
            />
            <button
              onClick={addEntry}
              disabled={!newKey.trim()}
              className="p-2 rounded-lg border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-300 transition-all shrink-0"
              title="Add entry"
            >
              {icons?.plusIcon ?? DefaultIcons.plus(16)}
            </button>
          </div>
          {newKey.trim() && keyCounts[newKey.trim().toLowerCase()] > 0 && (
            <p className="text-xs text-amber-500 mt-1.5 px-1 flex items-center gap-1">
              Key &ldquo;{newKey.trim()}&rdquo; already exists &mdash; adding will create a duplicate
            </p>
          )}
        </div>
      </div>

      {/* footer actions */}
      {showClearBtn && entries.length > 0 && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={clearAll}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
          >
            Clear all
          </button>
        </div>
      )}

      {/* toast */}
      {toast && (
        <Toast
          message={toast.message}
          action={toast.action}
          onAction={toast.onAction || (() => setToast(null))}
          onDismiss={() => setToast(null)}
          duration={toastDuration}
          closeIcon={icons?.closeIcon}
        />
      )}
    </div>
  );
}
