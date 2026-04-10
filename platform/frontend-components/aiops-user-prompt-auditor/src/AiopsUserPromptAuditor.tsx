import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type {
  AiopsUserPromptAuditorProps,
  AuditLogEntry,
  StatusDotProps,
  AvatarProps,
  PillProps,
  MetricCardProps,
  JsonNodeProps,
  FilterOption,
} from './types';

/* ─── helpers ─── */
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function fmtMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

/* ─── Sub-components ─── */

export function StatusDot({ status, className }: StatusDotProps) {
  const colors: Record<string, string> = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-rose-400',
    timeout: 'bg-slate-400',
  };
  const textColors: Record<string, string> = {
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    timeout: '#94a3b8',
  };
  return (
    <span className={['inline-flex items-center gap-1.5', className].filter(Boolean).join(' ')}>
      <span className={`w-2 h-2 rounded-full ${colors[status] || 'bg-slate-300'}`} />
      <span className="capitalize text-xs font-medium" style={{ color: textColors[status] || '#94a3b8' }}>
        {status}
      </span>
    </span>
  );
}

export function Avatar({ initials, size = 'sm', className }: AvatarProps) {
  const dim = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  return (
    <span
      className={[`${dim} rounded-full flex items-center justify-center font-semibold tracking-tight`, className].filter(Boolean).join(' ')}
      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', color: '#fff' }}
    >
      {initials}
    </span>
  );
}

export function Pill({ label, active, onClick, className }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border',
        active
          ? 'border-indigo-300 text-indigo-700'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100',
        className,
      ].filter(Boolean).join(' ')}
      style={active ? { background: 'rgba(99,102,241,0.08)' } : {}}
    >
      {label}
    </button>
  );
}

export function JsonNode({ data, depth = 0, defaultOpen = true, className }: JsonNodeProps) {
  const [open, setOpen] = useState(defaultOpen && depth < 2);

  if (data === null || data === undefined) return <span className="text-slate-400 italic text-xs">null</span>;
  if (typeof data === 'boolean') return <span className="text-amber-600 text-xs font-mono">{String(data)}</span>;
  if (typeof data === 'number') return <span className="text-sky-600 text-xs font-mono">{data}</span>;
  if (typeof data === 'string')
    return (
      <span className="text-emerald-700 text-xs font-mono">
        "{data.length > 80 ? data.slice(0, 80) + '\u2026' : data}"
      </span>
    );

  const isArr = Array.isArray(data);
  const entries: [string | number, unknown][] = isArr
    ? (data as unknown[]).map((v, i) => [i, v])
    : Object.entries(data as Record<string, unknown>);
  const bracket = isArr ? ['[', ']'] : ['{', '}'];

  return (
    <span className={['text-xs font-mono leading-relaxed', className].filter(Boolean).join(' ')}>
      <button
        onClick={() => setOpen(!open)}
        className="text-slate-400 hover:text-indigo-500 transition-colors mr-0.5 focus:outline-none"
        style={{ fontSize: '9px' }}
      >
        {open ? '\u25BC' : '\u25B6'}
      </button>
      <span className="text-slate-500">{bracket[0]}</span>
      {!open && <span className="text-slate-400 mx-1">\u2026{entries.length} items</span>}
      {!open && <span className="text-slate-500">{bracket[1]}</span>}
      {open && (
        <div className="ml-4 border-l border-slate-200 pl-3 mt-0.5">
          {entries.map(([key, val], idx) => (
            <div key={key} className="py-0.5">
              {!isArr && <span className="text-violet-600">{key}</span>}
              {isArr && <span className="text-slate-400">{key}</span>}
              <span className="text-slate-400 mx-1">:</span>
              <JsonNode data={val} depth={depth + 1} />
              {idx < entries.length - 1 && <span className="text-slate-300">,</span>}
            </div>
          ))}
        </div>
      )}
      {open && <span className="text-slate-500">{bracket[1]}</span>}
    </span>
  );
}

