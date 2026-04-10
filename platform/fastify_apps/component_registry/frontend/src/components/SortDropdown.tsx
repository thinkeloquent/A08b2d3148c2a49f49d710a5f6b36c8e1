import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { SortField, SortOptions, SortOrder } from '@/types';

interface SortDropdownProps {
  sortOptions: SortOptions;
  onSortChange: (options: SortOptions) => void;
}

const sortFields: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'downloads', label: 'Downloads' },
  { field: 'stars', label: 'Stars' },
  { field: 'version', label: 'Version' },
];

export function SortDropdown({ sortOptions, onSortChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFieldChange = (field: SortField) => {
    if (sortOptions.field === field) {
      const newOrder: SortOrder = sortOptions.order === 'asc' ? 'desc' : 'asc';
      onSortChange({ field, order: newOrder });
    } else {
      onSortChange({ field, order: 'desc' });
    }
    setIsOpen(false);
  };

  const currentLabel = sortFields.find((f) => f.field === sortOptions.field)?.label;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <ArrowUpDown className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-600">
          {currentLabel}
        </span>
        {sortOptions.order === 'asc' ? (
          <ArrowUp className="w-3 h-3 text-gray-400" />
        ) : (
          <ArrowDown className="w-3 h-3 text-gray-400" />
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1.5 right-0 w-44 bg-white rounded-lg border border-gray-200 shadow-lg z-50 overflow-hidden">
          <div className="p-1.5">
            {sortFields.map(({ field, label }) => {
              const isActive = sortOptions.field === field;
              return (
                <button
                  key={field}
                  onClick={() => handleFieldChange(field)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{label}</span>
                  {isActive && (
                    <span className="flex items-center gap-1 text-xs text-indigo-500">
                      {sortOptions.order === 'asc' ? (
                        <>
                          <ArrowUp className="w-3 h-3" />
                          Asc
                        </>
                      ) : (
                        <>
                          <ArrowDown className="w-3 h-3" />
                          Desc
                        </>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
