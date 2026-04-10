/**
 * Badge Component
 */

import type { TaskStatus, StepStatus, WorkflowStatus } from '../../types';

type Status = TaskStatus | StepStatus | WorkflowStatus;

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  DONE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
  BLOCKED: 'bg-yellow-100 text-yellow-800',
  SKIPPED: 'bg-purple-100 text-purple-800',
  RETRYING: 'bg-orange-100 text-orange-800',
  FAILED: 'bg-red-100 text-red-800',
  RUNNING: 'bg-blue-100 text-blue-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

interface BadgeProps {
  status: Status;
}

export function Badge({ status }: BadgeProps) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
