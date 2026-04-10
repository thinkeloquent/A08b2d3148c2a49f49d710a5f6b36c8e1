/**
 * CsvTableWidget — Compact embeddable widget for csv-datasource-hub instances.
 *
 * Renders header card, search bar, and data table with pagination.
 * Designed for external embedding (no stat cards, tabs, or export).
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { TableCsvDatasource, Pagination } from '@internal/table-csv-datasource';
import { createHubApi } from './api';
import type { HubInstance, HubPayload } from './api';
import type { CsvTableWidgetProps } from './types';

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

/* ── main component ─────────────────────────────────────────── */

export function CsvTableWidget({
  instanceId,
  apiBase,
  pageSize = 50,
}: CsvTableWidgetProps) {
  const [instance, setInstance] = useState<HubInstance | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [payloads, setPayloads] = useState<HubPayload[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="space-y-4">
      {/* header card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-1.5">
          <h1 className="text-xl font-semibold text-slate-800 truncate">{instance.label}</h1>
          <StatusPill status={instance.status} />
        </div>
        <p className="text-sm text-slate-400">
          {instance.file_name} &middot; {instance.row_count.toLocaleString()} rows &middot; {instance.column_count} columns
          {instance.instance_date && <> &middot; {instance.instance_date}</>}
        </p>
      </div>

      {/* search */}
      <div className="relative max-w-md">
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
  );
}
