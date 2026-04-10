/**
 * LabelList Component
 * Left panel showing list of labels with search
 * Based on REQ.v002.md Section 4 (Label System)
 */

import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { LabelListItem } from './LabelListItem';
import { useLabels } from '@/hooks/useLabels';
import { useRoles } from '@/hooks/useRoles';
import type { Label } from '@/types';

interface LabelListProps {
  selectedLabel: Label | null;
  onSelectLabel: (label: Label) => void;
  onCreateNew: () => void;
}

export function LabelList({ selectedLabel, onSelectLabel, onCreateNew }: LabelListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch labels
  const { data, isLoading, error } = useLabels();

  // Fetch all roles to calculate label usage
  const { data: rolesData } = useRoles();
  const allRoles = rolesData?.data || [];

  const labels = data || [];

  // Filter labels by search
  const filteredLabels = labels.filter((label: Label) =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate usage count for each label
  const getLabelUsageCount = (labelName: string) => {
    return allRoles.filter(role => role.labels.includes(labelName)).length;
  };

  // Sort by usage count (most used first)
  const sortedLabels = [...filteredLabels].sort((a, b) => {
    const usageA = getLabelUsageCount(a.name);
    const usageB = getLabelUsageCount(b.name);
    return usageB - usageA;
  });

  return (
    <div className="w-80 flex-shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-[calc(100vh-140px)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search labels..."
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

          {/* Create Button */}
          <Button variant="primary" size="md" className="w-full" onClick={onCreateNew}>
            <Plus className="w-4 h-4" />
            Create New Label
          </Button>
        </div>

        {/* Label List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-danger-600 text-sm">Error loading labels</p>
              <p className="text-gray-500 text-xs mt-1">{error.message}</p>
            </div>
          ) : sortedLabels.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'No labels found' : 'No labels yet'}
              </p>
              {!searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={onCreateNew}
                >
                  Create your first label
                </Button>
              )}
            </div>
          ) : (
            <div>
              {sortedLabels.map(label => (
                <LabelListItem
                  key={label.name}
                  label={label}
                  isSelected={selectedLabel?.name === label.name}
                  onClick={() => onSelectLabel(label)}
                  usageCount={getLabelUsageCount(label.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {!isLoading && sortedLabels.length > 0 && (
          <div className="p-3 border-t border-gray-100 text-xs text-gray-500 text-center">
            {labels.length} total labels
          </div>
        )}
      </div>
    </div>
  );
}
