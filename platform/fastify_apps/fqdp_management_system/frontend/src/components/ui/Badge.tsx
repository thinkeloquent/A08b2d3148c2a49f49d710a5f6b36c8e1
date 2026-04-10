/**
 * Badge Component
 * Status badges with consistent colors and icons
 * Based on: REQ.v002.jsx Section 7 (UX-006)
 */

import { CheckCircle, Circle, Archive, Clock } from 'lucide-react';
import type { EntityStatus } from '@/types';
import { cn } from '@/utils/cn';

export interface BadgeProps {
  status: EntityStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const STATUS_CONFIG: Record<
  EntityStatus,
  { color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  active: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  inactive: {
    color: 'bg-gray-100 text-gray-800',
    icon: Circle,
  },
  archived: {
    color: 'bg-orange-100 text-orange-800',
    icon: Archive,
  },
  'work-in-progress': {
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
};

const STATUS_LABELS: Record<EntityStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
  'work-in-progress': 'Work in Progress',
};

export function Badge({ status, size = 'md', className }: BadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const label = STATUS_LABELS[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.color,
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-0.5 text-sm': size === 'md',
          'px-3 py-1 text-base': size === 'lg',
        },
        className
      )}
    >
      <Icon
        className={cn('mr-1', {
          'h-3 w-3': size === 'sm',
          'h-3.5 w-3.5': size === 'md',
          'h-4 w-4': size === 'lg',
        })}
      />
      {label}
    </span>
  );
}
