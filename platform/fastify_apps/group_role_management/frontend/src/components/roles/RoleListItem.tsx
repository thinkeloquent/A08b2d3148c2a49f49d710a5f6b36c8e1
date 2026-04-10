/**
 * RoleListItem Component
 * Individual role item in the list
 * Based on REQ.v002.md Section 6.3 (Component States)
 */

import { Badge } from '@/components/ui';
import { RoleIcon } from '@/utils/icons';
import { getLabelColor } from '@/utils/labelColors';
import type { Role } from '@/types';

interface RoleListItemProps {
  role: Role;
  isSelected: boolean;
  onClick: () => void;
}

export function RoleListItem({ role, isSelected, onClick }: RoleListItemProps) {
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
          <RoleIcon icon={role.icon} className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{role.name}</h3>
            {role.status === 'archived' && (
              <Badge variant="gray" size="sm">
                Archived
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-500 line-clamp-1 mt-1">{role.description}</p>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>{role.groups.length} groups</span>
            <span>•</span>
            <span>{role.labels.length} labels</span>
          </div>

          {/* Labels Preview (top 2) */}
          {role.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {role.labels.slice(0, 2).map(label => (
                <Badge key={label} variant={getLabelColor(label)} size="sm">
                  {label}
                </Badge>
              ))}
              {role.labels.length > 2 && (
                <Badge variant="gray" size="sm">
                  +{role.labels.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
