/**
 * TeamListItem Component
 * Display a single team in a list with status, application count, and parent workspace
 */

import type { Team } from '@/types';
import { Badge } from '@/components/ui';
import { Users, Box } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface TeamListItemProps {
  team: Team;
  isSelected?: boolean;
  onClick: () => void;
}

export function TeamListItem({
  team,
  isSelected = false,
  onClick,
}: TeamListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 text-left transition-colors border-b border-gray-200',
        'hover:bg-gray-50 focus:outline-none',
        isSelected && 'bg-primary-50 border-l-4 border-l-primary-500'
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <Users
            className={cn(
              'h-5 w-5',
              isSelected ? 'text-primary-600' : 'text-gray-400'
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Team name */}
          <h3
            className={cn(
              'font-medium truncate',
              isSelected ? 'text-primary-900' : 'text-gray-900'
            )}
          >
            {team.name}
          </h3>

          {/* Parent workspace */}
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {team.workspaceName}
          </p>

          {/* Slug */}
          <p className="text-sm text-gray-500 font-mono truncate mt-1">
            {team.slug}
          </p>

          {/* Status and application count */}
          <div className="mt-3 flex items-center justify-between">
            <Badge status={team.status} size="sm" />

            <div className="flex items-center text-xs text-gray-500">
              <Box className="h-3.5 w-3.5 mr-1" />
              <span>
                {team.applicationCount} {team.applicationCount === 1 ? 'app' : 'apps'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
