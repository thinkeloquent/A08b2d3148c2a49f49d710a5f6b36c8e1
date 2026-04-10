import type { TaskStatus, StepStatus } from '../types';

export const taskStatusColors: Record<TaskStatus, { bg: string; text: string; border: string }> = {
  PENDING: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  TODO: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  DONE: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  BLOCKED: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  SKIPPED: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  RETRYING: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  FAILED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
};

export const stepStatusColors: Record<StepStatus, { bg: string; text: string; border: string }> = {
  PENDING: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  SKIPPED: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  BLOCKED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
};

export function getTaskStatusClass(status: TaskStatus): string {
  const colors = taskStatusColors[status];
  return `${colors.bg} ${colors.text}`;
}

export function getStepStatusClass(status: StepStatus): string {
  const colors = stepStatusColors[status];
  return `${colors.bg} ${colors.text}`;
}
