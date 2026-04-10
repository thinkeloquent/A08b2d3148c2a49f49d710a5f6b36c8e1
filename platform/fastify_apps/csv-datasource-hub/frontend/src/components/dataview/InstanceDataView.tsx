/**
 * InstanceDataView — Full instance detail view for csv-datasource-hub instances.
 *
 * Uses VulnerabilityHeaderDetails layout with four tabs:
 *   Overview · Data Preview · Upsert · Integrate
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Download, Loader2, Search,
  Copy, Check, X, FileSpreadsheet, Columns3, HardDrive, Activity,
  Upload, CheckCircle2, AlertCircle,
  FileText, Calendar, Clock,
  Eye, EyeOff, Filter,
} from 'lucide-react';
import { VulnerabilityHeaderDetails } from '@internal/vulnerability-header-details';
import { TableCsvDatasource, Pagination } from '@internal/table-csv-datasource';
import { CsvMappingEditor } from '@internal/csv-to-internal-mapping';
import { PaginationCalculator } from '@internal/pagination-calculator';
import type { MappingEntry } from '@internal/csv-to-internal-mapping';
import { createHubApi } from './api';
import type { HubInstance, HubPayload, UpsertResult } from './api';

export interface InstanceDataViewProps {
  /** csv-datasource-hub instance ID */
  instanceId: string;
  /** API base path. Defaults to /~/api/csv-datasource */
  apiBase?: string;
  /** Called when user clicks back. If omitted, back button is hidden. */
  onBack?: () => void;
  /** Page size for data fetching. Default 50. */
  pageSize?: number;
  /** Initial tab to show (from URL). Falls back to 'overview'. */
  initialTab?: string;
  /** Called when the active tab changes, so the parent can update the URL. */
  onTabChange?: (tab: string) => void;
}

type Tab = 'overview' | 'data' | 'findings' | 'history' | 'upsert' | 'integrate';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'data', label: 'Data Preview' },
  { id: 'findings', label: 'Findings' },
  { id: 'history', label: 'History' },
  { id: 'upsert', label: 'Upsert' },
  { id: 'integrate', label: 'Integrate' },
];

/* ── copy button ────────────────────────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

/* ── integrate tab ─────────────────────────────────────────── */

