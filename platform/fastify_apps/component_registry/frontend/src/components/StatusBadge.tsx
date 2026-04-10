import type { ComponentStatus } from '@/types';

interface StatusBadgeProps {
  status: ComponentStatus;
}

const statusStyles: Record<ComponentStatus, string> = {
  stable: 'bg-green-50 text-green-700 border-green-200',
  beta: 'bg-amber-50 text-amber-700 border-amber-200',
  alpha: 'bg-orange-50 text-orange-600 border-orange-200',
  deprecated: 'bg-gray-50 text-gray-500 border-gray-200',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium border ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
