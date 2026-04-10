/**
 * CSVUploadWidget — Self-contained CSV upload component.
 *
 * Provides the full lifecycle:
 *   1. Select an existing datasource OR create a new one
 *   2. Pick a CSV file (drag & drop / browse)
 *   3. Preview the first rows
 *   4. Upload with streaming progress (XHR)
 *   5. Return the created instance via onSuccess
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, FileText, Loader2, X, Plus, Database,
  CheckCircle2,
} from 'lucide-react';
import {
  listDatasources,
  createDatasource,
  uploadCsv,
} from './api';
import type {
  CSVUploadWidgetProps,
  Datasource,
  DatasourceCategory,
  UploadProgress,
} from './types';

const DEFAULT_API_BASE = '/~/api/csv-datasource';

const CATEGORIES: DatasourceCategory[] = [
  'infosec', 'vulnerability', 'dependency', 'compliance', 'performance', 'custom',
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* shared input class */
const INPUT =
  'w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 focus:outline-none';

// ── Main Widget ─────────────────────────────────────────────

export function CSVUploadWidget({
  datasourceId: externalDsId,
  apiBase = DEFAULT_API_BASE,
  onSuccess,
  onError,
  labelPlaceholder = 'e.g. March 2026 Scan',
  defaultCategory = 'custom',
}: CSVUploadWidgetProps) {
  // ── Datasource state ──────────────────────────────────────
  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [dsLoading, setDsLoading] = useState(!externalDsId);
  const [selectedDsId, setSelectedDsId] = useState<string | null>(externalDsId ?? null);
  const [showCreateDs, setShowCreateDs] = useState(false);
  const [newDsName, setNewDsName] = useState('');
  const [newDsCategory, setNewDsCategory] = useState<DatasourceCategory>(defaultCategory);
  const [dsCreating, setDsCreating] = useState(false);

  // ── File / upload state ───────────────────────────────────
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState('');
  const [instanceDate, setInstanceDate] = useState('');
  const [preview, setPreview] = useState<string[][]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load datasources (unless externally supplied) ─────────
  useEffect(() => {
    if (externalDsId) return;
    let cancelled = false;
    setDsLoading(true);
    listDatasources(apiBase)
      .then((res) => { if (!cancelled) setDatasources(res.items); })
      .catch(() => { /* swallow — empty list is fine */ })
      .finally(() => { if (!cancelled) setDsLoading(false); });
    return () => { cancelled = true; };
  }, [apiBase, externalDsId]);

  // ── Datasource creation ───────────────────────────────────
  const handleCreateDs = async () => {
    if (!newDsName.trim()) return;
    setDsCreating(true);
    setError(null);
    try {
      const ds = await createDatasource(apiBase, {
        name: newDsName.trim(),
        category: newDsCategory,
      });
      setDatasources((prev) => [ds, ...prev]);
      setSelectedDsId(ds.id);
      setShowCreateDs(false);
      setNewDsName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDsCreating(false);
    }
  };

  // ── File handling ─────────────────────────────────────────
  const parsePreview = (text: string) => {
    return text.split('\n').filter((l) => l.trim()).slice(0, 6)
      .map((l) => l.split(',').map((v) => v.trim()));
  };

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setError(null);
    setDone(false);
    setProgress(null);
    const slice = f.slice(0, 8192);
    const reader = new FileReader();
    reader.onload = () => setPreview(parsePreview(reader.result as string));
    reader.readAsText(slice);
  }, []);

  const clearFile = () => {
    setFile(null);
    setPreview([]);
    setError(null);
    setProgress(null);
    setDone(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && (f.name.endsWith('.csv') || f.type === 'text/csv')) handleFile(f);
  }, [handleFile]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  // ── Upload ────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file || !selectedDsId) return;
    setIsUploading(true);
    setError(null);
    setProgress(null);
    try {
      const result = await uploadCsv(
        apiBase,
        selectedDsId,
        file,
        label || undefined,
        instanceDate || undefined,
        setProgress,
      );
      setDone(true);
      onSuccess(result);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e.message);
      onError?.(e);
    } finally {
      setIsUploading(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────
  const canUpload = !!file && !!selectedDsId && !isUploading && !done;

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="space-y-3">

      {/* ── Step 1 · Datasource selector (unless external) ── */}
      {!externalDsId && (
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Datasource</label>

          {dsLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-1.5">
              <Loader2 size={12} className="animate-spin" /> Loading datasources...
            </div>
          ) : showCreateDs ? (
            /* ── Inline create form ── */
            <div className="border border-slate-200 rounded-md p-2.5 space-y-2 bg-slate-50/60">
              <input
                type="text"
                value={newDsName}
                onChange={(e) => setNewDsName(e.target.value)}
                placeholder="Datasource name"
                autoFocus
                className={INPUT}
              />
              <div className="flex gap-2 items-center">
                <select
                  value={newDsCategory}
                  onChange={(e) => setNewDsCategory(e.target.value as DatasourceCategory)}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-700 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="flex-1" />
                <button
                  onClick={() => setShowCreateDs(false)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >Cancel</button>
                <button
                  onClick={handleCreateDs}
                  disabled={!newDsName.trim() || dsCreating}
                  className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {dsCreating ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                  Create
                </button>
              </div>
            </div>
          ) : (
            /* ── Selector + create button ── */
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Database size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={selectedDsId ?? ''}
                  onChange={(e) => setSelectedDsId(e.target.value || null)}
                  className="w-full bg-white border border-slate-200 rounded-md pl-7 pr-3 py-1.5 text-sm text-slate-700 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 focus:outline-none"
                >
                  <option value="">Select datasource...</option>
                  {datasources.map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      {ds.name} ({ds.category})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowCreateDs(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-md text-xs text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
              >
                <Plus size={12} /> New
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2 · File dropzone ─────────────────────────── */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">CSV File</label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragOver
              ? 'border-indigo-400 bg-indigo-50/50'
              : file
                ? 'border-emerald-300 bg-emerald-50/30'
                : 'border-slate-300 hover:border-indigo-300 bg-slate-50/40'
          }`}
        >
          {file ? (
            <div className="flex items-center justify-center gap-2.5">
              <FileText size={16} className="text-emerald-500 shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-sm text-emerald-700 font-medium truncate">{file.name}</p>
                <p className="text-[11px] text-slate-400">{formatSize(file.size)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="text-slate-400 hover:text-red-500 transition-colors shrink-0 ml-1"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={18} className="mx-auto text-slate-400 mb-1.5" />
              <p className="text-sm text-slate-500">Drop CSV file here or click to browse</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Up to 50 MB</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* ── CSV Preview ─────────────────────────────────────── */}
      {preview.length > 0 && (
        <div className="overflow-x-auto border border-slate-200 rounded-md max-h-32">
          <table className="min-w-full text-[11px]">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                {preview[0]?.map((h, i) => (
                  <th key={i} className="px-2 py-1 text-left font-medium text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {preview.slice(1).map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-2 py-0.5 text-slate-600 whitespace-nowrap">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Metadata fields ─────────────────────────────────── */}
      {file && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Label (optional)</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={labelPlaceholder}
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Instance Date (optional)</label>
            <input
              type="date"
              value={instanceDate}
              onChange={(e) => setInstanceDate(e.target.value)}
              className={INPUT}
            />
          </div>
        </div>
      )}

      {/* ── Progress bar ────────────────────────────────────── */}
      {isUploading && progress && (
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
            <span>Uploading {progress.percent}%</span>
            <span>{formatSize(progress.loaded)} / {formatSize(progress.total)}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Done indicator ──────────────────────────────────── */}
      {done && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md px-2.5 py-1.5">
          <CheckCircle2 size={13} />
          <span className="font-medium">Upload complete</span>
        </div>
      )}

      {/* ── Error message ───────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md px-2.5 py-1.5 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* ── Upload button ───────────────────────────────────── */}
      {file && !done && (
        <button
          onClick={handleUpload}
          disabled={!canUpload}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              {progress ? `Uploading ${progress.percent}%` : 'Preparing...'}
            </>
          ) : (
            <>
              <Upload size={13} />
              Upload &amp; Process
            </>
          )}
        </button>
      )}
    </div>
  );
}
