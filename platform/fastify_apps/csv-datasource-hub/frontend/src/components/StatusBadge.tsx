import type { DatasourceStatus, InstanceStatus } from '../types';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  archived: 'bg-slate-100 text-slate-600',
  deprecated: 'bg-amber-100 text-amber-800',
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export function StatusBadge({ status }: { status: DatasourceStatus | InstanceStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}
