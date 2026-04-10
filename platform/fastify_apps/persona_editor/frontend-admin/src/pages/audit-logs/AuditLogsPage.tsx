/**
 * Audit Logs Page
 * Displays recent audit log events with expandable change details
 */

import { useState, Fragment } from 'react';
import { Loader2, History, ChevronRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { ACTION_LABELS, ACTION_COLORS } from '../../types/audit-log';
import type { AuditAction } from '../../types/audit-log';

/** Fields to hide from change details (internal metadata) */
const HIDDEN_FIELDS = new Set(['id', 'createdAt', 'updatedAt', 'last_updated']);

function parseChanges(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value.map(String).join(', ');
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/** Filter out hidden fields and empty values from a record */
function relevantEntries(obj: Record<string, unknown>): [string, unknown][] {
  return Object.entries(obj).filter(
    ([key, val]) => !HIDDEN_FIELDS.has(key) && !isEmptyValue(val),
  );
}

/** Compute changed fields between before and after snapshots */
function computeDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): { field: string; from: unknown; to: unknown }[] {
  const diffs: { field: string; from: unknown; to: unknown }[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of allKeys) {
    if (HIDDEN_FIELDS.has(key)) continue;
    const oldVal = before[key];
    const newVal = after[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diffs.push({ field: key, from: oldVal, to: newVal });
    }
  }
  return diffs;
}

function ChangeDetails({ action, changes }: { action: AuditAction; changes: string }) {
  const parsed = parseChanges(changes);
  if (!parsed) return <p className="text-gray-400 text-xs italic">No change data</p>;

  if (action === 'CREATE') {
    const created = (parsed.created || {}) as Record<string, unknown>;
    const entries = relevantEntries(created);
    if (entries.length === 0) return <p className="text-gray-400 text-xs italic">No fields recorded</p>;
    return (
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {entries.map(([key, val]) => (
          <Fragment key={key}>
            <dt className="text-gray-500 font-medium">{key}</dt>
            <dd className="text-gray-700">{formatValue(val)}</dd>
          </Fragment>
        ))}
      </dl>
    );
  }

  if (action === 'DELETE') {
    const deleted = (parsed.deleted || {}) as Record<string, unknown>;
    const entries = relevantEntries(deleted);
    if (entries.length === 0) return <p className="text-gray-400 text-xs italic">No fields recorded</p>;
    return (
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {entries.map(([key, val]) => (
          <Fragment key={key}>
            <dt className="text-gray-500 font-medium">{key}</dt>
            <dd className="text-gray-700 line-through opacity-60">{formatValue(val)}</dd>
          </Fragment>
        ))}
      </dl>
    );
  }

  if (action === 'UPDATE') {
    const before = (parsed.before || {}) as Record<string, unknown>;
    const after = (parsed.after || {}) as Record<string, unknown>;
    const diffs = computeDiff(before, after);
    if (diffs.length === 0) return <p className="text-gray-400 text-xs italic">No fields changed</p>;
    return (
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-500">
            <th className="text-left font-medium pr-4 pb-1">Field</th>
            <th className="text-left font-medium pr-4 pb-1">Before</th>
            <th className="text-left font-medium pb-1">After</th>
          </tr>
        </thead>
        <tbody>
          {diffs.map(({ field, from, to }) => (
            <tr key={field}>
              <td className="pr-4 py-0.5 text-gray-500 font-medium">{field}</td>
              <td className="pr-4 py-0.5 text-red-600 line-through">{formatValue(from)}</td>
              <td className="py-0.5 text-green-700">{formatValue(to)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return null;
}

export function AuditLogsPage() {
  const { data: auditLogs, isLoading, error } = useAuditLogs(100);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load audit logs: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <History className="w-6 h-6 text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {!auditLogs || auditLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No audit logs yet</p>
            <p className="text-sm mt-1">Events will appear here when personas are created, updated, or deleted.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="w-8 px-2 py-3"></th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Resource</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">User</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditLogs.map((log) => {
                  const isOpen = expanded.has(log.id);
                  return (
                    <Fragment key={log.id}>
                      <tr
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggle(log.id)}
                      >
                        <td className="px-2 py-3 text-gray-400">
                          {isOpen
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${ACTION_COLORS[log.action]}`}>
                            {ACTION_LABELS[log.action]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/personas/${log.persona_id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {log.persona_id}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{log.user_id}</td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={5} className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                            <ChangeDetails action={log.action} changes={log.changes} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
