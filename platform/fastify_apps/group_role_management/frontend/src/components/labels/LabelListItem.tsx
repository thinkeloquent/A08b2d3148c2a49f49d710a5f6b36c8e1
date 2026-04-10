/**
 * LabelListItem Component
 * Individual label item in the list
 * Based on REQ.v002.md Section 4 (Label System)
 */

import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui';
import { getLabelColor } from '@/utils/labelColors';
import type { Label } from '@/types';

interface LabelListItemProps {
  label: Label;
  isSelected: boolean;
  onClick: () => void;
  usageCount?: number; // Number of roles using this label
}

export function LabelListItem({ label, isSelected, onClick, usageCount = 0 }: LabelListItemProps) {
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
          <Tag className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={getLabelColor(label.name)} size="md">
              {label.name}
            </Badge>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{usageCount} role{usageCount !== 1 ? 's' : ''}</span>
            {label.description && (
              <>
                <span>•</span>
                <span className="truncate">{label.description}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
