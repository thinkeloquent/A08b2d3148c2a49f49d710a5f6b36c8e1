/**
 * InstanceDataView — Full instance detail view for csv-datasource-hub instances.
 *
 * Self-contained component that fetches instance metadata, columns, and paginated
 * data from the csv-datasource-hub API. Renders header card, stat cards, search,
 * data table with pagination, and export section.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft, Download, ExternalLink, Loader2, Search, Table, Share2,
  Copy, Check, X, FileSpreadsheet, Columns3, HardDrive, Activity,
} from 'lucide-react';
import { TableCsvDatasource, Pagination } from '@internal/table-csv-datasource';
import { createHubApi } from './api';
import type { HubInstance, HubPayload } from './api';

export interface InstanceDataViewProps {
  /** csv-datasource-hub instance ID */
  instanceId: string;
  /** API base path. Defaults to /~/api/csv-datasource */
  apiBase?: string;
  /** Called when user clicks back. If omitted, back button is hidden. */
  onBack?: () => void;
  /** Page size for data fetching. Default 50. */
  pageSize?: number;
  /** Hide the stat cards (Total Rows, Columns, File Size, Status). Default false. */
  hideStatCards?: boolean;
  /** Hide the Export tab. Default false. */
  hideExportTab?: boolean;
  /** URL to link back to the source datasource app. If provided, renders a link in the header. */
  sourceUrl?: string;
}

type Tab = 'data' | 'export';

/* ── stat card ──────────────────────────────────────────────── */

function StatCard({ label, value, icon: Icon }: {
  label: string;
  value: string | number;
  icon: React.FC<{ className?: string }>;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-3">
      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-500 shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-xl font-semibold text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

/* ── status pill ───────────────────────────────────────────── */

const STATUS_STYLE: Record<string, string> = {
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  processing: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-sky-50 text-sky-700 border-sky-200',
};

function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'ready' ? 'bg-emerald-500'
        : status === 'error' ? 'bg-red-500'
        : status === 'processing' ? 'bg-amber-500'
        : 'bg-sky-500'
      }`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

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

/* ── main component ─────────────────────────────────────────── */

export function InstanceDataView({
  instanceId,
  apiBase,
  onBack,
  pageSize = 50,
  hideStatCards = false,
  hideExportTab = false,
  sourceUrl,
}: InstanceDataViewProps) {
  const [instance, setInstance] = useState<HubInstance | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [payloads, setPayloads] = useState<HubPayload[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('data');

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

  // Client-side search filter
  const allRows = useMemo(() => payloads.map((p) => p.data), [payloads]);
  const filteredRows = useMemo(() => {
    if (!searchQuery) return allRows;
    const q = searchQuery.toLowerCase();
    return allRows.filter((row) =>
      Object.values(row).some((v) => v && v.toLowerCase().includes(q)),
    );
  }, [allRows, searchQuery]);

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
    <div className="space-y-6">
      {/* back */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}

      {/* header card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <h1 className="text-xl font-semibold text-slate-800 truncate">{instance.label}</h1>
              <StatusPill status={instance.status} />
            </div>
            <p className="text-sm text-slate-400">
              {instance.file_name} &middot; {instance.row_count.toLocaleString()} rows &middot; {instance.column_count} columns
              {instance.instance_date && <> &middot; {instance.instance_date}</>}
            </p>
          </div>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View in Datasource Hub
            </a>
          )}
        </div>
      </div>

      {/* stat cards */}
      {!hideStatCards && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Rows" value={instance.row_count.toLocaleString()} icon={FileSpreadsheet} />
          <StatCard label="Columns" value={instance.column_count} icon={Columns3} />
          <StatCard label="File Size" value={`${(instance.file_size_bytes / 1024).toFixed(1)} KB`} icon={HardDrive} />
          <StatCard label="Status" value={instance.status.charAt(0).toUpperCase() + instance.status.slice(1)} icon={Activity} />
        </div>
      )}

      {/* tab bar */}
      {hideExportTab ? null : (
        <div className="border-b border-slate-200">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === 'data'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Table className="w-3.5 h-3.5" /> Data
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === 'export'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      )}

      {/* ─── Data tab (full width) ─── */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          {/* search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder="Search all columns..."
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
          </div>

          {/* table */}
          <TableCsvDatasource
            columns={columns}
            rows={filteredRows}
            offset={offset}
            totalRows={total}
            stickyHeader
            maxHeight="600px"
          />
          <Pagination
            offset={offset}
            limit={pageSize}
            total={total}
            onOffsetChange={setOffset}
          />
        </div>
      )}

      {/* ─── Export tab (centered) ─── */}
      {!hideExportTab && activeTab === 'export' && (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* JSON */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">JSON Export</h3>
            <p className="text-xs text-slate-400 mb-3">Returns all payload rows as a JSON array.</p>
            <div className="flex items-center gap-2 mb-3">
              <code className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-600 font-mono truncate select-all">
                GET {fullJsonUrl}
              </code>
              <CopyButton text={fullJsonUrl} />
            </div>
            <a
              href={jsonUrl}
              download
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Download JSON
            </a>
          </div>

          {/* CSV */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">CSV Export</h3>
            <p className="text-xs text-slate-400 mb-3">Returns all payload rows as comma-separated values with a header row.</p>
            <div className="flex items-center gap-2 mb-3">
              <code className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-600 font-mono truncate select-all">
                GET {fullCsvUrl}
              </code>
              <CopyButton text={fullCsvUrl} />
            </div>
            <a
              href={csvUrl}
              download
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Download CSV
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
