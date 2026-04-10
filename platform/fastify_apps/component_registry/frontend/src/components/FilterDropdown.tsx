import { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { useComponentAuthors } from '@/hooks/useComponents';
import { statusOptions } from '@/data/categories';
import type { ComponentStatus, FilterOptions } from '@/types';

interface FilterDropdownProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function FilterDropdown({ filters, onFiltersChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: authors = [] } = useComponentAuthors();

  const activeFiltersCount =
    (filters.status ? 1 : 0) + (filters.author ? 1 : 0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = (status: ComponentStatus | null) => {
    onFiltersChange({ ...filters, status });
  };

  const handleAuthorChange = (author: string | null) => {
    onFiltersChange({ ...filters, author });
  };

  const clearFilters = () => {
    onFiltersChange({ status: null, author: null });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2.5 bg-white border rounded-lg hover:bg-gray-50 transition-colors ${
          activeFiltersCount > 0 ? 'border-indigo-300' : 'border-gray-200'
        }`}
      >
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-600">Filters</span>
        {activeFiltersCount > 0 && (
          <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">
            {activeFiltersCount}
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1.5 right-0 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-800">Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="p-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Status
              </label>
              <div className="flex flex-wrap gap-1.5">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      handleStatusChange(filters.status === status ? null : status as ComponentStatus)
                    }
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      filters.status === status
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Author
              </label>
              <select
                value={filters.author || ''}
                onChange={(e) => handleAuthorChange(e.target.value || null)}
                className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-50 outline-none"
              >
                <option value="">All Authors</option>
                {authors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
