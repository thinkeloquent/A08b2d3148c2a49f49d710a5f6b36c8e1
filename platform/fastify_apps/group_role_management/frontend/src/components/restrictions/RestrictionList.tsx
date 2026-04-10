/**
 * RestrictionList Component
 * Left panel showing list of restrictions with search
 */

import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { RestrictionListItem } from './RestrictionListItem';
import { useRestrictions } from '@/hooks/useRestrictions';
import type { Restriction } from '@/types';

interface RestrictionListProps {
  selectedRestriction: Restriction | null;
  onSelectRestriction: (restriction: Restriction) => void;
  onCreateNew: () => void;
}

export function RestrictionList({ selectedRestriction, onSelectRestriction, onCreateNew }: RestrictionListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useRestrictions();

  const restrictions = data || [];

  const filteredRestrictions = restrictions.filter((restriction: Restriction) =>
    restriction.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRestrictions = [...filteredRestrictions].sort((a, b) => {
    const usageA = (a.roleCount || 0) + (a.groupCount || 0);
    const usageB = (b.roleCount || 0) + (b.groupCount || 0);
    return usageB - usageA;
  });

  return (
    <div className="w-80 flex-shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-[calc(100vh-140px)] flex flex-col">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search restrictions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <Button variant="primary" size="md" className="w-full" onClick={onCreateNew}>
            <Plus className="w-4 h-4" />
            Create New Restriction
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-danger-600 text-sm">Error loading restrictions</p>
              <p className="text-gray-500 text-xs mt-1">{error.message}</p>
            </div>
          ) : sortedRestrictions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'No restrictions found' : 'No restrictions yet'}
              </p>
              {!searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={onCreateNew}
                >
                  Create your first restriction
                </Button>
              )}
            </div>
          ) : (
            <div>
              {sortedRestrictions.map(restriction => (
                <RestrictionListItem
                  key={restriction.id}
                  restriction={restriction}
                  isSelected={selectedRestriction?.id === restriction.id}
                  onClick={() => onSelectRestriction(restriction)}
                />
              ))}
            </div>
          )}
        </div>

        {!isLoading && sortedRestrictions.length > 0 && (
          <div className="p-3 border-t border-gray-100 text-xs text-gray-500 text-center">
            {restrictions.length} total restrictions
          </div>
        )}
      </div>
    </div>
  );
}
