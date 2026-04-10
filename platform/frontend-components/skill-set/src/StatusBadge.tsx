import type { StatusBadgeProps } from './types';

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const isStable = status === 'stable';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        isStable
          ? 'bg-[var(--ok-bg)] text-[var(--ok)]'
          : 'bg-[var(--warn-bg)] text-[var(--warn)]'
      } ${className}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          isStable ? 'bg-[var(--ok)]' : 'bg-[var(--warn)]'
        }`}
      />
      {status}
    </span>
  );
}
