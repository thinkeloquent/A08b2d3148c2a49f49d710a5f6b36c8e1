/**
 * OrganizationListItem Component
 * Display a single organization in a list with status and workspace count
 */

import type { Organization } from '@/types';
import { Badge } from '@/components/ui';
import { Building, FolderOpen } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface OrganizationListItemProps {
  organization: Organization;
  isSelected?: boolean;
  onClick: () => void;
}

export function OrganizationListItem({
  organization,
  isSelected = false,
  onClick,
}: OrganizationListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 text-left transition-colors border-b border-gray-200',
        'hover:bg-gray-50 focus:outline-none focus:bg-gray-50',
        isSelected && 'bg-primary-50 border-l-4 border-l-primary-500'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            <Building className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{organization.name}</h3>
            <p className="text-sm text-gray-500 truncate">{organization.slug}</p>
            {organization.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {organization.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Badge status={organization.status} size="sm" />
        <div className="flex items-center text-sm text-gray-500">
          <FolderOpen className="h-4 w-4 mr-1" />
          <span>
            {organization.workspaceCount}{' '}
            {organization.workspaceCount === 1 ? 'workspace' : 'workspaces'}
          </span>
        </div>
      </div>
    </button>
  );
}
