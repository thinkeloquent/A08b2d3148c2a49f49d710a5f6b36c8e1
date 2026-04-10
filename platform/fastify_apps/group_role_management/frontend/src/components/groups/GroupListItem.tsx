/**
 * GroupListItem Component
 * Individual group item in the list
 * Based on REQ.v002.md Section 3 (Group Management)
 */

import { Users } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { Group } from '@/types';

interface GroupListItemProps {
  group: Group;
  isSelected: boolean;
  onClick: () => void;
  roleCount?: number; // Number of roles using this group
}

export function GroupListItem({ group, isSelected, onClick, roleCount = 0 }: GroupListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-lg mb-2 transition-all
        ${
          isSelected
            ? 'bg-primary-50 border-2 border-primary-300 shadow-sm'
            : 'hover:bg-gray-50 border-2 border-transparent hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`
          p-2 rounded-lg
          ${isSelected ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}
        `}
        >
          <Users className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
            {group.status === 'archived' && (
              <Badge variant="gray" size="sm">
                Archived
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{group.description}</p>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>{roleCount} role{roleCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