function IntegrateTab({
  instance,
  jsonUrl,
  csvUrl,
  fullJsonUrl,
  fullCsvUrl,
}: {
  instance: HubInstance;
  jsonUrl: string;
  csvUrl: string;
  fullJsonUrl: string;
  fullCsvUrl: string;
}) {
  const [currentOffset, setCurrentOffset] = useState(0);
  const [exportPageSize, setExportPageSize] = useState(1000);
  const totalRows = instance.row_count;
  const exportPage = Math.floor(currentOffset / exportPageSize);

  const paginatedJsonUrl = `${jsonUrl}&offset=${currentOffset}&limit=${exportPageSize}`;
  const paginatedCsvUrl = `${csvUrl}&offset=${currentOffset}&limit=${exportPageSize}`;
  const fullPaginatedJsonUrl = `${window.location.origin}${paginatedJsonUrl}`;
  const fullPaginatedCsvUrl = `${window.location.origin}${paginatedCsvUrl}`;

  return (
    <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
      {/* Pagination Widget — left column, spans both export rows */}
      <div className="row-span-2">
        <PaginationCalculator
          total={totalRows}
          offset={currentOffset}
          pageSize={exportPageSize}
          title="Export Pagination"
          icon={<HardDrive className="w-4 h-4" />}
          onOffsetChange={setCurrentOffset}
          onPageSizeChange={setExportPageSize}
        />
      </div>

      {/* JSON Export — right column, row 1 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-1">JSON Export</h3>
        <p className="text-xs text-slate-400 mb-3">
          Returns payload rows as a JSON array. Response includes <code className="text-xs bg-slate-100 px-1 rounded">total</code>, <code className="text-xs bg-slate-100 px-1 rounded">offset</code>, and <code className="text-xs bg-slate-100 px-1 rounded">limit</code> for pagination.
        </p>
        <div className="flex items-center gap-2 mb-2">
          <code className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-600 font-mono truncate select-all">
            GET {fullPaginatedJsonUrl}
          </code>
          <CopyButton text={fullPaginatedJsonUrl} />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-slate-400">All rows (no pagination):</span>
          <code className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 font-mono truncate select-all">
            GET {fullJsonUrl}
          </code>
          <CopyButton text={fullJsonUrl} />
        </div>
        <a
          href={paginatedJsonUrl}
          download
          className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" /> Download JSON (page {exportPage + 1})
        </a>
      </div>

      {/* CSV Export — right column, row 2 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-1">CSV Export</h3>
        <p className="text-xs text-slate-400 mb-3">
          Returns payload rows as comma-separated values with a header row. Pagination metadata is in response headers (<code className="text-xs bg-slate-100 px-1 rounded">X-Total-Count</code>, <code className="text-xs bg-slate-100 px-1 rounded">X-Offset</code>, <code className="text-xs bg-slate-100 px-1 rounded">X-Limit</code>).
        </p>
        <div className="flex items-center gap-2 mb-2">
          <code className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-600 font-mono truncate select-all">
            GET {fullPaginatedCsvUrl}
          </code>
          <CopyButton text={fullPaginatedCsvUrl} />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-slate-400">All rows (no pagination):</span>
          <code className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 font-mono truncate select-all">
            GET {fullCsvUrl}
          </code>
          <CopyButton text={fullCsvUrl} />
        </div>
        <a
          href={paginatedCsvUrl}
          download
          className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" /> Download CSV (page {exportPage + 1})
        </a>
      </div>
    </div>
  );
}

/* ── csv headers panel ─────────────────────────────────────── */

type CopyFormat = 'comma' | 'json' | 'yaml';

function formatColumns(cols: string[], fmt: CopyFormat): string {
  switch (fmt) {
    case 'comma': return cols.join(', ');
    case 'json': return JSON.stringify(cols, null, 2);
    case 'yaml': return cols.map((c) => `- ${c}`).join('\n');
  }
}

function CsvHeadersPanel({ columns: cols }: { columns: string[] }) {
  const [copiedFmt, setCopiedFmt] = useState<CopyFormat | null>(null);

  const handleCopy = (fmt: CopyFormat) => {
    navigator.clipboard.writeText(formatColumns(cols, fmt)).then(() => {
      setCopiedFmt(fmt);
      setTimeout(() => setCopiedFmt(null), 2000);
    });
  };

  const fmtButtons: { fmt: CopyFormat; label: string }[] = [
    { fmt: 'comma', label: 'Comma' },
    { fmt: 'json', label: 'JSON' },
    { fmt: 'yaml', label: 'YAML' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">CSV Headers</h3>
          <p className="text-xs text-slate-400 mt-0.5">{cols.length} column{cols.length !== 1 ? 's' : ''} detected</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 mr-1">Copy as</span>
          {fmtButtons.map(({ fmt, label }) => (
            <button
              key={fmt}
              onClick={() => handleCopy(fmt)}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
            >
              {copiedFmt === fmt ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {label}
            </button>
          ))}
        </div>
      </div>
      {cols.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No headers available.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {cols.map((col) => (
            <span
              key={col}
              className="inline-block text-xs font-mono bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg"
            >
              {col}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── main component ─────────────────────────────────────────── */

const VALID_TABS = new Set(TABS.map((t) => t.id));

export function InstanceDataView({
  instanceId,
  apiBase,
  onBack,
  pageSize = 50,
  initialTab,
  onTabChange,
}: InstanceDataViewProps) {
  const [instance, setInstance] = useState<HubInstance | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [payloads, setPayloads] = useState<HubPayload[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const resolvedInitial: Tab = (initialTab && VALID_TABS.has(initialTab) ? initialTab : 'overview') as Tab;
  const [activeTab, setActiveTabRaw] = useState<Tab>(resolvedInitial);

  const setActiveTab = useCallback((tab: Tab) => {
    setActiveTabRaw(tab);
    onTabChange?.(tab);
  }, [onTabChange]);

  // Sync tab when URL changes via back/forward
  useEffect(() => {
    if (initialTab && VALID_TABS.has(initialTab)) {
      setActiveTabRaw(initialTab as Tab);
    }
  }, [initialTab]);

  // Upsert state
  const [upsertFile, setUpsertFile] = useState<File | null>(null);
  const [upsertPreviewCols, setUpsertPreviewCols] = useState<string[]>([]);
  const [upsertMappings, setUpsertMappings] = useState<MappingEntry[]>([]);
  const [upsertUploading, setUpsertUploading] = useState(false);
  const [upsertResult, setUpsertResult] = useState<UpsertResult | null>(null);
  const [upsertError, setUpsertError] = useState<string | null>(null);

  const api = useMemo(() => createHubApi(apiBase), [apiBase]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inst, colRes, dataRes] = await Promise.all([
        api.getInstance(instanceId),
        api.getColumns(instanceId),
        api.getData(instanceId, offset, pageSize),
      ]);
      setInstance(inst);
      setColumns(colRes.columns);
      setPayloads(dataRes.items);
      setTotal(dataRes.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [api, instanceId, offset, pageSize]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Upsert file handler — parse CSV headers for column selection
  const handleUpsertFileChange = useCallback((file: File | null) => {
    setUpsertFile(file);
    setUpsertResult(null);
    setUpsertError(null);
    setUpsertMappings([]);
    if (!file) { setUpsertPreviewCols([]); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const firstLine = text.split('\n')[0] ?? '';
      const cols = firstLine.split(',').map((c) => c.trim().replace(/^"|"$/g, '')).filter(Boolean);
      setUpsertPreviewCols(cols);
    };
    reader.readAsText(file.slice(0, 4096));
  }, []);

  // Seed initial mappings: auto-map CSV headers that exactly match instance columns
  const columnMappingInitial = useMemo<MappingEntry[]>(
    () => upsertPreviewCols.map((h, i) => ({
      id: i + 1,
      csvHeader: h,
      mapsTo: columns.includes(h) ? h : '',
      locked: false,
    })),
    [upsertPreviewCols, columns],
  );

  // Seed upsertMappings when initial auto-mapped entries are computed
  useEffect(() => {
    if (columnMappingInitial.length > 0) setUpsertMappings(columnMappingInitial);
  }, [columnMappingInitial]);

  // Mapped internal columns are the match keys
  const resetUpsert = useCallback(() => {
    setUpsertFile(null);
    setUpsertPreviewCols([]);
    setUpsertMappings([]);
    setUpsertResult(null);
    setUpsertError(null);
  }, []);

  const matchColumns = useMemo(
    () => upsertMappings.filter((m) => m.mapsTo).map((m) => m.mapsTo),
    [upsertMappings],
  );

  const handleUpsert = useCallback(async () => {
    if (!upsertFile || matchColumns.length === 0) return;
    setUpsertUploading(true);
    setUpsertError(null);
    setUpsertResult(null);
    try {
      // Build csvHeader → internalField mapping
      const columnMapping: Record<string, string> = {};
      for (const m of upsertMappings) {
        if (m.mapsTo) columnMapping[m.csvHeader] = m.mapsTo;
      }
      const result = await api.upsertCsv(instanceId, upsertFile, matchColumns, columnMapping);
      setUpsertResult(result);
      // Refresh data in the background without triggering the full loading spinner
      const [inst, colRes, dataRes] = await Promise.all([
        api.getInstance(instanceId),
        api.getColumns(instanceId),
        api.getData(instanceId, offset, pageSize),
      ]);
      setInstance(inst);
      setColumns(colRes.columns);
      setPayloads(dataRes.items);
      setTotal(dataRes.total);
    } catch (err) {
      setUpsertError(err instanceof Error ? err.message : String(err));
    } finally {
      setUpsertUploading(false);
    }
  }, [api, instanceId, upsertFile, matchColumns, upsertMappings, offset, pageSize]);

  // Client-side fuzzy search filter
  const allRows = useMemo(() => payloads.map((p) => p.data), [payloads]);
  const filteredRows = useMemo(() => {
    if (!searchQuery) return allRows;
    const tokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return allRows;
    return allRows.filter((row) => {
      const haystack = Object.values(row).filter(Boolean).join(' ').toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }, [allRows, searchQuery]);

  const toggleColumn = useCallback((col: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-red-600 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="flex justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-red-600 text-sm">
          Instance not found.
        </div>
      </div>
    );
  }

  const csvUrl = api.getExportUrl(instanceId, 'csv');
  const jsonUrl = api.getExportUrl(instanceId, 'json');
  const fullCsvUrl = `${window.location.origin}${csvUrl}`;
  const fullJsonUrl = `${window.location.origin}${jsonUrl}`;

  return (
    <VulnerabilityHeaderDetails>
      {/* ── Top Bar ── */}
      <VulnerabilityHeaderDetails.TopBar
        onBack={onBack}
        breadcrumbs={[
          { label: 'Datasources', onClick: onBack },
          { label: 'Instance', onClick: onBack },
          { label: instance.label },
        ]}
      />

      <VulnerabilityHeaderDetails.Content>
        {/* ── Page Header ── */}
        <VulnerabilityHeaderDetails.PageHeader
          title={instance.label}
          metadata={[
            { icon: <FileText className="w-3.5 h-3.5" />, text: instance.file_name, mono: true },
            { icon: <Calendar className="w-3.5 h-3.5" />, text: instance.instance_date ?? 'N/A' },
            { icon: <Clock className="w-3.5 h-3.5" />, text: `${instance.row_count.toLocaleString()} rows` },
          ]}
          primaryAction={{
            label: 'Close',
            icon: <Check className="w-4 h-4" />,
            onClick: () => onBack?.(),
          }}
        />

        {/* ── Tab Bar ── */}
        <VulnerabilityHeaderDetails.TabBar
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as Tab)}
          trailing={
            <p className="text-xs text-gray-400">Last updated 2 hours ago</p>
          }
        />

        {/* ─── Overview tab ─── */}
        {activeTab === 'overview' && (
          <>
            <VulnerabilityHeaderDetails.StatCards
              items={[
                { icon: <FileSpreadsheet className="w-5 h-5" />, label: 'Total Rows', value: instance.row_count.toLocaleString(), accent: 'blue' },
                { icon: <Columns3 className="w-5 h-5" />, label: 'Columns', value: String(instance.column_count), accent: 'violet' },
                { icon: <HardDrive className="w-5 h-5" />, label: 'File Size', value: `${(instance.file_size_bytes / 1024).toFixed(1)} KB`, accent: 'emerald' },
                { icon: <Activity className="w-5 h-5" />, label: 'Instance Date', value: instance.instance_date ?? 'N/A', accent: 'amber' },
              ]}
              columns={4}
            />

            {/* CSV Headers */}
            <CsvHeadersPanel columns={columns} />
          </>
        )}

        {/* ─── Findings tab (placeholder) ─── */}
        {activeTab === 'findings' && (
          <div className="bg-white rounded-xl border border-gray-200/80 border-dashed p-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">Findings</h3>
            <p className="text-sm text-gray-400">Detailed findings and issues discovered during the scan.</p>
          </div>
        )}

        {/* ─── History tab (placeholder) ─── */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-gray-200/80 border-dashed p-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">History</h3>
            <p className="text-sm text-gray-400">Previous scan runs and version history for this instance.</p>
          </div>
        )}

        {/* ─── Data Preview tab ─── */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            {/* toolbar: search + column picker */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  placeholder="Fuzzy search across columns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <span className="text-xs text-slate-400">
                  {filteredRows.length} of {allRows.length} rows
                </span>
              )}

              {/* column visibility toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowColumnPicker((v) => !v)}
                  className={[
                    'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                    hiddenColumns.size > 0
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <Filter className="w-3.5 h-3.5" />
                  Columns
                  {hiddenColumns.size > 0 && (
                    <span className="text-[10px] bg-indigo-600 text-white rounded-full px-1.5 py-0.5 leading-none">
                      {columns.length - hiddenColumns.size}/{columns.length}
                    </span>
                  )}
                </button>
                {showColumnPicker && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowColumnPicker(false)} />
                    <div className="absolute right-0 top-full mt-1 z-40 bg-white rounded-xl border border-slate-200 shadow-lg w-64 max-h-80 overflow-y-auto py-2">
                      <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-100 mb-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toggle Columns</span>
                        {hiddenColumns.size > 0 && (
                          <button
                            onClick={() => setHiddenColumns(new Set())}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Show all
                          </button>
                        )}
                      </div>
                      {columns.map((col) => {
                        const isHidden = hiddenColumns.has(col);
                        return (
                          <button
                            key={col}
                            onClick={() => toggleColumn(col)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-50 transition-colors text-left"
                          >
                            {isHidden
                              ? <EyeOff className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              : <Eye className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            }
                            <span className={isHidden ? 'text-slate-400 line-through' : 'text-slate-700'}>
                              {col.replace(/_/g, ' ')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* table */}
            <TableCsvDatasource
              columns={columns}
              rows={filteredRows}
              offset={offset}
              totalRows={total}
              stickyHeader
              maxHeight="600px"
              selectable={false}
              hiddenColumns={hiddenColumns.size > 0 ? hiddenColumns : undefined}
            />
            <Pagination
              offset={offset}
              limit={pageSize}
              total={total}
              onOffsetChange={setOffset}
            />
          </div>
        )}

        {/* ─── Upsert tab ─── */}
        {activeTab === 'upsert' && (
          <div className="space-y-5">
            {/* Upsert form — hidden after successful upsert */}
            {!upsertResult && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Upsert CSV Data</h3>
                  <p className="text-xs text-slate-400">
                    Upload a CSV file to update existing rows or insert new ones.
                    Rows are matched by the key columns you select below.
                  </p>
                </div>

                {/* File input */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">CSV File</label>
                  <label className="flex items-center justify-center gap-2 px-4 py-6 rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(e) => handleUpsertFileChange(e.target.files?.[0] ?? null)}
                    />
                    {upsertFile ? (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                        <span className="font-medium">{upsertFile.name}</span>
                        <span className="text-slate-400">({(upsertFile.size / 1024).toFixed(1)} KB)</span>
                        <button
                          onClick={(e) => { e.preventDefault(); handleUpsertFileChange(null); }}
                          className="ml-1 p-0.5 rounded text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400">
                        <Upload className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                        Click to select a CSV file
                      </div>
                    )}
                  </label>
                </div>

                {/* Column mapping */}
                {upsertPreviewCols.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Column Mapping <span className="text-slate-300 font-normal">(map uploaded CSV columns to existing instance columns)</span>
                    </label>
                    <CsvMappingEditor
                      csvHeaders={upsertPreviewCols}
                      availableFields={columns}
                      initialMappings={columnMappingInitial}
                      onChange={setUpsertMappings}
                      hideSidebar
                    />
                  </div>
                )}

                {/* Upload button */}
                <button
                  onClick={handleUpsert}
                  disabled={!upsertFile || matchColumns.length === 0 || upsertUploading}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  {upsertUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Upsert Data</>
                  )}
                </button>
              </div>
            )}

            {/* Result card */}
            {upsertResult && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Upsert Complete
                  </div>
                  <button
                    onClick={resetUpsert}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-900 bg-white border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-50 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Another
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white rounded-lg border border-emerald-200 px-3 py-2">
                    <p className="text-lg font-bold text-slate-800">{upsertResult.updated}</p>
                    <p className="text-[11px] text-slate-400 uppercase">Updated</p>
                  </div>
                  <div className="bg-white rounded-lg border border-emerald-200 px-3 py-2">
                    <p className="text-lg font-bold text-slate-800">{upsertResult.inserted}</p>
                    <p className="text-[11px] text-slate-400 uppercase">Inserted</p>
                  </div>
                  <div className="bg-white rounded-lg border border-emerald-200 px-3 py-2">
                    <p className="text-lg font-bold text-slate-800">{upsertResult.newRowCount}</p>
                    <p className="text-[11px] text-slate-400 uppercase">Total Rows</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error card */}
            {upsertError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600 flex-1">{upsertError}</p>
                <button
                  onClick={resetUpsert}
                  className="text-xs font-medium text-red-600 hover:text-red-800 bg-white border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors shrink-0"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── Integrate tab ─── */}
        {activeTab === 'integrate' && (
          <IntegrateTab
            instance={instance}
            jsonUrl={jsonUrl}
            csvUrl={csvUrl}
            fullJsonUrl={fullJsonUrl}
            fullCsvUrl={fullCsvUrl}
          />
        )}
      </VulnerabilityHeaderDetails.Content>
    </VulnerabilityHeaderDetails>
  );
}