export function MetricCard({ label, value, sub, icon, trend, className }: MetricCardProps) {
  return (
    <div
      className={['rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-1 min-w-0', className].filter(Boolean).join(' ')}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
        <span className="text-base">{icon}</span>
      </div>
      <span className="text-2xl font-bold text-slate-800 tracking-tight">{value}</span>
      <div className="flex items-center gap-1.5 mt-0.5">
        {trend != null && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
            }`}
          >
            {trend >= 0 ? '\u2191' : '\u2193'} {Math.abs(trend)}%
          </span>
        )}
        <span className="text-[11px] text-slate-400">{sub}</span>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export function AiopsUserPromptAuditor({
  logs,
  title = 'Prompt Audit',
  badge = 'VIEWER',
  headerIcon,
  syncStatus,
  metrics: metricsProp,
  users: usersProp,
  models: modelsProp,
  statuses = ['all', 'success', 'warning', 'error', 'timeout'],
  pageSize = 12,
  onLogSelect,
  className,
}: AiopsUserPromptAuditorProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const inspectorRef = useRef<HTMLDivElement>(null);

  /* derive filter options from data if not provided */
  const users: FilterOption[] = useMemo(() => {
    if (usersProp) return usersProp;
    const seen = new Map<string, string>();
    for (const l of logs) {
      if (!seen.has(l.user_id)) seen.set(l.user_id, l.user_name);
    }
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [logs, usersProp]);

  const models: FilterOption[] = useMemo(() => {
    if (modelsProp) return modelsProp;
    const unique = [...new Set(logs.map((l) => l.model))];
    return unique.map((m) => ({ value: m, label: m }));
  }, [logs, modelsProp]);

  /* ensure _ts is populated */
  const normalizedLogs = useMemo(
    () => logs.map((l) => ({ ...l, _ts: l._ts ?? new Date(l.created_at).getTime() })),
    [logs],
  );

  /* derived data */
  const filtered = useMemo(() => {
    let result = normalizedLogs;
    if (statusFilter !== 'all') result = result.filter((l) => l.status === statusFilter);
    if (userFilter !== 'all') result = result.filter((l) => l.user_id === userFilter);
    if (modelFilter !== 'all') result = result.filter((l) => l.model === modelFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.prompt.toLowerCase().includes(q) ||
          l.session_id.toLowerCase().includes(q) ||
          l.user_name.toLowerCase().includes(q),
      );
    }
    result = [...result].sort((a, b) => {
      let av: any = (a as any)[sortField];
      let bv: any = (b as any)[sortField];
      if (sortField === 'created_at') { av = a._ts; bv = b._ts; }
      if (sortField === 'tokens_used' || sortField === 'latency_ms') { av = +av; bv = +bv; }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return result;
  }, [normalizedLogs, statusFilter, userFilter, modelFilter, search, sortField, sortDir]);

  const paged = useMemo(() => filtered.slice(page * pageSize, (page + 1) * pageSize), [filtered, page, pageSize]);
  const totalPages = Math.ceil(filtered.length / pageSize);

  useEffect(() => setPage(0), [statusFilter, userFilter, modelFilter, search]);

  /* default metrics computed from data */
  const metrics = useMemo(() => {
    if (metricsProp) return metricsProp;
    const total = normalizedLogs.length;
    if (total === 0) return [];
    const success = normalizedLogs.filter((l) => l.status === 'success').length;
    const avgTokens = Math.round(normalizedLogs.reduce((s, l) => s + l.tokens_used, 0) / total);
    const avgLatency = Math.round(normalizedLogs.reduce((s, l) => s + l.latency_ms, 0) / total);
    const errorRate = (
      (normalizedLogs.filter((l) => l.status === 'error' || l.status === 'timeout').length / total) *
      100
    ).toFixed(1);
    return [
      { label: 'Total Logs', value: total.toLocaleString(), sub: 'total entries', icon: '\uD83D\uDCCB', trend: undefined },
      { label: 'Success Rate', value: `${((success / total) * 100).toFixed(1)}%`, sub: 'of requests', icon: '\u2705', trend: undefined },
      { label: 'Avg Tokens', value: avgTokens.toLocaleString(), sub: 'per request', icon: '\uD83D\uDD24', trend: undefined },
      { label: 'Avg Latency', value: fmtMs(avgLatency), sub: 'p50 response', icon: '\u26A1', trend: undefined },
      { label: 'Error Rate', value: `${errorRate}%`, sub: 'errors + timeouts', icon: '\u26A0\uFE0F', trend: undefined },
    ];
  }, [normalizedLogs, metricsProp]);

  const handleSort = useCallback(
    (field: string) => {
      setSortDir((d) => (sortField === field ? (d === 'asc' ? 'desc' : 'asc') : 'desc'));
      setSortField(field);
    },
    [sortField],
  );

  const handleSelectLog = useCallback(
    (log: AuditLogEntry | null) => {
      setSelectedLog(log);
      onLogSelect?.(log);
    },
    [onLogSelect],
  );

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <span className="text-slate-300 ml-1 text-[10px]">{'\u21C5'}</span>;
    return <span className="ml-1 text-indigo-500 text-[10px]">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>;
  };

  const defaultHeaderIcon = (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M2 8h8M2 12h10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );

  return (
    <div
      className={['min-h-screen w-full', className].filter(Boolean).join(' ')}
      style={{ background: '#f8f9fb', fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}
    >
      {/* ─── Top Bar ─── */}
      <header
        className="w-full border-b border-slate-200 bg-white sticky top-0 z-30"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
      >
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {headerIcon ?? defaultHeaderIcon}
            <span className="font-bold text-slate-800 text-sm tracking-tight">{title}</span>
            {badge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500 tracking-wide">
                {badge}
              </span>
            )}
          </div>
          {syncStatus && (
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400">{syncStatus}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-6 flex flex-col gap-6">
        {/* ─── Metrics Strip ─── */}
        {metrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {metrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>
        )}

        {/* ─── Filters Bar ─── */}
        <div
          className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center gap-3"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div className="relative flex-1 min-w-[200px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompts, sessions, users\u2026"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
            {statuses.map((s) => (
              <Pill
                key={s}
                label={s === 'all' ? 'All' : s}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              />
            ))}
          </div>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
          >
            <option value="all">All Users</option>
            {users.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
          >
            <option value="all">All Models</option>
            {models.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-slate-400 ml-auto">{filtered.length} results</span>
        </div>

        {/* ─── Content Area: Table + Inspector ─── */}
        <div className="flex gap-5 items-start">
          {/* ─── Data Grid ─── */}
          <div
            className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-white overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100" style={{ background: '#fafafb' }}>
                    {[
                      { key: 'status', label: 'Status', w: 'w-20' },
                      { key: 'user_name', label: 'User', w: 'w-36' },
                      { key: 'prompt', label: 'Prompt', w: 'flex-1' },
                      { key: 'model', label: 'Model', w: 'w-44' },
                      { key: 'tokens_used', label: 'Tokens', w: 'w-20' },
                      { key: 'latency_ms', label: 'Latency', w: 'w-20' },
                      { key: 'created_at', label: 'Time', w: 'w-32' },
                    ].map((col) => (
                      <th
                        key={col.key}
                        className={`${col.w} px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors select-none`}
                        style={{ fontSize: '10px' }}
                        onClick={() => handleSort(col.key)}
                      >
                        {col.label}
                        <SortIcon field={col.key} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => handleSelectLog(log)}
                      className={`border-b border-slate-50 cursor-pointer transition-colors ${
                        selectedLog?.id === log.id ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <StatusDot status={log.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar initials={log.user_avatar} />
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-slate-700 truncate">{log.user_name}</span>
                            <span className="text-[10px] text-slate-400">{log.user_role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="text-slate-700 truncate block">{log.prompt}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                          {log.model.split('/').pop()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        {log.tokens_used.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{fmtMs(log.latency_ms)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-slate-600">{fmtDate(log.created_at)}</span>
                          <span className="text-[10px] text-slate-400">{fmtTime(log.created_at)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        No logs match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Showing {page * pageSize + 1}&ndash;{Math.min((page + 1) * pageSize, filtered.length)} of{' '}
                  {filtered.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                  >
                    &larr; Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                          page === p ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {p + 1}
                      </button>
                    );
                  })}
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─── Right Inspector Panel ─── */}
          <div
            ref={inspectorRef}
            className="w-[360px] shrink-0 rounded-xl border border-slate-200 bg-white sticky top-20 overflow-hidden transition-all duration-300"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', maxHeight: 'calc(100vh - 100px)' }}
          >
            {selectedLog ? (
              <div className="flex flex-col h-full overflow-y-auto">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Log Inspector</span>
                  <button
                    onClick={() => handleSelectLog(null)}
                    className="text-slate-400 hover:text-slate-600 text-lg leading-none transition-colors"
                  >
                    &times;
                  </button>
                </div>

                <div className="px-5 py-4 border-b border-slate-50 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={selectedLog.user_avatar} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{selectedLog.user_name}</p>
                      <p className="text-[11px] text-slate-400">
                        {selectedLog.user_role} &middot; {selectedLog.user_id}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ['Status', <StatusDot key="s" status={selectedLog.status} />],
                        [
                          'Model',
                          <span key="m" className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {selectedLog.model}
                          </span>,
                        ],
                        [
                          'Tokens',
                          <span key="t" className="text-xs font-mono text-slate-700">
                            {selectedLog.tokens_used.toLocaleString()}
                          </span>,
                        ],
                        [
                          'Latency',
                          <span key="l" className="text-xs font-mono text-slate-700">
                            {fmtMs(selectedLog.latency_ms)}
                          </span>,
                        ],
                        [
                          'Session',
                          <span key="sid" className="text-[10px] font-mono text-indigo-500">
                            {selectedLog.session_id}
                          </span>,
                        ],
                        [
                          'Time',
                          <span key="d" className="text-[11px] text-slate-600">
                            {fmtDate(selectedLog.created_at)} {fmtTime(selectedLog.created_at)}
                          </span>,
                        ],
                      ] as [string, React.ReactNode][]
                    ).map(([label, val]) => (
                      <div key={label} className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {label}
                        </span>
                        {val}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-4 border-b border-slate-50">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Prompt</p>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
                    {selectedLog.prompt}
                  </p>
                </div>

                {selectedLog.response && (
                  <div className="px-5 py-4 border-b border-slate-50">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Response Preview
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/50 rounded-lg p-3 border border-emerald-100">
                      {selectedLog.response}
                    </p>
                  </div>
                )}

                <div className="px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Raw Input Context
                  </p>
                  <div
                    className="bg-slate-50 rounded-lg p-3 border border-slate-100 overflow-x-auto"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <JsonNode data={selectedLog.raw_input_context} />
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-slate-100 mt-auto">
                  <p className="text-[10px] text-slate-400 font-mono truncate">ID: {selectedLog.id}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-500">No log selected</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click a row to inspect its details, context, and raw payload.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
