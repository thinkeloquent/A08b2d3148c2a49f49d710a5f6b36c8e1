/**
 * ActionListItem Component
 * Individual action item in the list
 */

import { Zap } from 'lucide-react';
import type { Action } from '@/types';

interface ActionListItemProps {
  action: Action;
  isSelected: boolean;
  onClick: () => void;
}

export function ActionListItem({ action, isSelected, onClick }: ActionListItemProps) {
  const totalUsage = (action.roleCount || 0) + (action.groupCount || 0);

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
        <div
          className={`
          p-2 rounded-lg
          ${isSelected ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}
        `}
        >
          <Zap className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900">{action.name}</h4>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <span>{totalUsage} usage{totalUsage !== 1 ? 's' : ''}</span>
            {action.description && (
              <>
                <span>•</span>
                <span className="truncate">{action.description}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
