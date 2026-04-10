/**
 * WorkspaceListItem Component
 * Display a single workspace in a list with status, team count, and parent organization
 */

import type { Workspace } from '@/types';
import { Badge } from '@/components/ui';
import { FolderOpen, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useOrganizations } from '@/hooks/useOrganizations';

export interface WorkspaceListItemProps {
  workspace: Workspace;
  isSelected?: boolean;
  onClick: () => void;
}

export function WorkspaceListItem({
  workspace,
  isSelected = false,
  onClick,
}: WorkspaceListItemProps) {
  // Fetch organizations to display parent org name
  const { data: orgsData } = useOrganizations();
  const parentOrg = orgsData?.data.find((org) => org.id === workspace.organizationId);

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
          <FolderOpen
            className={cn(
              'h-5 w-5',
              isSelected ? 'text-primary-600' : 'text-gray-400'
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Workspace name */}
          <h3
            className={cn(
              'font-medium truncate',
              isSelected ? 'text-primary-900' : 'text-gray-900'
            )}
          >
            {workspace.name}
          </h3>

          {/* Parent organization */}
          {parentOrg && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {parentOrg.name}
            </p>
          )}

          {/* Slug */}
          <p className="text-sm text-gray-500 font-mono truncate mt-1">
            {workspace.slug}
          </p>

          {/* Status and team count */}
          <div className="mt-3 flex items-center justify-between">
            <Badge status={workspace.status} size="sm" />

            <div className="flex items-center text-xs text-gray-500">
              <Users className="h-3.5 w-3.5 mr-1" />
              <span>
                {workspace.teamCount} {workspace.teamCount === 1 ? 'team' : 'teams'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
