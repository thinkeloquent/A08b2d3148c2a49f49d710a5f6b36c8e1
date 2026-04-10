import { memo, useState } from 'react';
import { X } from 'lucide-react';
import { DragHandle } from './DragHandle';
import type { FilterNode } from '@/types';

interface FilterPillProps {
  filter: FilterNode;
  onRemove: () => void;
  onUpdate?: (text: string) => void;
}

function FilterPillComponent({ filter, onRemove, onUpdate }: FilterPillProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(filter.text);

  const handleDoubleClick = () => {
    if (onUpdate) {
      setIsEditing(true);
      setEditText(filter.text);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onUpdate && editText.trim() !== filter.text) {
      onUpdate(editText.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(filter.text);
    }
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          flex items-center gap-3 px-4 py-3
          bg-white rounded-xl border border-slate-200
          shadow-sm hover:shadow-md hover:border-slate-300
          transition-all duration-200 ease-out
          ${isHovered ? 'ring-2 ring-sky-100' : ''}
        `}
      >
        <DragHandle />
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 text-sm text-slate-600 bg-transparent border-none outline-none"
          />
        ) : (
          <span
            className="text-sm text-slate-600 flex-1 cursor-default"
            onDoubleClick={handleDoubleClick}
          >
            {filter.text}
          </span>
        )}
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-full transition-all duration-200"
        >
          <X className="w-4 h-4 text-red-400 hover:text-red-600" />
        </button>
      </div>
    </div>
  );
}

export const FilterPill = memo(FilterPillComponent);
